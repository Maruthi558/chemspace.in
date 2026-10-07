import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

const TABS = [
  { id: 'Home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { id: 'Periodic', label: 'Periodic', icon: 'grid-outline', activeIcon: 'grid' },
  { id: 'Reaction', label: 'Reaction', icon: 'flask-outline', activeIcon: 'flask' },
  { id: 'Results', label: 'Results', icon: 'analytics-outline', activeIcon: 'analytics' },
  { id: 'Scientists', label: 'Scientists', icon: 'school-outline', activeIcon: 'school' }
];

export default function BottomTabBar({ activeTab, onTabChange }) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={20}
                color={isActive ? THEME.accentOrange : THEME.textMuted}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: THEME.bgSidebar,
    borderTopWidth: 1,
    borderTopColor: THEME.borderSubtle,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 5
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative'
  },
  tabButtonActive: {},
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  iconWrapperActive: {
    backgroundColor: THEME.accentOrangeSubtle
  },
  tabLabel: {
    fontSize: 11,
    color: THEME.textMuted,
    fontWeight: '500'
  },
  tabLabelActive: {
    color: THEME.accentOrange,
    fontWeight: '700'
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 2,
    backgroundColor: THEME.accentOrange,
    borderRadius: 1
  }
});
