'use client';

import { useEffect, useState, useRef } from 'react';
import { getSettings, setSettings, exportAllData, importAllData } from '@/lib/store';
import { Settings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Upload, Download, Image, FileText, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsSection() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [settings, setLocalSettings] = useState<Settings>({
    companyName: '',
    companyLogo: '',
    invoiceBackground: '',
    invoiceTemplate: 'default',
    registrationNumber: '',
  });

  useEffect(() => {
    const loadedSettings = getSettings();
    setLocalSettings(loadedSettings);
  }, []);

  const handleSave = () => {
    setSettings(settings);
    toast({
      title: 'تم الحفظ',
      description: 'تم حفظ الإعدادات بنجاح',
      variant: 'default',
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLocalSettings((prev) => ({ ...prev, companyLogo: base64 }));
        toast({
          title: 'تم رفع الشعار',
          description: 'تم رفع شعار المؤسسة بنجاح',
          variant: 'default',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLocalSettings((prev) => ({ ...prev, invoiceBackground: base64 }));
        toast({
          title: 'تم رفع الخلفية',
          description: 'تم رفع خلفية الفاتورة بنجاح',
          variant: 'default',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLocalSettings((prev) => ({ ...prev, companyLogo: '' }));
    toast({
      title: 'تم حذف الشعار',
      description: 'تم حذف شعار المؤسسة',
      variant: 'default',
    });
  };

  const removeBackground = () => {
    setLocalSettings((prev) => ({ ...prev, invoiceBackground: '' }));
    toast({
      title: 'تم حذف الخلفية',
      description: 'تم حذف خلفية الفاتورة',
      variant: 'default',
    });
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiro-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير البيانات بنجاح',
      variant: 'default',
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = importAllData(reader.result as string);
        if (result) {
          const loadedSettings = getSettings();
          setLocalSettings(loadedSettings);
          toast({
            title: 'تم الاستيراد',
            description: 'تم استيراد البيانات بنجاح',
            variant: 'default',
          });
        } else {
          toast({
            title: 'خطأ في الاستيراد',
            description: 'يرجى التأكد من صحة الملف',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-8 w-8" />
        <h2 className="text-2xl font-bold">الإعدادات</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              معلومات المؤسسة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">اسم المؤسسة</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setLocalSettings((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="أدخل اسم المؤسسة"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">رقم التسجيل</Label>
              <Input
                id="registrationNumber"
                value={settings.registrationNumber}
                onChange={(e) => setLocalSettings((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                placeholder="أدخل رقم التسجيل"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Template */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              شكل الفاتورة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>قالب الفاتورة</Label>
              <Select
                value={settings.invoiceTemplate}
                onValueChange={(v: 'default' | 'modern' | 'classic') =>
                  setLocalSettings((prev) => ({ ...prev, invoiceTemplate: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">افتراضي</SelectItem>
                  <SelectItem value="modern">عصري</SelectItem>
                  <SelectItem value="classic">كلاسيكي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Template Preview */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <p className="text-sm font-medium mb-2">معاينة:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                {settings.invoiceTemplate === 'default' && (
                  <div className="border-b pb-2">
                    <p className="font-bold">مؤسسة كيرو للأدوات الصحية</p>
                    <p>فاتورة ضريبية مبسطة</p>
                  </div>
                )}
                {settings.invoiceTemplate === 'modern' && (
                  <div className="bg-primary text-primary-foreground p-2 rounded-t">
                    <p className="font-bold text-center">مؤسسة كيرو للأدوات الصحية</p>
                  </div>
                )}
                {settings.invoiceTemplate === 'classic' && (
                  <div className="border-2 border-double p-2">
                    <p className="font-bold text-center border-b">مؤسسة كيرو للأدوات الصحية</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              صورة المؤسسة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="ml-2 h-4 w-4" />
                رفع شعار
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              {settings.companyLogo && (
                <Button variant="outline" onClick={removeLogo}>
                  حذف
                </Button>
              )}
            </div>
            {settings.companyLogo && (
              <div className="border rounded-lg p-4 flex justify-center">
                <img
                  src={settings.companyLogo}
                  alt="شعار المؤسسة"
                  className="h-24 object-contain"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Background */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              خلفية الفاتورة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => bgInputRef.current?.click()}>
                <Upload className="ml-2 h-4 w-4" />
                رفع خلفية
              </Button>
              <input
                type="file"
                ref={bgInputRef}
                onChange={handleBackgroundUpload}
                accept="image/*"
                className="hidden"
              />
              {settings.invoiceBackground && (
                <Button variant="outline" onClick={removeBackground}>
                  حذف
                </Button>
              )}
            </div>
            {settings.invoiceBackground && (
              <div className="border rounded-lg p-4 flex justify-center">
                <img
                  src={settings.invoiceBackground}
                  alt="خلفية الفاتورة"
                  className="h-24 object-contain opacity-45"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export/Import */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              استيراد وتصدير البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleExport}>
                <Download className="ml-2 h-4 w-4" />
                تصدير البيانات
              </Button>
              <Button variant="outline" onClick={() => importInputRef.current?.click()}>
                <Upload className="ml-2 h-4 w-4" />
                استيراد البيانات
              </Button>
              <input
                type="file"
                ref={importInputRef}
                onChange={handleImport}
                accept=".json"
                className="hidden"
              />
            </div>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              تحذير: استيراد البيانات سيستبدل جميع البيانات الحالية
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
}
