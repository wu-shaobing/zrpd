# 环境与初始化（Environment & Setup）

## 平台与工具

- macOS 11+（开发机）
- Xcode Command Line Tools：`xcode-select --install`
- Rust（rustup）
- Node.js 或 Bun（建议 Bun）
- Tauri CLI：`npm i -D @tauri-apps/cli`（或全局）

## 依赖安装（示例）

```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Node (可选) 或 Bun
# macOS: brew install node / bun

# 初始化 Vite + React + TS
npm create vite@latest zrpd -- --template react-ts
cd zrpd

# 安装前端依赖（对齐 opcode 使用）
npm i react react-dom zustand tailwindcss @tailwindcss/vite @vitejs/plugin-react clsx tailwind-merge date-fns

# 安装 Tauri 依赖
npm i -D @tauri-apps/cli
npm i @tauri-apps/api @tauri-apps/plugin-shell @tauri-apps/plugin-dialog @tauri-apps/plugin-opener
```

## Tailwind 初始化

```bash
npx tailwindcss init -p
```

在 Vite 中启用 `@tailwindcss/vite` 插件，配置 src/styles/tailwind.css 并在入口引入。

## Tauri 初始化

```bash
# 初始化 tauri（在项目根运行）
npx tauri init
# 或按模板向导完成 src-tauri 生成
```

关键对齐点：
- Vite 开发端口固定为 1420，严格占用；HMR 1421
- server.watch 忽略 `**/src-tauri/**`
- 构建手动分包（见 ARCHITECTURE.md）

## 从 HTML 迁移

- 将 `/Users/wushaobing911/Desktop/zrpd/自然拼读.html` 拆分为多个 React 组件
- 将内联 `<style>` 与 `<script>` 迁移为模块化 TS + CSS（Tailwind utilities + 少量自定义样式）
- 将 DOM 事件（click、keydown、scroll）改为 React 事件与 hook

## 本地化 CDN 资源

- Tailwind：使用 npm 版本与构建产物
- Font Awesome：使用本地包或改用 lucide-react 等 SVG 图标

## 语音能力检测

- 在 useSpeech 中检测 `window.speechSynthesis`，不可用时降级到 Tauri Shell 或本地音频
