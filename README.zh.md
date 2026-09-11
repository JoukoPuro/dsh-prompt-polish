# dsh-prompt-polish

[English](README.md) | 中文

一个 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）插件：
在 Web 输入框的工具行中添加一个 ✨ 图标按钮。点击后选择润色风格，已接入的大模型
会把你草稿中的提示词改写得更专业、更易被 AI 理解 —— 改写结果直接替换回输入框，
发送前你可以先审阅。

- **纯图标按钮** —— 输入框工具行上一个 ✨ 图标，无文字；悬停提示给出完整说明。
- **四种改写风格** —— 平衡 / 简洁 / 详细 / 代码向。
- **多语言界面** —— 菜单文案跟随浏览器语言（中文、English、日本語、한국어、Français、
  Deutsch、Español、Português、Русский、Italiano、Türkçe、Tiếng Việt；未匹配语言回退英文）。
- **复用已接入的模型** —— 优先使用当前默认 Agent 模型（`agentDefaultModel`），
  也可通过配置显式指定 `provider` / `model`。

## 环境要求

- 已运行的 DeepSeek Harness（`@deepseek-ai/dsh`）web profile，并已配置模型适配器
  （例如在设置中为 DeepSeek 服务商配置了 API Key）。
- 同时兼容 DSH `0.1.0-rc.6`（InputZone owner props）与 `0.1.5-rc.2+`
  （标准 kit 的 `useInput` hook）；草稿来源在运行时自动协商。

## 安装

```sh
# 在本仓库的检出目录（或其所在目录）中执行
dsh plugin --profile web add ./dsh-prompt-polish
```

然后重启 `dsh web`，让 profile 加载新的 bundle：

```sh
dsh web
```

打开 Web UI，输入一段草稿，点击输入框工具行中的润色按钮即可。

## 配置

插件在 profile 的 `cordis.patch.yml`（用户层，在 bundle 层之后应用）中接受可选配置：

```yaml
- id: prompt-polish
  config:
    provider: deepseek-official   # 显式指定路由（可选）
    model: deepseek-v4-flash      # 必须与 provider 成对出现
    style: balanced               # 默认改写风格：balanced | concise | detailed | code
    maxTokens: 2048               # 改写调用的输出上限
    # system: '...'               # 自定义改写指令（替换内置的各风格提示词）
```

未配置 `provider` / `model` 时，插件使用 `agentDefaultModel.currentSelection()` ——
与会话使用相同的默认模型。

## 工作原理

| 半边 | 文件 | 作用 |
|---|---|---|
| Host | `lib/index.js` | 在 Web 服务器上注册 `POST /prompt-polish`；通过 `ctx.llm` 流式执行一次 LLM 改写 |
| 浏览器 | `lib/client.js` | 向 `conversation.input.right` 注册润色按钮；打开风格菜单；提交草稿并把改写结果写回输入框 |

该 bundle 的 `package.json` 同时声明了双面插件的两个面：

- `dsh.bundle` —— profile 的 patch 层（`cordis.patch.yml`），插入 `prompt-polish` loader 行。
- `dsh.client` —— Web 启动行；`client-modules` 将 `lib/client.js` 以
  `/plugins/dsh-prompt-polish/client.js` 提供。

## 开发

编辑 `lib/index.js`（Host 侧）与 `lib/client.js`（浏览器侧）。浏览器 bundle 是手工构建的
闭包工厂产物（`window.__ModuleLoader__.load({ id, factory })`）—— 外部依赖仅限平台模块
（`react`、`@deepseek-ai/dsh-client-ui-primitives`），其余全部内联，符合 loader 的
模块表规则。

在改动线上 profile 之前，先在临时端口验证：

```sh
dsh web --port 3099
curl -s http://127.0.0.1:3099/plugins/dsh-prompt-polish/client.js | head
curl -s -X POST http://127.0.0.1:3099/prompt-polish \
  -H 'content-type: application/json' \
  -d '{"text":"read a.csv and sort by b","style":"code"}'
```

## 许可证

MIT
