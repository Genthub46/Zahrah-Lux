import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Database, Lock, Scale, Users, Mail } from 'lucide-react';
import Logo from '../components/Logo';

const SECTIONS = [
    {
        id: "information-we-collect",
        icon: Database,
        title: "1. Information We Collect",
        content: (
            <>
                <p className="mb-4">We collect information to provide better services to you. This includes:</p>
                <ul className="space-y-3">
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Identity Data:</strong> Name, gender, and date of birth (to ensure you are 18+). <strong>We do not knowingly collect data from anyone under the age of 18.</strong></span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Contact Data:</strong> Delivery address, email address, and phone number.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Transaction Data:</strong> Details about products you’ve purchased and payments made to us.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Technical Data:</strong> IP address, browser type, and location data collected via cookies.</span></li>
                </ul>
            </>
        )
    },
    {
        id: "how-we-use",
        icon: ShieldCheck,
        title: "2. How We Use Your Data",
        content: (
            <>
                <p className="mb-4">We only process your data when we have a legal basis to do so:</p>
                <ul className="space-y-3">
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>To Fulfill Orders (Contract):</strong> We use your contact and delivery details to process and ship your luxury items.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Marketing (Consent):</strong> If you opt-in, we send updates about new arrivals or sales. You can unsubscribe at any time.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Security (Legitimate Interest):</strong> To detect and prevent fraud on our platform.</span></li>
                </ul>
            </>
        )
    },
    {
        id: "security-storage",
        icon: Lock,
        title: "3. Data Security, Storage & Transfers",
        content: (
            <>
                <p className="mb-4">We implement robust technical measures to protect your data:</p>
                <ul className="space-y-3">
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Encryption & Hashing:</strong> We use TLS/SSL to secure data in transit, and passwords are comprehensively encrypted.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Payments:</strong> We do not store credit card details. All payments are processed via secure, PCI-DSS compliant gateways like Paystack/Flutterwave.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>International Transfers:</strong> Some of our IT service providers are hosted internationally. When your data is transferred outside Nigeria, we ensure it receives a similar degree of protection by ensuring these providers comply with NDPA standards.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Data Retention:</strong> We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.</span></li>
                </ul>
            </>
        )
    },
    {
        id: "legal-rights",
        icon: Scale,
        title: "4. Your Legal Rights",
        content: (
            <>
                <p className="mb-4">Under the NDPA 2023, you have the right to:</p>
                <ul className="space-y-3">
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Access:</strong> Request a copy of the personal data we hold about you.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Correction:</strong> Ask us to update or fix inaccurate information.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Erasure:</strong> (The Right to be Forgotten) Request that we delete your data.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Withdraw Consent:</strong> Stop us from sending you marketing emails.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Lodge a Complaint:</strong> You have the right to make a complaint at any time to the Nigeria Data Protection Commission (NDPC). However, we would appreciate the chance to deal with your concerns before you approach the NDPC.</span></li>
                </ul>
            </>
        )
    },
    {
        id: "third-party",
        icon: Users,
        title: "5. Third-Party Sharing",
        content: (
            <>
                <p className="mb-4">We do not sell your data. We only share it with trusted partners necessary to run our boutique, such as:</p>
                <ul className="space-y-3">
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Logistics Partners:</strong> To deliver your orders.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>IT Service Providers:</strong> To maintain our website and hosting infrastructure.</span></li>
                    <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] mt-2 shrink-0" /><span><strong>Legal Authorities:</strong> Only when required by Nigerian law.</span></li>
                </ul>
            </>
        )
    },
    {
        id: "contact",
        icon: Mail,
        title: "6. Contact Us",
        content: (
            <>
                <p className="mb-4">For any privacy-related inquiries or to exercise your rights, please contact our Data Protection lead at:</p>
                <div className="bg-stone-50 p-6 rounded-lg border border-stone-100 mt-6">
                    <ul className="space-y-4">
                        <li className="flex items-center gap-4 text-stone-900 font-medium">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-100">
                                <Mail size={16} className="text-[#C5A059]" />
                            </div>
                            admin@zahrah.com
                        </li>
                        <li className="flex items-center gap-4 text-stone-900 font-medium">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-100">
                                <span className="text-[#C5A059] text-xs font-bold uppercase">HQ</span>
                            </div>
                            <div className="flex flex-col">
                                <span>David Wej Mall 42 Admiralty Road, Admiralty Way</span>
                                <span>Lekki Phase 1, 105102, Lagos, Eti-Osa Nigeria</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </>
        )
    }
];

const PrivacyPolicy: React.FC = () => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

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
                    className="mb-24 text-center md:text-left relative"
                >
                    <div className="absolute top-0 left-0 w-16 h-1 bg-[#C5A059] mb-8 hidden md:block" />
                    <span className="block text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-6 md:mt-12">
                        Legal & Compliance
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-stone-900 mb-8 leading-tight tracking-wide font-light">
                        Privacy Policy
                    </h1>
                    <div className="flex flex-col md:flex-row gap-4 md:items-center text-stone-500 text-xs uppercase tracking-widest font-medium">
                        <span className="flex items-center gap-2 justify-center md:justify-start">
                            <span>Effective Date</span>
                            <span className="w-1 h-1 rounded-full bg-stone-300" />
                            <span className="text-stone-900 font-bold">February 24, 2026</span>
                        </span>
                    </div>

                    <p className="mt-12 text-lg md:text-xl text-stone-500 font-light leading-relaxed max-w-3xl">
                        At <strong className="font-serif italic text-stone-900 text-2xl font-normal">Zahrah Boutique</strong>, we value your privacy and are committed to protecting your personal data in accordance with the laws of the Federal Republic of Nigeria, including the Nigeria Data Protection Act (NDPA) 2023. This policy outlines how we collect, use, and safeguard your information.
                    </p>
                </motion.div>

                {/* Policy Content Sections */}
                <div className="space-y-12 md:space-y-16">
                    {SECTIONS.map((section, idx) => (
                        <motion.section
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            className="bg-white p-8 md:p-12 border border-stone-100 shadow-sm hover:shadow-md transition-shadow duration-500 rounded-sm relative group overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-stone-100 group-hover:bg-[#C5A059] transition-colors duration-500" />

                            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                                <div className="shrink-0">
                                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-[#C5A059] border border-stone-100 group-hover:scale-110 transition-transform duration-500">
                                        <section.icon size={24} strokeWidth={1.5} />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-2xl font-serif text-stone-900 mb-6 tracking-wide">
                                        {section.title}
                                    </h3>
                                    <div className="text-stone-500 font-light leading-relaxed text-[15px] space-y-4">
                                        {section.content}
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    ))}
                </div>

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

export default PrivacyPolicy;
