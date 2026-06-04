import { UserCheck, FileSpreadsheet, TrendingUp, AlertTriangle, BookOpen, Clock } from 'lucide-react';
import '../../styles/DashboardEncarregado.css';

export default function DashboardEncarregado() {
  // Resumo de dados pedagógicos do educando (Lucas Silva)
  const resumoMétricas = {
    presencaGlobal: "94.2%",
    faltasAtuais: 2,
    mediaGeral: "16.8 / 20",
    desempenhoStatus: "Excelente",
  };

  const ultimasPresencas = [
    { id: 1, data: "2026-05-26", disciplina: "Junior Game Development", status: "Presente", obs: "" },
    { id: 2, data: "2026-05-25", disciplina: "Digital Sciences", status: "Presente", obs: "Chegou 5 min atrasado" },
    { id: 3, data: "2026-05-22", disciplina: "Junior Game Development", status: "Ausente", obs: "Falta Justificada" },
  ];

  const notasRecentes = [
    { id: 1, disciplina: "Junior Game Development", avaliacao: "Projeto Prático 1", nota: 18.5 },
    { id: 2, disciplina: "Digital Sciences", avaliacao: "Teste Teórico 1", nota: 15.0 },
  ];

  return (
    <div className="dashboard-encarregado-container">
      <div className="dashboard-header-welcome">
        <h1>Olá, Carlos Silva</h1>
        <p>Aqui está o acompanhamento acadêmico em tempo real do seu educando, <strong>Lucas Silva</strong>.</p>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="metrics-summary-grid">
        <div className="metric-card-box">
          <div className="metric-card-header">
            <span className="metric-card-title">Assiduidade / Presenças</span>
            <UserCheck className="icon-metric text-success" size={20} />
          </div>
          <div className="metric-card-body">
            <h3>{resumoMétricas.presencaGlobal}</h3>
            <p className="metric-card-sub">{resumoMétricas.faltasAtuais} faltas registradas</p>
          </div>
        </div>

        <div className="metric-card-box">
          <div className="metric-card-header">
            <span className="metric-card-title">Média Global</span>
            <FileSpreadsheet className="icon-metric text-primary" size={20} />
          </div>
          <div className="metric-card-body">
            <h3>{resumoMétricas.mediaGeral}</h3>
            <p className="metric-card-sub">Base: Escala de 0 a 20 valores</p>
          </div>
        </div>

        <div className="metric-card-box">
          <div className="metric-card-header">
            <span className="metric-card-title">Status de Desempenho</span>
            <TrendingUp className="icon-metric text-warning" size={20} />
          </div>
          <div className="metric-card-body">
            <h3>{resumoMétricas.desempenhoStatus}</h3>
            <p className="metric-card-sub">Crescimento de 4% este mês</p>
          </div>
        </div>
      </div>

      {/* Grid Duplo: Esquerda Comparência, Direita Notas */}
      <div className="dashboard-sections-split-grid">
        
        {/* Bloco de Comparência Recente */}
        <div className="dashboard-content-card">
          <div className="card-section-header">
            <div className="title-with-icon">
              <Clock size={18} />
              <h2>Últimas Chamadas de Presença</h2>
            </div>
            <a href="/encarregado/presencas" className="view-more-link">Ver histórico completo</a>
          </div>
          
          <div className="list-items-panel">
            {ultimasPresencas.map((pres) => (
              <div key={pres.id} className="list-item-row">
                <div className="item-main-info">
                  <span className="item-title">{pres.disciplina}</span>
                  <span className="item-subtitle">{new Date(pres.data).toLocaleDateString("pt-BR")}</span>
                  {pres.obs && <span className="item-observation">⚠️ {pres.obs}</span>}
                </div>
                <span className={`status-badge-presence ${pres.status.toLowerCase()}`}>
                  {pres.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bloco de Boletim de Notas Recentes */}
        <div className="dashboard-content-card">
          <div className="card-section-header">
            <div className="title-with-icon">
              <BookOpen size={18} />
              <h2>Avaliações & Notas Recentes</h2>
            </div>
            <a href="/encarregado/boletim" className="view-more-link">Consultar Boletim</a>
          </div>

          <div className="list-items-panel">
            {notasRecentes.map((nota) => (
              <div key={nota.id} className="list-item-row">
                <div className="item-main-info">
                  <span className="item-title">{nota.disciplina}</span>
                  <span className="item-subtitle">{nota.avaliacao}</span>
                </div>
                <div className="grade-badge-display">
                  <span className="grade-value">{nota.nota.toFixed(1)}</span>
                  <span className="grade-max">/20</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}