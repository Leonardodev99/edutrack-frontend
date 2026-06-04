import { Link } from 'react-router-dom';
import { UserSquare2, Users, GraduationCap, School,Clock, ArrowRight } from 'lucide-react';
import StatCard from '../../components/layout/StatCard.jsx'
import {
  professoresStore,
  encarregadosStore,
  alunosStore,
  turmasStore,
} from '../../utils/adminMockData.js';
import '../../styles/DashboardAdmin.css';


export default function DashboardAdmin() {
  const professores = professoresStore.list();
  const encarregados = encarregadosStore.list();
  const alunos = alunosStore.list();
  const turmas = turmasStore.list();
  
  const semTurma = alunos.filter((a) => !a.turmaId).length;

  const atalhos = [
    { label: "Listar Alunos", to: "/admin/alunos", icon: GraduationCap },
    { label: "Listar Professores", to: "/admin/professores", icon: UserSquare2 },
    { label: "Listar Encarregados", to: "/admin/encarregados", icon: Users },
    { label: "Listar Turmas", to: "/admin/turmas", icon: School },
    { label: "Listar Horários", to: "/admin/horarios", icon: Clock },
  ];

  return (
    <div className="dashboard-admin">
      <div className="page-header">
        <h1 className="page-title">Painel de Administração</h1>
        <p className="page-subtitle">
          Visão geral dos utilizadores e turmas da escola.
        </p>
      </div>

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
          hint="Ano letivo 2024/2025"
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
            {turmas.map((t) => (
              <div key={t.id} className="turma-item">
                <div>
                  <div className="turma-nome">{t.nome}</div>
                  <div className="turma-meta">
                    Sala {t.sala} · {t.anoLetivo}
                  </div>
                </div>
                <span className="badge badge-primary">
                  {t.alunos.length} aluno{t.alunos.length === 1 ? "" : "s"}
                </span>
              </div>
            ))}
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