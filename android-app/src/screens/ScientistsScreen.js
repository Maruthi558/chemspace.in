import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { FAMOUS_CHEMISTS, SCIENTIST_FIELDS } from '../constants/chemistsData';
import { resolveMolecule, queryPubChem } from '../services/api';
import ErrorBanner from '../components/ErrorBanner';

export default function ScientistsScreen({ onNavigate, onSendToReaction }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedField, setSelectedField] = useState('All');
  const [inspectScientist, setInspectScientist] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [resolvingDiscovery, setResolvingDiscovery] = useState(false);
  const [discoveryResolved, setDiscoveryResolved] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fields = ['All', 'Organic', 'Physical', 'Inorganic', 'Quantum', 'Biochemistry', 'Analytical', 'Nuclear'];

  const filteredChemists = FAMOUS_CHEMISTS.filter((sc) => {
    const matchesField =
      selectedField === 'All' ||
      sc.field === selectedField ||
      (sc.fields && sc.fields.includes(selectedField));
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      sc.name.toLowerCase().includes(q) ||
      (sc.discovery && sc.discovery.toLowerCase().includes(q)) ||
      (sc.era && sc.era.toLowerCase().includes(q));
    return matchesField && matchesQuery;
  });

  const handleOpenScientist = (sc) => {
    setInspectScientist(sc);
    setDiscoveryResolved(null);
    setErrorMsg(null);
    setModalVisible(true);
  };

  const handleResolveDiscoveryInBackend = async () => {
    if (!inspectScientist) return;
    setResolvingDiscovery(true);
    setErrorMsg(null);

    // Pick first molecule or discovery keyword
    const targetQuery =
      inspectScientist.keyCompound ||
      inspectScientist.discovery?.split(' ')[0] ||
      'Benzene';

    const res = await resolveMolecule(targetQuery);
    setResolvingDiscovery(false);

    if (res.success && res.data) {
      setDiscoveryResolved(res.data);
    } else {
      const pubRes = await queryPubChem(targetQuery);
      if (pubRes.success && pubRes.data?.compound) {
        setDiscoveryResolved(pubRes.data.compound);
      } else {
        setErrorMsg(`Backend resolver notice: Compound related to "${targetQuery}" not found.`);
      }
    }
  };

  const handleSendToLab = () => {
    if (!inspectScientist) return;
    const compound =
      discoveryResolved?.smiles ||
      discoveryResolved?.canonicalSmiles ||
      inspectScientist.keyCompound ||
      'c1ccccc1';
    setModalVisible(false);
    onSendToReaction(compound);
    onNavigate('Reaction');
  };

  return (
    <View style={styles.container}>
      {/* Header and Filter */}
      <View style={styles.filterHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={THEME.textMuted} style={{ marginLeft: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chemist (e.g. Curie, Pauling, Woodward)..."
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fieldScroll}>
          {fields.map((fld) => {
            const isSel = selectedField === fld;
            return (
              <TouchableOpacity
                key={fld}
                style={[styles.fieldPill, isSel && styles.fieldPillActive]}
                onPress={() => setSelectedField(fld)}
                activeOpacity={0.7}
              >
                <Text style={[styles.fieldPillText, isSel && styles.fieldPillTextActive]}>
                  {fld}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List of Chemists */}
      <FlatList
        data={filteredChemists}
        keyExtractor={(item) => item.id || item.name}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.scientistCard}
            onPress={() => handleOpenScientist(item)}
            activeOpacity={0.7}
          >
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>
                {item.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.scientistName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.fieldBadge}>
                  <Text style={styles.fieldBadgeText}>{item.field || 'Chemistry'}</Text>
                </View>
              </View>
              <Text style={styles.scientistEra}>{item.lifespan || item.era || 'Pioneer'}</Text>
              <Text style={styles.discoveryText} numberOfLines={2}>
                {item.discovery || item.achievements || item.bio}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={THEME.textMuted} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}
      />

      {/* SCIENTIST DETAIL MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {inspectScientist && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <View style={styles.bigAvatarBox}>
                      <Text style={styles.bigAvatarText}>
                        {inspectScientist.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>{inspectScientist.name}</Text>
                      <Text style={styles.modalSub}>{inspectScientist.field} • {inspectScientist.lifespan || inspectScientist.era}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color={THEME.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  {/* Nobel badge if available */}
                  {inspectScientist.nobel && (
                    <View style={styles.nobelCard}>
                      <Ionicons name="trophy" size={16} color="#EAB308" />
                      <Text style={styles.nobelText}>Nobel Prize: {inspectScientist.nobel}</Text>
                    </View>
                  )}

                  {/* Discovery / Contribution */}
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionHeading}>Landmark Contribution</Text>
                    <Text style={styles.sectionBody}>
                      {inspectScientist.discovery || inspectScientist.achievements || inspectScientist.bio}
                    </Text>
                  </View>

                  {/* Quote if available */}
                  {inspectScientist.quote && (
                    <View style={styles.quoteCard}>
                      <Ionicons name="chatbox-ellipses-outline" size={16} color={THEME.accentOrange} />
                      <Text style={styles.quoteText}>"{inspectScientist.quote}"</Text>
                    </View>
                  )}

                  {/* Backend Resolved Discovery Card */}
                  {discoveryResolved && (
                    <View style={styles.resolvedCard}>
                      <View style={styles.resolvedBadgeRow}>
                        <Ionicons name="checkmark-circle" size={14} color={THEME.accentEmerald} />
                        <Text style={styles.resolvedBadgeText}>Resolved via Python Backend</Text>
                      </View>
                      <Text style={styles.resolvedSmiles}>
                        SMILES: <Text style={{ color: THEME.accentEmerald }}>{discoveryResolved.smiles || discoveryResolved.canonicalSmiles}</Text>
                      </Text>
                      {discoveryResolved.formula && (
                        <Text style={styles.resolvedInfo}>
                          Formula: {discoveryResolved.formula} • MW: {discoveryResolved.molecularWeight || discoveryResolved.mw || 'N/A'}
                        </Text>
                      )}
                    </View>
                  )}

                  <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg(null)} />

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.actionBtnPrimary}
                      onPress={handleResolveDiscoveryInBackend}
                      disabled={resolvingDiscovery}
                      activeOpacity={0.7}
                    >
                      {resolvingDiscovery ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="server" size={16} color="#FFFFFF" />
                      )}
                      <Text style={styles.actionBtnPrimaryText}>Query Chemistry in Backend</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnSecondary}
                      onPress={handleSendToLab}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="flask" size={16} color={THEME.accentOrange} />
                      <Text style={styles.actionBtnSecondaryText}>Test in Reaction Lab</Text>
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
  fieldScroll: {
    marginBottom: 4
  },
  fieldPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 6,
    borderWidth: 1,
    borderColor: THEME.borderSubtle
  },
  fieldPillActive: {
    backgroundColor: THEME.accentOrangeSubtle,
    borderColor: THEME.accentOrangeBorder
  },
  fieldPillText: {
    color: THEME.textSecondary,
    fontSize: 11
  },
  fieldPillTextActive: {
    color: THEME.accentOrange,
    fontWeight: '700'
  },
  listContainer: {
    padding: 12,
    paddingBottom: 24
  },
  scientistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    padding: 12,
    marginBottom: 10,
    ...THEME.shadowCard
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EAB308'
  },
  cardInfo: {
    flex: 1
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  scientistName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textPrimary,
    flex: 1
  },
  fieldBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6
  },
  fieldBadgeText: {
    fontSize: 9,
    color: THEME.textSecondary
  },
  scientistEra: {
    fontSize: 10,
    color: THEME.accentEmerald,
    marginBottom: 4,
    fontFamily: 'monospace'
  },
  discoveryText: {
    fontSize: 11,
    color: THEME.textSecondary,
    lineHeight: 15
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
    maxHeight: '84%',
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
  bigAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(234, 179, 8, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.45)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bigAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EAB308'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textPrimary
  },
  modalSub: {
    fontSize: 11,
    color: THEME.textSecondary
  },
  closeBtn: {
    padding: 6
  },
  modalScroll: {
    marginTop: 14
  },
  nobelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.35)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12
  },
  nobelText: {
    fontSize: 12,
    color: '#FEF08A',
    fontWeight: '600'
  },
  detailSection: {
    backgroundColor: THEME.bgInput,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    marginBottom: 12
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  sectionBody: {
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 18
  },
  quoteCard: {
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: THEME.accentOrange,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: THEME.textPrimary,
    lineHeight: 17
  },
  resolvedCard: {
    backgroundColor: THEME.accentEmeraldSubtle,
    borderWidth: 1,
    borderColor: THEME.accentEmeraldBorder,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12
  },
  resolvedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  resolvedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.accentEmerald
  },
  resolvedSmiles: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontFamily: 'monospace'
  },
  resolvedInfo: {
    fontSize: 10,
    color: THEME.textMuted,
    marginTop: 2
  },
  modalActions: {
    gap: 10,
    marginBottom: 20
  },
  actionBtnPrimary: {
    backgroundColor: THEME.accentOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  actionBtnSecondary: {
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
  actionBtnSecondaryText: {
    color: THEME.accentOrange,
    fontSize: 13,
    fontWeight: '700'
  }
});
