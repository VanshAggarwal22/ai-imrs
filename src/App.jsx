import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AiChat from './components/chat/AiChat';
import Dashboard from './components/dashboard/Dashboard';
import OrdersList from './components/dashboard/OrdersList';
import AiSalesPlatform from './components/sales/AiSalesPlatform';
import SalesPipeline from './components/sales/SalesPipeline';
import QuotingEngine from './components/quoting/QuotingEngine';
import MarketingROI from './components/sales/MarketingROI';
import InventoryMRP from './components/inventory/InventoryMRP';
import PurchaseOrders from './components/inventory/PurchaseOrders';
import QualityControl from './components/quality/QualityControl';
import CustomerPortal from './components/portal/CustomerPortal';
import Settings from './components/settings/Settings';

import { ToastProvider } from './context/ToastContext';
import { DataProvider } from './context/DataContext';

function App() {
  useEffect(() => {
    // Login removed for now; app renders without auth gating.
  }, []);

  return (
    <ToastProvider>
      <DataProvider>
        <BrowserRouter>
          <div className="app-layout">
            <Sidebar />
            <div className="main-content">
              <Header />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ai-sales" element={<AiSalesPlatform />} />
                <Route path="/sales" element={<SalesPipeline />} />
                <Route path="/quoting" element={<QuotingEngine />} />
                <Route path="/marketing" element={<MarketingROI />} />
                <Route path="/inventory" element={<InventoryMRP />} />
                <Route path="/purchase-orders" element={<PurchaseOrders />} />
                <Route path="/orders" element={<OrdersList />} />
                <Route path="/quality" element={<QualityControl />} />
                <Route path="/portal" element={<CustomerPortal />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
            <AiChat />
          </div>
        </BrowserRouter>
      </DataProvider>
    </ToastProvider>
  );
}

export default App;
