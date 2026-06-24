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
  Clock,
  CheckSquare,
  AlertCircle,
  FileText
} from "lucide-react";
import api from "../../services/api"; // Instância do Axios
import "../../styles/ListarTarefas.css";

export default function ListarTarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("entrega");
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tarefaParaDeletar, setTarefaParaDeletar] = useState(null);

  // Estados de carregamento e feedback
  const [carregando, setCarregando] = useState(true);
  const [erroGeral, setErroGeral] = useState("");

  // 1. CARREGAR TAREFAS DO BACKEND (GET /tasks ou /tarefas)
  async function carregarTarefas() {
    setCarregando(true);
    setErroGeral("");
    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      const response = await api.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTarefas(response.data);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar lista de tarefas.";
      setErroGeral(msg);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTarefas();
  }, []);

  // 2. VER DETALHES DA TAREFA (GET /tasks/:id)
  async function verDetalhes(tarefa) {
    try {
      const token = localStorage.getItem("@EduTrack:token");
      const response = await api.get(`/tasks/${tarefa.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTarefaSelecionada(response.data);
    } catch (error) {
      // Fallback para os dados locais caso a rota falhe
      setTarefaSelecionada(tarefa);
    }
  }

  // 3. FLUXO DE EXCLUSÃO
  function deletarTarefa(id) {
    setTarefaParaDeletar(id);
    setShowConfirm(true);
  }

  // 4. CONFIRMAR DELEÇÃO (DELETE /tasks/:id)
  async function confirmarDelete() {
    if (!tarefaParaDeletar) return;

    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      await api.delete(`/tasks/${tarefaParaDeletar}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTarefas((prev) => prev.filter((t) => t.id !== tarefaParaDeletar));
      setShowConfirm(false);
      setTarefaParaDeletar(null);
      setTarefaSelecionada(null);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao remover tarefa do servidor.";
      alert(msg);
      setShowConfirm(false);
    }
  }

  // --- Lógica de Filtros e Ordenação ---
  const tarefasFiltradas = useMemo(() => {
    let resultado = [...tarefas];

    // Busca textual (Título ou Disciplina)
    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (t) =>
          t.titulo?.toLowerCase().includes(buscaLower) ||
          t.disciplina?.toLowerCase().includes(buscaLower) ||
          t.descricao?.toLowerCase().includes(buscaLower)
      );
    }

    // Filtro por Disciplina
    if (filtroDisciplina !== "todos") {
      resultado = resultado.filter((t) => t.disciplina === filtroDisciplina);
    }

    // Filtro por Status (aberta, concluida, atrasada)
    if (filtroStatus !== "todos") {
      resultado = resultado.filter((t) => t.status?.toLowerCase() === filtroStatus.toLowerCase());
    }

    // Ordenação das tarefas
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case "entrega":
          return new Date(a.data_entrega) - new Date(b.data_entrega);
        case "criacao":
          return new Date(b.created_at || b.id) - new Date(a.created_at || a.id);
        case "titulo":
          return (a.titulo || "").localeCompare(b.titulo || "");
        default:
          return 0;
      }
    });

    return resultado;
  }, [tarefas, busca, filtroDisciplina, filtroStatus, ordenacao]);

  // Lista dinâmica de disciplinas para o select de filtros
  const disciplinasDisponiveis = useMemo(() => {
    const lista = tarefas.map((t) => t.disciplina).filter(Boolean);
    return [...new Set(lista)];
  }, [tarefas]);

  // Formatador de Data Simples (DD/MM/AAAA)
  const formatarData = (dataString) => {
    if (!dataString) return "—";
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-PT", { timeZone: "UTC" });
  };

  // Helper de ícone e estilo visual do status
  const renderStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "aberta":
        return (
          <span className="status-badge status-aberta">
            <Clock size={12} /> Aberta
          </span>
        );
      case "concluida":
      case "concluída":
        return (
          <span className="status-badge status-concluida">
            <CheckSquare size={12} /> Concluída
          </span>
        );
      case "atrasada":
        return (
          <span className="status-badge status-atrasada">
            <AlertCircle size={12} /> Atrasada
          </span>
        );
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  if (carregando) {
    return (
      <div className="listar-tarefas-page">
        <p className="page-subtitle">A carregar tarefas do sistema...</p>
      </div>
    );
  }

  return (
    <div className="listar-tarefas-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tarefas e Atividades</h1>
          <p className="page-subtitle">
            Gerencie os trabalhos práticos e avaliações (Total: {tarefasFiltradas.length})
          </p>
        </div>
        <Link to="/admin/tarefas/criar" className="btn btn-hero">
          <Plus size={18} />
          Nova Tarefa
        </Link>
      </div>

      {erroGeral && <div className="alert alert-danger">{erroGeral}</div>}

      {/* Filtros e Procura */}
      <div className="filtros-bar">
        <div className="busca-box">
          <Search size={16} />
          <input
            type="text"
            className="input-busca"
            placeholder="Buscar por título, conteúdo ou disciplina..."
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
              <option value="aberta">Abertas</option>
              <option value="concluida">Concluídas</option>
              <option value="atrasada">Atrasadas</option>
            </select>
          </div>

          <div className="filtro-select">
            <ChevronDown size={16} />
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
              <option value="entrega">Data de Entrega</option>
              <option value="criacao">Mais Recentes</option>
              <option value="titulo">Ordem Alfabética</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estado Vazio */}
      {tarefasFiltradas.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><FileText size={48} /></div>
          <h3>Nenhuma tarefa encontrada</h3>
          <p>{busca ? "Tente redefinir os filtros ou o termo pesquisado" : "Crie uma nova atividade para começar"}</p>
        </div>
      )}

      {/* Estrutura Principal */}
      {tarefasFiltradas.length > 0 && (
        <div className="tarefas-container">
          <div className="tarefas-table-wrapper">
            <table className="tarefas-table">
              <thead>
                <tr>
                  <th>Título da Atividade</th>
                  <th>Disciplina</th>
                  <th>Data de Entrega</th>
                  <th>Pontuação máxima</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tarefasFiltradas.map((tarefa) => (
                  <tr
                    key={tarefa.id}
                    className={tarefaSelecionada?.id === tarefa.id ? "is-selected" : ""}
                  >
                    <td className="cell-titulo">
                      <div className="tarefa-icon-avatar">
                        <FileText size={18} />
                      </div>
                      <div className="tarefa-info">
                        <div className="tarefa-titulo-txt">{tarefa.titulo || "Sem Título"}</div>
                        <div className="tarefa-id-interna">ID: #{tarefa.id}</div>
                      </div>
                    </td>
                    <td className="cell-disciplina">
                      <span className="badge badge-primary">{tarefa.disciplina || "Geral"}</span>
                    </td>
                    <td className="cell-data">
                      <Calendar size={14} style={{ marginRight: "6px", opacity: 0.7 }} />
                      {formatarData(tarefa.data_entrega)}
                    </td>
                    <td className="cell-pontos">
                      {tarefa.pontos_maximos ? `${tarefa.pontos_maximos}v` : "—"}
                    </td>
                    <td className="cell-estado">
                      {renderStatusBadge(tarefa.status)}
                    </td>
                    <td className="cell-acoes">
                      <div className="acoes-group">
                        <button
                          className="btn-icon btn-icon-info"
                          title="Visualizar detalhes"
                          onClick={() => verDetalhes(tarefa)}
                        >
                          <Eye size={16} />
                        </button>
                        
                        <Link
                          to={`/admin/tarefas/editar/${tarefa.id}`}
                          className="btn-icon btn-icon-edit"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </Link>

                        <button
                          className="btn-icon btn-icon-delete"
                          title="Eliminar"
                          onClick={() => deletarTarefa(tarefa.id)}
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

          {/* Painel Lateral de Detalhes da Tarefa */}
          {tarefaSelecionada && (
            <div className="detalhes-sidebar">
              <div className="detalhes-header">
                <h3>Detalhes da Atividade</h3>
                <button className="btn-close" onClick={() => setTarefaSelecionada(null)}>×</button>
              </div>

              <div className="detalhes-content">
                <div className="detalhes-section">
                  <span className="detalhes-categoria-tag">{tarefaSelecionada.disciplina}</span>
                  <h2 className="detalhes-titulo-principal">{tarefaSelecionada.titulo}</h2>
                </div>

                <div className="detalhes-section">
                  <h4>Prazos e Critérios</h4>
                  <div className="detalhes-item">
                    <span className="label">Entrega:</span>
                    <span className="value">{formatarData(tarefaSelecionada.data_entrega)}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">Valor:</span>
                    <span className="value">{tarefaSelecionada.pontos_maximos ? `${tarefaSelecionada.pontos_maximos} Valores` : "Sem nota definida"}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">Estado:</span>
                    {renderStatusBadge(tarefaSelecionada.status)}
                  </div>
                </div>

                <div className="detalhes-section">
                  <h4>Descrição / Instruções</h4>
                  <div className="detalhes-descricao-bloco">
                    {tarefaSelecionada.descricao || "Nenhuma instrução adicional fornecida para esta tarefa."}
                  </div>
                </div>

                <div className="detalhes-actions">
                  <Link to={`/admin/tarefas/editar/${tarefaSelecionada.id}`} className="btn btn-primary btn-block">
                    <Edit2 size={16} /> Editar Conteúdo
                  </Link>
                  <button
                    className="btn btn-outline btn-block btn-danger"
                    onClick={() => deletarTarefa(tarefaSelecionada.id)}
                  >
                    <Trash2 size={16} /> Eliminar Tarefa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Remover Atividade</h3>
            <p>Tem a certeza que deseja excluir esta tarefa do sistema? Alunos perderão o acesso aos envios associados.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setShowConfirm(false);
                  setTarefaParaDeletar(null);
                }}
              >
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={confirmarDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}