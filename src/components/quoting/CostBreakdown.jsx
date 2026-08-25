import React from 'react';

export default function CostBreakdown({ tab, activeCalc }) {
    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Cost Breakdown</div>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
                {tab !== 'washerSource' ? [
                    { label: 'Weight per piece', value: `${activeCalc.weightPerPc} g` },
                    { label: `Total material weight`, value: `${activeCalc.totalWeightKg} kg` },
                    { label: `Material cost (₹${activeCalc.pricePerKg}/kg)`, value: `₹${parseInt(activeCalc.materialCost).toLocaleString('en-IN')}`, color: '#6366f1' },
                    { label: 'Machine / Tooling cost', value: `₹${parseInt(activeCalc.machineCost).toLocaleString('en-IN')}`, color: '#22d3ee' },
                    { label: 'Surface finish cost', value: `₹${parseInt(activeCalc.finishCost).toLocaleString('en-IN')}`, color: '#a855f7' },
                    { label: 'Overhead (12-15%)', value: `₹${parseInt(activeCalc.overhead).toLocaleString('en-IN')}`, color: '#f59e0b' },
                    { label: 'Margin (18-20%)', value: `₹${parseInt(activeCalc.margin).toLocaleString('en-IN')}`, color: '#10b981' },
                ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: row.color || 'var(--text-primary)' }}>{row.value}</span>
                    </div>
                )) : [
                    { label: `Total material weight`, value: `${activeCalc.totalWeightKg} kg` },
                    { label: `Sourcing cost (₹${activeCalc.pricePerKg}/kg)`, value: `₹${parseInt(activeCalc.totalProcurementCost).toLocaleString('en-IN')}`, color: '#6366f1' },
                    { label: 'Sourcing cost per 1000 pcs', value: `₹${parseInt(activeCalc.procurementCostPer1000).toLocaleString('en-IN')}` },
                    { label: `Margin (${activeCalc.marginPercent}%)`, value: `₹${parseInt(activeCalc.margin).toLocaleString('en-IN')}`, color: '#10b981' },
                ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: row.color || 'var(--text-primary)' }}>{row.value}</span>
                    </div>
                ))}

                <div className="flex items-center justify-between" style={{ paddingTop: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Total Quote</span>
                    <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ₹{parseInt(activeCalc.total).toLocaleString('en-IN')}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unit Price</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-blue-light)' }}>₹{activeCalc.unitPrice} / pc</span>
                </div>
            </div>
        </div>
    );
}
