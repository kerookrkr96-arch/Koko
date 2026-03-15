'use client';

import { useState, useEffect } from 'react';
import { getProducts, addInstantSale } from '@/lib/store';
import { SaleItem, Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Save, Printer, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InstantSalesSection() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'card' | 'transfer' | 'cash' | 'other'>('cash');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'pending'>('paid');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadedProducts = getProducts();
    setProducts(loadedProducts);
  }, []);

  useEffect(() => {
    const { finalTotal } = calculateTotals();
    if (paymentStatus === 'paid') {
      setAmountPaid(finalTotal);
    }
  }, [items, discountType, discountValue, paymentStatus]);

  const handleProductNameChange = (value: string) => {
    setProductName(value);
    if (value.length > 0) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setProductName(product.name);
    setPrice(product.price);
    setShowSuggestions(false);
  };

  const addItem = () => {
    if (!productName.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال اسم المنتج', variant: 'destructive' });
      return;
    }
    if (quantity <= 0) {
      toast({ title: 'خطأ', description: 'يرجى إدخال كمية صحيحة', variant: 'destructive' });
      return;
    }

    const total = quantity * price;
    const newItem: SaleItem = {
      productName,
      quantity,
      price: price || 0,
      total,
    };

    setItems([...items, newItem]);
    setProductName('');
    setQuantity(1);
    setPrice(0);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    let discountAmount = 0;

    if (discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100);
    } else {
      discountAmount = discountValue;
    }

    const finalTotal = subtotal - discountAmount;
    const amountRemaining = finalTotal - amountPaid;
    return { subtotal, discountAmount, finalTotal, amountRemaining };
  };

  const handleSave = () => {
    if (items.length === 0) {
      toast({ title: 'خطأ', description: 'يرجى إضافة منتجات أولاً', variant: 'destructive' });
      return;
    }

    const { finalTotal, amountRemaining } = calculateTotals();

    addInstantSale({
      customerName,
      items,
      discount: discountValue,
      discountType,
      total: items.reduce((sum, item) => sum + item.total, 0),
      finalTotal,
      type: 'instant',
      paymentType,
      paymentStatus,
      amountPaid,
      amountRemaining,
    });

    toast({ title: 'تم', description: 'تم حفظ المبيعات بنجاح' });
    resetForm();
  };

  const resetForm = () => {
    setCustomerName('');
    setItems([]);
    setDiscountValue(0);
    setDiscountType('percentage');
    setPaymentType('cash');
    setPaymentStatus('paid');
    setAmountPaid(0);
  };

  const handlePrint = () => {
    if (items.length === 0) {
      toast({ title: 'خطأ', description: 'لا توجد بيانات للطباعة', variant: 'destructive' });
      return;
    }

    const { subtotal, discountAmount, finalTotal, amountRemaining } = calculateTotals();
    const date = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const paymentTypeLabels: Record<string, string> = {
      card: 'كرت',
      transfer: 'تحويل',
      cash: 'نقدي',
      other: 'أخرى',
    };

    const paymentStatusLabels: Record<string, string> = {
      paid: 'تم الدفع',
      partial: 'جزئي',
      pending: 'في الانتظار',
    };

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>إيصال مبيعات مكينة فوري - مؤسسة كيرو للأدوات الصحية</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
          h1 { text-align: center; color: #333; }
          .info { margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
          th { background-color: #f5f5f5; }
          .totals { text-align: left; margin-top: 20px; }
          .total-row { margin: 8px 0; }
          .final-total { font-size: 18px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <h1>مبيعات مكينة فوري</h1>
        <h2 style="text-align: center; color: #666;">مؤسسة كيرو للأدوات الصحية</h2>
        <div class="info">
          <div class="info-row"><span>التاريخ:</span> <span>${date}</span></div>
          <div class="info-row"><span>اسم العميل:</span> <span>${customerName || 'بدون اسم'}</span></div>
          <div class="info-row"><span>نوع الدفع:</span> <span>${paymentTypeLabels[paymentType]}</span></div>
          <div class="info-row"><span>حالة الدفع:</span> <span>${paymentStatusLabels[paymentStatus]}</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>اسم المنتج</th>
              <th>الكمية</th>
              <th>السعر (ج.م)</th>
              <th>الإجمالي (ج.م)</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="totals">
          <p class="total-row">المجموع: ${subtotal.toFixed(2)} ج.م</p>
          <p class="total-row">الخصم: ${discountAmount.toFixed(2)} ج.م</p>
          <p class="total-row final-total">الإجمالي النهائي: ${finalTotal.toFixed(2)} ج.م</p>
          <p class="total-row">المبلغ المدفوع: ${amountPaid.toFixed(2)} ج.م</p>
          <p class="total-row">المتبقي: ${amountRemaining.toFixed(2)} ج.م</p>
        </div>
        <div class="footer">
          <p>شكراً لتعاملكم معنا</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const { subtotal, discountAmount, finalTotal, amountRemaining } = calculateTotals();

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            مبيعات مكينة فوري
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Name */}
          <div className="grid gap-2">
            <Label htmlFor="customerName">اسم العميل</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="أدخل اسم العميل"
            />
          </div>

          {/* Payment Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>نوع الصنف</Label>
              <Select value={paymentType} onValueChange={(v) => setPaymentType(v as 'card' | 'transfer' | 'cash' | 'other')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">كرت</SelectItem>
                  <SelectItem value="transfer">تحويل</SelectItem>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>حالة الدفع</Label>
              <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as 'paid' | 'partial' | 'pending')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">تم الدفع</SelectItem>
                  <SelectItem value="partial">جزئي</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Entry */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Label htmlFor="productName">اسم المنتج</Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => handleProductNameChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="أدخل اسم المنتج"
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg mt-1 max-h-40 overflow-auto">
                  {suggestions.map((product) => (
                    <div
                      key={product.id}
                      className="px-3 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => handleSelectProduct(product)}
                    >
                      {product.name} - المخزون: {product.quantity}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">الكمية</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">السعر (ج.م)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="السعر"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 ml-2" />
                إضافة
              </Button>
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead className="text-center">اسم المنتج</TableHead>
                    <TableHead className="text-center">الكمية</TableHead>
                    <TableHead className="text-center">السعر (ج.م)</TableHead>
                    <TableHead className="text-center">الإجمالي (ج.م)</TableHead>
                    <TableHead className="text-center">حذف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="text-center">{item.productName}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-center">{item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{item.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Discount Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="grid gap-2">
              <Label>نوع الخصم</Label>
              <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">نسبة مئوية</SelectItem>
                  <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>قيمة الخصم {discountType === 'percentage' ? '(%)' : '(ج.م)'}</Label>
              <Input
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label>قيمة الخصم</Label>
              <Input value={discountAmount.toFixed(2)} disabled />
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Label>المجموع</Label>
              <p className="text-2xl font-bold">{subtotal.toFixed(2)} ج.م</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Label>المبلغ المدفوع (ج.م)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="p-4 border rounded-lg bg-primary text-primary-foreground">
              <Label>المتبقي (ج.م)</Label>
              <p className="text-2xl font-bold">{amountRemaining.toFixed(2)} ج.م</p>
            </div>
          </div>

          {/* Final Total */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <Label>الخصم</Label>
              <p className="text-2xl font-bold text-red-500">-{discountAmount.toFixed(2)} ج.م</p>
            </div>
            <div className="p-4 border rounded-lg bg-green-600 text-white">
              <Label>الإجمالي النهائي</Label>
              <p className="text-2xl font-bold">{finalTotal.toFixed(2)} ج.م</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 ml-2" />
              حفظ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
