import {
  Activity,
  AppWindow,
  Braces,
  Calculator,
  Calendar,
  Clock,
  Code,
  FileText,
  Folder,
  Grid3X3,
  Hash,
  Image,
  Key,
  Power,
  Search,
  Settings,
  StickyNote,
  Terminal,
  TerminalSquare,
  Type,
  Zap,
  type LucideIcon,
} from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  Activity,
  AppWindow,
  Braces,
  Calculator,
  Calendar,
  Clock,
  Code,
  FileText,
  Folder,
  Grid: Grid3X3,
  Hash,
  Image,
  Key,
  Power,
  Search,
  Settings,
  StickyNote,
  Terminal,
  TerminalSquare,
  Type,
  Zap,
}

interface AppIconProps {
  icon?: string
  size?: number
  color?: string
}

export function AppIcon({ icon, size = 20, color = 'currentColor' }: AppIconProps) {
  const Icon = icon ? icons[icon] || icons[icon.charAt(0).toUpperCase() + icon.slice(1)] : undefined
  const ResolvedIcon = Icon || AppWindow

  return <ResolvedIcon size={size} color={color} strokeWidth={1.8} aria-hidden="true" />
}
