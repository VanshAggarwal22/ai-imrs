import { useState } from 'react';
import { AiService } from '../../../services/AiService';

export function useIntelligence(showToast, allLeads) {
    const [selectedIntelligenceLeadId, setSelectedIntelligenceLeadId] = useState('');
    const [isGatheringIntel, setIsGatheringIntel] = useState(false);
    const [intelData, setIntelData] = useState(null);

    const handleGatherIntelligence = async () => {
        if (!selectedIntelligenceLeadId) {
            showToast('Please select a lead to analyze.');
            return;
        }
        const lead = allLeads.find(l => l.id === selectedIntelligenceLeadId);
        setIsGatheringIntel(true);
        setIntelData(null);
        showToast(`Scraping Google & News for ${lead.company}...`);

        try {
            const data = await AiService.gatherIntelligence(lead.company);
            setIntelData(data);
            showToast('✅ Intelligence compiled successfully.');
        } catch(e) {
            console.error("Intel Error:", e);
            showToast('Failed to compile intelligence.');
        } finally {
            setIsGatheringIntel(false);
        }
    };

    return {
        selectedIntelligenceLeadId,
        setSelectedIntelligenceLeadId,
        isGatheringIntel,
        intelData,
        handleGatherIntelligence
    };
}
