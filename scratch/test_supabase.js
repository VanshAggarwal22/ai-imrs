import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function test() {
    const tables = ['leads', 'inventory', 'vendors', 'products', 'quality_logs', 'app_settings', 'orders', 'purchase_orders'];
    for (const t of tables) {
        try {
            const { data, error } = await supabase.from(t).select('*').limit(1);
            if (error) {
                console.log(`Table '${t}': Error -> ${error.message}`);
            } else {
                console.log(`Table '${t}': OK. Found ${data.length} rows.`);
                if (data.length > 0) {
                    console.log('Sample row:', Object.keys(data[0]));
                }
            }
        } catch (e) {
            console.log(`Table '${t}': Exception -> ${e.message}`);
        }
    }
}

test();
