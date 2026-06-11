import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const apiKey = process.env.VITE_NVIDIA_API_KEY;
    
    if (!apiKey) {
        console.error('NVIDIA API Key is MISSING');
        return res.status(500).json({ 
            error: 'NVIDIA API Key not configured',
            tip: 'Please add VITE_NVIDIA_API_KEY to Vercel settings.'
        });
    }

    try {
        const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey.trim()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Vercel-Serverless-Function'
            },
            body: JSON.stringify(req.body)
        });

        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error('NVIDIA returned non-JSON:', text);
            return res.status(response.status).json({ 
                error: 'NVIDIA API Error', 
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
