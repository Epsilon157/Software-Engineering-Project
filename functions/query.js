//This function is used for verifying Firebase tokens that are sent from the client in the measureDisplay script. Used for verifying user identity for bookmarking measures.
//Returns the Firebase UID if the token is valid, otherwise returns null, input is the user token.
//Tokens are used to ensure that only authenticated users can add or remove bookmarks.
async function verifyFirebaseToken(token, env) {

  //This is Google’s public token verifier endpoint
  const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_API_KEY}`;

  const res = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token })
  });

  const data = await res.json();

  if (data.error || !data.users || data.users.length === 0) {
    return null;
  }

  return data.users[0].localId; //Firebase UID
}

//Function for adding a bookmark to the database upon recieveing a POST request from measureDisplay.
//Input is the roll_call_id of the measure to be bookmarked and the Firebase token in the Authorization header.
//Returns a success message upon successful addition to the database.
export async function onRequestPost({ request, env }) {
  //Veryfying the token from the Authorization header to get the user ID
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return new Response("Missing token", { status: 401 });
  }
  
  const token = auth.split(" ")[1];
  const userId = await verifyFirebaseToken(token, env);

  if (!userId) {
    return new Response("Invalid token", { status: 401 });
  }

  //Using the roll_call_id from the request to add the bookmark to the database if it doesn't already exist under that user ID.
  //userID and roll_call_id form a composite primary key in the user_info table so duplicates are not allowed.
  const { roll_call_id } = await request.json();
  await env.DB.prepare(
    `INSERT OR IGNORE INTO user_info (user_id, roll_call_id) VALUES (?, ?)`
  )
    .bind(userId, roll_call_id)
    .run();

  return Response.json({ success: true });
}

//Function for removing a bookmark from the database upon recieveing a DELETE request from measureDisplay.
//Input is the roll_call_id of the measure to be removed and the Firebase token in the Authorization header.
//Returns a success message upon successful removal from the database.
export async function onRequestDelete({ request, env }){
  //Veryfying the token from the Authorization header to get the user ID
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return new Response("Missing token", { status: 401 });
  }

  const token = auth.split(" ")[1];
  const userId = await verifyFirebaseToken(token, env);

  if (!userId) {
    return new Response("Invalid token", { status: 401 });
  }

  //Using the roll_call_id from the request to remove the bookmark from the database for that user ID.
  const { roll_call_id } = await request.json();
  await env.DB.prepare(
    `DELETE FROM user_info WHERE user_id = ? AND roll_call_id = ?`
  )
    .bind(userId, roll_call_id)
    .run();

  return Response.json({ success: true });
}

/*
export async function onRequestOptions({ request, env }) {
  const url = new URL(request.url);
  if (url.searchParams.has("vote_id")) {
    const roll_call_id = url.searchParams.get("vote_id");

    const auth = request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return new Response("Missing token", { status: 401 });
    }

    const token = auth.split(" ")[1];
    const userId = await verifyFirebaseToken(token, env);

    if (!userId) {
      return new Response("Invalid token", { status: 401 });
    }

    const result = await env.DB.prepare(
      `SELECT 1 FROM user_info WHERE user_id = ? AND roll_call_id = ?`
    )
      .bind(userId, roll_call_id)
      .first();

    return Response.json({ bookmarked: !!result });
  }
}*/

//This function handles all GET requests depending on the search parameters present in the URL.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  //If URL has district in it, return info on particular district's vote. 
  //Info includes what districts voted which way and the people associated with each of those districts.
  //Used in the yea/nay section in measurePage.js as well as the map loading section.
  if(url.searchParams.has("district")){
    const id = url.searchParams.get("vote_id"); //Get roll_call_id from URL
    let district = url.searchParams.get("district"); //Get district number from URL
    district = district.replace(/[^0-9]/g, ''); //Remove any non-numeric characters from district string. This is to help prevent SQL injection.

    let districtResult;

    //If and Else: Get district data from table votes_1 and/or votes_2; district data is split between the two because of database size limitations.
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

    //SQL query to retrieve legislator term information for the specified district at the time of the vote.
    const term_query = `SELECT t.party, t.district, t.start_date, t.end_date, t.people_id, l.name, t.chamber
                        FROM terms AS t
                        INNER JOIN legislators AS l
                        ON (t.people_id = l.people_id)
                        WHERE (t.district = ?) AND (t.start_date <= ?) AND (t.end_date >= ?) AND (t.chamber = ?)`;
    const termResult = await env.DB.prepare(term_query)
    .bind(`${Number(district)}`, `${date}`, `${date}`, `${chamber}`)
    .all();

    //Return both district vote result and legislator term information joined in a single JSON response.
    return Response.json({
      districtResult: districtResult.results,
      termResult: termResult.results
    });
  }
  //If URL has vote_id in it (when search param has district), return info on particular measure
  else if(url.searchParams.has("vote_id") && !url.searchParams.has("bookmarks")){
    const id = url.searchParams.get("vote_id");

    const vote_id_query = `SELECT v1.bill_id, v1.desc, v1.date, v1.yea_votes, v1.nay_votes, v1.chamber, m.measure_number, m.measure_type, m.primary_author, l2.name AS primary_author_name, json_group_array(json_object('coauthor_id', c.people_id, 'name', l.name)) AS coauthors 
                          FROM votes_1 AS v1 
                          INNER JOIN measures AS m ON v1.bill_id = m.bill_id 
                          LEFT JOIN coauthors AS c ON v1.bill_id = c.bill_id 
                          LEFT JOIN legislators AS l ON c.people_id = l.people_id 
                          INNER JOIN legislators AS l2 ON m.primary_author = l2.people_id
                          WHERE v1.roll_call_id = ?;`;

    const result = await env.DB.prepare(vote_id_query)
    .bind(id)
    .all();
    return Response.json(result);
  }
  //If search parameter is in the url then activate search query
  else if(url.searchParams.has("search")){
    const searchType = url.searchParams.get("search");

    const searchId = url.searchParams.get("searchID");
    const searchAuthor = url.searchParams.get("searchAuthor");

    let search_query;
    //SQL query for when the user searches by measure name(such as HB1002) - returns data necessary for measure page
    if(searchId){
      search_query = `SELECT v1.roll_call_id, v1.bill_id, v1.desc, v1.date, v1.yea_votes, v1.nay_votes, v1.chamber, m.measure_number, m.measure_type, m.primary_author 
                          FROM votes_1 AS v1 
                          INNER JOIN measures AS m ON v1.bill_id = m.bill_id 
                          WHERE m.measure_number LIKE ?;`;
      const result = await env.DB.prepare(search_query)
      .bind(`%${searchId}%`)
      .all();
      return Response.json(result);
    }
    // SQL query for when the user searches by author name - returns data necessary for measure page
    else if(searchAuthor){
      search_query = `SELECT v1.roll_call_id, v1.bill_id, v1.desc, v1.date, v1.yea_votes, v1.nay_votes, v1.chamber, m.measure_number, m.measure_type, m.primary_author, l2.name AS primary_author_name 
                          FROM votes_1 AS v1 
                          INNER JOIN measures AS m ON v1.bill_id = m.bill_id 
                          INNER JOIN legislators AS l2 ON m.primary_author = l2.people_id
                          WHERE l2.name LIKE ?;`;
      const result = await env.DB.prepare(search_query)
      .bind(`%${searchAuthor}%`)
      .all();
      return Response.json(result);
    }
    //Default SQL query - gets the roll call ID, date, chamber, and yea and nay votes
    else{
      search_query = `SELECT DISTINCT v1.roll_call_id, v1.date, v1.chamber, v1.yea_votes, v1.nay_votes 
                          FROM votes_1 AS v1 
                          ORDER BY v1.date;`;
      const result = await env.DB.prepare(search_query)
      .bind()
      .all();
      return Response.json(result);
    }
  }
  //If URL has bookmarks in it, return bookmark info for the user associated with the token in the Authorization header.
  else if(url.searchParams.has("bookmarks")){

    const auth = request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return new Response("Missing token", { status: 401 });
    }
    const token = auth.split(" ")[1];
    const userId = await verifyFirebaseToken(token, env);
    if (!userId) {
      return new Response("Invalid token", { status: 401 });
    }

    if(url.searchParams.get("vote_id")){
      const roll_call_id = url.searchParams.get("vote_id");
      
      /*
      const auth = request.headers.get("Authorization");
      if (!auth || !auth.startsWith("Bearer ")) {
        return new Response("Missing token", { status: 401 });
      }

      const token = auth.split(" ")[1];
      const userId = await verifyFirebaseToken(token, env);

      if (!userId) {
        return new Response("Invalid token", { status: 401 });
      }*/

      const result = await env.DB.prepare(
        `SELECT 1 FROM user_info WHERE user_id = ? AND roll_call_id = ?`
      )
        .bind(userId, roll_call_id)
        .first();

      return Response.json({ bookmarked: !!result });
    } 
    else{
      /*
      const auth = request.headers.get("Authorization");
      if (!auth || !auth.startsWith("Bearer ")) {
        return new Response("Missing token", { status: 401 });
      }

      const token = auth.split(" ")[1];
      const userId = await verifyFirebaseToken(token, env);
      if (!userId) {
        return new Response("Invalid token", { status: 401 });
      }*/

      const result = await env.DB.prepare(
        `SELECT roll_call_id FROM user_info WHERE user_id = ?`
      )
        .bind(userId)
        .all();

      return Response.json({results: result.results});
    }
  }
}
