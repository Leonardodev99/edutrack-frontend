import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Filter,
  ChevronDown,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import api from "../../services/api"; // Instância do Axios
import "../../styles/ListarPresenca.css";

export default function ListarPresenca() {
  const [presencas, setPresencas] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("recente");
  const [presencaSelecionada, setPresencaSelecionada] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [presencaParaDeletar, setPresencaParaDeletar] = useState(null);

  // Estados de carregamento e feedback
  const [carregando, setCarregando] = useState(true);
  const [erroGeral, setErroGeral] = useState("");

  // 1. CARREGAR REGISTROS DE PRESENÇA DO BACKEND (GET /attendances ou /presencas)
  async function carregarPresencas() {
    setCarregando(true);
    setErroGeral("");
    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      // Ajuste a rota de acordo com o seu backend (/attendances ou /presencas)
      const response = await api.get("/attendances", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPresencas(response.data);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar lista de presenças.";
      setErroGeral(msg);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPresencas();
  }, []);

  // 2. VER DETALHES DE UM REGISTRO ESPECÍFICO (GET /attendances/:id)
  async function verDetalhes(presenca) {
    try {
      const token = localStorage.getItem("@EduTrack:token");
      const response = await api.get(`/attendances/${presenca.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPresencaSelecionada(response.data);
    } catch (error) {
      // Fallback para os dados locais da linha se a requisição falhar
      setPresencaSelecionada(presenca);
    }
  }

  // 3. FLUXO DE EXCLUSÃO
  function deletarPresenca(id) {
    setPresencaParaDeletar(id);
    setShowConfirm(true);
  }

  // 4. CONFIRMAR DELEÇÃO (DELETE /attendances/:id)
  async function confirmarDelete() {
    if (!presencaParaDeletar) return;

    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      await api.delete(`/attendances/${presencaParaDeletar}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPresencas((prev) => prev.filter((p) => p.id !== presencaParaDeletar));
      setShowConfirm(false);
      setPresencaParaDeletar(null);
      setPresencaSelecionada(null);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao remover o registro de presença.";
      alert(msg);
      setShowConfirm(false);
    }
  }

  // --- Lógica de Filtros e Ordenação ---
  const presencasFiltradas = useMemo(() => {
    let resultado = [...presencas];

    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.student?.user?.nome?.toLowerCase().includes(buscaLower) ||
          p.student?.matricula?.toLowerCase().includes(buscaLower) ||
          p.disciplina?.toLowerCase().includes(buscaLower)
      );
    }

    if (filtroDisciplina !== "todos") {
      resultado = resultado.filter((p) => p.disciplina === filtroDisciplina);
    }

    if (filtroStatus !== "todos") {
      resultado = resultado.filter((p) => p.status?.toLowerCase() === filtroStatus.toLowerCase());
    }

    // Ordenação por Datas ou Aluno
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case "recente":
          return new Date(b.data) - new Date(a.data);
        case "antigo":
          return new Date(a.data) - new Date(b.data);
        case "aluno":
          return (a.student?.user?.nome || "").localeCompare(b.student?.user?.nome || "");
        default:
          return 0;
      }
    });

    return resultado;
  }, [presencas, busca, filtroDisciplina, filtroStatus, ordenacao]);

  // Mapeia disciplinas únicas existentes para preencher o select de filtros automaticamente
  const disciplinasDisponiveis = useMemo(() => {
    const lista = presencas.map((p) => p.disciplina).filter(Boolean);
    return [...new Set(lista)];
  }, [presencas]);

  // Helper para renderizar ícone dinâmico do status da presença
  const renderStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "presente":
        return <CheckCircle size={14} className="icon-success" />;
      case "falta":
      case "ausente":
        return <XCircle size={14} className="icon-danger" />;
      case "justificado":
        return <AlertTriangle size={14} className="icon-warning" />;
      default:
        return null;
    }
  };

  // Formatador de Data Simples (DD/MM/AAAA)
  const formatarData = (dataString) => {
    if (!dataString) return "—";
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-PT", { timeZone: "UTC" });
  };

  if (carregando) {
    return (
      <div className="listar-presencas-page">
        <p className="page-subtitle">A carregar registos de presenças...</p>
      </div>
    );
  }

  return (
    <div className="listar-presencas-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Controlo de Presenças</h1>
          <p className="page-subtitle">
            Gerencie as faltas e presenças dos alunos (Registos: {presencasFiltradas.length})
          </p>
        </div>
        <Link to="/admin/presencas/registrar" className="btn btn-hero">
          <Plus size={18} />
          Lançar Chamada
        </Link>
      </div>

      {erroGeral && <div className="alert alert-danger">{erroGeral}</div>}

      {/* Filtros e Busca */}
      <div className="filtros-bar">
        <div className="busca-box">
          <Search size={16} />
          <input
            type="text"
            className="input-busca"
            placeholder="Buscar por aluno, matrícula ou disciplina..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="filtros-group">
          <div className="filtro-select">
            <Filter size={16} />
            <select value={filtroDisciplina} onChange={(e) => setFiltroDisciplina(e.target.value)}>
              <option value="todos">Todas as disciplinas</option>
              {disciplinasDisponiveis.map((disc) => (
                <option key={disc} value={disc}>{disc}</option>
              ))}
            </select>
          </div>

          <div className="filtro-select">
            <Filter size={16} />
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="todos">Todos os estados</option>
              <option value="presente">Presentes</option>
              <option value="falta">Faltas</option>
              <option value="justificado">Justificados</option>
            </select>
          </div>

          <div className="filtro-select">
            <ChevronDown size={16} />
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
              <option value="recente">Mais recentes primeiro</option>
              <option value="antigo">Mais antigos primeiro</option>
              <option value="aluno">Ordenar por Aluno</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sem Resultados */}
      {presencasFiltradas.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><Calendar size={48} /></div>
          <h3>Nenhum registo de presença encontrado</h3>
          <p>{busca ? "Tente ajustar os filtros ou o termo de busca" : "Efetue o lançamento da primeira chamada para iniciar"}</p>
        </div>
      )}

      {/* Listagem em Tabela */}
      {presencasFiltradas.length > 0 && (
        <div className="presencas-container">
          <div className="presencas-table-wrapper">
            <table className="presencas-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Matrícula</th>
                  <th>Disciplina</th>
                  <th>Data da Aula</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {presencasFiltradas.map((presenca) => (
                  <tr
                    key={presenca.id}
                    className={presencaSelecionada?.id === presenca.id ? "is-selected" : ""}
                  >
                    <td className="cell-nome">
                      <div className="aluno-avatar">
                        {presenca.student?.user?.nome?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <div className="aluno-info">
                        <div className="aluno-nome">{presenca.student?.user?.nome || "Sem Nome"}</div>
                        <div className="aluno-id">ID Registo: {presenca.id}</div>
                      </div>
                    </td>
                    <td className="cell-matricula">{presenca.student?.matricula || "—"}</td>
                    <td className="cell-disciplina">
                      <span className="badge badge-primary">{presenca.disciplina || "Geral"}</span>
                    </td>
                    <td className="cell-data">
                      <Calendar size={14} style={{ marginRight: "6px", opacity: 0.7 }} />
                      {formatarData(presenca.data)}
                    </td>
                    <td className="cell-estado">
                      <span className={`status-badge status-${presenca.status?.toLowerCase()}`}>
                        {renderStatusIcon(presenca.status)}
                        <span style={{ marginLeft: "6px" }}>{presenca.status}</span>
                      </span>
                    </td>
                    <td className="cell-acoes">
                      <div className="acoes-group">
                        <button
                          className="btn-icon btn-icon-info"
                          title="Ver detalhes"
                          onClick={() => verDetalhes(presenca)}
                        >
                          <Eye size={16} />
                        </button>
                        
                        <Link
                          to={`/admin/presencas/editar/${presenca.id}`}
                          className="btn-icon btn-icon-edit"
                          title="Editar registo"
                        >
                          <Edit2 size={16} />
                        </Link>

                        <button
                          className="btn-icon btn-icon-delete"
                          title="Apagar registo"
                          onClick={() => deletarPresenca(presenca.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Painel Lateral de Detalhes da Presença */}
          {presencaSelecionada && (
            <div className="detalhes-sidebar">
              <div className="detalhes-header">
                <h3>Detalhes da Frequência</h3>
                <button className="btn-close" onClick={() => setPresencaSelecionada(null)}>×</button>
              </div>

              <div className="detalhes-content">
                <div className="detalhes-avatar">
                  {presencaSelecionada.student?.user?.nome?.charAt(0).toUpperCase() || "A"}
                </div>

                <div className="detalhes-section">
                  <h4>Informações do Aluno</h4>
                  <div className="detalhes-item">
                    <span className="label">Nome:</span>
                    <span className="value">{presencaSelecionada.student?.user?.nome}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">Matrícula:</span>
                    <span className="value">{presencaSelecionada.student?.matricula || "—"}</span>
                  </div>
                </div>

                <div className="detalhes-section">
                  <h4>Dados da Aula</h4>
                  <div className="detalhes-item">
                    <span className="label">Disciplina:</span>
                    <span className="value">{presencaSelecionada.disciplina}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">Data:</span>
                    <span className="value">{formatarData(presencaSelecionada.data)}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">Estado:</span>
                    <span className={`status-badge status-${presencaSelecionada.status?.toLowerCase()}`}>
                      {presencaSelecionada.status}
                    </span>
                  </div>
                </div>

                {presencaSelecionada.observacao && (
                  <div className="detalhes-section">
                    <h4>Justificativa / Observação</h4>
                    <div className="detalhes-obs">
                      {presencaSelecionada.observacao}
                    </div>
                  </div>
                )}

                <div className="detalhes-actions">
                  <Link to={`/admin/presencas/editar/${presencaSelecionada.id}`} className="btn btn-primary btn-block">
                    <Edit2 size={16} /> Editar Registo
                  </Link>
                  <button
                    className="btn btn-outline btn-block btn-danger"
                    onClick={() => deletarPresenca(presencaSelecionada.id)}
                  >
                    <Trash2 size={16} /> Eliminar Registo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Deleção */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Remoção</h3>
            <p>Tem a certeza que deseja excluir permanentemente este registo de chamada? Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setShowConfirm(false);
                  setPresencaParaDeletar(null);
                }}
              >
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={confirmarDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}