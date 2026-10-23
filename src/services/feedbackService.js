/**
 * ChemSpace Scientist & Customer Feedback Service
 * Dynamic Gateway for Customer Problem Reporting, Star Ratings, and Grade Pathways.
 * Dispatches feedback to any designated gateway destination or dynamic research email.
 */

export const DEFAULT_GATEWAY_EMAIL = 'support@chemspace.org';
export const RECIPIENT_EMAIL = DEFAULT_GATEWAY_EMAIL;

/**
 * Random Gateway Destination Email Generator
 */
export function generateRandomGatewayEmail() {
  const gateways = [
    'sunday-research@chemspace.org',
    'feedback-gateway@chemspace.io',
    'support@chemspace.org',
    'lab-incident-desk@chemspace.org',
    'operations@chemspace.net',
    'research-gateway@chemspace.in'
  ];
  return gateways[Math.floor(Math.random() * gateways.length)];
}

/**
 * Random Scientist / Customer Email Generator
 */
export function generateRandomScientistEmail() {
  const prefixes = [
    'dr.alex',
    'curie.researcher',
    'franklin.lab',
    'investigator',
    'fellow.chemist',
    'quantum.scientist',
    'computational.lead'
  ];
  const domains = ['chemspace.org', 'biochem.edu', 'pharmaspace.io', 'chemlab.net'];
  const randomNum = Math.floor(100 + Math.random() * 900);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${prefix}.${randomNum}@${domain}`;
}

export const FEEDBACK_GRADES = {
  5: {
    grade: 'Grade A+',
    label: 'Exceptional / Breakthrough Research',
    color: '#10b981',
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
  },
  4: {
    grade: 'Grade A',
    label: 'High Performance / Very Satisfied',
    color: '#06b6d4',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
  },
  3: {
    grade: 'Grade B',
    label: 'Good / Meets Scientific Expectations',
    color: '#3b82f6',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  },
  2: {
    grade: 'Grade C',
    label: 'Fair / Usability Gaps Observed',
    color: '#f59e0b',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  1: {
    grade: 'Grade D',
    label: 'Critical Problem / Needs Immediate Fix',
    color: '#f43f5e',
    badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40'
  }
};

export const PROBLEM_PATHWAYS = [
  { id: 'customer_problem', label: 'Customer Problem & Technical Bug', icon: '🐞' },
  { id: 'ai_reasoning', label: 'AI Agent & Automation Pipeline Reasoning', icon: '🤖' },
  { id: 'calculation_accuracy', label: 'Spectroscopy, DFT & RDKit Accuracy', icon: '⚡' },
  { id: 'ui_experience', label: 'Workspace UX & Navigation Flow', icon: '🎨' },
  { id: 'feature_request', label: 'Feature Request & Scientific Tool Wishlist', icon: '💡' },
  { id: 'praise_review', label: 'Praise & Glowing Scientist Endorsement', icon: '⭐' }
];

/**
 * Generate formatted Mailto Link targeted at any chosen gateway email
 */
export function generateFeedbackMailto({
  rating = 5,
  problemTitle = '',
  description = '',
  customerEmail = '',
  customerName = '',
  scientistType = 'male',
  pathway = 'customer_problem',
  priority = 'normal',
  targetEmail = DEFAULT_GATEWAY_EMAIL
}) {
  const recipient = (targetEmail && targetEmail.trim()) || DEFAULT_GATEWAY_EMAIL;
  const gradeInfo = FEEDBACK_GRADES[rating] || FEEDBACK_GRADES[5];
  const pathwayObj = PROBLEM_PATHWAYS.find((p) => p.id === pathway) || PROBLEM_PATHWAYS[0];

  const subject = encodeURIComponent(
    `[ChemSpace Scientific Feedback - ${gradeInfo.grade}] ${problemTitle || pathwayObj.label}`
  );

  const bodyContent = [
    `CHEMSPACE RESEARCHER FEEDBACK & CUSTOMER INCIDENT REPORT`,
    `=======================================================`,
    `Gateway Destination: ${recipient}`,
    `Submitted: ${new Date().toLocaleString()}`,
    ``,
    `SCIENTIST / CUSTOMER DETAILS:`,
    `- Name: ${customerName || 'Anonymous Scientist'}`,
    `- Contact Email: ${customerEmail || 'Not provided'}`,
    `- Scientist Persona: ${scientistType === 'female' ? '👩‍🔬 Female Scientist Devotion' : '👨‍🔬 Male Scientist'}`,
    ``,
    `EVALUATION & GRADE PATHWAY:`,
    `- Star Rating: ${rating} / 5 Stars (${'⭐'.repeat(rating)})`,
    `- Grade: ${gradeInfo.grade} (${gradeInfo.label})`,
    `- Pathway Category: ${pathwayObj.icon} ${pathwayObj.label}`,
    `- Priority: ${priority.toUpperCase()}`,
    ``,
    `PROBLEM / FEEDBACK DETAILS:`,
    `Subject: ${problemTitle}`,
    `-------------------------------------------------------`,
    description,
    `-------------------------------------------------------`,
    ``,
    `CLIENT TELEMETRY:`,
    `- Current URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`,
    `- Platform: ChemSpace Scientific AI Studio (v3.1.0)`,
    `- User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}`,
    ``,
    `Delivered via ChemSpace Research Gateway (${recipient})`
  ].join('\n');

  return `mailto:${encodeURIComponent(recipient)}?subject=${subject}&body=${encodeURIComponent(bodyContent)}`;
}

/**
 * Generate Gmail Web Compose URL targeted at any chosen gateway email
 */
export function generateGmailComposeUrl(feedbackData) {
  const recipient = (feedbackData.targetEmail && feedbackData.targetEmail.trim()) || DEFAULT_GATEWAY_EMAIL;
  const gradeInfo = FEEDBACK_GRADES[feedbackData.rating] || FEEDBACK_GRADES[5];
  const pathwayObj = PROBLEM_PATHWAYS.find((p) => p.id === feedbackData.pathway) || PROBLEM_PATHWAYS[0];

  const subject = encodeURIComponent(
    `[ChemSpace Feedback - ${gradeInfo.grade}] ${feedbackData.problemTitle || pathwayObj.label}`
  );

  const bodyContent = [
    `Dear ChemSpace Gateway Team (${recipient}),`,
    ``,
    `Here is my feedback on the ChemSpace platform:`,
    ``,
    `• Rating: ${feedbackData.rating}/5 Stars (${gradeInfo.grade})`,
    `• Category: ${pathwayObj.label}`,
    `• Scientist Identity: ${feedbackData.scientistType === 'female' ? 'Female Scientist' : 'Male Scientist'}`,
    `• Customer: ${feedbackData.customerName || 'Chemist'} (${feedbackData.customerEmail || 'No email provided'})`,
    ``,
    `Details:`,
    feedbackData.description,
    ``,
    `Best regards,`,
    feedbackData.customerName || 'ChemSpace Scientist'
  ].join('\n');

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    recipient
  )}&su=${subject}&body=${encodeURIComponent(bodyContent)}`;
}

