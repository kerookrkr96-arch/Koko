'use client';

import { useState, useEffect } from 'react';
import {
  getSales,
  deleteSale,
  getInvoices,
  deleteInvoice,
  getInstantSales,
  deleteInstantSale,
  getSalesReturns,
  deleteSalesReturn,
  getInvoiceReturns,
  deleteInvoiceReturn,
  getDeferredSales,
  addDeferredPayment,
} from '@/lib/store';
import { Sale, InvoiceSale, InstantSale, Return, DeferredSale, SaleItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { BookOpen, Search, Eye, Trash2, Printer, Plus } from 'lucide-react';

interface RecordsSectionProps {
  recordType:
    | 'سجل المبيعات'
    | 'سجل الفاتورة'
    | 'أرشيف الفاتورة'
    | 'سجل مرتجع المبيعات'
    | 'سجل مرتجع الفاتورة'
    | 'سجل مبيعات فوري'
    | 'سجل المؤجل';
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('ar-EG');
const formatCurrency = (amount: number) => `${amount.toLocaleString('ar-EG')} ج.م`;

const getPaymentTypeLabel = (type: string) => {
  switch (type) {
    case 'cash': return 'نقدي';
    case 'card': return 'بطاقة';
    case 'transfer': return 'تحويل';
    case 'other': return 'أخرى';
    default: return type;
  }
};

const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case 'paid': return 'مدفوع';
    case 'partial': return 'جزئي';
    case 'pending': return 'معلق';
    default: return status;
  }
};

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'paid': return 'default';
    case 'partial': return 'secondary';
    case 'pending': return 'destructive';
    default: return 'outline';
  }
};

