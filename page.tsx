'use client';

import { useState, useEffect } from 'react';
import { getAuthUser, logout } from '@/lib/store';
import { User } from '@/lib/types';
import LoginPage from '@/components/LoginPage';
import { DashboardLayout } from '@/components/DashboardLayout';
import InventorySection from '@/components/InventorySection';
import SalesSection from '@/components/SalesSection';
import InvoiceSection from '@/components/InvoiceSection';
import InstantSalesSection from '@/components/InstantSalesSection';
import SalesReturnSection from '@/components/SalesReturnSection';
import InvoiceReturnSection from '@/components/InvoiceReturnSection';
import RecordsSection from '@/components/RecordsSection';
import CustomersSection from '@/components/CustomersSection';
import ReportsSection from '@/components/ReportsSection';
import SettingsSection from '@/components/SettingsSection';
import UserManagementSection from '@/components/UserManagementSection';
import {
  getSales,
  getInvoices,
  getInstantSales,
  getProducts,
  getCustomers,
} from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  ShoppingCart,
  FileText,
  Users,
  Zap,
  TrendingUp,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';

function HomePage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    todaySales: 0,
    todaySalesTotal: 0,
    todayInvoices: 0,
    todayInvoicesTotal: 0,
    todayInstant: 0,
    todayInstantTotal: 0,
    totalCustomers: 0,
    inventoryValue: 0,
  });

  useEffect(() => {
    const products = getProducts();
    const sales = getSales();
    const invoices = getInvoices();
    const instantSales = getInstantSales();
    const customers = getCustomers();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySalesList = sales.filter(
      (s) => new Date(s.date) >= today
    );
    const todayInvoicesList = invoices.filter(
      (i) => new Date(i.date) >= today
    );
    const todayInstantList = instantSales.filter(
      (i) => new Date(i.date) >= today
    );

    setStats({
      totalProducts: products.length,
      lowStockProducts: products.filter((p) => p.quantity < 5).length,
      todaySales: todaySalesList.length,
      todaySalesTotal: todaySalesList.reduce(
        (sum, s) => sum + (s.finalTotal || s.total),
        0
      ),
      todayInvoices: todayInvoicesList.length,
      todayInvoicesTotal: todayInvoicesList.reduce(
        (sum, i) => sum + (i.finalTotal || i.total),
        0
      ),
      todayInstant: todayInstantList.length,
      todayInstantTotal: todayInstantList.reduce(
        (sum, i) => sum + (i.finalTotal || i.total),
        0
      ),
      totalCustomers: customers.length,
      inventoryValue: products.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      ),
    });
  }, []);

  const formatCurrency = (amount: number) =>
    `${amount.toLocaleString('ar-EG')} ج.م`;

  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-bold">لوحة التحكم</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.inventoryValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>

        {stats.lowStockProducts > 0 && (
          <Card className="border-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-500">
                مخزون منخفض
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.lowStockProducts}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <h3 className="text-lg font-semibold">مبيعات اليوم</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبيعات اليومية</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaySales} عملية</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats.todaySalesTotal)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayInvoices} فاتورة</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats.todayInvoicesTotal)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبيعات فوري</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayInstant} عملية</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats.todayInstantTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي مبيعات اليوم</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(
              stats.todaySalesTotal +
                stats.todayInvoicesTotal +
                stats.todayInstantTotal
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    setActiveSection('home');
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveSection('home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-2xl font-bold text-muted-foreground">
          جاري التحميل...
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage />;
      case 'inventory':
        return <InventorySection />;
      case 'daily-sales':
        return <SalesSection />;
      case 'invoice':
        return <InvoiceSection />;
      case 'instant-sales':
        return <InstantSalesSection />;
      case 'sales-return':
        return <SalesReturnSection />;
      case 'invoice-return':
        return <InvoiceReturnSection />;
      case 'سجل المبيعات':
        return <RecordsSection recordType="سجل المبيعات" />;
      case 'سجل الفاتورة':
        return <RecordsSection recordType="سجل الفاتورة" />;
      case 'أرشيف الفاتورة':
        return <RecordsSection recordType="أرشيف الفاتورة" />;
      case 'سجل مرتجع المبيعات':
        return <RecordsSection recordType="سجل مرتجع المبيعات" />;
      case 'سجل مرتجع الفاتورة':
        return <RecordsSection recordType="سجل مرتجع الفاتورة" />;
      case 'سجل مبيعات فوري':
        return <RecordsSection recordType="سجل مبيعات فوري" />;
      case 'سجل المؤجل':
        return <RecordsSection recordType="سجل المؤجل" />;
      case 'customers':
        return <CustomersSection />;
      case 'reports':
        return <ReportsSection />;
      case 'settings':
        return <SettingsSection />;
      case 'user-management':
        return <UserManagementSection />;
      default:
        return <HomePage />;
    }
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
      userName={currentUser?.name || 'مستخدم'}
    >
      {renderSection()}
    </DashboardLayout>
  );
}
