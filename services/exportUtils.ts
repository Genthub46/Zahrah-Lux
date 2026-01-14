import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, RestockRequest } from '../types';

export const exportOrdersToCSV = (orders: Order[]) => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Address', 'Status', 'Total (NGN)', 'Items'];

    const rows = orders.map(order => [
        order.id,
        new Date(order.date).toLocaleDateString(),
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        `"${order.customerAddress.replace(/"/g, '""')}"`, // Escape quotes
        order.status,
        order.total,
        `"${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}"`
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `zahrah_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Helper: Load Image from URL to Image Element
const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
};

// Helper: Convert Image URL to Base64
const toBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = () => resolve(''); // Resolve empty on error to not break flow
    });
};

export const exportOrdersToPDF = async (orders: Order[]) => {
    const doc = new jsPDF();


    // Embedded Gold SVG from Logo.tsx
    const GOLD_LOGO_SVG = `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8C6E33" />
          <stop offset="50%" style="stop-color:#C5A059" />
          <stop offset="100%" style="stop-color:#E2C285" />
        </linearGradient>
        <path id="topArc" d="M65 110 A 35 35 0 0 1 135 110" />
        <path id="bottomArc" d="M65 125 A 35 35 0 0 0 135 125" />
      </defs>
      <circle cx="100" cy="110" r="65" stroke="url(#goldGradient)" stroke-width="1" opacity="0.5" />
      <g stroke="url(#goldGradient)" stroke-width="1.5" stroke-linecap="round" opacity="0.8">
        <path d="M60 145C45 130 45 90 60 75" fill="none" />
        <path d="M55 75 L45 70" />
        <path d="M55 90 L45 85" />
        <path d="M55 105 L45 100" />
        <path d="M55 120 L45 115" />
        <path d="M55 135 L45 130" />
        <path d="M140 145C155 130 155 90 140 75" fill="none" />
        <path d="M145 75 L155 70" />
        <path d="M145 90 L155 85" />
        <path d="M145 105 L155 100" />
        <path d="M145 120 L155 115" />
        <path d="M145 135 L155 130" />
      </g>
      <g fill="url(#goldGradient)">
        <path d="M80 55 L75 40 L90 48 L100 35 L110 48 L125 40 L120 55 H80Z" />
        <circle cx="75" cy="38" r="2" />
        <circle cx="100" cy="33" r="2.5" />
        <circle cx="125" cy="38" r="2" />
      </g>
      <circle cx="100" cy="110" r="55" stroke="url(#goldGradient)" stroke-width="2.5" fill="none" />
      <circle cx="100" cy="110" r="50" stroke="url(#goldGradient)" stroke-width="1" fill="none" />
      <text x="100" y="125" text-anchor="middle" fill="url(#goldGradient)" style="font-size:42px;font-weight:bold;font-family:'Times New Roman', serif;">ZL</text>
      <text fill="url(#goldGradient)" style="font-size:8px;font-weight:bold;letter-spacing:2px;font-family:sans-serif;">
        <textPath href="#topArc" startOffset="50%" text-anchor="middle">ZARHRAH</textPath>
      </text>
      <text fill="url(#goldGradient)" style="font-size:8px;font-weight:bold;letter-spacing:2px;font-family:sans-serif;">
        <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">LUXURY</textPath>
      </text>
      <path d="M60 155 Q100 175 140 155" stroke="url(#goldGradient)" stroke-width="8" stroke-linecap="round" opacity="0.9" fill="none" />
      <text x="100" y="166" text-anchor="middle" fill="white" style="font-size:7px;font-weight:900;letter-spacing:1px;font-family:sans-serif;">COLLECTIONS</text>
    </svg>
    `;

    // --- Load Logo (From embedded SVG) ---
    try {
        const svgBase64 = `data:image/svg+xml;base64,${btoa(GOLD_LOGO_SVG)}`;
        const logoImg = await toBase64(svgBase64); // Convert SVG data URI to PNG data URI (via canvas in helper)
        const logoSize = 25;
        doc.addImage(logoImg, 'PNG', 14, 10, logoSize, logoSize);
    } catch (e) {
        console.warn("Logo load failed", e);
    }

    // --- Header ---
    doc.setFontSize(16);
    doc.setTextColor(197, 160, 89); // #C5A059
    doc.text('ZAHRAH LUXURY', 45, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('EXECUTIVE ORDER MANIFEST', 45, 26);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 45, 32);

    // --- Total Yield (Top Right) ---
    const totalYield = orders.reduce((sum, order) => sum + order.total, 0);

    doc.setFontSize(10);
    doc.setTextColor(150); // Stone-500 equivalent for label
    doc.text('TOTAL PERIOD YIELD', 196, 20, { align: 'right' });

    doc.setFontSize(16);
    doc.setTextColor(28, 25, 23); // Stone-900 for value
    doc.text(`N${totalYield.toLocaleString()}`, 196, 27, { align: 'right' });

    // --- Prepare Table Data (Fetch Images) ---
    const tableData = await Promise.all(orders.map(async (order) => {
        // Attempt to get first product image
        let productImgData: any = null;
        if (order.items.length > 0 && order.items[0].images && order.items[0].images[0]) {
            try {
                const b64 = await toBase64(order.items[0].images[0]);
                if (b64) productImgData = b64;
            } catch (e) { /* ignore */ }
        }

        return [
            { content: '', image: productImgData }, // Custom image object for cell
            order.id.slice(-8).toUpperCase(),
            new Date(order.date).toLocaleDateString(),
            order.customerName,
            order.items.map(i => `${i.name} (x${i.quantity})`).join(',\n'),
            order.status.toUpperCase(),
            `N${order.total.toLocaleString()}`
        ];
    }));

    // --- Render Table ---
    autoTable(doc, {
        head: [["IMG", "ID", "DATE", "RECIPIENT", "ARTIFACTS", "STATUS", "YIELD"]],
        body: tableData,
        startY: 40,
        theme: 'plain',
        styles: {
            fontSize: 7,
            cellPadding: 3,
            valign: 'middle',
            font: 'helvetica'
        },
        headStyles: {
            fillColor: [28, 25, 23], // Stone 900
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [250, 250, 249] // Stone 50
        },
        columnStyles: {
            0: { cellWidth: 15, minCellHeight: 15 }, // Image column
            4: { cellWidth: 50 }, // Items column wider
            6: { halign: 'right', fontStyle: 'bold' } // Total right aligned
        },
        didDrawCell: (data) => {
            // Draw Image in first column
            if (data.column.index === 0 && data.section === 'body') {
                const cellData = data.cell.raw as any;
                if (cellData && cellData.image) {
                    const imgSize = 10;
                    // Center image in cell
                    const x = data.cell.x + (data.cell.width - imgSize) / 2;
                    const y = data.cell.y + (data.cell.height - imgSize) / 2;
                    doc.addImage(cellData.image, 'JPEG', x, y, imgSize, imgSize);
                }
            }
        }
    });

    doc.save(`ZAHRAH_MANIFEST_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportWaitlistToPDF = async (requests: RestockRequest[], products: any[]) => {
    const doc = new jsPDF();

    // --- Load Logo (From embedded SVG - Reuse logic) ---
    try {
        // Re-defining SVG locally or we could export CONST if we refactor, 
        // but for now direct copy for stability.
        const GOLD_LOGO_SVG = `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8C6E33" />
            <stop offset="50%" style="stop-color:#C5A059" />
            <stop offset="100%" style="stop-color:#E2C285" />
          </linearGradient>
          <path id="topArc" d="M65 110 A 35 35 0 0 1 135 110" />
          <path id="bottomArc" d="M65 125 A 35 35 0 0 0 135 125" />
        </defs>
        <circle cx="100" cy="110" r="65" stroke="url(#goldGradient)" stroke-width="1" opacity="0.5" />
        <g stroke="url(#goldGradient)" stroke-width="1.5" stroke-linecap="round" opacity="0.8">
          <path d="M60 145C45 130 45 90 60 75" fill="none" />
          <path d="M55 75 L45 70" /><path d="M55 90 L45 85" /><path d="M55 105 L45 100" />
          <path d="M55 120 L45 115" /><path d="M55 135 L45 130" />
          <path d="M140 145C155 130 155 90 140 75" fill="none" />
          <path d="M145 75 L155 70" /><path d="M145 90 L155 85" /><path d="M145 105 L155 100" />
          <path d="M145 120 L155 115" /><path d="M145 135 L155 130" />
        </g>
        <g fill="url(#goldGradient)">
          <path d="M80 55 L75 40 L90 48 L100 35 L110 48 L125 40 L120 55 H80Z" />
          <circle cx="75" cy="38" r="2" /><circle cx="100" cy="33" r="2.5" /><circle cx="125" cy="38" r="2" />
        </g>
        <circle cx="100" cy="110" r="55" stroke="url(#goldGradient)" stroke-width="2.5" fill="none" />
        <circle cx="100" cy="110" r="50" stroke="url(#goldGradient)" stroke-width="1" fill="none" />
        <text x="100" y="125" text-anchor="middle" fill="url(#goldGradient)" style="font-size:42px;font-weight:bold;font-family:'Times New Roman', serif;">ZL</text>
        <text fill="url(#goldGradient)" style="font-size:8px;font-weight:bold;letter-spacing:2px;font-family:sans-serif;">
          <textPath href="#topArc" startOffset="50%" text-anchor="middle">ZARHRAH</textPath>
        </text>
        <text fill="url(#goldGradient)" style="font-size:8px;font-weight:bold;letter-spacing:2px;font-family:sans-serif;">
          <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">LUXURY</textPath>
        </text>
        <path d="M60 155 Q100 175 140 155" stroke="url(#goldGradient)" stroke-width="8" stroke-linecap="round" opacity="0.9" fill="none" />
        <text x="100" y="166" text-anchor="middle" fill="white" style="font-size:7px;font-weight:900;letter-spacing:1px;font-family:sans-serif;">COLLECTIONS</text>
      </svg>
      `;
        const svgBase64 = `data:image/svg+xml;base64,${btoa(GOLD_LOGO_SVG)}`;
        const logoImg = await toBase64(svgBase64);
        const logoSize = 25;
        doc.addImage(logoImg, 'PNG', 14, 10, logoSize, logoSize);
    } catch (e) {
        console.warn("Logo load failed", e);
    }

    // --- Header ---
    doc.setFontSize(16);
    doc.setTextColor(197, 160, 89); // #C5A059
    doc.text('ZAHRAH LUXURY', 45, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('WAITLIST INTELLIGENCE REPORT', 45, 26);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 45, 32);

    // --- Prepare Data ---
    const tableData = await Promise.all(requests.map(async (req) => {
        const product = products.find(p => p.id === req.productId);

        let productImgData: any = null;
        if (product && product.images && product.images[0]) {
            try {
                const b64 = await toBase64(product.images[0]);
                if (b64) productImgData = b64;
            } catch (e) { /* ignore */ }
        }

        return [
            { content: '', image: productImgData },
            product ? product.name : 'Unknown Artifact',
            req.customerName || 'Anonymous',
            `${req.customerEmail}\n${req.customerWhatsapp || ''}`,
            new Date(req.date).toLocaleDateString()
        ];
    }));

    // --- Render Table ---
    autoTable(doc, {
        head: [["IMG", "ARTIFACT", "CUSTOMER", "CONTACT", "REQUESTED"]],
        body: tableData,
        startY: 40,
        theme: 'plain',
        styles: {
            fontSize: 8,
            cellPadding: 3,
            valign: 'middle',
            font: 'helvetica'
        },
        headStyles: {
            fillColor: [28, 25, 23],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [250, 250, 249] // Stone 50
        },
        columnStyles: {
            0: { cellWidth: 15, minCellHeight: 15 },
            1: { fontStyle: 'bold' }
        },
        didDrawCell: (data) => {
            if (data.column.index === 0 && data.section === 'body') {
                const cellData = data.cell.raw as any;
                if (cellData && cellData.image) {
                    const imgSize = 10;
                    const x = data.cell.x + (data.cell.width - imgSize) / 2;
                    const y = data.cell.y + (data.cell.height - imgSize) / 2;
                    doc.addImage(cellData.image, 'JPEG', x, y, imgSize, imgSize);
                }
            }
        }
    });

    doc.save(`ZAHRAH_WAITLIST_${new Date().toISOString().split('T')[0]}.pdf`);
};
