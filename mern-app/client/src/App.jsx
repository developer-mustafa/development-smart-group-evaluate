import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import Members from './pages/Members';
import Tasks from './pages/Tasks';
import Evaluations from './pages/Evaluations';
import Ranking from './pages/Ranking';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import StudentFilter from './pages/StudentFilter';
import Analysis from './pages/Analysis';
import PlaceholderPage from './pages/PlaceholderPage';
import StudentsDirectory from './pages/StudentsDirectory';
import Assignments from './pages/Assignments';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="groups" element={<Groups />} />
              <Route path="members" element={<Members />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="evaluations" element={<ProtectedRoute requireAdmin><Evaluations /></ProtectedRoute>} />
              <Route path="ranking" element={<Ranking />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="student-filter" element={<StudentFilter />} />
              
              {/* Analysis Routes */}
              <Route path="analysis" element={<Analysis />} />
              <Route path="group-analysis" element={<Analysis />} />
              <Route path="graph-analysis" element={<Analysis />} />
              
              {/* Placeholder Routes for Missing Pages */}
              <Route path="assignments" element={<Assignments />} />
              <Route path="upcoming-assignments" element={<Navigate to="/assignments" replace />} />
              <Route path="students" element={<StudentsDirectory />} />
              <Route path="group-policy" element={
                <PlaceholderPage 
                  title="গ্রুপ পলিসি" 
                  icon="fas fa-book" 
                  description="গ্রুপ পরিচালনার নীতিমালা শীঘ্রই এখানে দেখা যাবে।" 
                />
              } />
              <Route path="export" element={
                <PlaceholderPage 
                  title="এক্সপোর্ট" 
                  icon="fas fa-file-export" 
                  description="ডাটা এক্সপোর্ট করার সুবিধা শীঘ্রই চালু হবে।" 
                />
              } />
              <Route path="admin-management" element={
                <ProtectedRoute requireAdmin>
                  <PlaceholderPage 
                    title="অ্যাডমিন ম্যানেজমেন্ট" 
                    icon="fas fa-user-shield" 
                    description="অ্যাডমিন এবং অনুমতি ব্যবস্থাপনা শীঘ্রই এখানে যুক্ত করা হবে।" 
                  />
                </ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
