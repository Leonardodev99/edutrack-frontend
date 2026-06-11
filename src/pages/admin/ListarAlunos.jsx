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
} from "lucide-react";
import api from "../../services/api"; // Instância do Axios
import "../../styles/ListarAlunos.css";

export default function ListarAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroCurso, setFiltroCurso] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alunoParaDeletar, setAlunoParaDeletar] = useState(null);

  // Estados de carregamento e feedback
  const [carregando, setCarregando] = useState(true);
  const [erroGeral, setErroGeral] = useState("");

  // 1. CARREGAR ALUNOS DO BACKEND (GET /students)
  async function carregarAlunos() {
    setCarregando(true);
    setErroGeral("");
    try {
      // CORREÇÃO AQUI: Buscando a chave correta que o EduTrack utiliza
      const token = localStorage.getItem("@EduTrack:token");
      
      const response = await api.get("/students", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAlunos(response.data);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar lista de alunos.";
      setErroGeral(msg);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAlunos();
  }, []);

  // 2. VER DETALHES (GET /students/:id)
  async function verDetalhes(aluno) {
    try {
      const token = localStorage.getItem("@EduTrack:token");
      const response = await api.get(`/students/${aluno.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlunoSelecionado(response.data);
    } catch (error) {
      // Fallback para os dados que já existem na listagem caso falhe
      setAlunoSelecionado(aluno);
    }
  }

  // 3. DISPARAR FLUXO DE EXCLUSÃO
  function deletarAluno(id) {
    setAlunoParaDeletar(id);
    setShowConfirm(true);
  }

  // 4. CONFIRMAR DELEÇÃO (DELETE /students/:id)
  async function confirmarDelete() {
    if (!alunoParaDeletar) return;

    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      await api.delete(`/students/${alunoParaDeletar}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Atualiza o estado removendo localmente o aluno eliminado
      setAlunos((prev) => prev.filter((a) => a.id !== alunoParaDeletar));
      setShowConfirm(false);
      setAlunoParaDeletar(null);
      setAlunoSelecionado(null);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao remover aluno do servidor.";
      alert(msg);
      setShowConfirm(false);
    }
  }

  // --- Lógica de Filtros e Ordenação no Frontend ---
  const alunosFiltrados = useMemo(() => {
    let resultado = [...alunos];

    if (busca) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (a) =>
          a.user?.nome?.toLowerCase().includes(buscaLower) ||
          a.user?.email?.toLowerCase().includes(buscaLower) ||
          a.matricula?.toLowerCase().includes(buscaLower) ||
          a.id?.toString().includes(buscaLower)
      );
    }

    if (filtroCurso !== "todos") {
      resultado = resultado.filter((a) => a.curso === filtroCurso);
    }

    if (filtroEstado !== "todos") {
      const statusAlvo = filtroEstado === "ativo";
      resultado = resultado.filter((a) => a.ativo === statusAlvo);
    }

    resultado.sort((a, b) => {
      switch (ordenacao) {
        case "nome":
          return (a.user?.nome || "").localeCompare(b.user?.nome || "");
        case "email":
          return (a.user?.email || "").localeCompare(b.user?.email || "");
        case "matricula":
          return (a.matricula || "").localeCompare(b.matricula || "");
        default:
          return 0;
      }
    });

    return resultado;
  }, [alunos, busca, filtroCurso, filtroEstado, ordenacao]);

  // Mapeia os cursos existentes dinamicamente para o filtro de cursos
  const cursosDisponiveis = useMemo(() => {
    const listaCursos = alunos.map((a) => a.curso).filter(Boolean);
    return [...new Set(listaCursos)];
  }, [alunos]);

  if (carregando) {
    return (
      <div className="listar-alunos-page">
        <p className="page-subtitle">A carregar alunos do sistema...</p>
      </div>
    );
  }

  return (
    <div className="listar-alunos-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Alunos</h1>
          <p className="page-subtitle">
            Gerencie os alunos do sistema (Total: {alunosFiltrados.length})
          </p>
        </div>
        <Link to="/admin/alunos/criar" className="btn btn-hero">
          <Plus size={18} />
          Novo Aluno
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
            placeholder="Buscar por nome, email ou matrícula..."
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
                <option key={curso} value={curso}>{curso}</option>
              ))}
            </select>
          </div>

          <div className="filtro-select">
            <Filter size={16} />
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos os estados</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          <div className="filtro-select">
            <ChevronDown size={16} />
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
              <option value="nome">Ordenar por nome</option>
              <option value="email">Ordenar por email</option>
              <option value="matricula">Ordenar por matrícula</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sem Resultados */}
      {alunosFiltrados.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon"><Search size={48} /></div>
          <h3>Nenhum aluno encontrado</h3>
          <p>{busca ? "Tente ajustar os filtros ou a busca" : "Crie o primeiro aluno para começar"}</p>
        </div>
      )}

      {/* Tabela de Alunos */}
      {alunosFiltrados.length > 0 && (
        <div className="alunos-container">
          <div className="alunos-table-wrapper">
            <table className="alunos-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Matrícula</th>
                  <th>Curso</th>
                  <th>Estado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunosFiltrados.map((aluno) => (
                  <tr
                    key={aluno.id}
                    className={alunoSelecionado?.id === aluno.id ? "is-selected" : ""}
                  >
                    <td className="cell-nome">
                      <div className="aluno-avatar">
                        {aluno.user?.nome?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <div className="aluno-info">
                        <div className="aluno-nome">{aluno.user?.nome || "Sem Nome"}</div>
                        <div className="aluno-id">ID Interno: {aluno.id}</div>
                      </div>
                    </td>
                    <td className="cell-email">
                      <a href={`mailto:${aluno.user?.email}`}>{aluno.user?.email || "—"}</a>
                    </td>
                    <td className="cell-data">{aluno.matricula}</td>
                    <td className="cell-turma">
                      <span className="badge badge-primary">{aluno.curso || "Geral"}</span>
                    </td>
                    <td className="cell-estado">
                      <span className={`status-badge ${aluno.ativo ? "status-ativo" : "status-inativo"}`}>
                        {aluno.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="cell-acoes">
                      <div className="acoes-group">
                        <button
                          className="btn-icon btn-icon-info"
                          title="Ver detalhes"
                          onClick={() => verDetalhes(aluno)}
                        >
                          <Eye size={16} />
                        </button>
                        
                        <Link
                          to={`/admin/alunos/editar/${aluno.id}`}
                          className="btn-icon btn-icon-edit"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </Link>

                        <button
                          className="btn-icon btn-icon-delete"
                          title="Deletar"
                          onClick={() => deletarAluno(aluno.id)}
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
          {alunoSelecionado && (
            <div className="detalhes-sidebar">
              <div className="detalhes-header">
                <h3>Detalhes do Aluno</h3>
                <button className="btn-close" onClick={() => setAlunoSelecionado(null)}>×</button>
              </div>

              <div className="detalhes-content">
                <div className="detalhes-avatar">
                  {alunoSelecionado.user?.nome?.charAt(0).toUpperCase() || "A"}
                </div>

                <div className="detalhes-section">
                  <h4>Informações Pessoais</h4>
                  <div className="detalhes-item">
                    <span className="label">Nome</span>
                    <span className="value">{alunoSelecionado.user?.nome}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">Matrícula</span>
                    <span className="value">{alunoSelecionado.matricula}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">Ano de Ingresso</span>
                    <span className="value">{alunoSelecionado.ano_ingresso || "—"}</span>
                  </div>
                </div>

                <div className="detalhes-section">
                  <h4>Contato</h4>
                  <div className="detalhes-item">
                    <Mail size={14} />
                    <a href={`mailto:${alunoSelecionado.user?.email}`}>{alunoSelecionado.user?.email}</a>
                  </div>
                </div>

                <div className="detalhes-section">
                  <h4>Informações Académicas</h4>
                  <div className="detalhes-item">
                    <span className="label">Curso</span>
                    <span className="value">{alunoSelecionado.curso || "Geral"}</span>
                  </div>
                </div>

                <div className="detalhes-actions">
                  <Link to={`/admin/alunos/editar/${alunoSelecionado.id}`} className="btn btn-primary btn-block">
                    <Edit2 size={16} /> Editar
                  </Link>
                  <button
                    className="btn btn-outline btn-block btn-danger"
                    onClick={() => deletarAluno(alunoSelecionado.id)}
                  >
                    <Trash2 size={16} /> Deletar
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
            <h3>Confirmar Eliminação</h3>
            <p>Tem certeza que deseja eliminar este aluno? Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setShowConfirm(false);
                  setAlunoParaDeletar(null);
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