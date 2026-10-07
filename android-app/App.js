import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  BackHandler,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Theme & API
import { THEME } from './src/constants/theme';
import { checkServerHealth } from './src/services/api';

// Components
import Header from './src/components/Header';
import BottomTabBar from './src/components/BottomTabBar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import PeriodicTableScreen from './src/screens/PeriodicTableScreen';
import ReactionInputScreen from './src/screens/ReactionInputScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import ScientistsScreen from './src/screens/ScientistsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [serverOnline, setServerOnline] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Shared state across screens
  const [currentResultData, setCurrentResultData] = useState({
    name: 'Aspirin',
    formula: 'C9H8O4',
    mw: 180.16,
    smiles: 'CC(=O)Oc1ccccc1C(=O)O',
    type: 'molecule_analytics',
    output: {
      formula: 'C9H8O4',
      molWeight: 180.16,
      logP: 1.31,
      tpsa: 63.6,
      hbd: 1,
      hba: 4,
      rotatableBonds: 3,
      aromaticRings: 1
    }
  });

  const [initialReactionSMILES, setInitialReactionSMILES] = useState('CCO.CC(=O)O');

  // Verify backend health on mount
  const checkHealth = useCallback(async () => {
    setCheckingHealth(true);
    const res = await checkServerHealth();
    setServerOnline(Boolean(res.success));
    setCheckingHealth(false);
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Handle Android Hardware Back Button
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (activeTab !== 'Home') {
        setActiveTab('Home');
        return true; // prevent exit, return to Home
      }
      return false; // allow exit if on Home
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [activeTab]);

  const handleSelectMoleculeForResults = (moleculeData) => {
    setCurrentResultData(moleculeData);
  };

  const handleSendToReaction = (smilesOrSymbol) => {
    setInitialReactionSMILES(smilesOrSymbol);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={THEME.bgSidebar} />
      <View style={styles.root}>
        {/* Top Header with Live Server Telemetry */}
        <Header
          serverOnline={serverOnline}
          checkingHealth={checkingHealth}
          onRefreshHealth={checkHealth}
        />

        {/* Active Screen Container */}
        <View style={styles.screenContainer}>
          {activeTab === 'Home' && (
            <HomeScreen
              onNavigate={setActiveTab}
              onSelectMoleculeForResults={handleSelectMoleculeForResults}
            />
          )}

          {activeTab === 'Periodic' && (
            <PeriodicTableScreen
              onNavigate={setActiveTab}
              onSendToReaction={handleSendToReaction}
            />
          )}

          {activeTab === 'Reaction' && (
            <ReactionInputScreen
              initialReactants={initialReactionSMILES}
              onResultsReady={setCurrentResultData}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'Results' && (
            <ResultsScreen
              resultData={currentResultData}
              onNavigate={setActiveTab}
              onSendToReaction={handleSendToReaction}
            />
          )}

          {activeTab === 'Scientists' && (
            <ScientistsScreen
              onNavigate={setActiveTab}
              onSendToReaction={handleSendToReaction}
            />
          )}
        </View>

        {/* Bottom Tab Navigation Bar */}
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bgSidebar,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0
  },
  root: {
    flex: 1,
    backgroundColor: THEME.bgPage
  },
  screenContainer: {
    flex: 1
  }
});
