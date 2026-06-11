import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';

const NVIDIA_MODEL = 'deepseek-ai/deepseek-r1';

const SYSTEM_PROMPT = `You are an AI assistant for IMRS (Inventory & Manufacturing Resource System) for Aggarwal Industries, a precision springs and washers manufacturer. 
You help with questions about orders, inventory, revenue, quality control, leads, and manufacturing operations. 
Be concise, professional, and helpful. Use bullet points where appropriate.`;

export default function AiChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: '👋 Hi! I\'m your IMRS AI Assistant powered by DeepSeek. Ask me about orders, inventory, revenue, quality, or anything else.\n\nTry: "Show pending orders" or "Inventory status"' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const msgEnd = useRef(null);

    useEffect(() => {
        msgEnd.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages
                .filter(m => m.role !== 'bot' || messages.indexOf(m) !== 0)
                .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }));

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: NVIDIA_MODEL,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...history,
                        { role: 'user', content: userMsg }
                    ],
                    temperature: 0.6,
                    top_p: 0.95,
                    max_tokens: 1024
                })
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not get a response.';
            setMessages(prev => [...prev, { role: 'bot', text: reply }]);
        } catch (err) {
            console.error('AI API error:', err);
            setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Error connecting to AI. Please check your API key or try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-widget">
            {open && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <div className="chat-header-icon"><Sparkles size={16} /></div>
                        <div>
                            <h3>IMRS AI Assistant</h3>
                            <p>● Online</p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.role}`}>{msg.text}</div>
                        ))}
                        {isLoading && <div className="chat-msg bot" style={{ opacity: 0.6 }}>⏳ Thinking...</div>}
                        <div ref={msgEnd} />
                    </div>
                    <div className="chat-input-bar">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about orders, inventory..."
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading}><Send size={16} /></button>
                    </div>
                </div>
            )}
            <button className="chat-toggle" onClick={() => setOpen(!open)}>
                {open ? <X size={22} /> : <MessageSquare size={22} />}
            </button>
        </div>
    );
}
