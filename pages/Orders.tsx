
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, AlertTriangle, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { Order } from '../types';
import { subscribeToUserOrders } from '../services/dbUtils';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user && user.email) {
                setUserEmail(user.email);
            } else {
                setLoading(false);
                navigate('/login');
            }
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    useEffect(() => {
        if (!userEmail) return;

        const unsubscribeOrders = subscribeToUserOrders(userEmail, (data) => {
            setOrders(data);
            setLoading(false);
        });

        return () => unsubscribeOrders();
    }, [userEmail]);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'text-green-600 bg-green-50 border-green-200';
            case 'Shipped': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'Cancelled': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Delivered': return <CheckCircle className="w-4 h-4" />;
            case 'Shipped': return <Package className="w-4 h-4" />;
            case 'Cancelled': return <AlertTriangle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight uppercase tracking-widest text-stone-900 mb-2">My Orders</h1>
                    <p className="text-stone-500 text-xs tracking-[0.2em] uppercase">Track your recent purchases</p>
                </div>
                <Link to="/" className="inline-flex items-center space-x-2 text-[10px] font-bold tracking-[0.3em] uppercase text-stone-900 hover:text-[#C5A059] transition-colors">
                    <span>Continue Shopping</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white border border-stone-100 rounded-sm shadow-sm">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-8 h-8 text-stone-300" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mb-2 uppercase tracking-widest">No orders found</h3>
                    <p className="text-stone-500 text-sm mb-8 font-light italic serif">You haven't placed any orders yet.</p>
                    <Link
                        to="/"
                        className="inline-block px-8 py-4 bg-stone-900 text-white text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-[#C5A059] transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-stone-100 shadow-sm hover:shadow-md transition-shadow duration-300 group overflow-hidden rounded-sm">
                            {/* Order Header */}
                            <div className="bg-stone-50/50 px-6 py-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-stone-900 tracking-wider">{order.id}</span>
                                    <span className="text-[10px] text-stone-400 uppercase tracking-widest px-2 py-1 bg-white border border-stone-200 rounded-full">
                                        {new Date(order.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest border ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span>{order.status}</span>
                                </div>
                            </div>

                            {/* Order Content */}
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Items List */}
                                    <div className="flex-1 space-y-6">
                                        {order.items.map((item, index) => (
                                            <div key={`${order.id}-item-${index}`} className="flex gap-4">
                                                <div className="w-16 h-20 bg-stone-100 overflow-hidden rounded-sm border border-stone-200 flex-shrink-0">
                                                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">{item.name}</h4>
                                                    <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">{item.category}</p>
                                                    <div className="flex items-center gap-3 text-[10px] text-stone-400">
                                                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                                                        <span>Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-stone-900">N{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Summary Side */}
                                    <div className="lg:w-64 flex-shrink-0 lg:border-l lg:border-stone-100 lg:pl-8 flex flex-col justify-center">
                                        <div className="space-y-2 mb-6 text-xs text-stone-500">
                                            <div className="flex justify-between">
                                                <span>Payment</span>
                                                <span className="font-bold text-stone-900">{order.paymentMethod || 'Paystack'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Items</span>
                                                <span className="font-bold text-stone-900">{order.items.length}</span>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-stone-100">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Total</span>
                                                <span className="text-xl font-bold text-stone-900">N{order.total.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
