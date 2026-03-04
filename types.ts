
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  description: string;
  category: string;
  stock: number;
  tags: string[];
  colors?: { name: string; hex: string; image?: string }[];
  sizes?: string[];
  features?: string[];
  composition?: string[];
  specifications?: string[];
  isVisible?: boolean;
  costPrice?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'Pending' | 'Shipped' | 'Delivered';
  paymentMethod?: 'Paystack' | 'COD';
  paymentStatus?: 'Paid' | 'Pending' | 'Failed';
  paymentReference?: string;
  userId?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  date: string;
}

export interface RestockRequest {
  id: string;
  productId: string;
  customerName: string;
  notificationChannel: 'email' | 'whatsapp';
  customerEmail?: string;
  customerWhatsapp?: string;
  date: string;
  status?: 'Pending' | 'Notified';
}

export interface ViewLog {
  productId: string;
  timestamp: number;
}

export interface SectionConfig {
  id: string;
  title: string;
  type: 'carousel' | 'grid';
  productIds: string[];
  isVisible: boolean;
}

export interface HomeLayoutConfig {
  sections: SectionConfig[];
  showCatalog: boolean;
  // Static Section Visibility & Configuration
  showHero?: boolean;
  showFeatures?: boolean;
  showBoutique?: boolean;
  boutiqueBannerImage?: string;
  boutiqueBannerTitle?: string; // NEW: Customizable Title
  showManor?: boolean;
  manorProductIds?: string[];
  showStyling?: boolean;
  stylingProductIds?: string[]; // Legacy fallback
  stylingLooks?: {            // NEW: Multiple Looks
    id: string;
    image: string;
    title: string;
    price: string;
    productIds: string[];
    hotspots?: { x: number; y: number; label: string; price?: string }[];
  }[];
  showBundles?: boolean;
  bundlesProductIds?: string[];
  showLifestyle?: boolean;

  // Dynamic Content
  heroImage?: string;
  lifestyleImages?: [string, string];

  // NEW: Manual overrides for Curated Picks tabs
  curatedPicks?: Record<string, string[]>; // e.g., { 'T-Shirts': ['id1', 'id2'] }
  curatedCategories?: { id: string; label: string; isVisible: boolean }[];
}

export interface FooterPage {
  slug: string;
  title: string;
  content: string;
  category: 'Customer Services' | 'Company' | 'Categories' | 'Policies';
}

export interface Brand {
  id: string;
  name: string;
}

export interface AdminLog {
  id: string;
  action: string;
  details: string;
  userEmail: string;
  timestamp: number;
  // Enhanced audit trail fields
  ipAddress?: string;
  userAgent?: string;
  beforeState?: string; // JSON string of previous state
  afterState?: string;  // JSON string of new state
  resourceType?: string;
  resourceId?: string;
}


export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'super_admin' | 'manager' | 'support' | 'viewer';
  permissions?: string[]; // Custom permission overrides
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  lastLoginAt?: string;
  createdAt: string;
}
