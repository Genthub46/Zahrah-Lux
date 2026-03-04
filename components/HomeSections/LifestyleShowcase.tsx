
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface LifestyleShowcaseProps {
    images?: [string, string];
}

const LifestyleShowcase: React.FC<LifestyleShowcaseProps> = ({ images }) => {
    const image1 = images?.[0] || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop";
    const image2 = images?.[1] || "https://images.unsplash.com/photo-1549439602-43ebca23d7bc?q=80&w=2070&auto=format&fit=crop";

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 w-full">
            {/* Left Column: Jewelry/Accessories Focus */}
            <div className="relative h-[60vh] md:h-[85vh] group overflow-hidden cursor-pointer">
                <img
                    src={image1} // Jewelry/Necklace close-up
                    alt="Luxury Accessories"
                    className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                <div className="absolute bottom-10 right-10 md:bottom-16 md:right-16 z-10">
                    <Link to="/?tag=accessories" className="text-white text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:text-[#C5A059] transition-colors group-hover:gap-5 transition-all duration-300">
                        Shop Now
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Right Column: Streetwear Model Focus */}
            <div className="relative h-[60vh] md:h-[85vh] group overflow-hidden cursor-pointer">
                <img
                    src={image2} // Streetwear/Urban model
                    alt="Urban Collection"
                    className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                <div className="absolute bottom-10 right-10 md:bottom-16 md:right-16 z-10">
                    <Link to="/?tag=streetwear" className="text-white text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:text-[#C5A059] transition-colors group-hover:gap-5 transition-all duration-300">
                        Shop Now
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LifestyleShowcase;
