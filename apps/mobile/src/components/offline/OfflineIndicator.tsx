/**
 * Offline Indicator Component
 *
 * Shows current network connectivity status
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOffline } from '../lib/offline/offline.context';

/**
 * Component showing online/offline status badge
 */
export const OfflineIndicator: React.FC<{
  position?: 'top' | 'bottom';
  variant?: 'badge' | 'banner';
}> = ({ position = 'top', variant = 'badge' }) => {
  const { isOnline, syncStatus } = useOffline();

  if (isOnline) {
    return null; // Don't show when online
  }

  if (variant === 'badge') {
    return (
      <View
        style={[
          styles.badge,
          position === 'top' ? styles.badgeTop : styles.badgeBottom,
        ]}
      >
        <View style={styles.statusDot} />
        <Text style={styles.badgeText}>Offline</Text>
      </View>
    );
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>
        You're offline. Changes will sync when online.
      </Text>
      {syncStatus.pendingCount > 0 && (
        <Text style={styles.bannerSubtext}>
          {syncStatus.pendingCount} change{syncStatus.pendingCount !== 1 ? 's' : ''} waiting
        </Text>
      )}
    </View>
  );
};

/**
 * Component showing sync status
 */
export const SyncStatus: React.FC<{ showDetails?: boolean }> = ({
  showDetails = false,
}) => {
  const { syncStatus, triggerSync } = useOffline();

  if (!showDetails && !syncStatus.isSyncing && syncStatus.pendingCount === 0) {
    return null;
  }

  return (
    <View style={styles.statusContainer}>
      {syncStatus.isSyncing ? (
        <>
          <View style={styles.spinnerContainer}>
            <View style={styles.spinner} />
          </View>
          <Text style={styles.syncingText}>
            Syncing... {Math.round(syncStatus.syncProgress || 0)}%
          </Text>
        </>
      ) : syncStatus.pendingCount > 0 ? (
        <>
          <Text style={styles.pendingText}>
            {syncStatus.pendingCount} pending change
            {syncStatus.pendingCount !== 1 ? 's' : ''}
          </Text>
          <Text onPress={() => triggerSync()} style={styles.syncLink}>
            Sync Now
          </Text>
        </>
      ) : (
        <Text style={styles.syncedText}>All synced ✓</Text>
      )}

      {syncStatus.failedCount > 0 && (
        <Text style={styles.failedText}>
          {syncStatus.failedCount} sync failed
          {syncStatus.failedCount !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
};

/**
 * Modal component for manual conflict resolution
 */
export const ConflictDialog: React.FC<{
  visible: boolean;
  conflict: any;
  onResolve: (resolution: 'LOCAL_WIN' | 'SERVER_WIN' | 'MERGE') => void;
  onCancel: () => void;
}> = ({ visible, conflict, onResolve, onCancel }) => {
  if (!visible || !conflict) {
    return null;
  }

  return (
    <View style={styles.dialogOverlay}>
      <View style={styles.dialog}>
        <Text style={styles.dialogTitle}>Conflict Detected</Text>

        <Text style={styles.dialogLabel}>Item: {conflict.entityType}</Text>

        <View style={styles.versionContainer}>
          <View style={styles.versionBox}>
            <Text style={styles.versionTitle}>Your Version</Text>
            <Text style={styles.versionText}>
              {JSON.stringify(conflict.localVersion, null, 2)}
            </Text>
          </View>

          <View style={styles.versionBox}>
            <Text style={styles.versionTitle}>Server Version</Text>
            <Text style={styles.versionText}>
              {JSON.stringify(conflict.serverVersion, null, 2)}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Text
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => onResolve('LOCAL_WIN')}
          >
            Keep Mine
          </Text>

          <Text
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => onResolve('SERVER_WIN')}
          >
            Use Server
          </Text>

          <Text style={[styles.button, styles.buttonCancel]} onPress={onCancel}>
            Cancel
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Offline Indicator
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'center',
  },
  badgeTop: {
    marginTop: 8,
  },
  badgeBottom: {
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  banner: {
    backgroundColor: '#FFA500',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FF8C00',
  },
  bannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bannerSubtext: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },

  // Sync Status
  statusContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  spinnerContainer: {
    marginBottom: 8,
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderTopColor: '#007AFF',
  },
  syncingText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  pendingText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '500',
  },
  syncLink: {
    color: '#007AFF',
    fontSize: 12,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  syncedText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '500',
  },
  failedText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },

  // Conflict Dialog
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '85%',
    maxWidth: 320,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  dialogLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  versionContainer: {
    marginBottom: 16,
  },
  versionBox: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  versionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  versionText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'Menlo',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
    color: '#fff',
  },
  buttonSecondary: {
    backgroundColor: '#E5E5EA',
    color: '#000',
  },
  buttonCancel: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
});
