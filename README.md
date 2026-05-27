# Web Linux

基于 React、TypeScript 与 Vite 构建的浏览器桌面模拟器。

## 当前状态

当前源码已通过以下验证：

```bash
npx tsc -b
npm run lint
npm run build
```

`vite build` 仍提示主 JavaScript chunk 大于 500 kB，后续可通过应用懒加载和代码分割优化。

源码中的损坏 emoji/乱码图标已清理为 `lucide-react` 图标、`AppIcon` 或 ASCII 文本。当前仅保留具有业务含义的符号，例如计算器的 `×` / `÷` 和国际象棋走法中的箭头记号。

## 已实现

- 启动、登录、桌面、任务栏、开始菜单与多窗口管理。
- 窗口拖拽、缩放、最小化、最大化、边缘吸附和会话持久化。
- 基于 `lucide-react` 的统一应用图标展示，桌面、任务栏、开始菜单、运行、搜索及多个应用内工具按钮已接入。
- 桌面壁纸与强调色设置，壁纸选择可作用于实际桌面并在刷新后恢复。
- 终端、计算器、文件管理器、文本编辑器、便签、日历、时钟、运行和搜索等基础应用。
- 代码编辑器、任务管理器、JSON Formatter、Regex Tester、Password Generator、Image Viewer、Base Converter 与 Markdown Preview 等工具。
- Minesweeper、2048、Snake、Tetris、Solitaire、Sudoku 与 Chess 等游戏。

## 已知限制

- 文件管理器、文本编辑器和终端使用各自的模拟文件数据，尚未接入统一的持久化虚拟文件系统。
- 任务管理器中的进程与资源数据为模拟数据。
- 部分应用仍属于初版交互实现，尚未逐项完成功能验收。
- 应用当前同步加载，生产构建存在大 chunk 警告。
- 当前不包含新增功能开发；本轮主要完成 lint/typecheck 收敛、图标清理和文档同步。

## 开发

```bash
npm install
npm run dev
```

常用验证命令：

```bash
npx tsc -b
npm run lint
npm run build
```

## 主要目录

```text
src/
  apps/              应用与游戏实现
  stores/            Zustand 状态
  system/            桌面、窗口管理、任务栏和应用注册
  styles/            全局样式与主题变量
```
