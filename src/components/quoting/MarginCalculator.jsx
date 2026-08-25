import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Bot, Loader2 } from 'lucide-react';

export default function MarginCalculator({ 
    materialCost, 
    machineCost, 
    finishCost, 
    overheadPercent = 15,
    initialTargetMargin = 20,
    onMarginUpdate
}) {
    const [targetMargin, setTargetMargin] = useState(initialTargetMargin);
    const [customPrice, setCustomPrice] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [aiMessage, setAiMessage] = useState('');

    const subtotal = materialCost + machineCost + finishCost;
    const overhead = subtotal * (overheadPercent / 100);
    const totalCost = subtotal + overhead;

    const suggestedPrice = totalCost / (1 - (targetMargin / 100));

    const actualPrice = customPrice !== '' ? parseFloat(customPrice) : suggestedPrice;
    const actualMarginAmount = actualPrice - totalCost;
    const actualMarginPercent = actualPrice > 0 ? (actualMarginAmount / actualPrice) * 100 : 0;

    useEffect(() => {
        if (onMarginUpdate) {
            onMarginUpdate({
                totalCost,
                price: actualPrice,
                marginAmount: actualMarginAmount,
                marginPercent: actualMarginPercent
            });
        }
    }, [totalCost, actualPrice, actualMarginAmount, actualMarginPercent, onMarginUpdate]);

    const handleAIOptimize = () => {
        setIsOptimizing(true);
        setAiMessage('Analyzing market rates and historical data...');
        
        setTimeout(() => {
            setIsOptimizing(false);
            // Simulated AI Logic based on volume/cost
            let recommendedMargin = 20;
            if (totalCost < 5000) {
                recommendedMargin = 35;
                setAiMessage('High margin recommended for low volume custom order.');
            } else if (totalCost < 20000) {
                recommendedMargin = 25;
                setAiMessage('Standard margin recommended for medium volume.');
            } else {
                recommendedMargin = 18;
                setAiMessage('Competitive margin recommended for high volume to ensure win.');
            }
            
            setTargetMargin(recommendedMargin);
            setCustomPrice('');
            
            // Clear message after 5 seconds
            setTimeout(() => setAiMessage(''), 5000);
        }, 1500);
    };

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '20px'
        }}>
            <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <Calculator size={18} className="text-blue-500" /> Margin Calculator
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Cost Breakdown */}
                <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cost Breakdown</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Material</span>
                            <span style={{ fontWeight: 600 }}>₹{materialCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Machine</span>
                            <span style={{ fontWeight: 600 }}>₹{machineCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Finish</span>
                            <span style={{ fontWeight: 600 }}>₹{finishCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                            <span>Overhead ({overheadPercent}%)</span>
                            <span>₹{overhead.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                            <span style={{ fontWeight: 600 }}>Total Cost</span>
                            <span style={{ fontWeight: 700, color: 'var(--accent-red)' }}>₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Margin Controls */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: '0', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Margin Optimization</h4>
                        <button 
                            onClick={handleAIOptimize}
                            disabled={isOptimizing}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: isOptimizing ? 'not-allowed' : 'pointer',
                                opacity: isOptimizing ? 0.8 : 1
                            }}
                        >
                            {isOptimizing ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />}
                            {isOptimizing ? 'Optimizing...' : 'AI Optimize'}
                        </button>
                    </div>

                    {aiMessage && (
                        <div style={{ 
                            background: 'rgba(168, 85, 247, 0.1)', 
                            border: '1px solid rgba(168, 85, 247, 0.3)', 
                            color: '#7e22ce', 
                            padding: '8px', 
                            borderRadius: '4px', 
                            fontSize: '12px', 
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '6px'
                        }}>
                            <Bot size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{aiMessage}</span>
                        </div>
                    )}
                    
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Target Margin (%)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input 
                                type="range" 
                                min="5" 
                                max="60" 
                                value={targetMargin} 
                                onChange={(e) => {
                                    setTargetMargin(Number(e.target.value));
                                    setCustomPrice(''); // Reset custom price when adjusting slider
                                }}
                                style={{ flex: 1 }}
                            />
                            <span style={{ fontWeight: 600, minWidth: '40px', textAlign: 'right' }}>{targetMargin}%</span>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Custom Price Override (₹)</label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="number" 
                                value={customPrice}
                                onChange={(e) => setCustomPrice(e.target.value)}
                                placeholder={`Suggested: ₹${suggestedPrice.toFixed(2)}`}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px 8px 30px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Bar */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                background: 'var(--bg-primary)', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
            }}>
                <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Final Price</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                        ₹{actualPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Actual Margin</div>
                    <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 700, 
                        color: actualMarginPercent >= 15 ? 'var(--accent-green)' : 'var(--accent-orange)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        {actualMarginPercent >= initialTargetMargin ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        {actualMarginPercent.toFixed(1)}% (₹{actualMarginAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </div>
                </div>
            </div>
        </div>
    );
}
