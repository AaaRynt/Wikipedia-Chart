# Wikipedia Chart

[English](./README.md) | [简中](./README_zh.md)

Wikipedia Chart is a small front-end app that visualizes Wikimedia Pageviews data as a line chart. It also includes a Wikipedia search dialog that lets you pick an article and updates the chart instantly.

## Features

- Live Wikipedia search with results list (title, description, thumbnail)
- Pageviews line chart powered by Recharts
- URL sync for query params (p`roject/access/agent/article/granularity/start/end`)
- Export the chart as `.SVG` or `.PNG`
- Date range selection and filters for access/agent/granularity

## Tech Stack

- React 19 + Vite
- TypeScript
- Recharts
- Tailwind CSS

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

## How It Works

- Search uses Wikipedia’s prefix search API and renders live results.
- Selecting a result updates the global `query.article` state.
- The chart listens to query changes and fetches Pageviews from Wikimedia.
- The current query is reflected in the URL path.
- The download button exports the full chart card (SVG or PNG).

## Data APIs

- Wikipedia search:
  - `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=pageprops|pageimages|description&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=100&pilimit=5&gpssearch=<query>&gpsnamespace=0&gpslimit=10&origin=*`
- Wikimedia Pageviews:
  - `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/<project>/<access>/<agent>/<article>/<granularity>/<start>/<end>`

## Notes

- `article` values must use underscores instead of spaces.
- When there is no data, the app shows a loading or empty state instead of crashing.

## License

[GAGPL](./LICENSE)
