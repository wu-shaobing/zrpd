# Tauri 集成要点（Tauri Integration）

## 版本与端口

- Tauri 2，Vite 端口 1420（strictPort: true），HMR 1421（参考 opcode 的 vite.config.ts）

## 插件

- @tauri-apps/plugin-shell：用于语音兜底（macOS `say`）
- @tauri-apps/plugin-dialog：文件/提示（可选）

## 语音兜底设计

当 Web Speech API 不可用时：

1) 使用 plugin-shell 调用系统 `say`（仅 macOS 存在，需在 allowlist 中允许具体可执行文件与参数）
2) 或播放本地 mp3 音频（推荐跨平台方案）

### allowlist 配置示意（tauri.conf.json）

```json
{
  "plugins": {
    "shell": {
      "allow": [
        {
          "name": "say",
          "cmd": "/usr/bin/say",
          "args": ["{text}"]
        }
      ]
    }
  }
}
```

前端调用（示意）：

```ts
import { Command } from "@tauri-apps/plugin-shell";

export async function speakViaShell(text: string) {
  const cmd = Command.create("say", [text]);
  await cmd.execute();
}
```

注意：
- 仅允许受限命令；对 text 做长度/字符过滤，防止注入
- Windows/Linux 建议使用本地音频替代

## 文件访问与窗口

- 默认不开放任意文件系统访问；如需导出成绩，采用应用目录（appData）
- 窗口最小/最大尺寸按 UI 设计设定（避免过小影响布局）

## 更新与分发（可选）

- 使用 GitHub Releases 分发 .dmg/.msi
- 自动更新可后续引入（谨慎评估）
