"use client";

import * as React from "react";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Zap,
  RotateCcw,
  RotateCw,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  UserCog,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  submenu?: string[];
}

const menuItems: MenuItem[] = [
  { id: "home", label: "الرئيسية", icon: LayoutDashboard },
  { id: "inventory", label: "المخزون", icon: Package },
  { id: "daily-sales", label: "المبيعات اليومية", icon: ShoppingCart },
  { id: "invoice", label: "الفاتورة", icon: FileText },
  { id: "instant-sales", label: "مبيعات فوري", icon: Zap },
  { id: "sales-return", label: "مرتجع المبيعات", icon: RotateCcw },
  { id: "invoice-return", label: "مرتجع الفاتورة", icon: RotateCw },
  {
    id: "records",
    label: "السجلات",
    icon: BookOpen,
    submenu: [
      "سجل المبيعات",
      "سجل الفاتورة",
      "أرشيف الفاتورة",
      "سجل مرتجع المبيعات",
      "سجل مرتجع الفاتورة",
      "سجل مبيعات فوري",
      "سجل المؤجل",
    ],
  },
  { id: "customers", label: "العملاء", icon: Users },
  { id: "reports", label: "التقارير", icon: BarChart3 },
  { id: "settings", label: "الإعدادات", icon: Settings },
  { id: "user-management", label: "إدارة المستخدمين", icon: UserCog },
];

interface DashboardLayoutProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  userName: string;
  children?: React.ReactNode;
}

export function DashboardLayout({
  activeSection,
  onSectionChange,
  onLogout,
  userName,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSectionClick = (section: string) => {
    onSectionChange(section);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col" dir="rtl">
      {/* Company Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <span className="text-lg font-bold">م</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              نظام إدارة الأعمال
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              Business Management
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-sidebar-foreground"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* User Info */}
      <div className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
            <span className="text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">
              {userName}
            </span>
            <span className="text-xs text-sidebar-foreground/70">مدير النظام</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              activeSection === item.id ||
              (item.submenu &&
                item.submenu.some(
                  (sub) => activeSection === sub || activeSection.includes(sub)
                ));
            const Icon = item.icon;

            if (item.submenu) {
              return (
                <li key={item.id}>
                  <Collapsible
                    open={recordsOpen}
                    onOpenChange={setRecordsOpen}
                    className="w-full"
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/80"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            recordsOpen && "rotate-180"
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 px-2 pt-1">
                      {item.submenu.map((subItem) => (
                        <Button
                          key={subItem}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start px-3 py-2 text-sm font-normal transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            activeSection === subItem
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/70"
                          )}
                          onClick={() => handleSectionClick(subItem)}
                        >
                          <span className="mr-6">{subItem}</span>
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80"
                  )}
                  onClick={() => handleSectionClick(item.id)}
                >
                  <Icon className="ml-3 h-5 w-5" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="ml-3 h-5 w-5" />
          ) : (
            <Moon className="ml-3 h-5 w-5" />
          )}
          {theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
        </Button>

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-destructive hover:text-destructive-foreground"
          onClick={onLogout}
        >
          <LogOut className="ml-3 h-5 w-5" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-background" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-sidebar border-l border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed right-4 top-4 z-40"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-72 bg-sidebar p-0 sm:max-w-none"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <span className="text-sm font-bold">م</span>
            </div>
            <span className="text-sm font-semibold">نظام إدارة الأعمال</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children || (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">
                  مرحباً بك يا {userName}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  اختر قسم من القائمة للبدء
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
