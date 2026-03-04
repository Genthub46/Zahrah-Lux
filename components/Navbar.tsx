
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, Heart, User as UserIcon, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { subscribeToBrands, subscribeToCategories } from '../services/dbUtils';
import { ADMIN_EMAILS } from '../constants';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  user: User | null;
}

const MENU_HIERARCHY = {
  Men: [
    { label: 'All', path: '/' },
    {
      label: 'Clothing',
      subItems: [
        { label: 'T-shirts', path: '/?tag=men&category=t-shirts' },
        { label: 'Shirts', path: '/?tag=men&category=shirts' },
        { label: 'Boxers', path: '/?tag=men&category=boxers' },
        { label: 'Shorts', path: '/?tag=men&category=shorts' },
        { label: 'Jackets', path: '/?tag=men&category=jackets' },
        { label: 'Underwear', path: '/?tag=men&category=underwear' },
        { label: 'Chinos', path: '/?tag=men&category=chinos' },
        { label: 'Pant', path: '/?tag=men&category=pant' },
        { label: 'Trousers', path: '/?tag=men&category=trousers' },
        { label: 'Jeans', path: '/?tag=men&category=jeans' },
        { label: 'Two Piece', path: '/?tag=men&category=two-piece' },
      ]
    },
    { label: 'Jerseys', path: '/?tag=men&category=jerseys' },
    {
      label: 'Accessories',
      subItems: [
        { label: 'Belts', path: '/?tag=men&category=belts' },
        { label: 'Headwears', path: '/?tag=men&category=headwears' },
        { label: 'Sunglasses', path: '/?tag=men&category=sunglasses' },
      ]
    }
  ],
  Women: [
    { label: 'All', path: '/' },
    { label: 'Dress', path: '/?tag=women&category=dress' },
    { label: 'Top', path: '/?tag=women&category=top' },
    { label: 'Gown', path: '/?tag=women&category=gown' },
    { label: 'Trouser', path: '/?tag=women&category=trouser' },
  ],
  Collections: [
    { label: 'Zara', path: '/?brand=zara' },
    { label: 'Boohooman', path: '/?brand=boohooman' },
    { label: 'Pull & Bear', path: '/?brand=pull-bear' },
    { label: 'Bershka', path: '/?brand=bershka' },
  ]
};