export default function RecordsSection({ recordType }: RecordsSectionProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [selectedDeferredSale, setSelectedDeferredSale] = useState<DeferredSale | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadData = () => {
    switch (recordType) {
      case 'سجل المبيعات':
        setData(getSales());
        break;
      case 'سجل الفاتورة':
        setData(getInvoices().filter((i: InvoiceSale) => !i.archived));
        break;
      case 'أرشيف الفاتورة':
        setData(getInvoices().filter((i: InvoiceSale) => i.archived));
        break;
      case 'سجل مرتجع المبيعات':
        setData(getSalesReturns());
        break;
      case 'سجل مرتجع الفاتورة':
        setData(getInvoiceReturns());
        break;
      case 'سجل مبيعات فوري':
        setData(getInstantSales());
        break;
      case 'سجل المؤجل':
        setData(getDeferredSales());
        break;
    }
  };

  useEffect(() => {
    loadData();
  }, [recordType]);

  const filteredData = data.filter((item) => {
    const customerName = item.customerName || '';
    return customerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDelete = (id: string) => {
    switch (recordType) {
      case 'سجل المبيعات':
        deleteSale(id);
        break;
      case 'سجل الفاتورة':
      case 'أرشيف الفاتورة':
        deleteInvoice(id);
        break;
      case 'سجل مرتجع المبيعات':
        deleteSalesReturn(id);
        break;
      case 'سجل مرتجع الفاتورة':
        deleteInvoiceReturn(id);
        break;
      case 'سجل مبيعات فوري':
        deleteInstantSale(id);
        break;
    }
    loadData();
    toast({
      title: 'تم الحذف',
      description: 'تم حذف السجل بنجاح',
      variant: 'default',
    });
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  const handlePrint = (item: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = item.items
      .map(
        (row: SaleItem, index: number) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${row.productName}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${row.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${formatCurrency(row.price)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${formatCurrency(row.total)}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${recordType}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 8px; border: 1px solid #ddd; }
          th { background: #f5f5f5; }
          .header { text-align: center; margin-bottom: 20px; }
          .info { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${recordType}</h1>
          <p>${item.companyName || ''}</p>
        </div>
        <div class="info">
          <p><strong>اسم العميل:</strong> ${item.customerName}</p>
          <p><strong>التاريخ:</strong> ${formatDate(item.date)}</p>
          <p><strong>الإجمالي:</strong> ${formatCurrency(item.total)}</p>
          ${item.discount ? `<p><strong>الخصم:</strong> ${item.discountType === 'percentage' ? `${item.discount}%` : formatCurrency(item.discount)}</p>` : ''}
          <p><strong>الإجمالي النهائي:</strong> ${formatCurrency(item.finalTotal || item.total)}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleAddPayment = () => {
    if (!selectedDeferredSale || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    addDeferredPayment(selectedDeferredSale.id, amount, paymentNote);
    loadData();
    setPaymentDialogOpen(false);
    setPaymentAmount('');
    setPaymentNote('');
    setSelectedDeferredSale(null);
    toast({
      title: 'تمت الإضافة',
      description: 'تمت إضافة الدفعة بنجاح',
      variant: 'default',
    });
  };

  const openPaymentDialog = (sale: DeferredSale) => {
    setSelectedDeferredSale(sale);
    setPaymentDialogOpen(true);
  };

  const renderTable = () => {
    if (filteredData.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          لا توجد سجلات
        </div>
      );
    }

    switch (recordType) {
      case 'سجل المبيعات':
      case 'سجل الفاتورة':
      case 'أرشيف الفاتورة':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">#</TableHead>
                <TableHead>اسم العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead className="text-left">الإجمالي (ج.م)</TableHead>
                <TableHead className="text-left">الإجمالي النهائي (ج.م)</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item: Sale | InvoiceSale, index: number) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell className="text-left">{formatCurrency(item.total)}</TableCell>
                  <TableCell className="text-left">{formatCurrency(item.finalTotal || item.total)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewDetails(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePrint(item)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذا السجل؟{recordType !== 'أرشيف الفاتورة' && ' سيتم إعادة المخزون.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'سجل مرتجع المبيعات':
      case 'سجل مرتجع الفاتورة':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">#</TableHead>
                <TableHead>اسم العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead className="text-left">الإجمالي (ج.م)</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item: Return, index: number) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell className="text-left">{formatCurrency(item.total)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewDetails(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذا السجل؟
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'سجل مبيعات فوري':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">#</TableHead>
                <TableHead>اسم العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead className="text-left">الإجمالي (ج.م)</TableHead>
                <TableHead className="text-center">نوع الدفع</TableHead>
                <TableHead className="text-center">حالة الدفع</TableHead>
                <TableHead className="text-left">المدفوع (ج.م)</TableHead>
                <TableHead className="text-left">المتبقي (ج.م)</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item: InstantSale, index: number) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell className="text-left">{formatCurrency(item.total)}</TableCell>
                  <TableCell className="text-center">{getPaymentTypeLabel(item.paymentType)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getStatusBadgeVariant(item.paymentStatus)}>
                      {getPaymentStatusLabel(item.paymentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">{formatCurrency(item.amountPaid)}</TableCell>
                  <TableCell className="text-left">{formatCurrency(item.amountRemaining)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewDetails(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePrint(item)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذا السجل؟ سيتم إعادة المخزون.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'سجل المؤجل':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">#</TableHead>
                <TableHead>اسم العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead className="text-left">الإجمالي (ج.م)</TableHead>
                <TableHead className="text-left">المدفوع (ج.م)</TableHead>
                <TableHead className="text-left">المتبقي (ج.م)</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item: DeferredSale, index: number) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell>{item.customerName}</TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell className="text-left">{formatCurrency(item.total)}</TableCell>
                  <TableCell className="text-left">{formatCurrency(item.amountPaid)}</TableCell>
                  <TableCell className="text-left">{formatCurrency(item.amountRemaining)}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        item.status === 'paid'
                          ? 'default'
                          : item.status === 'partial'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {item.status === 'paid' ? 'تم الدفع' : item.status === 'partial' ? 'جزئي' : 'في الانتظار'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewDetails(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.amountRemaining > 0 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openPaymentDialog(item)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePrint(item)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذا السجل؟ سيتم إعادة المخزون.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {recordType}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث باسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderTable()}</CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل السجل</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">اسم العميل:</p>
                  <p>{selectedItem.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">التاريخ:</p>
                  <p>{formatDate(selectedItem.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">الإجمالي:</p>
                  <p>{formatCurrency(selectedItem.total)}</p>
                </div>
                {selectedItem.discount && (
                  <div>
                    <p className="text-sm font-medium">الخصم:</p>
                    <p>
                      {selectedItem.discountType === 'percentage'
                        ? `${selectedItem.discount}%`
                        : formatCurrency(selectedItem.discount)}
                    </p>
                  </div>
                )}
                {selectedItem.finalTotal && (
                  <div>
                    <p className="text-sm font-medium">الإجمالي النهائي:</p>
                    <p>{formatCurrency(selectedItem.finalTotal)}</p>
                  </div>
                )}
                {selectedItem.paymentType && (
                  <div>
                    <p className="text-sm font-medium">نوع الدفع:</p>
                    <p>{getPaymentTypeLabel(selectedItem.paymentType)}</p>
                  </div>
                )}
                {selectedItem.paymentStatus && (
                  <div>
                    <p className="text-sm font-medium">حالة الدفع:</p>
                    <Badge variant={getStatusBadgeVariant(selectedItem.paymentStatus)}>
                      {getPaymentStatusLabel(selectedItem.paymentStatus)}
                    </Badge>
                  </div>
                )}
                {selectedItem.amountPaid !== undefined && (
                  <div>
                    <p className="text-sm font-medium">المدفوع:</p>
                    <p>{formatCurrency(selectedItem.amountPaid)}</p>
                  </div>
                )}
                {selectedItem.amountRemaining !== undefined && (
                  <div>
                    <p className="text-sm font-medium">المتبقي:</p>
                    <p>{formatCurrency(selectedItem.amountRemaining)}</p>
                  </div>
                )}
              </div>

              {selectedItem.payments && selectedItem.payments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">سجل الدفعات:</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">#</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead className="text-left">المبلغ (ج.م)</TableHead>
                        <TableHead>ملاحظة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItem.payments.map((payment: any, index: number) => (
                        <TableRow key={payment.id}>
                          <TableCell className="text-center">{index + 1}</TableCell>
                          <TableCell>{formatDate(payment.date)}</TableCell>
                          <TableCell className="text-left">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{payment.note || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">المنتجات:</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">#</TableHead>
                      <TableHead>المنتج</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead className="text-left">السعر (ج.م)</TableHead>
                      <TableHead className="text-left">الإجمالي (ج.م)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItem.items.map((item: SaleItem, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-left">{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-left">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة دفعة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDeferredSale && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  <strong>المتبقي:</strong> {formatCurrency(selectedDeferredSale.amountRemaining)}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">المبلغ</label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="أدخل المبلغ"
              />
            </div>
            <div>
              <label className="text-sm font-medium">ملاحظة (اختياري)</label>
              <Input
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="أدخل ملاحظة"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddPayment}>إضافة</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
