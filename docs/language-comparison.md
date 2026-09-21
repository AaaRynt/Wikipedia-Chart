# 语言对比：实现与讲解

## 第一个提交：条目身份与共享请求

原来的查询模型是一个 `project` 搭配一组标题字符串。现在改为 `searchProject` 和 `articles` 数组，每个条目分别保存：

- `project`：查询访问量所用的 Wikipedia 项目，例如 `en.wikipedia`。
- `article`：实际条目标题，空格统一转换为下划线。
- `entityId`：搜索接口返回的可选 Wikidata QID。

`searchProject` 决定去哪个 Wikipedia 搜索，已选条目的项目归属由各自的 `project` 决定。条目按“项目 + 标题”去重，不能按 QID 去重，因为同一实体的不同语言版本需要同时出现在图表中。现有英文预设明确携带英文项目。

搜索和访问量请求分别位于 `src/api/wikipedia-api.ts`、`src/api/pageviews-api.ts`，导出对象名为 `wikipediaApi`、`pageviewsApi`。图表、JSON 导出和分析链接共用访问量 URL 生成逻辑。单个请求失败时仍保留其他成功曲线，并区分失败与无数据。取消请求与结果归属检查共同防止旧结果覆盖当前图表。

新分享链接使用带版本号的查询参数 `v=2`。`articles` 使用 JSON 保存条目，再由 `URLSearchParams` 编码，避免斜杠、分号、百分号或中文标题破坏路径。原有七段式链接仍可在根路径和 `/Wikipedia-Chart/` 下恢复；非法参数回退到默认查询。JSON 导出增加 `version: 2`，包含每个条目的项目、HTTP 状态码、结果状态和原始响应。

## 后续提交：两种对比模式

第一个提交保留现有搜索和条目对比流程，尚未加入语言选择器、模式切换和 Wikidata 映射界面。

后续功能包含：

1. 条目对比：同一个语言项目，多个条目。
2. 语言对比：同一个实体，多个语言项目。
3. 根据已选条目的 QID，通过 Wikidata sitelinks 查找对应语言标题。
4. 映射请求的加载、失败、目标语言不可用状态。
5. 在当前链接格式上增加模式和源实体字段，使切换状态可以分享和恢复。

底层数据模型可以表示两种模式，界面再约束选择范围，第一版不开放多个实体和多个语言的任意混合对比。

## 面试讲解

核心是区分“实体身份”和“具体页面”。QID 标识跨语言的同一个实体，项目加标题标识实际统计访问量的页面。搜索获得 QID，后续通过 Wikidata sitelinks 获取不同语言的真实标题，再在相同日期、访问方式和用户类型条件下，分别请求访问量并按日期合并展示。

语言版本不等于国家，访问量不能直接解释为不同国家的关注度。缺失数据也不等于零访问量，请求失败不能偷偷变成一条零值曲线。

## 验证方式

使用现有依赖，没有新增包或修改版本。

```sh
pnpm exec vitest run --config vitest.config.ts
pnpm exec tsc --noEmit -p tsconfig.app.json
pnpm exec oxlint src/api src/lib/article.ts src/lib/query-url.ts
```

测试覆盖跨语言条目身份、标题去重、链接往返还原、旧链接、非法参数、HTTP 和 API 错误、部分失败、零访问量、异常响应、取消请求，以及默认日期落在闰日的情况。本次按要求不打开浏览器、不运行构建。

本次 46 项测试均通过，TypeScript 检查及修改文件的 lint、格式检查通过。命令行直接访问 Wikipedia 搜索和 Wikimedia Pageviews 时连接超时，真实接口连通性尚未验证；API 行为验证使用模拟响应。
