import React from 'react';
import { LogOut, Activity, X, LucideIcon, Store, FileText, Users, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from '../Logo';

interface Tab {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    tabs: Tab[];
    onLogout: () => void;
    onRepairDatabase: () => void;
    onWipeDatabase: () => void;
    isOpen?: boolean;
    onClose?: () => void;
    role?: string | null;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    activeTab,
    setActiveTab,
    tabs,
    onLogout,
    onRepairDatabase,
    onWipeDatabase,
    isOpen = false,
    onClose,
    role
}) => {
    // Desktop Sidebar (Always visible on lg screens)
    const DesktopSidebar = (
        <aside className="hidden lg:flex w-72 bg-white/80 backdrop-blur-md border-r border-stone-100 fixed h-full flex-col z-[100]">
            <Link to="/" className="h-32 flex items-center justify-center border-b border-stone-100 hover:bg-stone-50 transition-colors">
                <Logo size={80} className="text-stone-900" />
            </Link>
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <nav className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-4 w-full px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-300 group
                ${activeTab === tab.id
                                    ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/10 translate-x-1'
                                    : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'
                                }`}
                        >
                            <tab.icon size={16} className={`${activeTab === tab.id ? 'text-[#C5A059]' : 'text-stone-300 group-hover:text-stone-900'} transition-colors`} />
                            <span>{tab.label}</span>
                            {activeTab === tab.id && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C5A059] shadow-[0_0_8px_rgba(197,160,89,0.8)]" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-8 border-t border-stone-100 space-y-2 shrink-0">
                <div className="mb-6 px-4">
                    <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest mb-2">System Controls</p>
                </div>

                <Link
                    to="/"
                    className="w-full px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-xl flex items-center space-x-3 transition-all group"
                >
                    <Store size={16} className="text-stone-300 group-hover:text-stone-900 transition-colors" />
                    <span>Return to Boutique</span>
                </Link>

                <button
                    onClick={() => {
                        if (confirm("This will reset/populate the database with initial products. Continue?")) {
                            onRepairDatabase();
                        }
                    }}
                    className="w-full px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-stone-500 hover:text-[#C5A059] hover:bg-stone-50 rounded-xl flex items-center space-x-3 transition-all group"
                >
                    <Activity size={16} className="text-stone-300 group-hover:text-[#C5A059] transition-colors" />
                    <span>Repair Database</span>
                </button>

                {role === 'super_admin' && (
                    <button
                        onClick={onWipeDatabase}
                        className="w-full px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center space-x-3 transition-all group border border-red-100"
                    >
                        <AlertTriangle size={16} className="text-red-400 group-hover:text-red-600 transition-colors" />
                        <span>Wipe Database</span>
                    </button>
                )}

                <button
                    onClick={onLogout}
                    className="w-full px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center space-x-3 transition-all group"
                >
                    <LogOut size={16} className="text-stone-300 group-hover:text-red-500 transition-colors" />
                    <span>End Session</span>
                </button>
            </div>
        </aside>
    );

    // Mobile Overlay Sidebar
    return (
        <>
            {DesktopSidebar}

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/60 z-[200] lg:hidden backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[210] lg:hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-6 flex justify-between items-center border-b border-stone-100">
                                <span className="text-xs font-black uppercase tracking-widest text-stone-900">Menu</span>
                                <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full">
                                    <X size={20} className="text-stone-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); onClose?.(); }}
                                        className={`flex items-center space-x-4 w-full px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-300 group
                                        ${activeTab === tab.id
                                                ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/10'
                                                : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'
                                            }`}
                                    >
                                        <tab.icon size={16} className={`${activeTab === tab.id ? 'text-[#C5A059]' : 'text-stone-300 group-hover:text-stone-900'} transition-colors`} />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 border-t border-stone-100 bg-stone-50 space-y-3">
                                <Link
                                    to="/"
                                    className="w-full px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-stone-500 bg-white border border-stone-200 hover:text-stone-900 hover:bg-stone-50 rounded-xl flex items-center justify-center space-x-3 transition-all"
                                >
                                    <Store size={16} />
                                    <span>Return to Boutique</span>
                                </Link>
                                <button
                                    onClick={onLogout}
                                    className="w-full px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-red-500 bg-white border border-stone-200 hover:bg-red-50 rounded-xl flex items-center justify-center space-x-3 transition-all"
                                >
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminSidebar;
