# Wikipedia Chart 项目介绍

## 1. 项目定位

Wikipedia Chart 是一个面向 Wikipedia 条目访问量对比的数据可视化应用。项目基于 React + TypeScript + Vite 开发，核心目标是把 Wikimedia Pageviews 数据变成可交互、可筛选、可分享、可导出的多折线图。

这个项目由项目作者主导架构设计，并在 AI 辅助下完成实现。它不是一个单纯的页面练习，而是围绕三个明确的能力目标展开：

- 练习图表展示：用 Recharts 把多条 Wikipedia 访问量时间序列渲染成可读的折线图。
- 练习组件化意识：把搜索、筛选、图表、下载、主题、布局和基础 UI 组件拆分到相对清晰的模块中。
- 练习网络请求能力：同时接入 Wikipedia Search API 和 Wikimedia Pageviews API，处理搜索、防抖、并发请求、取消请求和异常空数据状态。

项目当前实现的是一个完整的前端单页应用：用户可以搜索 Wikipedia 条目，也可以从首页预设组中选择一组条目；选择后应用会请求访问量数据，并在同一张图表中对比不同条目的趋势。

## 2. 项目功能概览

### 2.1 多条目访问量对比

用户可以一次对比多个 Wikipedia 条目，例如：

- JavaScript / Python / Java / C++ / TypeScript
- ChatGPT / Claude / Gemini / Grok
- Apple / Microsoft / Google / Amazon / Meta
- World War I / World War II / Cold War

每个条目会在 Recharts 折线图中对应一条线。图表数据来自 Wikimedia Pageviews API，按日期时间戳合并成统一的 `chartData`，再交给 Recharts 渲染。

### 2.2 Wikipedia 实时搜索

顶部搜索框接入 Wikipedia prefix search 接口。用户输入关键字后，项目会：

- 使用 `use-debounce` 对输入做 200ms 防抖。
- 调用 Wikipedia Search API。
- 展示条目标题、描述和缩略图。
- 选择条目后把标题转换为 Wikipedia URL 格式，也就是用下划线替换空格。
- 避免重复添加已经存在于当前对比组中的条目。

搜索入口还支持 `Cmd + K` 或 `Ctrl + K` 快捷键打开，交互上更接近命令面板。

### 2.3 预设对比组

当还没有选择任何条目时，主区域会显示 Empty 状态。这个状态不是简单提示，而是提供了大量预设组合和单条目入口。

预设数据位于 `src/data/prompts.ts`，包括：

- 编程语言
- 前端框架
- AI 聊天机器人
- AI 公司
- 大型科技公司
- 国家和城市
- 体育明星
- 战争和全球事件
- 数据库
- 操作系统
- 科学家
- 游戏、影视和社交媒体主题

Empty 状态中使用 Fisher-Yates 洗牌算法随机展示部分预设项，让首页每次进入时有一定变化。

### 2.4 筛选条件

底部筛选栏控制当前查询的关键维度：

- 日期范围：通过 `react-day-picker` 选择起止日期。
- 粒度：`daily` / `monthly`。
- 访问方式：`all-access` / `desktop` / `mobile-app` / `mobile-web`。
- 用户类型：`all-agents` / `user` / `spider` / `automated`。

这些筛选条件都写入统一的 `query` 状态。任何筛选变化都会触发数据重新请求，并同步到 URL。

### 2.5 URL 状态同步

项目把当前查询状态编码进 URL，方便分享和恢复。

当存在对比组时，URL 结构为：

```txt
/Wikipedia-Chart/:project/:access/:agent/:group/:granularity/:start/:end
```

其中 `group` 使用分号 `;` 连接多个条目，并对每个条目做 `encodeURIComponent`。

例如，多个条目会被组织成类似这样的路径片段：

```txt
JavaScript;Python_(programming_language);TypeScript
```

`App.tsx` 在初始化时会从当前路径解析参数，生成初始 `query`；后续 `query` 改变时，再通过 `window.history.replaceState` 更新 URL。

### 2.6 图表导出

顶部工具按钮支持把当前查询结果导出为：

- `.svg`
- `.png`
- `.json`

其中 `.svg` 和 `.png` 导出当前图表卡片，能力由 `html-to-image` 提供。`.json` 会按当前 `query.group` 中的条目重新请求对应的 Wikimedia Pageviews API，并把查询参数、API URL、状态码和原始返回数据打包到同一个 JSON 文件中。

