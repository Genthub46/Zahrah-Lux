import React, { useState, useEffect } from 'react';
import { X, Shield, Copy, Check, Smartphone, Key, AlertTriangle } from 'lucide-react';
import QRCode from 'qrcode';
import * as OTPAuth from 'otpauth';
import { motion, AnimatePresence } from 'framer-motion';

interface TwoFactorSetupProps {
    userEmail: string;
    isEnabled: boolean;
    onEnable: (secret: string, backupCodes: string[]) => Promise<void>;
    onDisable: () => Promise<void>;
    onVerify: (code: string) => Promise<boolean>;
    onClose: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
    userEmail,
    isEnabled,
    onEnable,
    onDisable,
    onVerify,
    onClose,
}) => {
    const [step, setStep] = useState<'intro' | 'setup' | 'verify' | 'backup' | 'manage'>('intro');
    const [secret, setSecret] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Generate secret and QR code on setup
    useEffect(() => {
        if (step === 'setup' && !secret) {
            // Generate a random secret (base32 encoded)
            const randomBytes = new Uint8Array(20);
            crypto.getRandomValues(randomBytes);
            const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            let newSecret = '';
            for (let i = 0; i < 20; i++) {
                newSecret += base32Chars[randomBytes[i] % 32];
            }
            setSecret(newSecret);

            // Create TOTP instance for URI generation
            const totp = new OTPAuth.TOTP({
                issuer: 'Zahrah Luxury',
                label: userEmail,
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromBase32(newSecret),
            });

            const otpAuthUrl = totp.toString();

            QRCode.toDataURL(otpAuthUrl, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#1c1917',
                    light: '#fafaf9',
                },
            }).then(setQrCodeUrl);
        }
    }, [step, secret, userEmail]);

    // Generate backup codes
    const generateBackupCodes = () => {
        const codes = Array.from({ length: 8 }, () =>
            Math.random().toString(36).substring(2, 8).toUpperCase()
        );
        setBackupCodes(codes);
        return codes;
    };

    const handleVerify = async () => {
        if (verificationCode.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Verify the code using OTPAuth
            const totp = new OTPAuth.TOTP({
                issuer: 'Zahrah Luxury',
                label: userEmail,
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromBase32(secret),
            });

            const delta = totp.validate({ token: verificationCode, window: 1 });
            const isValid = delta !== null;

            if (isValid) {
                const codes = generateBackupCodes();
                await onEnable(secret, codes);
                setStep('backup');
            } else {
                setError('Invalid code. Please try again.');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
            return;
        }

        setIsLoading(true);
        try {
            await onDisable();
            onClose();
        } catch (err) {
            setError('Failed to disable 2FA');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderContent = () => {
        if (isEnabled && step === 'intro') {
            return (
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                        <Shield size={32} className="text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-widest text-stone-900 mb-2">
                            2FA Enabled
                        </h3>
                        <p className="text-sm text-stone-500">
                            Your account is protected with two-factor authentication.
                        </p>
                    </div>
                    <button
                        onClick={handleDisable}
                        disabled={isLoading}
                        className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                </div>
            );
        }

        switch (step) {
            case 'intro':
                return (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                            <Shield size={32} className="text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-widest text-stone-900 mb-2">
                                Enable Two-Factor Authentication
                            </h3>
                            <p className="text-sm text-stone-500">
                                Add an extra layer of security to your admin account by requiring a verification code from your phone.
                            </p>
                        </div>
                        <button
                            onClick={() => setStep('setup')}
                            className="w-full py-3 bg-[#C5A059] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#b8944e] transition-colors"
                        >
                            Set Up 2FA
                        </button>
                    </div>
                );

            case 'setup':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-lg font-black uppercase tracking-widest text-stone-900 mb-2">
                                Scan QR Code
                            </h3>
                            <p className="text-sm text-stone-500">
                                Use an authenticator app like Google Authenticator or Authy to scan this code.
                            </p>
                        </div>

                        {qrCodeUrl && (
                            <div className="flex justify-center">
                                <div className="bg-white p-4 rounded-xl border-2 border-stone-100">
                                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                                </div>
                            </div>
                        )}

                        <div className="bg-stone-50 p-4 rounded-xl">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                                Or enter this code manually:
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-white px-3 py-2 rounded-lg text-xs font-mono text-stone-700 border border-stone-200">
                                    {secret}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(secret)}
                                    className="p-2 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors"
                                >
                                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('verify')}
                            className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
                        >
                            Next: Verify Code
                        </button>
                    </div>
                );

            case 'verify':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-lg font-black uppercase tracking-widest text-stone-900 mb-2">
                                Enter Verification Code
                            </h3>
                            <p className="text-sm text-stone-500">
                                Enter the 6-digit code from your authenticator app.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setVerificationCode(value);
                                    setError('');
                                }}
                                placeholder="000000"
                                className="w-48 text-center text-2xl font-mono font-bold tracking-[0.5em] px-4 py-4 bg-stone-50 border-2 border-stone-200 rounded-xl focus:outline-none focus:border-[#C5A059]"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 justify-center text-red-500 text-xs">
                                <AlertTriangle size={14} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('setup')}
                                className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleVerify}
                                disabled={isLoading || verificationCode.length !== 6}
                                className="flex-1 py-3 bg-[#C5A059] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#b8944e] transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Enable'}
                            </button>
                        </div>
                    </div>
                );

            case 'backup':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-widest text-stone-900 mb-2">
                                2FA Enabled Successfully
                            </h3>
                            <p className="text-sm text-stone-500">
                                Save these backup codes in a secure place. You can use them if you lose access to your authenticator app.
                            </p>
                        </div>

                        <div className="bg-stone-50 p-4 rounded-xl space-y-2">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                                Backup Codes (use each only once)
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {backupCodes.map((code, i) => (
                                    <code key={i} className="bg-white px-3 py-2 rounded-lg text-xs font-mono text-stone-700 border border-stone-200 text-center">
                                        {code}
                                    </code>
                                ))}
                            </div>
                            <button
                                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                                className="w-full mt-3 flex items-center justify-center gap-2 py-2 bg-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-300 transition-colors"
                            >
                                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                <span>{copied ? 'Copied!' : 'Copy All Codes'}</span>
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-stone-400">
                        <Key size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Security Settings</span>
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                        <X size={20} />
                    </button>
                </div>

                {renderContent()}
            </motion.div>
        </motion.div>
    );
};

export default TwoFactorSetup;
