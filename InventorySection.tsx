'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/store';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2, QrCode, Printer, Package } from 'lucide-react';

export default function InventorySection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  // Form states
  const [newProduct, setNewProduct] = useState({ name: '', quantity: 0, price: 0 });
  const [editProduct, setEditProduct] = useState({ name: '', quantity: 0, price: 0 });

  const { toast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Generate QR codes for products
  useEffect(() => {
    const generateQRCodes = async () => {
      const codes: Record<string, string> = {};
      for (const product of products) {
        try {
          codes[product.id] = await QRCode.toDataURL(product.qrCode, {
            width: 100,
            margin: 1,
          });
        } catch {
          codes[product.id] = '';
        }
      }
      setQrCodes(codes);
    };
    generateQRCodes();
  }, [products]);

  const loadProducts = () => {
    const data = getProducts();
    setProducts(data);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = () => {
    if (!newProduct.name.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال اسم المنتج', variant: 'destructive' });
      return;
    }
    if (newProduct.quantity < 0 || newProduct.price < 0) {
      toast({ title: 'خطأ', description: 'الكمية والسعر يجب أن يكونا موجبين', variant: 'destructive' });
      return;
    }

    addProduct({
      name: newProduct.name,
      quantity: newProduct.quantity,
      price: newProduct.price,
    });

    toast({ title: 'نجاح', description: 'تم إضافة المنتج بنجاح' });
    setNewProduct({ name: '', quantity: 0, price: 0 });
    setIsAddDialogOpen(false);
    loadProducts();
  };

  const handleEditProduct = () => {
    if (!selectedProduct) return;
    if (!editProduct.name.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال اسم المنتج', variant: 'destructive' });
      return;
    }
    if (editProduct.quantity < 0 || editProduct.price < 0) {
      toast({ title: 'خطأ', description: 'الكمية والسعر يجب أن يكونا موجبين', variant: 'destructive' });
      return;
    }

    updateProduct(selectedProduct.id, {
      name: editProduct.name,
      quantity: editProduct.quantity,
      price: editProduct.price,
    });

    toast({ title: 'نجاح', description: 'تم تحديث المنتج بنجاح' });
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
    loadProducts();
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`هل أنت متأكد من حذف "${product.name}"؟`)) {
      deleteProduct(product.id);
      toast({ title: 'نجاح', description: 'تم حذف المنتج بنجاح' });
      loadProducts();
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      name: product.name,
      quantity: product.quantity,
      price: product.price,
    });
    setIsEditDialogOpen(true);
  };

  const handlePrintQR = async (product: Product) => {
    const qrCodeUrl = await QRCode.toDataURL(product.qrCode, {
      width: 200,
      margin: 2,
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <title>طباعة رمز QR - ${product.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .qr-container {
              border: 2px solid #000;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
            }
            .qr-code {
              width: 200px;
              height: 200px;
            }
            .product-name {
              font-size: 24px;
              font-weight: bold;
              margin: 15px 0 5px;
            }
            .product-price {
              font-size: 18px;
              color: #333;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price} ج.م</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const startScanner = () => {
    setIsScannerOpen(true);
    setTimeout(() => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }

      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          const product = products.find((p) => p.qrCode === decodedText || p.id === decodedText);
          if (product) {
            setHighlightedProductId(product.id);
            toast({ title: 'تم العثور على المنتج', description: product.name });
            setTimeout(() => setHighlightedProductId(null), 3000);
          } else {
            toast({ title: 'لم يتم العثور على المنتج', description: 'رمز QR غير موجود في النظام', variant: 'destructive' });
          }
          scanner.clear();
          setIsScannerOpen(false);
        },
        (error) => {
          console.log('Scan error:', error);
        }
      );
    }, 100);
  };

  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)} ج.م`;
  };

  const isLowStock = (quantity: number) => quantity < 5;

  return (
    <div className="space-y-4" dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Package className="h-6 w-6" />
            إدارة المخزون
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={startScanner} disabled={isScannerOpen}>
              <QrCode className="h-4 w-4 ml-2" />
              فحص QR
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة منتج
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة منتج جديد</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="productName">اسم المنتج</Label>
                    <Input
                      id="productName"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="أدخل اسم المنتج"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">الكمية</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">السعر (ج.م)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <Button onClick={handleAddProduct}>إضافة</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* QR Scanner */}
          {isScannerOpen && (
            <div className="mb-4 p-4 border rounded-lg bg-muted/50">
              <div id="qr-reader" className="w-full"></div>
              <Button variant="outline" className="mt-2" onClick={() => setIsScannerOpen(false)}>
                إلغاء
              </Button>
            </div>
          )}

          {/* Products Table */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد منتجات - أضف منتجاً جديداً</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">#</TableHead>
                    <TableHead className="text-right">اسم المنتج</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">رمز QR</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => (
                    <TableRow
                      key={product.id}
                      className={highlightedProductId === product.id ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <span
                          className={isLowStock(product.quantity) ? 'text-red-600 dark:text-red-400 font-bold' : ''}
                        >
                          {product.quantity}
                        </span>
                        {isLowStock(product.quantity) && (
                          <span className="mr-2 text-xs text-orange-500">(منخفض)</span>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>
                        {qrCodes[product.id] && (
                          <img
                            src={qrCodes[product.id]}
                            alt="QR"
                            className="w-10 h-10 border rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrintQR(product)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editProductName">اسم المنتج</Label>
              <Input
                id="editProductName"
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editQuantity">الكمية</Label>
              <Input
                id="editQuantity"
                type="number"
                min="0"
                value={editProduct.quantity}
                onChange={(e) => setEditProduct({ ...editProduct, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPrice">السعر (ج.م)</Label>
              <Input
                id="editPrice"
                type="number"
                min="0"
                step="0.01"
                value={editProduct.price}
                onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <Button onClick={handleEditProduct}>حفظ التغييرات</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
