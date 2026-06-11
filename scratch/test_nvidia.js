import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const testNvidia = async () => {
    const apiKey = process.env.VITE_NVIDIA_API_KEY;
    console.log('Using API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING');
    
    try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta/llama-3.1-70b-instruct',
                messages: [{ role: 'user', content: 'Say hello' }],
                temperature: 0.7,
                max_tokens: 50
            })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
};

testNvidia();
