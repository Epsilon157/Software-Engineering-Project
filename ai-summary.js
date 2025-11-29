export async function onRequestPost({ request, env }) {
    try {
        const { bill_text } = await request.json();
        
        if (!bill_text) {
            return new Response(JSON.stringify({ error: 'Missing bill_text' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const messages = [
            {
                role: 'system',
                content: `You are an expert legislative analyst. Analyze the provided bill text and create a comprehensive overview with these sections:

1. **Executive Summary**: 2-3 sentence overview of the bill's main purpose
2. **Potential Impacts**: Who and what will be affected

Format your response using clear section headers and bullet points. Be objective and factual.`
            },
            {
                role: 'user',
                content: `Please analyze this legislative bill text:

${bill_text.substring(0, 10000)}` // Limit to first 10k characters
            }
        ];

        const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', { messages });
        
        return new Response(JSON.stringify({ 
            summary: response.response
        }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return new Response(JSON.stringify({ 
            error: 'AI service temporarily unavailable. Please try again later.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}