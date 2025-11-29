export async function onRequestPost({ request, env }) {
    console.log('=== AI SERVICE DIAGNOSTIC ===');
    
    try {
        // Test 1: Check if we can receive the request
        console.log('1. Received request');
        const requestBody = await request.text();
        console.log('Request body:', requestBody.substring(0, 200));
        
        let jsonData;
        try {
            jsonData = JSON.parse(requestBody);
            console.log('2. JSON parsed successfully');
        } catch (parseError) {
            console.log('JSON parse error:', parseError.message);
            return new Response(JSON.stringify({ 
                error: 'Invalid JSON', 
                details: parseError.message 
            }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        const { bill_text } = jsonData;
        
        if (!bill_text) {
            console.log('3. Missing bill_text');
            return new Response(JSON.stringify({ error: 'Missing bill_text' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }

        console.log('4. Bill text received, length:', bill_text.length);

        // Test 2: Check if AI binding exists
        console.log('5. Checking AI binding...');
        if (!env.AI) {
            console.log('ERROR: AI binding not found in env');
            return new Response(JSON.stringify({ 
                error: 'AI binding not configured',
                details: 'The AI binding is missing from environment variables'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
            });
        }
        console.log('AI binding found');

        // Test 3: Try to use AI
        console.log('6. Attempting to call AI model...');
        
        const messages = [
            {
                role: 'system',
                content: 'You are a helpful assistant. Respond with "AI is working" if you receive this message.'
            },
            {
                role: 'user',
                content: 'Hello, please respond with "AI is working" to confirm everything is working.'
            }
        ];

        console.log('7. Calling env.AI.run...');
        const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', { messages });
        console.log('8. AI response received:', response);

        return new Response(JSON.stringify({ 
            success: true,
            summary: response.response,
            diagnostic: 'AI service is working correctly'
        }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.log('=== FINAL ERROR ===');
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
        
        return new Response(JSON.stringify({ 
            error: 'AI service failed',
            details: error.message,
            type: error.name,
            diagnostic: 'Failed at AI model execution'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
