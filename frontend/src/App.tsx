import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import LandingPage from "./pages/LandingPage"
import DashboardPage from "./pages/DashboardPage"
import FamilyTreeCanvasPage from "./pages/FamilyTreeCanvasPage"
import FamilyMembersListPage from "./pages/FamilyMembersListPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import JoinTreePage from "./pages/JoinTreePage"
import ProfilePage from "./pages/ProfilePage"
import { ProtectedRoute } from "./app/routes/ProtectedRoute"
import { GlobalModal } from "./components/layout/GlobalModal"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GlobalModal />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/join" element={<JoinTreePage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/family/:familyId" element={<ProtectedRoute><FamilyTreeCanvasPage /></ProtectedRoute>} />
          <Route path="/family/:familyId/members" element={<ProtectedRoute><FamilyMembersListPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
