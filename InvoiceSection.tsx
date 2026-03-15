'use client';

import { useState, useEffect } from 'react';
import { getProducts, addInvoice, getSettings } from '@/lib/store';
import { SaleItem, Product, Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Save, Archive, Printer, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InvoiceSection() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadedProducts = getProducts();
    const loadedSettings = getSettings();
    setProducts(loadedProducts);
    setSettings(loadedSettings);
  }, []);

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
    return { subtotal, discountAmount, finalTotal };
  };

  const handleSave = (archive: boolean) => {
    if (items.length === 0) {
      toast({ title: 'خطأ', description: 'يرجى إضافة منتجات أولاً', variant: 'destructive' });
      return;
    }

    const { finalTotal, discountAmount } = calculateTotals();

    addInvoice({
      customerName,
      items,
      discount: discountAmount,
      discountType,
      total: items.reduce((sum, item) => sum + item.total, 0),
      finalTotal,
      type: 'invoice',
      companyName: settings.companyName,
      registrationNumber: settings.registrationNumber,
    }, archive);

    toast({ title: 'تم', description: archive ? 'تم أرشفة الفاتورة بنجاح' : 'تم حفظ الفاتورة بنجاح' });
    resetForm();
  };

  const resetForm = () => {
    setCustomerName('');
    setItems([]);
    setDiscountValue(0);
    setDiscountType('percentage');
  };

  const handlePrint = () => {
    if (items.length === 0) {
      toast({ title: 'خطأ', description: 'لا توجد بيانات للطباعة', variant: 'destructive' });
      return;
    }

    const { subtotal, discountAmount, finalTotal } = calculateTotals();
    const date = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const bgImageStyle = settings.invoiceBackground
      ? `background-image: url('${settings.invoiceBackground}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
      : '';

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة - ${settings.companyName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            direction: rtl;
            ${bgImageStyle}
          }
          .invoice-container {
            background-color: rgba(255, 255, 255, ${settings.invoiceBackground ? '0.55' : '1'});
            padding: 30px;
            border-radius: 10px;
          }
          h1 { text-align: center; color: #333; margin-bottom: 5px; }
          .reg-number { text-align: center; color: #666; margin-bottom: 20px; font-size: 14px; }
          .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: center; }
          th { background-color: #f5f5f5; }
          .total-section { text-align: left; margin-top: 20px; }
          .total-row { font-size: 16px; margin: 8px 0; }
          .final-total { font-size: 22px; font-weight: bold; color: #333; }
          .footer { text-align: center; margin-top: 40px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <h1>${settings.companyName}</h1>
          ${settings.registrationNumber ? `<p class="reg-number">سجل تجاري: ${settings.registrationNumber}</p>` : ''}
          <div class="info">
            <div>
              <p><strong>التاريخ:</strong> ${date}</p>
            </div>
            <div>
              <p><strong>اسم العميل:</strong> ${customerName || 'بدون اسم'}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>م</th>
                <th>اسم المنتج</th>
                <th>الكمية</th>
                <th>السعر (ج.م)</th>
                <th>الإجمالي (ج.م)</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-section">
            <p class="total-row">المجموع: ${subtotal.toFixed(2)} ج.م</p>
            <p class="total-row">الخصم: ${discountAmount.toFixed(2)} ج.م</p>
            <p class="final-total">الإجمالي النهائي: ${finalTotal.toFixed(2)} ج.م</p>
          </div>
          <div class="footer">
            <p>شكراً لتعاملكم معنا</p>
          </div>
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

  const { subtotal, discountAmount, finalTotal } = calculateTotals();
  const currentDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            الفاتورة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <Label>اسم الشركة</Label>
              <p className="font-bold text-lg">{settings.companyName}</p>
            </div>
            <div className="text-center">
              <Label>رقم السجل</Label>
              <p className="font-bold">{settings.registrationNumber || 'غير محدد'}</p>
            </div>
            <div className="text-center">
              <Label>التاريخ</Label>
              <p className="font-bold">{currentDate}</p>
            </div>
          </div>

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

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Label>المجموع</Label>
              <p className="text-2xl font-bold">{subtotal.toFixed(2)} ج.م</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Label>الخصم</Label>
              <p className="text-2xl font-bold text-red-500">-{discountAmount.toFixed(2)} ج.م</p>
            </div>
            <div className="p-4 border rounded-lg bg-primary text-primary-foreground">
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
            <Button variant="secondary" onClick={() => handleSave(true)}>
              <Archive className="h-4 w-4 ml-2" />
              أرشيف
            </Button>
            <Button onClick={() => handleSave(false)}>
              <Save className="h-4 w-4 ml-2" />
              حفظ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
