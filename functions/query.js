export async function onRequestGet({ env }) {
  const result = await env.DB.prepare("SELECT * FROM votes").all();
  return Response.json(result);
}

CREATE TEMP VIEW IF NOT EXISTS toReturn AS 
SELECT primary_author, 