`Main` 组件通过 `ref` 把图表卡片 DOM 节点传给顶层状态，`Header` 再把节点传给 `Download` 组件。图表图片导出需要等待图表数据准备完成，JSON 导出只要求当前存在查询条目。

### 2.7 ChatGPT 分析跳转

项目提供了一个轻量的 “Ask ChatGPT” 按钮。它不会直接调用 OpenAI API，也不会在应用内保存或处理模型返回结果，而是根据当前查询条件生成一段 prompt，并打开：

```txt
https://chatgpt.com/?prompt=<encoded prompt>
```

生成的 prompt 中包含：

- 当前条目列表
- 日期范围
- Wikipedia project
- access / agent / granularity
- 每个条目对应的 Wikimedia Pageviews API 链接
- 希望 ChatGPT 分析趋势、对比、峰值和可能原因的说明

这个设计把 AI 能力作为外部解释工具，而不是把应用复杂度扩展到后端或 API key 管理。

### 2.8 明暗主题

项目使用 `next-themes` 管理主题，通过 `ThemeProvider` 把主题写到 HTML class。样式变量在 `src/index.css` 中定义，支持 light / dark 两套颜色。

## 3. 技术栈

### 3.1 核心框架

- React 19：负责组件化 UI 和状态驱动渲染。
- TypeScript：约束查询模型、接口返回结构、组件 props 和数据处理过程。
- Vite：提供开发服务器、模块解析和前端构建配置。

### 3.2 样式和 UI

- Tailwind CSS 4：负责原子化样式。
- shadcn 风格组件：项目中保留了大量 `src/components/ui` 基础组件。
- Radix UI / cmdk / react-day-picker：支撑弹窗、选择器、命令面板、日历等交互控件。
- lucide-react / Remix Icon：用于按钮和筛选器图标。
- next-themes：负责 light / dark 主题。

### 3.3 图表和数据工具

- Recharts：渲染多折线访问量图表。
- date-fns：处理日期格式化、月份刻度等。
- use-debounce：降低搜索请求频率。
- html-to-image：导出图表 DOM 为图片。

### 3.4 外部数据接口

项目主要依赖两个公开接口：

Wikipedia 条目搜索：

```txt
https://en.wikipedia.org/w/api.php?action=query&format=json&generator=prefixsearch&prop=pageprops|pageimages|description&redirects=&ppprop=displaytitle&piprop=thumbnail&pithumbsize=100&pilimit=5&gpssearch=<query>&gpsnamespace=0&gpslimit=10&origin=*
```

Wikimedia Pageviews：

```txt
https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/<project>/<access>/<agent>/<article>/<granularity>/<start>/<end>
```

## 4. 目录结构

项目主要代码集中在 `src`：

```txt
src/
  components/
    App.tsx
    layout/
      header.tsx
      main.tsx
      footer.tsx
    main/
      empty.tsx
      wiki-chart.tsx
    features/
      ask.tsx
      date-picker-with-range.tsx
      download.tsx
      key-select.tsx
      loading.tsx
      search.tsx
      theme-toggle.tsx
    ui/
      alert.tsx
      badge.tsx
      button.tsx
      calendar.tsx
      card.tsx
      command.tsx
      dialog.tsx
      hover-card.tsx
      popover.tsx
      select.tsx
      ...
  data/
    default-query.ts
    keys.ts
    prompts.ts
    types.ts
  lib/
    utils.ts
  util/
    fisher-yates.ts
    format.ts
  main.tsx
  index.css
```

从结构上看，项目把代码分成四个层次：

- `layout`：页面骨架，负责 Header / Main / Footer 的组合。
- `main`：主内容区域，负责 Empty 状态和图表状态。
- `features`：业务功能组件，比如搜索、下载、筛选、Ask ChatGPT、主题切换。
- `ui`：通用基础组件，尽量不承载具体业务语义。

这种拆分方式适合作为组件化练习：业务组件只关心业务，基础组件只关心视觉和交互原语。

## 5. 核心状态模型

项目的中心状态是 `TQuery`：

