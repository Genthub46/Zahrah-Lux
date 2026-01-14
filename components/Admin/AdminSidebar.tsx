import React from 'react';
import { LogOut, Activity, LayoutGrid } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

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
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
    activeTab,
    setActiveTab,
    tabs,
    onLogout,
    onRepairDatabase
}) => {
    return (
        <aside className="hidden lg:flex w-72 bg-white/80 backdrop-blur-md border-r border-stone-100 fixed h-full flex-col z-[100] pt-40">
            <div className="p-6">
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

            <div className="mt-auto p-8 border-t border-stone-100 space-y-2">
                <div className="mb-6 px-4">
                    <p className="text-[9px] font-black text-stone-300 uppercase tracking-widest mb-2">System Controls</p>
                </div>

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
};

export default AdminSidebar;
