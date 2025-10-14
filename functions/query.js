export async function onRequestGet({ env }) {
  const result = await env.DB.prepare("SELECT * FROM votes").all();
  return Response.json(result);
}