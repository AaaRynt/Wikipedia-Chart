# Wikipedia Chart

[English](./README.md) | [简中](./README_zh.md)

Wikipedia Chart 是一个前端小项目，用折线图可视化 Wikimedia Pageviews 数据，并提供搜索弹窗来选择维基百科条目，实时更新图表。

## 功能特性

- 维基百科实时搜索（标题、描述、缩略图）
- 使用 Recharts 绘制访问量折线图
- 查询参数同步到 URL（`project/access/agent/article/granularity/start/end`）
- 导出图表为 `.SVG` 或 `.PNG`
- 日期范围选择与访问方式/用户类型/粒度筛选

## 技术栈

- React 19 + Vite
- TypeScript
- Recharts
- Tailwind CSS

## 快速开始

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm dev
```

## 工作原理

- 搜索使用 Wikipedia 的 prefix search API，并展示实时结果。
- 选择结果会更新全局 `query.article` 状态。
- 图表监听 query 变化，从 Wikimedia 拉取 Pageviews 数据。
- 当前查询会映射到 URL 路径中。
- 下载按钮可导出完整图表（SVG/PNG）。

## 数据接口

- Wikipedia 搜索：
  - `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=pageprops|pageimages|description&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=100&pilimit=5&gpssearch=<query>&gpsnamespace=0&gpslimit=10&origin=*`
- Wikimedia Pageviews：
  - `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/<project>/<access>/<agent>/<article>/<granularity>/<start>/<end>`

## 备注

- `article` 需要用下划线替代空格。
- 当没有数据时，界面会显示加载或空状态，避免报错。

## 许可证

[GAGPL](./LICENSE)
