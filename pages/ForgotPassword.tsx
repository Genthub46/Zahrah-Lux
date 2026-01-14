import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent. Please check your inbox.');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email address.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError('Failed to send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FCFCFC] flex items-center justify-center relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-[#C5A059] rounded-full blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] bg-stone-200 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md z-10 p-6 md:p-0">
                <Link to="/login" className="inline-flex items-center space-x-2 text-[10px] font-bold tracking-[0.3em] uppercase text-stone-400 hover:text-stone-900 transition-colors mb-8 md:absolute md:top-8 md:left-8 md:mb-0">
                    <ArrowLeft size={14} />
                    <span>Back to Login</span>
                </Link>

                <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 border border-stone-100 shadow-2xl rounded-sm animate-in fade-in zoom-in duration-500">
                    <div className="text-center mb-10">
                        <Logo size={60} className="mx-auto mb-6" />
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 serif italic tracking-tight text-stone-900">Account Recovery</h2>
                        <p className="text-stone-400 text-[11px] leading-relaxed uppercase tracking-widest max-w-xs mx-auto">
                            Securely restore access to your client portal
                        </p>
                    </div>

                    {message ? (
                        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 bg-stone-50 p-8 rounded-sm border border-stone-100">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-stone-900 font-bold text-sm mb-2 uppercase tracking-wide">Email Sent</h3>
                            <p className="text-stone-500 text-xs mb-8 leading-relaxed">
                                We've sent secure instructions to your inbox.<br />Please verify to continue.
                            </p>
                            <Link
                                to="/login"
                                className="inline-block w-full bg-stone-900 text-white py-4 text-[10px] font-bold tracking-[0.3em] hover:bg-stone-800 transition-all uppercase"
                            >
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-500 p-4 text-[10px] uppercase tracking-wide text-center border border-red-100 flex items-center justify-center gap-2">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">Registered Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-300 group-focus-within:text-[#C5A059] transition-colors" size={16} />
                                    <input
                                        type="email"
                                        placeholder="client@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] focus:bg-white transition-all text-xs tracking-wide placeholder-stone-300"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-stone-900 text-white py-5 text-[10px] font-bold tracking-[0.3em] hover:bg-[#C5A059] hover:text-white transition-all disabled:opacity-50 uppercase flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    'Send Recovery Link'
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center mt-8 text-[9px] text-stone-300 font-bold uppercase tracking-[0.3em]">
                    Zarhrah Luxury • Secure
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
