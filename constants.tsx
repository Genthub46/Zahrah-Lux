
import { Product, FooterPage, HomeLayoutConfig } from './types';

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
  { slug: 'about-us', title: 'About Us', category: 'Company', content: 'Zarhrah Luxury is a premier fashion destination bridging London style and Lagos vibrance.' },
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
  { slug: 'exchange-policy', title: 'Exchange Policy', category: 'Policies', content: 'Artifacts can be exchanged for size variations within 7 days of delivery.' },
  { slug: 'return-policy', title: 'Return Policy', category: 'Policies', content: 'Detailed terms for artifact returns and quality inspection.' },
  { slug: 'refund-policy', title: 'Refund Policy', category: 'Policies', content: 'Refunds are processed to original payment methods within 5-7 business days.' },
  { slug: 'privacy-policy', title: 'Privacy Policy', category: 'Policies', content: 'Your personal data is managed with absolute luxury standard security.' },
  { slug: 'cookie-policy', title: 'Cookie Policy', category: 'Policies', content: 'Information on how we enhance your browsing experience.' },
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
  sections: [
    { id: 'sec-1', title: 'NEW ARRIVALS', type: 'grid', isVisible: true, productIds: [] },
    { id: 'sec-2', title: 'BEST SELLERS', type: 'carousel', isVisible: true, productIds: [] }
  ]
};