const Navbar: React.FC<NavbarProps> = ({ cartCount, wishlistCount, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith('/admin');
  const isAdminUser = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubBrands = subscribeToBrands((data) => {
      setBrands(data.sort((a, b) => a.name.localeCompare(b.name)));
    });
    const unsubCats = subscribeToCategories((data) => {
      setCategories(data.sort((a, b) => a.name.localeCompare(b.name)));
    });
    return () => {
      unsubBrands();
      unsubCats();
    };
  }, []);



  useEffect(() => {
    // Close menus on route change
    setIsOpen(false);
    setActiveMenu(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleLinkClick = (path: string) => {
    navigate(path);
    setActiveMenu(null);
    setIsOpen(false);
  };

  const isDarkText = isScrolled || isAdmin || location.pathname !== '/';
  const bgClass = isScrolled || isAdmin || location.pathname !== '/'
    ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-stone-100 py-2'
    : 'bg-transparent py-4';

  const linkClass = `text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 relative group cursor-pointer ${isDarkText ? 'text-stone-900 hover:text-[#C5A059]' : 'text-white hover:text-[#C5A059]'
    }`;

  if (isAdmin) return null;

  return (
    <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-[10000] transition-all duration-500 ${bgClass}`}>
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-14">

          {/* Logo - Moved to Left */}
          <div className="flex-shrink-0 flex items-center gap-4">
            <Link to="/" className="flex items-center group">
              <Logo size={isScrolled ? 32 : 40} className={`transition-all duration-500 ${isDarkText ? 'text-stone-900' : 'text-white'}`} />
              <div className={`flex flex-col ml-3 ${isDarkText ? 'text-stone-900' : 'text-white'}`}>
                <span className="text-lg font-bold tracking-[0.2em] font-serif leading-none mb-1">ZARHRAH</span>
                <span className="text-[8px] font-bold tracking-[0.4em] uppercase opacity-70">Luxury Collections</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center justify-center space-x-12 flex-1 absolute left-1/2 -translate-x-1/2">
            {!isAdmin && (
              <>
                {/* Men Dropdown */}
                <div className="relative" onMouseEnter={() => setActiveMenu('Men')} onMouseLeave={() => { setActiveMenu(null); setActiveSubMenu(null); }}>
                  <button className={`${linkClass} flex items-center`}>
                    Men
                  </button>
                  <AnimatePresence>
                    {activeMenu === 'Men' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-8"
                      >
                        <div className="bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl shadow-stone-200/50 w-[500px] flex rounded-sm overflow-hidden min-h-[420px]">
                          {/* Inner Padding Wrapper */}
                          <div className="flex flex-1 p-10">
                            {/* Left Column - Main Categories */}
                            <div className="w-48 space-y-5 pr-8 border-r border-stone-100 shrink-0">
                              {MENU_HIERARCHY.Men.map((item: any, idx) => (
                                <div
                                  key={idx}
                                  onMouseEnter={() => setActiveSubMenu(item.label)}
                                >
                                  {item.subItems ? (
                                    <button className={`text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-300 text-left w-full pb-2 flex justify-between items-center cursor-default ${activeSubMenu === item.label ? 'text-stone-900 translate-x-2' : 'text-stone-400 hover:text-stone-900'}`}>
                                      {item.label}
                                      <ChevronRight size={14} className={`transition-transform duration-500 ease-out ${activeSubMenu === item.label ? 'translate-x-0 opacity-100 text-[#C5A059]' : 'opacity-0 -translate-x-4'}`} />
                                    </button>
                                  ) : (
                                    <button onClick={() => handleLinkClick(item.path)} className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 hover:text-stone-900 hover:translate-x-2 transition-all duration-300 text-left w-full pb-2 group/btn">
                                      {item.label}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Right Column - Sub Items */}
                            <div className="flex-1 relative pl-8">
                              <AnimatePresence>
                                {MENU_HIERARCHY.Men.map((item: any) => {
                                  if (item.label === activeSubMenu && item.subItems) {
                                    return (
                                      <motion.div
                                        key={item.label}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        variants={{
                                          hidden: { opacity: 0 },
                                          visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
                                        }}
                                        className="absolute top-0 left-8 right-0 pr-4"
                                      >
                                        <motion.p
                                          variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                                          className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C5A059] border-b border-stone-100 pb-3 mb-6"
                                        >
                                          {item.label} Collection
                                        </motion.p>
                                        <ul className="grid grid-cols-2 gap-y-4 gap-x-2">
                                          {item.subItems.map((sub: any) => (
                                            <motion.li
                                              key={sub.label}
                                              variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
                                            >
                                              <button onClick={() => handleLinkClick(sub.path)} className="text-[13px] font-serif text-stone-500 hover:text-stone-900 hover:translate-x-1.5 transition-all duration-300 text-left w-full block">
                                                {sub.label}
                                              </button>
                                            </motion.li>
                                          ))}
                                        </ul>
                                      </motion.div>
                                    );
                                  }
                                  return null;
                                })}
                              </AnimatePresence>

                              {/* Empty State / Hint */}
                              {!activeSubMenu && (
                                <div className="absolute inset-0 left-8 flex flex-col items-center justify-center opacity-40 pointer-events-none">
                                  <div className="w-8 h-px bg-stone-300 mb-4" />
                                  <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-stone-400">Select a Category</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Women Dropdown */}
                <div className="relative" onMouseEnter={() => setActiveMenu('Women')} onMouseLeave={() => setActiveMenu(null)}>
                  <button className={`${linkClass} flex items-center`}>
                    Women
                  </button>
                  <AnimatePresence>
                    {activeMenu === 'Women' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-8"
                      >
                        <div className="bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl shadow-stone-200/50 p-8 min-w-[250px] space-y-2 rounded-sm">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C5A059] mb-4 text-center">Collection</p>
                          {MENU_HIERARCHY.Women.map((item: any) => (
                            <button key={item.label} onClick={() => handleLinkClick(item.path)} className="block w-full text-center text-sm font-serif text-stone-500 hover:text-stone-900 hover:scale-105 transition-all py-1.5">
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Collections Dropdown */}
                <div className="relative" onMouseEnter={() => setActiveMenu('Collections')} onMouseLeave={() => setActiveMenu(null)}>
                  <button className={`${linkClass} flex items-center`}>
                    Collections
                  </button>
                  <AnimatePresence>
                    {activeMenu === 'Collections' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-8"
                      >
                        <div className="bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl shadow-stone-200/50 p-8 min-w-[300px] max-h-[60vh] overflow-y-auto rounded-sm scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C5A059] mb-6 border-b border-stone-100 pb-2">Brands</p>
                          <div className="grid grid-cols-1 gap-1">
                            {brands.length > 0 ? brands.map((brand) => (
                              <button key={brand.id} onClick={() => handleLinkClick(`/?brand=${encodeURIComponent(brand.name)}`)} className="text-sm font-serif text-stone-500 hover:text-stone-900 hover:pl-2 transition-all text-left truncate py-1.5 border-b border-stone-50 last:border-0 hover:bg-stone-50 px-2 rounded-sm">
                                {brand.name}
                              </button>
                            )) : (
                              <span className="text-xs text-stone-400 italic">No collections available</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/lookbook" className={linkClass}>Lookbook</Link>
              </>
            )}

            {isAdmin && (
              <div className="flex items-center space-x-8">
                <Link to="/" className={linkClass}>Public Boutique</Link>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C5A059]">Admin Panel</span>
              </div>
            )}
          </div>

          {/* Right Navigation (Actions) */}
          <div className="hidden lg:flex items-center justify-end space-x-10 flex-shrink-0">
            <div className={`h-4 w-px bg-stone-300 mx-2 ${!isDarkText ? 'opacity-30' : 'opacity-100'}`} />

            <Link to="/wishlist" className="relative group">
              <Heart strokeWidth={1.5} size={20} className={`transition-colors duration-300 ${isDarkText ? 'text-stone-900 group-hover:text-red-500' : 'text-white group-hover:text-red-400'}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {!isAdmin && (
              <Link to="/checkout" className="relative group">
                <ShoppingBag strokeWidth={1.5} size={20} className={`transition-colors duration-300 ${isDarkText ? 'text-stone-900 group-hover:text-[#C5A059]' : 'text-white group-hover:text-[#C5A059]'}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#C5A059] text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <div className="relative" ref={node => { if (node) navRef.current = node }}>
              {!user ? (
                <button onClick={() => navigate('/login')} className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isDarkText ? 'text-stone-900' : 'text-white'}`}>
                  Log In
                </button>
              ) : (
                <button onClick={() => setIsAccountOpen(!isAccountOpen)} className={`flex items-center ${isDarkText ? 'text-stone-900' : 'text-white'}`}>
                  <UserIcon size={20} strokeWidth={1.5} />
                </button>
              )}

              <AnimatePresence>
                {isAccountOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-6 w-56 bg-white border border-stone-100 shadow-xl p-0 rounded-sm overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-stone-50 bg-stone-50/50">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-900 truncate">{isAdminUser ? 'Admin' : (user.displayName?.split(' ')[0] || 'Member')}</p>
                      <p className="text-[9px] text-stone-400 truncate mt-1">{user.email}</p>
                    </div>
                    <button onClick={() => handleLinkClick('/orders')} className="w-full text-left px-6 py-4 text-[9px] font-bold tracking-[0.2em] uppercase text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors flex items-center gap-3 border-b border-stone-50">
                      <ShoppingBag size={12} /> My Orders
                    </button>
                    <button onClick={handleSignOut} className="w-full text-left px-6 py-4 text-[9px] font-bold tracking-[0.2em] uppercase text-red-400 hover:bg-stone-50 transition-colors flex items-center gap-3">
                      <LogOut size={12} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-6">
            {!isAdmin && (
              <Link to="/checkout" className="relative">
                <ShoppingBag size={20} strokeWidth={1.5} className={isDarkText ? 'text-stone-900' : 'text-white'} />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#C5A059] rounded-full" />}
              </Link>
            )}
            <button onClick={() => setIsOpen(true)} className={isDarkText ? 'text-stone-900' : 'text-white'}>
              <Menu size={24} strokeWidth={1} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[11000] bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-[100dvh] w-full max-w-sm bg-white z-[11001] shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 flex justify-between items-center border-b border-stone-100">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">Main Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-full transition-colors"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">

                {/* Home */}
                <button
                  onClick={() => handleLinkClick('/')}
                  className="flex items-center space-x-4 w-full px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all group"
                >
                  <div className="bg-stone-50 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                    <Logo size={16} className="text-stone-400 group-hover:text-[#C5A059]" />
                  </div>
                  <span>Home</span>
                </button>

                {/* Collections Group */}
                <div className="px-6 pt-4 pb-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-stone-300">Categories</p>
                </div>

                {/* Mobile Accordion: MEN */}
                <div className="flex flex-col">
                  <button
                    onClick={() => setExpandedMobileMenu(prev => prev === 'Men' ? null : 'Men')}
                    className="flex justify-between items-center w-full px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-stone-50 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                        <div className="w-4 h-4 rounded-full border border-stone-300 group-hover:border-[#C5A059]" />
                      </div>
                      <span>Men</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${expandedMobileMenu === 'Men' ? 'rotate-180 text-[#C5A059]' : 'text-stone-300'}`} />
                  </button>
                  <AnimatePresence>
                    {expandedMobileMenu === 'Men' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-stone-50/50 rounded-xl mx-4 mb-2"
                      >
                        <div className="p-4 space-y-4">
                          {MENU_HIERARCHY.Men.map(item => (
                            <div key={item.label} className="space-y-2">
                              {item.subItems ? (
                                <>
                                  <p className="text-[8px] font-bold tracking-[0.2em] uppercase text-stone-400 pl-4">{item.label}</p>
                                  <div className="pl-6 space-y-3 mt-2 border-l border-stone-200 ml-4 py-1">
                                    {item.subItems.map(subItem => (
                                      <button
                                        key={subItem.label}
                                        onClick={() => handleLinkClick(subItem.path)}
                                        className="block text-left text-[10px] font-serif tracking-widest uppercase text-stone-500 hover:text-stone-900 w-full"
                                      >
                                        {subItem.label}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleLinkClick(item.path)}
                                  className="block text-left text-[10px] font-bold tracking-[0.2em] uppercase text-stone-700 hover:text-[#C5A059] pl-4 w-full"
                                >
                                  {item.label}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Accordion: WOMEN */}
                <div className="flex flex-col">
                  <button
                    onClick={() => setExpandedMobileMenu(prev => prev === 'Women' ? null : 'Women')}
                    className="flex justify-between items-center w-full px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-stone-50 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                        <div className="w-4 h-4 rounded-full border border-stone-300 group-hover:border-[#C5A059]" />
                      </div>
                      <span>Women</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${expandedMobileMenu === 'Women' ? 'rotate-180 text-[#C5A059]' : 'text-stone-300'}`} />
                  </button>
                  <AnimatePresence>
                    {expandedMobileMenu === 'Women' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-stone-50/50 rounded-xl mx-4 mb-2"
                      >
                        <div className="p-4 space-y-4">
                          {MENU_HIERARCHY.Women.map((item: any) => (
                            <div key={item.label} className="space-y-2">
                              {item.subItems ? (
                                <>
                                  <p className="text-[8px] font-bold tracking-[0.2em] uppercase text-stone-400 pl-4">{item.label}</p>
                                  <div className="pl-6 space-y-3 mt-2 border-l border-stone-200 ml-4 py-1">
                                    {item.subItems.map(subItem => (
                                      <button
                                        key={subItem.label}
                                        onClick={() => handleLinkClick(subItem.path)}
                                        className="block text-left text-[10px] font-serif tracking-widest uppercase text-stone-500 hover:text-stone-900 w-full"
                                      >
                                        {subItem.label}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleLinkClick(item.path)}
                                  className="block text-left text-[10px] font-bold tracking-[0.2em] uppercase text-stone-700 hover:text-[#C5A059] pl-4 w-full"
                                >
                                  {item.label}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="px-6 pt-4 pb-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-stone-300">Brands</p>
                </div>

                {brands.length > 0 ? brands.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => handleLinkClick(`/?brand=${encodeURIComponent(brand.name)}`)}
                    className="flex items-center space-x-4 w-full px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all group"
                  >
                    <div className="bg-stone-50 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                      <div className="w-4 h-4 rounded-full border border-stone-300 group-hover:border-[#C5A059]" />
                    </div>
                    <span>{brand.name}</span>
                  </button>
                )) : (
                  <div className="px-6 py-4 text-xs italic text-stone-400">No collections available</div>
                )}

                <button
                  onClick={() => handleLinkClick('/lookbook')}
                  className="flex items-center space-x-4 w-full px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all group"
                >
                  <div className="bg-stone-50 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                    <div className="w-4 h-4 rounded-full border border-stone-300 group-hover:border-[#C5A059]" />
                  </div>
                  <span>Lookbook</span>
                </button>

                <div className="my-4 h-px bg-stone-50 mx-4" />

                {/* Account Actions */}
                {!user ? (
                  <>
                    <button
                      onClick={() => handleLinkClick('/login')}
                      className="flex items-center space-x-4 w-full px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all group"
                    >
                      <div className="bg-stone-50 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                        <UserIcon size={16} className="text-stone-300 group-hover:text-stone-900" />
                      </div>
                      <span>Log In</span>
                    </button>
                    <button
                      onClick={() => handleLinkClick('/signup')}
                      className="flex items-center space-x-4 w-full px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase text-[#C5A059] bg-[#C5A059]/5 hover:bg-[#C5A059] hover:text-white transition-all group"
                    >
                      <div className="bg-white p-2 rounded-lg group-hover:bg-white/20 transition-all">
                        <UserIcon size={16} className="text-[#C5A059] group-hover:text-white" />
                      </div>
                      <span>Sign Up</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-6 py-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-stone-300">Signed In As</p>
                      <p className="text-[10px] font-bold text-stone-900 mt-1 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleLinkClick('/orders')}
                      className="flex items-center space-x-4 w-full px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all group"
                    >
                      <div className="bg-stone-50 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                        <ShoppingBag size={16} className="text-stone-300 group-hover:text-stone-900" />
                      </div>
                      <span>My Orders</span>
                    </button>
                  </>
                )}
              </div>

              {/* Footer */}
              {user && (
                <div className="p-6 border-t border-stone-100 bg-stone-50/50">
                  <button
                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl border border-stone-200 bg-white text-[10px] font-bold tracking-widest uppercase text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
