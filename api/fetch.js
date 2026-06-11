import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { category } = req.query;

        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        const sheet = doc.sheetsByTitle[category];

        if (!sheet) {
            return res.status(404).json({ success: false, message: `Sheet '${category}' not found` });
        }

        const rows = await sheet.getRows();
        const data = rows.map(row => row.toObject());

        return res.status(200).json({
            success: true,
            category,
            records: data
        });

    } catch (error) {
        console.error('Vercel Fetch Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
