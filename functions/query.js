export async function onRequestGet({ request, env }) {

const url = new URL(request.url);

  if(url.searchParams.has("district")){
    const id = url.searchParams.get("vote_id");
    let district = url.searchParams.get("district");
    district = district.replace(/[^0-9]/g, '');

    let districtResult;

    if(Number(district) < 49){
      const district_query = `SELECT v1.District_${district} as district_result, v1.date, v1.chamber
                              FROM votes_1 AS v1 
                              WHERE v1.roll_call_id = ?`;
      districtResult = await env.DB.prepare(district_query)
      .bind(id)
      .all();
    }
    else{
      const district_query = `SELECT v2.District_${district} as district_result, v1.date, v1.chamber
                              FROM votes_1 AS v1
                              INNER JOIN votes_2 AS v2 ON v1.roll_call_id = v2.roll_call_id
                              WHERE v2.roll_call_id = ?`;
      districtResult = await env.DB.prepare(district_query)
      .bind(id)
      .all();
    }

    const date = districtResult.results[0].date;
    const chamber = districtResult.results[0].chamber;

    const term_query = `SELECT t.party, t.district, t.start_date, t.end_date, t.people_id, l.name, t.chamber
                        FROM terms AS t
                        INNER JOIN legislators AS l
                        ON (t.people_id = l.people_id)
                        WHERE (t.district = ?) AND (t.start_date <= ? <= t.end_date) AND (t.chamber = ?)`;
    const termResult = await env.DB.prepare(term_query)
    .bind(`${Number(district)}`, `${date}`, `House`)
    .all();

    return Response.json(termResult);
  }
  else if(url.searchParams.has("vote_id")){
    const id = url.searchParams.get("vote_id");

    const vote_id_query = `SELECT v1.bill_id, v1.desc, v1.date, v1.yea_votes, v1.nay_votes, v1.chamber, m.measure_number, m.measure_type, m.primary_author, l2.name AS primary_author_name, json_group_array(json_object('coauthor_id', c.people_id, 'name', l.name)) AS coauthors 
                          FROM votes_1 AS v1 
                          INNER JOIN measures AS m ON v1.bill_id = m.bill_id 
                          INNER JOIN coauthors AS c ON v1.bill_id = c.bill_id 
                          INNER JOIN legislators AS l ON c.people_id = l.people_id 
                          INNER JOIN legislators AS l2 ON m.primary_author = l2.people_id
                          WHERE v1.roll_call_id = ?;`;

    const result = await env.DB.prepare(vote_id_query)
    .bind(id)
    .all();
    return Response.json(result);
  }
  //If search parameter in url then activate search query
  //TODO: Allow different parameters to search by. As easy as getting the parameters and updating the query I think
  else if(url.searchParams.has("search")){
    const searchType = url.searchParams.get("search");
    const search_query = "SELECT * FROM votes_1 ORDER BY date LIMIT 30;";

    const result = await env.DB.prepare(search_query)
    .bind()
    .all();
    return Response.json(result);
  }

}