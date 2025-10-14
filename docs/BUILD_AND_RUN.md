# 开发运行与打包（Build & Run）

## 开发模式

```bash
# 启动前端 + Tauri（热更新）
bun run tauri dev
# 或
npm run tauri dev
```

确保 Vite 端口为 1420，HMR 为 1421。若端口被占用，清理后重启（可参考 opcode 中文文档的 lsof 命令）。

## 仅前端调试

```bash
bun run dev
# 或 npm run dev
```

## 生产构建

```bash
# 生产包
bun run tauri build
# 构建指定安装包（macOS DMG）
bun run tauri build --bundles dmg
```

构建产物路径（各平台）：`src-tauri/target/release/`

## 常见问题

- cargo not found：加载 rustup 环境或重启终端
- 低内存构建失败：`cargo build -j 2`
- Web Speech 不可用：使用 Tauri Shell 兜底（见 TAURI_INTEGRATION.md）
