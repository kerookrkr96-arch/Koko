export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'accountant' | 'employee';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  customerName: string;
  items: SaleItem[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  finalTotal: number;
  date: string;
  type: 'sales' | 'invoice' | 'instant';
}

export interface InvoiceSale extends Sale {
  registrationNumber: string;
  companyName: string;
  archived: boolean;
}

export interface InstantSale extends Sale {
  paymentType: 'card' | 'transfer' | 'cash' | 'other';
  paymentStatus: 'paid' | 'partial' | 'pending';
  amountPaid: number;
  amountRemaining: number;
}

export interface Return {
  id: string;
  customerName: string;
  items: SaleItem[];
  total: number;
  date: string;
  type: 'sales-return' | 'invoice-return';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalPurchases: number;
  totalDebt: number;
  payments: Payment[];
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  note: string;
}

export interface DeferredSale {
  id: string;
  customerName: string;
  items: SaleItem[];
  total: number;
  amountPaid: number;
  amountRemaining: number;
  payments: Payment[];
  date: string;
  status: 'pending' | 'partial' | 'paid';
}

export interface Settings {
  companyName: string;
  companyLogo: string;
  invoiceBackground: string;
  invoiceTemplate: 'default' | 'modern' | 'classic';
  registrationNumber: string;
}
