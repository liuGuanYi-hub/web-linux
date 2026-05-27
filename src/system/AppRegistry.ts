import React from 'react'
import { TerminalApp } from '@/apps/terminal'
import { CalculatorApp } from '@/apps/calculator'
import { FileManagerApp } from '@/apps/fileManager'
import { MinesweeperApp } from '@/apps/minesweeper'
import { TextEditorApp } from '@/apps/textEditor'
import { StickyNotesApp } from '@/apps/stickyNotes'
import { RunDialogApp } from '@/apps/runDialog'
import { CalendarApp } from '@/apps/calendar'
import { SettingsApp } from '@/apps/settings'
import { ClockApp } from '@/apps/clock'
import { SearchApp } from '@/apps/search'
import { Game2048 } from '@/apps/game2048'
import { SnakeGame } from '@/apps/snake'
import { TetrisGame } from '@/apps/tetris'
import { CodeEditorApp } from '@/apps/codeEditor'
import { SolitaireGame } from '@/apps/solitaire'
import { SudokuGame } from '@/apps/sudoku'
import { ChessGame } from '@/apps/chess'
import { TaskManagerApp } from '@/apps/taskManager'
import { JsonFormatterApp } from '@/apps/jsonFormatter'
import { RegexTesterApp } from '@/apps/regexTester'
import { PasswordGeneratorApp } from '@/apps/passwordGenerator'
import { ImageViewerApp } from '@/apps/imageViewer'
import { BaseConverterApp } from '@/apps/baseConverter'
import { MarkdownPreviewApp } from '@/apps/markdownPreview'

export interface AppDefinition {
  id: string
  name: string
  icon: string
  windowProps: { width: number; height: number; minWidth?: number; minHeight?: number }
  component?: React.ComponentType
}

const appRegistry: Record<string, AppDefinition> = {
  terminal: { id: 'terminal', name: 'Terminal', icon: 'Terminal', windowProps: { width: 800, height: 500, minWidth: 400, minHeight: 300 }, component: TerminalApp },
  calculator: { id: 'calculator', name: 'Calculator', icon: 'Calculator', windowProps: { width: 280, height: 450, minWidth: 280, minHeight: 400 }, component: CalculatorApp },
  fileManager: { id: 'fileManager', name: 'File Manager', icon: 'Folder', windowProps: { width: 700, height: 450, minWidth: 400, minHeight: 300 }, component: FileManagerApp },
  minesweeper: { id: 'minesweeper', name: 'Minesweeper', icon: 'Grid', windowProps: { width: 400, height: 480, minWidth: 300, minHeight: 380 }, component: MinesweeperApp },
  textEditor: { id: 'textEditor', name: 'Text Editor', icon: 'FileText', windowProps: { width: 650, height: 450, minWidth: 300, minHeight: 200 }, component: TextEditorApp },
  stickyNotes: { id: 'stickyNotes', name: 'Sticky Notes', icon: 'StickyNote', windowProps: { width: 400, height: 500, minWidth: 300, minHeight: 350 }, component: StickyNotesApp },
  runDialog: { id: 'runDialog', name: 'Run', icon: 'TerminalSquare', windowProps: { width: 480, height: 320, minWidth: 400, minHeight: 280 }, component: RunDialogApp },
  calendar: { id: 'calendar', name: 'Calendar', icon: 'Calendar', windowProps: { width: 700, height: 480, minWidth: 550, minHeight: 400 }, component: CalendarApp },
  settings: { id: 'settings', name: 'Settings', icon: 'Settings', windowProps: { width: 550, height: 420, minWidth: 450, minHeight: 350 }, component: SettingsApp },
  clock: { id: 'clock', name: 'Clock', icon: 'Clock', windowProps: { width: 350, height: 480, minWidth: 300, minHeight: 400 }, component: ClockApp },
  search: { id: 'search', name: 'Search', icon: 'Search', windowProps: { width: 550, height: 400, minWidth: 400, minHeight: 300 }, component: SearchApp },
  game2048: { id: 'game2048', name: '2048', icon: 'Grid', windowProps: { width: 360, height: 480, minWidth: 300, minHeight: 380 }, component: Game2048 },
  snake: { id: 'snake', name: 'Snake', icon: 'Zap', windowProps: { width: 510, height: 420, minWidth: 400, minHeight: 340 }, component: SnakeGame },
  tetris: { id: 'tetris', name: 'Tetris', icon: 'Grid', windowProps: { width: 420, height: 560, minWidth: 360, minHeight: 480 }, component: TetrisGame },
  codeEditor: { id: 'codeEditor', name: 'Code Editor', icon: 'Code', windowProps: { width: 720, height: 520, minWidth: 500, minHeight: 380 }, component: CodeEditorApp },
  solitaire: { id: 'solitaire', name: 'Solitaire', icon: 'Grid', windowProps: { width: 520, height: 420, minWidth: 420, minHeight: 340 }, component: SolitaireGame },
  sudoku: { id: 'sudoku', name: 'Sudoku', icon: 'Grid', windowProps: { width: 420, height: 580, minWidth: 360, minHeight: 480 }, component: SudokuGame },
  chess: { id: 'chess', name: 'Chess', icon: 'Grid', windowProps: { width: 420, height: 540, minWidth: 360, minHeight: 460 }, component: ChessGame },
  taskManager: { id: 'taskManager', name: 'Task Manager', icon: 'Activity', windowProps: { width: 580, height: 400, minWidth: 450, minHeight: 320 }, component: TaskManagerApp },
  jsonFormatter: { id: 'jsonFormatter', name: 'JSON Formatter', icon: 'Braces', windowProps: { width: 720, height: 480, minWidth: 550, minHeight: 350 }, component: JsonFormatterApp },
  regexTester: { id: 'regexTester', name: 'Regex Tester', icon: 'Type', windowProps: { width: 720, height: 440, minWidth: 550, minHeight: 340 }, component: RegexTesterApp },
  passwordGenerator: { id: 'passwordGenerator', name: 'Password Generator', icon: 'Key', windowProps: { width: 440, height: 480, minWidth: 360, minHeight: 380 }, component: PasswordGeneratorApp },
  imageViewer: { id: 'imageViewer', name: 'Image Viewer', icon: 'Image', windowProps: { width: 640, height: 480, minWidth: 450, minHeight: 340 }, component: ImageViewerApp },
  baseConverter: { id: 'baseConverter', name: 'Base Converter', icon: 'Hash', windowProps: { width: 520, height: 380, minWidth: 420, minHeight: 300 }, component: BaseConverterApp },
  markdownPreview: { id: 'markdownPreview', name: 'Markdown Preview', icon: 'FileText', windowProps: { width: 720, height: 480, minWidth: 550, minHeight: 350 }, component: MarkdownPreviewApp },
}

