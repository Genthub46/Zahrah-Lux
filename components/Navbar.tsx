
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, Shield, ChevronDown, LogOut, ChevronRight, Heart, User as UserIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { ADMIN_EMAILS } from '../constants';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, wishlistCount, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith('/admin');
  const isAdminUser = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== isScrolled) setIsScrolled(scrolled);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBrandsOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const navigateToFilter = (type: 'brand' | 'category' | 'tag', value: string) => {
    setIsBrandsOpen(false);
    setIsOpen(false);
    navigate(`/?${type}=${value.toLowerCase()}`);
    setTimeout(() => {
      const productsEl = document.getElementById('bundles') || document.getElementById('catalog');
      productsEl?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItemClasses = (isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white') + ' text-[9px] font-bold tracking-[0.4em] transition-all uppercase hover:gold-text flex items-center cursor-pointer';

  // Logic for solid background on product pages when scrolled
  const backgroundClass = (isScrolled || isAdmin || location.pathname === '/login' || location.pathname === '/signup')
    ? 'bg-white shadow-md py-3'
    : 'bg-transparent py-8';

  // Helper to force dark text on white background pages
  const isDarkText = isScrolled || isAdmin || location.pathname !== '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[10000] transition-all duration-500 ${backgroundClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group">
              <Logo size={isScrolled || isAdmin ? 40 : 65} className="transition-all duration-500 group-hover:scale-105" />
              <div className="ml-3 flex flex-col justify-center leading-none">
                <span className={`text-sm font-bold tracking-[0.3em] transition-colors duration-500 ${isDarkText ? 'text-stone-900' : 'text-white'}`}>ZARHRAH</span>
                <span className="text-[10px] gold-text font-bold tracking-[0.2em] opacity-80 uppercase">London • Lagos</span>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-12">
            {!isAdmin && (
              <>
                <Link to="/" className={navItemClasses}>Home</Link>
                <div className="relative" ref={dropdownRef}>
                  <button onMouseEnter={() => setIsBrandsOpen(true)} onClick={() => setIsBrandsOpen(!isBrandsOpen)} className={navItemClasses}>
                    <span>Categories</span>
                    <ChevronDown size={10} className={`ml-2 transition-transform duration-300 ${isBrandsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isBrandsOpen && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onMouseLeave={() => setIsBrandsOpen(false)} className="absolute top-full left-0 mt-4 w-56 bg-white border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden py-4 z-[9999]">
                        {[
                          { label: 'Shirts', type: 'category', value: 'Shirts' },
                          { label: 'Apparels', type: 'category', value: 'Apparel' },
                          { label: 'Pants', type: 'category', value: 'Pants' },
                          { label: 'Accessories', type: 'category', value: 'Accessories' }
                        ].map((item) => (
                          <button key={item.label} onClick={() => navigateToFilter(item.type as any, item.value)} className="w-full text-left px-8 py-4 text-[9px] font-bold tracking-[0.3em] uppercase text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all border-l-2 border-transparent hover:border-[#C5A059] cursor-pointer">{item.label}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <a href="#accessories" onClick={(e) => handleNavClick(e, 'catalog')} className={navItemClasses}>Boutique</a>
                <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className={navItemClasses}>Contact</a>
              </>
            )}

            {isAdmin && (
              <div className="flex items-center space-x-12">
                <Link to="/" className={navItemClasses}>Public Boutique</Link>
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#C5A059]">Admin Control</span>
              </div>
            )}

            <div className={`h-4 w-px bg-stone-200 mx-2 ${!isDarkText ? 'opacity-20' : ''}`} />

            {!isAdmin ? (
              <div className="flex items-center space-x-8">
                <Link to="/wishlist" className="relative group p-2 cursor-pointer">
                  <Heart className={`w-5 h-5 transition-colors duration-500 ${isDarkText ? 'text-stone-900' : 'text-white'} group-hover:text-red-500`} />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg scale-110">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link to="/checkout" className="relative group p-2 cursor-pointer">
                  <ShoppingBag className={`w-5 h-5 transition-colors duration-500 ${isDarkText ? 'text-stone-900' : 'text-white'} group-hover:gold-text`} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 gold-bg text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg scale-110">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={accountDropdownRef}>
                  {!user ? (
                    <div className="flex items-center space-x-4">
                      <Link to="/login" className={`text-xs font-bold tracking-[0.2em] uppercase hover:gold-text ${isDarkText ? 'text-stone-900' : 'text-white'}`}>Log In</Link>
                      <Link to="/signup" className="text-xs font-bold tracking-[0.2em] uppercase bg-[#C5A059] text-white px-4 py-2 hover:bg-[#b08d4b] transition-colors">Sign Up</Link>
                    </div>
                  ) : (
                    <button onClick={() => setIsAccountOpen(!isAccountOpen)} className={`text-[9px] font-bold tracking-[0.2em] uppercase flex items-center hover:gold-text ${isDarkText ? 'text-stone-900' : 'text-white'}`}>
                      <UserIcon size={14} className="mr-2" />
                      {user.displayName || 'Account'}
                    </button>
                  )}

                  <AnimatePresence>
                    {isAccountOpen && user && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full right-0 mt-4 w-48 bg-white border border-stone-100 shadow-xl rounded-sm overflow-hidden py-2 z-[9999]">
                        <div className="px-6 py-3 border-b border-stone-50">
                          <p className="text-[10px] text-stone-900 font-bold">{user.displayName || (isAdminUser ? 'Admin' : 'Customer')}</p>
                          <p className="text-[9px] text-stone-400 truncate">{user.email}</p>
                        </div>
                        <button onClick={handleSignOut} className="w-full text-left px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center">
                          <LogOut size={12} className="mr-2" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="text-[9px] font-bold tracking-[0.4em] transition-all uppercase flex items-center text-red-400 hover:text-red-600"
              >
                <LogOut size={11} className="mr-2" /> Sign Out
              </button>
            )}
          </div>

          <div className="lg:hidden flex items-center space-x-6">
            {!isAdmin && (
              <div className="flex items-center space-x-4">
                <Link to="/wishlist" className="relative group cursor-pointer">
                  <Heart className={`w-6 h-6 ${isDarkText ? 'text-stone-900' : 'text-white'}`} />
                  {wishlistCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">{wishlistCount}</span>}
                </Link>
                <Link to="/checkout" className="relative group cursor-pointer">
                  <ShoppingBag className={`w-6 h-6 ${isDarkText ? 'text-stone-900' : 'text-white'}`} />
                  {cartCount > 0 && <span className="absolute -top-2 -right-2 gold-bg text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">{cartCount}</span>}
                </Link>
              </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className={`${isDarkText ? 'text-stone-900' : 'text-white'} cursor-pointer`}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[11000] lg:hidden bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto px-8 py-12"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                  <button onClick={() => setIsOpen(false)} className="p-2 -ml-2 text-stone-900 hover:text-[#C5A059] transition-colors rounded-full hover:bg-stone-50">
                    <X size={24} strokeWidth={1} />
                  </button>
                  <div className="text-center flex items-center justify-center">
                    <Logo size={40} className="mr-3" />
                    <div className="flex flex-col leading-none text-left">
                      <span className="text-sm font-black tracking-[0.3em] uppercase text-stone-900">ZARHRAH</span>
                      <span className="text-[10px] gold-text font-bold tracking-[0.2em] uppercase">London • Lagos</span>
                    </div>
                  </div>
                  <div className="w-8" />
                </div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.2
                      }
                    }
                  }}
                  className="flex flex-col space-y-8 px-4"
                >

                  {/* Main Navigation */}
                  <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="space-y-6 text-center">
                    <Link to="/" onClick={() => setIsOpen(false)} className="block text-xl font-bold tracking-[0.2em] uppercase text-stone-900 hover:text-[#C5A059] transition-colors">Home</Link>
                    <a href="#accessories" onClick={(e) => handleNavClick(e, 'catalog')} className="block text-xl font-bold tracking-[0.2em] uppercase text-stone-900 hover:text-[#C5A059] transition-colors">Boutique</a>
                  </motion.div>

                  {/* Categories - Drawer */}
                  {!isAdmin && (
                    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="border-t border-stone-100 pt-8">
                      <button
                        onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                        className="w-full flex items-center justify-center space-x-2 text-[10px] font-bold tracking-[0.3em] text-stone-400 uppercase mb-4 hover:text-stone-600 transition-colors group"
                      >
                        <span className="group-hover:tracking-[0.4em] transition-all duration-300">Collections</span>
                        <ChevronDown size={12} className={`transition-transform duration-300 ${isBrandsOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isBrandsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 flex flex-col items-center pb-6">
                              {[
                                { label: 'Shirts', type: 'category', value: 'Shirts' },
                                { label: 'Apparels', type: 'category', value: 'Apparel' },
                                { label: 'Pants', type: 'category', value: 'Pants' },
                                { label: 'Accessories', type: 'category', value: 'Accessories' }
                              ].map((item) => (
                                <button key={item.label} onClick={() => navigateToFilter(item.type as any, item.value)} className="text-sm font-serif text-stone-600 hover:text-stone-900 transition-colors">
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* User Section */}
                  <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="pt-8 border-t border-stone-100 flex flex-col items-center space-y-6">
                    {!user ? (
                      <div className="flex flex-col items-center space-y-4">
                        <Link to="/login" onClick={() => setIsOpen(false)} className="text-xs font-bold tracking-[0.2em] uppercase text-stone-900 hover:text-[#C5A059] transition-colors">Log In</Link>
                        <Link to="/signup" onClick={() => setIsOpen(false)} className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 hover:text-stone-900 transition-colors">Sign Up</Link>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-base font-serif text-stone-900 mb-1">Welcome, {user.displayName}</p>
                        <button onClick={() => { handleSignOut(); setIsOpen(false); }} className="text-[8px] font-bold tracking-[0.2em] uppercase text-red-400 hover:text-red-500 mt-2">
                          Sign Out
                        </button>
                      </div>
                    )}
                  </motion.div>

                  {/* Action Links */}
                  <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="pt-8 flex justify-center space-x-12">
                    <Link to="/wishlist" onClick={() => setIsOpen(false)} className="flex flex-col items-center text-stone-300 hover:text-stone-900 transition-colors group">
                      <Heart size={22} strokeWidth={1} className="group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-[8px] font-bold tracking-[0.2em] uppercase mt-3">Wishlist ({wishlistCount})</span>
                    </Link>
                    {!isAdmin && (
                      <Link to="/checkout" onClick={() => setIsOpen(false)} className="flex flex-col items-center text-stone-300 hover:text-[#C5A059] transition-colors group">
                        <ShoppingBag size={22} strokeWidth={1} className="group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-[8px] font-bold tracking-[0.2em] uppercase mt-3">Bag ({cartCount})</span>
                      </Link>
                    )}
                  </motion.div>

                  {/* Admin Link (Subtle) */}
                  <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="pt-4 text-center">
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="text-[7px] font-bold tracking-[0.2em] uppercase text-stone-200 hover:text-stone-400 transition-colors">
                      Admin Portal
                    </Link>
                  </motion.div>

                </motion.div>

                <div className="mt-auto pb-8">
                  <p className="text-[10px] text-stone-300 font-bold tracking-[0.4em] uppercase text-center">London • Lagos</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
