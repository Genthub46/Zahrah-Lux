import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProfitChartProps {
    data: { date: string; revenue: number; cost: number; profit: number }[];
}

const ProfitChart: React.FC<ProfitChartProps> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-6">Profitability Analysis (Last 7 Days)</h3>
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
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            formatter={(val: number, name: string) => [`N${val.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />
                        <Bar dataKey="revenue" name="Revenue" fill="#C5A059" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="cost" name="Cost" fill="#A8A29E" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="profit" name="Gross Profit" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProfitChart;
