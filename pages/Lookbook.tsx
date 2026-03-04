import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToLayout, subscribeToProducts } from '../services/dbUtils';
import { HomeLayoutConfig, Product } from '../types';
import { ArrowUpRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Lookbook = () => {
    const [layoutConfig, setLayoutConfig] = useState<HomeLayoutConfig | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubLayout = subscribeToLayout((data) => {
            if (data) setLayoutConfig(data);
        });
        const unsubProducts = subscribeToProducts((data) => {
            if (data) setProducts(data);
        });
        return () => {
            unsubLayout();
            unsubProducts();
        };
    }, []);

    const looks = layoutConfig?.stylingLooks || [];

    return (
        <div className="pt-32 pb-20 min-h-screen bg-stone-50">
            <div className="max-w-[1800px] mx-auto px-6">
                <Link
                    to="/"
                    className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors mb-12 group"
                >
                    <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                    <span>Back to Boutique</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="text-[#C5A059] font-bold text-xs uppercase tracking-[0.4em] block mb-4">
                        The Collection
                    </span>
                    <h1 className="text-5xl md:text-8xl font-serif text-stone-900 mb-8">
                        The Lookbook
                    </h1>
                    <p className="text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
                        Explore our complete curation of styled looks. Each ensemble is remarkably crafted to define modern luxury.
                    </p>
                </motion.div>

                {looks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {looks.map((look, idx) => {
                            const lookProducts = look.productIds
                                ? look.productIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p)
                                : products.filter(p => look.productIds.includes(p.id));

                            return (
                                <motion.div
                                    key={look.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700 bg-stone-100"
                                >
                                    {/* Main Look Image (Fades out on hover) */}
                                    <img
                                        src={look.image}
                                        alt={look.title}
                                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-20 group-hover:blur-sm grayscale group-hover:grayscale-0"
                                    />

                                    {/* Title Overlay (Fades out on hover) */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
                                    <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 group-hover:translate-y-full transition-transform duration-500 opacity-100 group-hover:opacity-0">
                                        <p className="text-[#C5A059] text-xs font-bold uppercase tracking-widest mb-2">Look 0{idx + 1}</p>
                                        <div className="flex justify-between items-end">
                                            <h3 className="text-3xl text-white font-serif italic">{look.title}</h3>
                                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                                                <ArrowUpRight size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products Overlay (Reveals on hover) */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 overflow-y-auto no-scrollbar">
                                        <h4 className="text-stone-900 font-serif text-2xl italic mb-6">Shop The Look</h4>
                                        <div className="grid grid-cols-2 gap-3 w-full">
                                            {lookProducts.length > 0 ? lookProducts.map(product => (
                                                <Link to={`/product/${product.id}`} key={product.id} className="bg-white p-2 rounded-xl shadow-sm border border-stone-100 hover:border-[#C5A059] transition-all group/item block transform hover:-translate-y-1">
                                                    <div className="aspect-[3/4] bg-stone-50 rounded-lg mb-2 overflow-hidden relative">
                                                        <img src={product.images[0]} className="w-full h-full object-cover mix-blend-multiply" alt={product.name} />
                                                    </div>
                                                    <p className="text-[9px] uppercase font-bold text-stone-900 truncate">{product.name}</p>
                                                    <p className="text-[9px] text-[#C5A059] font-bold">₦{product.price.toLocaleString()}</p>
                                                </Link>
                                            )) : (
                                                <div className="col-span-2 text-center text-stone-400 text-xs italic py-10">
                                                    No products linked to this look.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="aspect-[3/4] bg-stone-200 relative group overflow-hidden animate-pulse rounded-[2rem]">
                                <div className="absolute inset-0 flex items-center justify-center text-stone-400 font-serif italic text-2xl">
                                    Loading Ensembles...
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lookbook;
