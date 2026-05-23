import React from 'react';
import { Order } from '../types';
import Logo from './Logo';

interface ReceiptTemplateProps {
    order: Order;
    userEmail: string;
}

const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ order, userEmail }) => {
    return (
        <div 
            id={`premium-receipt-${order.id}`}
            className="absolute top-[-10000px] left-[-10000px] bg-[#FAF9F6] text-stone-900"
            style={{ 
                width: '800px', 
                minHeight: '1000px',
                padding: '60px',
                // Deckled edge simulation + texture
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                border: '1px solid #EAE6DF',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`
            }}
        >
            {/* Embossed Watermark Logo */}
            <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]"
                style={{
                    filter: 'drop-shadow(2px 2px 0px rgba(255,255,255,1)) drop-shadow(-1px -1px 0px rgba(0,0,0,0.2))'
                }}
            >
                <div className="w-[500px] h-[500px]">
                    <Logo size="100%" />
                </div>
            </div>

            <div className="relative z-10">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-16">
                    <div className="flex items-center gap-6">
                        {/* Rich Gold Plate Logo Box */}
                        <div 
                            className="w-24 h-24 bg-stone-950 flex items-center justify-center shadow-lg relative"
                            style={{
                                border: '2px solid #C5A059',
                                outline: '1px solid #8C6E33',
                                outlineOffset: '2px',
                                boxShadow: 'inset 0 0 20px rgba(197,160,89,0.1)'
                            }}
                        >
                            <div className="w-16 h-16 relative z-10">
                                <Logo size="100%" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl font-serif text-[#C5A059] tracking-widest mb-1 uppercase font-bold">Zarhrah Luxury Collections</h1>
                            <p className="text-xs text-stone-500 font-light tracking-wider">alerts@zarhrahluxurycollections.com</p>
                            <p className="text-xs text-stone-500 font-light tracking-wider">Lagos, Nigeria</p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <h2 className="text-4xl font-light tracking-widest text-stone-800 mb-4">INVOICE</h2>
                        <div className="space-y-1">
                            <p className="text-xs text-stone-500 tracking-wider">
                                <span className="mr-2">Reference:</span> 
                                <span className="text-stone-700">{order.id}</span>
                            </p>
                            <p className="text-xs text-stone-500 tracking-wider">
                                <span className="mr-2">Date:</span> 
                                <span className="text-stone-700">{new Date(order.date).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bill To Section */}
                <div className="mb-12">
                    <h3 className="text-[10px] font-bold text-stone-400 tracking-[0.2em] uppercase mb-4 border-b border-stone-200 pb-2 inline-block">Bill To</h3>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-stone-800 tracking-wide">{userEmail.split('@')[0]}</p>
                        <p className="text-xs text-stone-500 font-light">{userEmail}</p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-12">
                    <div className="grid grid-cols-12 gap-4 border-b-2 border-stone-800 pb-3 mb-4">
                        <div className="col-span-6 text-[10px] font-bold text-stone-900 tracking-[0.2em] uppercase">Item Description</div>
                        <div className="col-span-2 text-center text-[10px] font-bold text-stone-900 tracking-[0.2em] uppercase">Qty</div>
                        <div className="col-span-2 text-right text-[10px] font-bold text-stone-900 tracking-[0.2em] uppercase">Price</div>
                        <div className="col-span-2 text-right text-[10px] font-bold text-stone-900 tracking-[0.2em] uppercase">Total</div>
                    </div>

                    <div className="space-y-6">
                        {order.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-center border-b border-stone-100 pb-6">
                                <div className="col-span-6 flex gap-4 items-center">
                                    <div className="w-12 h-16 bg-stone-100 flex-shrink-0">
                                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-stone-800 uppercase tracking-widest mb-1">{item.name}</p>
                                        <div className="text-[10px] text-stone-500 uppercase tracking-widest">
                                            {item.selectedColor && <span className="mr-3">Color: {item.selectedColor}</span>}
                                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 text-center text-xs font-medium text-stone-700">
                                    {item.quantity}
                                </div>
                                <div className="col-span-2 text-right text-xs font-medium text-stone-700">
                                    N{item.price.toLocaleString()}
                                </div>
                                <div className="col-span-2 text-right text-xs font-bold text-stone-900">
                                    N{(item.price * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-xs tracking-widest text-stone-500">
                            <span>SUBTOTAL</span>
                            <span className="text-stone-800 font-medium">N{order.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs tracking-widest text-stone-500">
                            <span>LOGISTICS</span>
                            <span className="text-stone-800 font-medium">Included</span>
                        </div>
                        <div className="pt-4 border-t border-stone-200 mt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold tracking-[0.2em] text-stone-900">GRAND TOTAL</span>
                                <span className="text-lg font-bold text-[#C5A059]">N{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Footer Notes */}
                <div className="mt-24 text-center border-t border-stone-200 pt-8">
                    <p className="text-[10px] font-serif italic text-stone-500 tracking-widest">Thank you for your exquisite taste.</p>
                </div>
            </div>
        </div>
    );
};

export default ReceiptTemplate;
