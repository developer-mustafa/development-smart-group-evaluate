import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
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

export default function App() {
  return (
    <Provider store={store}>
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
            <Route path="analysis" element={<Analysis />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
