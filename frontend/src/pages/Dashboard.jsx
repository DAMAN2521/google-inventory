import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { IndianRupee, Package, AlertTriangle, FileText, TrendingUp, Calendar, ArrowRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
    <div
        className="card p-6 flex items-start justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
        style={{ animation: `fadeIn 0.5s ease-out ${delay}ms both` }}
    >
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
        <div>
            <p className="text-dark-muted font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon size={24} />
        </div>
    </div>
);

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/dashboard');
                setData(res.data);
            } catch (error) {
                console.error('Error fetching dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-dark-card w-48 rounded"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-dark-card rounded-xl"></div>)}
                </div>
                <div className="h-64 bg-dark-card mt-8 rounded-xl"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                    <p className="text-dark-muted mt-1">Here's what's happening with your store today.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-dark-muted bg-dark-card px-4 py-2 rounded-lg border border-dark-border">
                    <Calendar size={16} className="text-brand-400" />
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Sales"
                    value={formatCurrency(data?.todaysSales)}
                    icon={IndianRupee}
                    colorClass="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    delay={0}
                />
                <StatCard
                    title="Monthly Sales"
                    value={formatCurrency(data?.monthlySales)}
                    icon={TrendingUp}
                    colorClass="bg-brand-500/20 text-brand-400 border border-brand-500/30"
                    delay={100}
                />
                <StatCard
                    title="Total Products"
                    value={data?.totalProducts || 0}
                    icon={Package}
                    colorClass="bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    delay={200}
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={data?.lowStockCount || 0}
                    icon={AlertTriangle}
                    colorClass={data?.lowStockCount > 0 ? "bg-red-500/20 text-red-400 border border-red-500/30 ring-1 ring-red-500 animate-pulse" : "bg-slate-500/20 text-slate-400 border border-slate-500/30"}
                    delay={300}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Invoices Table */}
                <div className="lg:col-span-2 card flex flex-col pt-0">
                    <div className="p-6 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-card/95 backdrop-blur-sm z-10">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <FileText size={20} className="text-brand-400" />
                            Recent Invoices
                        </h2>
                        <Link to="/reports" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 group">
                            View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-dark-bg/50 border-b border-dark-border text-xs uppercase tracking-wider text-dark-muted">
                                    <th className="p-4 font-semibold">Invoice No</th>
                                    <th className="p-4 font-semibold">Customer</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {data?.recentInvoices?.map((invoice, idx) => (
                                    <tr key={invoice.id} className="hover:bg-white/5 transition-colors" style={{ animation: `fadeIn 0.3s ease-out ${idx * 50}ms both` }}>
                                        <td className="p-4 font-medium text-brand-400">{invoice.invoice_number}</td>
                                        <td className="p-4">
                                            {invoice.customer ? (
                                                <div>
                                                    <p className="text-white text-sm">{invoice.customer.name}</p>
                                                    <p className="text-xs text-dark-muted">{invoice.customer.mobile}</p>
                                                </div>
                                            ) : (
                                                <span className="text-dark-muted italic">Walk-in</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-dark-muted">
                                            {new Date(invoice.created_at).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="p-4 text-right font-bold text-white">
                                            {formatCurrency(invoice.grand_total)}
                                        </td>
                                    </tr>
                                ))}
                                {(!data?.recentInvoices || data.recentInvoices.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-dark-muted">No recent invoices found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / Info */}
                <div className="card p-6 flex flex-col">
                    <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
                    <div className="flex flex-col gap-3 flex-1">
                        <Link to="/billing" className="p-4 rounded-xl relative overflow-hidden group bg-gradient-to-br from-brand-600 to-brand-800 border-none flex items-center justify-between">
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="bg-white/20 p-2 rounded-lg text-white">
                                    <ShoppingCart size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold leading-none mb-1">New Sale</h3>
                                    <p className="text-white/70 text-xs">Create a new GST invoice</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-white/50 group-hover:translate-x-1 group-hover:text-white transition-all z-10" />
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                        </Link>

                        <Link to="/products" className="p-4 rounded-xl border border-dark-border bg-dark-bg hover:border-slate-500 transition-colors flex items-center justify-between group mt-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-dark-card text-slate-400 group-hover:text-white transition-colors">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium text-sm">Manage Inventory</h3>
                                    <p className="text-dark-muted text-xs">Add or edit products</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
        </div>
    );
};

export default Dashboard;
