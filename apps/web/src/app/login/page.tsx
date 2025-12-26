'use client';

import { useRouter } from 'next/navigation';
import { useLogin } from '@/lib/api-hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormInputs } from '@/lib/validationSchemas';
import { useEffect, useState } from 'react';
import { getRememberedEmail, saveRememberedCredentials, clearRememberedCredentials } from '@/lib/remember-me';
import { useAuthStore } from '@/stores/auth.store';

function LoginPageContent() {
    const router = useRouter();
    const loginMutation = useLogin();
    const { login, isAuthenticated } = useAuthStore();
    const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        const email = getRememberedEmail();
        setRememberedEmail(email);
    }, []);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: rememberedEmail || '',
            password: '',
            rememberMe: !!rememberedEmail,
        },
    });

    useEffect(() => {
        if (rememberedEmail) {
            setValue('email', rememberedEmail);
            setValue('rememberMe', true);
        }
    }, [rememberedEmail, setValue]);

    const onSubmit = async (data: LoginFormInputs) => {
        try {
            const response = await loginMutation.mutateAsync({
                email: data.email,
                password: data.password,
            });

            // Handle "Remember Me" functionality
            if (data.rememberMe) {
                // Save refresh token for future auto-login (30 days)
                saveRememberedCredentials(data.email, response.refreshToken, 30);
            } else {
                // Clear remembered credentials if unchecked
                clearRememberedCredentials();
            }

            // Update auth store with user data
            login(response.user, response.accessToken, response.refreshToken);

            router.push('/dashboard');
        } catch (err: any) {
            console.error("Login failed:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Diet Management</h1>
                    <p className="text-slate-400 mt-2">Sign in to your account</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                                <p className="text-red-300 text-sm">{error}</p>
                            </div>
                        )} */}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={"admin@test.com"}
                                {...register('email')}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                                placeholder="admin@test.com"
                            />
                            {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                value={"Admin123!@#"}
                                type="password"
                                {...register('password')}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input 
                                    type="checkbox"
                                    {...register('rememberMe')}
                                    className="rounded bg-white/10 border border-white/20 text-emerald-400 focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                                />
                                <span className="ml-2 text-sm text-slate-400">Beni Hatırla</span>
                            </label>
                            <a href="#" className="text-sm text-emerald-400 hover:text-emerald-300">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-white font-semibold hover:from-emerald-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                        >
                            {loginMutation.isPending ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-sm text-slate-400">
                            Don't have an account? {' '}
                            <a href="/register" className="text-emerald-400 hover:text-emerald-300">Sign Up</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default function LoginPage() {
    const { isAuthenticated, isLoading } = useAuthStore();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-lg text-gray-300">Loading...</div>
            </div>
        );
    }

    // If authenticated, show loading and let the effect handle redirect
    if (isAuthenticated) {
        return null;
    }

    return <LoginPageContent />;
}