```ts
export type TQuery = {
  project: string
  group: string[]
  granularity: 'monthly' | 'daily'
  access: 'all-access' | 'desktop' | 'mobile-app' | 'mobile-web'
  agent: 'all-agents' | 'automated' | 'spider' | 'user'
  start: string
  end: string
}
```

这个类型基本覆盖了 Wikimedia Pageviews API 所需的请求参数。

各字段含义：

- `project`：Wikipedia 项目，例如 `en.wikipedia`。
- `group`：当前对比的条目列表，例如 `['JavaScript', 'TypeScript']`。
- `granularity`：数据粒度，日级或月级。
- `access`：访问来源，包括桌面端、移动网页、移动应用等。
- `agent`：访问者类型，包括真实用户、爬虫、自动化访问等。
- `start` / `end`：请求起止日期，格式为 `yyyyMMdd`。

默认查询位于 `src/data/default-query.ts`。默认时间范围是当前日期往前推 2 天作为结束日期，再向前推 1 年作为开始日期。这能避开最新一天数据可能尚未完整的问题。

## 6. 数据流说明

### 6.1 应用初始化

`App.tsx` 初始化时会读取当前 URL：

1. 从 `window.location.pathname` 拆分路径。
2. 找到 `Wikipedia-Chart` 后面的 7 个路径段。
3. 按顺序解析为 `project`、`access`、`agent`、`group`、`granularity`、`start`、`end`。
4. 如果路径不完整，则回落到 `defaultQuery`。

这使项目天然支持“复制 URL 后再次打开仍然恢复当前图表”的能力。

### 6.2 选择条目

条目进入 `query.group` 有两种方式：

- 在 Empty 状态里点击预设组或预设单项。
- 在 Search 弹窗中搜索并选择条目。

`group` 一旦不为空，`Main` 组件就从 Empty 状态切换到图表状态。

### 6.3 请求 Pageviews 数据

`src/components/layout/main.tsx` 中的 `useEffect` 监听整个 `query`。

当 `query.group` 不为空时，组件会：

1. 为每个 article 拼接 Wikimedia Pageviews API URL。
2. 使用 `Promise.all` 并发请求所有条目。
3. 对每个请求结果提取 `json.items`。
4. 把每个条目的结果整理为 `{ article, items }`。
5. 设置到 `res` 状态中。

如果请求失败或接口返回非 2xx 状态，项目会把对应条目的 `items` 置为空数组，而不是直接中断整个图表。

同时，组件使用 `AbortController` 在查询变化或组件卸载时取消旧请求，避免过期请求覆盖新状态。

### 6.4 合并图表数据

`WikiChart` 接收 `TArticleSeries[]`，再把多组序列合并为 Recharts 需要的数据格式。

处理过程大致是：

1. 遍历每个条目的访问量序列。
2. 从 Wikimedia 的 `timestamp` 中解析年月日。
3. 转换为 JS 时间戳 `time`。
4. 用 `Map<number, ChartDatum>` 按时间戳合并行。
5. 每个条目使用 `article_0`、`article_1` 这样的字段名。
6. 最终按时间升序排列，生成 `chartData`。

这种数据结构适合 Recharts 的多折线渲染：一行表示一个时间点，每个 article 字段表示该条目在这个时间点的访问量。

## 7. 组件职责拆分

### 7.1 `App.tsx`

`App` 是项目的状态中枢，负责：

- 初始化 `query`。
- 维护 `chartReady`，判断图表是否可以导出。
- 维护 `chartNode`，供下载功能使用。
- 把状态传给 Header / Main / Footer。
- 把 `query` 同步到 URL。

它不直接关心搜索、图表和筛选的内部实现，只负责把它们串起来。

### 7.2 `Header`

`Header` 负责顶部导航和操作区：

- 项目名称链接。
- 搜索入口。
- Ask ChatGPT 按钮。
- 下载按钮。
- 主题切换按钮。
- GitHub 链接。

在小屏下，部分按钮通过 Tailwind 响应式类隐藏，减少顶部拥挤。

### 7.3 `Main`

`Main` 是页面内容核心，负责三种状态切换：

- 无条目：显示 `Empty`。
- 请求中：显示 `Loading`。
- 有条目：显示 `WikiChart`。

它也是数据请求发生的位置，因为它直接决定主区域该展示什么内容。

### 7.4 `Footer`

