import React from 'react'
import Sidebar from './Sidebar'

interface LayoutProps {
  title: string
  children: React.ReactNode
}

const Layout = ({ title, children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className="md:ml-64 min-h-screen pt-8">
        {/* 모바일 상단 여백 (햄버거 메뉴를 위한 공간) */}
        <div className="pt-12 md:pt-0 p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-6">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}
export default Layout