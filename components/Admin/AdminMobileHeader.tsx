import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Tab {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface AdminMobileHeaderProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    tabs: Tab[];
}

const AdminMobileHeader: React.FC<AdminMobileHeaderProps> = ({ activeTab, setActiveTab, tabs }) => {
    return (
        <div className="lg:hidden fixed top-[70px] left-0 right-0 z-[40] bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm overflow-x-auto no-scrollbar py-2">
            <div className="flex px-4 space-x-2 min-w-max">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 flex items-center space-x-3 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all box-border border
              ${activeTab === tab.id
                                ? 'bg-stone-900 text-white border-stone-900 shadow-lg'
                                : 'text-stone-400 bg-white border-stone-100'
                            }`}
                    >
                        <tab.icon size={12} className={activeTab === tab.id ? 'text-[#C5A059]' : ''} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminMobileHeader;