/**
 * Dispatches feedback to backend API and logs persistent receipt
 */
export async function submitScientistFeedback(data) {
  const feedbackId = 'fb_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const target = (data.targetEmail && data.targetEmail.trim()) || DEFAULT_GATEWAY_EMAIL;
  const gradeInfo = FEEDBACK_GRADES[data.rating] || FEEDBACK_GRADES[5];

  const payload = {
    id: feedbackId,
    target_email: target,
    rating: data.rating || 5,
    grade: gradeInfo.grade,
    grade_label: gradeInfo.label,
    pathway: data.pathway || 'customer_problem',
    problem_title: data.problemTitle || 'User Feedback',
    description: data.description || '',
    customer_name: data.customerName || 'Anonymous Scientist',
    customer_email: data.customerEmail || '',
    scientist_type: data.scientistType || 'male',
    priority: data.priority || 'normal',
    timestamp: new Date().toISOString(),
    client_info: {
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : ''
    }
  };

  // 1. Save receipt in LocalStorage
  try {
    const existing = JSON.parse(localStorage.getItem('chemspace_feedback_history') || '[]');
    existing.unshift({
      ...payload,
      dispatchedTo: target,
      status: 'dispatched'
    });
    localStorage.setItem('chemspace_feedback_history', JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    console.warn('[Feedback] Could not cache to local storage:', err);
  }

  // 2. Dispatch to backend REST API
  let backendResult = { status: 'fallback', message: 'Offline mode cached' };
  try {
    const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
      ? String(import.meta.env.VITE_API_URL).replace(/\/+$/, '')
      : '';
    const res = await fetch(`${apiBase ? `${apiBase}/api` : '/api'}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      backendResult = await res.json();
    }
  } catch (err) {
    console.warn('[Feedback] Backend API dispatch notice:', err.message);
  }

  return {
    success: true,
    feedbackId,
    targetEmail: target,
    mailtoUrl: generateFeedbackMailto({ ...data, targetEmail: target }),
    gmailUrl: generateGmailComposeUrl({ ...data, targetEmail: target }),
    backendResult,
    grade: gradeInfo.grade
  };
}

/**
 * Get historical feedback submitted by this user/browser
 */
export function getSavedFeedbackHistory() {
  try {
    return JSON.parse(localStorage.getItem('chemspace_feedback_history') || '[]');
  } catch {
    return [];
  }
}
