import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const apiKey = process.env.SERPER_API_KEY;
    
    if (!apiKey) {
        console.error('Serper API Key is MISSING');
        return res.status(500).json({ 
            error: 'Serper API Key not configured',
            tip: 'Please add SERPER_API_KEY to Vercel settings.'
        });
    }

    try {
        const { q, num = 5 } = req.body;
        
        if (!q) {
            return res.status(400).json({ error: 'Missing search query parameter' });
        }

        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey.trim(),
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-Serverless-Function'
            },
            body: JSON.stringify({
                q,
                num
            })
        });

        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error('Serper returned non-JSON:', text);
            return res.status(response.status).json({ 
                error: 'Serper API Error', 
                status: response.status,
                message: text.substring(0, 500)
            });
        }

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (e) {
        console.error("Serper Proxy Exception:", e);
        return res.status(500).json({ 
            error: 'Connection Failed', 
            message: e.message 
        });
    }
}
