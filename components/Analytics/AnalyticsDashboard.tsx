
import React, { useMemo } from 'react';
import { Order, ViewLog, Product } from '../../types';
import { processDailySales, processConversionData, processProfitability } from '../../services/analyticsUtils';
import SalesChart from './SalesChart';
import ProfitChart from './ProfitChart';
import ConversionChart from './ConversionChart';
import { TrendingUp, Users, ShoppingBag, Eye, DollarSign, PieChart } from 'lucide-react';

interface AnalyticsDashboardProps {
    orders: Order[];
    viewLogs: ViewLog[];
    products: Product[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ orders, viewLogs, products }) => {
    const SALES_DATA = useMemo(() => processDailySales(orders), [orders]);
    const CONVERSION_DATA = useMemo(() => processConversionData(viewLogs, orders), [viewLogs, orders]);
    const PROFIT_DATA = useMemo(() => processProfitability(orders, products), [orders, products]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalViews = viewLogs.length;

    // Calculate average views per product
    const avgViews = products.length > 0 ? Math.round(totalViews / products.length) : 0;

    // Calculate Profit Totals
    const totalCost = useMemo(() => {
        let c = 0;
        orders.forEach(o => {
            o.items.forEach(item => {
                const p = products.find(prod => prod.id === item.id);
                c += (p?.costPrice || 0) * item.quantity;
            });
        });
        return c;
    }, [orders, products]);

    const grossProfit = totalRevenue - totalCost;
    const netMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

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
                        <div className="p-2 bg-green-50 rounded-lg"><DollarSign size={16} className="text-green-600" /></div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Gross Profit</span>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">N{grossProfit.toLocaleString()}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg"><PieChart size={16} className="text-blue-600" /></div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Net Margin</span>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">{netMargin.toFixed(1)}%</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-stone-50 rounded-lg"><ShoppingBag size={16} className="text-[#C5A059]" /></div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Orders</span>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900">{totalOrders}</h3>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
                <ProfitChart data={PROFIT_DATA} />
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
