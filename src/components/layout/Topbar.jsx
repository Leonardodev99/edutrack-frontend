import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Topbar.css';

export default function Topbar() {
  const usuarioAtual = "Administrador";
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logout...");
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-content">
        <div className="topbar-spacer" />
        <div className="topbar-actions">
          <button
            className="topbar-user topbar-user-btn"
            onClick={() => navigate('/admin/perfil')}
            title="Ver perfil"
          >
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <div className="user-name">{usuarioAtual}</div>
              <div className="user-role">Admin</div>
            </div>
          </button>
          <button className="topbar-btn logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
