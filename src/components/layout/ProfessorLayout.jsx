import { Outlet } from 'react-router-dom';
import ProfessorSidebar from './ProfessorSidebar.jsx';
import ProfessorTopbar from './ProfessorTopbar.jsx';
import '../../styles/AdminLayout.css';

export default function ProfessorLayout() {
  return (
    <div className="app-shell">
      <ProfessorSidebar />
      <div className="main-area">
        <ProfessorTopbar />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