`Footer` 负责底部筛选器：

- 日期范围选择。
- `granularity` 选择。
- `access` 选择。
- `agent` 选择。

每个筛选器改变时都会通过 `setQuery` 更新全局查询状态。

### 7.5 `Search`

`Search` 是项目中网络交互最明显的组件之一，负责：

- 控制搜索弹窗打开状态。
- 监听快捷键。
- 维护搜索关键字。
- 防抖输入。
- 请求 Wikipedia 搜索接口。
- 展示搜索结果。
- 添加条目到 `query.group`。
- 从当前对比组中移除条目。

### 7.6 `WikiChart`

`WikiChart` 负责把接口结果转成图表：

- 生成每条线的 key、颜色和名称。
- 合并多个 article 的时间序列。
- 生成月份刻度。
- 处理 Tooltip、Legend、XAxis、YAxis。
- 在没有数据时展示提示。

图表颜色来自 CSS 变量 `--chart-1` 到 `--chart-5`，超过 5 条时循环使用。

### 7.7 `Download`

`Download` 负责图表导出：

- 从父级接收 DOM 节点。
- 判断 `chartReady`。
- 调用 `toSvg` 或 `toPng`。
- 按当前查询重新请求 Wikimedia API 并导出 `.json`。
- 生成文件名。
- 通过临时 `<a>` 标签触发浏览器下载。

### 7.8 `Ask`

`Ask` 负责生成用于 ChatGPT 的提示词和跳转链接。

它保持了一个很轻的边界：应用只负责组织上下文，真正的自然语言分析交给 ChatGPT 页面处理。

## 8. 网络请求设计

项目中有两类请求。

### 8.1 搜索请求

搜索请求发生在 `Search` 组件中。它具有几个比较关键的设计点：

- 输入先 `trim`，空字符串不请求。
- 使用 200ms debounce，避免每个按键都请求。
- 使用 `AbortController`，新搜索到来时取消旧请求。
- `shouldFilter={false}`，搜索结果由远端接口决定，而不是让 `cmdk` 在本地再次过滤。
- 根据 Wikipedia 返回的 `index` 排序，尽量保持搜索相关性。

### 8.2 Pageviews 请求

Pageviews 请求发生在 `Main` 组件中。它具有几个关键设计点：

- 一个 article 对应一个请求。
- 多个 article 使用 `Promise.all` 并发请求。
- URL 每段都通过 `encodeURIComponent`，避免特殊字符破坏路径。
- 单个请求失败时返回空数组，保持整体 UI 可用。
- 请求被取消时不更新 loading 状态，避免状态错乱。

这部分很好地体现了网络请求练习的重点：不只是能 `fetch`，而是能处理并发、取消、错误和状态切换。

## 9. 图表实现重点

项目的图表不是直接把接口数据丢给 Recharts，而是做了一层适配。

Wikimedia 返回的数据大致是每个条目一组：

```ts
{
  article: 'JavaScript',
  items: [
    { timestamp: '2025050100', views: 12345 },
    { timestamp: '2025050200', views: 13579 }
  ]
}
```

Recharts 多折线更适合这样的结构：

```ts
;[
  {
    time: 1746038400000,
    timestamp: '2025050100',
    article_0: 12345,
    article_1: 67890,
  },
]
```

`WikiChart` 中的 `Map` 合并逻辑就是这层适配。它把“每个条目一条时间序列”转换成“每个时间点一行，多列分别代表不同条目”。

这个处理是图表展示项目中很有价值的一环，因为真实接口返回的数据格式通常不会正好等于图表库需要的数据格式。

## 10. 组件化设计评价

这个项目的组件化意识主要体现在：

- 状态集中：全局查询状态放在 `App`，避免多个组件各自维护不一致的查询条件。
- 业务拆分明确：搜索、筛选、图表、导出、AI 跳转分别在独立组件里。
- UI 原语复用：按钮、弹窗、选择器、卡片、徽章、日历等都在 `components/ui` 中沉淀。
- 数据配置外置：默认查询、筛选项、预设组、类型定义都放在 `data` 目录。
- 工具函数独立：格式化和洗牌算法放在 `util` 目录。

整体上，它不是把所有逻辑堆在单个页面组件里，而是形成了“顶层状态 + 业务组件 + 基础 UI + 数据配置”的结构。

