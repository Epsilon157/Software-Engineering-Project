export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("vote_id");

  const sqlQuery = "SELECT L.name, V1.date, V1.yea_votes, V1.nay_votes, V1.chamber, V1.desc FROM votes_1 AS V1 WHERE bill_id = ? INNER JOIN measures AS M ON V1.bill_id = M.bill_id INNER JOIN legislators AS L ON M.primary_author = L.people_id;";

  const result = await env.DB.prepare("SELECT v1.bill_id, v1.desc, v1.date, v1.yea_votes, v1.nay_votes, v1.chamber, m.measure_number FROM votes_1 AS v1 INNER JOIN measures AS m ON v1.bill_id = m.bill_id WHERE v1.roll_call_id = ?;")
  .bind(id)
  .all();
  return Response.json(result);
}


//SELECT name FROM legislators WHERE people_id = ?



/*
CREATE TEMP VIEW IF NOT EXISTS toReturn AS 
SELECT primary_author, date, measure_number, desc, District_001, District_002, District_003, District_004, District_005, District_006, District_007, District_008, District_009, District_010, District_011, District_012, District_013, District_014, District_015, District_016, District_017, District_018, District_019, District_020, District_021, District_022, District_023, District_024, District_025, District_026, District_027, District_028, District_029, District_030, District_031, District_032, District_033, District_034, District_035, District_036, District_037, District_038, District_039, District_040, District_041, District_042, District_043, District_044, District_045, District_046, District_047, District_048, District_049, District_050, District_051, District_052, District_053, District_054, District_055, District_056, District_057, District_058, District_059, District_060, District_061, District_062, District_063, District_064, District_065, District_066, District_067, District_068, District_069, District_070, District_071, District_072, District_073, District_074, District_075, District_076, District_077, District_078, District_079, District_080, District_081, District_082, District_083, District_084, District_085, District_086, District_087, District_088, District_089, District_090, District_091, District_092, District_093, District_094, District_095, District_096, District_097, District_098, District_099, District_100, District_101
FROM measures, votes;
*/
/*
SELECT M.primary_author, V.date, M.measure_number, V.desc
FROM measures
*/
/*
SELECT desc FROM votes
WHERE roll_call_id = voteid;*/

//SELECT M.primary_author, V.date, M.measure_number, V.desc, FROM measures M, votes V