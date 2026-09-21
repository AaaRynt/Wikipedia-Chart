# 语言对比：实现与讲解

## 第一个提交：条目身份与共享请求

原来的查询模型是一个 `project` 搭配一组标题字符串。现在改为 `searchProject` 和 `articles` 数组，每个条目分别保存：

- `project`：查询访问量所用的 Wikipedia 项目，例如 `en.wikipedia`。
- `article`：实际条目标题，空格统一转换为下划线。
- `entityId`：搜索接口返回的可选 Wikidata QID。

`searchProject` 决定去哪个 Wikipedia 搜索，已选条目的项目归属由各自的 `project` 决定。条目按“项目 + 标题”去重，不能按 QID 去重，因为同一实体的不同语言版本需要同时出现在图表中。现有英文预设明确携带英文项目。

搜索和访问量请求分别位于 `src/api/wikipedia-api.ts`、`src/api/pageviews-api.ts`，导出对象名为 `wikipediaApi`、`pageviewsApi`。图表、JSON 导出和分析链接共用访问量 URL 生成逻辑。单个请求失败时仍保留其他成功曲线，并区分失败与无数据。取消请求与结果归属检查共同防止旧结果覆盖当前图表。

新分享链接使用带版本号的查询参数 `v=2`。`articles` 使用 JSON 保存条目，再由 `URLSearchParams` 编码，避免斜杠、分号、百分号或中文标题破坏路径。原有七段式链接仍可在根路径和 `/Wikipedia-Chart/` 下恢复；非法参数回退到默认查询。JSON 导出增加 `version: 2`，包含每个条目的项目、HTTP 状态码、结果状态和原始响应。

## 第二个提交：两种对比模式

页面保留一张折线图，新增两种模式：

1. `Articles`：选择一个 Wikipedia 语言项目，搜索并添加多个条目。
2. `Languages`：搜索选择一个实体，勾选该实体的不同语言版本。

第一版提供英语、中文、日语、德语、法语、西班牙语、俄语、葡萄牙语、韩语、意大利语、阿拉伯语和印地语。语言项目与 Wikidata site ID 使用显式配置，避免把项目代码直接拼接成站点编号。中文为 `zh.wikipedia`，不把简繁显示变体当作独立访问量项目。

`ComparisonControls` 负责模式和语言选择，`LanguageVersions` 负责映射加载状态与复选框，`comparison.ts` 中的纯函数负责状态约束：

- 条目模式：每个条目的 `project` 必须等于 `searchProject`。
- 语言模式：每个条目必须属于源实体，同一语言最多一条曲线。
- 没有 QID 时，仅允许保留源页面的访问量。
- 勾选全部取消后保留 `source`，因此仍可以重新选择语言。

切换模式会在组件的本地 `ref` 中保存上一次选择，再切回来时恢复。条目模式切换语言时也会暂存各语言的条目列表；不会把英文标题直接当作中文标题去查询。语言模式切换搜索语言只改变搜索入口，不影响已经选定的实体和曲线。日期、粒度等条件始终共用。暂存选择仅存在于当前页面会话，分享链接只保存当前模式。

## 映射请求的数据流

```text
搜索 Japan，选择条目
  -> Wikipedia query + pageprops，处理重定向并确认实际 QID
  -> Q17
  -> Wikidata wbgetentities + sitelinks
  -> enwiki: Japan / zhwiki: 日本 / jawiki: 日本
  -> 勾选语言，形成各自的 project + article
  -> Wikimedia Pageviews 并发请求
  -> 按日期合并，在同一张图中展示
```

`wikidataApi.getLanguageVersions()` 先调用 `wikipediaApi.resolveArticle()`，重新确认实际页面的规范标题和 QID，再读取 sitelinks。这样预设、旧链接和重定向条目都能工作，也不会盲目信任分享链接中已经过时的 QID。标题来自 sitelinks，而不是翻译、字符串相似度或同名猜测。

HTTP 失败和网络失败显示错误与重试按钮；找不到页面、没有 QID、实体被删除、没有其他支持的语言版本分别显示对应状态。没有目标语言条目时，复选框不可选。

请求使用 `AbortController`。异步结果写入前还会检查请求是否取消，并在更新查询时确认当前仍然是原来的源实体。`applyLanguageMapping()` 使用最新的查询状态，因此请求期间切换日期或取消勾选，不会被旧状态覆盖。

## 分享与导出

新链接升级为 `v=3`，新增 `mode` 和 `source`。语言全部取消时，也能恢复“已选实体但未选语言”的状态。旧七段式链接继续作为条目模式恢复；`v=2` 链接根据项目和 QID 推断模式，无法表示为这两种模式的混合查询回退到默认状态。

链接解析同时验证模式约束，防止通过修改 URL 混入其他语言或其他实体。语言映射成功后，会依据当前 sitelinks 更新已选标题并移除已经不可用的语言。JSON 导出同样升级为 `version: 3`，包含当前模式、源实体、各条目的项目和响应状态。下载入口改为点击弹出，以支持键盘和触屏操作。

## 面试讲解

核心是区分“实体身份”和“具体页面”。QID 标识跨语言的同一个实体，项目加标题标识实际统计访问量的页面。搜索获得 QID，后续通过 Wikidata sitelinks 获取不同语言的真实标题，再在相同日期、访问方式和用户类型条件下，分别请求访问量并按日期合并展示。

语言版本不等于国家，访问量不能直接解释为不同国家的关注度。缺失数据也不等于零访问量，请求失败不能偷偷变成一条零值曲线。

## 验证方式

使用现有依赖，没有新增包或修改版本。

```sh
pnpm exec vitest run --config vitest.config.ts
pnpm exec tsc --noEmit -p tsconfig.app.json
pnpm exec oxlint src/api src/lib/comparison.ts src/lib/query-url.ts
```

测试覆盖跨语言条目身份、标题去重、链接往返还原、旧链接、非法参数、HTTP 和 API 错误、部分失败、零访问量、异常响应、取消请求，以及默认日期落在闰日的情况。本次按要求不打开浏览器、不运行构建。

第二次实现增加模式切换、选择恢复、单实体约束、重定向、无 QID、站点过滤、映射取消和旧版本链接迁移测试。完整流程测试串起搜索、映射、勾选语言、分享恢复及访问量请求。组件另外使用 React 服务端渲染检查初始控件和加载状态，不启动浏览器。

最终共 86 项测试通过，TypeScript 检查与本次修改文件的 lint、格式检查通过。

真实接口连通性仍未确认：本次命令行访问 Wikipedia 和 Wikidata 均超时。API 测试使用模拟响应，不能替代真实网络环境下的交互验收。
