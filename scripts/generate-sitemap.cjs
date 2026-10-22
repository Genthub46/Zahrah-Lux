/**
 * Production Sitemap & Robots.txt Generator for Zahrah Luxury Boutique
 * Generates SEO-compliant sitemap.xml with Google Image Extension and robots.txt
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://zahrahluxury.com';
const SECONDARY_DOMAIN = 'https://zahrah-boutique.web.app';
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const DIST_DIR = path.resolve(__dirname, '../dist');

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString().replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

async function fetchFirestoreData() {
    try {
        let admin;
        try {
            admin = require('../functions/node_modules/firebase-admin');
        } catch {
            admin = require('firebase-admin');
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                projectId: 'zahrah-boutique'
            });
        }

        const db = admin.firestore();

        console.log('Fetching live products and pages from Firestore...');
        const [productsSnap, pagesSnap] = await Promise.all([
            db.collection('products').get(),
            db.collection('pages').get()
        ]);

        const products = [];
        productsSnap.forEach(doc => {
            const data = doc.data();
            if (data.isVisible !== false) {
                products.push({
                    id: doc.id,
                    name: data.name || '',
                    images: Array.isArray(data.images) ? data.images : [],
                    updatedAt: data.updatedAt || data.createdAt || null
                });
            }
        });

        const pages = [];
        pagesSnap.forEach(doc => {
            const data = doc.data();
            if (data.isVisible !== false && data.slug) {
                pages.push({
                    slug: data.slug,
                    title: data.title || ''
                });
            }
        });

        console.log(`Retrieved ${products.length} visible products and ${pages.length} custom pages.`);
        return { products, pages };
    } catch (err) {
        console.warn('Warning: Could not connect to Firestore directly (offline or permissions). Using fallback catalog.', err.message);
        return { products: [], pages: [] };
    }
}

async function generate() {
    const today = new Date().toISOString().split('T')[0];
    const { products, pages } = await fetchFirestoreData();

    // 1. Static High-Priority Routes
    const staticUrls = [
        {
            loc: `${DOMAIN}/`,
            lastmod: today,
            changefreq: 'daily',
            priority: '1.0'
        },
        {
            loc: `${DOMAIN}/lookbook`,
            lastmod: today,
            changefreq: 'weekly',
            priority: '0.9'
        },
        {
            loc: `${DOMAIN}/wishlist`,
            lastmod: today,
            changefreq: 'weekly',
            priority: '0.6'
        },
        {
            loc: `${DOMAIN}/p/privacy-policy`,
            lastmod: today,
            changefreq: 'monthly',
            priority: '0.5'
        }
    ];

    // 2. Custom Content / Footer Pages
    const fallbackSlugs = [
        'about', 'contact-us', 'customer-care', 'faq', 'shipping', 'returns',
        'terms-of-service', 'refund-policy', 'exchange-policy', 'cookie-policy',
        'orders-payments', 'men', 'women', 'new-arrivals'
    ];

    const slugSet = new Set(fallbackSlugs);
    pages.forEach(p => slugSet.add(p.slug));

    const pageUrls = Array.from(slugSet).map(slug => ({
        loc: `${DOMAIN}/p/${slug}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.7'
    }));

    // 3. Product Pages with Google Image Extension
    const productUrls = products.map(p => {
        // Approximate date from p-TIMESTAMP id if available
        let lastmod = today;
        const tsMatch = p.id.match(/\d{12,}/);
        if (tsMatch) {
            try {
                const date = new Date(parseInt(tsMatch[0]));
                if (!isNaN(date.getTime()) && date.getFullYear() >= 2024) {
                    lastmod = date.toISOString().split('T')[0];
                }
            } catch {}
        }

        return {
            loc: `${DOMAIN}/product/${p.id}`,
            lastmod,
            changefreq: 'weekly',
            priority: '0.8',
            images: p.images.slice(0, 3).map(imgUrl => ({
                loc: imgUrl,
                title: p.name
            }))
        };
    });

    const allUrls = [...staticUrls, ...pageUrls, ...productUrls];

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    for (const item of allUrls) {
        xml += `  <url>\n`;
        xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
        xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
        xml += `    <priority>${item.priority}</priority>\n`;

        if (item.images && item.images.length > 0) {
            for (const img of item.images) {
                if (img.loc) {
                    xml += `    <image:image>\n`;
                    xml += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`;
                    if (img.title) {
                        xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
                    }
                    xml += `    </image:image>\n`;
                }
            }
        }

        xml += `  </url>\n`;
    }

    xml += `</urlset>\n`;

    // Ensure output directories exist
    if (!fs.existsSync(PUBLIC_DIR)) {
        fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }

    // Write public/sitemap.xml
    const publicSitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
    fs.writeFileSync(publicSitemapPath, xml, 'utf8');
    console.log(`Generated ${publicSitemapPath} with ${allUrls.length} indexed URLs.`);

    // Write public/robots.txt
    const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /checkout
Disallow: /orders
Disallow: /stress-test
Disallow: /Zarhrah_Admin_Guide.html
Disallow: /*Admin_Guide*

# Sitemaps
Sitemap: ${DOMAIN}/sitemap.xml
Sitemap: ${SECONDARY_DOMAIN}/sitemap.xml
`;
    const publicRobotsPath = path.join(PUBLIC_DIR, 'robots.txt');
    fs.writeFileSync(publicRobotsPath, robotsTxt, 'utf8');
    console.log(`Generated ${publicRobotsPath}.`);

    // If dist directory exists, copy directly so current build is also ready immediately
    if (fs.existsSync(DIST_DIR)) {
        fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml, 'utf8');
        fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt, 'utf8');
        console.log(`Synced sitemap.xml and robots.txt to ${DIST_DIR}`);
    }
}

generate().catch(err => {
    console.error('Sitemap generator failed:', err);
    process.exit(1);
});
