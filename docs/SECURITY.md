# 安全与隐私（Security）

## 权限最小化

- 仅启用必要的 Tauri 插件（shell/dialog 等）
- Shell allowlist 白名单具体命令（如 say），拒绝通配符

## 本地数据

- 分数/设置存储于应用目录（Tauri app data），不上传
- 不收集使用数据；无遥测

## 依赖与更新

- 锁定依赖版本；启用 SRI/完整性（如需）
- 定期升级 Tauri/React 以获得安全修复

## 输入校验

- 对语音文本、文件名、用户输入执行长度与字符过滤
