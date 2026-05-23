
import React, { useEffect, useState } from 'react';
import { subscribeToAbandonedCheckouts, deleteAbandonedCheckout } from '../../services/dbUtils';
import { sendAutomatedEmail } from '../../services/emailUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Mail, Trash2, Clock, RefreshCw, User } from 'lucide-react';

interface AbandonedSession {
  id: string;
  email: string;
  name: string;
  cart: Array<{ name: string; price: number; quantity: number; images?: string[] }>;
  total: number;
  timestamp: number;
}

const AbandonedTab: React.FC = () => {
  const [sessions, setSessions] = useState<AbandonedSession[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsub = subscribeToAbandonedCheckouts((data) => {
      setSessions(data as AbandonedSession[]);
    });
    return unsub;
  }, []);

  const handleSendRecovery = async (session: AbandonedSession) => {
    setSendingId(session.id);
    try {
      const cartList = session.cart
        .map(i => `<li style="padding:4px 0;font-size:13px;">${i.name} × ${i.quantity} — <strong>₦${(i.price * i.quantity).toLocaleString()}</strong></li>`)
        .join('');

      const html = `
        <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;background:#fff;padding:40px;">
          <h1 style="font-size:22px;color:#1c1917;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">You Left Something Behind</h1>
          <p style="color:#78716c;font-size:13px;margin-bottom:28px;">Dear ${session.name || 'Valued Client'},</p>
          <p style="color:#292524;font-size:14px;line-height:1.7;">We noticed you were curating a selection from our boutique but didn't complete your purchase. Your exquisite taste deserves to be fulfilled.</p>
          <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:4px;padding:20px;margin:24px 0;">
            <h3 style="font-size:11px;color:#a8a29e;letter-spacing:3px;text-transform:uppercase;margin-bottom:12px;">Your Curated Selection</h3>
            <ul style="list-style:none;padding:0;margin:0;">${cartList}</ul>
            <div style="border-top:1px solid #e7e5e4;padding-top:12px;margin-top:12px;text-align:right;">
              <span style="font-size:13px;color:#57534e;text-transform:uppercase;letter-spacing:2px;">Total: </span>
              <strong style="font-size:16px;color:#1c1917;">₦${session.total.toLocaleString()}</strong>
            </div>
          </div>
          <a href="https://zahrah-boutique.web.app/checkout" style="display:inline-block;background:#1c1917;color:#fff;padding:14px 32px;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;margin:16px 0;">Complete Your Purchase</a>
          <p style="color:#78716c;font-size:12px;margin-top:32px;">Should you have any questions, our curators are at your service at <a href="mailto:alerts@zarhrahluxurycollections.com" style="color:#C5A059;">alerts@zarhrahluxurycollections.com</a></p>
          <p style="color:#a8a29e;font-size:11px;margin-top:4px;letter-spacing:1px;">— Zarhrah Luxury Collections</p>
        </div>
      `;

      await sendAutomatedEmail(session.email, 'Your Curated Selection Awaits | Zarhrah Luxury', html);
      setSentIds(prev => new Set(prev).add(session.id));
    } catch (e) {
      console.error('Failed to send recovery email:', e);
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async (sessionId: string) => {
    setDeletingId(sessionId);
    try {
      await deleteAbandonedCheckout(sessionId);
    } finally {
      setDeletingId(null);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">Abandoned Checkouts</h2>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">
            Sessions started 30+ minutes ago without completing payment
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
          <ShoppingBag size={14} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-800">{sessions.length} Abandoned</span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <ShoppingBag size={24} className="text-green-500" />
          </div>
          <h3 className="text-sm font-bold text-stone-700 mb-2">No Abandoned Sessions</h3>
          <p className="text-xs text-stone-400 max-w-xs">
            All recent checkout sessions have been completed. Check back after new visitors start shopping.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <User size={16} className="text-stone-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-stone-900">{session.name || 'Anonymous'}</p>
                      <p className="text-xs text-stone-400">{session.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{formatTimeAgo(session.timestamp)}</span>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="bg-stone-50 rounded-xl p-4 mb-4 space-y-2">
                  {session.cart.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-stone-600">
                      <span className="font-medium truncate max-w-[200px]">{item.name} × {item.quantity}</span>
                      <span className="font-bold text-stone-900">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {session.cart.length > 3 && (
                    <p className="text-[10px] text-stone-400 italic">+{session.cart.length - 3} more items...</p>
                  )}
                  <div className="flex justify-between border-t border-stone-200 pt-2 mt-2">
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Cart Total</span>
                    <span className="text-sm font-bold text-stone-900">₦{session.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {sentIds.has(session.id) ? (
                    <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                      Recovery Email Sent
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSendRecovery(session)}
                      disabled={sendingId === session.id}
                      className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#C5A059] transition-colors disabled:opacity-60"
                    >
                      {sendingId === session.id ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Mail size={12} />
                      )}
                      {sendingId === session.id ? 'Sending...' : 'Send Recovery Email'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(session.id)}
                    disabled={deletingId === session.id}
                    className="flex items-center gap-2 px-4 py-2 border border-stone-200 text-stone-500 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:border-red-200 hover:text-red-500 transition-colors disabled:opacity-60"
                  >
                    {deletingId === session.id ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    Dismiss
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AbandonedTab;
