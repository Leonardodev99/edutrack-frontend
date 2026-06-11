import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import api from "../../services/api";
import "../../styles/ListarEncarregados.css";

export default function ListarEncarregados() {
  const [encarregados, setEncarregados] = useState([]);
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [encarregadoSelecionado, setEncarregadoSelecionado] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [encarregadoParaDeletar, setEncarregadoParaDeletar] = useState(null);
  
  // Estados de carregamento e feedback
  const [carregando, setCarregando] = useState(true);
  const [erroGeral, setErroGeral] = useState("");

  // Função para buscar dados da API
  async function carregarEncarregados() {
    setCarregando(true);
    setErroGeral("");
    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      // GET /guardians - retorna todos os encarregados com include de user e students
      const response = await api.get("/guardians", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEncarregados(response.data);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar lista de encarregados.";
      setErroGeral(msg);
    } finally {
      setCarregando(false);
    }
  }

  // Carrega ao montar a tela
  useEffect(() => {
    carregarEncarregados();
  }, []);

  // Filtrar e ordenar encarregados de forma reativa usando useMemo
  const encarregadosFiltrados = useMemo(() => {
    let resultado = [...encarregados];

    // Filtro de busca
    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (e) =>
          e.user?.nome?.toLowerCase().includes(buscaLower) ||
          e.user?.email?.toLowerCase().includes(buscaLower) ||
          e.telefone?.toLowerCase().includes(buscaLower) ||
          e.id?.toString().includes(buscaLower)
      );
    }

    // Ordenação
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case "nome":
          return (a.user?.nome || "").localeCompare(b.user?.nome || "");
        case "email":
          return (a.user?.email || "").localeCompare(b.user?.email || "");
        case "telefone":
          return (a.telefone || "").localeCompare(b.telefone || "");
        case "alunos":
          return (b.students?.length || 0) - (a.students?.length || 0);
        default:
          return 0;
      }
    });

    return resultado;
  }, [encarregados, busca, ordenacao]);

  // Disparar fluxo de exclusão
  function deletarEncarregado(id) {
    setEncarregadoParaDeletar(id);
    setShowConfirm(true);
  }

  // Confirmar exclusão no Back-end (Apenas Gestor pode remover)
  async function confirmarDelete() {
    if (!encarregadoParaDeletar) return;

    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      // Chama a rota DELETE /guardians/:id
      await api.delete(`/guardians/${encarregadoParaDeletar}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Atualiza o estado removendo localmente
      setEncarregados((prev) => prev.filter((e) => e.id !== encarregadoParaDeletar));
      setShowConfirm(false);
      setEncarregadoParaDeletar(null);
      setEncarregadoSelecionado(null);
    } catch (error) {
      const msg = error.response?.data?.error || "Apenas gestores podem eliminar encarregados.";
      alert(msg);
      setShowConfirm(false);
    }
  }

  if (carregando) {
    return (
      <div className="listar-encarregados-page">
        <p className="page-subtitle">A carregar encarregados do sistema...</p>
      </div>
    );
  }

  return (
    <div className="listar-encarregados-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Encarregados de Educação</h1>
          <p className="page-subtitle">
            Gerencie os encarregados do sistema (Total: {encarregadosFiltrados.length})
          </p>
        </div>
        <Link to="/admin/encarregados/criar" className="btn btn-hero">
          <Plus size={18} />
          Novo Encarregado
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
            placeholder="Buscar por nome, email, telefone ou ID..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="filtros-group">
          <div className="filtro-select">
            <ChevronDown size={16} />
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
              <option value="nome">Ordenar por nome</option>
              <option value="email">Ordenar por email</option>
              <option value="telefone">Ordenar por telefone</option>
              <option value="alunos">Ordenar por número de alunos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aviso de sem resultados */}
      {encarregadosFiltrados.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={48} />
          </div>
          <h3>Nenhum encarregado encontrado</h3>
          <p>
            {busca
              ? "Tente ajustar os filtros ou a busca"
              : "Crie o primeiro encarregado para começar"}
          </p>
        </div>
      )}

      {/* Tabela de Encarregados */}
      {encarregadosFiltrados.length > 0 && (
        <div className="encarregados-container">
          <div className="encarregados-table-wrapper">
            <table className="encarregados-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Alunos Associados</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {encarregadosFiltrados.map((enc) => (
                  <tr
                    key={enc.id}
                    className={encarregadoSelecionado?.id === enc.id ? "is-selected" : ""}
                  >
                    <td className="cell-nome">
                      <div className="encarregado-avatar">
                        {enc.user?.nome?.charAt(0).toUpperCase() || "E"}
                      </div>
                      <div className="encarregado-info">
                        <div className="encarregado-nome">{enc.user?.nome || "Sem Nome"}</div>
                        <div className="encarregado-id">ID: {enc.id}</div>
                      </div>
                    </td>
                    <td className="cell-email">
                      <a href={`mailto:${enc.user?.email}`}>{enc.user?.email || "—"}</a>
                    </td>
                    <td className="cell-telefone">
                      <div className="telefone-info">
                        <Phone size={14} /> {enc.telefone || "—"}
                      </div>
                    </td>
                    <td className="cell-alunos">
                      <span className="alunos-badge">
                        <Users size={14} />
                        {enc.students?.length || 0} aluno{(enc.students?.length || 0) === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="cell-acoes">
                      <div className="acoes-group">
                        <button
                          className="btn-icon btn-icon-info"
                          title="Ver detalhes"
                          onClick={() => setEncarregadoSelecionado(enc)}
                        >
                          <Eye size={16} />
                        </button>
                        <Link
                          to={`/admin/encarregados/editar/${enc.id}`}
                          className="btn-icon btn-icon-edit"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          className="btn-icon btn-icon-delete"
                          title="Deletar"
                          onClick={() => deletarEncarregado(enc.id)}
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

          {/* Painel Lateral de Detalhes */}
          {encarregadoSelecionado && (
            <div className="detalhes-sidebar">
              <div className="detalhes-header">
                <h3>Detalhes do Encarregado</h3>
                <button
                  className="btn-close"
                  onClick={() => setEncarregadoSelecionado(null)}
                >
                  ×
                </button>
              </div>

              <div className="detalhes-content">
                {/* Avatar Grande */}
                <div className="detalhes-avatar">
                  {encarregadoSelecionado.user?.nome?.charAt(0).toUpperCase() || "E"}
                </div>

                {/* Informações Pessoais */}
                <div className="detalhes-section">
                  <h4>Informações Pessoais</h4>
                  <div className="detalhes-item">
                    <span className="label">Nome</span>
                    <span className="value">{encarregadoSelecionado.user?.nome}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">ID de Usuário</span>
                    <span className="value">{encarregadoSelecionado.user_id}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">ID Encarregado</span>
                    <span className="value">#{encarregadoSelecionado.id}</span>
                  </div>
                </div>

                {/* Contato */}
                <div className="detalhes-section">
                  <h4>Contacto</h4>
                  <div className="detalhes-item">
                    <Mail size={14} />
                    <a href={`mailto:${encarregadoSelecionado.user?.email}`}>
                      {encarregadoSelecionado.user?.email}
                    </a>
                  </div>
                  <div className="detalhes-item">
                    <Phone size={14} />
                    <span>{encarregadoSelecionado.telefone || "—"}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="detalhes-section">
                  <h4>Status</h4>
                  <div className="detalhes-item">
                    <span className="label">Ativo</span>
                    <span
                      className={`status-badge ${
                        encarregadoSelecionado.ativo ? "ativo" : "inativo"
                      }`}
                    >
                      {encarregadoSelecionado.ativo ? "Sim" : "Não"}
                    </span>
                  </div>
                </div>

                {/* Alunos Associados */}
                <div className="detalhes-section">
                  <h4>
                    Alunos Associados ({encarregadoSelecionado.students?.length || 0})
                  </h4>
                  {encarregadoSelecionado.students?.length > 0 ? (
                    <div className="alunos-lista">
                      {encarregadoSelecionado.students.map((aluno) => (
                        <div key={aluno.id} className="aluno-item">
                          <div className="aluno-avatar-small">
                            {aluno.user?.nome?.charAt(0).toUpperCase()}
                          </div>
                          <div className="aluno-info">
                            <span className="aluno-nome">{aluno.user?.nome}</span>
                            <span className="aluno-matricula">{aluno.matricula}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">Nenhum aluno associado</p>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="detalhes-actions">
                  <Link
                    to={`/admin/encarregados/editar/${encarregadoSelecionado.id}`}
                    className="btn btn-primary btn-block"
                  >
                    <Edit2 size={16} />
                    Editar
                  </Link>
                  <button
                    className="btn btn-outline btn-block btn-danger"
                    onClick={() => deletarEncarregado(encarregadoSelecionado.id)}
                  >
                    <Trash2 size={16} />
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Delete */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Eliminação</h3>
            <p>
              Tem certeza que deseja eliminar este encarregado? Esta ação não pode ser
              desfeita e apagará o registro no servidor.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowConfirm(false);
                  setEncarregadoParaDeletar(null);
                }}
              >
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={confirmarDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
