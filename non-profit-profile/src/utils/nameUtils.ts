/**
 * Comprehensive naming system utilities for contact cards
 * Handles dual last names, title stacking, and courtesy titles
 */

export interface PersonName {
  prefix?: string; // Stacked titles (The Rev. Dr., The Hon. Ms., etc.)
  firstName: string;
  middleName?: string;
  lastNameFirst: string; // Primary last name for alphabetization
  lastNameSecond?: string; // Second last name (optional)
  suffix?: string; // Jr., Sr., III, etc.
  courtesyTitle?: string; // Father, Padre, Elder, etc.
  preferredDisplayName?: string; // Override for how they prefer to be called
}

// Title categories for stacking rules
export interface TitleConfig {
  secular: string[];
  religious: string[];
  political: string[];
  academic: string[];
  courtesy: string[];
}

export const TITLE_CONFIG: TitleConfig = {
  secular: [
    'Mr.', 'Ms.', 'Mrs.', 'Miss', 'Mx.'
  ],
  religious: [
    'Rev.', 'Very Rev.', 'Most Rev.', 'Rt. Rev.', 'Pastor', 'Fr.', 'Sr.', 
    'Br.', 'Deacon', 'Elder', 'Bishop', 'Archbishop', 'Cardinal', 
    'Pope', 'Rabbi', 'Imam', 'Sheikh', 'Mullah', 'Swami', 'Guru',
    'Lama', 'Rinpoche', 'Venerable', 'Monk', 'Nun'
  ],
  political: [
    'The Hon.', 'The Honorable', 'Senator', 'Rep.', 'Representative',
    'Governor', 'Mayor', 'Judge', 'Justice', 'Ambassador', 'Secretary',
    'Minister', 'President', 'Vice President', 'Senator-elect',
    'Representative-elect', 'Congressman', 'Congresswoman'
  ],
  academic: [
    'Dr.', 'Prof.', 'Professor', 'PhD', 'MD', 'JD', 'EdD', 'DDS', 
    'DVM', 'PharmD', 'PsyD', 'ScD', 'ThD', 'DMin'
  ],
  courtesy: [
    'Father', 'Padre', 'Pastor', 'Elder', 'Bishop', 'Rabbi', 'Imam',
    'Sheikh', 'Reverend', 'Minister', 'Deacon', 'Brother', 'Sister',
    'Your Honor', 'Your Excellency', 'Your Eminence', 'Your Holiness',
    'Chief', 'Captain', 'Colonel', 'General', 'Admiral'
  ]
};

export const SUFFIXES = [
  'Jr.', 'Sr.', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'Esq.', 'CPA', 'PE', 'RN', 'MD', 'PhD', 'JD', 'MBA', 'MA', 'MS', 'BS', 'BA'
];

/**
 * Title stacking rules based on common usage
 */
export interface TitleStackingRules {
  canStackWith: (title1: string, title2: string) => boolean;
  getStackingOrder: (titles: string[]) => string[];
  isValidCombination: (titles: string[]) => boolean;
}

