import React, { useState, useEffect } from 'react';
import { subscribeToAdminLogs } from '../../services/dbUtils';
import { AdminLog } from '../../types';
import { Search, Filter, Save, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ActivityLogTab: React.FC = () => {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Pagination & State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(15);
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    useEffect(() => {
        const unsub = subscribeToAdminLogs((data) => {
            // Sort by latest first
            const sorted = (data as AdminLog[]).sort((a, b) => b.timestamp - a.timestamp);
            setLogs(sorted);
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionStyle = (action: string) => {
        const lower = action.toLowerCase();
        if (lower.includes('delete') || lower.includes('remove')) return 'bg-red-50 text-red-600 border-red-100';
        if (lower.includes('create') || lower.includes('add')) return 'bg-green-50 text-green-600 border-green-100';
        if (lower.includes('update') || lower.includes('edit')) return 'bg-blue-50 text-blue-600 border-blue-100';
        return 'bg-stone-50 text-stone-600 border-stone-100';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-stone-900">Activity Log</h2>
                    <p className="text-xs text-stone-400 mt-2 uppercase tracking-widest">Monitor Admin Actions and Changes</p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold tracking-wider focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                </div>
            </div>

            {/* List View */}
            <div className="bg-white border border-stone-100 rounded-xl overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-12 text-center text-stone-400 text-xs uppercase tracking-widest">Loading history...</div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-12 text-center text-stone-400 text-xs uppercase tracking-widest">No activity found.</div>
                ) : (
                    <div>
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-stone-50 border-b border-stone-100 text-[10px] font-black uppercase tracking-widest text-stone-400">
                            <div className="col-span-3 lg:col-span-2">Time</div>
                            <div className="col-span-3 lg:col-span-2">User</div>
                            <div className="col-span-6 lg:col-span-8">Action Summary</div>
                        </div>

                        <div className="divide-y divide-stone-50">
                            {paginatedLogs.map((log) => (
                                <div key={log.id} className="group">
                                    <div
                                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                        className={`grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer transition-colors ${expandedLogId === log.id ? 'bg-stone-50' : 'hover:bg-stone-50/50'}`}
                                    >
                                        <div className="col-span-3 lg:col-span-2 flex flex-col justify-center">
                                            <span className="text-xs font-bold text-stone-700 font-mono tracking-tight">
                                                {formatDate(log.timestamp).split(',')[0]}
                                            </span>
                                            <span className="text-[10px] text-stone-400">
                                                {formatDate(log.timestamp).split(',')[1]}
                                            </span>
                                        </div>

                                        <div className="col-span-3 lg:col-span-2 truncate">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center text-[10px] font-black">
                                                    {log.userEmail[0].toUpperCase()}
                                                </div>
                                                <span className="text-xs font-bold text-stone-900 truncate">{log.userEmail.split('@')[0]}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-6 lg:col-span-8 flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${getActionStyle(log.action)}`}>
                                                {log.action}
                                            </span>
                                            <span className="text-xs text-stone-500 truncate hidden sm:block">
                                                {log.details.replace(/^Updated.*:/, '')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedLogId === log.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-stone-50/50"
                                            >
                                                <div className="px-6 py-4 border-t border-stone-100 grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Full Details</h4>
                                                        <p className="text-xs text-stone-700 leading-relaxed font-medium bg-white p-3 rounded-lg border border-stone-100">
                                                            {log.details}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Metadata</h4>
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div className="bg-white p-2 rounded border border-stone-100">
                                                                <span className="block text-[9px] text-stone-400 uppercase">User Email</span>
                                                                <span className="font-mono">{log.userEmail}</span>
                                                            </div>
                                                            <div className="bg-white p-2 rounded border border-stone-100">
                                                                <span className="block text-[9px] text-stone-400 uppercase">Log ID</span>
                                                                <span className="font-mono text-[10px]">{log.id.slice(0, 8)}...</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center px-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-stone-50"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-stone-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivityLogTab;
