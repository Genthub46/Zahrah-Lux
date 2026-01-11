
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  description: string;
  category: 'Apparel' | 'Footwear' | 'Accessories' | 'Beauty' | 'Travel' | 'Watches' | 'Perfumes' | 'Bags';
  stock: number;
  tags: string[];
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  features?: string[];
  composition?: string[];
  specifications?: string[];
  isVisible?: boolean;
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
  customerEmail: string;
  customerName: string;
  customerWhatsapp: string;
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
