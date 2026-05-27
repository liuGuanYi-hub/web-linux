// 终端应用入口 - 注册到 AppRegistry
import { registerApp } from '@/system/AppRegistry'
import { TerminalApp } from './index'

registerApp({
  id: 'terminal',
  name: 'Terminal',
  icon: 'Terminal',
  windowProps: { width: 800, height: 500, minWidth: 400, minHeight: 300 },
  component: TerminalApp,
})

export { TerminalApp }