export function registerApp(app: AppDefinition) {
  appRegistry[app.id] = { ...appRegistry[app.id], ...app }
}

export function getApp(appId: string): AppDefinition | undefined {
  return appRegistry[appId]
}

export function getAllApps(): AppDefinition[] {
  return Object.values(appRegistry)
}

export const desktopIcons: Array<{ appId: string; label: string; icon: string }> = [
  { appId: 'fileManager', label: 'File Manager', icon: 'Folder' },
  { appId: 'terminal', label: 'Terminal', icon: 'Terminal' },
  { appId: 'calculator', label: 'Calculator', icon: 'Calculator' },
  { appId: 'codeEditor', label: 'Code Editor', icon: 'Code' },
  { appId: 'taskManager', label: 'Task Manager', icon: 'Activity' },
  { appId: 'jsonFormatter', label: 'JSON Formatter', icon: 'Braces' },
  { appId: 'regexTester', label: 'Regex Tester', icon: 'Type' },
  { appId: 'passwordGenerator', label: 'Password Generator', icon: 'Key' },
  { appId: 'imageViewer', label: 'Image Viewer', icon: 'Image' },
  { appId: 'baseConverter', label: 'Base Converter', icon: 'Hash' },
  { appId: 'markdownPreview', label: 'Markdown Preview', icon: 'FileText' },
]

export const gameIcons: Array<{ appId: string; label: string; icon: string }> = [
  { appId: 'minesweeper', label: 'Minesweeper', icon: 'Grid' },
  { appId: 'game2048', label: '2048', icon: 'Grid' },
  { appId: 'snake', label: 'Snake', icon: 'Zap' },
  { appId: 'tetris', label: 'Tetris', icon: 'Grid' },
  { appId: 'solitaire', label: 'Solitaire', icon: 'Grid' },
  { appId: 'sudoku', label: 'Sudoku', icon: 'Grid' },
  { appId: 'chess', label: 'Chess', icon: 'Grid' },
]
