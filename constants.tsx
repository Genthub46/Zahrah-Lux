
import { Product, FooterPage, HomeLayoutConfig } from './types';
export const PRODUCT_CATEGORIES = [
  'Apparel',
  'Accessories',
  'Footwear',
  'Bags',
  'Beauty',
  'Watches',
  'Other'
] as const;

export const ADMIN_EMAILS = [
  'admin@zahrah.com'
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'ash-6',
    name: 'Ashluxe Street Graffiti Cap Black',
    brand: 'ASHLUXE',
    price: 190000,
    images: ['https://i.ibb.co/zH8Xy6S/cap-black.png'],
    description: 'The Ashluxe Street Graffiti Cap delivers a bold interpretation of luxury streetwear. Designed with a structured crown and distinctive graphic detailing, this cap completes modern outfits with an elevated edge.',
    category: 'Accessories',
    stock: 20,
    tags: ['new', 'arrivals', 'headwear'],
    colors: [{ name: 'Black', hex: '#000000' }],
    sizes: ['OS'],
    features: [
      'Structured six-panel design',
      'Premium fabric construction',
      'Signature Ashluxe graffiti graphic',
      'Designed for luxury streetwear styling'
    ],
    composition: [
      '100% Premium Cotton Twill',
      'High-density embroidery'
    ],
    specifications: [
      'Adjustable strap-back',
      'Breathable eyelets',
      'Reinforced brim'
    ]
  },
  {
    id: 'ash-1',
    name: 'Ashluxe Pixel Denim Jacket Green',
    brand: 'ASHLUXE',
    price: 288800,
    images: ['https://i.ibb.co/LdY7pM7/jacket-green.png'],
    description: 'High-density pixelated denim jacket with signature hardware. A refined piece curated for clients who shop premium fashion.',
    category: 'Apparel',
    stock: 5,
    tags: ['bundle', 'new', 'streetwear', 'green'],
    colors: [{ name: 'Green', hex: '#2D5A27' }, { name: 'Black', hex: '#000000' }],
    sizes: ['S', 'M', 'L', 'XL'],
    features: ['Pixelated denim weave', 'Branded hardware', 'Relaxed fit'],
    composition: ['100% Rigid Denim'],
    specifications: ['Dry clean only']
  },
  {
    id: 'ash-5',
    name: 'Ashluxe Ngn X Bra T-Shirt',
    brand: 'ASHLUXE',
    price: 304000,
    images: ['https://i.ibb.co/vYm6sJ3/tee-black.png'],
    description: 'Artistic collage graphic tee on premium heavy cotton.',
    category: 'Apparel',
    stock: 10,
    tags: ['new', 'arrivals'],
    colors: [{ name: 'Black', hex: '#000000' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    features: ['Heavyweight cotton', 'High-res print'],
    composition: ['100% Organic Cotton']
  }
];

export const INITIAL_FOOTER_PAGES: FooterPage[] = [
  // Customer Services
  { slug: 'customer-care', title: 'Customer Care', category: 'Customer Services', content: 'Our dedicated support team is available 24/7 to assist with your luxury inquiries.' },
  { slug: 'shipping', title: 'Shipping', category: 'Customer Services', content: 'We offer global express shipping. London deliveries within 24h, Lagos within 48h.' },
  { slug: 'orders-payments', title: 'Orders & Payments', category: 'Customer Services', content: 'We accept all major credit cards and secure bank transfers via Paystack.' },
  { slug: 'returns', title: 'Returns', category: 'Customer Services', content: '14-day premium return policy for all unworn artifacts in original packaging.' },
  { slug: 'faq', title: 'FAQ', category: 'Customer Services', content: 'Find answers to common questions about our boutique services here.' },
  { slug: 'my-account', title: 'My Account', category: 'Customer Services', content: 'Manage your personal archive and tracking information here.' },

  // Company
  { slug: 'about', title: 'About Us', category: 'Company', content: `Welcome to Zahrah Luxury.\n\nZahrah Luxury is a premier fashion destination bridging London style and Lagos vibrance. We curate the finest quality apparel, blending contemporary streetwear with classic, timeless elegance.\n\nOur mission is to provide an elite, VIP shopping experience for our clientele, where every garment tells a story of craftsmanship, exclusivity, and superior design.\n\nAt Zahrah, luxury is not just a label—it is a lifestyle.` },
  { slug: 'careers', title: 'Careers', category: 'Company', content: 'Join our team of high-fashion curators and visionaries.' },
  { slug: 'contact-us', title: 'Contact Us', category: 'Company', content: 'Reach out via WhatsApp or email for personalized styling sessions.' },
  { slug: 'editorial', title: 'Editorial', category: 'Company', content: 'Read the latest stories from the heart of Zarhrah.' },

  // Categories
  { slug: 'new-arrivals', title: 'New Arrivals', category: 'Categories', content: 'Discover the latest additions to our curated boutique.' },
  { slug: 'men', title: 'Men', category: 'Categories', content: 'Premium streetwear and tailoring for the modern man.' },
  { slug: 'women', title: 'Women', category: 'Categories', content: 'Elegant collections for the sophisticated woman.' },
  { slug: 't-shirts', title: 'T-shirts', category: 'Categories', content: 'Heavyweight organic cotton essentials.' },
  { slug: 'pants', title: 'Pants', category: 'Categories', content: 'Refined trousers and denim artifacts.' },

  // Policies
  { slug: 'exchange-policy', title: 'Exchange Policy', category: 'Policies', content: 'Artifacts can be exchanged for size variations within 7 days of delivery. Please ensure all tags remain attached and garments are unworn.' },
  { slug: 'return-policy', title: 'Return Policy', category: 'Policies', content: 'Detailed terms for artifact returns and quality inspection. We pristine items in original packaging within 14 days of delivery. Custom-tailored items are non-refundable.' },
  { slug: 'refund-policy', title: 'Refund Policy', category: 'Policies', content: `**Effective Date:** March 2026\n\nAt Zahrah Luxury, we pride ourselves on delivering exclusive, high-quality artifacts to our esteemed clientele.\n\n### **1. All Sales Are Final**\nDue to the exclusive and limited nature of our collections, we operate a strict **NO RETURNS and NO REFUNDS** policy. All purchases made through Zahrah Luxury are considered final.\n\n### **2. Quality Assurance**\nEvery item undergoes rigorous quality control and inspection by our team before being dispatched. We ensure that every piece meets our exacting standards of luxury.\n\n### **3. Defective or Damaged Items**\nWhile we meticulously verify all artifacts, in the unlikely event that you receive a defective or damaged item straight out of the packaging, please contact our concierge team at admin@zahrah.com within 24 hours of delivery. Such exceptional cases will be reviewed entirely at our discretion, and we may offer an exchange or store credit, but no cash refunds.\n\n### **4. Sizing and Fit**\nPlease refer carefully to our sizing guides or consult our tailored concierge before placing an order to ensure the perfect fit, as we cannot accept returns for sizing issues.\n\nBy completing a purchase with Zahrah Luxury, you acknowledge and agree to this policy.` },
  { slug: 'terms-of-service', title: 'Terms of Service', category: 'Policies', content: `**Effective Date:** March 2026\n\nWelcome to Zahrah Luxury.\n\nBy accessing or using our website and purchasing our luxury artifacts, you agree to be bound by the following Terms of Service.\n\n### **1. General Conditions**\nWe reserve the right to refuse service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service, or our exclusive designs, without express written permission by us.\n\n### **2. Pricing and Availability**\nAll prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue a product without notice at any time. Given the limited nature of our drops, artifacts may sell out quickly; adding an item to your cart does not reserve it until checkout is completed.\n\n### **3. Orders and Payment**\nBy placing an order, you agree that all details you provide are accurate and that you are an authorized user of the payment method provided. We reserve the right to cancel any order we suspect to be fraudulent.\n\n### **4. Delivery**\nWe offer both local and international shipping. Delivery times are estimates and may be subject to delays outside of our control.\n\n### **5. Intellectual Property**\nAll content, including imagery, branding, and text, is the exclusive property of Zahrah Luxury. Unauthorized use of our intellectual property is strictly prohibited.\n\n### **6. Contact**\nFor any inquiries regarding these terms, please contact our concierge at admin@zahrah.com.` },
  { slug: 'privacy-policy', title: 'Privacy Policy', category: 'Policies', content: 'Please view our dedicated Privacy Policy page for comprehensive information regarding how we handle and protect your personal data.' },
  { slug: 'cookie-policy', title: 'Cookie Policy', category: 'Policies', content: `**Effective Date:** February 24, 2026\n\nAt **Zahrah Boutique**, we use cookies and similar tracking technologies to elevate your luxury shopping experience, analyze platform traffic, and serve tailored recommendations.\n\n### **1. What Are Cookies?**\nCookies are small text files stored on your device when you visit our website. They help the site function securely and smoothly, allowing us to remember your preferences (like your cart items or selected region).\n\n### **2. Types of Cookies We Use**\n*   **Strictly Necessary Cookies:** Essential for the website to function (e.g., secure login, shopping cart retention).\n*   **Performance & Analytics Cookies:** Help us understand how visitors interact with our boutique (e.g., Google Analytics) so we can improve the user experience.\n*   **Functionality Cookies:** Remember your choices (such as language or region sorting) to provide a more personalized visit.\n*   **Targeting & Advertising Cookies:** Used to deliver relevant advertisements to you based on your browsing interests on our site.\n\n### **3. Managing Your Preferences**\nUnder the NDPA, you have the right to accept or decline non-essential cookies. You can update your preferences using the "Cookie Preferences" banner at the bottom of your screen, or by adjusting your browser settings to block cookies entirely.\n\n### **4. Contact Us**\nIf you have any questions about our use of cookies, please contact us at **admin@zahrah.com**.` },
];

export const APP_STORAGE_KEY = 'ZARHRAH_LUXURY_V1';
export const WISHLIST_STORAGE_KEY = 'ZARHRAH_WISHLIST';
export const PRODUCTS_STORAGE_KEY = 'ZARHRAH_PRODUCTS';
export const ORDERS_STORAGE_KEY = 'ZARHRAH_ORDERS';
export const REVIEWS_STORAGE_KEY = 'ZARHRAH_REVIEWS';
export const RESTOCK_REQUESTS_STORAGE_KEY = 'ZARHRAH_RESTOCK_REQUESTS';
export const ANALYTICS_STORAGE_KEY = 'ZARHRAH_VIEW_LOGS';
export const FOOTER_PAGES_STORAGE_KEY = 'ZARHRAH_FOOTER_PAGES';

export const INITIAL_HOME_LAYOUT: HomeLayoutConfig = {
  showCatalog: true,
  showHero: true,
  showFeatures: true,
  showBoutique: true,
  boutiqueBannerImage: "https://images.unsplash.com/photo-1569388330292-7de71879fb1f?q=80&w=2527&auto=format&fit=crop",
  showManor: true,
  manorProductIds: ['ash-1'],
  showStyling: true,
  stylingProductIds: ['ash-5'],
  showBundles: true,
  bundlesProductIds: ['ash-6'],
  showLifestyle: true,
  sections: [
    {
      id: 'sec-new-arrivals',
      title: 'New Arrivals',
      type: 'carousel',
      productIds: [], // Dynamic
      isVisible: true
    },
    {
      id: 'sec-trending',
      title: 'Trending Now',
      type: 'carousel',
      productIds: [],
      isVisible: true
    }
  ],
  heroImage: "https://images.unsplash.com/photo-1549037173-e3b717902c57?auto=format&fit=crop&w=1920&q=80",
  lifestyleImages: [
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1549439602-43ebca23d7bc?q=80&w=2070&auto=format&fit=crop"
  ]
};
