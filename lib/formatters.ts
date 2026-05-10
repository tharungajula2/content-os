export function formatStatus(status: string): string {
  const mapping: Record<string, string> = {
    idea: 'Idea',
    scripting: 'Scripting',
    production: 'Production',
    review: 'Review',
    published: 'Published',
    // Fallbacks for old statuses
    research: 'Scripting',
    'visual planning': 'Scripting',
    recording: 'Production',
    editing: 'Production',
    finalized: 'Review',
  };
  return mapping[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatCategory(category: string): string {
  const mapping: Record<string, string> = {
    WEL: 'Wellness',
    COG: 'Cognition',
    RSN: 'Reasoning',
    HUM: 'Humanity',
    SDB: 'Sandbox',
  };
  return mapping[category.toUpperCase()] || category;
}

export function formatFormatType(format: string): string {
  const mapping: Record<string, string> = {
    concept_3min: '3-Min Concept',
    deep_dive: 'Deep Dive',
    sandbox: 'Sandbox',
  };
  return mapping[format.toLowerCase()] || format;
}

export function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
