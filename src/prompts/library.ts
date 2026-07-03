export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  icon: string;
}

export const PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: 'summarize',
    name: 'Summarize',
    prompt: 'Summarize the following content in a clear and concise way, focusing on the most important points.',
    icon: 'FileText'
  },
  {
    id: 'tldr',
    name: 'TL;DR',
    prompt: 'Give me a TL;DR of this page in 2-3 sentences.',
    icon: 'Zap'
  },
  {
    id: 'explain-12',
    name: 'Explain Like I\'m 12',
    prompt: 'Explain the main concepts of this page as if I am 12 years old.',
    icon: 'Baby'
  },
  {
    id: 'extract-dates',
    name: 'Extract Dates',
    prompt: 'Extract all dates mentioned in the text and list them in chronological order.',
    icon: 'Calendar'
  },
  {
    id: 'pros-cons',
    name: 'Pros & Cons',
    prompt: 'Analyze the content and give me a list of pros and cons.',
    icon: 'Columns'
  }
];