## 11. 样式系统

项目的样式集中在 `src/index.css` 和 Tailwind class 中。

样式特点：

- 使用 CSS variables 管理颜色、圆角、图表色和主题色。
- 支持 light / dark 两套主题。
- 字体上使用 Inter 作为主字体，JetBrains Mono 作为等宽字体。
- 图表颜色使用 One Dark Pro 风格的几组颜色。
- Recharts focus outline 被移除，提升图表交互视觉统一性。

项目使用的是 Tailwind CSS 4 的写法，并通过 `@theme inline` 把 CSS 变量暴露给 Tailwind token。

## 12. 构建和配置

根目录关键配置：

- `vite.config.ts`：配置 React 插件、Tailwind 插件、`@` 路径别名和部署 base `/Wikipedia-Chart/`。
- `tsconfig.app.json`：开启严格 TypeScript 配置，包括 `strict`、`noUnusedLocals`、`noUnusedParameters` 等。
- `eslint.config.js`：使用 ESLint 10 flat config，包含 TypeScript、React Hooks、React Refresh 规则。
- `components.json`：记录 shadcn 风格 UI 组件配置。
- `package.json`：定义 dev、build、lint、preview、deploy 等脚本。

项目部署路径显式设置为 `/Wikipedia-Chart/`，说明它适合部署到 GitHub Pages 这类子路径站点。

## 13. 学习价值

这个项目适合用来展示以下前端能力：

- 能用 React 管理一个真实的数据查询状态。
- 能把 URL 当作可分享状态，而不是只依赖内存 state。
- 能接入公开 API，并处理搜索、防抖、并发和取消。
- 能把接口数据转换成图表库需要的数据格式。
- 能通过组件拆分维护复杂页面。
- 能使用 TypeScript 给业务模型和接口结构建立约束。
- 能将 UI 功能拆成搜索、筛选、图表、下载、主题等模块。
- 能理解“AI 辅助开发”和“AI 功能集成”的边界：项目开发过程可以由 AI 辅助，但应用自身只是生成 prompt 并跳转 ChatGPT，不直接托管模型能力。

## 14. 当前实现边界

项目已经完成了主要体验闭环，但也能看到一些合理的边界：

- 当前主要面向英文 Wikipedia，搜索接口写死为 `en.wikipedia.org`。
- `project` 在类型和 URL 中存在，但界面暂未提供切换不同语言 Wikipedia 项目的入口。
- Pageviews 请求失败时主要以空数据兜底，没有做细分错误提示。
- 图表颜色只有 5 个变量，多于 5 条线时会循环使用颜色。
- 图表导出依赖浏览器 DOM 和 `html-to-image`，复杂样式或跨域图片在某些浏览器中可能有兼容性差异。
- ChatGPT 分析是外部跳转，不在应用内展示分析结果。

这些边界并不是问题，反而说明当前版本聚焦在图表展示、组件化和网络请求练习上，没有过早引入后端、多语言、多项目管理或复杂权限体系。

## 15. 后续可扩展方向

如果继续演进，可以考虑：

- 增加 Wikipedia project / language 选择器，例如 `zh.wikipedia`、`ja.wikipedia`、`de.wikipedia`。
- 增加图表类型切换，例如折线图、面积图、柱状图。
- 增加数据表视图，展示每个时间点的原始访问量。
- 增加错误提示，把网络错误、404、无数据分开展示。
- 增加本地收藏或历史记录，保存常用对比组。
- 增加颜色管理，支持用户为不同条目指定颜色。
- 增加统计摘要，例如峰值、均值、总访问量、增长率。
- 增加图表缩放或 brush，用于长时间范围分析。
- 把 ChatGPT prompt 生成逻辑抽成可测试的纯函数。
- 为数据转换逻辑补充单元测试，尤其是 timestamp 合并和空数据情况。

## 16. 一句话总结

Wikipedia Chart 是一个围绕 Wikimedia 访问量数据构建的前端图表应用。它由作者主导架构设计，并在 AI 辅助下完成，重点训练了 React 组件拆分、TypeScript 数据建模、公开 API 请求、URL 状态同步和 Recharts 图表展示能力。项目规模不大，但功能链路完整，适合作为前端工程化和数据可视化练习作品。
