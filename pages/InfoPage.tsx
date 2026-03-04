
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FooterPage } from '../types';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Building2, HelpCircle, Package, Receipt, Users } from 'lucide-react';
import Logo from '../components/Logo';

// Map categories to appropriate icons
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Policies':
      return ShieldCheck;
    case 'Company':
      return Building2;
    case 'Customer Services':
      return HelpCircle;
    case 'Categories': // If someone clicks a random tag page, though those are handled differently
      return Package;
    default:
      return Receipt;
  }
};

interface InfoPageProps {
  footerPages: FooterPage[];
}

const InfoPage: React.FC<InfoPageProps> = ({ footerPages }) => {
  const { slug } = useParams();
  const page = footerPages.find(p => p.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!page) {
    return (
      <div className="pt-48 pb-32 px-8 flex flex-col items-center justify-center text-center">
        <Logo size={80} className="opacity-10 mb-8" />
        <h1 className="text-3xl font-bold serif italic">Artifact Not Found</h1>
        <p className="text-stone-400 mt-4 max-w-md mx-auto">The boutique page you are looking for does not exist or has been archived.</p>
        <Link to="/" className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059] border-b border-[#C5A059] pb-2">Return to Boutique</Link>
      </div>
    );
  }

  const PageIcon = getCategoryIcon(page.category);

  return (
    <div className="pt-32 md:pt-48 pb-32 bg-[#FCFCFC] min-h-screen">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <Link
          to="/"
          className="inline-flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 hover:text-stone-900 transition-colors mb-16 md:mb-24 group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-2" />
          <span>Exit Document</span>
        </Link>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-24 text-center md:text-left relative"
        >
          <div className="absolute top-0 left-0 w-16 h-1 bg-[#C5A059] mb-8 hidden md:block" />
          <span className="block text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-6 md:mt-12">
            {page.category}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-stone-900 mb-8 leading-tight tracking-wide font-light">
            {page.title}
          </h1>
        </motion.div>

        {/* Dynamic Content Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-8 md:p-12 border border-stone-100 shadow-sm rounded-sm relative group overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-[#C5A059]/20" />

          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <div className="shrink-0 hidden md:block">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-[#C5A059] border border-stone-100">
                <PageIcon size={24} strokeWidth={1.5} />
              </div>
            </div>

            <div className="flex-1 w-full overflow-hidden">
              {/* Using the same typography treatment as PrivacyPolicy */}
              <div className="prose prose-stone max-w-none 
                  prose-p:text-stone-500 prose-p:leading-relaxed prose-p:font-light 
                  prose-h3:font-serif prose-h3:text-2xl prose-h3:text-stone-800 prose-h3:mt-8 prose-h3:mb-4
                  prose-ul:text-stone-500 prose-ul:font-light 
                  prose-li:marker:text-[#C5A059] prose-li:my-2
                  prose-strong:font-medium prose-strong:text-stone-700
                  prose-a:text-[#C5A059] prose-a:no-underline hover:prose-a:underline whitespace-pre-wrap">
                {page.content}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer Mark */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-32 pb-16 mt-32 border-t border-stone-200"
        >
          <div className="flex flex-col items-center space-y-8">
            <Logo size={80} className="text-stone-200" />
            <div className="flex items-center gap-4 text-[9px] text-stone-400 font-bold uppercase tracking-[0.5em] text-center">
              <span>Zarhrah Luxury</span>
              <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
              <span>Official Documentation</span>
            </div>
            <p className="text-xs text-stone-400 font-serif italic">London • Lagos</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InfoPage;
