import { Routes, Route, Navigate } from 'react-router-dom'

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

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
