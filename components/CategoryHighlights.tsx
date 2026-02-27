
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
    {
        id: 'men',
        title: 'Men',
        subtitle: 'Step Into Statement Style',
        image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=2148&auto=format&fit=crop', // Men's fashion
        link: '/?tag=men'
    },
    {
        id: 'women',
        title: 'Women',
        subtitle: 'Style That Speaks',
        image: 'https://images.unsplash.com/photo-1548624150-1f062a842f4c?q=80&w=2148&auto=format&fit=crop', // Women's fashion
        link: '/?tag=women'
    },
    {
        id: 'slides',
        title: 'Slides',
        subtitle: 'Comfort In Motion',
        image: 'https://images.unsplash.com/photo-1603487742187-56e6d5e184aa?q=80&w=2070&auto=format&fit=crop', // Slides/Sandals
        link: '/?category=slides'
    }
];

const CategoryHighlights: React.FC = () => {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {CATEGORIES.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            className="group cursor-pointer"
                        >
                            <Link to={category.link} className="block">
                                <div className="relative overflow-hidden rounded-sm mb-6 aspect-[4/5] md:aspect-[3/4] lg:aspect-square">
                                    <img
                                        src={category.image}
                                        alt={category.title}
                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                                </div>

                                <div className="space-y-2 text-center">
                                    <h3 className="text-2xl font-bold text-stone-900">{category.title}</h3>
                                    <p className="text-stone-500 font-light">{category.subtitle}</p>
                                    <div className="flex items-center justify-center text-xs font-bold uppercase tracking-widest text-stone-900 mt-4 group-hover:text-[#C5A059] transition-colors">
                                        Shop Now
                                        <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryHighlights;
