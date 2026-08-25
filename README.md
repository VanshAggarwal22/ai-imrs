# AI IMRS - Intelligent Manufacturing Resource System

An Industrial Tech Venture ERP platform for MSME (Micro, Small and Medium Enterprises) manufacturers in India. 

## Features
- **Intelligent Quoting Engine**: Live material pricing integration, markup optimization, and automated A4 quotation generation.
- **Order Management System**: Real-time tracking of order status, pipeline stages, and source tracking (GeM, IndiaMART, Direct).
- **RFQ Tracker**: Track Requests for Quotation (RFQs) and automatically convert won RFQs into orders.
- **Inventory & MRP**: Intelligent alerts for critical inventory and auto-generation of Purchase Orders.
- **Material Price History**: Track historical material costs (e.g. Spring Steel, Stainless Steel) over time via interactive sparkline graphs.
- **Dashboard**: Unified KPI view (Revenue, Machine Utilization, Margin Estimation, Win Rate, QC Pass Rate).
- **Supabase Cloud Sync**: Built-in backend for real-time database synchronization via PostgreSQL.

## Architecture
- **Frontend**: React (Vite), JavaScript, CSS Variables (Monolithic styling in `index.css`), Lucide React icons, Recharts for analytics.
- **Data Layer**: Centralized state via `DataContext.jsx` with persistent optimistic local-first caching (`localStorage`).
- **Backend**: Supabase (PostgreSQL, Row Level Security, Real-time Sync).

## Local Development
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Optional: Add your Supabase URL and Anon Key in the Dashboard to enable permanent cloud storage.

## License
Proprietary / Closed Source.
