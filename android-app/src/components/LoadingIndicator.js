import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { THEME } from '../constants/theme';

export default function LoadingIndicator({ message = 'Computing with Python backend...' }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={THEME.accentOrange} />
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.subtext}>ChemNova Scientific Engine</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderMedium,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 8,
    ...THEME.shadowCard
  },
  message: {
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4
  },
  subtext: {
    color: THEME.textMuted,
    fontSize: 11,
    fontFamily: 'monospace'
  }
});
