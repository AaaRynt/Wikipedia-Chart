// src/lib/article.test.ts
import { describe, expect, it } from 'vitest'

import { getArticleKey, getArticleLabel, isWikipediaProject, uniqueArticles } from '@/lib/article'

describe('article identity', () => {
  it('keeps different projects for the same entity and title', () => {
    const articles = [
      { project: 'zh.wikipedia', article: '\u65e5\u672c', entityId: 'Q17' },
      { project: 'ja.wikipedia', article: '\u65e5\u672c', entityId: 'Q17' },
      { project: 'zh.wikipedia', article: '\u65e5\u672c', entityId: 'Q17' },
    ]
    expect(uniqueArticles(articles)).toEqual(articles.slice(0, 2))
    expect(getArticleKey(articles[0])).not.toBe(getArticleKey(articles[1]))
    expect(getArticleLabel(articles[0])).toBe('\u65e5\u672c (ZH)')
  })

  it('treats spaces and underscores as the same article without folding case', () => {
    const titles = ['New York', 'New_York', 'NEW_YORK']
    expect(uniqueArticles(titles.map((article) => ({ project: 'en.wikipedia', article })))).toHaveLength(2)
  })

  it.each(['en.wikipedia', 'zh.wikipedia', 'be-tarask.wikipedia'])('accepts a Wikipedia project: %s', (project) => {
    expect(isWikipediaProject(project)).toBe(true)
  })

  it.each(['en.wikipedia.org', 'en.wikipedia.evil', 'en.wikipedia/path', 'https://en.wikipedia', 'en@evil.wikipedia', '', null])('rejects an invalid project: %s', (project) => {
    expect(isWikipediaProject(project)).toBe(false)
  })
})
