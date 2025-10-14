# 测试与验收（Testing & QA）

## 测试层次

- 单元测试：Vitest（纯函数、hooks、stores）
- 组件测试：@testing-library/react（交互、ARIA）
- 端到端：Playwright（卡片翻转、打分、重置）
- Tauri 后端：Rust `cargo test`（如有命令）
- 无障碍：axe / pa11y（对比 WCAG）

## 关键用例

- 首屏渲染无报错，进度条随滚动更新
- 点击/键盘翻转卡片，首次加分
- 重置清空 scored 状态并洗牌
- Web Speech 不可用时自动降级
- Reduced Motion 下动画静默

## 验收清单

- [ ] 离线运行正常（无 CDN）
- [ ] 键盘可达，焦点可见
- [ ] 高对比度主题可读性
- [ ] 多分辨率布局适配
- [ ] macOS DMG 打包可安装
