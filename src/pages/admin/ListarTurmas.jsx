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
  Users,
  BookOpen,
  Calendar,
  UserPlus, // Adicionado o ícone para Matricular/Adicionar Aluno
} from "lucide-react";
import api from "../../services/api";
import "../../styles/ListarTurmas.css";

export default function ListarTurmas() {
  const [turmas, setTurmas] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("todos");
  const [filtroAnoLetivo, setFiltroAnoLetivo] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [turmaParaDeletar, setTurmaParaDeletar] = useState(null);
  
  // Estados de carregamento e feedback
  const [carregando, setCarregando] = useState(true);
  const [erroGeral, setErroGeral] = useState("");

  const cursosDisponiveis = [
    "Ensino Básico",
    "Ensino Secundário",
    "Cursos Profissionais",
  ];

  // Função para buscar dados da API
  async function carregarTurmas() {
    setCarregando(true);
    setErroGeral("");
    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      // GET /classes - retorna todas as turmas com include de teacher e students
      const response = await api.get("/classes", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Dados que vieram do Backend:", response.data);
      
      setTurmas(response.data);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar lista de turmas.";
      setErroGeral(msg);
    } finally {
      setCarregando(false);
    }
  }

  // Carrega ao montar a tela
  useEffect(() => {
    carregarTurmas();
  }, []);

  // Obter anos letivos únicos
  const anosLetivosUnicos = useMemo(() => {
    return [...new Set(turmas.map((t) => t.ano_letivo))].sort().reverse();
  }, [turmas]);

  // Filtrar e ordenar turmas de forma reativa usando useMemo
  const turmasFiltradas = useMemo(() => {
    let resultado = [...turmas];

    // Filtro de busca
    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (t) =>
          t.nome?.toLowerCase().includes(buscaLower) ||
          t.id?.toString().includes(buscaLower)
      );
    }

    // Filtro de curso
    if (filtroCurso !== "todos") {
      resultado = resultado.filter((t) => t.curso === filtroCurso);
    }

    // Filtro de ano letivo
    if (filtroAnoLetivo !== "todos") {
      resultado = resultado.filter((t) => t.ano_letivo === filtroAnoLetivo);
    }

    // Ordenação
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case "nome":
          return (a.nome || "").localeCompare(b.nome || "");
        case "alunos":
          return (b.students?.length || 0) - (a.students?.length || 0);
        case "ano-letivo":
          return (b.ano_letivo || "").localeCompare(a.ano_letivo || "");
        case "curso":
          return (a.curso || "").localeCompare(b.curso || "");
        default:
          return 0;
      }
    });

    return resultado;
  }, [turmas, busca, filtroCurso, filtroAnoLetivo, ordenacao]);

  // Disparar fluxo de exclusão
  function deletarTurma(id) {
    setTurmaParaDeletar(id);
    setShowConfirm(true);
  }

  // Confirmar exclusão no Back-end (Apenas Gestor pode remover)
  async function confirmarDelete() {
    if (!turmaParaDeletar) return;

    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      // Chama a rota DELETE /classes/:id
      await api.delete(`/classes/${turmaParaDeletar}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Atualiza o estado removendo localmente
      setTurmas((prev) => prev.filter((t) => t.id !== turmaParaDeletar));
      setShowConfirm(false);
      setTurmaParaDeletar(null);
      setTurmaSelecionada(null);
    } catch (error) {
      const msg = error.response?.data?.error || "Apenas gestores podem eliminar turmas.";
      alert(msg);
      setShowConfirm(false);
    }
  }

  // Calcular estatísticas
  function calcularEstatisticas() {
    const totalTurmas = turmasFiltradas.length;
    const totalAlunos = turmasFiltradas.reduce(
      (acc, t) => acc + (t.students?.length || 0),
      0
    );
    const turmaCheia = turmasFiltradas.filter((t) => (t.students?.length || 0) >= 25).length;

    return { totalTurmas, totalAlunos, turmaCheia };
  }

  const { totalTurmas, totalAlunos, turmaCheia } = calcularEstatisticas();

  if (carregando) {
    return (
      <div className="listar-turmas-page">
        <p className="page-subtitle">A carregar turmas do sistema...</p>
      </div>
    );
  }

  return (
    <div className="listar-turmas-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Turmas</h1>
          <p className="page-subtitle">
            Gerencie todas as turmas do sistema (Total: {turmasFiltradas.length})
          </p>
        </div>
        <Link to="/admin/turmas/criar" className="btn btn-hero">
          <Plus size={18} />
          Nova Turma
        </Link>
      </div>

      {erroGeral && <div className="alert alert-danger">{erroGeral}</div>}

      {/* Estatísticas Rápidas */}
      <div className="stats-bar">
        <div className="stat-item">
          <BookOpen size={18} />
          <div>
            <span className="stat-label">Total de Turmas</span>
            <span className="stat-value">{totalTurmas}</span>
          </div>
        </div>
        <div className="stat-item">
          <Users size={18} />
          <div>
            <span className="stat-label">Total de Alunos</span>
            <span className="stat-value">{totalAlunos}</span>
          </div>
        </div>
        <div className="stat-item">
          <Calendar size={18} />
          <div>
            <span className="stat-label">Turmas Cheias</span>
            <span className="stat-value">{turmaCheia}</span>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="filtros-bar">
        <div className="busca-box">
          <Search size={16} />
          <input
            type="text"
            className="input-busca"
            placeholder="Buscar por nome ou ID..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="filtros-group">
          <div className="filtro-select">
            <Filter size={16} />
            <select value={filtroCurso} onChange={(e) => setFiltroCurso(e.target.value)}>
              <option value="todos">Todos os cursos</option>
              {cursosDisponiveis.map((curso) => (
                <option key={curso} value={curso}>
                  {curso}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-select">
            <Filter size={16} />
            <select value={filtroAnoLetivo} onChange={(e) => setFiltroAnoLetivo(e.target.value)}>
              <option value="todos">Todos os anos letivos</option>
              {anosLetivosUnicos.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-select">
            <ChevronDown size={16} />
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
              <option value="nome">Ordenar por nome</option>
              <option value="alunos">Ordenar por nº de alunos</option>
              <option value="ano-letivo">Ordenar por ano letivo</option>
              <option value="curso">Ordenar por curso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aviso de sem resultados */}
      {turmasFiltradas.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={48} />
          </div>
          <h3>Nenhuma turma encontrada</h3>
          <p>
            {busca
              ? "Tente ajustar os filtros ou a busca"
              : "Crie a primeira turma para começar"}
          </p>
          {!busca && (
            <Link to="/admin/turmas/criar" className="btn btn-primary">
              Criar Turma
            </Link>
          )}
        </div>
      )}

      {/* Tabela de Turmas */}
      {turmasFiltradas.length > 0 && (
        <div className="turmas-container">
          <div className="turmas-table-wrapper">
            <table className="turmas-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Curso</th>
                  <th>Ano Letivo</th>
                  <th>Professor</th>
                  <th>Alunos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {turmasFiltradas.map((turma) => {
                  const quantidadeAlunos = turma.students?.length || 0;
                  const statusLotacao =
                    quantidadeAlunos >= 25
                      ? "cheio"
                      : quantidadeAlunos >= 20
                      ? "quase-cheio"
                      : "normal";

                  return (
                    <tr
                      key={turma.id}
                      className={turmaSelecionada?.id === turma.id ? "is-selected" : ""}
                    >
                      <td className="cell-nome">
                        <div className="turma-avatar">
                          {turma.nome?.charAt(0).toUpperCase() || "T"}
                        </div>
                        <div className="turma-info">
                          <div className="turma-nome">{turma.nome || "Sem Nome"}</div>
                          <div className="turma-id">ID: {turma.id}</div>
                        </div>
                      </td>
                      <td className="cell-curso">
                        <span className="badge badge-primary">
                          {turma.curso || "—"}
                        </span>
                      </td>
                      <td className="cell-ano">
                        <span className="ano-badge">{turma.ano_letivo || "—"}</span>
                      </td>
                      <td className="cell-professor">
                        <div className="professor-info">
                          <div className="professor-nome">
                            {turma.teacher?.user?.nome || "—"}
                          </div>
                        </div>
                      </td>
                      <td className="cell-alunos">
                        <span className={`alunos-badge ${statusLotacao}`}>
                          <Users size={14} />
                          {quantidadeAlunos} aluno{quantidadeAlunos === 1 ? "" : "s"}
                        </span>
                      </td>
                      <td className="cell-acoes">
                        <div className="acoes-group">
                          <button
                            className="btn-icon btn-icon-info"
                            title="Ver detalhes"
                            onClick={() => setTurmaSelecionada(turma)}
                          >
                            <Eye size={16} />
                          </button>
                          
                          <Link
                            to={`/admin/turmas/editar/${turma.id}`}
                            className="btn-icon btn-icon-edit"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </Link>

                          {/* ÍCONE ADICIONADO: Matricular Aluno nesta Turma */}
                          <Link
                            to="/admin/matricular"
                            className="btn-icon btn-icon-add-student"
                            title="Matricular Aluno"
                            state={{ turmaId: turma.id }} // Passa o ID se quiseres pré-selecionar no MatricularAluno
                          >
                            <UserPlus size={16} color="#2ec4b6" />
                          </Link>

                          <button
                            className="btn-icon btn-icon-delete"
                            title="Deletar"
                            onClick={() => deletarTurma(turma.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Painel Lateral de Detalhes */}
          {turmaSelecionada && (
            <div className="detalhes-sidebar">
              <div className="detalhes-header">
                <h3>Detalhes da Turma</h3>
                <button
                  className="btn-close"
                  onClick={() => setTurmaSelecionada(null)}
                >
                  ×
                </button>
              </div>

              <div className="detalhes-content">
                {/* Avatar Grande */}
                <div className="detalhes-avatar">
                  {turmaSelecionada.nome?.charAt(0).toUpperCase() || "T"}
                </div>

                {/* Informações da Turma */}
                <div className="detalhes-section">
                  <h4>Informações da Turma</h4>
                  <div className="detalhes-item">
                    <span className="label">Nome</span>
                    <span className="value">{turmaSelecionada.nome}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">ID</span>
                    <span className="value">#{turmaSelecionada.id}</span>
                  </div>
                </div>

                {/* Informações Académicas */}
                <div className="detalhes-section">
                  <h4>Informações Académicas</h4>
                  <div className="detalhes-item">
                    <span className="label">Curso</span>
                    <span className="value">{turmaSelecionada.curso || "—"}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">Ano Letivo</span>
                    <span className="value">{turmaSelecionada.ano_letivo || "—"}</span>
                  </div>
                </div>

                {/* Professor */}
                <div className="detalhes-section">
                  <h4>Professor Responsável</h4>
                  {turmaSelecionada.teacher ? (
                    <>
                      <div className="detalhes-item">
                        <span className="label">Nome</span>
                        <span className="value">
                          {turmaSelecionada.teacher?.user?.nome || "—"}
                        </span>
                      </div>
                      <div className="detalhes-item">
                        <span className="label">Email</span>
                        <span className="value">
                          {turmaSelecionada.teacher?.user?.email || "—"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted">Nenhum professor designado</p>
                  )}
                </div>

                {/* Status */}
                <div className="detalhes-section">
                  <h4>Status</h4>
                  <div className="detalhes-item">
                    <span className="label">Ativo</span>
                    <span
                      className={`status-badge ${
                        turmaSelecionada.ativo ? "ativo" : "inativo"
                      }`}
                    >
                      {turmaSelecionada.ativo ? "Sim" : "Não"}
                    </span>
                  </div>
                </div>

                {/* Alunos */}
                <div className="detalhes-section">
                  <h4>Alunos Matriculados ({turmaSelecionada.students?.length || 0})</h4>
                  {turmaSelecionada.students?.length > 0 ? (
                    <div className="alunos-lista">
                      {turmaSelecionada.students.map((aluno) => (
                        <div key={aluno.id} className="aluno-item">
                          <div className="aluno-avatar-small">
                            {aluno.user?.nome?.charAt(0).toUpperCase()}
                          </div>
                          <div className="aluno-detalhes">
                            <span className="aluno-nome">{aluno.user?.nome}</span>
                            <span className="aluno-matricula">{aluno.matricula}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">Nenhum aluno matriculado</p>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="detalhes-actions">
                  {/* Botão rápido extra para matricular diretamente a partir do menu lateral */}
                  <Link
                    to="/admin/matricular"
                    className="btn btn-secondary btn-block"
                    state={{ turmaId: turmaSelecionada.id }}
                    style={{ marginBottom: "8px", backgroundColor: "#2ec4b6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <UserPlus size={16} />
                    Matricular Aluno
                  </Link>
                  
                  <Link
                    to={`/admin/turmas/editar/${turmaSelecionada.id}`}
                    className="btn btn-primary btn-block"
                  >
                    <Edit2 size={16} />
                    Editar
                  </Link>
                  <button
                    className="btn btn-outline btn-block btn-danger"
                    onClick={() => deletarTurma(turmaSelecionada.id)}
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
              Tem certeza que deseja eliminar esta turma? Esta ação não pode ser
              desfeita e apagará o registro no servidor.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowConfirm(false);
                  setTurmaParaDeletar(null);
                  setTurmaSelecionada(null);
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