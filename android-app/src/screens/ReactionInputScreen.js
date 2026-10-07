import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import {
  predictReaction,
  predictRetrosynthesis,
  calculateMoleculeProperties
} from '../services/api';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorBanner from '../components/ErrorBanner';

const PRESET_REACTANTS = [
  { label: 'Aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O' },
  { label: 'Benzene', smiles: 'c1ccccc1' },
  { label: 'Ethanol + Acetic Acid', smiles: 'CCO.CC(=O)O' },
  { label: 'Paracetamol', smiles: 'CC(=O)Nc1ccc(O)cc1' },
  { label: 'Acetone', smiles: 'CC(=O)C' },
  { label: 'Ibuprofen', smiles: 'CC(C)Cc1ccc(cc1)C(C)C(=O)O' }
];

const SOLVENTS = ['DCM', 'EtOH', 'H2O', 'THF', 'Et2O', 'Toluene', 'DMF'];
const TEMPERATURES = ['0°C', '25°C', '50°C', '80°C', 'Reflux'];

export default function ReactionInputScreen({ initialReactants, onResultsReady, onNavigate }) {
  const [reactantsSmiles, setReactantsSmiles] = useState(initialReactants || 'CCO.CC(=O)O');
  const [reagents, setReagents] = useState('H2SO4 catalyst');
  const [solvent, setSolvent] = useState('DCM');
  const [temperature, setTemperature] = useState('25°C');
  const [loadingAction, setLoadingAction] = useState(null); // 'predict', 'retro', 'props'
  const [errorMsg, setErrorMsg] = useState(null);

  const handlePredictReaction = async () => {
    if (!reactantsSmiles.trim()) {
      setErrorMsg('Please enter reactant SMILES or select a preset compound.');
      return;
    }

    setLoadingAction('predict');
    setErrorMsg(null);

    const res = await predictReaction({
      reactants_smiles: reactantsSmiles,
      reagents,
      temperature,
      solvent
    });

    setLoadingAction(null);

    if (res.success && res.data) {
      onResultsReady({
        type: 'reaction_prediction',
        inputs: {
          reactants: reactantsSmiles,
          reagents,
          solvent,
          temperature
        },
        output: res.data
      });
      onNavigate('Results');
    } else {
      setErrorMsg(res.error || 'Reaction prediction failed. Check your SMILES syntax.');
    }
  };

  const handleRetrosynthesis = async () => {
    if (!reactantsSmiles.trim()) {
      setErrorMsg('Please enter target molecule SMILES for retrosynthesis.');
      return;
    }

    setLoadingAction('retro');
    setErrorMsg(null);

    const res = await predictRetrosynthesis({
      target_smiles: reactantsSmiles,
      max_steps: 3
    });

    setLoadingAction(null);

    if (res.success && res.data) {
      onResultsReady({
        type: 'retrosynthesis',
        inputs: {
          target: reactantsSmiles
        },
        output: res.data
      });
      onNavigate('Results');
    } else {
      setErrorMsg(res.error || 'Retrosynthesis analysis failed.');
    }
  };

  const handleComputeProperties = async () => {
    if (!reactantsSmiles.trim()) {
      setErrorMsg('Please enter a valid SMILES string.');
      return;
    }

    setLoadingAction('props');
    setErrorMsg(null);

    const res = await calculateMoleculeProperties(reactantsSmiles);
    setLoadingAction(null);

    if (res.success && res.data) {
      onResultsReady({
        type: 'molecule_properties',
        inputs: {
          smiles: reactantsSmiles
        },
        output: res.data
      });
      onNavigate('Results');
    } else {
      setErrorMsg(res.error || 'Properties calculation failed.');
    }
  };

  const handleClear = () => {
    setReactantsSmiles('');
    setReagents('');
    setErrorMsg(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header card */}
      <View style={styles.headerCard}>
        <View style={styles.headerBadge}>
          <Ionicons name="git-branch" size={14} color={THEME.accentOrange} />
          <Text style={styles.headerBadgeText}>IBM RXN & ChemNova Synthesis Engine</Text>
        </View>
        <Text style={styles.title}>Chemical Reaction Synthesizer</Text>
        <Text style={styles.subtitle}>
          Execute forward reaction prediction, retrosynthetic pathways, and reactant descriptor
          computations via existing Python backend APIs.
        </Text>
      </View>

      <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg(null)} />

      {loadingAction && (
        <LoadingIndicator
          message={
            loadingAction === 'predict'
              ? 'Computing reaction mechanism with Python backend...'
              : loadingAction === 'retro'
              ? 'Analyzing retrosynthetic disconnection trees...'
              : 'Calculating molecular graph properties...'
          }
        />
      )}

      {/* REACTANTS INPUT */}
      <View style={styles.formCard}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldLabel}>Reactants (SMILES or Formula)</Text>
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.textInputLarge}
          placeholder="e.g. CCO.CC(=O)O (Ethanol + Acetic Acid)"
          placeholderTextColor={THEME.textMuted}
          value={reactantsSmiles}
          onChangeText={setReactantsSmiles}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />

        {/* Quick Specimen Chips */}
        <Text style={styles.subLabel}>Quick Presets:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {PRESET_REACTANTS.map((preset, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.presetChip}
              onPress={() => setReactantsSmiles(preset.smiles)}
              activeOpacity={0.7}
            >
              <Text style={styles.presetChipText}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* REAGENTS INPUT */}
      <View style={styles.formCard}>
        <Text style={styles.fieldLabel}>Reagents & Catalysts (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. H2SO4 catalyst, NaOH, Pd/C"
          placeholderTextColor={THEME.textMuted}
          value={reagents}
          onChangeText={setReagents}
          autoCapitalize="none"
        />
      </View>

      {/* REACTION CONDITIONS */}
      <View style={styles.formCard}>
        <Text style={styles.fieldLabel}>Solvent Selection</Text>
        <View style={styles.optionsWrap}>
          {SOLVENTS.map((solv) => {
            const isSel = solvent === solv;
            return (
              <TouchableOpacity
                key={solv}
                style={[styles.optionPill, isSel && styles.optionPillActive]}
                onPress={() => setSolvent(solv)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionPillText, isSel && styles.optionPillTextActive]}>
                  {solv}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Temperature</Text>
        <View style={styles.optionsWrap}>
          {TEMPERATURES.map((temp) => {
            const isSel = temperature === temp;
            return (
              <TouchableOpacity
                key={temp}
                style={[styles.optionPill, isSel && styles.optionPillActive]}
                onPress={() => setTemperature(temp)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionPillText, isSel && styles.optionPillTextActive]}>
                  {temp}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* PRIMARY API ACTION BUTTONS */}
      <View style={styles.actionsContainer}>
        {/* 1. Predict Reaction Products Button */}
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={handlePredictReaction}
          disabled={loadingAction !== null}
          activeOpacity={0.8}
        >
          {loadingAction === 'predict' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          )}
          <Text style={styles.primaryActionText}>Predict Reaction Products</Text>
        </TouchableOpacity>

        {/* 2. Retrosynthesis Route Button */}
        <TouchableOpacity
          style={styles.secondaryActionButton}
          onPress={handleRetrosynthesis}
          disabled={loadingAction !== null}
          activeOpacity={0.8}
        >
          {loadingAction === 'retro' ? (
            <ActivityIndicator size="small" color={THEME.accentOrange} />
          ) : (
            <Ionicons name="git-merge" size={18} color={THEME.accentOrange} />
          )}
          <Text style={styles.secondaryActionText}>Compute Retrosynthesis</Text>
        </TouchableOpacity>

        {/* 3. Reactant Descriptors Button */}
        <TouchableOpacity
          style={styles.tertiaryActionButton}
          onPress={handleComputeProperties}
          disabled={loadingAction !== null}
          activeOpacity={0.8}
        >
          {loadingAction === 'props' ? (
            <ActivityIndicator size="small" color={THEME.accentEmerald} />
          ) : (
            <Ionicons name="calculator" size={18} color={THEME.accentEmerald} />
          )}
          <Text style={styles.tertiaryActionText}>Calculate Molecular Properties</Text>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.borderMedium,
    padding: 16,
    marginBottom: 14,
    ...THEME.shadowCard
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.accentOrangeSubtle,
    borderWidth: 1,
    borderColor: THEME.accentOrangeBorder,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.accentOrange
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textPrimary,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 17
  },
  formCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    padding: 14,
    marginBottom: 12,
    ...THEME.shadowCard
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginBottom: 6
  },
  clearText: {
    fontSize: 11,
    color: THEME.accentOrange,
    fontWeight: '600'
  },
  textInput: {
    backgroundColor: THEME.bgInput,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: THEME.textPrimary,
    fontSize: 13
  },
  textInputLarge: {
    backgroundColor: THEME.bgInput,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: THEME.textPrimary,
    fontSize: 13,
    fontFamily: 'monospace',
    minHeight: 56
  },
  subLabel: {
    fontSize: 10,
    color: THEME.textMuted,
    marginTop: 10,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  presetScroll: {
    flexDirection: 'row'
  },
  presetChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6
  },
  presetChipText: {
    fontSize: 11,
    color: THEME.textSecondary
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  optionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  optionPillActive: {
    backgroundColor: THEME.accentOrangeSubtle,
    borderColor: THEME.accentOrangeBorder
  },
  optionPillText: {
    fontSize: 11,
    color: THEME.textSecondary
  },
  optionPillTextActive: {
    fontSize: 11,
    color: THEME.accentOrange,
    fontWeight: '700'
  },
  actionsContainer: {
    gap: 10,
    marginTop: 6
  },
  primaryActionButton: {
    backgroundColor: THEME.accentOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    ...THEME.shadowCard
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  secondaryActionButton: {
    backgroundColor: THEME.accentOrangeSubtle,
    borderWidth: 1,
    borderColor: THEME.accentOrangeBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8
  },
  secondaryActionText: {
    color: THEME.accentOrange,
    fontSize: 13,
    fontWeight: '700'
  },
  tertiaryActionButton: {
    backgroundColor: THEME.accentEmeraldSubtle,
    borderWidth: 1,
    borderColor: THEME.accentEmeraldBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8
  },
  tertiaryActionText: {
    color: THEME.accentEmerald,
    fontSize: 13,
    fontWeight: '700'
  }
});
