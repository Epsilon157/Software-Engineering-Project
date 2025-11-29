export async function onRequestPost({ request, env }) {
    try {
        console.log('AI Summary request received');
        
        const { bill_text } = await request.json();
        
        if (!bill_text) {
            return new Response(JSON.stringify({ error: 'Missing bill_text' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Bill text length:', bill_text.length);

        // Use Cloudflare AI to generate summary
        const messages = [
            {
                role: 'system',
                content: `You are a legislative analyst. Analyze bills and provide:
1. A concise 2-3 sentence summary
2. Potential impacts
Keep it clear and factual. Use bullet points and clear sections.`
            },
            {
                role: 'user',
                content: `Please analyze this legislative bill:\n\n${bill_text.substring(0, 8000)}`
            }
        ];

        console.log('Calling AI model...');
        const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', { messages });
        console.log('AI response received successfully');

        return new Response(JSON.stringify({ 
            success: true,
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
        return new Response(JSON.stringify({ 
            error: 'Failed to generate summary: ' + error.message
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
