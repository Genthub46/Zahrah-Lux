import React, { useState, useMemo } from 'react';
import { UserProfile, Order } from '../../types';
import { Search, User, Mail, Calendar, ShoppingBag, DollarSign } from 'lucide-react';

interface CustomersTabProps {
    users: UserProfile[];
    orders: Order[];
}

const CustomersTab: React.FC<CustomersTabProps> = ({ users, orders }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const customerData = useMemo(() => {
        return users.map(user => {
            const userOrders = orders.filter(
                order => (order.customerEmail || '').toLowerCase() === (user.email || '').toLowerCase()
            );

            const totalSpend = userOrders.reduce((sum, order) => sum + order.total, 0);
            const lastOrderDate = userOrders.length > 0
                ? userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
                : null;

            // Segmentation Logic
            let segment = 'Window Shopper';
            let segmentColor = 'bg-stone-100 text-stone-500';

            const daysSinceLastOrder = lastOrderDate
                ? Math.floor((new Date().getTime() - new Date(lastOrderDate).getTime()) / (1000 * 3600 * 24))
                : 999;

            if (totalSpend > 500000) {
                segment = 'VIP Client';
                segmentColor = 'bg-[#C5A059] text-white shadow-sm';
            } else if (userOrders.length > 3) {
                segment = 'Loyal';
                segmentColor = 'bg-indigo-50 text-indigo-700 border border-indigo-100';
            } else if (userOrders.length > 0 && daysSinceLastOrder < 30) {
                segment = 'Active';
                segmentColor = 'bg-green-50 text-green-700 border border-green-100';
            } else if (userOrders.length > 0 && daysSinceLastOrder > 90) {
                segment = 'At Risk';
                segmentColor = 'bg-red-50 text-red-700 border border-red-100';
            }

            return {
                ...user,
                orderCount: userOrders.length,
                totalSpend,
                lastOrderDate,
                segment,
                segmentColor
            };
        });
    }, [users, orders]);

    const filteredCustomers = customerData.filter(customer =>
        (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-stone-900">Customer Management</h2>
                    <p className="text-xs text-stone-400 mt-2 uppercase tracking-widest">
                        {users.length} Registered Clients
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-xs font-bold tracking-wider focus:outline-none focus:border-[#C5A059] transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-stone-100 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-stone-50 border-b border-stone-100">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Client</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Joined</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-center">Orders</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Lifetime Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-stone-400 text-xs uppercase tracking-widest">
                                        No customers found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.uid} className="hover:bg-stone-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-xs">
                                                    {(customer.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-stone-900">{customer.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <div className="flex items-center gap-1 text-[9px] text-stone-400">
                                                            <Mail size={10} />
                                                            <span>{customer.email}</span>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${customer.segmentColor}`}>
                                                            {customer.segment}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${customer.role === 'admin'
                                                ? 'bg-purple-50 text-purple-600'
                                                : 'bg-green-50 text-green-600'
                                                }`}>
                                                {customer.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                                <Calendar size={12} />
                                                <span>{formatDate(customer.createdAt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[11px] font-bold text-stone-900 group-hover:text-[#C5A059] transition-colors">
                                                {customer.orderCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-[11px] font-black text-stone-900 group-hover:text-[#C5A059] transition-colors">
                                                {formatCurrency(customer.totalSpend)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomersTab;
