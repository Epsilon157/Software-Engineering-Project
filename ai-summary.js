export async function onRequestPost({ request, env }) {
    try {
        const { bill_text } = await request.json();
        
        if (!bill_text) {
            return new Response(JSON.stringify({ error: 'Missing bill_text' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Use Cloudflare AI to generate summary
        const messages = [
            {
                role: 'system',
                content: `You are a legislative analyst. Analyze this bill and provide:
1. A concise summary (2-3 sentences)
2. Key provisions (3-5 bullet points)
3. Potential impacts
4. Main stakeholders affected

Keep it clear and factual.`
            },
            {
                role: 'user',
                content: `Please analyze this legislative bill:\n\n${bill_text.substring(0, 12000)}`
            }
        ];

        const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', { messages });
        
        return new Response(JSON.stringify({ 
            summary: response.response
        }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });

    } catch (error) {
        console.error('AI Summary Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate summary' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestOptions({ request }) {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
