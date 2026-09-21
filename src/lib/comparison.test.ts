// src/lib/comparison.test.ts

import { describe, expect, it } from 'vitest'

import type { TArticle, TLanguageMapping, TQuery } from '@/data/types'

import { applyLanguageMapping, changeComparisonMode, changeSearchProject, isValidComparison, selectArticle, toggleLanguage } from '@/lib/comparison'

const japan: TArticle = { project: 'en.wikipedia', article: 'Japan', entityId: 'Q17' }
const china: TArticle = { project: 'en.wikipedia', article: 'China', entityId: 'Q148' }
const japanese: TArticle = { project: 'ja.wikipedia', article: '\u65e5\u672c', entityId: 'Q17' }
const chinese: TArticle = { project: 'zh.wikipedia', article: '\u65e5\u672c', entityId: 'Q17' }
const query: TQuery = { mode: 'articles', source: null, searchProject: 'en.wikipedia', articles: [japan, china], access: 'all-access', agent: 'user', granularity: 'daily', start: '20240101', end: '20240201' }
const mapping: TLanguageMapping = { source: japan, versions: [japan, japanese, chinese] }

describe('comparison modes', () => {
  it('starts language comparison from the first selected entity', () => {
    const next = changeComparisonMode(query, 'languages')
    expect(next).toEqual({ ...query, mode: 'languages', source: japan, articles: [japan] })
    expect(isValidComparison(next)).toBe(true)
  })

  it('supports switching modes before an article has been selected', () => {
    const empty = { ...query, articles: [] }
    expect(changeComparisonMode(empty, 'languages')).toEqual({ ...empty, mode: 'languages' })
  })

  it('restores a previous mode selection but keeps the current shared filters', () => {
    const current = { ...changeComparisonMode(query, 'languages'), start: '20240110', access: 'desktop' as const }
    const restored = changeComparisonMode(current, 'articles', query)
    expect(restored.articles).toEqual([japan, china])
    expect(restored.start).toBe('20240110')
    expect(restored.access).toBe('desktop')
  })

  it('uses the source project when returning to article comparison without a draft', () => {
    const current = { ...changeComparisonMode(query, 'languages'), source: japanese, articles: [japanese, chinese] }
    expect(changeComparisonMode(current, 'articles')).toEqual({ ...query, searchProject: 'ja.wikipedia', articles: [japanese] })
  })

  it('changes the article project without treating old titles as translations', () => {
    expect(changeSearchProject(query, 'ja.wikipedia').articles).toEqual([])
    expect(changeSearchProject(query, 'ja.wikipedia', [japanese, china]).articles).toEqual([japanese])
  })

  it('changing the search language in language mode retains the entity and curves', () => {
    const current = { ...changeComparisonMode(query, 'languages'), articles: [japan, japanese] }
    expect(changeSearchProject(current, 'zh.wikipedia')).toEqual({ ...current, searchProject: 'zh.wikipedia' })
  })

  it('adds unique articles only from the selected project', () => {
    expect(selectArticle(query, japan).articles).toEqual(query.articles)
    expect(selectArticle(query, japanese)).toBe(query)
    expect(selectArticle(query, { project: 'en.wikipedia', article: 'New York' }).articles.at(-1)?.article).toBe('New_York')
  })

  it('selecting another entity replaces the language comparison', () => {
    const current = { ...changeComparisonMode(query, 'languages'), articles: [japan, japanese] }
    expect(selectArticle(current, china)).toEqual({ ...current, source: china, articles: [china] })
  })

  it('normalizes restored titles from current sitelinks and removes unavailable languages', () => {
    const old = { ...japan, article: 'Old_Japan' }
    const current: TQuery = { ...query, mode: 'languages', source: old, articles: [old, { ...japanese, article: 'Old_title' }, { project: 'de.wikipedia', article: 'Japan', entityId: 'Q17' }] }
    const next = applyLanguageMapping(current, old, mapping)
    expect(next.source).toEqual(japan)
    expect(next.articles).toEqual([japan, japanese])
  })

  it('does not restore unchecked languages when a lookup completes', () => {
    const current = { ...changeComparisonMode(query, 'languages'), articles: [] }
    expect(applyLanguageMapping(current, japan, mapping).articles).toEqual([])
  })

  it('ignores mapping results after changing the source or comparison mode', () => {
    const current = selectArticle(changeComparisonMode(query, 'languages'), china)
    expect(applyLanguageMapping(current, japan, mapping)).toBe(current)
    expect(applyLanguageMapping(query, japan, mapping)).toBe(query)
  })

  it('toggles language editions of the same entity and retains the source when none are checked', () => {
    const current = changeComparisonMode(query, 'languages')
    const next = toggleLanguage(toggleLanguage(current, japanese, true), chinese, true)
    expect(next.articles).toEqual([japan, japanese, chinese])
    expect(toggleLanguage(next, china, true)).toBe(next)
    expect(toggleLanguage(next, japanese, true).articles).toHaveLength(3)
    const empty = [japan, japanese, chinese].reduce((state, target) => toggleLanguage(state, target, false), next)
    expect(empty.articles).toEqual([])
    expect(empty.source).toEqual(japan)
    expect(isValidComparison(empty)).toBe(true)
  })

  it('only permits the source page when there is no QID', () => {
    const source = { project: 'en.wikipedia', article: 'No_entity' }
    const current: TQuery = { ...query, mode: 'languages', source, articles: [] }
    expect(toggleLanguage(current, { ...source, project: 'ja.wikipedia' }, true)).toBe(current)
    expect(toggleLanguage(current, source, true).articles).toEqual([source])
  })
})
