import { useState, useMemo } from "react";
import { UserCheck, Calendar, Filter, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import "../../styles/ComparenciaEducando.css";

export default function ComparenciaEducando() {
  // Estado para os filtros de busca
  const [filtroDisciplina, setFiltroDisciplina] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  // Mock de dados de presenças do educando (Lucas Silva) correspondente aos registros do banco
  const historicoPresencas = [
    { id: "p-101", data_aula: "2026-05-26", disciplina: "Junior Game Development", presente: true, teacher: "Prof. Ana Sousa", observacao: "" },
    { id: "p-102", data_aula: "2026-05-25", disciplina: "Digital Sciences", presente: true, teacher: "Prof. Mário Tavares", observacao: "Chegou 5 minutos atrasado." },
    { id: "p-103", data_aula: "2026-05-22", disciplina: "Junior Game Development", presente: false, teacher: "Prof. Ana Sousa", observacao: "Falta Justificada (Atestado Médico)." },
    { id: "p-104", data_aula: "2026-05-19", disciplina: "Junior Game Development", presente: true, teacher: "Prof. Ana Sousa", observacao: "Excelente participação em sala." },
    { id: "p-105", data_aula: "2026-05-18", disciplina: "Digital Sciences", presente: true, teacher: "Prof. Mário Tavares", observacao: "" },
    { id: "p-106", data_aula: "2026-05-15", disciplina: "Junior Game Development", presente: false, teacher: "Prof. Ana Sousa", observacao: "Falta Injustificada." },
  ];

  // Cálculo Dinâmico de Métricas baseado no histórico
  const metricasAproveitamento = useMemo(() => {
    const totalAulas = historicoPresencas.length;
    const totalPresencas = historicoPresencas.filter(p => p.presente).length;
    const totalFaltas = totalAulas - totalPresencas;
    const taxaAssiduidade = totalAulas > 0 ? ((totalPresencas / totalAulas) * 100).toFixed(1) : "100";

    return { totalAulas, totalPresencas, totalFaltas, taxaAssiduidade };
  }, []);

  // Filtragem da lista em tempo real
  const dadosFiltrados = useMemo(() => {
    return historicoPresencas.filter((registro) => {
      const matchDisciplina = filtroDisciplina === "todos" || registro.disciplina === filtroDisciplina;
      
      let matchStatus = true;
      if (filtroStatus === "presente") matchStatus = registro.presente === true;
      if (filtroStatus === "ausente") matchStatus = registro.presente === false;

      return matchDisciplina && matchStatus;
    });
  }, [filtroDisciplina, filtroStatus]);

  return (
    <div className="comparencia-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Livro de Comparência</h1>
          <p className="page-subtitle">Acompanhe a assiduidade, pontualidade e justificativas do seu educando.</p>
        </div>
      </div>

      {/* Painel Executivo de Assiduidade */}
      <div className="assiduidade-summary-panel">
        <div className="summary-stat-box">
          <div className="stat-icon-wrapper success">
            <CheckCircle size={22} />
          </div>
          <div>
            <span className="stat-label">Aulas Assistidas</span>
            <h3 className="stat-value">{metricasAproveitamento.totalPresencas}</h3>
          </div>
        </div>

        <div className="summary-stat-box">
          <div className="stat-icon-wrapper danger">
            <XCircle size={22} />
          </div>
          <div>
            <span className="stat-label">Total de Faltas</span>
            <h3 className="stat-value">{metricasAproveitamento.totalFaltas}</h3>
          </div>
        </div>

        <div className="summary-stat-box highlight-rate">
          <div className="stat-icon-wrapper primary">
            <UserCheck size={22} />
          </div>
          <div>
            <span className="stat-label">Taxa de Presença Geral</span>
            <h3 className="stat-value">{metricasAproveitamento.taxaAssiduidade}%</h3>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="filters-container-box">
        <div className="filter-title">
          <Filter size={16} />
          <span>Filtrar Registros:</span>
        </div>
        
        <div className="filter-inputs-row">
          <div className="select-wrapper">
            <select 
              value={filtroDisciplina} 
              onChange={(e) => setFiltroDisciplina(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todas as disciplinas</option>
              <option value="Junior Game Development">Junior Game Development</option>
              <option value="Digital Sciences">Digital Sciences</option>
            </select>
          </div>

          <div className="select-wrapper">
            <select 
              value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos os status</option>
              <option value="presente">Presenças</option>
              <option value="ausente">Ausências / Faltas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listagem / Tabela de Comparências */}
      {dadosFiltrados.length === 0 ? (
        <div className="empty-state-card">
          <AlertCircle size={32} />
          <p>Nenhum registro de chamada corresponde aos filtros aplicados.</p>
        </div>
      ) : (
        <div className="table-presencas-wrapper">
          <table className="table-presencas">
            <thead>
              <tr>
                <th>Data da Aula</th>
                <th>Disciplina</th>
                <th>Professor Responsável</th>
                <th className="text-center">Presença</th>
                <th>Observações Pedagógicas</th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.map((registro) => (
                <tr key={registro.id} className={!registro.presente ? "row-student-absent" : ""}>
                  <td className="font-medium">
                    <div className="date-cell-container">
                      <Calendar size={14} />
                      {new Date(registro.data_aula).toLocaleDateString("pt-BR")}
                    </div>
                  </td>
                  <td>
                    <span className="discipline-name-cell">{registro.disciplina}</span>
                  </td>
                  <td>
                    <span className="teacher-name-cell">{registro.teacher}</span>
                  </td>
                  <td className="text-center">
                    <span className={`badge-presence-status ${registro.presente ? "is-present" : "is-absent"}`}>
                      {registro.presente ? "Compareceu" : "Falta"}
                    </span>
                  </td>
                  <td>
                    {registro.observacao ? (
                      <div className="observation-bubble">
                        <FileText size={13} />
                        <span>{registro.observacao}</span>
                      </div>
                    ) : (
                      <span className="no-obs-text">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}