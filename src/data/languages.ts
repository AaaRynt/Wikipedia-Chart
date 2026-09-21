// src/data/languages.ts

export const wikipediaLanguages = [
  { project: 'en.wikipedia', siteId: 'enwiki', label: 'English' },
  { project: 'zh.wikipedia', siteId: 'zhwiki', label: 'Chinese' },
  { project: 'ja.wikipedia', siteId: 'jawiki', label: 'Japanese' },
  { project: 'de.wikipedia', siteId: 'dewiki', label: 'German' },
  { project: 'fr.wikipedia', siteId: 'frwiki', label: 'French' },
  { project: 'es.wikipedia', siteId: 'eswiki', label: 'Spanish' },
  { project: 'ru.wikipedia', siteId: 'ruwiki', label: 'Russian' },
  { project: 'pt.wikipedia', siteId: 'ptwiki', label: 'Portuguese' },
  { project: 'ko.wikipedia', siteId: 'kowiki', label: 'Korean' },
  { project: 'it.wikipedia', siteId: 'itwiki', label: 'Italian' },
  { project: 'ar.wikipedia', siteId: 'arwiki', label: 'Arabic' },
  { project: 'hi.wikipedia', siteId: 'hiwiki', label: 'Hindi' },
]

export function getLanguageLabel(project: string) {
  return wikipediaLanguages.find((language) => language.project === project)?.label ?? project
}
