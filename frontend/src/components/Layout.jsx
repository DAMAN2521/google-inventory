import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNavigation from './SidebarNavigation';
import { Menu } from 'lucide-react';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-dark-bg text-dark-text flex">
            {/* Sidebar */}
            <SidebarNavigation isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-300">

                {/* Mobile Header */}
                <header className="h-16 border-b border-dark-border bg-dark-card/90 backdrop-blur-md flex items-center px-4 md:hidden sticky top-0 z-10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-dark-muted hover:text-white p-1"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-semibold text-white">POS System</span>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="w-full max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
