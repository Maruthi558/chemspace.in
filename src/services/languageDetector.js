/**
 * ChemSpace Multilingual NLP & Script Detection Engine
 * 
 * Supports:
 * - English (en)
 * - Telugu (te)
 * - Hindi (hi)
 * - Tamil (ta)
 * - Mixed transliterated natural conversational inputs
 * 
 * Strict Scientific Rule:
 * SMILES strings, chemical formulas (e.g., C8H10N4O2), molecular weights,
 * scientific units (g/mol, Å²), and mathematical notation are protected
 * and preserved across all language representations.
 */

// Script Unicode blocks
const TELUGU_REGEX = /[\u0C00-\u0C7F]/;
const DEVANAGARI_HINDI_REGEX = /[\u0900-\u097F]/;
const TAMIL_REGEX = /[\u0B80-\u0BFF]/;

// Transliterated keyword triggers
const TELUGU_KEYWORDS = [
  'cheppandi', 'ivvandi', 'yokka', 'emiti', 'enti', 'ela', 'gurinchi',
  'undi', 'cheyandi', 'chudandi', 'chupinchandi', 'edaina', 'smiles enti',
  'formula cheppu', 'bharamu', 'anuvu'
];

const HINDI_KEYWORDS = [
  'kya hai', 'batao', 'dijiye', 'ka smiles', 'ki smiles', 'ka structure',
  'ki structure', 'kaise', 'hota hai', 'bataiye', 'dikhao', 'anuvik', 'bhar',
  'sootr', 'sutra', 'rasayan', 'kya hota'
];

const TAMIL_KEYWORDS = [
  'enna', 'solla', 'kudunga', 'epdi', 'oda formula', 'oda smiles', 'irukku',
  'theriyuma', 'kaatunga', 'kaminga', 'anuvu', 'mulakkooru', 'edai'
];

/**
 * Automatically detects language from input text
 */
export function detectLanguage(text = '') {
  if (!text || typeof text !== 'string') return { code: 'en', name: 'English' };

  let teluguCount = 0;
  let hindiCount = 0;
  let tamilCount = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (TELUGU_REGEX.test(char)) teluguCount++;
    else if (DEVANAGARI_HINDI_REGEX.test(char)) hindiCount++;
    else if (TAMIL_REGEX.test(char)) tamilCount++;
  }

  // Native script takes highest priority
  if (teluguCount >= 2) return { code: 'te', name: 'Telugu' };
  if (hindiCount >= 2) return { code: 'hi', name: 'Hindi' };
  if (tamilCount >= 2) return { code: 'ta', name: 'Tamil' };

  // Check transliterated conversational keywords
  const lower = text.toLowerCase();
  for (const kw of TELUGU_KEYWORDS) {
    if (lower.includes(kw)) return { code: 'te', name: 'Telugu (Transliterated)' };
  }
  for (const kw of HINDI_KEYWORDS) {
    if (lower.includes(kw)) return { code: 'hi', name: 'Hindi (Transliterated)' };
  }
  for (const kw of TAMIL_KEYWORDS) {
    if (lower.includes(kw)) return { code: 'ta', name: 'Tamil (Transliterated)' };
  }

  return { code: 'en', name: 'English' };
}

/**
 * Formats a verified molecule into a rich multilingual scientific response
 */
