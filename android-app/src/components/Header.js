import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function Header({ serverOnline, checkingHealth, onRefreshHealth }) {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="flask" size={18} color={THEME.accentOrange} />
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>ChemSpace</Text>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>v3.1.0</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Scientific Computing Platform</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.healthPill,
          serverOnline ? styles.healthPillOnline : styles.healthPillOffline
        ]}
        onPress={onRefreshHealth}
        activeOpacity={0.7}
      >
        {checkingHealth ? (
          <ActivityIndicator size="small" color={THEME.accentOrange} style={{ marginRight: 4 }} />
        ) : (
          <View
            style={[
              styles.statusDot,
              { backgroundColor: serverOnline ? THEME.accentEmerald : THEME.accentRed }
            ]}
          />
        )}
        <Text
          style={[
            styles.healthText,
            { color: serverOnline ? THEME.accentEmerald : THEME.accentRed }
          ]}
        >
          {serverOnline ? 'Backend Online' : 'Offline / Tap'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.bgSidebar,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderSubtle
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.accentOrangeSubtle,
    borderWidth: 1,
    borderColor: THEME.accentOrangeBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.textPrimary,
    letterSpacing: 0.3
  },
  versionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: THEME.borderSubtle
  },
  versionText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.textSecondary,
    fontFamily: 'monospace'
  },
  subtitle: {
    fontSize: 11,
    color: THEME.textMuted
  },
  healthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1
  },
  healthPillOnline: {
    backgroundColor: THEME.accentEmeraldSubtle,
    borderColor: THEME.accentEmeraldBorder
  },
  healthPillOffline: {
    backgroundColor: THEME.accentRedSubtle,
    borderColor: THEME.accentRed
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6
  },
  healthText: {
    fontSize: 11,
    fontWeight: '600'
  }
});
