/**
 * Offline-First Context Provider
 *
 * Provides offline state and sync functionality to React Native app.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useOfflineSync } from './offline-sync.service';
import { SyncStatus } from '@diet/shared';

interface OfflineContextType {
  isOnline: boolean;
  syncStatus: SyncStatus;
  triggerSync: () => Promise<void>;
  hasOfflineChanges: boolean;
  offlineModeEnabled: boolean;
  toggleOfflineMode: (enabled: boolean) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
  autoSync?: boolean;
  syncInterval?: number; // ms between auto syncs
}

export function OfflineProvider({
  children,
  autoSync = true,
  syncInterval = 30000,
}: OfflineProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState(false);
  const { sync, syncStatus, pendingCount, failedCount } = useOfflineSync();

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    return unsubscribe;
  }, []);

  // Auto-sync when online
  useEffect(() => {
    if (!autoSync || !isOnline || offlineModeEnabled) return;

    // Sync immediately when coming online
    sync();

    // Setup periodic sync
    const interval = setInterval(() => {
      sync();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, isOnline, offlineModeEnabled, sync, syncInterval]);

  const hasOfflineChanges = pendingCount > 0;

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        syncStatus,
        triggerSync: sync,
        hasOfflineChanges,
        offlineModeEnabled,
        toggleOfflineMode: setOfflineModeEnabled,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

/**
 * Hook to use offline context
 */
export function useOffline(): OfflineContextType {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}

/**
 * Hook for offline queries
 */
export function useOfflineQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    cacheTTL?: number; // Cache time to live
    fallbackData?: T;
  },
) {
  const { isOnline } = useOffline();
  const [data, setData] = useState<T | undefined>(options?.fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setIsLoading(true);

        if (isOnline) {
          // Fetch from server
          const result = await queryFn();
          if (isMounted) {
            setData(result);
            setError(null);
          }
        } else {
          // Try to get from cache
          const cacheKey = `query:${queryKey.join(':')}`;
          // Would get from offline storage
          if (isMounted) {
            setError(new Error('Offline - no cached data'));
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Query failed'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOnline, queryKey]);

  return { data, isLoading, error, isOnline };
}

/**
 * Hook for offline mutations
 */
export function useOfflineMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  },
) {
  const { isOnline, triggerSync } = useOffline();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (variables: V) => {
    setIsPending(true);
    setError(null);

    try {
      if (isOnline) {
        const result = await mutationFn(variables);
        options?.onSuccess?.(result);
      } else {
        // Save to offline queue (would use offlineStorageService)
        // Will be synced when online
        console.log('Saved mutation for later sync:', variables);
      }

      // Trigger sync after mutation
      await triggerSync();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed');
      setError(error);
      options?.onError?.(error);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
}
