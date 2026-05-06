# Wikipedia Chart

[English](./README.md) | [简中](./README_zh.md)

Wikipedia Chart is a React + TypeScript data visualization app for comparing Wikimedia Pageviews across multiple Wikipedia articles. It supports live article search, preset comparison groups, URL-synced query state, date and traffic filters, chart export, and a lightweight "Ask ChatGPT" handoff for chart interpretation.

## Preview

![Wikipedia Chart search dialog](./Image/2026-05-02_19-57-38.png)

![Wikipedia Chart multi-line comparison](<./Image/JavaScript_vs_Python_(programming_language)_vs_Java_(programming_language)_vs_C++_vs_TypeScript_20250430-20260430.png>)

## Features

- Compare multiple Wikipedia articles in one Recharts line chart.
- Add articles through live Wikipedia prefix search with title, description, and thumbnail results.
- Start from preset comparison groups on the empty home state.
- Remove individual articles from the current comparison group.
- Sync the current query to the URL path for shareable chart states.
- Filter by date range, access type, agent type, and daily/monthly granularity.
- Export the chart card as `.svg` or `.png`, and export the current Wikimedia API responses as `.json`.
- Open ChatGPT with a generated prompt containing the current articles, filters, and Wikimedia API links.
- Support light/dark theme through `next-themes`.

## Tech Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS + shadcn-style UI components
- Recharts
- Wikimedia Pageviews API
- Wikipedia Search API
- html-to-image
- date-fns

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Lint the project:

```bash
pnpm lint
```

## How It Works

The app is driven by a single global `query` state:

```ts
type TQuery = {
  project: string
  group: string[]
  granularity: 'monthly' | 'daily'
  access: 'all-access' | 'desktop' | 'mobile-app' | 'mobile-web'
  agent: 'all-agents' | 'automated' | 'spider' | 'user'
  start: string
  end: string
}
```

When `query.group` is empty, the main panel shows the empty home state with preset groups. When one or more articles are selected, the app requests Wikimedia Pageviews data for each article in parallel, merges the returned series by timestamp, and renders one line per article.

The URL mirrors the query state:

```txt
/Wikipedia-Chart/:project/:access/:agent/:group/:granularity/:start/:end
```

Multiple articles in `group` are encoded into the route as a semicolon-separated list.

## Data APIs

Wikipedia article search:

```txt
https://en.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=pageprops|pageimages|description&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=100&pilimit=5&gpssearch=<query>&gpsnamespace=0&gpslimit=10&origin=*
```

Wikimedia Pageviews:

```txt
https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/<project>/<access>/<agent>/<article>/<granularity>/<start>/<end>
```

Example:

```txt
https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Russo-Ukrainian_war/daily/20250430/20260430
```

## Project Structure

```txt
src/
  components/
    App.tsx              # Root state, URL sync, layout composition
    layout/              # Header, main chart area, footer filters
    main/                # Empty state and multi-line chart
    features/            # Search, export, ChatGPT handoff, filters, theme
    ui/                  # Reusable shadcn-style primitives
  data/                  # Types, defaults, filters, preset groups
  util/                  # Formatting and shuffle helpers
```

## Notes

- Article names are stored in Wikipedia URL format, using underscores instead of spaces.
- The current comparison group is the source of truth for whether the app shows the empty state or the chart.
- The ChatGPT button does not call the OpenAI API. It only opens `chatgpt.com` with a generated prompt and the relevant Wikimedia API links.

## License

[GAGPL](./LICENSE)
