# 素材与内容（Assets & Content）

## 素材组织

```
src/assets/
├── audio/
│   ├── phonemes/         # 音素发音（兜底音频）
│   └── words/            # 示例词发音
├── icons/                # SVG 图标
├── images/               # 主题插图
└── fonts/                # 可选字体
```

## 数据与规则

将 HTML 中的规则归纳为 JSON：

- vowels.json（A/E/I/O/U 不同位置/音节规则）
- consonants.json（B/C/D/... 的常见读音）
- digraphs.json（ea/ee/ow/ou/ch/sh/th/...）
- ipa.json（48 音标清单，分组与展示顺序）

JSON 结构示例（简化）：

```json
{
  "vowels": [{ "letter": "A", "sounds": [{ "ipa": "/æ/", "examples": ["bag","map"] }] }]
}
```

## 音频策略

- 优先使用 Web Speech；兜底使用本地音频
- 文件命名规范：`en-US/phonemes/ae-long.mp3`、`words/teach.mp3`
- 打包进入应用，避免网络依赖

## 图标与字体

- 使用本地 SVG（如 lucide-react）替代在线 CDN
- 仅在许可范围内打包字体/图标

## 打包与缓存

- 通过 Vite 处理静态资源，生成带 hash 的构建产物
- 尽量避免 runtime 网络请求，提升离线体验
