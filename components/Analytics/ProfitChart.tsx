import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProfitChartProps {
    data: { date: string; revenue: number; cost: number; profit: number }[];
    days?: number;
}

const ProfitChart: React.FC<ProfitChartProps> = ({ data, days = 7 }) => {
    const hasData = data.some(d => d.revenue > 0 || d.cost > 0 || d.profit > 0);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                    <h3 className="text-xs font-black text-stone-900 uppercase tracking-[0.2em]">
                        Profitability Analysis
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                        Revenue vs. Cost vs. Gross Profit (Last {days} Days)
                    </p>
                </div>
                {!hasData && (
                    <span className="self-start sm:self-auto text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        Awaiting Live Orders
                    </span>
                )}
            </div>

            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F4" />
                        <XAxis
                            dataKey="date"
                            axisLine={{ stroke: '#E7E5E4' }}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#78716C', fontWeight: 600 }}
                            dy={8}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#78716C', fontWeight: 600 }}
                            tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            cursor={{ fill: '#FAFAF9' }}
                            contentStyle={{
                                backgroundColor: '#1C1917',
                                border: '1px solid #292524',
                                borderRadius: '16px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                                padding: '12px 16px',
                                color: '#fff'
                            }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            formatter={(val: number, name: string) => [
                                `₦${Number(val || 0).toLocaleString('en-NG')}`,
                                name.charAt(0).toUpperCase() + name.slice(1)
                            ]}
                        />
                        <Legend
                            wrapperStyle={{
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                paddingTop: '16px'
                            }}
                        />
                        <Bar dataKey="revenue" name="Revenue" fill="#C5A059" radius={[6, 6, 0, 0]} barSize={16} />
                        <Bar dataKey="cost" name="Cost" fill="#A8A29E" radius={[6, 6, 0, 0]} barSize={16} />
                        <Bar dataKey="profit" name="Gross Profit" fill="#10B981" radius={[6, 6, 0, 0]} barSize={16} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProfitChart;

