import React, { useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { subscribeToNewOrders } from '../services/dbUtils';
import { Order } from '../types';

interface LiveNotificationsProps {
    isAdmin: boolean;
}

const LiveNotifications: React.FC<LiveNotificationsProps> = ({ isAdmin }) => {
    const { showToast } = useToast();
    const appStartIso = useRef(new Date().toISOString());

    useEffect(() => {
        // If Admin, subscribe to real Orders for detailed alerts
        let unsubOrders: (() => void) | undefined;
        if (isAdmin) {
            unsubOrders = subscribeToNewOrders(appStartIso.current, (order: Order) => {
                if (order.date > appStartIso.current) {
                    showToast(`🛍️ New Order: ${order.customerName} - ₦${order.total.toLocaleString()}`, { type: 'success', duration: 10000 });
                }
            });
        }

        return () => {
            if (unsubOrders) unsubOrders();
        };
    }, [isAdmin, showToast]);

    // This component renders nothing visually itself; it just triggers toasts.
    return null;
};

export default LiveNotifications;
