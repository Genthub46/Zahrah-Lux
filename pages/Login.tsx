import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { Eye, EyeOff, Loader2, ArrowLeft, Check } from 'lucide-react';
import Logo from '../components/Logo';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password.');
            } else {
                setError('Failed to login. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2 text-[10px] font-bold tracking-[0.3em] uppercase text-stone-400 hover:text-stone-900 transition-colors">
                <ArrowLeft size={14} />
                <span>Return to Boutique</span>
            </Link>

            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-12">
                    <Logo size={80} className="mx-auto mb-6" />
                    <span className="block text-[12px] font-bold tracking-[0.3em] text-stone-900 mb-2">ZARHRAH</span>
                    <span className="block text-[8px] gold-text font-bold tracking-[0.2em] opacity-80 uppercase">London • Lagos</span>
                </div>

                <div className="bg-white p-10 border border-stone-100 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-8 text-center serif italic tracking-tight">Welcome Back</h2>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 mb-6 text-xs text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-4 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all text-xs"
                                required
                            />
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all text-xs"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <div className={`w-4 h-4 border border-stone-300 rounded flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#C5A059] border-[#C5A059]' : 'bg-white group-hover:border-[#C5A059]'}`}>
                                    {rememberMe && <Check size={10} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="hidden"
                                />
                                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold group-hover:text-[#C5A059] transition-colors">Remember Me</span>
                            </label>

                            <Link to="/forgot-password" className="text-[10px] text-stone-400 hover:text-stone-900 uppercase tracking-widest font-bold transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-stone-900 text-white py-5 text-[10px] font-bold tracking-[0.3em] hover:bg-stone-800 transition-all disabled:opacity-50 uppercase flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'LOG IN'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest">
                            New client?{' '}
                            <Link to="/signup" className="text-[#C5A059] font-bold hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
