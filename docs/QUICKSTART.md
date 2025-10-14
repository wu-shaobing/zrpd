# 快速启动指南

## 🚀 立即运行

### 方式1：开发模式（推荐用于测试）

在终端执行：

```bash
# 进入项目目录
cd /Users/wushaobing911/Desktop/zrpd

# 启动开发服务器
npm run dev
```

然后在浏览器访问：**http://localhost:1420**

按 `Ctrl+C` 停止服务器。

---

### 方式2：预览生产构建

```bash
# 1. 构建项目（已完成）
npm run build

# 2. 预览构建结果
npm run preview
```

然后在浏览器访问预览地址（通常是 http://localhost:4173）。

---

## 🧪 功能验证清单

### 1. 颜色显示测试 ✅
- [ ] 元音卡片颜色正确显示
  - A = 红色（red）
  - E = 黄色（yellow）
  - I = 绿色（green）
  - O = 蓝色（blue）
  - U = 紫色（purple）

- [ ] 辅音卡片颜色正确显示（13个不同颜色）
- [ ] 游戏卡片颜色正确显示
  - ea = 靛蓝色（indigo）
  - ow = 翠绿色（emerald）
  - ch = 琥珀色（amber）
  - th = 紫罗兰色（violet）

### 2. 翻卡游戏测试 ✅
- [ ] 点击卡片可以翻转（正面↔背面）
- [ ] 首次翻到背面加5分（分数区域显示更新）
- [ ] 重复翻转不再加分（分数保持不变）
- [ ] 点击"重置游戏"按钮
  - [ ] 所有卡片恢复正面
  - [ ] 分数清零
  - [ ] 卡片重新洗牌（顺序改变）

### 3. 语音播放测试 ✅
- [ ] 点击元音卡片的"听发音"按钮
- [ ] 听到示例词的英语发音（如 "bag, map"）
- [ ] 如果没有声音，检查浏览器是否支持 Web Speech API
  - Chrome/Edge: ✅ 支持
  - Safari: ✅ 支持
  - Firefox: ⚠️ 部分支持

### 4. 键盘导航测试 ✅
- [ ] 按 `Tab` 键可以在所有可交互元素间跳转
- [ ] 焦点可见（有蓝色轮廓）
- [ ] 聚焦到游戏卡片后，按 `Enter` 或 `Space` 可翻转
- [ ] 聚焦到"听发音"按钮后，按 `Enter` 或 `Space` 播放语音

### 5. 进度条测试 ✅
- [ ] 向下滚动页面
- [ ] 顶部进度条随滚动位置更新（0% → 100%）
- [ ] 百分比数字同步更新

### 6. 响应式测试 ✅
- [ ] 调整浏览器窗口大小
- [ ] 在小屏幕（手机模拟）下布局正常
- [ ] 在中等屏幕（平板）下布局正常
- [ ] 在大屏幕（桌面）下布局正常

### 7. 无障碍测试 ✅
- [ ] 右键点击页面 → 检查（开发者工具）
- [ ] 切换到 Lighthouse 选项卡
- [ ] 运行无障碍审计
- [ ] 检查是否有 ARIA 标签错误

### 8. Reduced Motion 测试 ✅
macOS 系统设置：
```
系统设置 → 辅助功能 → 显示 → 减弱动态效果（打勾）
```

然后刷新页面，检查动画是否被禁用。

---

## 🐛 常见问题排查

### 问题1：端口 1420 被占用
```bash
# 查找占用端口的进程
lsof -i :1420

# 终止进程（替换 PID 为实际进程号）
kill -9 <PID>

# 重新启动
npm run dev
```

### 问题2：依赖安装失败
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 问题3：颜色不显示
- 确认已修复动态类名问题（P1 阶段）
- 检查浏览器控制台是否有 CSS 加载错误
- 尝试硬刷新页面（`Cmd+Shift+R`）

### 问题4：语音不工作
- 确认浏览器支持 Web Speech API
- 检查浏览器控制台是否有 Speech Synthesis 错误
- 尝试在 HTTPS 或 localhost 环境运行
- macOS 用户：检查系统语音设置是否包含英语语音

### 问题5：TypeScript 报错
```bash
# 运行类型检查
npm run typecheck

# 如果有错误，检查报错文件并修复
```

---

## 📊 性能基准测试

### 使用 Lighthouse 测试

1. 打开 Chrome DevTools（F12）
2. 切换到 Lighthouse 选项卡
3. 选择 "Performance"、"Accessibility"、"Best Practices"
4. 点击 "Analyze page load"
5. 查看得分与建议

**目标分数**：
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 90

---

## 🎯 下一步开发

### 如果测试通过 ✅
- 考虑进入 P2 阶段（Tauri 2 集成）
- 或添加更多功能（RulesSection、完整音标课程）
- 或进行用户测试收集反馈

### 如果发现问题 ⚠️
1. 记录问题现象与复现步骤
2. 检查浏览器控制台错误信息
3. 查看 Git 提交历史定位问题引入时间
4. 修复并重新测试

---

## 📞 获取帮助

### 查看项目文档
- `README.md` - 项目总览
- `WARP.md` - 项目规则与技术栈
- `docs/` - 详细设计文档（13个文件）

### 检查 Git 历史
```bash
# 查看提交历史
git log --oneline --graph

# 查看特定提交的详细信息
git show <commit-hash>

# 查看文件变更历史
git log -p <file-path>
```

### 技术栈文档
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- Zustand: https://zustand-demo.pmnd.rs

---

**祝测试顺利！** 🎉

如有任何问题，请参考上述排查步骤或查阅项目文档。
