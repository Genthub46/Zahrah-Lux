import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import { Loader2, User, Lock, AlertCircle } from 'lucide-react';
import Logo from '../Logo';
import { motion } from 'framer-motion';

const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            console.error("Login failed", err);
            const errorMessage = err.code ? `Error: ${err.code.replace('auth/', '')}` : 'Authentication Failed';
            setLoginError(errorMessage.toUpperCase());
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#C5A059] rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-stone-800 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="max-w-md w-full relative z-10"
            >
                <div className="bg-[#141211]/90 backdrop-blur-xl p-12 border border-stone-800 shadow-2xl rounded-3xl flex flex-col items-center">
                    <div className="mb-12 transform hover:scale-105 transition-transform duration-500">
                        <Logo size={120} />
                    </div>

                    <div className="w-full text-center mb-10">
                        <h2 className="text-xl font-serif italic text-white mb-2">Executive Access</h2>
                        <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">Restricted Area • Authorized Personnel Only</p>
                    </div>

                    <form onSubmit={handleLogin} className="w-full space-y-6">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-[#C5A059] transition-colors" size={16} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="EXECUTIVE ID (EMAIL)"
                                required
                                className="w-full pl-12 pr-6 py-4 bg-stone-900/50 border border-stone-800 rounded-xl focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] focus:outline-none text-white text-[10px] font-bold tracking-[0.2em] transition-all"
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-[#C5A059] transition-colors" size={16} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="SECURE ACCESS KEY"
                                required
                                className="w-full pl-12 pr-6 py-4 bg-stone-900/50 border border-stone-800 rounded-xl focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] focus:outline-none text-white text-[10px] font-bold tracking-[0.2em] transition-all"
                            />
                        </div>

                        {loginError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center justify-center space-x-2"
                            >
                                <AlertCircle size={14} className="text-red-500" />
                                <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest">{loginError}</p>
                            </motion.div>
                        )}

                        <button
                            disabled={isLoggingIn}
                            className="w-full bg-gradient-to-r from-[#C5A059] to-[#B38E46] text-white py-4 rounded-xl text-[10px] font-black tracking-[0.3em] uppercase shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoggingIn ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <Loader2 className="animate-spin" size={14} />
                                    <span>Verifying Credentials...</span>
                                </div>
                            ) : "Authenticate Session"}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-[9px] text-stone-700 uppercase tracking-widest font-bold">
                    <p>Secure Connection • Encrypted Transmission</p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
