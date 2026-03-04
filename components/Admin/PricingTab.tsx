import React, { useMemo } from 'react';
import { Product, Order } from '../../types';
import { calculateInventoryVelocity } from '../../services/analyticsUtils';
import { TrendingUp, TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react';

interface PricingTabProps {
    products: Product[];
    orders: Order[];
    onUpdatePrice: (productId: string, newPrice: number) => void;
}

const PricingTab: React.FC<PricingTabProps> = ({ products, orders, onUpdatePrice }) => {

    const recommendations = useMemo(() => {
        const velocityMap = calculateInventoryVelocity(orders);
        const recs: any[] = [];

        products.forEach(p => {
            const velocity = velocityMap.get(p.id) || 0;
            const stock = p.stock;

            if (stock <= 0) return; // Skip sold out

            // Logic for Price Increase (Scarcity)
            // High demand (e.g. > 0.5 units/day) and low stock (< 10)
            if (velocity > 0.5 && stock < 10) {
                recs.push({
                    product: p,
                    type: 'INCREASE',
                    reason: 'High Demand & Low Stock',
                    suggestedPrice: p.price * 1.10, // +10%
                    icon: TrendingUp,
                    color: 'text-green-600 bg-green-50'
                });
            }
            // Logic for Discount (Liquidation)
            // Low demand (< 0.1 units/day) and high stock (> 20) and created > 30 days ago (simplified check)
            else if (velocity < 0.1 && stock > 20) {
                recs.push({
                    product: p,
                    type: 'DECREASE',
                    reason: 'Low Velocity & High Stock',
                    suggestedPrice: p.price * 0.90, // -10%
                    icon: TrendingDown,
                    color: 'text-red-600 bg-red-50'
                });
            }
        });

        return recs;
    }, [products, orders]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-stone-900">Pricing Intelligence</h2>
                    <p className="text-xs text-stone-400 mt-2 uppercase tracking-widest">
                        AI-Driven Price Optimization
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {recommendations.length === 0 ? (
                    <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-100">
                        <p className="text-stone-400 font-serif italic">No pricing adjustments recommended at this time.</p>
                    </div>
                ) : (
                    recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${rec.color}`}>
                                    <rec.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-stone-900">{rec.product.name}</h3>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-1">{rec.reason}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="text-xs text-stone-500">
                                            Current: <span className="font-bold text-stone-900">₦{rec.product.price.toLocaleString()}</span>
                                        </div>
                                        <ArrowRight size={12} className="text-stone-300" />
                                        <div className="text-xs text-[#C5A059]">
                                            Suggested: <span className="font-black">₦{rec.suggestedPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (confirm(`Update price of ${rec.product.name} to ₦${rec.suggestedPrice.toLocaleString()}?`)) {
                                        onUpdatePrice(rec.product.id, rec.suggestedPrice);
                                    }
                                }}
                                className="px-6 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-stone-800 transition-colors shadow-lg"
                            >
                                Apply Change
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PricingTab;
