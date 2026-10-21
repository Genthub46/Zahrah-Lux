
import { Order, ViewLog, Product } from '../types';

export const processDailySales = (orders: Order[], days: number = 7) => {
    const salesMap = new Map<string, number>();

    // Initialize with requested days to ensure continuous axis
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        salesMap.set(dateStr, 0);
    }

    orders.forEach(order => {
        const dateStr = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (salesMap.has(dateStr)) {
            salesMap.set(dateStr, (salesMap.get(dateStr) || 0) + order.total);
        }
    });

    return Array.from(salesMap).map(([date, sales]) => ({ date, sales }));
};

export const processDailyVisits = (logs: ViewLog[], days: number = 7) => {
    const visitsMap = new Map<string, number>();

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        visitsMap.set(dateStr, 0);
    }

    logs.forEach(log => {
        const dateStr = new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (visitsMap.has(dateStr)) {
            visitsMap.set(dateStr, (visitsMap.get(dateStr) || 0) + 1);
        }
    });

    return Array.from(visitsMap).map(([date, visits]) => ({ date, visits }));
};

export const processConversionData = (logs: ViewLog[], orders: Order[]) => {
    const totalVisits = logs.length;
    const totalOrders = orders.length;

    return [
        { name: 'Product Views', value: totalVisits },
        { name: 'Purchases', value: totalOrders }
    ];
};

export const processProfitability = (orders: Order[], products: Product[], days: number = 7) => {
    const dataMap = new Map<string, { revenue: number, cost: number, profit: number }>();

    // Initialize requested days
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dataMap.set(dateStr, { revenue: 0, cost: 0, profit: 0 });
    }

    orders.forEach(order => {
        const dateStr = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dataMap.has(dateStr)) {
            const entry = dataMap.get(dateStr)!;

            // Calculate Cost for this order
            let orderCost = 0;
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.id);
                const costPrice = product?.costPrice || 0;
                orderCost += costPrice * item.quantity;
            });

            const orderRevenue = order.total;
            const orderProfit = orderRevenue - orderCost;

            entry.revenue += orderRevenue;
            entry.cost += orderCost;
            entry.profit += orderProfit;

            dataMap.set(dateStr, entry);
        }
    });

    return Array.from(dataMap).map(([date, data]) => ({
        date,
        ...data
    }));
};

export const calculateInventoryVelocity = (orders: Order[]) => {
    const velocityMap = new Map<string, number>();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    orders.forEach(order => {
        const orderDate = new Date(order.date);
        if (orderDate >= thirtyDaysAgo) {
            order.items.forEach(item => {
                const current = velocityMap.get(item.id) || 0;
                velocityMap.set(item.id, current + item.quantity);
            });
        }
    });

    // Convert total 30-day sales to daily average
    const result = new Map<string, number>();
    velocityMap.forEach((total, id) => {
        result.set(id, total / 30);
    });

    return result;
};
