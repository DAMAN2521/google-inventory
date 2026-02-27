import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    PackageSearch,
    ShoppingCart,
    FileText,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';

const SidebarNavigation = ({ isOpen, setIsOpen }) => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/billing', label: 'Billing / POS', icon: ShoppingCart },
        { path: '/products', label: 'Products', icon: PackageSearch },
        { path: '/reports', label: 'Reports', icon: FileText },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-dark-card border-r border-dark-border transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-dark-border">
                    <span className="text-xl tracking-tight font-bold text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">🚀</span>
                        Antigravity
                    </span>
                    <button className="md:hidden text-dark-muted hover:text-white" onClick={() => setIsOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-brand-500/10 text-brand-500'
                                        : 'text-dark-muted hover:bg-dark-border hover:text-white'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-brand-500' : 'text-dark-muted group-hover:text-brand-400'} />
                                <span className="font-medium">{item.label}</span>
                                {isActive && (
                                    <div className="absolute left-0 w-1 rounded-r-full h-8 bg-brand-500" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User / Footer */}
                <div className="p-4 border-t border-dark-border bg-dark-bg/30">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center uppercase font-bold text-brand-400 border border-dark-border">
                            {user?.username?.[0] || 'U'}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{user?.username}</p>
                            <p className="text-xs text-brand-400 capitalize">{user?.role}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
};

export default SidebarNavigation;
