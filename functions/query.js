export async function onRequestGet({ request, env }) {

const url = new URL(request.url);

  if(url.searchParams.has("district")){
    const id = url.searchParams.get("vote_id");
    let district = url.searchParams.get("district");
    district = district.replace(/[^0-9]/g, '');

    const district_query = `SELECT v1.District_${district} as district_result, v1.date
                            FROM votes_1 AS v1 
                            WHERE v1.roll_call_id = ?`;
    const districtResult = await env.DB.prepare(district_query)
    .bind(id)
    .all();

    const date = districtResult.date;

    const term_query = `SELECT party, district, start_date, end_date
                        FROM terms
                        WHERE district = ? AND start_date < ?`;
    const termResult = await env.DB.prepare(term_query)
    .bind(`${Number(district)}`, `${date}`)
    .all();

    //const result = {
    //  party:termResult.party,
    //  district_result:districtResult.district_result
    //};

    return Response.json(termResult);
  }
  else if(url.searchParams.has("vote_id")){
    const id = url.searchParams.get("vote_id");

    const vote_id_query = `SELECT v1.bill_id, v1.desc, v1.date, v1.yea_votes, v1.nay_votes, v1.chamber, m.measure_number, m.measure_type, m.primary_author, json_group_array(json_object('coathor_id', c.people_id, 'name', l.name)) AS coauthors 
                          FROM votes_1 AS v1 
                          INNER JOIN measures AS m ON v1.bill_id = m.bill_id 
                          INNER JOIN coauthors AS c ON v1.bill_id = c.bill_id 
                          INNER JOIN legislators AS l ON c.people_id = l.people_id 
                          WHERE v1.roll_call_id = ?;`;

    const result = await env.DB.prepare(vote_id_query)
    .bind(id)
    .all();
    return Response.json(result);
  }
  //If search parameter in url then activate search query
  //TODO: Allow different parameters to search by. As easy as getting the parameters and updating the query i think
  else if(url.searchParams.has("search")){
    const search_query = "SELECT * FROM votes_1 ORDER BY date LIMIT 30;";

    const result = await env.DB.prepare(search_query)
    .bind()
    .all();
    return Response.json(result);
  }

}