import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserCheck, FolderOpen, Menu, type LucideIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

// --- Refactor 1: 네비게이션 데이터를 컴포넌트 외부로 분리 ---
interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

const navItems: NavItem[] = [
  {
    title: '지원 관리',
    href: '/apply',
    icon: UserCheck,
    description: '지원자 관리 및 설정',
  },
  {
    title: '프로젝트 관리',
    href: '/projects',
    icon: FolderOpen,
    description: '프로젝트 목록 및 편집',
  },
];

// --- Refactor 2: 재사용 및 가독성을 위해 내부 컴포넌트 분리 ---

const SidebarHeader = () => (
  <div className="flex h-16 items-center border-b px-6">
    <div className="flex items-center gap-3">
      {/* --- ✅ 심볼 크기 조정 --- */}
      <img src="/unis_symbol.svg" alt="UNIS Symbol" className="h-5 w-5 lg:h-6 lg:w-6" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold">UNIS 어드민</span>
        <span className="text-xs text-muted-foreground">관리자 패널</span>
      </div>
    </div>
  </div>
);

const SidebarNav = ({ onLinkClick }: { onLinkClick: () => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="flex-1 space-y-2 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onLinkClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
              active && 'bg-accent text-accent-foreground font-medium'
            )}
          >
            <Icon className="h-4 w-4" />
            <div className="flex flex-col">
              <span>{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.description}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

// --- 메인 컴포넌트 ---
interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [open, setOpen] = useState(false);
  const closeSheet = () => setOpen(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-background">
      <SidebarHeader />
      <SidebarNav onLinkClick={closeSheet} />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn('fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r md:flex', className)}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed left-4 top-4 z-20 rounded-md p-2 bg-background/50 backdrop-blur-sm border shadow-sm md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 border-r">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
