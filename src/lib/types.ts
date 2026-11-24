export type BadgeType = 'BESTSELLER' | 'POPULAR' | 'NEW' | 'OFFER';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface CategoryRef {
  id: string;
  slug: string;
  name: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  typeLabel: string | null;
  description: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  badgeLabel: string | null;
  badgeType: BadgeType | null;
  rating: number;
  reviewCount: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  colors: ProductColor[];
  categories: CategoryRef[];
}

export interface Category extends CategoryRef {
  description: string | null;
  image: string | null;
  _count: { products: number };
}

export interface AdminCategory extends Category {
  sortOrder: number;
  isActive: boolean;
}

export interface Showcase {
  id: string;
  title: string;
  tag: string;
  image: string;
}

export interface AdminShowcase extends Showcase {
  sortOrder: number;
  isActive: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
}

export interface AdminDeliveryZone extends DeliveryZone {
  sortOrder: number;
  isActive: boolean;
  _count: { orders: number };
}

export interface CreateOrderPayload {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  deliveryZoneId: string;
  items: { productId: string; colorName?: string; quantity: number }[];
}

export interface PlacedOrder {
  id: string;
  code: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface TrackedOrder {
  code: string;
  status: OrderStatus;
  customerName: string;
  deliveryZoneName: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items: { productName: string; productImage: string | null; colorName: string | null; quantity: number; lineTotal: number }[];
  statusLogs: { status: OrderStatus; createdAt: string }[];
}

// ── Admin ───────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AdminProduct extends Product {
  _count: { orderItems: number };
}

export interface AdminOrderRow {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  deliveryZoneName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  _count: { items: number };
}

export interface AdminOrderList extends Paginated<AdminOrderRow> {
  counts: Partial<Record<OrderStatus | 'ALL', number>>;
}

export interface AdminOrderDetail {
  order: {
    id: string;
    code: string;
    customerName: string;
    phone: string;
    address: string;
    note: string | null;
    deliveryZoneName: string;
    deliveryFee: number;
    subtotal: number;
    total: number;
    paymentMethod: string;
    status: OrderStatus;
    adminNote: string | null;
    createdAt: string;
    updatedAt: string;
    items: {
      id: string;
      productName: string;
      productImage: string | null;
      colorName: string | null;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
      product: { id: string; slug: string; stock: number } | null;
    }[];
    statusLogs: {
      id: string;
      status: OrderStatus;
      note: string | null;
      createdAt: string;
      changedBy: { id: string; name: string } | null;
    }[];
  };
  allowedTransitions: OrderStatus[];
}

export interface DashboardStats {
  rangeDays: number;
  kpis: {
    revenue: number;
    revenueChange: number | null;
    orders: number;
    ordersChange: number | null;
    avgOrderValue: number;
    todayRevenue: number;
    todayOrders: number;
    pendingOrders: number;
    activeProducts: number;
  };
  statusBreakdown: { status: OrderStatus; count: number }[];
  series: { day: string; orders: number; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  lowStock: { id: string; name: string; stock: number; image: string | null }[];
  recentOrders: { id: string; code: string; customerName: string; total: number; status: OrderStatus; createdAt: string }[];
  generatedAt: string;
}
