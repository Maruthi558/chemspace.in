import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function ErrorBanner({ message, onRetry, onDismiss }) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <View style={styles.iconCol}>
        <Ionicons name="alert-circle" size={22} color={THEME.accentRed} />
      </View>
      <View style={styles.contentCol}>
        <Text style={styles.title}>API Communication Notice</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actionsRow}>
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
              <Ionicons name="refresh" size={13} color={THEME.accentOrange} />
              <Text style={styles.retryText}>Retry Request</Text>
            </TouchableOpacity>
          )}
          {onDismiss && (
            <TouchableOpacity style={styles.dismissButton} onPress={onDismiss} activeOpacity={0.7}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12
  },
  iconCol: {
    paddingTop: 2
  },
  contentCol: {
    flex: 1
  },
  title: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 2
  },
  message: {
    color: THEME.textSecondary,
    fontSize: 12,
    lineHeight: 17
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.accentOrangeSubtle,
    borderWidth: 1,
    borderColor: THEME.accentOrangeBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  retryText: {
    color: THEME.accentOrange,
    fontSize: 11,
    fontWeight: '600'
  },
  dismissButton: {
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  dismissText: {
    color: THEME.textMuted,
    fontSize: 11
  }
});
