import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WindowState {
  id: string
  appId: string
  title: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  zIndex: number
  isMinimized: boolean
  isMaximized: boolean
  prevBounds?: { x: number; y: number; width: number; height: number }
}

interface WindowStore {
  windows: WindowState[]
  activeId: string | null
  zIndexCounter: number

  createWindow: (appId: string, props: Partial<WindowState>) => string
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  updatePosition: (id: string, x: number, y: number) => void
  updateSize: (id: string, width: number, height: number) => void
  setWindows: (windows: WindowState[]) => void
  setActiveId: (id: string | null) => void
}

export const useWindowStore = create<WindowStore>()(
  persist(
    (set, get) => ({
      windows: [],
      activeId: null,
      zIndexCounter: 100,

      createWindow: (appId, props) => {
        const id = `${appId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const zIndexCounter = get().zIndexCounter + 1

        const newWindow: WindowState = {
          id,
          appId,
          title: props.title || 'Window',
          icon: props.icon || 'AppWindow',
          x: props.x ?? 100 + Math.random() * 50,
          y: props.y ?? 80 + Math.random() * 30,
          width: props.width ?? 600,
          height: props.height ?? 400,
          minWidth: props.minWidth ?? 300,
          minHeight: props.minHeight ?? 200,
          zIndex: zIndexCounter,
          isMinimized: false,
          isMaximized: false,
          ...props,
        }

        set(state => ({
          windows: [...state.windows, newWindow],
          activeId: id,
          zIndexCounter,
        }))

        return id
      },

      closeWindow: (id) => {
        set(state => {
          const windows = state.windows.filter(w => w.id !== id)
          let activeId = state.activeId
          if (activeId === id) {
            const sorted = [...windows].filter(w => !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)
            activeId = sorted.length > 0 ? sorted[0].id : null
          }
          return { windows, activeId }
        })
      },

      focusWindow: (id) => {
        set(state => {
          const zIndexCounter = state.zIndexCounter + 1
          return {
            activeId: id,
            zIndexCounter,
            windows: state.windows.map(w =>
              w.id === id ? { ...w, zIndex: zIndexCounter, isMinimized: false } : w
            ),
          }
        })
      },

      minimizeWindow: (id) => {
        set(state => {
          const others = state.windows.filter(w => w.id !== id && !w.isMinimized)
          const sorted = [...others].sort((a, b) => b.zIndex - a.zIndex)
          const activeId = sorted.length > 0 ? sorted[0].id : null

          return {
            windows: state.windows.map(w =>
              w.id === id ? { ...w, isMinimized: true } : w
            ),
            activeId,
          }
        })
      },

      toggleMaximize: (id) => {
        set(state => ({
          windows: state.windows.map(w => {
            if (w.id !== id) return w
            if (w.isMaximized) {
              return {
                ...w,
                isMaximized: false,
                x: w.prevBounds?.x ?? w.x,
                y: w.prevBounds?.y ?? w.y,
                width: w.prevBounds?.width ?? w.width,
                height: w.prevBounds?.height ?? w.height,
              }
            }

            return {
              ...w,
              isMaximized: true,
              prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
              x: 0,
              y: 0,
              width: window.innerWidth,
              height: window.innerHeight - 48,
            }
          }),
        }))
      },

      updatePosition: (id, x, y) => {
        set(state => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, x, y } : w
          ),
        }))
      },

      updateSize: (id, width, height) => {
        set(state => ({
          windows: state.windows.map(w =>
            w.id === id ? { ...w, width, height } : w
          ),
        }))
      },

      setWindows: (windows) => set({ windows }),
      setActiveId: (activeId) => set({ activeId }),
    }),
    {
      name: 'window-store',
      partialize: (state) => ({
        windows: state.windows,
        activeId: state.activeId,
        zIndexCounter: state.zIndexCounter,
      }),
    }
  )
)
