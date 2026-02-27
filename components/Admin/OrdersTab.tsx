import React, { useState, useMemo } from 'react';
import {
    Search, FileSpreadsheet, FileText, ChevronLeft, ChevronRight,
    CheckCircle2, Clock, Truck, Package
} from 'lucide-react';
import { Order } from '../../types';
import { saveOrder } from '../../services/dbUtils';
import { exportOrdersToCSV, exportOrdersToPDF } from '../../services/exportUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface OrdersTabProps {
    orders: Order[];
}

const OrdersTab: React.FC<OrdersTabProps> = ({ orders }) => {
    const [dateFilterMode, setDateFilterMode] = useState<'week' | 'month' | 'year' | 'all'>('week');
    const [dateOffset, setDateOffset] = useState(0);
    const [orderSearchQuery, setOrderSearchQuery] = useState('');

    // --- Filtering Logic ---
    const filteredOrders = useMemo(() => {
        let result = [...orders];
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        if (dateFilterMode === 'week') {
            const currentWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            startDate = new Date(currentWeekStart);
            startDate.setDate(currentWeekStart.getDate() + (dateOffset * 7));
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else if (dateFilterMode === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth() + dateOffset, 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + dateOffset + 1, 0);
            endDate.setHours(23, 59, 59, 999);
        } else if (dateFilterMode === 'year') {
            startDate = new Date(now.getFullYear() + dateOffset, 0, 1);
            endDate = new Date(now.getFullYear() + dateOffset, 11, 31);
            endDate.setHours(23, 59, 59, 999);
        }

        if (dateFilterMode !== 'all') {
            result = result.filter(o => {
                const oDate = new Date(o.date);
                return oDate >= startDate && oDate <= endDate;
            });
        }

        if (orderSearchQuery.trim()) {
            const q = orderSearchQuery.toLowerCase();
            result = result.filter(o =>
                (o.id || '').toLowerCase().includes(q) ||
                (o.customerName || '').toLowerCase().includes(q) ||
                (o.customerEmail || '').toLowerCase().includes(q)
            );
        }

        // Sort newest first
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return result;
    }, [orders, orderSearchQuery, dateOffset, dateFilterMode]);

    const getDateLabel = () => {
        const now = new Date();
        if (dateFilterMode === 'week') {
            if (dateOffset === 0) return 'Current Week';
            if (dateOffset === -1) return 'Last Week';
            if (dateOffset === 1) return 'Next Week';
            return `${Math.abs(dateOffset)} Weeks ${dateOffset < 0 ? 'Ago' : 'Ahead'}`;
        }
        if (dateFilterMode === 'month') {
            const d = new Date(now.getFullYear(), now.getMonth() + dateOffset, 1);
            return d.toLocaleString('default', { month: 'long', year: 'numeric' });
        }
        if (dateFilterMode === 'year') {
            return (now.getFullYear() + dateOffset).toString();
        }
        return '';
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            try {
                await saveOrder({ ...order, status });
            } catch (error: any) {
                console.error(error);
                alert(`Failed to update order status: ${error.message}`);
            }
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'Shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    const getStatusIcon = (status: Order['status']) => {
        switch (status) {
            case 'Delivered': return <CheckCircle2 size={12} />;
            case 'Shipped': return <Truck size={12} />;
            default: return <Clock size={12} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white border border-stone-100 rounded-[2.5rem] shadow-xl shadow-stone-200/50 overflow-hidden min-h-[500px]">

                {/* Header & Controls */}
                <div className="p-8 border-b border-stone-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-stone-50/30">
                    <div>
                        <h3 className="text-xl font-bold font-serif italic text-stone-900">Order Management</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{filteredOrders.length} Transactions Found</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">

                        {/* Date Filter */}
                        <div className="flex items-center bg-white rounded-xl p-1 border border-stone-200 shadow-sm">
                            <select
                                value={dateFilterMode}
                                onChange={(e) => {
                                    setDateFilterMode(e.target.value as any);
                                    setDateOffset(0);
                                }}
                                className="bg-transparent text-[9px] font-bold uppercase tracking-widest text-stone-900 border-r border-stone-100 px-4 py-2 focus:outline-none cursor-pointer hover:bg-stone-50 rounded-lg transition-colors"
                            >
                                <option value="week">Weekly</option>
                                <option value="month">Monthly</option>
                                <option value="year">Yearly</option>
                                <option value="all">All Time</option>
                            </select>

                            {dateFilterMode !== 'all' && (
                                <div className="flex items-center pl-1">
                                    <button onClick={() => setDateOffset(prev => prev - 1)} className="p-2 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-stone-900 transition-colors"><ChevronLeft size={14} /></button>
                                    <div className="px-3 min-w-[100px] text-center">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-800">{getDateLabel()}</span>
                                    </div>
                                    <button onClick={() => setDateOffset(prev => prev + 1)} className="p-2 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-stone-900 transition-colors"><ChevronRight size={14} /></button>
                                </div>
                            )}
                        </div>

                        {/* Search */}
                        <div className="relative group flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#C5A059] transition-colors" size={14} />
                            <input
                                type="text"
                                placeholder="SEARCH ID, NAME..."
                                value={orderSearchQuery}
                                onChange={(e) => setOrderSearchQuery(e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-xl py-3 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 shadow-sm transition-all"
                            />
                        </div>

                        {/* Exports */}
                        <div className="flex gap-2">
                            <button onClick={() => exportOrdersToCSV(filteredOrders)} className="p-3 bg-white border border-stone-200 text-stone-500 rounded-xl hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all shadow-sm" title="Export CSV">
                                <FileSpreadsheet size={16} />
                            </button>
                            <button onClick={() => exportOrdersToPDF(filteredOrders)} className="flex items-center gap-2 px-5 py-3 bg-stone-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#C5A059] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5" title="Generate Report">
                                <FileText size={14} />
                                <span className="hidden md:inline">PDF Report</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table (Desktop) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-stone-50/50 text-[9px] font-black uppercase text-stone-400 tracking-[0.3em] border-b border-stone-100">
                            <tr>
                                <th className="px-8 py-6 whitespace-nowrap">Order ID</th>
                                <th className="px-8 py-6">Client Details</th>
                                <th className="px-8 py-6">Artifacts</th>
                                <th className="px-8 py-6">Fulfillment</th>
                                <th className="px-8 py-6 text-right">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            <AnimatePresence>
                                {filteredOrders.map((order, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={order.id}
                                        className="hover:bg-[#FFFDF5] group transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">{(order.id || '???').slice(-8)}</span>
                                                <span className="text-[8px] font-bold text-stone-400 uppercase mt-1">{new Date(order.date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-stone-800">{order.customerName || 'Guest Client'}</span>
                                                <div className="flex items-center gap-2 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[9px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">{order.customerPhone || 'No Phone'}</span>
                                                    <span className="text-[9px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded truncate max-w-[150px]">{order.customerEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex -space-x-4 hover:space-x-1 transition-all duration-300 overflow-visible py-2">
                                                {(order.items || []).slice(0, 4).map((it, i) => (
                                                    <div key={i} className="relative w-10 h-10 rounded-xl bg-white border-2 border-white shadow-md overflow-hidden hover:scale-110 hover:z-10 transition-transform">
                                                        {it.images && it.images[0] ? (
                                                            <img src={it.images[0]} className="w-full h-full object-cover" title={it.name} />
                                                        ) : (
                                                            <div className="w-full h-full bg-stone-100 flex items-center justify-center"><Package size={12} className="text-stone-300" /></div>
                                                        )}
                                                    </div>
                                                ))}
                                                {(order.items || []).length > 4 && (
                                                    <div className="w-10 h-10 rounded-xl bg-stone-100 border-2 border-white flex items-center justify-center text-[9px] font-black text-stone-500 shadow-sm z-0">
                                                        +{order.items.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                <select
                                                    value={order.status || 'Pending'}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                                    className="bg-transparent text-[9px] font-black uppercase tracking-widest focus:outline-none cursor-pointer appearance-none pr-2"
                                                >
                                                    <option value="Pending">Processing</option>
                                                    <option value="Shipped">Dispatched</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-sm font-black text-stone-900 tracking-tight">₦{(order.total || 0).toLocaleString()}</span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>

                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                                            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-2">
                                                <Search size={24} className="text-stone-400" />
                                            </div>
                                            <p className="text-lg font-serif italic text-stone-500">No records match your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrdersTab;
