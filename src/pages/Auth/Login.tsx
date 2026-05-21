import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Mail, Lock, ArrowRight, Sparkles, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/src/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/src/services/api';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Email or Phone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { setAuth, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Verification verification states
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', data);
      const { user, token } = response.data;
      setAuth(user, token);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.unverified) {
        toast.info(error.response?.data?.message || 'Email verification is required to continue.');
        setVerificationEmail(error.response.data.email);
        return;
      }
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    setIsVerifying(true);
    try {
      const response = await api.post('/auth/verify-code', {
        email: verificationEmail,
        code: verificationCode.trim()
      });
      const { user, token, message } = response.data;
      setAuth(user, token);
      toast.success(message || 'Account verified and logged in successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed. Please double check the code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const response = await api.post('/auth/resend-code', {
        email: verificationEmail
      });
      toast.success(response.data?.message || 'Verification code resent successfully!');
      setResendCooldown(30);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend verification code');
    }
  };

  if (verificationEmail) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-gray-50/50 relative font-sans">
        {/* Dynamic Background Accents */}
        <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff5200]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md z-10"
        >
          <Card className="rounded-2xl border border-gray-100 shadow-xl bg-white p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-[#ff5200] to-orange-400" />
            
            <CardHeader className="space-y-1.5 text-center pb-6">
              <div className="mx-auto w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#ff5200] mb-4 border border-orange-100/50">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                Verify Your Email
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 max-w-xs mx-auto">
                We've dispatched a 6-digit confirmation key to <span className="font-semibold text-gray-900 break-all">{verificationEmail}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-xs font-semibold text-gray-700">6-Digit Verification Code</Label>
                  <div className="relative group">
                    <Input
                      id="code"
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="pl-10 h-11 tracking-[0.25em] text-center font-mono font-bold text-lg rounded-lg border-gray-200 bg-white text-sm focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-[#ff5200] transition-colors"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-[#ff5200] transition-colors" />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#ff5200] hover:bg-[#e04800] text-white font-bold rounded-lg text-sm shadow-md shadow-orange-500/10 transition-all active:scale-[0.98] border-none flex items-center justify-center gap-2 cursor-pointer"
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Verifying Code...' : (
                      <>
                        <span>Verify & Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-gray-50 pb-0">
              <div className="flex items-center justify-between w-full text-xs">
                <button
                  type="button"
                  onClick={() => setVerificationEmail(null)}
                  className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className={`font-semibold flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer ${
                    resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#ff5200] hover:text-[#e04800] hover:underline'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              <div className="bg-orange-50/50 p-2.5 rounded-lg border border-orange-100/50 text-center">
                <p className="text-[10px] text-[#ff5200] leading-relaxed font-semibold">
                  💡 Running in Sandbox: The 6-digit verification code is printed directly in the server console log for instant copy-pasting.
                </p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-gray-50/50 relative font-sans">
      {/* Dynamic Background Accents */}
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff5200]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="rounded-2xl border border-gray-100 shadow-xl bg-white p-6 sm:p-8 relative overflow-hidden">
          {/* Top Brand Accent strip */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff5200] to-orange-400" />
          
          <CardHeader className="space-y-1.5 text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#ff5200] mb-4 border border-orange-100/50">
              <KeyRound className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
              Welcome to <span className="text-[#ff5200]">Geekhoot</span>
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-xs font-semibold text-gray-700">Email Address or Phone</Label>
                <div className="relative group">
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="name@example.com / 9876543210"
                    className="pl-10 h-11 rounded-lg border-gray-200 bg-white text-sm focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-[#ff5200] transition-colors"
                    {...form.register('identifier')}
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-[#ff5200] transition-colors" />
                </div>
                {form.formState.errors.identifier && (
                  <p className="text-xs font-medium text-red-500">{form.formState.errors.identifier.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold text-gray-700">Password</Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 rounded-lg border-gray-200 bg-white text-sm focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-[#ff5200] transition-colors"
                    {...form.register('password')}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-[#ff5200] transition-colors" />
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs font-medium text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-[#ff5200] hover:bg-[#e04800] text-white font-bold rounded-lg text-sm shadow-md shadow-orange-500/10 transition-all active:scale-[0.98] border-none flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-gray-50 pb-0">
            <div className="text-xs text-center text-gray-500">
              New to Geekhoot?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-[#ff5200] hover:text-[#e04800] font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Create an account
              </button>
            </div>
            
            <div className="bg-orange-50/50 p-2.5 rounded-lg border border-orange-100/50 text-center">
              <p className="text-[11px] text-[#ff5200] font-medium flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Demo credentials: <span className="font-bold underline">geekhoot</span> / <span className="font-bold underline">asdfghjkl</span>
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
