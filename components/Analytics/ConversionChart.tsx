
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ConversionChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#E7E5E4', '#C5A059'];

const ConversionChart: React.FC<ConversionChartProps> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-6">Engagement vs. Conversion</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1C1917', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ConversionChart;
