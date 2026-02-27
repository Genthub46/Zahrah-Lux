import React from 'react';
import { Menu, User, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';

interface AdminMobileHeaderProps {
    activeTab: string;
    onMenuClick: () => void;
    userEmail?: string;
}

const AdminMobileHeader: React.FC<AdminMobileHeaderProps> = ({ activeTab, onMenuClick, userEmail }) => {
    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-[50] bg-white/95 backdrop-blur-xl border-b border-stone-200 h-[70px] px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 hover:bg-stone-100 rounded-full text-stone-800 transition-colors"
                >
                    <Menu size={24} strokeWidth={1.5} />
                </button>
                <div className="h-6 w-px bg-stone-200" />
                <Link to="/">
                    <Logo size={24} className="text-stone-900" />
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex flex-col items-end mr-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">Admin</span>
                    <span className="text-[10px] font-bold text-stone-800 hidden sm:block">{userEmail?.split('@')[0]}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-[#C5A059]">
                    <ShieldCheck size={14} />
                </div>
            </div>
        </header>
    );
};

export default AdminMobileHeader;
