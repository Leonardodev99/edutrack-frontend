import { LogOut, User, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Topbar.css'; // Reutiliza a estrutura de estilos base da Topbar

export default function EncarregadoTopbar() {
  const usuarioAtual = "Carlos Silva"; // Encarregado
  const educando = "Lucas Silva"; // Aluno associado
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-content">
        {/* Lado esquerdo: Identificador do Educando Ativo */}
        <div className="topbar-student-badge">
          <span className="student-badge-label">Educando:</span>
          <span className="student-badge-name">{educando}</span>
        </div>
        
        <div className="topbar-spacer" />
        
        {/* Lado direito: Perfil do Encarregado e Saída */}
        <div className="topbar-actions">
          <button
            className="topbar-user topbar-user-btn"
            onClick={() => navigate('/encarregado/perfil')}
            title="Ver perfil"
          >
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <div className="user-name">{usuarioAtual}</div>
              <div className="user-role">Encarregado</div>
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