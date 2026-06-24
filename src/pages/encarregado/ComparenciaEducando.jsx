import { useState, useEffect, useMemo } from "react";
import { UserCheck, Calendar, Filter, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import api from "../../services/api"; // Instância do Axios
import "../../styles/ComparenciaEducando.css";

export default function ComparenciaEducando() {
  const [filtroDisciplina, setFiltroDisciplina] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [historicoPresencas, setHistoricoPresencas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarHistoricoChamada() {
      try {
        setLoading(true);
        const token = localStorage.getItem("@EduTrack:token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Identifica o educando vinculado ao encarregado logado
        const responsePerfil = await api.get("/guardians/me", { headers });
        const dadosPerfil = responsePerfil.data;

        if (!dadosPerfil || !dadosPerfil.students || dadosPerfil.students.length === 0) {
          setErro("Nenhum educando associado a esta conta de encarregado.");
          setLoading(false);
          return;
        }

        const studentId = dadosPerfil.students[0].id;

        // 2. Busca o histórico de chamadas real do banco de dados
        const responseAttendance = await api.get(`/students/${studentId}/attendance`, { headers });
        setHistoricoPresencas(responseAttendance.data || []);
        setErro(null);
      } catch (err) {
        console.error("Erro ao carregar livro de comparência:", err);
        setErro("Não foi possível obter os dados de assiduidade do educando.");
      } finally {
        setLoading(false);
      }
    }

    carregarHistoricoChamada();
  }, []);

  // Extrai dinamicamente as disciplinas existentes nos registros do banco para alimentar o select
  const disciplinasDisponiveis = useMemo(() => {
    const disciplinasSet = new Set();
    historicoPresencas.forEach(p => {
      const nomeDisciplina = p.schedule?.disciplina;
      if (nomeDisciplina) disciplinasSet.add(nomeDisciplina);
    });
    return Array.from(disciplinasSet);
  }, [historicoPresencas]);

  // Cálculo Dinâmico de Métricas em tempo real
  const metricasAproveitamento = useMemo(() => {
    const totalAulas = historicoPresencas.length;
    const totalPresencas = historicoPresencas.filter(p => p.presente).length;
    const totalFaltas = totalAulas - totalPresencas;
    const taxaAssiduidade = totalAulas > 0 ? ((totalPresencas / totalAulas) * 100).toFixed(1) : "100.0";

    return { totalAulas, totalPresencas, totalFaltas, taxaAssiduidade };
  }, [historicoPresencas]);

  // Filtragem da lista em tempo real combinando os selects
  const dadosFiltrados = useMemo(() => {
    return historicoPresencas.filter((registro) => {
      const disciplinaNome = registro.schedule?.disciplina || "";
      const matchDisciplina = filtroDisciplina === "todos" || disciplinaNome === filtroDisciplina;
      
      let matchStatus = true;
      if (filtroStatus === "presente") matchStatus = registro.presente === true;
      if (filtroStatus === "ausente") matchStatus = registro.presente === false;

      return matchDisciplina && matchStatus;
    });
  }, [historicoPresencas, filtroDisciplina, filtroStatus]);

  if (loading) {
    return (
      <div className="comparencia-loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={40} color="#0066cc" />
        <p style={{ color: '#666' }}>Carregando dados do Livro de Comparência...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="comparencia-error-container" style={{ padding: '2rem', textAlign: 'center', background: '#fff5f5', borderRadius: '8px', border: '1px solid #ffcccc', margin: '2rem' }}>
        <AlertCircle size={36} color="#cc0000" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#cc0000', marginBottom: '0.5rem' }}>Falha na Requisição</h3>
        <p style={{ color: '#555' }}>{erro}</p>
      </div>
    );
  }

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
              {disciplinasDisponiveis.map((disc, idx) => (
                <option key={idx} value={disc}>{disc}</option>
              ))}
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
              {dadosFiltrados.map((registro) => {
                const professorNome = registro.teacher?.user?.nome || "Professor Não Identificado";
                const disciplinaNome = registro.schedule?.disciplina || "Geral";

                return (
                  <tr key={registro.id} className={!registro.presente ? "row-student-absent" : ""}>
                    <td className="font-medium">
                      <div className="date-cell-container">
                        <Calendar size={14} />
                        {new Date(registro.data_aula).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                      </div>
                    </td>
                    <td>
                      <span className="discipline-name-cell">{disciplinaNome}</span>
                    </td>
                    <td>
                      <span className="teacher-name-cell">{professorNome}</span>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}