export const AiService = {
    getProxyHeaders() {
        return {
            'Content-Type': 'application/json'
        };
    },

    async discoverLeads(prompt) {
        const headers = this.getProxyHeaders();

        const systemPrompt = `You are an expert B2B lead generation AI. 
        The user will give you a target profile and potentially a requested number of leads (e.g. "Find 15 automotive manufacturers in Pune").
        You must return a raw JSON array of the requested number of highly realistic companies matching this profile.
        If no specific number is mentioned, return a list of 10 companies.
        If real companies exist that match, use them. If not, generate highly realistic plausible companies.
        DO NOT return any markdown formatting or \`\`\`json blocks. Just the raw JSON array.
        Each object in the array must have the following keys:
        - id: A unique string
        - company: Company name
        - location: City, Country
        - industry: The specific industry
        - size: E.g., '50-200', '1000+'
        - matchScore: An integer between 60 and 99 representing the AI's confidence in match
        - intent: 'High', 'Medium', or 'Low' with a short reason in parenthesis (e.g., 'High (Hiring engineers)')`;

        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: 'meta/llama-3.1-70b-instruct',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch from AI Proxy');
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        try {
            return JSON.parse(content);
        } catch {
            // Strip markdown just in case Llama3 ignored the instruction
            const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        }
    },

    async generateEmail(lead, myCompany = "Aggarwal Industries") {
        const headers = this.getProxyHeaders();

        const prompt = `Write a short, highly-personalized B2B cold email to ${lead.contact !== 'TBD' ? lead.contact : 'The Procurement Manager'} at ${lead.company}.
        They are in the ${lead.industry} industry located in ${lead.location}.
        Their company size is ${lead.size}.
        Context: The AI flagged them as an excellent fit with intent: ${lead.intent}.
        We are ${myCompany}, a premium manufacturer of precision springs and washers. 
        Keep the email under 120 words. Be professional but punchy. Use a catchy subject line. 
        Do not use placeholder brackets like [Your Name] at the end, sign off as "Vansh, Director of Sales".
        Do not use markdown formatting, just plain text suitable for a textarea widget.`;

        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: 'meta/llama-3.1-70b-instruct',
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch from AI Proxy');
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    },

    async gatherIntelligence(companyName) {
        // 1. Search Google via Serper (through server proxy for security)
        const serperRes = await fetch("/api/ai/intel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                q: `${companyName} manufacturing OR expansion OR suppliers OR "supply chain"`,
                num: 5
            })
        });

        if (!serperRes.ok) throw new Error("Serper Search failed");
        const serperData = await serperRes.json();

        // Pass the search snippets to NVIDIA to synthesize into "Intelligence"
        const snippets = (serperData.organic || []).map(r => r.snippet).join(" ");
        const news = (serperData.news || []).map(r => r.title).join(" ");
        const rawContent = `Organic Info: ${snippets} \nNews: ${news}`;

        const headers = this.getProxyHeaders();
        const prompt = `You are a B2B intelligence analyst. I have searched Google for recent info on "${companyName}". 
        Here is the raw scraped text from Google search results: "${rawContent}".
        
        Analyze this and return a JSON object with exactly these keys:
        - "websiteAnalysis": A 2-sentence summary of what they do and if they need components like springs.
        - "newsSignals": A short bullet point indicating any expansion, hiring, or relevant news found (or "No major news recently" if none).
        - "competitorGap": A bold 1-sentence strategic angle on how we can pitch them (e.g., "Pitch reliable OTD as supply chains are strained.").
        Do not include markdown \`\`\`json. Return bare JSON.`;

        const nvidiaRes = await fetch('/api/ai/chat', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: 'meta/llama-3.1-70b-instruct',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 4096
            })
        });

        if (!nvidiaRes.ok) {
            throw new Error('Failed to fetch from AI Proxy');
        }

        const nvidiaData = await nvidiaRes.json();
        const content = nvidiaData.choices[0].message.content.trim();
        
        try {
            return JSON.parse(content);
        } catch {
            const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        }
    }
};
