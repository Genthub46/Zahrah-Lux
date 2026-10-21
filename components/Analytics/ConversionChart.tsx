
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, ShoppingBag, ArrowUpRight } from 'lucide-react';

interface ConversionChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#E7E5E4', '#C5A059'];

const ConversionChart: React.FC<ConversionChartProps> = ({ data }) => {
    const views = data.find(d => d.name === 'Product Views')?.value || 0;
    const orders = data.find(d => d.name === 'Purchases')?.value || 0;
    const conversionRate = views > 0 ? ((orders / views) * 100).toFixed(2) : '0.00';

    return (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xs font-black text-stone-900 uppercase tracking-[0.2em]">
                            Engagement vs. Conversion
                        </h3>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                            Catalog Product Views to Completed Checkouts
                        </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/30 px-3 py-1 rounded-full">
                        {conversionRate}% Rate
                    </span>
                </div>

                <div className="h-48 w-full relative my-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={6}
                                dataKey="value"
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="#ffffff"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1C1917',
                                    border: '1px solid #292524',
                                    borderRadius: '16px',
                                    padding: '10px 14px',
                                    color: '#fff',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                }}
                                formatter={(val: number) => [`${Number(val).toLocaleString()} interactions`, '']}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">CR</span>
                        <span className="text-xl font-black text-stone-900">{conversionRate}%</span>
                    </div>
                </div>
            </div>

            {/* Micro Breakdown Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
                <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Product Views</p>
                        <p className="text-base font-black text-stone-800">{views.toLocaleString()}</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-stone-200/60 flex items-center justify-center text-stone-600">
                        <Eye size={14} />
                    </div>
                </div>

                <div className="bg-[#C5A059]/10 p-3.5 rounded-2xl border border-[#C5A059]/20 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-[#8C6D2C] uppercase tracking-wider">Orders Placed</p>
                        <p className="text-base font-black text-[#5C4517]">{orders.toLocaleString()}</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-[#C5A059] flex items-center justify-center text-white shadow-sm">
                        <ShoppingBag size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversionChart;