export function formatMultilingualMoleculeResponse(langCode, mol, intent = 'smiles') {
  const { name, smiles, formula, mw, iupac, description, source } = mol;
  const mwStr = mw ? `${mw} g/mol` : 'N/A';

  switch (langCode) {
    case 'te':
      return {
        text: `**${name}** యొక్క రసాయన సమాచారం మరియు SMILES స్ట్రింగ్:\n\n` +
          `• **రసాయన పేరు**: ${name}${iupac ? ` (${iupac})` : ''}\n` +
          `• **SMILES**: \`${smiles}\`\n` +
          `• **మాలిక్యులర్ ఫార్ములా**: **${formula || 'N/A'}**\n` +
          `• **మాలిక్యులర్ బరువు**: **${mwStr}**\n\n` +
          (description ? `*${description}*\n\n` : '') +
          `మీరు ఈ అణువును **ChemDraw Studio** లో 2D/3D లో చూడవచ్చు లేదా **RDKit Lab** లో వివరణాత్మక పారామితులను విశ్లేషించవచ్చు.`,
        suggested: ['ChemDraw లో చూడండి', 'RDKit Lab లో లెక్కించండి', 'స్పెక్ట్రోస్కోపీ డేటా']
      };

    case 'hi':
      return {
        text: `**${name}** का सत्यापित रासायनिक विवरण और SMILES कोड:\n\n` +
          `• **रासायनिक नाम**: ${name}${iupac ? ` (${iupac})` : ''}\n` +
          `• **SMILES**: \`${smiles}\`\n` +
          `• **आणविक सूत्र (Formula)**: **${formula || 'N/A'}**\n` +
          `• **आणविक भार (Mol. Weight)**: **${mwStr}**\n\n` +
          (description ? `*${description}*\n\n` : '') +
          `आप इस अणु को **ChemDraw Studio** में 2D/3D विज़ुअलाइज़ कर सकते हैं या **RDKit Lab** में इसका विश्लेषण कर सकते हैं।`,
        suggested: ['ChemDraw में खोलें', 'RDKit Lab में विश्लेषण करें', 'स्पेक्ट्रोस्कोपी डेटा']
      };

    case 'ta':
      return {
        text: `**${name}** மூலக்கூறின் சரிபார்க்கப்பட்ட SMILES மற்றும் வேதியியல் விவரங்கள்:\n\n` +
          `• **வேதியியல் பெயர்**: ${name}${iupac ? ` (${iupac})` : ''}\n` +
          `• **SMILES குறியீடு**: \`${smiles}\`\n` +
          `• **மூலக்கூறு வாய்ப்பாடு**: **${formula || 'N/A'}**\n` +
          `• **மூலக்கூறு எடை**: **${mwStr}**\n\n` +
          (description ? `*${description}*\n\n` : '') +
          `இந்த மூலக்கூறை நீங்கள் **ChemDraw Studio** இல் 2D/3D இல் பார்க்கலாம் அல்லது **RDKit Lab** இல் கூடுதல் பண்புகளை கணக்கிடலாம்.`,
        suggested: ['ChemDraw இல் திறக்கவும்', 'RDKit Lab இல் பகுப்பாய்வு', 'நிறமாலையியல் விவரம்']
      };

    default: // English
      return {
        text: `Here is the verified chemical representation and SMILES string for **${name}**:\n\n` +
          `• **Chemical Name**: ${name}${iupac ? ` (${iupac})` : ''}\n` +
          `• **SMILES**: \`${smiles}\`\n` +
          `• **Molecular Formula**: **${formula || 'N/A'}**\n` +
          `• **Molecular Weight**: **${mwStr}**\n\n` +
          (description ? `*${description}*\n\n` : '') +
          `You can copy the SMILES code, send this molecule to **ChemDraw Studio** for 3D conformer optimization, or compute its descriptors in **RDKit Lab**.`,
        suggested: ['Open in ChemDraw', 'Analyze in RDKit Lab', 'Spectroscopy Suite', 'Calculate Lipinski Parameters']
      };
  }
}

/**
 * Formats an unresolvable chemical query message in the user's detected language
 */
export function formatUnresolvableResponse(langCode, query) {
  switch (langCode) {
    case 'te':
      return `క్షమించండి, **"${query}"** అనే రసాయన పేరు లేదా సూత్రం ధృవీకరించబడలేదు.\n\nదయచేసి పేరు యొక్క అక్షరక్రమం (spelling) తనిఖీ చేయండి లేదా IUPAC పేరు, ఫార్ములా లేదా SMILES కోడ్‌ను నేరుగా అందించండి.`;
    case 'hi':
      return `क्षमा करें, **"${query}"** के लिए कोई सत्यापित रासायनिक संरचना या SMILES नहीं मिल सका।\n\nकृपया वर्तनी (spelling) की जाँच करें, या IUPAC नाम, आणविक सूत्र, या सीधे SMILES कोड दर्ज करें।`;
    case 'ta':
      return `மன்னிக்கவும், **"${query}"** என்ற வேதியியல் பெயர் அல்லது மூலக்கூறை உறுதிப்படுத்த முடியவில்லை.\n\nதயவுசெய்து எழுத்துப்பிழையை சரிபார்க்கவும், அல்லது IUPAC பெயர், மூலக்கூறு வாய்ப்பாடு அல்லது SMILES குறியீட்டை உள்ளிடவும்.`;
    default:
      return `I could not reliably resolve **"${query}"** into a verified chemical structure or canonical SMILES string.\n\nPlease check the spelling of the chemical name, or provide the IUPAC systematic name, molecular formula, or SMILES representation directly.`;
  }
}

