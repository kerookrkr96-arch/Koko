'use client';

import { useEffect, useState } from 'react';
import {
  getSales,
  getInvoices,
  getInstantSales,
  getSalesReturns,
  getInvoiceReturns,
  getProducts,
} from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Printer, Calendar, TrendingUp, Package } from 'lucide-react';

type DateFilter = 'daily' | 'monthly';

export default function ReportsSection() {
  const [salesFilter, setSalesFilter] = useState<DateFilter>('daily');
  const [invoicesFilter, setInvoicesFilter] = useState<DateFilter>('daily');
  const [returnsFilter, setReturnsFilter] = useState<DateFilter>('daily');
  const [instantFilter, setInstantFilter] = useState<DateFilter>('daily');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low'>('all');

  const [sales, setSales] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [instantSales, setInstantSales] = useState<any[]>([]);
  const [salesReturns, setSalesReturns] = useState<any[]>([]);
  const [invoiceReturns, setInvoiceReturns] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    setSales(getSales());
    setInvoices(getInvoices());
    setInstantSales(getInstantSales());
    setSalesReturns(getSalesReturns());
    setInvoiceReturns(getInvoiceReturns());
    setProducts(getProducts());
  }, []);

  const filterByDate = (items: any[], filter: DateFilter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return items.filter((item) => {
      const itemDate = new Date(item.date);
      if (filter === 'daily') {
        return itemDate >= today;
      } else {
        return itemDate >= monthStart;
      }
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ج.م.`;
  };

  const getFilteredSales = () => filterByDate(sales, salesFilter);
  const getFilteredInvoices = () => filterByDate(invoices, invoicesFilter);
  const getFilteredReturns = () => {
    const sr = filterByDate(salesReturns, returnsFilter);
    const ir = filterByDate(invoiceReturns, returnsFilter);
    return [...sr, ...ir];
  };
  const getFilteredInstantSales = () => filterByDate(instantSales, instantFilter);

  const getFilteredProducts = () => {
    if (inventoryFilter === 'low') {
      return products.filter((p) => p.quantity < 10);
    }
    return products;
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.finalTotal || item.total || 0), 0);
  };

  const calculateAverage = (items: any[], total: number) => {
    return items.length > 0 ? total / items.length : 0;
  };

  const printReport = (title: string) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-8 w-8" />
        <h2 className="text-2xl font-bold">التقارير</h2>
      </div>

      <Tabs defaultValue="sales" dir="rtl" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="sales">تقرير المبيعات</TabsTrigger>
          <TabsTrigger value="invoices">تقرير الفواتير</TabsTrigger>
          <TabsTrigger value="returns">تقرير المرتجعات</TabsTrigger>
          <TabsTrigger value="instant">تقرير مبيعات فوري</TabsTrigger>
          <TabsTrigger value="inventory">تقرير المخزون</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={salesFilter} onValueChange={(v: DateFilter) => setSalesFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">يومي</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => printReport('sales')}>
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  عدد العمليات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getFilteredSales().length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  الإجمالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(calculateTotal(getFilteredSales()))}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  المتوسط
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(calculateAverage(getFilteredSales(), calculateTotal(getFilteredSales())))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المبيعات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>عدد المنتجات</TableHead>
                    <TableHead>الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredSales().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        لا توجد مبيعات
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredSales().map((sale, index) => (
                      <TableRow key={sale.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{formatDate(sale.date)}</TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell>{sale.items?.length || 0}</TableCell>
                        <TableCell>{formatCurrency(sale.finalTotal || 0)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Report */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={invoicesFilter} onValueChange={(v: DateFilter) => setInvoicesFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">يومي</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => printReport('invoices')}>
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  عدد العمليات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getFilteredInvoices().length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  الإجمالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(calculateTotal(getFilteredInvoices()))}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  المتوسط
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(calculateAverage(getFilteredInvoices(), calculateTotal(getFilteredInvoices())))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الفواتير</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>عدد المنتجات</TableHead>
                    <TableHead>الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredInvoices().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        لا توجد فواتير
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredInvoices().map((invoice, index) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{invoice.items?.length || 0}</TableCell>
                        <TableCell>{formatCurrency(invoice.finalTotal || 0)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Returns Report */}
        <TabsContent value="returns" className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={returnsFilter} onValueChange={(v: DateFilter) => setReturnsFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">يومي</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => printReport('returns')}>
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  عدد العمليات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getFilteredReturns().length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  الإجمالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(calculateTotal(getFilteredReturns()))}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  المتوسط
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(calculateAverage(getFilteredReturns(), calculateTotal(getFilteredReturns())))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المرتجعات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>نوع المرتجع</TableHead>
                    <TableHead>الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredReturns().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        لا توجد مرتجعات
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredReturns().map((ret, index) => (
                      <TableRow key={ret.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{formatDate(ret.date)}</TableCell>
                        <TableCell>{ret.customerName}</TableCell>
                        <TableCell>{ret.type === 'sales-return' ? 'مرتجع مبيعات' : 'مرتجع فواتير'}</TableCell>
                        <TableCell>{formatCurrency(ret.total || 0)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instant Sales Report */}
        <TabsContent value="instant" className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={instantFilter} onValueChange={(v: DateFilter) => setInstantFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">يومي</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => printReport('instant')}>
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  عدد العمليات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getFilteredInstantSales().length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  الإجمالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(calculateTotal(getFilteredInstantSales()))}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  المتوسط
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(calculateAverage(getFilteredInstantSales(), calculateTotal(getFilteredInstantSales())))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المبيعات الفورية</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredInstantSales().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        لا توجد مبيعات فورية
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredInstantSales().map((sale, index) => (
                      <TableRow key={sale.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{formatDate(sale.date)}</TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell>
                          {sale.paymentType === 'cash' && 'نقدي'}
                          {sale.paymentType === 'card' && 'بطاقة'}
                          {sale.paymentType === 'transfer' && 'تحويل'}
                          {sale.paymentType === 'other' && 'أخرى'}
                        </TableCell>
                        <TableCell>
                          {sale.paymentStatus === 'paid' && 'مدفوع'}
                          {sale.paymentStatus === 'partial' && 'مدفوع جزئياً'}
                          {sale.paymentStatus === 'pending' && 'معلق'}
                        </TableCell>
                        <TableCell>{formatCurrency(sale.finalTotal || 0)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Report */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex items-center justify-between">
            <Select value={inventoryFilter} onValueChange={(v: 'all' | 'low') => setInventoryFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="low">مخزون منخفض</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => printReport('inventory')}>
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  إجمالي المنتجات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  قيمة المخزون
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(products.reduce((sum, p) => sum + (p.price * p.quantity), 0))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  منخفض المخزون
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {products.filter((p) => p.quantity < 10).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تفاصيل المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>اسم المنتج</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredProducts().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        لا توجد منتجات
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredProducts().map((product, index) => (
                      <TableRow key={product.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className={product.quantity < 10 ? 'text-red-500 font-bold' : ''}>
                          {product.quantity}
                        </TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>{formatCurrency(product.price * product.quantity)}</TableCell>
                        <TableCell>
                          {product.quantity < 10 ? (
                            <span className="text-red-500 font-bold">منخفض</span>
                          ) : (
                            <span className="text-green-500">متوفر</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
