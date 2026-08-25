import { useState } from 'react';
import { AiService } from '../../../services/AiService';
import { EmailService } from '../../../services/EmailService';

export function useOutreach(showToast, allLeads) {
    const [selectedOutreachLeadId, setSelectedOutreachLeadId] = useState('');
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [receiverEmail, setReceiverEmail] = useState('');

    const handleGenerateEmail = async () => {
        if (!selectedOutreachLeadId) {
            showToast('Please select a lead from your CRM first.');
            return;
        }

        const lead = allLeads.find(l => l.id === selectedOutreachLeadId);
        if (!lead) return;

        setIsGeneratingEmail(true);
        setGeneratedEmail('');

        // Auto-fill receiver email from lead
        if (lead.email) {
            setReceiverEmail(lead.email);
        }

        try {
            showToast('Drafting hyper-personalized email...');
            const emailContent = await AiService.generateEmail(lead);
            setGeneratedEmail(emailContent);
            showToast('✅ Hyper-personalized email generated successfully!');
        } catch (error) {
            console.error("Email Gen Error:", error);
            showToast('Failed to generate email.');
        } finally {
            setIsGeneratingEmail(false);
        }
    };

    const handleSendEmail = async () => {
        if (!generatedEmail) return;
        if (!receiverEmail) {
            showToast('Please enter a receiver email address.');
            return;
        }

        try {
            showToast('Sending email via SMTP...');
            const subjectLine = generatedEmail.split('\n')[0].replace('Subject:', '').trim() || 'Introduction';
            const bodyHtml = `<p>${generatedEmail.replace(/\n/g, '<br/>')}</p>`;
            await EmailService.sendEmail(receiverEmail, subjectLine, bodyHtml);
            showToast('✅ Email sent successfully!');
        } catch (error) {
            showToast(error.message || 'Failed to send email. Check SMTP settings.');
        }
    };

    const handleDownloadEmail = () => {
        const element = document.createElement("a");
        const file = new Blob([generatedEmail], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `email_draft_${selectedOutreachLeadId}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        showToast('Draft downloaded.');
    };

    return {
        selectedOutreachLeadId,
        setSelectedOutreachLeadId,
        isGeneratingEmail,
        generatedEmail,
        receiverEmail,
        setReceiverEmail,
        handleGenerateEmail,
        handleSendEmail,
        handleDownloadEmail
    };
}
