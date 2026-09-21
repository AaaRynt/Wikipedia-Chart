// src/lib/comparison.ts

import type { TArticle, TComparisonMode, TLanguageMapping, TQuery } from '@/data/types'

import { getArticleKey, normalizeArticleTitle, uniqueArticles } from '@/lib/article'

export function selectArticle(query: TQuery, target: TArticle): TQuery {
  const article = { ...target, article: normalizeArticleTitle(target.article) }
  if (article.project !== query.searchProject) return query
  if (query.mode === 'languages') return { ...query, source: article, articles: [article] }
  return { ...query, articles: uniqueArticles([...query.articles, article]) }
}

export function changeSearchProject(query: TQuery, project: string, savedArticles: TArticle[] = []): TQuery {
  if (project === query.searchProject) return query
  return { ...query, searchProject: project, articles: query.mode === 'articles' ? savedArticles.filter((target) => target.project === project) : query.articles }
}

export function changeComparisonMode(query: TQuery, mode: TComparisonMode, saved?: TQuery): TQuery {
  if (query.mode === mode) return query
  if (saved?.mode === mode) return { ...query, mode, source: saved.source, searchProject: saved.searchProject, articles: saved.articles }
  if (mode === 'languages') {
    const source = query.articles[0] ?? null
    return { ...query, mode, source, articles: source ? [source] : [] }
  }
  const target = query.source ?? query.articles[0]
  return { ...query, mode, source: null, searchProject: target?.project ?? query.searchProject, articles: target ? [target] : [] }
}

export function applyLanguageMapping(query: TQuery, requestedSource: TArticle, mapping: TLanguageMapping): TQuery {
  if (query.mode !== 'languages' || !query.source || getArticleKey(query.source) !== getArticleKey(requestedSource)) return query
  const versions = new Map(mapping.versions.map((target) => [target.project, target]))
  const articles = query.articles.flatMap((target) => versions.get(target.project) ?? [])
  return { ...query, source: mapping.source, articles }
}

export function toggleLanguage(query: TQuery, target: TArticle, checked: boolean): TQuery {
  if (query.mode !== 'languages' || !query.source) return query
  if (target.entityId !== query.source.entityId || (!target.entityId && getArticleKey(target) !== getArticleKey(query.source))) return query
  const others = query.articles.filter((article) => article.project !== target.project)
  return { ...query, articles: checked ? [...others, target] : others }
}

export function isValidComparison(query: TQuery) {
  if (query.mode === 'articles') return query.source === null && query.articles.every((target) => target.project === query.searchProject)
  if (query.mode !== 'languages') return false
  if (!query.source) return query.articles.length === 0
  if (new Set(query.articles.map((target) => target.project)).size !== query.articles.length) return false
  const source = query.source
  return query.articles.every((target) => (source.entityId ? target.entityId === source.entityId : getArticleKey(target) === getArticleKey(source) && !target.entityId))
}
