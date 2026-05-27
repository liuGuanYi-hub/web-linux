# Web Linux 架构说明

本文描述当前已经实现并通过构建验证的结构，不把规划功能当作已完成能力。

## 当前验证状态

- `npm run lint`：通过。
- `npx tsc -b`：通过。
- `npm run build`：通过。
- 生产构建仍有主 JavaScript chunk 超过 500 kB 的提示，应用懒加载尚未实施。

## 技术栈

| 类别 | 当前实现 |
| --- | --- |
| UI | React 19 + TypeScript + Vite |
| 状态 | Zustand `persist` |
| 样式 | Tailwind CSS v4 + CSS variables |
| 终端 | `@xterm/xterm` + `@xterm/addon-fit` |
| 图标 | `lucide-react`，通过 `AppIcon` 统一应用图标映射 |

## 系统结构

```text
AppShell
  BootScreen -> LoginScreen -> Desktop session
                                  |-- Desktop
                                  |-- WindowManager -> Window -> App component
                                  `-- Taskbar -> StartMenu

AppRegistry -> openApp -> windowStore -> WindowManager / Taskbar
```

## 主要模块

- `src/system/boot/AppShell.tsx` 管理启动、登录和桌面阶段，并处理终端发出的 `open-app` 事件。
- `src/system/desktop/Desktop.tsx` 显示桌面入口、`Game` 文件夹和任务栏时钟，并恢复已保存的壁纸设置。
- `src/system/taskbar/Taskbar.tsx` 显示全部窗口，包括最小化窗口，用于恢复与聚焦。
- `src/system/windowManager/Window.tsx` 实现拖拽、缩放、聚焦、关闭、最小化、最大化和边缘吸附。
- `src/system/AppRegistry.ts` 是应用定义来源，注册基础应用、工具和游戏。
- `src/system/AppIcon.tsx` 将注册表中的图标名称解析为 `lucide-react` 图标。

## 应用范围

基础应用：Terminal、Calculator、File Manager、Text Editor、Sticky Notes、Run、Calendar、Settings、Clock、Search。

工具应用：Code Editor、Task Manager、JSON Formatter、Regex Tester、Password Generator、Image Viewer、Base Converter、Markdown Preview。

游戏：Minesweeper、2048、Snake、Tetris、Solitaire、Sudoku、Chess。

## 数据与状态边界

当前可持久化的内容：

- 窗口列表、层级、位置、尺寸以及最小化/最大化状态。
- Settings 的主题与壁纸选项。
- Code Editor 保存的文本。
- Snake 的最高分。

尚未统一的数据层：

- File Manager 使用静态模拟目录。
- Text Editor 使用模块内模拟文件表。
- Terminal 的文件命令为模拟输出。
- 上述应用尚未共享基于 IndexedDB 的虚拟文件系统。

## 后续建议

1. 继续进行应用首屏和游戏交互验收。
2. 设计并接入共享虚拟文件系统，使文件管理器、编辑器和终端使用同一数据源。
3. 对应用组件进行按需加载，消除生产构建大 chunk 警告。
