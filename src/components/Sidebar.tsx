import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { 
  UserCheck, 
  FolderOpen,
  Menu
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'

interface SidebarProps {
  className?: string
}

const Sidebar = ({ className }: SidebarProps) => {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    {
      title: '지원 관리',
      href: '/apply',
      icon: UserCheck,
      description: '지원자 관리 및 설정'
    },
    {
      title: '프로젝트 관리',
      href: '/projects',
      icon: FolderOpen,
      description: '프로젝트 목록 및 편집'
    }
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4 lg:h-16 lg:px-6">
        <div className="flex items-center space-x-2">
          <img src="/unis_symbol.svg" alt="UNIS Symbol" className="h-6 w-6 lg:h-8 lg:w-8 rounded-lg" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold lg:text-base">UNIS 어드민</span>
            <span className="text-xs text-muted-foreground">관리자 패널</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  active && "bg-accent text-accent-foreground font-medium"
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-background md:flex", className)}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed left-4 top-4 z-50 rounded-md p-1 bg-background border shadow-sm md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

export default Sidebar