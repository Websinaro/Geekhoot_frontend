export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  address?: string;
  houseNo?: string;
  streetNear?: string;
  road?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  stock: number;
  rating: number;
  bookings: number;
  category: string;
  _count?: {
    reviews: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingId?: string;
  courier?: string;
  notes?: string;
  locationUrl?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  product: Product;
}
