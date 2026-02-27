import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileText, TrendingUp, AlertTriangle, Download, ArrowDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('sales');

    const [sales, setSales] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [topSelling, setTopSelling] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const [salesRes, lowStockRes, topRes] = await Promise.all([
                    api.get('/invoices'), // Full invoice history for sales
                    api.get('/dashboard/reports/low-stock'),
                    api.get('/dashboard/reports/top-selling')
                ]);

                setSales(salesRes.data || []);
                setLowStock(lowStockRes.data || []);
                setTopSelling(topRes.data || []);
            } catch (error) {
                console.error('Error fetching reports', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const exportSalesPDF = () => {
        const doc = new jsPDF();
        doc.text('Sales Report', 14, 20);

        const tableColumn = ["Invoice No.", "Date", "Customer", "Total Amount"];
        const tableRows = sales.map(s => [
            s.invoice_number,
            new Date(s.created_at).toLocaleDateString(),
            s.customer?.name || 'Walk-in',
            parseFloat(s.grand_total).toFixed(2)
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
        });

        doc.save('Sales_Report.pdf');
    };

    const exportStockPDF = () => {
        const doc = new jsPDF();
        doc.text('Low Stock Report', 14, 20);

        const tableColumn = ["SKU", "Product", "Brand", "Current Stock", "Min Level"];
        const tableRows = lowStock.map(p => [
            p.sku,
            p.name,
            p.brand || '-',
            p.stock_quantity,
            p.min_stock_level
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
        });

        doc.save('Low_Stock_Report.pdf');
    };

    if (loading) {
        return <div className="p-8 text-center text-dark-muted animate-pulse">Loading reports data...</div>;
    }

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    return (
        <div className="space-y-6 pb-10">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <FileText className="text-brand-500" />
                    Analytics & Reports
                </h1>
                <p className="text-dark-muted mt-1">Export your store's data for accounting and analysis.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-dark-border mb-6">
                <button
                    onClick={() => setActiveTab('sales')}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'sales' ? 'text-brand-500 border-brand-500' : 'text-dark-muted border-transparent hover:text-white'}`}
                >
                    <TrendingUp size={18} /> Sales History
                </button>
                <button
                    onClick={() => setActiveTab('stock')}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'stock' ? 'text-red-500 border-red-500' : 'text-dark-muted border-transparent hover:text-white'}`}
                >
                    <AlertTriangle size={18} /> Low Stock Alerts
                    {lowStock.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{lowStock.length}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('top')}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'top' ? 'text-brand-500 border-brand-500' : 'text-dark-muted border-transparent hover:text-white'}`}
                >
                    <TrendingUp size={18} /> Top Selling Items
                </button>
            </div>

            {/* Tab Content */}
            <div className="card overflow-hidden">

                {/* Sales Tab */}
                {activeTab === 'sales' && (
                    <div>
                        <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-bg/50">
                            <h2 className="font-bold text-white">All Sales</h2>
                            <button onClick={exportSalesPDF} className="btn-secondary flex items-center gap-2 py-1.5 px-3 text-sm">
                                <Download size={16} /> Export PDF
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-dark-bg border-b border-dark-border text-xs uppercase text-dark-muted">
                                    <tr>
                                        <th className="p-4">Invoice No</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-border">
                                    {sales.length === 0 ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-dark-muted">No sales found.</td></tr>
                                    ) : sales.map(s => (
                                        <tr key={s.id} className="hover:bg-white/5">
                                            <td className="p-4 font-medium text-brand-400">{s.invoice_number}</td>
                                            <td className="p-4 text-sm text-slate-300">{new Date(s.created_at).toLocaleString()}</td>
                                            <td className="p-4 text-sm">{s.customer?.name || 'Walk-in'}</td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                    {s.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-white">{formatCurrency(s.grand_total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Low Stock Tab */}
                {activeTab === 'stock' && (
                    <div>
                        <div className="p-4 border-b border-dark-border flex justify-between items-center bg-red-500/5">
                            <h2 className="font-bold text-red-400 flex items-center gap-2"><ArrowDown size={18} /> Products to Restock</h2>
                            <button onClick={exportStockPDF} className="btn-secondary border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-2 py-1.5 px-3 text-sm">
                                <Download size={16} /> Export PDF
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-dark-bg border-b border-dark-border text-xs uppercase text-dark-muted">
                                    <tr>
                                        <th className="p-4">SKU</th>
                                        <th className="p-4">Product Name</th>
                                        <th className="p-4 text-center">Current Stock</th>
                                        <th className="p-4 text-center">Min Level</th>
                                        <th className="p-4 text-center">Deficit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-border relative">
                                    {lowStock.length === 0 ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-emerald-400">All stock levels are optimal!</td></tr>
                                    ) : lowStock.map(p => (
                                        <tr key={p.id} className="hover:bg-red-500/5">
                                            <td className="p-4 font-mono text-sm text-brand-400">{p.sku}</td>
                                            <td className="p-4 font-medium text-white">{p.name} <span className="text-xs text-dark-muted">({p.brand})</span></td>
                                            <td className="p-4 text-center font-bold text-red-500">{p.stock_quantity}</td>
                                            <td className="p-4 text-center text-slate-400">{p.min_stock_level}</td>
                                            <td className="p-4 text-center text-red-400">-{p.min_stock_level - p.stock_quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Top Selling Tab */}
                {activeTab === 'top' && (
                    <div>
                        <div className="p-4 border-b border-dark-border flex items-center bg-dark-bg/50">
                            <h2 className="font-bold text-white">Top 10 Selling Products by Volume</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-dark-bg border-b border-dark-border text-xs uppercase text-dark-muted">
                                    <tr>
                                        <th className="p-4 w-16 text-center">Rank</th>
                                        <th className="p-4">Product</th>
                                        <th className="p-4 text-right">Units Sold</th>
                                        <th className="p-4 text-right">Revenue Generated</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-border relative">
                                    {topSelling.length === 0 ? (
                                        <tr><td colSpan="4" className="p-8 text-center text-dark-muted">No sales data available yet.</td></tr>
                                    ) : topSelling.map((item, idx) => (
                                        <tr key={item.product.id} className="hover:bg-white/5">
                                            <td className="p-4 text-center">
                                                <div className={`mx-auto w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-500 text-black' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-dark-border text-slate-400'}`}>
                                                    {idx + 1}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-white">{item.product.name} <span className="text-xs text-brand-400 ml-2">{item.product.sku}</span></td>
                                            <td className="p-4 text-right font-bold text-emerald-400">{item.totalQty}</td>
                                            <td className="p-4 text-right text-slate-300">{formatCurrency(item.totalRevenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Reports;
