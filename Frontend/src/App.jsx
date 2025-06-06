import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotificationPage from './pages/NotificationPage.jsx'
import CallPage from './pages/CallPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import OnboardingPage from "./pages/OnboardingPage.jsx"
import { Toaster } from 'react-hot-toast'
import PageLoader from './components/PageLoader.jsx'
import useAuthUser from './hooks/useAuthUser.js'
import Layout from './components/Layout.jsx'
import { useThemeStore } from './store/useThemeStore.js'

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  const { theme } = useThemeStore();

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div data-theme={theme}>
      <Routes>
        <Route path="/" element={isAuthenticated && isOnboarded ? (
          <Layout showSidebar={true}>
            <HomePage />
          </Layout>
        ) : (
          <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
        )} />

        <Route path="/signup" element={!isAuthenticated ? < SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />} />

        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />} />

        <Route path="/onboarding"
          element={isAuthenticated ? (
            isOnboarded ? <Navigate to="/" /> : <OnboardingPage />
          ) : (
            <Navigate to="/login" />
          )} />

        <Route path="/notifications" element={isAuthenticated && isOnboarded ? (
          <Layout showSidebar={true}>
            <NotificationPage />
          </Layout>
        ) : (
          <Navigate to={isAuthenticated ? "/onboarding" : "/login"} />
        )
        } />

        <Route path="/call/:id" element={isAuthenticated && isOnboarded ? <CallPage /> :
          <Navigate to={isAuthenticated ? '/onboarding' : '/login'}
          />}
        />

        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

      </Routes>

      <Toaster />

    </div>
  )
}

export default App