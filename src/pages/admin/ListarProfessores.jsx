import { useState, useMemo } from "react";
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
import { professoresStore, usersStore } from "../../utils/mockUsers.js";
import "../../styles/ListarProfessores.css";

export default function ListarProfessores() {
  const [professores, setProfessores] = useState(professoresStore.list());
  const [busca, setBusca] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [professorSelecionado, setProfessorSelecionado] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [professorParaDeletar, setProfessorParaDeletar] = useState(null);

  const departamentosDisponiveis = [
    "Ciências Exatas",
    "Ciências Naturais",
    "Humanidades",
    "Linguagem",
    "Educação Física",
    "Artes",
  ];

  // Obter dados do usuário associado
  function obterUsuarioProfessor(userId) {
    return usersStore.get(userId) || null;
  }

  // Filtrar e ordenar professores
  const professoresFiltrados = useMemo(() => {
    let resultado = professores.map((prof) => ({
      ...prof,
      user: obterUsuarioProfessor(prof.user_id),
    }));

    // Filtro de busca
    if (busca) {
      resultado = resultado.filter(
        (p) =>
          p.user?.nome.toLowerCase().includes(busca.toLowerCase()) ||
          p.user?.email.toLowerCase().includes(busca.toLowerCase()) ||
          p.matricula.toLowerCase().includes(busca.toLowerCase())
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
          return a.departamento.localeCompare(b.departamento);
        default:
          return 0;
      }
    });

    return resultado;
  }, [professores, busca, filtroDepartamento, ordenacao]);

  // Deletar professor
  function deletarProfessor(id, userId) {
    setProfessorParaDeletar({ id, userId });
    setShowConfirm(true);
  }

  function confirmarDelete() {
    if (professorParaDeletar) {
      // Remove professor
      professoresStore.remove(professorParaDeletar.id);
      // Remove usuário associado
      usersStore.remove(professorParaDeletar.userId);
      
      setProfessores(professoresStore.list());
      setShowConfirm(false);
      setProfessorParaDeletar(null);
      setProfessorSelecionado(null);
    }
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

      {/* Filtros e Busca */}
      <div className="filtros-bar">
        <div className="busca-box">
          <Search size={16} />
          <input
            type="text"
            className="input-busca"
            placeholder="Buscar por nome, email ou matrícula..."
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
          {!busca && (
            <Link to="/admin/professores/criar" className="btn btn-primary">
              Criar Professor
            </Link>
          )}
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
                  <th>Matrícula</th>
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
                        {prof.user?.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="professor-info">
                        <div className="professor-nome">{prof.user?.nome}</div>
                        <div className="professor-id">{prof.matricula}</div>
                      </div>
                    </td>
                    <td className="cell-email">
                      <a href={`mailto:${prof.user?.email}`}>{prof.user?.email}</a>
                    </td>
                    <td className="cell-matricula">
                      <span className="matricula-badge">{prof.matricula}</span>
                    </td>
                    <td className="cell-departamento">
                      <span className="badge badge-primary">
                        {prof.departamento}
                      </span>
                    </td>
                    <td className="cell-disciplinas">
                      <div className="disciplinas-tags">
                        {prof.disciplinas?.split(", ").map((disc, idx) => (
                          <span key={idx} className="tag tag-small">
                            {disc}
                          </span>
                        ))}
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
                          onClick={() => deletarProfessor(prof.id, prof.user_id)}
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
                {/* Avatar Grande */}
                <div className="detalhes-avatar">
                  {professorSelecionado.user?.nome.charAt(0).toUpperCase()}
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
                    <span className="label">Matrícula</span>
                    <span className="value">{professorSelecionado.matricula}</span>
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
                    {professorSelecionado.disciplinas?.split(", ").map((disc, idx) => (
                      <span key={idx} className="tag tag-medium">
                        <BookOpen size={12} />
                        {disc}
                      </span>
                    ))}
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
                    onClick={() => {
                      deletarProfessor(professorSelecionado.id, professorSelecionado.user_id);
                      setProfessorSelecionado(null);
                    }}
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
              desfeita.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowConfirm(false)}
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