'use client';

import { useState, useEffect } from 'react';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer, addCustomerPayment, getSales, getInvoices, getInstantSales, getDeferredSales } from '@/lib/store';
import { Customer, Payment, SaleItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit, Trash2, Eye, CreditCard, Search, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PurchaseRecord {
  id: string;
  date: string;
  type: string;
  items: SaleItem[];
  total: number;
}

export default function CustomersSection() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerPurchases, setCustomerPurchases] = useState<PurchaseRecord[]>([]);

  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
  const [editCustomer, setEditCustomer] = useState({ name: '', phone: '', address: '' });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    setCustomers(getCustomers());
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال اسم العميل', variant: 'destructive' });
      return;
    }

    addCustomer(newCustomer);
    toast({ title: 'تم', description: 'تم إضافة العميل بنجاح' });
    setNewCustomer({ name: '', phone: '', address: '' });
    setIsAddDialogOpen(false);
    loadCustomers();
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer || !editCustomer.name.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال اسم العميل', variant: 'destructive' });
      return;
    }

    updateCustomer(selectedCustomer.id, editCustomer);
    toast({ title: 'تم', description: 'تم تحديث بيانات العميل بنجاح' });
    setIsEditDialogOpen(false);
    loadCustomers();
  };

  const handleDeleteCustomer = (customer: Customer) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteCustomer(customer.id);
      toast({ title: 'تم', description: 'تم حذف العميل بنجاح' });
      loadCustomers();
    }
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    loadCustomerPurchases(customer.name);
    setIsViewDialogOpen(true);
  };

  const loadCustomerPurchases = (customerName: string) => {
    const sales = getSales().filter(s => s.customerName === customerName);
    const invoices = getInvoices().filter(i => i.customerName === customerName);
    const instantSales = getInstantSales().filter(s => s.customerName === customerName);
    const deferredSales = getDeferredSales().filter(s => s.customerName === customerName);

    const purchases: PurchaseRecord[] = [
      ...sales.map(s => ({ ...s, type: 'مبيعات' })),
      ...invoices.map(i => ({ ...i, type: 'فاتورة' })),
      ...instantSales.map(s => ({ ...s, type: 'فوري' })),
      ...deferredSales.map(s => ({ ...s, type: 'آجل' })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setCustomerPurchases(purchases);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditCustomer({ name: customer.name, phone: customer.phone, address: customer.address });
    setIsEditDialogOpen(true);
  };

  const handleAddPayment = () => {
    if (!selectedCustomer || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({ title: 'خطأ', description: 'يرجى إدخال مبلغ صحيح', variant: 'destructive' });
      return;
    }

    addCustomerPayment(selectedCustomer.id, parseFloat(paymentAmount), paymentNote);
    toast({ title: 'تم', description: 'تم تسجيل الدفعة بنجاح' });
    setPaymentAmount('');
    setPaymentNote('');
    setIsPaymentDialogOpen(false);
    loadCustomers();
    setSelectedCustomer(getCustomers().find(c => c.id === selectedCustomer.id) || null);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <CardTitle>إدارة العملاء</CardTitle>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة عميل
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="البحث عن عميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا يوجد عملاء حتى الآن
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">#</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">الهاتف</TableHead>
                    <TableHead className="text-right">إجمالي المشتريات (ج.م)</TableHead>
                    <TableHead className="text-right">الديون (ج.م)</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer, index) => (
                    <TableRow key={customer.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>{customer.totalPurchases.toFixed(2)}</TableCell>
                      <TableCell className={customer.totalDebt > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                        {customer.totalDebt.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(customer)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(customer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteCustomer(customer)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة عميل جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الاسم</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="أدخل اسم العميل"
              />
            </div>
            <div>
              <Label>الهاتف</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="أدخل رقم الهاتف"
              />
            </div>
            <div>
              <Label>العنوان</Label>
              <Input
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                placeholder="أدخل العنوان"
              />
            </div>
            <Button onClick={handleAddCustomer} className="w-full">
              إضافة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات العميل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الاسم</Label>
              <Input
                value={editCustomer.name}
                onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
              />
            </div>
            <div>
              <Label>الهاتف</Label>
              <Input
                value={editCustomer.phone}
                onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>العنوان</Label>
              <Input
                value={editCustomer.address}
                onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
              />
            </div>
            <Button onClick={handleEditCustomer} className="w-full">
              حفظ التغييرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>كشف حساب العميل: {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="info">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">المعلومات</TabsTrigger>
              <TabsTrigger value="purchases" className="flex-1">المشتريات</TabsTrigger>
              <TabsTrigger value="debt" className="flex-1">الديون والمدفوعات</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="space-y-2 py-4">
                <p><strong>الاسم:</strong> {selectedCustomer?.name}</p>
                <p><strong>الهاتف:</strong> {selectedCustomer?.phone || '-'}</p>
                <p><strong>العنوان:</strong> {selectedCustomer?.address || '-'}</p>
                <p><strong>إجمالي المشتريات:</strong> {selectedCustomer?.totalPurchases.toFixed(2)} ج.م</p>
                <p className={selectedCustomer?.totalDebt && selectedCustomer.totalDebt > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                  <strong>الديون:</strong> {selectedCustomer?.totalDebt.toFixed(2)} ج.م
                </p>
              </div>
            </TabsContent>

            <TabsContent value="purchases">
              <div className="max-h-64 overflow-auto">
                {customerPurchases.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">لا توجد مشتريات</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">الإجمالي (ج.م)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerPurchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>{new Date(purchase.date).toLocaleDateString('ar-EG')}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{purchase.type}</Badge>
                          </TableCell>
                          <TableCell>{purchase.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="debt">
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                  <span className="font-bold">إجمالي الديون:</span>
                  <span className={`text-xl font-bold ${selectedCustomer?.totalDebt && selectedCustomer.totalDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedCustomer?.totalDebt.toFixed(2)} ج.م
                  </span>
                </div>

                <div>
                  <h4 className="font-bold mb-2">سجل المدفوعات</h4>
                  {selectedCustomer?.payments && selectedCustomer.payments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">التاريخ</TableHead>
                          <TableHead className="text-right">المبلغ (ج.م)</TableHead>
                          <TableHead className="text-right">ملاحظة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomer.payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{new Date(payment.date).toLocaleDateString('ar-EG')}</TableCell>
                            <TableCell className="text-green-600">{payment.amount.toFixed(2)}</TableCell>
                            <TableCell>{payment.note || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-2">لا توجد مدفوعات</p>
                  )}
                </div>

                <Button onClick={() => setIsPaymentDialogOpen(true)} className="w-full">
                  <CreditCard className="h-4 w-4 ml-2" />
                  إضافة دفعة
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handlePrintStatement}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة الكشف
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة دفعة للعميل: {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>المبلغ (ج.م)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="أدخل المبلغ"
              />
            </div>
            <div>
              <Label>ملاحظة</Label>
              <Input
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="أدخل ملاحظة (اختياري)"
              />
            </div>
            <Button onClick={handleAddPayment} className="w-full">
              <CreditCard className="h-4 w-4 ml-2" />
              تسجيل الدفعة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
