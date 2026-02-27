
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, Heart, User as UserIcon, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { subscribeToBrands } from '../services/dbUtils';
import { ADMIN_EMAILS } from '../constants';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  user: User | null;
}

const MENU_HIERARCHY = {
  Men: [
    { label: 'All', path: '/?tag=men' },
    {
      label: 'Clothing',
      subItems: [
        { label: 'T-shirts', path: '/?tag=men&category=t-shirts' },
        { label: 'Shirts', path: '/?tag=men&category=shirts' },
        { label: 'Pants', path: '/?tag=men&category=pants' },
        { label: 'Shorts', path: '/?tag=men&category=shorts' },
        { label: 'Jackets', path: '/?tag=men&category=jackets' },
        { label: 'Vests', path: '/?tag=men&category=vests' },
      ]
    },
    { label: 'Jersey', path: '/?tag=men&category=jersey' },
    { label: 'Accessories', path: '/?tag=men&category=accessories' },
    { label: 'Slides', path: '/?tag=men&category=slides' },
  ],
  Women: [
    { label: 'All', path: '/?tag=women' },
    { label: 'Tops', path: '/?tag=women&category=tops' },
    { label: 'Bottoms', path: '/?tag=women&category=bottoms' },
    { label: 'Dresses', path: '/?tag=women&category=dresses' },
    { label: 'Jerseys', path: '/?tag=women&category=jerseys' },
    { label: 'Accessories', path: '/?tag=women&category=accessories' },
    { label: 'Swimwear', path: '/?tag=women&category=swimwear' },
    { label: 'Jackets', path: '/?tag=women&category=jackets' },
    { label: 'Slides', path: '/?tag=women&category=slides' },
  ]
};

const Navbar: React.FC<NavbarProps> = ({ cartCount, wishlistCount, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
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
    const unsub = subscribeToBrands((data) => {
      setBrands(data.sort((a, b) => a.name.localeCompare(b.name)));
    });
    return () => unsub();
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
                <div className="relative" onMouseEnter={() => setActiveMenu('Men')} onMouseLeave={() => setActiveMenu(null)}>
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
                        <div className="bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl shadow-stone-200/50 p-8 min-w-[400px] grid grid-cols-2 gap-12 rounded-sm">
                          {MENU_HIERARCHY.Men.map((item: any, idx) => (
                            <div key={idx} className="space-y-4">
                              {item.subItems ? (
                                <div className="space-y-4">
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A059] border-b border-stone-100 pb-2">{item.label}</p>
                                  <ul className="space-y-2">
                                    {item.subItems.map((sub: any) => (
                                      <li key={sub.label}>
                                        <button onClick={() => handleLinkClick(sub.path)} className="text-sm font-serif text-stone-500 hover:text-stone-900 hover:translate-x-1 transition-all text-left w-full block py-1">
                                          {sub.label}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : (
                                <button onClick={() => handleLinkClick(item.path)} className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-900 hover:text-[#C5A059] transition-colors text-left w-full border-b border-stone-100 pb-2">
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

                {/* Brands Dropdown */}
                <div className="relative" onMouseEnter={() => setActiveMenu('Brands')} onMouseLeave={() => setActiveMenu(null)}>
                  <button className={`${linkClass} flex items-center`}>
                    Categories
                  </button>
                  <AnimatePresence>
                    {activeMenu === 'Brands' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-8"
                      >
                        <div className="bg-white/95 backdrop-blur-xl border border-stone-100 shadow-2xl shadow-stone-200/50 p-8 min-w-[300px] max-h-[60vh] overflow-y-auto rounded-sm scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C5A059] mb-6 border-b border-stone-100 pb-2">Our Brands</p>
                          <div className="grid grid-cols-1 gap-1">
                            {brands.map((brand) => (
                              <button key={brand.id} onClick={() => handleLinkClick(`/?brand=${brand.name.toLowerCase()}`)} className="text-sm font-serif text-stone-500 hover:text-stone-900 hover:pl-2 transition-all text-left truncate py-1.5 border-b border-stone-50 last:border-0 hover:bg-stone-50 px-2 rounded-sm">
                                {brand.name}
                              </button>
                            ))}
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
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-900 truncate">{user.displayName || 'Member'}</p>
                      <p className="text-[9px] text-stone-400 truncate mt-1">{user.email}</p>
                    </div>
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
              className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-white z-[11001] shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 flex justify-between items-center border-b border-stone-100">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">Of Menu</span>
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
                  <p className="text-[8px] font-black uppercase tracking-widest text-stone-300">Collections</p>
                </div>

                <button
                  onClick={() => handleLinkClick('/?tag=men')}
                  className="flex items-center space-x-4 w-full px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all group"
                >
                  <div className="bg-stone-50 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                    <div className="w-4 h-4 rounded-full border border-stone-300 group-hover:border-[#C5A059]" />
                  </div>
                  <span>Men</span>
                </button>

                <button
                  onClick={() => handleLinkClick('/?tag=women')}
                  className="flex items-center space-x-4 w-full px-6 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:bg-stone-50 hover:text-stone-900 transition-all group"
                >
                  <div className="bg-stone-50 p-2 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                    <div className="w-4 h-4 rounded-full border border-stone-300 group-hover:border-[#C5A059]" />
                  </div>
                  <span>Women</span>
                </button>

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
