
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
    data: { date: string; sales: number }[];
    days?: number;
}

const SalesChart: React.FC<SalesChartProps> = ({ data, days = 7 }) => {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                    <h3 className="text-xs font-black text-stone-900 uppercase tracking-[0.2em]">
                        Daily Revenue
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                        Gross Volume Trends (Last {days} Days)
                    </p>
                </div>
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
                            formatter={(val: number) => [`₦${Number(val || 0).toLocaleString('en-NG')}`, 'Revenue']}
                        />
                        <Bar dataKey="sales" fill="#C5A059" radius={[6, 6, 0, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;