export const TITLE_STACKING_RULES: TitleStackingRules = {
  canStackWith: (title1: string, title2: string): boolean => {
    const getCategory = (title: string) => {
      if (TITLE_CONFIG.secular.includes(title)) return 'secular';
      if (TITLE_CONFIG.religious.includes(title)) return 'religious';
      if (TITLE_CONFIG.political.includes(title)) return 'political';
      if (TITLE_CONFIG.academic.includes(title)) return 'academic';
      return 'unknown';
    };

    const cat1 = getCategory(title1);
    const cat2 = getCategory(title2);

    // Religious and political cannot mix
    if ((cat1 === 'religious' && cat2 === 'political') || 
        (cat1 === 'political' && cat2 === 'religious')) {
      return false;
    }

    // Secular titles don't stack with other secular titles (only one Mr./Ms./etc.)
    if (cat1 === 'secular' && cat2 === 'secular') {
      return false;
    }

    // Religious titles can stack with academic (The Rev. Dr.)
    if ((cat1 === 'religious' && cat2 === 'academic') || 
        (cat1 === 'academic' && cat2 === 'religious')) {
      return true;
    }

    // Political titles can stack with academic (The Hon. Dr.)
    if ((cat1 === 'political' && cat2 === 'academic') || 
        (cat1 === 'academic' && cat2 === 'political')) {
      return true;
    }

    // Academic titles can stack with secular (Dr. Ms.)
    if ((cat1 === 'academic' && cat2 === 'secular') || 
        (cat1 === 'secular' && cat2 === 'academic')) {
      return true;
    }

    // Religious can use secular for gender identification (The Rev. Ms.)
    if ((cat1 === 'religious' && cat2 === 'secular') || 
        (cat1 === 'secular' && cat2 === 'religious')) {
      return true;
    }

    return false;
  },

  getStackingOrder: (titles: string[]): string[] => {
    const order = ['political', 'religious', 'academic', 'secular'];
    const categorized = titles.map(title => ({
      title,
      category: TITLE_CONFIG.secular.includes(title) ? 'secular' :
                TITLE_CONFIG.religious.includes(title) ? 'religious' :
                TITLE_CONFIG.political.includes(title) ? 'political' :
                TITLE_CONFIG.academic.includes(title) ? 'academic' : 'unknown',
      originalIndex: titles.indexOf(title)
    }));

    return categorized
      .sort((a, b) => {
        const aOrder = order.indexOf(a.category);
        const bOrder = order.indexOf(b.category);
        return aOrder - bOrder;
      })
      .map(item => item.title);
  },

  isValidCombination: (titles: string[]): boolean => {
    if (titles.length <= 1) return true;
    
    for (let i = 0; i < titles.length; i++) {
      for (let j = i + 1; j < titles.length; j++) {
        if (!TITLE_STACKING_RULES.canStackWith(titles[i], titles[j])) {
          return false;
        }
      }
    }
    return true;
  }
};

/**
 * Generate all possible name formats for a person
 */
export function generateNameFormats(name: PersonName): {
  formal: string;
  informal: string;
  courtesy: string;
  preferred: string;
  sortingKey: string;
  abbreviated: string;
} {
  const { prefix, firstName, middleName, lastNameFirst, lastNameSecond, suffix, courtesyTitle, preferredDisplayName } = name;

  // Build full name components
  const prefixStr = prefix ? `${prefix} ` : '';
  const firstMiddle = middleName ? `${firstName} ${middleName}` : firstName;
  const fullLastName = lastNameSecond ? `${lastNameFirst} ${lastNameSecond}` : lastNameFirst;
  const suffixStr = suffix ? ` ${suffix}` : '';

  // Formal: "The Rev. Dr. John Michael Rodriguez Martinez Jr."
  const formal = `${prefixStr}${firstMiddle} ${fullLastName}${suffixStr}`.trim();

  // Informal: "John Rodriguez" or "John Rodriguez Martinez"
  const informal = `${firstName} ${fullLastName}`;

  // Courtesy: "Father John" or whatever they prefer to be called
  const courtesy = courtesyTitle ? `${courtesyTitle} ${firstName}` : informal;

  // Preferred: Use their explicit preference or default to courtesy
  const preferred = preferredDisplayName || courtesy;

  // Sorting key: "Rodriguez Martinez, John Michael" (first last name first for alphabetization)
  const sortingKey = `${lastNameFirst}${lastNameSecond ? ` ${lastNameSecond}` : ''}, ${firstMiddle}`;

  // Abbreviated: "J. Rodriguez" or "Rev. J. Rodriguez"
  const shortPrefix = prefix ? getAbbreviatedPrefix(prefix) : '';
  const abbreviated = `${shortPrefix}${shortPrefix ? ' ' : ''}${firstName.charAt(0)}. ${lastNameFirst}`;

  return {
    formal,
    informal,
    courtesy,
    preferred,
    sortingKey,
    abbreviated
  };
}

/**
 * Get abbreviated version of title prefix
 */
