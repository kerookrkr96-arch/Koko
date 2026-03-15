'use client';

import { useState, useEffect } from 'react';
import { addInvoiceReturn, getProducts } from '@/lib/store';
import { SaleItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { RotateCw, Plus, Trash2, Save, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InvoiceReturnSection() {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<{ name: string; quantity: number; price: number }[]>([]);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const total = items.reduce((sum, item) => sum + item.total, 0);

  const handleProductSearch = (value: string) => {
    setProductName(value);
    if (value.length > 0) {
      const filtered = products
        .filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
        .map(p => p.name);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleProductSelect = (name: string) => {
    const product = products.find(p => p.name === name);
    if (product) {
      setProductName(name);
      setPrice(product.price);
      setSuggestions([]);
    }
  };

  const addItem = () => {
    if (!productName || quantity <= 0 || price <= 0) {
      toast({ title: 'خطأ', description: 'يرجى إدخال بيانات صحيحة', variant: 'destructive' });
      return;
    }

    const newItem: SaleItem = {
      productName,
      quantity,
      price,
      total: quantity * price,
    };

    setItems([...items, newItem]);
    setProductName('');
    setQuantity(1);
    setPrice(0);
    setSuggestions([]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!customerName || items.length === 0) {
      toast({ title: 'خطأ', description: 'يرجى إدخال اسم العميل وعناصر المرتجع', variant: 'destructive' });
      return;
    }

    addInvoiceReturn({
      customerName,
      items,
      total,
      type: 'invoice-return',
    });

    toast({ title: 'تم', description: 'تم حفظ مرتجع الفاتورة بنجاح' });
    setCustomerName('');
    setItems([]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <RotateCw className="h-6 w-6" />
          <CardTitle>مرتجع الفاتورة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">اسم العميل</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="أدخل اسم العميل"
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Label htmlFor="productName">اسم المنتج</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => handleProductSearch(e.target.value)}
                  placeholder="ابحث عن منتج"
                  onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-40 overflow-auto">
                    {suggestions.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleProductSelect(s)}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="quantity">الكمية</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label htmlFor="price">السعر (ج.م)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addItem} className="w-full">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة
                </Button>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">#</TableHead>
                    <TableHead className="text-right">اسم المنتج</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">السعر (ج.م)</TableHead>
                    <TableHead className="text-right">الإجمالي (ج.م)</TableHead>
                    <TableHead className="text-right">حذف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.price.toFixed(2)}</TableCell>
                      <TableCell>{item.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => removeItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end items-center gap-4">
            <div className="text-xl font-bold">
              الإجمالي: <span className="text-green-600">{total.toFixed(2)}</span> ج.م
            </div>
          </div>

          <div className="flex gap-2 justify-end">
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
