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
  Mail,
  BookOpen,
} from "lucide-react";
import api from "../../services/api"; // Importa a sua instância do Axios
import "../../styles/ListarProfessores.css";

export default function ListarProfessores() {
  const [professores, setProfessores] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [professorSelecionado, setProfessorSelecionado] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [professorParaDeletar, setProfessorParaDeletar] = useState(null);
  
  // Estados de carregamento e feedback
  const [carregando, setCarregando] = useState(true);
  const [erroGeral, setErroGeral] = useState("");

  const departamentosDisponiveis = [
    "Ciências Exatas",
    "Ciências Naturais",
    "Humanidades",
    "Linguagem",
    "Educação Física",
    "Artes",
  ];

  // Função para buscar dados da API
  async function carregarProfessores() {
    setCarregando(true);
    setErroGeral("");
    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      // Conforme o arquivo de rotas, GET /teachers está aberto a todos autenticados
      const response = await api.get("/teachers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfessores(response.data);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar lista de professores.";
      setErroGeral(msg);
    } finally {
      setCarregando(false);
    }
  }

  // Carrega ao montar a tela
  useEffect(() => {
    carregarProfessores();
  }, []);

  // Filtrar e ordenar professores de forma reativa usando useMemo
  const professoresFiltrados = useMemo(() => {
    // No seu backend, o include popula 'user' (ex: prof.user.nome)
    let resultado = [...professores];

    // Filtro de busca
    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.user?.nome?.toLowerCase().includes(buscaLower) ||
          p.user?.email?.toLowerCase().includes(buscaLower) ||
          p.id?.toString().includes(buscaLower) ||
          p.disciplina?.toLowerCase().includes(buscaLower)
      );
    }

    // Filtro de departamento
    if (filtroDepartamento !== "todos") {
      resultado = resultado.filter((p) => p.departamento === filtroDepartamento);
    }

    // Ordenação
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case "nome":
          return (a.user?.nome || "").localeCompare(b.user?.nome || "");
        case "email":
          return (a.user?.email || "").localeCompare(b.user?.email || "");
        case "departamento":
          return (a.departamento || "").localeCompare(b.departamento || "");
        default:
          return 0;
      }
    });

    return resultado;
  }, [professores, busca, filtroDepartamento, ordenacao]);

  // Disparar fluxo de exclusão
  function deletarProfessor(id) {
    setProfessorParaDeletar(id);
    setShowConfirm(true);
  }

  // Confirmar exclusão no Back-end (Apenas Gestor pode remover)
  async function confirmarDelete() {
    if (!professorParaDeletar) return;

    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      // Chama a rota DELETE /teachers/:id
      await api.delete(`/teachers/${professorParaDeletar}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Atualiza o estado removendo localmente ou recarregando da API
      setProfessores((prev) => prev.filter((p) => p.id !== professorParaDeletar));
      setShowConfirm(false);
      setProfessorParaDeletar(null);
      setProfessorSelecionado(null);
    } catch (error) {
      const msg = error.response?.data?.error || "Apenas gestores podem eliminar professores.";
      alert(msg);
      setShowConfirm(false);
    }
  }

  if (carregando) {
    return (
      <div className="listar-professores-page">
        <p className="page-subtitle">A carregar professores do sistema...</p>
      </div>
    );
  }

  return (
    <div className="listar-professores-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Professores</h1>
          <p className="page-subtitle">
            Gerencie os professores do sistema (Total: {professoresFiltrados.length})
          </p>
        </div>
        <Link to="/admin/professor/criar" className="btn btn-hero">
          <Plus size={18} />
          Novo Professor
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
            placeholder="Buscar por nome, email ou ID..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="filtros-group">
          <div className="filtro-select">
            <Filter size={16} />
            <select value={filtroDepartamento} onChange={(e) => setFiltroDepartamento(e.target.value)}>
              <option value="todos">Todos os departamentos</option>
              {departamentosDisponiveis.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-select">
            <ChevronDown size={16} />
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
              <option value="nome">Ordenar por nome</option>
              <option value="email">Ordenar por email</option>
              <option value="departamento">Ordenar por departamento</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aviso de sem resultados */}
      {professoresFiltrados.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={48} />
          </div>
          <h3>Nenhum professor encontrado</h3>
          <p>
            {busca
              ? "Tente ajustar os filtros ou a busca"
              : "Crie o primeiro professor para começar"}
          </p>
        </div>
      )}

      {/* Tabela de Professores */}
      {professoresFiltrados.length > 0 && (
        <div className="professores-container">
          <div className="professores-table-wrapper">
            <table className="professores-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>ID Registro</th>
                  <th>Departamento</th>
                  <th>Disciplinas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {professoresFiltrados.map((prof) => (
                  <tr
                    key={prof.id}
                    className={professorSelecionado?.id === prof.id ? "is-selected" : ""}
                  >
                    <td className="cell-nome">
                      <div className="professor-avatar">
                        {prof.user?.nome?.charAt(0).toUpperCase() || "P"}
                      </div>
                      <div className="professor-info">
                        <div className="professor-nome">{prof.user?.nome || "Sem Nome"}</div>
                        <div className="professor-id">User ID: {prof.user_id}</div>
                      </div>
                    </td>
                    <td className="cell-email">
                      <a href={`mailto:${prof.user?.email}`}>{prof.user?.email || "—"}</a>
                    </td>
                    <td className="cell-matricula">
                      <span className="matricula-badge">Prof #{prof.id}</span>
                    </td>
                    <td className="cell-departamento">
                      <span className="badge badge-primary">
                        {prof.departamento || "Geral"}
                      </span>
                    </td>
                    <td className="cell-disciplinas">
                      <div className="disciplinas-tags">
                        {/* Divide strings separadas por vírgula se existirem ou exibe o campo singular */}
                        {prof.disciplina?.split(", ").map((disc, idx) => (
                          <span key={idx} className="tag tag-small">
                            {disc}
                          </span>
                        )) || <span className="tag tag-small">—</span>}
                      </div>
                    </td>
                    <td className="cell-acoes">
                      <div className="acoes-group">
                        <button
                          className="btn-icon btn-icon-info"
                          title="Ver detalhes"
                          onClick={() => setProfessorSelecionado(prof)}
                        >
                          <Eye size={16} />
                        </button>
                        <Link
                          to={`/admin/professores/editar/${prof.id}`}
                          className="btn-icon btn-icon-edit"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          className="btn-icon btn-icon-delete"
                          title="Deletar"
                          onClick={() => deletarProfessor(prof.id)}
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

          {/* Painel Lateral de Detalhes (Visualizar Detalhes) */}
          {professorSelecionado && (
            <div className="detalhes-sidebar">
              <div className="detalhes-header">
                <h3>Detalhes do Professor</h3>
                <button
                  className="btn-close"
                  onClick={() => setProfessorSelecionado(null)}
                >
                  ×
                </button>
              </div>

              <div className="detalhes-content">
                <div className="detalhes-avatar">
                  {professorSelecionado.user?.nome?.charAt(0).toUpperCase() || "P"}
                </div>

                {/* Informações Pessoais */}
                <div className="detalhes-section">
                  <h4>Informações Pessoais</h4>
                  <div className="detalhes-item">
                    <span className="label">Nome</span>
                    <span className="value">{professorSelecionado.user?.nome}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">ID de Usuário</span>
                    <span className="value">{professorSelecionado.user_id}</span>
                  </div>
                </div>

                {/* Contato */}
                <div className="detalhes-section">
                  <h4>Contato</h4>
                  <div className="detalhes-item">
                    <Mail size={14} />
                    <a href={`mailto:${professorSelecionado.user?.email}`}>
                      {professorSelecionado.user?.email}
                    </a>
                  </div>
                </div>

                {/* Informações Profissionais */}
                <div className="detalhes-section">
                  <h4>Informações Profissionais</h4>
                  <div className="detalhes-item">
                    <span className="label">ID Professor</span>
                    <span className="value">#{professorSelecionado.id}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">Departamento</span>
                    <span className="value">
                      <span className="badge badge-primary">
                        {professorSelecionado.departamento}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Disciplinas */}
                <div className="detalhes-section">
                  <h4>Disciplinas</h4>
                  <div className="disciplinas-detalhes">
                    {professorSelecionado.disciplina?.split(", ").map((disc, idx) => (
                      <span key={idx} className="tag tag-medium">
                        <BookOpen size={12} />
                        {disc}
                      </span>
                    )) || "Nenhuma cadastrada"}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="detalhes-actions">
                  <Link
                    to={`/admin/professores/editar/${professorSelecionado.id}`}
                    className="btn btn-primary btn-block"
                  >
                    <Edit2 size={16} />
                    Editar
                  </Link>
                  <button
                    className="btn btn-outline btn-block btn-danger"
                    onClick={() => deletarProfessor(professorSelecionado.id)}
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
              Tem certeza que deseja eliminar este professor? Esta ação não pode ser
              desfeita e apagará o registro no servidor.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowConfirm(false);
                  setProfessorParaDeletar(null);
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