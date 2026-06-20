import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    let apiKey = process.env.VITE_NVIDIA_API_KEY || process.env.NVIDIA_API_KEY;
    let url = 'https://integrate.api.nvidia.com/v1/chat/completions';
    let isGroq = false;

    // Fallback to Groq if NVIDIA is not configured
    if (!apiKey && (process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY)) {
        apiKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
        url = 'https://api.groq.com/openai/v1/chat/completions';
        isGroq = true;
    }
    
    if (!apiKey) {
        console.error('AI API Key is MISSING (neither NVIDIA nor Groq configured)');
        return res.status(500).json({ 
            error: 'AI API Key not configured',
            tip: 'Please configure VITE_NVIDIA_API_KEY or VITE_GROQ_API_KEY in environment variables.'
        });
    }

    try {
        let requestBody = { ...req.body };
        if (isGroq) {
            // Map models to Groq equivalents
            const requestedModel = requestBody.model || '';
            if (requestedModel.includes('deepseek-r1')) {
                requestBody.model = 'deepseek-r1-distill-llama-70b';
            } else {
                requestBody.model = 'llama-3.3-70b-versatile';
            }
            console.log(`Using Groq fallback with model: ${requestBody.model}`);
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey.trim()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Vercel-Serverless-Function'
            },
            body: JSON.stringify(requestBody)
        });

        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error('AI Service returned non-JSON:', text);
            return res.status(response.status).json({ 
                error: 'AI API Error', 
                status: response.status,
                message: text.substring(0, 500)
            });
        }

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (e) {
        console.error("Proxy Exception:", e);
        return res.status(500).json({ 
            error: 'Connection Failed', 
            message: e.message 
        });
    }
}
