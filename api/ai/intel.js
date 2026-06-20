import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const apiKey = process.env.SERPER_API_KEY;
    const { q, num = 5 } = req.body;
    
    if (!q) {
        return res.status(400).json({ error: 'Missing search query parameter' });
    }

    if (!apiKey) {
        console.warn('Serper API Key missing, returning mock intelligence results');
        // Extract the company name from query (usually the first word or words before "manufacturing")
        const companyName = q.split(' manufacturing')[0] || 'Target Company';
        
        return res.status(200).json({
            organic: [
                { 
                    title: `${companyName} Announces Plant Expansion & Supplier Restructuring`, 
                    snippet: `${companyName} announced a ₹150Cr expansion of their automotive component manufacturing facility. As part of this expansion, they are seeking reliable suppliers for precision spring parts and lock washers to eliminate supply chain downtime.` 
                },
                { 
                    title: `${companyName} Supply Chain Challenges & Quality Control Reports`, 
                    snippet: `Industry intelligence indicates that ${companyName} has faced production delays due to lead time issues from their primary custom spring suppliers. They are looking to qualify secondary suppliers with strong Quality Assurance (QA) certifications.` 
                },
                { 
                    title: `${companyName} Vendor Portal Registration & Procurement Details`, 
                    snippet: `Supplier registration portal for ${companyName} is open. The company standard specifies requirements for precision hardware, Belleville washers, and high-tensile wire springs matching DIN and IS standards.` 
                }
            ],
            news: [
                { title: `${companyName} to increase automotive parts procurement by 20% in fiscal year 2026` },
                { title: `${companyName} opens qualification for new metal component suppliers` }
            ]
        });
    }

    try {
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
