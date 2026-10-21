import React, { useState, useMemo } from 'react';
import { Order, ViewLog, Product } from '../../types';
import { processDailySales, processConversionData, processProfitability } from '../../services/analyticsUtils';
import SalesChart from './SalesChart';
import ProfitChart from './ProfitChart';
import ConversionChart from './ConversionChart';
import {
    TrendingUp,
    ShoppingBag,
    Eye,
    DollarSign,
    PieChart,
    Activity,
    ExternalLink,
    ArrowUpRight,
    ShieldCheck,
    Sparkles,
    Coins,
    ArrowRight
} from 'lucide-react';
import { GA_PROPERTY_ID } from '../../services/analytics';

interface AnalyticsDashboardProps {
    orders: Order[];
    viewLogs: ViewLog[];
    products: Product[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ orders, viewLogs, products }) => {
    const [timeRange, setTimeRange] = useState<number>(7);
    const [chartTab, setChartTab] = useState<'profitability' | 'sales'>('profitability');

    // Filtered data based on chosen time window
    const SALES_DATA = useMemo(() => processDailySales(orders, timeRange), [orders, timeRange]);
    const CONVERSION_DATA = useMemo(() => processConversionData(viewLogs, orders), [viewLogs, orders]);
    const PROFIT_DATA = useMemo(() => processProfitability(orders, products, timeRange), [orders, products, timeRange]);

    // Financial Metrics Calculation
    const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
    const totalOrders = orders.length;
    const totalViews = viewLogs.length;

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
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Top 5 Most-Viewed Luxury Pieces
    const topViewedProducts = useMemo(() => {
        const counts: Record<string, number> = {};
        viewLogs.forEach(log => {
            counts[log.productId] = (counts[log.productId] || 0) + 1;
        });

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, views]) => {
                const product = products.find(p => p.id === id);
                return { product, views, id };
            })
            .filter((item): item is { product: Product; views: number; id: string } => Boolean(item.product));
    }, [viewLogs, products]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            
            {/* Executive Header Controls: Streamlined 1-Line Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200/70">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">
                            Analytics &amp; Performance
                        </h2>
                    </div>

                    {/* Compact GA4 Live Status Badge */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[10px] font-bold">
                        <span>GA4 Live</span>
                    </span>

                    {/* Google Analytics 1-Click External Shortcuts */}
                    <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200">
                        <a
                            href={`https://analytics.google.com/analytics/web/#/p${GA_PROPERTY_ID}/realtime`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 group"
                            title="Open Google Analytics Real-Time Live Visitors"
                        >
                            <Activity size={12} className="text-[#C5A059] group-hover:text-white" />
                            <span>Real-Time</span>
                            <ArrowUpRight size={10} className="opacity-70" />
                        </a>

                        <a
                            href={`https://analytics.google.com/analytics/web/#/p${GA_PROPERTY_ID}/reports/dashboard?params=_u..nav%3Ddefault&r=lifecycle-acquisition-traffic-acquisition`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                            title="Open Traffic Sources (Instagram, Google, Direct)"
                        >
                            <TrendingUp size={12} className="text-stone-500" />
                            <span>Traffic</span>
                            <ExternalLink size={10} className="opacity-60" />
                        </a>

                        <a
                            href={`https://analytics.google.com/analytics/web/#/p${GA_PROPERTY_ID}/reports/dashboard?params=_u..nav%3Ddefault&r=lifecycle-monetization-ecommerce-purchases`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                            title="Open E-Commerce Monetization Funnel"
                        >
                            <ShoppingBag size={12} className="text-[#C5A059]" />
                            <span>Sales</span>
                            <ExternalLink size={10} className="opacity-60" />
                        </a>
                    </div>
                </div>

                {/* Time Range Filter Pill */}
                <div className="inline-flex items-center bg-stone-100/80 p-1 rounded-2xl border border-stone-200/80 self-start lg:self-auto">
                    {[
                        { label: '7 Days', days: 7 },
                        { label: '14 Days', days: 14 },
                        { label: '30 Days', days: 30 },
                    ].map(tab => (
                        <button
                            key={tab.days}
                            onClick={() => setTimeRange(tab.days)}
                            className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                                timeRange === tab.days
                                    ? 'bg-white text-stone-950 shadow-sm'
                                    : 'text-stone-500 hover:text-stone-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Executive KPI Cards (Corrected Currency & Luxury Typography) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                
                {/* Total Store Revenue */}
                <div className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-white p-6 rounded-3xl border border-stone-800 shadow-xl group hover:border-[#C5A059]/40 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-[#C5A059]/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none group-hover:bg-[#C5A059]/20 transition-all" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#C5A059]">
                            <Coins size={18} />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                            Gross Volume
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                            Total Revenue
                        </p>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-lg font-serif text-[#C5A059] font-bold">₦</span>
                            <span className="text-3xl font-black tracking-tight text-white">
                                {totalRevenue.toLocaleString('en-NG')}
                            </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-2">
                            All processed boutique transactions
                        </p>
                    </div>
                </div>

                {/* Gross Profit */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <DollarSign size={18} />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            Net Gain
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                            Gross Profit
                        </p>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-lg font-serif text-emerald-600 font-bold">₦</span>
                            <span className="text-3xl font-black tracking-tight text-stone-900">
                                {grossProfit.toLocaleString('en-NG')}
                            </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-2">
                            Revenue minus product cost price
                        </p>
                    </div>
                </div>

                {/* Operating Net Margin */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md hover:border-[#C5A059]/40 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-[#C5A059]">
                            <PieChart size={18} />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#8C6D2C] bg-[#C5A059]/10 px-2.5 py-1 rounded-full border border-[#C5A059]/20">
                            Margin
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                            Net Operating Margin
                        </p>
                        <div className="flex items-baseline space-x-0.5">
                            <span className="text-3xl font-black tracking-tight text-stone-900">
                                {netMargin.toFixed(1)}
                            </span>
                            <span className="text-lg font-bold text-stone-400">%</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-2">
                            Cost efficiency on catalog sales
                        </p>
                    </div>
                </div>

                {/* Total Orders & AOV */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md hover:border-stone-400 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-700">
                            <ShoppingBag size={18} />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
                            Volume
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                            Completed Orders
                        </p>
                        <div className="flex items-baseline space-x-1.5">
                            <span className="text-3xl font-black tracking-tight text-stone-900">
                                {totalOrders}
                            </span>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                                {totalOrders === 1 ? 'Order' : 'Orders'}
                            </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-2">
                            AOV: <strong className="text-stone-700">₦{averageOrderValue.toLocaleString('en-NG')}</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Visual Analytics Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Cols: Profitability & Revenue Charts */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setChartTab('profitability')}
                                className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all ${
                                    chartTab === 'profitability'
                                        ? 'bg-stone-900 text-white shadow-sm'
                                        : 'text-stone-500 hover:text-stone-900 bg-stone-100'
                                }`}
                            >
                                Profitability Model
                            </button>
                            <button
                                onClick={() => setChartTab('sales')}
                                className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all ${
                                    chartTab === 'sales'
                                        ? 'bg-stone-900 text-white shadow-sm'
                                        : 'text-stone-500 hover:text-stone-900 bg-stone-100'
                                }`}
                            >
                                Revenue Trend
                            </button>
                        </div>
                    </div>

                    {chartTab === 'profitability' ? (
                        <ProfitChart data={PROFIT_DATA} days={timeRange} />
                    ) : (
                        <SalesChart data={SALES_DATA} days={timeRange} />
                    )}
                </div>

                {/* Right Col: Conversion Funnel */}
                <div className="lg:col-span-1">
                    <ConversionChart data={CONVERSION_DATA} />
                </div>
            </div>

            {/* Catalog Interest & Top Viewed Luxury Pieces */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                    <div>
                        <h3 className="text-xs font-black text-stone-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Sparkles size={14} className="text-[#C5A059]" />
                            <span>Catalog Performance: Most-Viewed Pieces</span>
                        </h3>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                            Customer interest ranked by direct storefront catalog impressions ({totalViews} total views logged).
                        </p>
                    </div>
                </div>

                {topViewedProducts.length > 0 ? (
                    <div className="divide-y divide-stone-100">
                        {topViewedProducts.map(({ product, views }, idx) => (
                            <div key={product.id} className="py-3.5 flex items-center justify-between gap-4 group">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xs font-serif italic text-stone-400 w-4 text-center font-bold">
                                        0{idx + 1}
                                    </span>
                                    {product.images && product.images[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-11 h-11 object-cover rounded-xl border border-stone-100 bg-stone-50 flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-bold flex-shrink-0">
                                            ZL
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-[#C5A059] transition-colors">
                                            {product.name}
                                        </h4>
                                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                                            {product.category || 'Luxury Collection'} &bull; In Stock: {product.stock}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 flex-shrink-0">
                                    <div className="text-right">
                                        <p className="text-xs font-black text-stone-900">
                                            ₦{product.price.toLocaleString('en-NG')}
                                        </p>
                                        <p className="text-[10px] font-bold text-stone-400">
                                            {views} {views === 1 ? 'view' : 'views'}
                                        </p>
                                    </div>
                                    <a
                                        href={`/product/${product.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-900 hover:text-white flex items-center justify-center text-stone-600 transition-colors"
                                        title="View in Boutique"
                                    >
                                        <ArrowRight size={13} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                        <Eye size={28} className="mx-auto text-stone-300 mb-2" />
                        <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                            No Catalog Views Recorded Yet
                        </p>
                        <p className="text-[11px] text-stone-400 mt-1 max-w-sm mx-auto">
                            Customer browsing activity on storefront product detail pages will automatically populate this rank list.
                        </p>
                    </div>
                )}
            </div>

            {/* Executive Privacy & Telemetry Footnote */}
            <div className="bg-stone-900 text-stone-300 p-5 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-stone-800 rounded-xl text-[#C5A059] flex-shrink-0">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">
                            Privacy-First Telemetry &amp; Consent Compliant
                        </p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                            Analytics are collected in accordance with store privacy consent preferences. Client-side identity cookies are anonymized before transmission to Google Analytics 4.
                        </p>
                    </div>
                </div>
                <div className="flex-shrink-0 text-[10px] font-mono text-stone-400 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700/60">
                    STATUS: SECURE &bull; TLS 1.3
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
