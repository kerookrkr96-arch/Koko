'use client';

import { useEffect, useState } from 'react';
import { getUsers, addUser, updateUser, deleteUser } from '@/lib/store';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserCog, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UserManagementSection() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'employee' as 'admin' | 'accountant' | 'employee',
  });

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'employee',
    });
  };

  const handleAdd = () => {
    if (!formData.name || !formData.username || !formData.password) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive',
      });
      return;
    }

    addUser(formData);
    setUsers(getUsers());
    setIsAddDialogOpen(false);
    resetForm();
    toast({
      title: 'تم الإضافة',
      description: 'تم إضافة المستخدم بنجاح',
      variant: 'default',
    });
  };

  const handleEdit = () => {
    if (!selectedUser || !formData.name || !formData.username) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive',
      });
      return;
    }

    const updateData: Partial<User> = {
      name: formData.name,
      username: formData.username,
      role: formData.role,
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    updateUser(selectedUser.id, updateData);
    setUsers(getUsers());
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    resetForm();
    toast({
      title: 'تم التحديث',
      description: 'تم تحديث المستخدم بنجاح',
      variant: 'default',
    });
  };

  const handleDelete = () => {
    if (!selectedUser) return;

    const admins = users.filter((u) => u.role === 'admin');
    if (selectedUser.role === 'admin' && admins.length === 1) {
      toast({
        title: 'خطأ',
        description: 'لا يمكن حذف آخر مدير',
        variant: 'destructive',
      });
      return;
    }

    deleteUser(selectedUser.id);
    setUsers(getUsers());
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
    toast({
      title: 'تم الحذف',
      description: 'تم حذف المستخدم بنجاح',
      variant: 'default',
    });
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: '',
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'accountant':
        return 'default';
      case 'employee':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير';
      case 'accountant':
        return 'محاسب';
      case 'employee':
        return 'موظف';
      default:
        return role;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCog className="h-8 w-8" />
          <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة مستخدم
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    لا يوجد مستخدمين
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role) as 'default' | 'destructive' | 'secondary'}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => openEditDialog(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(user)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل الاسم"
              />
            </div>
            <div className="space-y-2">
              <Label>اسم المستخدم</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="أدخل اسم المستخدم"
              />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="أدخل كلمة المرور"
              />
            </div>
            <div className="space-y-2">
              <Label>الدور</Label>
              <Select
                value={formData.role}
                onValueChange={(v: 'admin' | 'accountant' | 'employee') =>
                  setFormData((prev) => ({ ...prev, role: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="accountant">محاسب</SelectItem>
                  <SelectItem value="employee">موظف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAdd}>إضافة</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل مستخدم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل الاسم"
              />
            </div>
            <div className="space-y-2">
              <Label>اسم المستخدم</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="أدخل اسم المستخدم"
              />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور (اتركها فارغة إذا لا تريد تغييرها)</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="أدخل كلمة المرور الجديدة"
              />
            </div>
            <div className="space-y-2">
              <Label>الدور</Label>
              <Select
                value={formData.role}
                onValueChange={(v: 'admin' | 'accountant' | 'employee') =>
                  setFormData((prev) => ({ ...prev, role: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="accountant">محاسب</SelectItem>
                  <SelectItem value="employee">موظف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleEdit}>حفظ</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف المستخدم</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            هل أنت متأكد من حذف المستخدم "{selectedUser?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              حذف
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
