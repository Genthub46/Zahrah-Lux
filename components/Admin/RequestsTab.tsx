import React, { useMemo } from 'react';
import { FileText, Mail, MessageCircle, X, Trash2, Star, BellRing } from 'lucide-react';
import { RestockRequest, Product, Review } from '../../types';
import { deleteRestockRequest, updateRestockRequestStatus, deleteReview } from '../../services/dbUtils';
import { exportWaitlistToPDF } from '../../services/exportUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface RequestsTabProps {
    restockRequests: RestockRequest[];
    products: Product[];
    reviews: Review[];
}

const RequestsTab: React.FC<RequestsTabProps> = ({ restockRequests, products, reviews }) => {

    const groupedRequests = useMemo(() => {
        return restockRequests.reduce((acc, req) => {
            if (!acc[req.productId]) {
                acc[req.productId] = [];
            }
            acc[req.productId].push(req);
            return acc;
        }, {} as Record<string, RestockRequest[]>);
    }, [restockRequests]);

    return (
        <div className="space-y-12 animate-in fade-in duration-500">

            {/* --- WAITLIST SECTION --- */}
            <div className="bg-white border border-stone-100 rounded-[2.5rem] shadow-xl shadow-stone-200/50 overflow-hidden">
                <div className="p-8 border-b border-stone-50 flex justify-between items-center bg-stone-50/30">
                    <div>
                        <h3 className="text-xl font-bold font-serif italic text-stone-900">Waitlist Intelligence</h3>
                        <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">Pending Client Notifications</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => exportWaitlistToPDF(restockRequests, products)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-[9px] font-bold text-stone-600 uppercase tracking-widest hover:text-[#C5A059] hover:border-[#C5A059] transition-all shadow-sm"
                        >
                            <FileText size={14} />
                            <span>Export Report</span>
                        </button>
                        <div className="w-px h-8 bg-stone-100 mx-2"></div>
                        <button
                            onClick={async () => {
                                if (confirm('Clear all requests?')) {
                                    try {
                                        await Promise.all(restockRequests.map(r => deleteRestockRequest(r.id)));
                                    } catch (err: any) {
                                        console.error(err);
                                        alert(`Failed to flush requests: ${err.message}`);
                                    }
                                }
                            }}
                            className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                        >
                            Flush All
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <AnimatePresence>
                        {Object.entries(groupedRequests).map(([pid, reqs], idx) => {
                            const p = products.find(prod => prod.id === pid);
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={pid}
                                    className="group p-6 rounded-3xl border border-stone-100 hover:border-stone-200 hover:shadow-lg transition-all bg-stone-50/30 hover:bg-white"
                                >
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Header */}
                                        <div className="flex items-start gap-5 min-w-[250px]">
                                            <div className="w-20 h-24 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200 shadow-sm">
                                                {p?.images[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-200 animate-pulse" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-stone-900 leading-tight mb-2">{p?.name || 'Unknown Artifact'}</h4>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-900 text-white rounded-lg">
                                                    <BellRing size={10} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{reqs.length} Waiting</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Request List */}
                                        <div className="flex-1 grid gap-3">
                                            {reqs.map(req => (
                                                <div key={req.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${req.status === 'Notified' ? 'bg-green-50/30 border-green-100' : 'bg-white border-stone-100 hover:border-[#C5A059]/30'}`}>
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`w-2 h-2 rounded-full shadow-sm ${req.status === 'Notified' ? 'bg-green-500 shadow-green-200' : 'bg-amber-400 shadow-amber-200'}`} />
                                                        <div>
                                                            <div className="text-xs font-bold text-stone-900">{req.customerName}</div>
                                                            <div className="text-[9px] text-stone-400 font-mono tracking-wide">{req.customerEmail}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <div className="relative">
                                                            <select
                                                                value={req.status || 'Pending'}
                                                                onChange={async (e) => {
                                                                    try {
                                                                        await updateRestockRequestStatus(req.id, e.target.value as any);
                                                                    } catch (err: any) {
                                                                        console.error(err);
                                                                        alert(`Failed to update status: ${err.message}`);
                                                                    }
                                                                }}
                                                                className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest outline-none cursor-pointer transition-colors ${req.status === 'Notified' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="Notified">Notified</option>
                                                            </select>
                                                        </div>

                                                        <div className="flex items-center space-x-1 pl-2 border-l border-stone-100">
                                                            <a
                                                                href={`mailto:${req.customerEmail}?subject=Back in Stock: ${p?.name}&body=Good news! The ${p?.name} is back in stock at Zarhrah Luxury.`}
                                                                target="_blank" rel="noreferrer"
                                                                className="p-2 rounded-lg text-stone-400 hover:bg-stone-900 hover:text-white transition-all"
                                                                title="Send Email"
                                                            >
                                                                <Mail size={14} />
                                                            </a>
                                                            {req.customerWhatsapp && (
                                                                <a
                                                                    href={`https://wa.me/${req.customerWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Good news! The ${p?.name} is back in stock at Zarhrah Luxury.`)}`}
                                                                    target="_blank" rel="noreferrer"
                                                                    className="p-2 rounded-lg text-stone-400 hover:bg-green-500 hover:text-white transition-all"
                                                                    title="WhatsApp"
                                                                >
                                                                    <MessageCircle size={14} />
                                                                </a>
                                                            )}
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm('Remove this request?')) {
                                                                        try {
                                                                            await deleteRestockRequest(req.id);
                                                                        } catch (err: any) {
                                                                            console.error(err);
                                                                            alert(`Failed to delete request: ${err.message}`);
                                                                        }
                                                                    }
                                                                }}
                                                                className="p-2 rounded-lg text-stone-300 hover:bg-red-50 hover:text-red-500 transition-all"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {restockRequests.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center opacity-50">
                            <BellRing size={48} className="text-stone-200 mb-4" />
                            <p className="text-stone-400 serif italic text-lg">Waitlist is currently empty.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- REVIEWS SECTION --- */}
            <div className="bg-white border border-stone-100 rounded-[2.5rem] shadow-xl shadow-stone-200/50 overflow-hidden">
                <div className="p-8 border-b border-stone-50 bg-stone-50/30">
                    <h3 className="text-xl font-bold font-serif italic text-stone-900">Client Feedback</h3>
                </div>
                <div className="p-8">
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {reviews.map((review, i) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={review.id}
                                    className="bg-stone-50 p-6 rounded-3xl border border-stone-100 group hover:shadow-lg hover:border-stone-200 transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={async () => {
                                            if (confirm('Delete review?')) {
                                                try {
                                                    await deleteReview(review.id);
                                                } catch (err: any) {
                                                    console.error(err);
                                                    alert(`Failed to delete review: ${err.message}`);
                                                }
                                            }
                                        }} className="text-stone-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} size={14} className={`${s <= review.rating ? "text-[#C5A059] fill-[#C5A059]" : "text-stone-200"} mr-0.5`} />
                                            ))}
                                        </div>

                                        <p className="text-sm font-medium text-stone-600 serif italic leading-relaxed">"{review.comment}"</p>

                                        <div className="pt-4 border-t border-stone-200/50 flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">{review.customerName}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mt-0.5">{new Date(review.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {reviews.length === 0 && (
                            <div className="col-span-full py-10 text-center text-stone-300 italic serif">No reviews recorded.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestsTab;
