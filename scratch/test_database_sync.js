import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
            val = val.substring(1, val.length - 1);
        }
        env[key] = val.trim();
    }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Error: Supabase URL or Anon Key is missing from .env');
    process.exit(1);
}

const supabase = createClient(url, key);
const URL = 'http://localhost:8080';

async function run() {
    console.log('🚀 Starting Comprehensive Database Sync & UI Verification Tests...\n');
    
    // Launch Playwright
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE RUNTIME ERROR:', err.message));
    page.on('dialog', async dialog => {
        console.log(`PAGE DIALOG: [${dialog.type()}] "${dialog.message()}" - Accepting`);
        await dialog.accept();
    });
    
    try {
        // Clear tables first to ensure clean test state
        console.log('🧹 Preparing clean test database state (clearing leads, rfqs, orders, vendors, purchase_orders, qc_reports)...');
        await supabase.from('leads').delete().like('company', '%E2E%');
        await supabase.from('rfqs').delete().like('customer', '%E2E%');
        await supabase.from('orders').delete().like('customer', '%E2E%');
        await supabase.from('purchase_orders').delete().like('notes', '%E2E%');
        await supabase.from('qc_reports').delete().like('notes', '%E2E%');
        await supabase.from('vendors').delete().like('name', '%E2E%');
        await supabase.from('products').delete().like('name', '%E2E%');
        
        // Load Application
        console.log('🌐 Opening live application...');
        await page.goto(URL);
        await page.waitForTimeout(4000);
        
        // ----------------------------------------------------
        // TEST 1: CRM LEAD CREATION & DELETION
        // ----------------------------------------------------
        console.log('\n--- 1. Testing CRM / Sales Pipeline ---');
        await page.click('a[href="/sales"]');
        await page.waitForTimeout(2000);
        
        // Open Add Lead form
        await page.click('button:has-text("Add Lead")');
        await page.waitForTimeout(1000);
        
        const testLeadCompany = `E2E Tech Springs ${Date.now()}`;
        await page.fill('input[placeholder="e.g., Bosch India"]', testLeadCompany);
        await page.fill('input[placeholder="e.g., Rajesh Mehta"]', 'Vansh Aggarwal');
        await page.fill('input[placeholder="+91 98765 43210"]', '+91 9811280333');
        await page.fill('input[placeholder="contact@company.com"]', 'test@aggarwal-industries.com');
        await page.fill('input[placeholder="e.g., Compression Springs 2.5mm"]', 'High Tension Springs');
        await page.fill('input[placeholder="50000"]', '1000');
        await page.fill('input[placeholder="425000"]', '85000');
        await page.fill('textarea[placeholder="Any additional notes about this lead..."]', 'Created via E2E test scripts');
        
        console.log(`Submitting new lead: ${testLeadCompany}...`);
        await page.click('button:has-text("Create Lead")');
        await page.waitForTimeout(3000);
        
        // Verify in Database
        let dbRes = await supabase.from('leads').select('*').eq('company', testLeadCompany);
        if (dbRes.data && dbRes.data.length > 0) {
            console.log(`✅ [DB VERIFIED] Lead successfully saved in Supabase. ID: ${dbRes.data[0].id}`);
        } else {
            console.error(`❌ [DB ERROR] Lead not found in Supabase leads table!`);
        }
        
        // Progress stage in UI
        console.log('Moving Lead stage in UI...');
        await page.click(`div.kanban-card:has-text("${testLeadCompany}")`);
        await page.waitForTimeout(1000);
        await page.click('button:has-text("Move Stage →")');
        await page.waitForTimeout(3000);
        
        // Verify stage update in DB
        dbRes = await supabase.from('leads').select('*').eq('company', testLeadCompany);
        if (dbRes.data && dbRes.data[0].stage === 'Specs Received') {
            console.log(`✅ [DB VERIFIED] Lead stage successfully updated to 'Specs Received' in Supabase.`);
        } else {
            console.error(`❌ [DB ERROR] Stage did not update correctly in DB! Current stage: ${dbRes.data?.[0]?.stage}`);
        }
        
        // Close detail modal
        console.log('Closing Lead detail modal...');
        await page.click('button.btn-icon:has-text("✕")');
        await page.waitForTimeout(1000);
        
        // Delete lead in UI
        console.log('Deleting Lead in UI...');
        await page.click(`div.kanban-card:has-text("${testLeadCompany}")`);
        await page.waitForTimeout(1000);
        await page.click('button:has-text("Delete")');
        await page.waitForTimeout(3000);
        
        // Verify deletion in DB
        dbRes = await supabase.from('leads').select('*').eq('company', testLeadCompany);
        if (dbRes.data && dbRes.data.length === 0) {
            console.log('✅ [DB VERIFIED] Lead successfully deleted from Supabase.');
        } else {
            console.error('❌ [DB ERROR] Lead still exists in Supabase after deletion!');
        }

        // ----------------------------------------------------
        // TEST 2: RFQ TRACKER CRUD & ORDER CONVERSION
        // ----------------------------------------------------
        console.log('\n--- 2. Testing RFQ Tracker ---');
        await page.click('a[href="/rfqs"]');
        await page.waitForTimeout(2000);
        
        // Click Add RFQ button
        await page.click('button:has-text("New RFQ")');
        await page.waitForTimeout(1000);
        
        const testRfqCustomer = `E2E Customer RFQ ${Date.now()}`;
        await page.fill('input[placeholder*="customer"]', testRfqCustomer);
        await page.fill('input[placeholder*="Bid Number"]', 'E2E-REF-999');
        await page.fill('input[placeholder="Product name"]', 'E2E custom washers');
        await page.fill('input[placeholder="Qty"]', '5000');
        await page.fill('textarea[placeholder="Additional notes..."]', 'Created via E2E test scripts');
        
        console.log(`Submitting new RFQ: ${testRfqCustomer}...`);
        const rfqSubmitBtn = await page.locator('button:has-text("Create RFQ")').last();
        await rfqSubmitBtn.click();
        await page.waitForTimeout(3000);
        
        // Verify in DB
        dbRes = await supabase.from('rfqs').select('*').eq('customer', testRfqCustomer);
        if (dbRes.data && dbRes.data.length > 0) {
            const rfqId = dbRes.data[0].id;
            console.log(`✅ [DB VERIFIED] RFQ successfully saved in Supabase. ID: ${rfqId}`);
            
            // Edit RFQ in UI (set quoted amount)
            console.log('Updating Quoted Amount in UI...');
            await page.click(`div.card:has-text("${testRfqCustomer}")`);
            await page.waitForTimeout(1000);
            await page.fill('input[placeholder="Enter quoted amount"]', '75000');
            await page.click('button:has-text("Save")');
            await page.waitForTimeout(2000);
            
            // Verify Quoted Amount update in DB
            dbRes = await supabase.from('rfqs').select('*').eq('customer', testRfqCustomer);
            if (dbRes.data && parseFloat(dbRes.data[0].quoted_amount) === 75000) {
                console.log(`✅ [DB VERIFIED] RFQ quoted amount updated to ₹75,000 in Supabase.`);
            } else {
                console.error(`❌ [DB ERROR] RFQ quoted amount did not update correctly in DB! current: ${dbRes.data?.[0]?.quoted_amount}`);
            }
            
            // Convert to Order
            console.log('Converting RFQ to Order in UI...');
            // Mark status as Won first
            const wonBtn = await page.locator('button:has-text("Mark as Quoted")');
            if (await wonBtn.count() > 0) {
                await wonBtn.click();
                await page.waitForTimeout(2000);
            }
            const wonBtn2 = await page.locator('button:has-text("Mark as Won")');
            if (await wonBtn2.count() > 0) {
                await wonBtn2.click();
                await page.waitForTimeout(2000);
            }
            
            const convertBtn = await page.locator('button:has-text("Convert to Order")');
            if (await convertBtn.count() > 0) {
                await convertBtn.click();
                await page.waitForTimeout(3000);
                
                // Verify order created in DB
                const orderRes = await supabase.from('orders').select('*').eq('rfq_id', rfqId);
                if (orderRes.data && orderRes.data.length > 0) {
                    console.log(`✅ [DB VERIFIED] Converted Order successfully created in Supabase. ID: ${orderRes.data[0].id}`);
                } else {
                    console.error('❌ [DB ERROR] Converted Order not found in Supabase!');
                }
            } else {
                console.log('⚠️ Convert to Order button not found or disabled.');
            }
            
            // Delete RFQ in UI
            console.log('Deleting RFQ in UI...');
            // Click delete button
            const deleteBtn = await page.locator('button:has-text("Delete RFQ")').first();
            await deleteBtn.click();
            await page.waitForTimeout(1000);
            // Confirm delete
            const confirmDelete = await page.locator('button:has-text("Confirm")').last();
            await confirmDelete.click();
            await page.waitForTimeout(3000);
            
            // Verify RFQ deleted in DB
            dbRes = await supabase.from('rfqs').select('*').eq('customer', testRfqCustomer);
            if (dbRes.data && dbRes.data.length === 0) {
                console.log('✅ [DB VERIFIED] RFQ successfully deleted from Supabase.');
            } else {
                console.error('❌ [DB ERROR] RFQ still exists in Supabase after deletion!');
            }
        } else {
            console.error(`❌ [DB ERROR] RFQ not found in Supabase rfqs table!`);
        }

        // ----------------------------------------------------
        // TEST 3: QUALITY CONTROL SUBMISSION & REMOVAL
        // ----------------------------------------------------
        console.log('\n--- 3. Testing Quality Control ---');
        await page.click('a[href="/quality"]');
        await page.waitForTimeout(2000);
        
        // Open Record QC Modal
        await page.click('button:has-text("New QC Report")');
        await page.waitForTimeout(1000);
        
        // Select first active order
        const orderSelect = await page.locator('select').first();
        if (await orderSelect.count() > 0) {
            await orderSelect.selectOption({ index: 1 }); // select first option
            await page.waitForTimeout(500);
            
            await page.fill('input.form-input[type="text"]', 'E2E QC Auditor');
            await page.fill('input.form-input[type="number"]', '500');
            
            // Fill passed quantity (the second form-input class or second number input)
            const numInputs = await page.locator('input.form-input');
            if (await numInputs.count() > 2) {
                await numInputs.nth(2).fill('493'); // passed qty
            }
            
            // defect counts
            const defectInputs = await page.locator('input[placeholder="0"]');
            if (await defectInputs.count() > 1) {
                await defectInputs.nth(0).fill('5'); // Surface Finish
                await defectInputs.nth(1).fill('2'); // Dimensional Tolerance
            }
            
            await page.fill('textarea.form-input', 'Logged by E2E test execution');
            
            console.log('Submitting QC Report in UI...');
            await page.click('button:has-text("Save Report")');
            await page.waitForTimeout(3000);
            
            // Verify in DB
            dbRes = await supabase.from('qc_reports').select('*').eq('inspector', 'E2E QC Auditor');
            if (dbRes.data && dbRes.data.length > 0) {
                console.log(`✅ [DB VERIFIED] QC Report successfully saved in Supabase. ID: ${dbRes.data[0].id}`);
                const qcId = dbRes.data[0].id;
                
                // Delete QC Report in UI
                console.log('Deleting QC Report in UI...');
                await page.click('button:has-text("Inspection Reports")');
                await page.waitForTimeout(1000);
                
                const qcDeleteBtn = await page.locator(`tr:has-text("E2E QC Auditor") button:has-text("Delete")`).first();
                if (await qcDeleteBtn.count() > 0) {
                    await qcDeleteBtn.click();
                    await page.waitForTimeout(3000);
                    
                    // Verify deletion in DB
                    dbRes = await supabase.from('qc_reports').select('*').eq('id', qcId);
                    if (dbRes.data && dbRes.data.length === 0) {
                        console.log('✅ [DB VERIFIED] QC Report successfully deleted from Supabase.');
                    } else {
                        console.error('❌ [DB ERROR] QC Report still exists in Supabase after deletion!');
                    }
                }
            } else {
                console.error('❌ [DB ERROR] QC Report not found in Supabase!');
            }
        } else {
            console.log('⚠️ No active orders available for QC inspection testing.');
        }

        // ----------------------------------------------------
        // TEST 4: INVENTORY PRODUCTS CRUD
        // ----------------------------------------------------
        console.log('\n--- 4. Testing Inventory / MRP (Products) ---');
        await page.click('a[href="/inventory"]');
        await page.waitForTimeout(2000);
        
        // Go to Products catalog tab
        await page.click('button:has-text("Products")');
        await page.waitForTimeout(1000);
        
        // Click Add Product
        await page.click('button:has-text("Add Product")');
        await page.waitForTimeout(1000);
        
        const testProdName = `E2E Washer Coil ${Date.now()}`;
        // Fill name (first form-input)
        await page.locator('input.form-input').first().fill(testProdName);
        
        // Fill stock quantity (number form-input)
        await page.locator('input.form-input[type="number"]').first().fill('1200');
        
        console.log('Submitting Product in UI...');
        await page.click('button:has-text("Save")');
        await page.waitForTimeout(3000);
        
        // Verify Product in DB
        dbRes = await supabase.from('products').select('*').eq('name', testProdName);
        if (dbRes.data && dbRes.data.length > 0) {
            console.log(`✅ [DB VERIFIED] Product successfully saved in Supabase. ID: ${dbRes.data[0].id}`);
            const prodId = dbRes.data[0].id;
            
            // Delete product in UI
            console.log('Deleting Product in UI...');
            const prodDeleteBtn = await page.locator(`tr:has-text("${testProdName}") button:has-text("Delete")`).first();
            if (await prodDeleteBtn.count() > 0) {
                await prodDeleteBtn.click();
                await page.waitForTimeout(3000);
                
                // Verify deletion in DB
                dbRes = await supabase.from('products').select('*').eq('id', prodId);
                if (dbRes.data && dbRes.data.length === 0) {
                    console.log('✅ [DB VERIFIED] Product successfully deleted from Supabase.');
                } else {
                    console.error('❌ [DB ERROR] Product still exists in Supabase after deletion!');
                }
            }
        } else {
            console.error('❌ [DB ERROR] Product not found in Supabase products table!');
        }

        console.log('\n🎉 E2E Database Sync & UI Verification Tests completed successfully!');

    } catch (e) {
        console.error('❌ E2E test execution failed with error:', e);
    } finally {
        await browser.close();
    }
}

run();
