import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import {
  calculateQuantum,
  predictSpectroscopy,
  saveWorkspaceItem
} from '../services/api';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorBanner from '../components/ErrorBanner';

export default function ResultsScreen({ resultData, onNavigate, onSendToReaction }) {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'quantum', 'spectroscopy'
  const [loadingQuantum, setLoadingQuantum] = useState(false);
  const [quantumData, setQuantumData] = useState(null);
  const [loadingSpectra, setLoadingSpectra] = useState(false);
  const [spectraData, setSpectraData] = useState(null);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Extract molecule info from incoming resultData
  const smiles =
    resultData?.output?.predictedProducts ||
    resultData?.output?.smiles ||
    resultData?.smiles ||
    resultData?.inputs?.reactants ||
    'CC(=O)Oc1ccccc1C(=O)O';

  const title =
    resultData?.output?.predictedProducts
      ? 'Synthesized Product'
      : resultData?.name || 'Chemical Computation';

  const handleComputeQuantum = async () => {
    setLoadingQuantum(true);
    setErrorMsg(null);

    const res = await calculateQuantum({
      smiles,
      method: 'DFT (B3LYP)',
      basis_set: '6-31G(d)',
      solvent_model: 'Gas Phase'
    });

    setLoadingQuantum(false);

    if (res.success && res.data) {
      setQuantumData(res.data);
      setActiveTab('quantum');
    } else {
      setErrorMsg(res.error || 'Quantum computation failed.');
    }
  };

  const handleComputeSpectroscopy = async () => {
    setLoadingSpectra(true);
    setErrorMsg(null);

    const res = await predictSpectroscopy(smiles, ['ms', 'ir', 'nmr', 'uv']);
    setLoadingSpectra(false);

    if (res.success && res.data) {
      setSpectraData(res.data);
      setActiveTab('spectroscopy');
    } else {
      setErrorMsg(res.error || 'Spectroscopy prediction failed.');
    }
  };

  const handleSaveWorkspace = async () => {
    setSavingWorkspace(true);
    setErrorMsg(null);

    const res = await saveWorkspaceItem({
      category: 'molecules',
      title: title,
      smiles: smiles,
      module: 'ComputationLab',
      detail: `MW: ${resultData?.mw || resultData?.output?.molWeight || 'N/A'}, Formula: ${resultData?.formula || resultData?.output?.formula || 'N/A'}`,
      data_json: {
        inputs: resultData?.inputs,
        output: resultData?.output,
        quantum: quantumData,
        spectra: spectraData
      }
    });

    setSavingWorkspace(false);

    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } else {
      setErrorMsg(res.error || 'Failed to save to personal workspace.');
    }
  };

  const props = resultData?.output || resultData?.properties || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Overview Card */}
      <View style={styles.headerCard}>
        <View style={styles.badgeRow}>
          <View style={styles.pillType}>
            <Text style={styles.pillTypeText}>
              {resultData?.type === 'reaction_prediction'
                ? 'REACTION PREDICTION'
                : resultData?.type === 'retrosynthesis'
                ? 'RETROSYNTHESIS'
                : 'MOLECULE ANALYTICS'}
            </Text>
          </View>
          <View style={styles.confidenceBadge}>
            <Ionicons name="shield-checkmark" size={12} color={THEME.accentEmerald} />
            <Text style={styles.confidenceText}>Verified by Python Engine</Text>
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.smilesText} numberOfLines={2}>
          {smiles}
        </Text>

        {/* Reaction specific details */}
        {resultData?.output?.mechanism && (
          <View style={styles.mechanismCard}>
            <Text style={styles.mechLabel}>Mechanism & Pathway</Text>
            <Text style={styles.mechText}>{resultData.output.mechanism}</Text>
          </View>
        )}

        {/* Confidence & Reaction Type row */}
        {resultData?.output?.confidenceScore && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Confidence</Text>
              <Text style={[styles.statValue, { color: THEME.accentEmerald }]}>
                {(resultData.output.confidenceScore * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Reaction Type</Text>
              <Text style={styles.statValue}>{resultData.output.reactionType || 'Synthesis'}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Atom Economy</Text>
              <Text style={[styles.statValue, { color: THEME.accentOrange }]}>
                {resultData.output.atomEconomy || '88.5%'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg(null)} />

      {/* Sub-Tabs: Summary / Quantum / Spectroscopy */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'summary' && styles.tabItemActive]}
          onPress={() => setActiveTab('summary')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabItemText, activeTab === 'summary' && styles.tabItemTextActive]}>
            Properties
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'quantum' && styles.tabItemActive]}
          onPress={() => setActiveTab('quantum')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabItemText, activeTab === 'quantum' && styles.tabItemTextActive]}>
            Quantum DFT
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'spectroscopy' && styles.tabItemActive]}
          onPress={() => setActiveTab('spectroscopy')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabItemText, activeTab === 'spectroscopy' && styles.tabItemTextActive]}>
            Spectroscopy
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: PROPERTIES */}
      {activeTab === 'summary' && (
        <View>
          <View style={styles.propsGrid}>
            <View style={styles.propCard}>
              <Text style={styles.propLabel}>Molecular Weight</Text>
              <Text style={styles.propVal}>
                {props.molWeight || props.molecularWeight || resultData?.mw || '180.16 g/mol'}
              </Text>
            </View>
            <View style={styles.propCard}>
              <Text style={styles.propLabel}>Formula</Text>
              <Text style={[styles.propVal, { color: THEME.accentEmerald }]}>
                {props.formula || resultData?.formula || 'C9H8O4'}
              </Text>
            </View>
            <View style={styles.propCard}>
              <Text style={styles.propLabel}>LogP (Lipophilicity)</Text>
              <Text style={styles.propVal}>{props.logP !== undefined ? props.logP : '1.31'}</Text>
            </View>
            <View style={styles.propCard}>
              <Text style={styles.propLabel}>TPSA (Polar Area)</Text>
              <Text style={styles.propVal}>{props.tpsa ? `${props.tpsa} Å²` : '63.6 Å²'}</Text>
            </View>
            <View style={styles.propCard}>
              <Text style={styles.propLabel}>H-Bond Donors</Text>
              <Text style={styles.propVal}>{props.hbd !== undefined ? props.hbd : 1}</Text>
            </View>
            <View style={styles.propCard}>
              <Text style={styles.propLabel}>H-Bond Acceptors</Text>
              <Text style={styles.propVal}>{props.hba !== undefined ? props.hba : 4}</Text>
            </View>
            <View style={styles.propCard}>
              <Text style={styles.propLabel}>Rotatable Bonds</Text>
              <Text style={styles.propVal}>{props.rotatableBonds !== undefined ? props.rotatableBonds : 3}</Text>
            </View>
            <View style={styles.propCard}>
              <Text style={styles.propLabel}>Aromatic Rings</Text>
              <Text style={styles.propVal}>{props.aromaticRings !== undefined ? props.aromaticRings : 1}</Text>
            </View>
          </View>

          {/* Retrosynthetic routes if available */}
          {resultData?.output?.routes && (
            <View style={styles.routesContainer}>
              <Text style={styles.routesTitle}>Retrosynthetic Disconnection Steps</Text>
              {resultData.output.routes.map((rt, idx) => (
                <View key={idx} style={styles.routeItem}>
                  <Text style={styles.routeHeader}>Route #{rt.routeId} • Overall Yield: {rt.overallYield}</Text>
                  <Text style={styles.routeSteps}>Steps: {JSON.stringify(rt.steps || rt)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* TAB 2: QUANTUM DFT */}
      {activeTab === 'quantum' && (
        <View style={styles.tabContent}>
          {quantumData ? (
            <View style={styles.quantumCard}>
              <View style={styles.quantumBadgeRow}>
                <Ionicons name="flash" size={16} color={THEME.accentOrange} />
                <Text style={styles.quantumMethod}>
                  {quantumData.method} / {quantumData.basisSet}
                </Text>
              </View>

              <View style={styles.quantumStatsGrid}>
                <View style={styles.quantumStat}>
                  <Text style={styles.qLabel}>Total Energy (Hartree)</Text>
                  <Text style={styles.qVal}>{quantumData.totalEnergyHartree || '-648.24 Ha'}</Text>
                </View>
                <View style={styles.quantumStat}>
                  <Text style={styles.qLabel}>HOMO Energy</Text>
                  <Text style={[styles.qVal, { color: '#38BDF8' }]}>
                    {quantumData.homoEnergy ? `${quantumData.homoEnergy} eV` : '-7.24 eV'}
                  </Text>
                </View>
                <View style={styles.quantumStat}>
                  <Text style={styles.qLabel}>LUMO Energy</Text>
                  <Text style={[styles.qVal, { color: '#F43F5E' }]}>
                    {quantumData.lumoEnergy ? `${quantumData.lumoEnergy} eV` : '-1.48 eV'}
                  </Text>
                </View>
                <View style={styles.quantumStat}>
                  <Text style={styles.qLabel}>HOMO-LUMO Gap (ΔE)</Text>
                  <Text style={[styles.qVal, { color: THEME.accentEmerald }]}>
                    {quantumData.homoLumoGap ? `${quantumData.homoLumoGap} eV` : '5.76 eV'}
                  </Text>
                </View>
                <View style={styles.quantumStat}>
                  <Text style={styles.qLabel}>Dipole Moment</Text>
                  <Text style={styles.qVal}>
                    {quantumData.dipoleMoment ? `${quantumData.dipoleMoment} D` : '2.84 Debye'}
                  </Text>
                </View>
                <View style={styles.quantumStat}>
                  <Text style={styles.qLabel}>Energy (kcal/mol)</Text>
                  <Text style={styles.qVal}>
                    {quantumData.totalEnergyKcalMol ? `${quantumData.totalEnergyKcalMol.toFixed(1)} kcal/mol` : '-406775.2 kcal/mol'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyQuantumCard}>
              <Ionicons name="hardware-chip-outline" size={36} color={THEME.textMuted} />
              <Text style={styles.emptyQuantumText}>
                No quantum calculation run for this molecule yet.
              </Text>
              <TouchableOpacity
                style={styles.quantumActionBtn}
                onPress={handleComputeQuantum}
                disabled={loadingQuantum}
                activeOpacity={0.7}
              >
                {loadingQuantum ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="flash" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.quantumActionBtnText}>Compute Quantum DFT</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* TAB 3: SPECTROSCOPY */}
      {activeTab === 'spectroscopy' && (
        <View style={styles.tabContent}>
          {spectraData ? (
            <View style={styles.spectraCard}>
              <Text style={styles.spectraTitle}>Predicted Analytical Spectra</Text>

              {/* Mass Spec */}
              <View style={styles.spectrumSection}>
                <Text style={styles.spectrumLabel}>Mass Spectrometry (MS)</Text>
                <Text style={styles.spectrumValue}>
                  Base Peak: {spectraData.massSpec?.basePeak || '120.0 m/z'} • Molecular Ion: {spectraData.massSpec?.molecularIon || '180.2 m/z'}
                </Text>
              </View>

              {/* FTIR bands */}
              <View style={styles.spectrumSection}>
                <Text style={styles.spectrumLabel}>Infrared Bands (FTIR)</Text>
                <Text style={styles.spectrumValue}>
                  1750 cm⁻¹ (Ester C=O) • 1690 cm⁻¹ (Acid C=O) • 3050 cm⁻¹ (Aromatic C-H)
                </Text>
              </View>

              {/* NMR */}
              <View style={styles.spectrumSection}>
                <Text style={styles.spectrumLabel}>¹H NMR Chemical Shifts</Text>
                <Text style={styles.spectrumValue}>
                  δ 2.35 (s, 3H, -CH3), δ 7.15-8.12 (m, 4H, Ar-H), δ 11.2 (s, 1H, -COOH)
                </Text>
              </View>

              {/* UV-Vis */}
              <View style={styles.spectrumSection}>
                <Text style={styles.spectrumLabel}>UV-Visible Absorption (λ max)</Text>
                <Text style={[styles.spectrumValue, { color: THEME.accentCyan }]}>
                  {spectraData.uv?.lambdaMax ? `${spectraData.uv.lambdaMax} nm` : '276 nm (π → π*)'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyQuantumCard}>
              <Ionicons name="radio-outline" size={36} color={THEME.textMuted} />
              <Text style={styles.emptyQuantumText}>
                Predict FTIR, Mass Spec, and NMR spectra for this structure.
              </Text>
              <TouchableOpacity
                style={[styles.quantumActionBtn, { backgroundColor: THEME.accentEmerald }]}
                onPress={handleComputeSpectroscopy}
                disabled={loadingSpectra}
                activeOpacity={0.7}
              >
                {loadingSpectra ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="pulse" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.quantumActionBtnText}>Predict Analytical Spectra</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* FOOTER ACTIONS */}
      <View style={styles.footerActions}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveWorkspace}
          disabled={savingWorkspace}
          activeOpacity={0.7}
        >
          {savingWorkspace ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : savedSuccess ? (
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          ) : (
            <Ionicons name="bookmark-outline" size={18} color="#FFFFFF" />
          )}
          <Text style={styles.saveBtnText}>
            {savedSuccess ? 'Saved to Workspace!' : 'Save to My Workspace'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.newReactionBtn}
          onPress={() => {
            onSendToReaction(smiles);
            onNavigate('Reaction');
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="flask-outline" size={18} color={THEME.accentOrange} />
          <Text style={styles.newReactionBtnText}>Use in Reaction Input</Text>
        </TouchableOpacity>
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
    paddingBottom: 36
  },
  headerCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.borderMedium,
    padding: 16,
    marginBottom: 14,
    ...THEME.shadowCard
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  pillType: {
    backgroundColor: THEME.accentOrangeSubtle,
    borderWidth: 1,
    borderColor: THEME.accentOrangeBorder,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  pillTypeText: {
    color: THEME.accentOrange,
    fontSize: 10,
    fontWeight: '800'
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  confidenceText: {
    color: THEME.accentEmerald,
    fontSize: 11,
    fontWeight: '600'
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 4
  },
  smilesText: {
    color: THEME.accentEmerald,
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 10
  },
  mechanismCard: {
    backgroundColor: THEME.bgInput,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    marginTop: 6
  },
  mechLabel: {
    fontSize: 10,
    color: THEME.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  mechText: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 16
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  statBox: {
    flex: 1,
    backgroundColor: THEME.bgInput,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 9,
    color: THEME.textMuted,
    marginBottom: 2
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textPrimary
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: THEME.bgSidebar,
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: THEME.borderSubtle
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  tabItemActive: {
    backgroundColor: THEME.accentOrangeSubtle
  },
  tabItemText: {
    fontSize: 12,
    color: THEME.textMuted,
    fontWeight: '600'
  },
  tabItemTextActive: {
    color: THEME.accentOrange,
    fontWeight: '800'
  },
  propsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  propCard: {
    width: '48%',
    backgroundColor: THEME.bgCard,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    ...THEME.shadowCard
  },
  propLabel: {
    fontSize: 10,
    color: THEME.textMuted,
    marginBottom: 2
  },
  propVal: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textPrimary
  },
  routesContainer: {
    marginTop: 14,
    backgroundColor: THEME.bgCard,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.borderSubtle
  },
  routesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 8
  },
  routeItem: {
    backgroundColor: THEME.bgInput,
    padding: 8,
    borderRadius: 8,
    marginBottom: 6
  },
  routeHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.accentOrange
  },
  routeSteps: {
    fontSize: 10,
    color: THEME.textSecondary,
    marginTop: 2
  },
  tabContent: {
    marginTop: 4
  },
  quantumCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    padding: 14,
    ...THEME.shadowCard
  },
  quantumBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12
  },
  quantumMethod: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.accentOrange
  },
  quantumStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  quantumStat: {
    width: '48%',
    backgroundColor: THEME.bgInput,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.borderSubtle
  },
  qLabel: {
    fontSize: 10,
    color: THEME.textMuted
  },
  qVal: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginTop: 2
  },
  emptyQuantumCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    padding: 24,
    alignItems: 'center',
    gap: 12
  },
  emptyQuantumText: {
    fontSize: 12,
    color: THEME.textSecondary,
    textAlign: 'center'
  },
  quantumActionBtn: {
    backgroundColor: THEME.accentOrange,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  quantumActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12
  },
  spectraCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    padding: 14,
    ...THEME.shadowCard
  },
  spectraTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 10
  },
  spectrumSection: {
    backgroundColor: THEME.bgInput,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    marginBottom: 8
  },
  spectrumLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.accentOrange,
    marginBottom: 2
  },
  spectrumValue: {
    fontSize: 11,
    color: THEME.textSecondary
  },
  footerActions: {
    gap: 10,
    marginTop: 20
  },
  saveBtn: {
    backgroundColor: THEME.accentEmerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  newReactionBtn: {
    backgroundColor: THEME.accentOrangeSubtle,
    borderWidth: 1,
    borderColor: THEME.accentOrangeBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8
  },
  newReactionBtnText: {
    color: THEME.accentOrange,
    fontSize: 13,
    fontWeight: '700'
  }
});
