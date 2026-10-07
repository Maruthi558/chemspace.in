import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { PERIODIC_ELEMENTS, CATEGORY_COLORS } from '../constants/periodicData';
import { resolveMolecule } from '../services/api';
import ErrorBanner from '../components/ErrorBanner';

export default function PeriodicTableScreen({ onNavigate, onSendToReaction }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPhase, setSelectedPhase] = useState('All');
  const [inspectElement, setInspectElement] = useState(null);
  const [inspectModalVisible, setInspectModalVisible] = useState(false);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [backendData, setBackendData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const categories = ['All', 'Alkali Metal', 'Alkaline Earth', 'Transition Metal', 'Post-Transition Metal', 'Metalloid', 'Nonmetal', 'Halogen', 'Noble Gas', 'Lanthanide', 'Actinide'];
  const phases = ['All', 'Solid', 'Gas', 'Liquid'];

  const filteredElements = PERIODIC_ELEMENTS.filter((el) => {
    const matchesCat = selectedCategory === 'All' || el.category === selectedCategory;
    const matchesPhase = selectedPhase === 'All' || el.phase === selectedPhase;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      el.name.toLowerCase().includes(q) ||
      el.symbol.toLowerCase().includes(q) ||
      String(el.number) === q;
    return matchesCat && matchesPhase && matchesQuery;
  });

  const handleOpenInspector = (el) => {
    setInspectElement(el);
    setBackendData(null);
    setErrorMsg(null);
    setInspectModalVisible(true);
  };

  const handleQueryBackendResolver = async () => {
    if (!inspectElement) return;
    setLoadingBackend(true);
    setErrorMsg(null);

    const res = await resolveMolecule(inspectElement.name);
    setLoadingBackend(false);

    if (res.success && res.data) {
      setBackendData(res.data);
    } else {
      setErrorMsg(res.error || `Could not resolve ${inspectElement.name} from backend.`);
    }
  };

  const handleUseInReaction = () => {
    if (!inspectElement) return;
    setInspectModalVisible(false);
    onSendToReaction(inspectElement.symbol);
    onNavigate('Reaction');
  };

  const getElementColor = (cat) => {
    return CATEGORY_COLORS[cat] || '#10B981';
  };

  return (
    <View style={styles.container}>
      {/* Search & Filter Header */}
      <View style={styles.filterHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={THEME.textMuted} style={{ marginLeft: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search element by name, symbol, or # (e.g. Fe, Carbon, 26)..."
            placeholderTextColor={THEME.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 6 }}>
              <Ionicons name="close-circle" size={16} color={THEME.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category horizontal scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((cat) => {
            const isSel = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, isSel && styles.catPillSelected]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catPillText, isSel && styles.catPillTextSelected]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Phase filter pills */}
        <View style={styles.phaseRow}>
          <Text style={styles.phaseLabel}>Phase:</Text>
          {phases.map((ph) => {
            const isSel = selectedPhase === ph;
            return (
              <TouchableOpacity
                key={ph}
                style={[styles.phasePill, isSel && styles.phasePillSelected]}
                onPress={() => setSelectedPhase(ph)}
                activeOpacity={0.7}
              >
                <Text style={[styles.phasePillText, isSel && styles.phasePillTextSelected]}>{ph}</Text>
              </TouchableOpacity>
            );
          })}
          <Text style={styles.resultCount}>({filteredElements.length} elements)</Text>
        </View>
      </View>

      {/* Grid of Elements */}
      <FlatList
        data={filteredElements}
        keyExtractor={(item) => String(item.number)}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const color = getElementColor(item.category);
          return (
            <TouchableOpacity
              style={[styles.elementCard, { borderColor: `${color}40` }]}
              onPress={() => handleOpenInspector(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.atomicNumber}>{item.number}</Text>
                <Text style={styles.atomicMass}>{Number(item.mass).toFixed(2)}</Text>
              </View>
              <Text style={[styles.elementSymbol, { color }]}>{item.symbol}</Text>
              <Text style={styles.elementName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={[styles.categoryTag, { backgroundColor: `${color}18` }]}>
                <Text style={[styles.categoryTagText, { color }]} numberOfLines={1}>
                  {item.category}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* ELEMENT INSPECTION MODAL */}
      <Modal
        visible={inspectModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInspectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {inspectElement && (
              <>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View
                      style={[
                        styles.bigSymbolBox,
                        {
                          backgroundColor: `${getElementColor(inspectElement.category)}20`,
                          borderColor: `${getElementColor(inspectElement.category)}60`
                        }
                      ]}
                    >
                      <Text
                        style={[
                          styles.bigSymbolText,
                          { color: getElementColor(inspectElement.category) }
                        ]}
                      >
                        {inspectElement.symbol}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.modalElementName}>{inspectElement.name}</Text>
                      <Text style={styles.modalElementCat}>{inspectElement.category} • Atomic #{inspectElement.number}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setInspectModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <Ionicons name="close" size={20} color={THEME.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Property stats grid */}
                  <View style={styles.propertiesGrid}>
                    <View style={styles.propTile}>
                      <Text style={styles.propLabel}>Standard Mass</Text>
                      <Text style={styles.propValue}>{inspectElement.mass} u</Text>
                    </View>
                    <View style={styles.propTile}>
                      <Text style={styles.propLabel}>Phase @ STP</Text>
                      <Text style={styles.propValue}>{inspectElement.phase}</Text>
                    </View>
                    <View style={styles.propTile}>
                      <Text style={styles.propLabel}>Electronegativity</Text>
                      <Text style={styles.propValue}>
                        {inspectElement.electronegativity ? `${inspectElement.electronegativity} χ` : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.propTile}>
                      <Text style={styles.propLabel}>Atomic Radius</Text>
                      <Text style={styles.propValue}>
                        {inspectElement.radius ? `${inspectElement.radius} pm` : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.propTile}>
                      <Text style={styles.propLabel}>Ionization Energy</Text>
                      <Text style={styles.propValue}>
                        {inspectElement.ionEnergy ? `${inspectElement.ionEnergy} kJ/mol` : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.propTile}>
                      <Text style={styles.propLabel}>Melting Point</Text>
                      <Text style={styles.propValue}>
                        {inspectElement.meltingPoint ? `${inspectElement.meltingPoint} K` : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.configCard}>
                    <Text style={styles.configLabel}>Electron Configuration</Text>
                    <Text style={styles.configValue}>{inspectElement.config || 'N/A'}</Text>
                  </View>

                  {/* Backend Resolution Card */}
                  {backendData && (
                    <View style={styles.backendResultCard}>
                      <View style={styles.backendBadgeRow}>
                        <Ionicons name="checkmark-circle" size={14} color={THEME.accentEmerald} />
                        <Text style={styles.backendBadgeText}>Verified by Python Backend</Text>
                      </View>
                      <Text style={styles.backendDataText}>
                        SMILES: <Text style={{ color: THEME.accentEmerald }}>{backendData.smiles || backendData.canonicalSmiles || inspectElement.symbol}</Text>
                      </Text>
                      {backendData.formula && (
                        <Text style={styles.backendDataText}>
                          Formula: <Text style={{ color: THEME.textPrimary }}>{backendData.formula}</Text>
                        </Text>
                      )}
                      {backendData.iupacName && (
                        <Text style={styles.backendDataText}>
                          IUPAC: <Text style={{ color: THEME.textPrimary }}>{backendData.iupacName}</Text>
                        </Text>
                      )}
                    </View>
                  )}

                  <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg(null)} />

                  {/* Action buttons */}
                  <View style={styles.modalActionButtons}>
                    <TouchableOpacity
                      style={styles.apiCallBtn}
                      onPress={handleQueryBackendResolver}
                      disabled={loadingBackend}
                      activeOpacity={0.7}
                    >
                      {loadingBackend ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="server" size={16} color="#FFFFFF" />
                      )}
                      <Text style={styles.apiCallBtnText}>Query Backend Resolver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.reactionBtn}
                      onPress={handleUseInReaction}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="flask" size={16} color={THEME.accentOrange} />
                      <Text style={styles.reactionBtnText}>Use in Reaction Input</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgPage
  },
  filterHeader: {
    backgroundColor: THEME.bgSidebar,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderSubtle
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgInput,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    marginBottom: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    color: THEME.textPrimary,
    fontSize: 12
  },
  categoriesScroll: {
    marginBottom: 8
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 6,
    borderWidth: 1,
    borderColor: THEME.borderSubtle
  },
  catPillSelected: {
    backgroundColor: THEME.accentOrangeSubtle,
    borderColor: THEME.accentOrangeBorder
  },
  catPillText: {
    color: THEME.textSecondary,
    fontSize: 11
  },
  catPillTextSelected: {
    color: THEME.accentOrange,
    fontWeight: '700'
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  phaseLabel: {
    color: THEME.textMuted,
    fontSize: 11
  },
  phasePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.borderSubtle
  },
  phasePillSelected: {
    backgroundColor: THEME.accentEmeraldSubtle,
    borderColor: THEME.accentEmeraldBorder
  },
  phasePillText: {
    color: THEME.textSecondary,
    fontSize: 10
  },
  phasePillTextSelected: {
    color: THEME.accentEmerald,
    fontWeight: '600'
  },
  resultCount: {
    color: THEME.textMuted,
    fontSize: 10,
    marginLeft: 'auto',
    fontFamily: 'monospace'
  },
  listContainer: {
    padding: 8,
    paddingBottom: 24
  },
  elementCard: {
    flex: 1,
    margin: 4,
    backgroundColor: THEME.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'space-between',
    ...THEME.shadowCard
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  atomicNumber: {
    fontSize: 10,
    color: THEME.textMuted,
    fontFamily: 'monospace'
  },
  atomicMass: {
    fontSize: 9,
    color: THEME.textMuted,
    fontFamily: 'monospace'
  },
  elementSymbol: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: 2
  },
  elementName: {
    fontSize: 10,
    color: THEME.textSecondary,
    fontWeight: '500'
  },
  categoryTag: {
    width: '100%',
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 4
  },
  categoryTagText: {
    fontSize: 8,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: THEME.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: THEME.borderMedium,
    maxHeight: '82%',
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderSubtle
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  bigSymbolBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bigSymbolText: {
    fontSize: 22,
    fontWeight: '800'
  },
  modalElementName: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textPrimary
  },
  modalElementCat: {
    fontSize: 11,
    color: THEME.textSecondary
  },
  closeBtn: {
    padding: 6
  },
  modalBody: {
    marginTop: 14
  },
  propertiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  propTile: {
    width: '48%',
    backgroundColor: THEME.bgInput,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.borderSubtle
  },
  propLabel: {
    fontSize: 10,
    color: THEME.textMuted
  },
  propValue: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textPrimary,
    marginTop: 2
  },
  configCard: {
    backgroundColor: THEME.bgInput,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    marginBottom: 14
  },
  configLabel: {
    fontSize: 11,
    color: THEME.textMuted
  },
  configValue: {
    fontSize: 14,
    color: THEME.accentEmerald,
    fontFamily: 'monospace',
    marginTop: 4
  },
  backendResultCard: {
    backgroundColor: THEME.accentEmeraldSubtle,
    borderWidth: 1,
    borderColor: THEME.accentEmeraldBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14
  },
  backendBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  backendBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.accentEmerald
  },
  backendDataText: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontFamily: 'monospace',
    marginTop: 2
  },
  modalActionButtons: {
    gap: 10,
    marginBottom: 20
  },
  apiCallBtn: {
    backgroundColor: THEME.accentOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8
  },
  apiCallBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13
  },
  reactionBtn: {
    backgroundColor: THEME.accentOrangeSubtle,
    borderWidth: 1,
    borderColor: THEME.accentOrangeBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8
  },
  reactionBtnText: {
    color: THEME.accentOrange,
    fontWeight: '700',
    fontSize: 13
  }
});
