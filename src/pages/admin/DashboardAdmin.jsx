import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserSquare2, Users, GraduationCap, School, Clock, ArrowRight, Loader } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/layout/StatCard.jsx'
import '../../styles/DashboardAdmin.css';


export default function DashboardAdmin() {
  const [professores, setProfessores] = useState([]);
  const [encarregados, setEncarregados] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const atalhos = [
    { label: "Listar Alunos", to: "/admin/alunos", icon: GraduationCap },
    { label: "Listar Professores", to: "/admin/professores", icon: UserSquare2 },
    { label: "Listar Encarregados", to: "/admin/encarregados", icon: Users },
    { label: "Listar Turmas", to: "/admin/turmas", icon: School },
    { label: "Listar Horários", to: "/admin/horarios", icon: Clock },
  ];

  // Buscar todos os dados necessários
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    setErro("");
    try {
      const token = localStorage.getItem("@EduTrack:token");
      const headers = { Authorization: `Bearer ${token}` };

      // Buscar todos os dados em paralelo
      const [profRes, encRes, aluRes, turRes] = await Promise.all([
        api.get("/teachers", { headers }),
        api.get("/guardians", { headers }),
        api.get("/students", { headers }),
        api.get("/classes", { headers }),
      ]);

      setProfessores(profRes.data || []);
      setEncarregados(encRes.data || []);
      setAlunos(aluRes.data || []);
      setTurmas(turRes.data || []);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar dados do painel.";
      setErro(msg);
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Calcular alunos sem turma
  const semTurma = alunos.filter((a) => !a.class_id).length;

  if (carregando) {
    return (
      <div className="dashboard-admin">
        <div className="loading-state">
          <Loader size={48} className="spinner" />
          <p>A carregar painel de administração...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-admin">
      <div className="page-header">
        <h1 className="page-title">Painel de Administração</h1>
        <p className="page-subtitle">
          Visão geral dos utilizadores e turmas da escola.
        </p>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="grid grid-4">
        <StatCard
          icon={UserSquare2}
          label="Professores"
          value={professores.length}
          hint="Corpo docente ativo"
          tone="primary"
        />
        <StatCard
          icon={Users}
          label="Encarregados"
          value={encarregados.length}
          hint="Contas de encarregados"
          tone="primary"
        />
        <StatCard
          icon={GraduationCap}
          label="Alunos"
          value={alunos.length}
          hint={`${semTurma} sem turma`}
          tone={semTurma > 0 ? "danger" : "success"}
        />
        <StatCard
          icon={School}
          label="Turmas"
          value={turmas.length}
          hint="Total de turmas ativas"
          tone="success"
        />
      </div>

      <div className="grid grid-2 mt-6">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Distribuição por turma</div>
              <div className="card-subtitle">
                Alunos matriculados em cada turma
              </div>
            </div>
            <Link to="/admin/turmas" className="link-icon">
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="turmas-list">
            {turmas.length > 0 ? (
              turmas.map((t) => {
                const totalAlunos = t.students?.length || 0;
                return (
                  <div key={t.id} className="turma-item">
                    <div>
                      <div className="turma-nome">{t.nome}</div>
                      <div className="turma-meta">
                        {t.ano_letivo}
                      </div>
                    </div>
                    <span className="badge badge-primary">
                      {totalAlunos} aluno{totalAlunos === 1 ? "" : "s"}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="empty-state-small">
                <p>Nenhuma turma registada</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Atalhos rápidos</div>
              <div className="card-subtitle">Operações frequentes</div>
            </div>
          </div>

          <div className="atalhos-grid">
            {atalhos.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="btn btn-outline atalho-btn"
                title={a.label}
              >
                <a.icon size={16} />
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
