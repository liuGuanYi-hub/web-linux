import { useWindowStore } from '@/stores/windowStore'
import { getApp } from './AppRegistry'

export function openApp(appId: string) {
  const app = getApp(appId)
  if (!app) {
    console.warn(`App ${appId} not found`)
    return
  }

  const store = useWindowStore.getState()
  const windowId = store.createWindow(appId, {
    title: app.name,
    icon: app.icon,
    width: app.windowProps.width,
    height: app.windowProps.height,
    minWidth: app.windowProps.minWidth,
    minHeight: app.windowProps.minHeight,
  })

  return windowId
}