
import { Order, ViewLog, Product } from '../types';

export const processDailySales = (orders: Order[]) => {
    const salesMap = new Map<string, number>();

    // Initialize with last 7 days to ensure we have data points even if 0
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        salesMap.set(dateStr, 0);
    }

    orders.forEach(order => {
        // Only count completed/paid orders ideally, but 'Pending' might mean paid in this context until manual update. 
        // Assuming all orders in DB are valid for now.
        const dateStr = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (salesMap.has(dateStr)) {
            salesMap.set(dateStr, (salesMap.get(dateStr) || 0) + order.total);
        } else {
            // Handle dates older than 7 days if we want to show longer history? 
            // For now, let's just stick to the map's keys if request is "Last 7 Days"
            // Or we can dynamically add.
            // Let's stick to simple "Last 7 Days" view for the chart.
        }
    });

    return Array.from(salesMap).map(([date, sales]) => ({ date, sales }));
};

export const processDailyVisits = (logs: ViewLog[]) => {
    const visitsMap = new Map<string, number>();

    for (let i = 6; i >= 0; i--) {
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
    const uniqueVisitors = new Set(logs.map(l => l.productId)).size; // This is actually unique products viewed, not visitors. 
    // We don't track unique users easily without auth. 
    // So "Visits" will be total view logs.
    const totalVisits = logs.length;
    const totalOrders = orders.length;

    // We can't really do "Users who bought vs didn't" perfectly without user tracking.
    // But we can show "Sessions (Proxied by ViewLogs) vs Orders".

    return [
        { name: 'Product Views', value: totalVisits },
        { name: 'Purchases', value: totalOrders }
    ];
};

export const processProfitability = (orders: Order[], products: Product[]) => {
    const dataMap = new Map<string, { revenue: number, cost: number, profit: number }>();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
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
                // Find current cost of product
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
