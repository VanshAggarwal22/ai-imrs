import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {

        const { smtpHost, smtpPort, smtpUser, smtpPass, to, subject, html, replyTo, fromName, attachments } = req.body;
        
        if (!smtpHost || !smtpUser || !smtpPass) {
            return res.status(400).json({ error: 'Missing SMTP configuration parameters.'});
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort || 587,
            secure: smtpPort == 465, // true for 465, false for other ports
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        const mailOptions = {
            from: `"${fromName || 'IMRS System'}" <${smtpUser}>`,
            to,
            subject,
            html,
            replyTo: replyTo || smtpUser,
            attachments: attachments || []
        };

        const info = await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, messageId: info.messageId });
    } catch (e) {
        console.error("Email send error:", e);
        return res.status(500).json({ error: e.message || 'Failed to send email' });
    }
}
