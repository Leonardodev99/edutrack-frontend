import { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // Instância do Axios
import '../../styles/Topbar.css';

export default function EncarregadoTopbar() {
  const [nomeEncarregado, setNomeEncarregado] = useState("Carregando...");
  const [nomeEducando, setNomeEducando] = useState("Nenhum vinculado");
  const navigate = useNavigate();

  useEffect(() => {
  async function obterDadosIdentificacao() {
    try {
      const token = localStorage.getItem("@EduTrack:token");
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Busca os dados do usuário conectado (Nome do Encarregado)
      const responseUser = await api.get("/users/me", { headers });
      setNomeEncarregado(responseUser.data.nome);

      // 2. Busca DIRETAMENTE o perfil do encarregado logado
      // Alterado de "/guardians" para "/guardians/me"
      const responseGuardianMe = await api.get("/guardians/me", { headers });
      const meuPerfilGuardian = responseGuardianMe.data;

      if (meuPerfilGuardian && meuPerfilGuardian.students?.length > 0) {
        // Exibe o primeiro educando associado na barra superior
        const primeiroEstudante = meuPerfilGuardian.students[0];
        setNomeEducando(primeiroEstudante.user?.nome || "Estudante");
      }
    } catch (error) {
      console.error("Erro ao carregar dados na Topbar:", error);
      setNomeEncarregado("Encarregado");
    }
  }

  obterDadosIdentificacao();
}, []);

  const handleLogout = () => {
    localStorage.removeItem("@EduTrack:token");
    localStorage.removeItem("@EduTrack:user");
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-content">
        {/* Lado esquerdo: Identificador do Educando Ativo */}
        <div className="topbar-student-badge">
          <span className="student-badge-label">Educando:</span>
          <span className="student-badge-name">{nomeEducando}</span>
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
              <div className="user-name">{nomeEncarregado}</div>
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