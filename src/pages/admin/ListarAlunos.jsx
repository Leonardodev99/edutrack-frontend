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
  Phone,
} from "lucide-react";
import { alunosStore } from "../../utils/adminMockData.js";
import { nomeTurma } from "../../utils/adminMockData.js";
import "../../styles/ListarAlunos.css";

export default function ListarAlunos() {
  const [alunos, setAlunos] = useState(alunosStore.list());
  const [busca, setBusca] = useState("");
  const [filtroTurma, setFiltroTurma] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alunoParaDeletar, setAlunoParaDeletar] = useState(null);

  // Filtrar e ordenar alunos
  const alunosFiltrados = useMemo(() => {
    let resultado = [...alunos];

    // Filtro de busca
    if (busca) {
      resultado = resultado.filter(
        (a) =>
          a.nome.toLowerCase().includes(busca.toLowerCase()) ||
          a.email.toLowerCase().includes(busca.toLowerCase()) ||
          a.id.toLowerCase().includes(busca.toLowerCase())
      );
    }

    // Filtro de turma
    if (filtroTurma !== "todas") {
      resultado = resultado.filter((a) => a.turmaId === filtroTurma);
    }

    // Filtro de estado
    if (filtroEstado !== "todos") {
      const semTurma = filtroEstado === "sem-turma";
      resultado = resultado.filter((a) => {
        const temTurma = !!a.turmaId;
        return semTurma ? !temTurma : temTurma;
      });
    }

    // Ordenação
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case "nome":
          return a.nome.localeCompare(b.nome);
        case "email":
          return a.email.localeCompare(b.email);
        case "data-criacao":
          return new Date(a.dataNasc) - new Date(b.dataNasc);
        default:
          return 0;
      }
    });

    return resultado;
  }, [alunos, busca, filtroTurma, filtroEstado, ordenacao]);

  // Deletar aluno
  function deletarAluno(id) {
    setAlunoParaDeletar(id);
    setShowConfirm(true);
  }

  function confirmarDelete() {
    if (alunoParaDeletar) {
      alunosStore.remove(alunoParaDeletar);
      setAlunos(alunosStore.list());
      setShowConfirm(false);
      setAlunoParaDeletar(null);
      setAlunoSelecionado(null);
    }
  }

  // Formatar data
  function formatarData(data) {
    return new Date(data).toLocaleDateString("pt-PT");
  }

  // Calcular idade
  function calcularIdade(dataNasc) {
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
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
            <select value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)}>
              <option value="todas">Todas as turmas</option>
              <option value="t-1">10º A</option>
              <option value="t-2">10º B</option>
              <option value="t-3">11º A</option>
            </select>
          </div>

          <div className="filtro-select">
            <Filter size={16} />
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos os estados</option>
              <option value="com-turma">Com turma</option>
              <option value="sem-turma">Sem turma</option>
            </select>
          </div>

          <div className="filtro-select">
            <ChevronDown size={16} />
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
              <option value="nome">Ordenar por nome</option>
              <option value="email">Ordenar por email</option>
              <option value="data-criacao">Ordenar por data de nascimento</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aviso de sem resultados */}
      {alunosFiltrados.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={48} />
          </div>
          <h3>Nenhum aluno encontrado</h3>
          <p>
            {busca
              ? "Tente ajustar os filtros ou a busca"
              : "Crie o primeiro aluno para começar"}
          </p>
          {!busca && (
            <Link to="/admin/alunos/criar" className="btn btn-primary">
              Criar Aluno
            </Link>
          )}
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
                  <th>Data de Nascimento</th>
                  <th>Turma</th>
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
                        {aluno.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="aluno-info">
                        <div className="aluno-nome">{aluno.nome}</div>
                        <div className="aluno-id">{aluno.id}</div>
                      </div>
                    </td>
                    <td className="cell-email">
                      <a href={`mailto:${aluno.email}`}>{aluno.email}</a>
                    </td>
                    <td className="cell-data">
                      {formatarData(aluno.dataNasc)}
                      <span className="idade-badge">
                        {calcularIdade(aluno.dataNasc)} anos
                      </span>
                    </td>
                    <td className="cell-turma">
                      {aluno.turmaId ? (
                        <span className="badge badge-primary">
                          {nomeTurma(aluno.turmaId)}
                        </span>
                      ) : (
                        <span className="badge badge-warning">Sem turma</span>
                      )}
                    </td>
                    <td className="cell-estado">
                      <span
                        className={`status-badge ${
                          aluno.turmaId ? "status-ativo" : "status-inativo"
                        }`}
                      >
                        {aluno.turmaId ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="cell-acoes">
                      <div className="acoes-group">
                        <button
                          className="btn-icon btn-icon-info"
                          title="Ver detalhes"
                          onClick={() => setAlunoSelecionado(aluno)}
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
                        <Link to="/admin/alunos/matricular" className="btn btn-primary">
                          <Plus size={18} />
                          Matricular Aluno
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
                <button
                  className="btn-close"
                  onClick={() => setAlunoSelecionado(null)}
                >
                  ×
                </button>
              </div>

              <div className="detalhes-content">
                {/* Avatar Grande */}
                <div className="detalhes-avatar">
                  {alunoSelecionado.nome.charAt(0).toUpperCase()}
                </div>

                {/* Informações Pessoais */}
                <div className="detalhes-section">
                  <h4>Informações Pessoais</h4>
                  <div className="detalhes-item">
                    <span className="label">Nome</span>
                    <span className="value">{alunoSelecionado.nome}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">ID</span>
                    <span className="value">{alunoSelecionado.id}</span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">Data de Nascimento</span>
                    <span className="value">
                      {formatarData(alunoSelecionado.dataNasc)}
                      <br />
                      <small>
                        ({calcularIdade(alunoSelecionado.dataNasc)} anos)
                      </small>
                    </span>
                  </div>
                </div>

                {/* Contato */}
                <div className="detalhes-section">
                  <h4>Contato</h4>
                  <div className="detalhes-item">
                    <Mail size={14} />
                    <a href={`mailto:${alunoSelecionado.email}`}>
                      {alunoSelecionado.email}
                    </a>
                  </div>
                </div>

                {/* Informações Académicas */}
                <div className="detalhes-section">
                  <h4>Informações Académicas</h4>
                  <div className="detalhes-item">
                    <span className="label">Turma</span>
                    <span className="value">
                      {alunoSelecionado.turmaId ? (
                        <span className="badge badge-primary">
                          {nomeTurma(alunoSelecionado.turmaId)}
                        </span>
                      ) : (
                        <span className="badge badge-warning">Sem turma</span>
                      )}
                    </span>
                  </div>
                  <div className="detalhes-item">
                    <span className="label">Encarregado</span>
                    <span className="value">
                      {alunoSelecionado.encarregadoId || "—"}
                    </span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="detalhes-actions">
                  <Link
                    to={`/admin/alunos/editar/${alunoSelecionado.id}`}
                    className="btn btn-primary btn-block"
                  >
                    <Edit2 size={16} />
                    Editar
                  </Link>
                  <button
                    className="btn btn-outline btn-block btn-danger"
                    onClick={() => {
                      deletarAluno(alunoSelecionado.id);
                      setAlunoSelecionado(null);
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
              Tem certeza que deseja eliminar este aluno? Esta ação não pode ser
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