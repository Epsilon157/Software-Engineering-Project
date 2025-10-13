export async function onRequest(context) {
  // Run a SQL query
  const { results } = await context.env.DB.prepare(
    "SELECT people_id FROM legislators WHERE people_id > ?"
  )
    .bind(18)  // Use .bind() to safely inject values
    .all();    // Execute and get all results

  // Return the query result as JSON
  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" }
  });
}

export function onRequest2(context) {
  return new Response("Hello, world!");
}