
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
    data: { date: string; sales: number }[];
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-6">Daily Revenue (Last 7 Days)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} dy={10} />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#A8A29E' }}
                            tickFormatter={(val) => `N${(val / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            cursor={{ fill: '#F5F5F4' }}
                            contentStyle={{ backgroundColor: '#1C1917', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                            formatter={(val: number) => [`N${val.toLocaleString()}`, 'Sales']}
                        />
                        <Bar dataKey="sales" fill="#C5A059" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
