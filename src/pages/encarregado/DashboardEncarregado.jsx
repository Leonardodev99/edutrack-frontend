import { useState, useEffect, useMemo } from 'react';
import { UserCheck, FileSpreadsheet, TrendingUp, AlertTriangle, BookOpen, Clock, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api'; // Instância do Axios configurada
import '../../styles/DashboardEncarregado.css';

export default function DashboardEncarregado() {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Estados de dados dinâmicos do Backend
  const [nomeEncarregado, setNomeEncarregado] = useState("");
  const [nomeEducando, setNomeEducando] = useState("");
  const [dadosNotas, setDadosNotas] = useState([]);
  const [dadosAssiduidade, setDadosAssiduidade] = useState([]);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setLoading(true);
        const token = localStorage.getItem("@EduTrack:token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Buscar dados do Encarregado Autenticado e descobrir o Educando vinculado
        const responsePerfil = await api.get("/guardians/me", { headers });
        const dadosPerfil = responsePerfil.data;

        // Extrai o nome do encarregado (ajuste a propriedade de acordo com o seu modelo de User)
        setNomeEncarregado(dadosPerfil?.user?.nome || dadosPerfil?.nome || "Encarregado");

        if (!dadosPerfil || !dadosPerfil.students || dadosPerfil.students.length === 0) {
          setErro("Nenhum educando associado a esta conta.");
          setLoading(false);
          return;
        }

        const primeiroEstudante = dadosPerfil.students[0];
        setNomeEducando(primeiroEstudante.nome || "Educando");
        const studentId = primeiroEstudante.id;

        // 2. Requisições paralelas para puxar o histórico de Notas e Assiduidade do Educando
        const [resNotas, resAssiduidade] = await Promise.all([
          api.get(`/students/${studentId}/grades`, { headers }),
          api.get(`/students/${studentId}/attendance`, { headers })
        ]);

        // Proteção contra formatos diferentes de Array (visto na tela analítica)
        const notasTratadas = Array.isArray(resNotas.data) 
          ? resNotas.data 
          : (resNotas.data?.grades || resNotas.data?.notas || []);

        const assiduidadeTratada = Array.isArray(resAssiduidade.data) 
          ? resAssiduidade.data 
          : (resAssiduidade.data?.attendances || resAssiduidade.data?.presencas || []);

        setDadosNotas(notasTratadas);
        setDadosAssiduidade(assiduidadeTratada);
        setErro(null);
      } catch (err) {
        console.error("Erro ao processar dados do painel do encarregado:", err);
        setErro("Não foi possível sincronizar os dados do painel em tempo real.");
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  // 📊 CÁLCULOS DOS CARDS DE MÉTRICAS RÁPIDAS
  const resumoMetricasReais = useMemo(() => {
    // A) Processamento de Assiduidade
    const totalAulas = dadosAssiduidade.length;
    const faltas = dadosAssiduidade.filter(p => !p?.presente).length;
    const percentualPresenca = totalAulas > 0 
      ? `${((dadosAssiduidade.filter(p => p?.presente).length / totalAulas) * 100).toFixed(1)}%` 
      : "100%";

    // B) Processamento de Média Global
    const somaNotas = dadosNotas.reduce((acc, curr) => acc + Number(curr?.valor || 0), 0);
    const mediaCalculada = dadosNotas.length > 0 ? (somaNotas / dadosNotas.length) : 0;

    // C) Definição de Status Pedagógico com base na média real
    let status = "Regular";
    if (mediaCalculada >= 16) status = "Excelente";
    else if (mediaCalculada >= 14) status = "Bom";
    else if (mediaCalculada < 10 && dadosNotas.length > 0) status = "Atenção";

    return {
      presencaGlobal: percentualPresenca,
      faltasAtuais: faltas,
      mediaGeral: `${mediaCalculada.toFixed(1)} / 20`,
      desempenhoStatus: status
    };
  }, [dadosNotas, dadosAssiduidade]);

  // ⏱️ FILTRO: Limitar para exibir apenas as últimas 4 chamadas no painel
  const ultimasPresencasExibicao = useMemo(() => {
    return dadosAssiduidade
      .slice(0, 4)
      .map((pres, index) => ({
        id: pres.id || index,
        data: pres.data || pres.createdAt || new Date(),
        disciplina: pres.schedule?.disciplina || "Atividade Prática",
        status: pres.presente ? "Presente" : "Ausente",
        obs: pres.observacao || ""
      }));
  }, [dadosAssiduidade]);

  // 📝 FILTRO: Limitar para exibir apenas as últimas 4 notas lançadas
  const notasRecentesExibicao = useMemo(() => {
    return dadosNotas
      .slice(0, 4)
      .map((nota, index) => ({
        id: nota.id || index,
        disciplina: nota.schedule?.disciplina || "Avaliação",
        avaliacao: nota.tipoAvaliacao || "Nota Periódica",
        nota: Number(nota.valor || 0)
      }));
  }, [dadosNotas]);

  if (loading) {
    return (
      <div className="dashboard-loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={42} color="#0066cc" />
        <p style={{ color: '#555', fontWeight: 500 }}>Carregando dados acadêmicos do EduTrack...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="dashboard-error-container" style={{ padding: '3rem 2rem', textAlign: 'center', background: '#fff5f5', borderRadius: '12px', border: '1px solid #ffcccc', margin: '2rem auto', maxWidh: '600px' }}>
        <AlertCircle size={40} color="#cc0000" style={{ margin: '0 auto 1.5rem' }} />
        <h3 style={{ color: '#cc0000', marginBottom: '0.75rem', fontSize: '1.25rem' }}>Falha na Inicialização do Painel</h3>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>{erro}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.5rem', background: '#cc0000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="dashboard-encarregado-container">
      <div className="dashboard-header-welcome">
        <h1>Olá, {nomeEncarregado}</h1>
        <p>Aqui está o acompanhamento acadêmico em tempo real do seu educando, <strong>{nomeEducando}</strong>.</p>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="metrics-summary-grid">
        <div className="metric-card-box">
          <div className="metric-card-header">
            <span className="metric-card-title">Assiduidade / Presenças</span>
            <UserCheck className="icon-metric text-success" size={20} />
          </div>
          <div className="metric-card-body">
            <h3>{resumoMetricasReais.presencaGlobal}</h3>
            <p className="metric-card-sub">{resumoMetricasReais.faltasAtuais} faltas registradas</p>
          </div>
        </div>

        <div className="metric-card-box">
          <div className="metric-card-header">
            <span className="metric-card-title">Média Global</span>
            <FileSpreadsheet className="icon-metric text-primary" size={20} />
          </div>
          <div className="metric-card-body">
            <h3>{resumoMetricasReais.mediaGeral}</h3>
            <p className="metric-card-sub">Base: Escala de 0 a 20 valores</p>
          </div>
        </div>

        <div className="metric-card-box">
          <div className="metric-card-header">
            <span className="metric-card-title">Status de Desempenho</span>
            <TrendingUp className="icon-metric text-warning" size={20} />
          </div>
          <div className="metric-card-body">
            <h3>{resumoMetricasReais.desempenhoStatus}</h3>
            <p className="metric-card-sub">Atualizado em tempo real</p>
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
            {ultimasPresencasExibicao.length === 0 ? (
              <p className="no-data-notice" style={{ padding: '1rem', color: '#888', textAlign: 'center' }}>Nenhum registro de chamada encontrado.</p>
            ) : (
              ultimasPresencasExibicao.map((pres) => (
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
              ))
            )}
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
            {notasRecentesExibicao.length === 0 ? (
              <p className="no-data-notice" style={{ padding: '1rem', color: '#888', textAlign: 'center' }}>Nenhuma avaliação lançada neste período.</p>
            ) : (
              notasRecentesExibicao.map((nota) => (
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
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}