/**
 * Rapid scientific translation helper for Telugu <-> English queries
 */
export function translateScientificQuery(text = '', targetLang = 'en') {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();

  // If target is English and input has Telugu:
  if (targetLang === 'en') {
    let out = trimmed;
    // Conversational and question patterns
    const teToEnPatterns = [
      [/గురించి చెప్పు|గురించి వివరించు|గురించి సమాచారం ఇవ్వండి/gi, 'tell me about'],
      [/మాలిక్యులర్ వెయిట్ ఎంత|మాలిక్యులర్ బరువు ఎంత|అణు భారం ఎంత/gi, 'what is the molecular weight of'],
      [/స్మైల్స్ కోడ్ ఏమిటి|స్మైల్స్ ఏమిటి|SMILES ఏమిటి/gi, 'what is the SMILES for'],
      [/రసాయన సూత్రం ఏమిటి|ఫార్ములా ఏమిటి|ఫార్ములా చెప్పండి/gi, 'what is the chemical formula of'],
      [/చర్యల మెకానిజం|మెకానిజం వివరించు/gi, 'reaction mechanism of'],
      [/ఎలా పనిచేస్తుంది/gi, 'how does it work'],
      [/తేడా ఏమిటి|మధ్య తేడాలు ఏమిటి/gi, 'what is the difference between'],
      [/ఉపయోగాలు ఏమిటి|ఉపయోగం ఏమిటి/gi, 'what are the uses of'],
      [/నిర్మాణం ఏమిటి|నిర్మాణాన్ని చూపించండి/gi, 'what is the structure of']
    ];

    for (const [re, rep] of teToEnPatterns) {
      out = out.replace(re, rep);
    }

    // Common Telugu chemical entity words
    const teChemicals = {
      'నీరు': 'water',
      'నీటి': 'water',
      'బెంజీన్': 'benzene',
      'కెఫీన్': 'caffeine',
      'కాఫీన్': 'caffeine',
      'ఆస్పిరిన్': 'aspirin',
      'పారాసిటమాల్': 'paracetamol',
      'గ్లూకోజ్': 'glucose',
      'ఇథనాల్': 'ethanol',
      'మిథనాల్': 'methanol',
      'ఎసిటిక్ ఆమ్లం': 'acetic acid',
      'ఐబుప్రోఫెన్': 'ibuprofen',
      'టోలుయీన్': 'toluene'
    };
    for (const [te, en] of Object.entries(teChemicals)) {
      if (out.includes(te)) {
        out = out.split(te).join(en);
      }
    }
    return out.trim();
  }

  // If target is Telugu and input has English:
  if (targetLang === 'te') {
    let out = trimmed;
    const enToTe = {
      'benzene': 'బెంజీన్',
      'caffeine': 'కెఫీన్',
      'aspirin': 'ఆస్పిరిన్',
      'paracetamol': 'పారాసిటమాల్',
      'glucose': 'గ్లూకోజ్',
      'ethanol': 'ఇథనాల్',
      'methanol': 'మిథనాల్',
      'acetic acid': 'ఎసిటిక్ ఆమ్లం',
      'ibuprofen': 'ఐబుప్రోఫెన్',
      'water': 'నీరు',
      'tell me about': 'గురించి వివరించు',
      'what is the molecular weight of': 'యొక్క మాలిక్యులర్ బరువు ఎంత',
      'what is the smiles for': 'యొక్క SMILES కోడ్ ఏమిటి'
    };
    for (const [en, te] of Object.entries(enToTe)) {
      const reg = new RegExp(`\\b${en}\\b`, 'gi');
      out = out.replace(reg, te);
    }
    return out.trim();
  }

  return trimmed;
}
