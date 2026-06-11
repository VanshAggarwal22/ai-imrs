import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { category, records } = req.body;

        // Initialize auth using Service Account credentials from environment variables
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

        await doc.loadInfo(); // loads document properties and worksheets

        let sheet = doc.sheetsByTitle[category];

        // If sheet doesn't exist, create it with headers
        if (!sheet) {
            const headers = Object.keys(records[0]);
            sheet = await doc.addSheet({ title: category, headerValues: headers });
        }

        // Append rows
        await sheet.addRows(records);

        return res.status(200).json({
            success: true,
            message: `Synced ${records.length} records to ${category}`
        });

    } catch (error) {
        console.error('Vercel Sync Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
