import { Outlet } from 'react-router-dom';
import EncarregadoSidebar from './EncarregadoSidebar.jsx';
import EncarregadoTopbar from './EncarregadoTopbar.jsx';
import '../../styles/AdminLayout.css'; // Mantém a consistência da casca (shell) da aplicação

export default function EncarregadoLayout() {
  return (
    <div className="app-shell">
      <EncarregadoSidebar />
      <div className="main-area">
        <EncarregadoTopbar />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}