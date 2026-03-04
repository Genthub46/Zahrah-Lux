
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    description?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, options?: { type?: ToastType; description?: string; duration?: number }) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, options: { type?: ToastType; description?: string; duration?: number } = {}) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = {
            id,
            message,
            type: options.type || 'info',
            description: options.description,
            duration: options.duration || 4000
        };

        setToasts((prev) => [...prev, newToast]);

        if (newToast.duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, newToast.duration);
        }
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
            <ToastContainer toasts={toasts} dismissToast={dismissToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// --- Toast UI Components ---

const ToastContainer: React.FC<{ toasts: Toast[]; dismissToast: (id: string) => void }> = ({ toasts, dismissToast }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({ toast, onDismiss }) => {
    const icons = {
        success: <CheckCircle className="text-emerald-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        warning: <AlertTriangle className="text-amber-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />
    };

    const borders = {
        success: 'border-emerald-100',
        error: 'border-red-100',
        warning: 'border-amber-100',
        info: 'border-blue-100'
    };

    const backgrounds = {
        success: 'bg-emerald-50',
        error: 'bg-red-50',
        warning: 'bg-amber-50',
        info: 'bg-blue-50'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            className={`pointer-events-auto min-w-[320px] max-w-[420px] bg-white rounded-xl shadow-lg border ${borders[toast.type]} p-4 flex gap-4 items-start relative overflow-hidden`}
        >
            <div className={`p-2 rounded-full shrink-0 ${backgrounds[toast.type]}`}>
                {icons[toast.type]}
            </div>
            <div className="flex-1 pt-1">
                <h4 className="text-sm font-bold text-stone-900 leading-none mb-1">{toast.message}</h4>
                {toast.description && (
                    <p className="text-xs text-stone-500 leading-relaxed">{toast.description}</p>
                )}
            </div>
            <button
                onClick={onDismiss}
                className="text-stone-300 hover:text-stone-500 transition-colors p-1"
            >
                <X size={16} />
            </button>
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: (toast.duration || 4000) / 1000, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent to-stone-200/50`}
            />
        </motion.div>
    );
};
