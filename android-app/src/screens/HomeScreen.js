import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import {
  checkServerHealth,
  resolveMolecule,
  calculateMoleculeProperties,
  queryPubChem
} from '../services/api';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorBanner from '../components/ErrorBanner';

const QUICK_SPECIMENS = [
  { name: 'Aspirin', formula: 'C9H8O4', mw: '180.16 g/mol', smiles: 'CC(=O)Oc1ccccc1C(=O)O', cat: 'Analgesic' },
  { name: 'Caffeine', formula: 'C8H10N4O2', mw: '194.19 g/mol', smiles: 'Cn1cnc2c1c(=O)n(c(=O)n2C)C', cat: 'Stimulant' },
  { name: 'Paracetamol', formula: 'C8H9NO2', mw: '151.16 g/mol', smiles: 'CC(=O)Nc1ccc(O)cc1', cat: 'Antipyretic' },
  { name: 'Benzene', formula: 'C6H6', mw: '78.11 g/mol', smiles: 'c1ccccc1', cat: 'Aromatic' },
  { name: 'Ibuprofen', formula: 'C13H18O2', mw: '206.28 g/mol', smiles: 'CC(C)Cc1ccc(cc1)C(C)C(=O)O', cat: 'NSAID' }
];

export default function HomeScreen({ onNavigate, onSelectMoleculeForResults }) {
  const [telemetry, setTelemetry] = useState(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    loadHealthTelemetry();
  }, []);

  const loadHealthTelemetry = async () => {
    setLoadingTelemetry(true);
    setErrorMsg(null);
    const res = await checkServerHealth();
    if (res.success) {
      setTelemetry(res.data);
    } else {
      setErrorMsg(res.error);
    }
    setLoadingTelemetry(false);
  };

  const handleSearchCompound = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setErrorMsg(null);

    // Call backend molecule resolver
    const res = await resolveMolecule(searchQuery.trim());
    setSearching(false);

    if (res.success && res.data) {
      const data = res.data;
      const smiles = data.smiles || data.canonicalSmiles || searchQuery.trim();
      onSelectMoleculeForResults({
        name: data.name || searchQuery.trim(),
        formula: data.formula,
        mw: data.molecularWeight || data.mw,
        smiles: smiles,
        iupac: data.iupacName || data.iupac,
        source: 'Backend Resolver'
      });
      onNavigate('Results');
    } else {
      // Fallback: Try PubChem knowledge endpoint on backend
      const pubchemRes = await queryPubChem(searchQuery.trim());
      if (pubchemRes.success && pubchemRes.data && pubchemRes.data.compound) {
        const comp = pubchemRes.data.compound;
        onSelectMoleculeForResults({
          name: comp.query || searchQuery.trim(),
          formula: comp.formula,
          mw: comp.molecularWeight,
          smiles: comp.canonicalSmiles,
          iupac: comp.iupacName,
          source: 'PubChem Backend Proxy'
        });
        onNavigate('Results');
      } else {
        setErrorMsg(res.error || `Compound "${searchQuery}" not found. Try entering a valid SMILES or common name.`);
      }
    }
  };

  const handleSelectSpecimen = async (specimen) => {
    setSearching(true);
    setErrorMsg(null);

    // Request properties computation from Python backend
    const res = await calculateMoleculeProperties(specimen.smiles);
    setSearching(false);

    if (res.success) {
      onSelectMoleculeForResults({
        ...specimen,
        properties: res.data
      });
      onNavigate('Results');
    } else {
      // Even if offline, navigate with specimen details and show notice
      onSelectMoleculeForResults(specimen);
      onNavigate('Results');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. HERO BANNER */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.pillActive}>
            <View style={styles.greenPulse} />
            <Text style={styles.pillText}>
              {telemetry?.service || 'ChemSpace Core Scientific AI'}
            </Text>
          </View>
          <Text style={styles.versionPill}>{telemetry?.version || 'v3.1.0'}</Text>
        </View>

        <Text style={styles.heroTitle}>Autonomous Chemistry Laboratory</Text>
        <Text style={styles.heroSubtitle}>
          Real-time chemical synthesis prediction, quantum DFT analytics, and comprehensive
          periodic element exploration powered by our Python backend.
        </Text>

        {/* Search input */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={THEME.textMuted} style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search compound (e.g. Aspirin, C6H6, Ethanol)..."
            placeholderTextColor={THEME.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchCompound}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchCompound}
            disabled={searching}
            activeOpacity={0.7}
          >
            {searching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ErrorBanner message={errorMsg} onRetry={loadHealthTelemetry} onDismiss={() => setErrorMsg(null)} />

      {searching && <LoadingIndicator message="Resolving compound through Python backend..." />}

      {/* 2. QUICK MODULE LAUNCH TILES */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Scientific Modules</Text>
        <Text style={styles.sectionSubtitle}>Direct access</Text>
      </View>

      <View style={styles.tilesGrid}>
        <TouchableOpacity
          style={styles.moduleTile}
          onPress={() => onNavigate('Periodic')}
          activeOpacity={0.7}
        >
          <View style={[styles.tileIconBadge, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
            <Ionicons name="grid" size={20} color="#38BDF8" />
          </View>
          <Text style={styles.tileTitle}>Periodic Table</Text>
          <Text style={styles.tileDesc}>118 Elements, trends & electronic shells</Text>
          <View style={styles.tileFooter}>
            <Text style={[styles.tileBadge, { color: '#38BDF8' }]}>118 Elements</Text>
            <Ionicons name="chevron-forward" size={14} color={THEME.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleTile}
          onPress={() => onNavigate('Reaction')}
          activeOpacity={0.7}
        >
          <View style={[styles.tileIconBadge, { backgroundColor: THEME.accentOrangeSubtle }]}>
            <Ionicons name="flask" size={20} color={THEME.accentOrange} />
          </View>
          <Text style={styles.tileTitle}>Reaction Predictor</Text>
          <Text style={styles.tileDesc}>Synthesis products, mechanism & routes</Text>
          <View style={styles.tileFooter}>
            <Text style={[styles.tileBadge, { color: THEME.accentOrange }]}>Synthesis AI</Text>
            <Ionicons name="chevron-forward" size={14} color={THEME.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleTile}
          onPress={() => onNavigate('Results')}
          activeOpacity={0.7}
        >
          <View style={[styles.tileIconBadge, { backgroundColor: THEME.accentEmeraldSubtle }]}>
            <Ionicons name="analytics" size={20} color={THEME.accentEmerald} />
          </View>
          <Text style={styles.tileTitle}>Computation Lab</Text>
          <Text style={styles.tileDesc}>HOMO-LUMO DFT & spectroscopy analytics</Text>
          <View style={styles.tileFooter}>
            <Text style={[styles.tileBadge, { color: THEME.accentEmerald }]}>DFT & Spectra</Text>
            <Ionicons name="chevron-forward" size={14} color={THEME.textMuted} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleTile}
          onPress={() => onNavigate('Scientists')}
          activeOpacity={0.7}
        >
          <View style={[styles.tileIconBadge, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
            <Ionicons name="school" size={20} color="#EAB308" />
          </View>
          <Text style={styles.tileTitle}>Pioneers Gallery</Text>
          <Text style={styles.tileDesc}>Nobel laureates & historical chemists</Text>
          <View style={styles.tileFooter}>
            <Text style={[styles.tileBadge, { color: '#EAB308' }]}>Discoveries</Text>
            <Ionicons name="chevron-forward" size={14} color={THEME.textMuted} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. CURATED SPECIMENS */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Curated Chemical Specimens</Text>
        <Text style={styles.sectionSubtitle}>Tap to compute</Text>
      </View>

      {QUICK_SPECIMENS.map((item, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.specimenCard}
          onPress={() => handleSelectSpecimen(item)}
          activeOpacity={0.7}
        >
          <View style={styles.specimenLeft}>
            <View style={styles.specimenAvatar}>
              <Text style={styles.specimenSymbol}>{item.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View>
              <View style={styles.specimenNameRow}>
                <Text style={styles.specimenName}>{item.name}</Text>
                <View style={styles.specimenCatBadge}>
                  <Text style={styles.specimenCatText}>{item.cat}</Text>
                </View>
              </View>
              <Text style={styles.specimenFormula}>
                {item.formula} • {item.mw}
              </Text>
              <Text style={styles.specimenSmiles} numberOfLines={1}>
                {item.smiles}
              </Text>
            </View>
          </View>
          <View style={styles.specimenRight}>
            <Ionicons name="arrow-forward-circle" size={24} color={THEME.accentOrange} />
          </View>
        </TouchableOpacity>
      ))}

      {/* 4. BACKEND MODULE TELEMETRY */}
      <View style={styles.telemetryCard}>
        <View style={styles.telemetryHeader}>
          <Ionicons name="hardware-chip" size={16} color={THEME.accentEmerald} />
          <Text style={styles.telemetryTitle}>Backend Active Modules</Text>
        </View>
        {loadingTelemetry ? (
          <ActivityIndicator size="small" color={THEME.accentOrange} style={{ marginVertical: 10 }} />
        ) : telemetry?.active_modules ? (
          <View style={styles.moduleTagsRow}>
            {telemetry.active_modules.map((mod, i) => (
              <View key={i} style={styles.moduleTag}>
                <Text style={styles.moduleTagText}>{mod}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.telemetryFallback}>
            Connect to Python FastAPI backend (main.py) on port 8000 to stream live telemetry.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgPage
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30
  },
  heroCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.borderMedium,
    padding: 18,
    marginBottom: 16,
    ...THEME.shadowCard
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  pillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.accentEmeraldSubtle,
    borderWidth: 1,
    borderColor: THEME.accentEmeraldBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 6
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.accentEmerald
  },
  pillText: {
    color: THEME.accentEmerald,
    fontSize: 11,
    fontWeight: '600'
  },
  versionPill: {
    color: THEME.textMuted,
    fontSize: 11,
    fontFamily: 'monospace'
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textPrimary,
    letterSpacing: 0.3,
    marginBottom: 6
  },
  heroSubtitle: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 18,
    marginBottom: 16
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.borderSubtle
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: THEME.textPrimary,
    fontSize: 13
  },
  searchButton: {
    backgroundColor: THEME.accentOrange,
    padding: 10,
    borderRadius: 10,
    marginRight: 4
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textPrimary
  },
  sectionSubtitle: {
    fontSize: 11,
    color: THEME.textMuted
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20
  },
  moduleTile: {
    width: '48%',
    backgroundColor: THEME.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    padding: 14,
    ...THEME.shadowCard
  },
  tileIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 3
  },
  tileDesc: {
    fontSize: 11,
    color: THEME.textSecondary,
    lineHeight: 15,
    marginBottom: 12
  },
  tileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.borderSubtle
  },
  tileBadge: {
    fontSize: 10,
    fontWeight: '600'
  },
  specimenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    padding: 12,
    marginBottom: 10,
    ...THEME.shadowCard
  },
  specimenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  specimenAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: THEME.accentOrangeSubtle,
    borderWidth: 1,
    borderColor: THEME.accentOrangeBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  specimenSymbol: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.accentOrange
  },
  specimenNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  specimenName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textPrimary
  },
  specimenCatBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  specimenCatText: {
    fontSize: 10,
    color: THEME.textSecondary
  },
  specimenFormula: {
    fontSize: 11,
    color: THEME.accentEmerald,
    fontFamily: 'monospace',
    marginTop: 2
  },
  specimenSmiles: {
    fontSize: 10,
    color: THEME.textMuted,
    fontFamily: 'monospace',
    maxWidth: 200
  },
  specimenRight: {
    paddingLeft: 8
  },
  telemetryCard: {
    marginTop: 10,
    backgroundColor: THEME.bgSidebar,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    padding: 14
  },
  telemetryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  telemetryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  moduleTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  moduleTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  moduleTagText: {
    fontSize: 11,
    color: THEME.textSecondary
  },
  telemetryFallback: {
    fontSize: 11,
    color: THEME.textMuted,
    lineHeight: 16
  }
});
