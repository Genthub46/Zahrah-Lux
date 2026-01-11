
import React, { useMemo } from 'react';
import { Order, ViewLog, Product } from '../../types';
import { processDailySales, processConversionData } from '../../services/analyticsUtils';
import SalesChart from './SalesChart';
import ConversionChart from './ConversionChart';
import { TrendingUp, Users, ShoppingBag, Eye } from 'lucide-react';

interface AnalyticsDashboardProps {
    orders: Order[];
    viewLogs: ViewLog[];
    products: Product[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ orders, viewLogs, products }) => {
    const SALES_DATA = useMemo(() => processDailySales(orders), [orders]);
    const CONVERSION_DATA = useMemo(() => processConversionData(viewLogs, orders), [viewLogs, orders]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalViews = viewLogs.length;

    // Calculate average views per product
    const avgViews = products.length > 0 ? Math.round(totalViews / products.length) : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-stone-900 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/10 rounded-lg"><TrendingUp size={16} /></div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Total Revenue</span>
                    </div>
                    <h3 className="text-2xl font-bold">N{totalRevenue.toLocaleString()}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-stone-50 rounded-lg"><ShoppingBag size={16} className="text-[#C5A059]" /></div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Orders</span>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">{totalOrders}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-stone-50 rounded-lg"><Eye size={16} className="text-stone-400" /></div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Total Views</span>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">{totalViews}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-stone-50 rounded-lg"><Users size={16} className="text-stone-400" /></div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Avg. Engagement</span>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">{avgViews} <span className="text-[10px] text-stone-400 font-normal">views/product</span></h3>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                <SalesChart data={SALES_DATA} />
                <ConversionChart data={CONVERSION_DATA} />
            </div>

            {/* Insight Alert to user regarding time spent */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest">
                    Note: "Time Spent" analytics requires advanced session tracking cookies, which are currently disabled for privacy. Engagement is measured by interaction counts.
                </p>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
