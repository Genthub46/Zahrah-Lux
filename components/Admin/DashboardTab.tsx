import React, { useMemo } from 'react';
import {
    DollarSign, ShoppingCart, Users, Package, TrendingUp,
    AlertTriangle, Plus, FileSpreadsheet, Eye, ArrowUpRight
} from 'lucide-react';
import { Order, Product, UserProfile } from '../../types';
import { AdminRole } from '../../services/adminPermissions';

interface DashboardTabProps {
    orders: Order[];
    products: Product[];
    users: UserProfile[];
    onNavigate: (tab: string) => void;
    onNavigateToProductsWithFilter?: (type: 'all' | 'category' | 'tag' | 'stock', value: string) => void;
    role?: AdminRole | null;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ orders, products, users, onNavigate, onNavigateToProductsWithFilter, role }) => {
    // Calculate stats
    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - 7);

        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const ordersToday = orders.filter(o => new Date(o.date) >= today);
        const ordersThisWeek = orders.filter(o => new Date(o.date) >= thisWeekStart);
        const ordersThisMonth = orders.filter(o => new Date(o.date) >= thisMonthStart);

        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const revenueThisMonth = ordersThisMonth.reduce((sum, o) => sum + o.total, 0);

        const lowStockProducts = products.filter(p => p.stock <= 5);
        const outOfStock = products.filter(p => p.stock === 0);

        const pendingOrders = orders.filter(o => o.status === 'Pending');

        const customersThisMonth = users.filter(u => {
            const created = new Date(u.createdAt);
            return created >= thisMonthStart && u.role === 'customer';
        });

        return {
            totalRevenue,
            revenueThisMonth,
            ordersToday: ordersToday.length,
            ordersThisWeek: ordersThisWeek.length,
            ordersThisMonth: ordersThisMonth.length,
            totalOrders: orders.length,
            totalProducts: products.length,
            lowStockCount: lowStockProducts.length,
            outOfStockCount: outOfStock.length,
            pendingOrdersCount: pendingOrders.length,
            totalCustomers: users.filter(u => u.role === 'customer').length,
            newCustomersThisMonth: customersThisMonth.length,
        };
    }, [orders, products, users]);

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [orders]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Delivered': return 'bg-green-50 text-green-600';
            case 'Shipped': return 'bg-blue-50 text-blue-600';
            default: return 'bg-amber-50 text-amber-600';
        }
    };

    const canViewRevenue = role === 'super_admin' || role === 'manager';

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-[#C5A059] to-[#8B7355] rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Revenue</span>
                    </div>
                    {canViewRevenue ? (
                        <>
                            <p className="text-3xl font-black mb-1">{formatCurrency(stats.totalRevenue)}</p>
                            <p className="text-xs opacity-80">{formatCurrency(stats.revenueThisMonth)} this month</p>
                        </>
                    ) : (
                        <div className="h-14 flex items-center">
                            <span className="text-lg font-bold opacity-50 italic">Hidden</span>
                        </div>
                    )}
                </div>

                {/* Orders */}
                <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <ShoppingCart size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Orders</span>
                    </div>
                    <p className="text-3xl font-black text-stone-900 mb-1">{stats.totalOrders}</p>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-600 font-bold">{stats.ordersToday} today</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-stone-500">{stats.ordersThisWeek} this week</span>
                    </div>
                </div>

                {/* Customers */}
                <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                            <Users size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Customers</span>
                    </div>
                    <p className="text-3xl font-black text-stone-900 mb-1">{stats.totalCustomers}</p>
                    <p className="text-xs text-stone-500">+{stats.newCustomersThisMonth} new this month</p>
                </div>

                {/* Products */}
                <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <Package size={24} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Products</span>
                    </div>
                    <p className="text-3xl font-black text-stone-900 mb-1">{stats.totalProducts}</p>
                    <p className="text-xs text-stone-500">{stats.lowStockCount} low stock</p>
                </div>
            </div>

            {/* Alerts Row */}
            {(stats.pendingOrdersCount > 0 || stats.lowStockCount > 0) && (
                <div className="flex flex-wrap gap-4">
                    {stats.pendingOrdersCount > 0 && (
                        <button
                            onClick={() => onNavigate('orders')}
                            className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
                        >
                            <AlertTriangle size={18} className="text-amber-600" />
                            <span className="text-xs font-bold text-amber-700">
                                {stats.pendingOrdersCount} Pending Order{stats.pendingOrdersCount !== 1 ? 's' : ''}
                            </span>
                            <ArrowUpRight size={14} className="text-amber-500" />
                        </button>
                    )}
                    {stats.outOfStockCount > 0 && (
                        <button
                            onClick={() => onNavigateToProductsWithFilter ? onNavigateToProductsWithFilter('stock', 'out_of_stock') : onNavigate('products')}
                            className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                        >
                            <Package size={18} className="text-red-600" />
                            <span className="text-xs font-bold text-red-700">
                                {stats.outOfStockCount} Out of Stock
                            </span>
                            <ArrowUpRight size={14} className="text-red-500" />
                        </button>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Recent Orders */}
                <div className="md:col-span-2 lg:col-span-2 bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                        <h3 className="text-sm font-black uppercase tracking-widest text-stone-900">Recent Orders</h3>
                        <button
                            onClick={() => onNavigate('orders')}
                            className="text-xs font-bold text-[#C5A059] hover:underline flex items-center gap-1"
                        >
                            View All <ArrowUpRight size={12} />
                        </button>
                    </div>
                    <div className="divide-y divide-stone-50">
                        {recentOrders.length === 0 ? (
                            <div className="px-6 py-8 text-center text-stone-400 text-xs uppercase tracking-widest">
                                No orders yet
                            </div>
                        ) : (
                            recentOrders.map(order => (
                                <div key={order.id} className="px-6 py-4 hover:bg-stone-50/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-stone-900">{order.customerName}</p>
                                            <p className="text-[10px] text-stone-400">{formatDate(order.date)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-stone-900">{formatCurrency(order.total)}</p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-stone-100">
                        <h3 className="text-sm font-black uppercase tracking-widest text-stone-900">Quick Actions</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        <button
                            onClick={() => onNavigate('products')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-[#C5A059]/10 rounded-lg flex items-center justify-center text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-white transition-colors">
                                <Plus size={18} />
                            </div>
                            <span className="text-xs font-bold text-stone-700">Add New Product</span>
                        </button>
                        <button
                            onClick={() => onNavigate('orders')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Eye size={18} />
                            </div>
                            <span className="text-xs font-bold text-stone-700">View All Orders</span>
                        </button>
                        <button
                            onClick={() => onNavigate('analytics')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <TrendingUp size={18} />
                            </div>
                            <span className="text-xs font-bold text-stone-700">View Analytics</span>
                        </button>
                        <button
                            onClick={() => onNavigate('customers')}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <Users size={18} />
                            </div>
                            <span className="text-xs font-bold text-stone-700">Manage Customers</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
