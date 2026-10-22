import React from "react";
import { Menu, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../Logo";
import { isSandboxMode } from "../../services/dbUtils";

interface AdminMobileHeaderProps {
    activeTab: string;
    onMenuClick: () => void;
    userEmail?: string;
}

const AdminMobileHeader: React.FC<AdminMobileHeaderProps> = ({ activeTab, onMenuClick, userEmail }) => {
    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-[50] bg-white/95 backdrop-blur-xl border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between shadow-sm pt-[env(safe-area-inset-top,0px)] h-[calc(64px+env(safe-area-inset-top,0px))]">
            <div className="flex items-center gap-3 sm:gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2.5 -ml-1 hover:bg-stone-100 active:bg-stone-200 rounded-full text-stone-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Open Navigation Menu"
                >
                    <Menu size={22} strokeWidth={1.5} />
                </button>
                <div className="h-5 w-px bg-stone-200" />
                <Link to="/" className="flex items-center">
                    <Logo size={22} className="text-stone-900" />
                </Link>
            </div>

            <div className="flex items-center gap-2">
                {isSandboxMode() && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                        Sandbox
                    </span>
                )}
                <div className="flex flex-col items-end mr-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#C5A059]">Executive</span>
                    <span className="text-[10px] font-bold text-stone-800 max-w-[120px] truncate">{userEmail?.split("@")[0]}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-[#C5A059] shadow-sm">
                    <ShieldCheck size={14} />
                </div>
            </div>
        </header>
    );
};

export default AdminMobileHeader;
