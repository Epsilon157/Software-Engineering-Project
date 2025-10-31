export async function onRequestGet({ request, env }) {
//TODO: currently only gets voteid, needs more parameters for search functions
//      Need to somehow differentiate between functions (EX: measure display vs search display) (another parameter?)

const url = new URL(request.url);

  if(url.searchParams.has("vote_id")){
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
  else if(url.searchParams.has("search")){
    const search_query = "SELECT * FROM votes_1;";

    const result = await env.DB.prepare(search_query)
    .bind()
    .all();
    return Response.json(result);
  }

}