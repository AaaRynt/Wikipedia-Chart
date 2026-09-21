// src/lib/article.ts
import type { TArticle } from '@/data/types'

import { formatKey } from '@/lib/format'

export function isWikipediaProject(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z][a-z0-9-]*\.wikipedia$/.test(value)
}

export function normalizeArticleTitle(title: string) {
  return title.trim().replace(/\s+/g, '_')
}

export function getArticleKey(target: TArticle) {
  return `${target.project}:${normalizeArticleTitle(target.article)}`
}

export function getArticleLabel(target: TArticle) {
  return `${formatKey(target.article)} (${target.project.replace(/\.wikipedia$/, '').toUpperCase()})`
}

export function uniqueArticles(articles: TArticle[]) {
  const seen = new Set<string>()
  return articles.filter((target) => {
    const key = getArticleKey(target)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
