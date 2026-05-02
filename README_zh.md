# Wikipedia Chart

[English](./README.md) | [简中](./README_zh.md)

Wikipedia Chart 是一个基于 React + TypeScript 的数据可视化应用，用于对比多个 Wikipedia 条目的 Wikimedia Pageviews 访问量趋势。项目支持实时条目搜索、预设对比组、URL 查询状态同步、日期和流量筛选、图表导出，以及轻量的 ChatGPT 分析跳转。

## 预览

![Wikipedia Chart 搜索弹窗](./Image/2026-05-02_19-57-38.png)

![Wikipedia Chart 多折线对比](<./Image/JavaScript_vs_Python_(programming_language)_vs_Java_(programming_language)_vs_C++_vs_TypeScript_20250430-20260430.png>)

## 功能特性

- 在一张 Recharts 折线图中对比多个 Wikipedia 条目。
- 通过 Wikipedia prefix search 实时搜索条目，展示标题、描述和缩略图。
- 首页空状态提供预设对比组。
- 支持从当前对比组中删除单个条目。
- 当前查询条件同步到 URL，便于分享图表状态。
- 支持日期范围、访问方式、用户类型和日/月粒度筛选。
- 支持将图表卡片导出为 `.svg` 或 `.png`。
- 支持打开 ChatGPT，并自动携带当前条目、筛选条件和 Wikimedia API 链接组成的提示词。
- 支持 light/dark 主题。

## 技术栈

- React 19 + Vite
- TypeScript
- Tailwind CSS + shadcn 风格 UI 组件
- Recharts
- Wikimedia Pageviews API
- Wikipedia Search API
- html-to-image
- date-fns

## 快速开始

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm dev
```

生产构建：

```bash
pnpm build
```

代码检查：

```bash
pnpm lint
```

## 工作原理

应用由一个全局 `query` 状态驱动：

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

当 `query.group` 为空时，主区域显示 Empty 首页和预设对比组。当用户选择一个或多个条目后，应用会并发请求每个条目的 Wikimedia Pageviews 数据，按 timestamp 合并多组序列，并为每个条目渲染一条折线。

URL 会同步当前查询状态：

```txt
/Wikipedia-Chart/:project/:access/:agent/:group/:granularity/:start/:end
```

多个条目会以分号分隔的形式编码进 `group` 路径段。

## 数据接口

Wikipedia 条目搜索：

```txt
https://en.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=pageprops|pageimages|description&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=100&pilimit=5&gpssearch=<query>&gpsnamespace=0&gpslimit=10&origin=*
```

Wikimedia Pageviews：

```txt
https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/<project>/<access>/<agent>/<article>/<granularity>/<start>/<end>
```

示例：

```txt
https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Russo-Ukrainian_war/daily/20250430/20260430
```

## 项目结构

```txt
src/
  components/
    App.tsx              # 根状态、URL 同步和布局组合
    layout/              # Header、主图表区域、底部筛选
    main/                # Empty 首页和多折线图
    features/            # 搜索、导出、ChatGPT 跳转、筛选、主题
    ui/                  # 可复用 UI 基础组件
  data/                  # 类型、默认值、筛选项、预设对比组
  util/                  # 格式化和随机洗牌工具
```

## 备注

- 条目名以 Wikipedia URL 格式保存，使用下划线替代空格。
- 当前对比组是判断显示 Empty 首页还是图表的唯一来源。
- ChatGPT 按钮不会调用 OpenAI API，只会打开 `chatgpt.com` 并附带生成好的提示词和相关 Wikimedia API 链接。

## 许可证

[GAGPL](./LICENSE)
