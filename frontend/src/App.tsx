import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { ProfileProvider } from './context/ProfileContext';
import { ProgressProvider } from './context/ProgressContext';
import { AuthProvider } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { ExplorePage } from './pages/ExplorePage';
import { QuestionsPage } from './pages/QuestionsPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { QuizPage } from './pages/QuizPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { RevisionPage } from './pages/RevisionPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SocialCallbackPage } from './pages/SocialCallbackPage';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ProfileProvider>
          <ProgressProvider>
            {/* AuthProvider depends on ProfileProvider (it hydrates the candidate
                profile on sign-in), so it must be nested inside it. */}
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public auth routes sit outside the AppShell layout so they
                      render full-screen without the sidebar and top bar. */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/auth/social/callback" element={<SocialCallbackPage />} />

                  <Route
                    element={
                      <ProtectedRoute>
                        <AppShell onOpenOnboarding={() => setOnboardingOpen(true)} />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/roadmap" element={<RoadmapPage />} />
                    <Route path="/explore" element={<ExplorePage />} />
                    <Route path="/questions" element={<QuestionsPage />} />
                    <Route path="/questions/:id" element={<QuestionDetailPage />} />
                    <Route path="/playground" element={<PlaygroundPage />} />
                    <Route path="/quizzes" element={<QuizPage />} />
                    <Route path="/mock-interview" element={<MockInterviewPage />} />
                    <Route path="/revision" element={<RevisionPage />} />
                    {/* Content Studio is restricted to admin accounts. */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireRole="admin">
                          <AdminPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>

                <OnboardingModal isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
              </BrowserRouter>
            </AuthProvider>
          </ProgressProvider>
        </ProfileProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
