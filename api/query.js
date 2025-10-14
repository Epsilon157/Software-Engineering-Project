export async function onRequestGet({ env }) {
  const result = await env.DB.prepare("SELECT * FROM legislators").all();
  return Response.json(result);
}