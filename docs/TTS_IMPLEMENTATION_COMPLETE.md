# TTS 集成完成报告（P1：Tauri + tts-rs）

## 实施状态

✅ **已完成** - 系统 TTS（tts-rs）集成与前端 API 统一

## 完成内容

### 后端（Rust）

1. **依赖添加** (`src-tauri/Cargo.toml`)
   - tts = "0.26" - 跨平台系统 TTS
   - anyhow = "1" - 错误处理
   - once_cell = "1" - 延迟初始化
   - parking_lot = "0.12" - 高性能锁

2. **TTS 系统模块** (`src-tauri/src/tts_system.rs`)
   - `list_voices()` - 枚举系统可用语音
   - `speak()` - 播报文本，支持 lang/voice/rate/pitch
   - `pick_voice_by_lang()` - 按语言前缀（zh/en）自动选择音色
   - `capability()` - 返回可用语言列表

3. **Tauri Commands** (`src-tauri/src/main.rs`)
   - `tts_list_voices` - 列出所有系统语音
   - `tts_speak_system` - 播报文本
   - `tts_capability` - 获取系统能力

### 前端（TypeScript）

1. **统一 TTS API** (`src/lib/tts.ts`)
   - `listVoices()` - 获取可用语音列表
   - `capability()` - 查询系统/Piper 能力
   - `speak(text, options)` - 播报文本，支持 auto/system/web 引擎
   - 自动回退：Tauri TTS → Web Speech API

2. **集成现有音频系统** (`src/utils/phonemeAudioAdapter.ts`)
   - TauriTTSAdapter 更新为使用 `tts_speak_system` 命令
   - 移除旧的 shell `say` 调用
   - 保持三层回退策略：Sprite → Tauri TTS → Web Speech

### 配置清理

1. **tauri.conf.json** - 移除不再需要的 shell allowlist（`say` 命令）
2. **图标生成** - 创建占位符 SVG 并生成全套 Tauri 图标

## 语言支持

- **中文（zh-CN）**: 自动匹配系统中文语音（如 macOS Tingting/Mei-Jia）
- **英文（en-US）**: 自动匹配系统英文语音（如 macOS Samantha/Alex）
- **回退机制**: 若未找到目标语言音色，降级到 Web Speech API（开发环境）

## 使用示例

### 前端调用

```ts
import { speak, listVoices, capability } from '@/lib/tts';

// 播报英文
await speak('Hello, welcome to natural phonics!', { lang: 'en-US', rate: 0.9 });

// 播报中文
await speak('你好，欢迎学习自然拼读', { lang: 'zh-CN', rate: 1.0 });

// 列出可用语音
const voices = await listVoices();
console.log(voices); // [{ id, name, lang, engine: 'system' }...]

// 查询能力
const cap = await capability();
console.log(cap.system.langs); // ['zh', 'en', ...]
```

### 现有音素播放（保持兼容）

```ts
import { usePhonemeAudio } from '@/hooks/usePhonemeAudio';

const { play } = usePhonemeAudio();
await play('v1'); // 自动选择：sprite → Tauri TTS → Web Speech
```

## 测试要点

### 手动测试

1. **启动应用**: `npm run tauri dev`
2. **测试英文**: 打开控制台，运行 `invoke('tts_speak_system', { text: 'Hello', lang: 'en-US' })`
3. **测试中文**: `invoke('tts_speak_system', { text: '你好', lang: 'zh-CN' })`
4. **列出语音**: `invoke('tts_list_voices')`
5. **查询能力**: `invoke('tts_capability')`

### 预期结果

- 英文播报使用系统英文语音
- 中文播报使用系统中文语音
- 语音列表包含 zh 与 en 开头的语言
- 速率/音调调整有效（0.5-2.0 范围）

## 已知限制

1. **系统语音依赖**: 需要操作系统已安装目标语言音色
   - macOS: 系统偏好设置 > 辅助功能 > 朗读内容 > 系统语音
   - Windows: 设置 > 时间和语言 > 语音
   - Linux: 依赖 Speech Dispatcher 配置

2. **音质差异**: 不同平台/音色质量不一致（由系统决定）

3. **Web Speech 限制**: 在浏览器开发模式下，回退到 Web Speech API，受浏览器策略限制

## 后续计划（P2/P3）

- **P2**: 集成 Piper（构建期预生成固定讲解音频，替代 sprite）
- **P3**: Piper 运行时合成（动态文本播报，需打包模型）

## 文件清单

### 新增文件
- `src-tauri/src/tts_system.rs` - 系统 TTS 核心模块
- `src/lib/tts.ts` - 前端统一 TTS API
- `src-tauri/icons/icon.svg` - 占位符图标源文件
- `docs/TTS_*.md` - 技术文档（架构、集成指南、QA 等）

### 修改文件
- `src-tauri/Cargo.toml` - 添加 tts/anyhow/once_cell/parking_lot 依赖
- `src-tauri/src/lib.rs` - 简化为仅暴露 tts_system 模块
- `src-tauri/src/main.rs` - 注册 TTS Tauri commands
- `src-tauri/tauri.conf.json` - 移除旧 shell allowlist
- `src/utils/phonemeAudioAdapter.ts` - TauriTTSAdapter 使用新命令

### 删除内容
- 旧 shell allowlist 配置（say 命令）
- 不再需要的临时文件

## 验收确认

- ✅ Rust 编译成功（cargo build --release）
- ✅ 前端 TTS API 创建完成
- ✅ 旧 shell 调用已替换
- ✅ 图标生成完成
- ⏸ 运行时测试待启动应用验证

## 下一步

运行 `npm run tauri dev` 启动应用，在浏览器控制台测试 TTS 命令：

```js
// 打开控制台
const { invoke } = window.__TAURI__.core;

// 测试播报
await invoke('tts_speak_system', { text: 'Hello world', lang: 'en-US' });
await invoke('tts_speak_system', { text: '你好世界', lang: 'zh-CN' });

// 列出语音
const voices = await invoke('tts_list_voices');
console.table(voices);
```
