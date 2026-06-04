import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import Topbar from './Topbar.jsx';
import '../../styles/AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <AdminSidebar />
      <div className="main-area">
        <Topbar />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}