function getAbbreviatedPrefix(prefix: string): string {
  const abbreviations: Record<string, string> = {
    'The Reverend Doctor': 'Rev. Dr.',
    'The Reverend': 'Rev.',
    'The Honorable Doctor': 'Hon. Dr.',
    'The Honorable': 'Hon.',
    'Doctor': 'Dr.',
    'Professor': 'Prof.',
    'Reverend': 'Rev.',
    'Very Reverend': 'Very Rev.',
    'Most Reverend': 'Most Rev.',
    'Right Reverend': 'Rt. Rev.'
  };

  return abbreviations[prefix] || prefix;
}

/**
 * Parse a full name string into PersonName components
 */
export function parseFullName(fullName: string): Partial<PersonName> {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return {};

  const result: Partial<PersonName> = {};
  let currentIndex = 0;

  // Check for prefix (titles at the beginning)
  const potentialPrefixes: string[] = [];
  while (currentIndex < parts.length) {
    const word = parts[currentIndex];
    if (isTitle(word)) {
      potentialPrefixes.push(word);
      currentIndex++;
    } else {
      break;
    }
  }

  if (potentialPrefixes.length > 0) {
    result.prefix = potentialPrefixes.join(' ');
  }

  // Get first name
  if (currentIndex < parts.length) {
    result.firstName = parts[currentIndex];
    currentIndex++;
  }

  // Check for suffix at the end
  const lastPart = parts[parts.length - 1];
  const hasSuffix = SUFFIXES.includes(lastPart);
  const endIndex = hasSuffix ? parts.length - 1 : parts.length;

  if (hasSuffix) {
    result.suffix = lastPart;
  }

  // Everything between firstName and suffix/end is either middle name or last names
  const remainingParts = parts.slice(currentIndex, endIndex);

  if (remainingParts.length === 1) {
    // Only one remaining part - it's the last name
    result.lastNameFirst = remainingParts[0];
  } else if (remainingParts.length === 2) {
    // Two parts - could be middle + last, or two last names
    // For now, assume it's first last name + second last name
    result.lastNameFirst = remainingParts[0];
    result.lastNameSecond = remainingParts[1];
  } else if (remainingParts.length > 2) {
    // Multiple parts - first is middle name, last two are last names
    result.middleName = remainingParts[0];
    result.lastNameFirst = remainingParts[remainingParts.length - 2];
    result.lastNameSecond = remainingParts[remainingParts.length - 1];
  }

  return result;
}

/**
 * Check if a word is a recognized title
 */
function isTitle(word: string): boolean {
  return [...TITLE_CONFIG.secular, ...TITLE_CONFIG.religious, ...TITLE_CONFIG.political, ...TITLE_CONFIG.academic]
    .some(title => title.toLowerCase() === word.toLowerCase() || title.toLowerCase().replace('.', '') === word.toLowerCase());
}

/**
 * Validate title combination
 */
export function validateTitleCombination(titles: string[]): {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
} {
  const errors: string[] = [];
  const suggestions: string[] = [];

  if (titles.length === 0) {
    return { isValid: true, errors, suggestions };
  }

  // Check for conflicts
  const hasReligious = titles.some(t => TITLE_CONFIG.religious.includes(t));
  const hasPolitical = titles.some(t => TITLE_CONFIG.political.includes(t));
  const secularTitles = titles.filter(t => TITLE_CONFIG.secular.includes(t));

  if (hasReligious && hasPolitical) {
    errors.push('Religious and political titles cannot be combined');
    suggestions.push('Choose either religious OR political titles, not both');
  }

  if (secularTitles.length > 1) {
    errors.push('Only one secular title (Mr./Ms./Mrs./etc.) can be used');
    suggestions.push('Select just one: ' + secularTitles.join(' or '));
  }

  // Check stacking validity
  if (!TITLE_STACKING_RULES.isValidCombination(titles)) {
    errors.push('Invalid title combination');
    suggestions.push('Try removing conflicting titles');
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  };
}

/**
 * Format titles in proper stacking order
 */
export function formatTitleStack(titles: string[]): string {
  if (titles.length === 0) return '';
  
  const orderedTitles = TITLE_STACKING_RULES.getStackingOrder(titles);
  return orderedTitles.join(' ');
}