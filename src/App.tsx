import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthInterceptor from '@/hooks/useAuthInterceptor';
import Login from '@/pages/Login'
import ProjectList from '@/pages/ProjectList'
import AddProject from '@/pages/AddProject'
import EditProject from '@/pages/EditProject'
import Apply from '@/pages/Apply'

interface PrivateRouteProps {
  children: JSX.Element
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const isAuthenticated = localStorage.getItem('accessToken')
  return isAuthenticated ? children : <Navigate to="/" />
}

const App = () => {
  useAuthInterceptor();
  useEffect(() => {
    // 글로벌 에러 핸들링: JS 에러 발생 시 로그인으로 이동
    window.onerror = () => {
      window.location.href = '/'
      return true
    }

    window.onunhandledrejection = () => {
      window.location.href = '/'
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <ProjectList />
          </PrivateRoute>
        }
      />
      <Route
        path="/addProject"
        element={
          <PrivateRoute>
            <AddProject />
          </PrivateRoute>
        }
      />
      <Route
        path="/editProject/:projectId"
        element={
          <PrivateRoute>
            <EditProject />
          </PrivateRoute>
        }
      />
      <Route
        path="/apply"
        element={
          <PrivateRoute>
            <Apply />
          </PrivateRoute>
        }
      />
      {/* 잘못된 경로 접근 시에도 로그인 페이지로 이동 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
