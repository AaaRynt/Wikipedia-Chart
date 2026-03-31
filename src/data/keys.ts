// src/data/keys.ts

export const keys: { label: string; value: string[]; align: 'start' | 'center' | 'end' }[] = [
  { label: 'granularity', value: ['monthly', 'daily'], align: 'end' },
  { label: 'access', value: ['all-access', 'desktop', 'mobile-app', 'mobile-web'], align: 'center' },
  { label: 'agent', value: ['all-agents', 'automated', 'spider', 'user'], align: 'start' },
]
