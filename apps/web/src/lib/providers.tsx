'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode, useEffect } from 'react';
import { useAuthInitializer, useTokenRefresh, useHandleTokenExpiry } from './hooks/useAuth';
import { initializeApiClient } from './api-service';
import { Toaster } from './toast';

function AuthInitializer({ children }: { children: ReactNode }) {
  useAuthInitializer();
  useTokenRefresh();
  useHandleTokenExpiry();

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, 
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    initializeApiClient();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {children}
        <Toaster />
      </AuthInitializer>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
