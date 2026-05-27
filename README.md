# Web Linux

Web Linux 是一个基于 React、TypeScript 和 Vite 的浏览器桌面模拟系统。项目重点展示启动、登录、桌面、任务栏、开始菜单、多窗口管理以及一组内置应用和小游戏。

## 启动方式

```bash
npm run dev
```

打开终端中显示的地址，通常是：

```text
http://localhost:5173/
```

默认登录密码：

```text
linux
```

## 常用验证命令

```bash
npx tsc -b
npm run lint
npm run build
```

当前代码已通过类型检查、ESLint 和生产构建。生产构建仍会提示主 JavaScript chunk 大于 500 kB，后续可以通过应用懒加载和代码拆包优化。

## 已实现内容

- 启动页、登录页、桌面、任务栏、开始菜单和多窗口管理。
- 窗口拖拽、缩放、最小化、最大化、关闭、任务栏恢复和边缘吸附。
- 桌面应用单击打开，游戏集中放在桌面 `Game` 文件夹中。
- 统一的应用图标映射，优先使用 `lucide-react`。
- 基础应用：Terminal、Calculator、File Manager、Text Editor、Sticky Notes、Run、Calendar、Settings、Clock、Search。
- 工具应用：Code Editor、Task Manager、JSON Formatter、Regex Tester、Password Generator、Image Viewer、Base Converter、Markdown Preview。
- 游戏：Minesweeper、2048、Snake、Tetris、Solitaire、Sudoku、Chess。

## 已知限制

- File Manager、Text Editor 和 Terminal 仍使用各自的模拟文件数据，尚未接入统一持久化虚拟文件系统。
- Task Manager 中的进程和资源数据为模拟数据。
- 部分应用属于演示级交互，规则和边界情况还没有完整覆盖。
- 应用当前同步加载，生产构建存在大 chunk 警告。

## 主要目录

```text
src/
  apps/      应用与游戏实现
  stores/    Zustand 状态管理
  system/    桌面、窗口管理、任务栏、开始菜单和应用注册
  styles/    全局样式与主题变量
```
