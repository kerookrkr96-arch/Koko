'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { login } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = login(username, password);

    if (user) {
      onLogin();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse bg-gradient-to-br from-primary/30 to-transparent" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 animate-pulse bg-gradient-to-tl from-primary/20 to-transparent" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 bg-gradient-conic from-primary via-transparent to-primary/30" />
      </div>

      {/* Decorative Lines */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-md mx-4 relative z-10 border border-border/50 shadow-2xl dark:shadow-primary/10">
        {/* Card Glow Effect */}
        <div className="absolute -inset-1 rounded-2xl opacity-20 dark:opacity-30 blur-xl bg-gradient-to-br from-primary via-primary/50 to-secondary" />

        <CardHeader className="relative pb-2 pt-8 px-8 text-center">
          {/* Logo Icon */}
          <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-primary to-primary/80">
            <Lock className="w-10 h-10 text-primary-foreground" />
          </div>

          {/* Company Name */}
          <CardTitle className="text-2xl font-bold mb-2 bg-gradient-to-l from-primary to-primary/70 dark:from-primary-foreground dark:to-primary-foreground/70 bg-clip-text text-transparent">
            مؤسسة كيرو للأدوات الصحية
          </CardTitle>

          {/* Subtitle */}
          <p className="text-sm font-medium text-muted-foreground">
            نظام إدارة المخزون والمبيعات
          </p>
        </CardHeader>

        <CardContent className="relative px-8 pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-foreground">
                اسم المستخدم
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="h-12 text-lg text-right border-2 border-border bg-muted/30 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="h-12 text-lg text-right border-2 border-border bg-muted/30 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl text-sm text-center font-medium animate-shake bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  جاري تسجيل الدخول...
                </div>
              ) : (
                <>
                  <Lock className="w-5 h-5 ml-2" />
                  تسجيل الدخول
                </>
              )}
            </Button>

            {/* Credentials Hint */}
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground/70">
                Username: 1234 | Password: 1234
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-6 text-center w-full">
        <p className="text-xs text-muted-foreground/50">
          © 2024 مؤسسة كيرو للأدوات الصحية. جميع الحقوق محفوظة.
        </p>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }

        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.15; transform: translate(-50%, -50%) scale(1.1); }
        }
        .animate-pulse { animation: pulse 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
