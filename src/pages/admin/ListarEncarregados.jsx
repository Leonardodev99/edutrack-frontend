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
  Users,
} from "lucide-react";
import { encarregadosStore, usersStore, alunosStore } from "../../utils/mockUsers.js";
import "../../styles/ListarEncarregados.css";

export default function ListarEncarregados() {
  const [encarregados, setEncarregados] = useState(encarregadosStore.list());
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [encarregadoSelecionado, setEncarregadoSelecionado] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [encarregadoParaDeletar, setEncarregadoParaDeletar] = useState(null);

  // Obter dados do usuário associado
  function obterUsuarioEncarregado(userId) {
    return usersStore.get(userId) || null;
  }

  // Obter nome do aluno
  function obterNomeAluno(alunoId) {
    const aluno = alunosStore.get(alunoId);
    if (!aluno) return "—";
    const user = usersStore.get(aluno.user_id);
    return user?.nome || "—";
  }

  // Filtrar e ordenar encarregados
  const encarregadosFiltrados = useMemo(() => {
    let resultado = encarregados.map((enc) => ({
      ...enc,
      user: obterUsuarioEncarregado(enc.user_id),
    }));

    // Filtro de busca
    if (busca) {
      resultado = resultado.filter(
        (e) =>
          e.user?.nome.toLowerCase().includes(busca.toLowerCase()) ||
          e.user?.email.toLowerCase().includes(busca.toLowerCase()) ||
          e.matricula.toLowerCase().includes(busca.toLowerCase()) ||
          e.telefone.toLowerCase().includes(busca.toLowerCase())
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
          return a.telefone.localeCompare(b.telefone);
        case "alunos":
          return (b.estudantes?.length || 0) - (a.estudantes?.length || 0);
        default:
          return 0;
      }
    });

    return resultado;
  }, [encarregados, busca, ordenacao]);

  // Deletar encarregado
  function deletarEncarregado(id, userId) {
    setEncarregadoParaDeletar({ id, userId });
    setShowConfirm(true);
  }

  function confirmarDelete() {
    if (encarregadoParaDeletar) {
      // Remove encarregado
      encarregadosStore.remove(encarregadoParaDeletar.id);
      // Remove usuário associado
      usersStore.remove(encarregadoParaDeletar.userId);

      setEncarregados(encarregadosStore.list());
      setShowConfirm(false);
      setEncarregadoParaDeletar(null);
      setEncarregadoSelecionado(null);
    }
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

      {/* Filtros e Busca */}
      <div className="filtros-bar">
        <div className="busca-box">
          <Search size={16} />
          <input
            type="text"
            className="input-busca"
            placeholder="Buscar por nome, email, telefone ou matrícula..."
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
          {!busca && (
            <Link to="/admin/encarregados/criar" className="btn btn-primary">
              Criar Encarregado
            </Link>
          )}
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
                  <th>Matrícula</th>
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
                        {enc.user?.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="encarregado-info">
                        <div className="encarregado-nome">{enc.user?.nome}</div>
                        <div className="encarregado-id">{enc.matricula}</div>
                      </div>
                    </td>
                    <td className="cell-email">
                      <a href={`mailto:${enc.user?.email}`}>{enc.user?.email}</a>
                    </td>
                    <td className="cell-telefone">
                      <div className="telefone-info">
                        <div className="telefone-principal">
                          <Phone size={14} /> {enc.telefone}
                        </div>
                        {enc.telefonePrincipal && (
                          <div className="telefone-secundario">
                            {enc.telefonePrincipal}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="cell-matricula">
                      <span className="matricula-badge">{enc.matricula}</span>
                    </td>
                    <td className="cell-alunos">
                      <span className="alunos-badge">
                        <Users size={14} />
                        {enc.estudantes?.length || 0} aluno{(enc.estudantes?.length || 0) === 1 ? "" : "s"}
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
                          onClick={() => deletarEncarregado(enc.id, enc.user_id)}
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
                  {encarregadoSelecionado.user?.nome.charAt(0).toUpperCase()}
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
                    <div className="telefone-detalhes">
                      <div>{encarregadoSelecionado.telefone}</div>
                      {encarregadoSelecionado.telefonePrincipal && (
                        <div className="telefone-secundario">
                          {encarregadoSelecionado.telefonePrincipal}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informações Profissionais */}
                <div className="detalhes-section">
                  <h4>Informações Administrativas</h4>
                  <div className="detalhes-item">
                    <span className="label">Matrícula</span>
                    <span className="value">{encarregadoSelecionado.matricula}</span>
                  </div>
                </div>

                {/* Alunos Associados */}
                <div className="detalhes-section">
                  <h4>Alunos Associados ({encarregadoSelecionado.estudantes?.length || 0})</h4>
                  {encarregadoSelecionado.estudantes?.length > 0 ? (
                    <div className="alunos-lista">
                      {encarregadoSelecionado.estudantes.map((alunoId) => (
                        <div key={alunoId} className="aluno-item">
                          <div className="aluno-avatar-small">
                            {obterNomeAluno(alunoId).charAt(0).toUpperCase()}
                          </div>
                          <span>{obterNomeAluno(alunoId)}</span>
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
                    onClick={() => {
                      deletarEncarregado(
                        encarregadoSelecionado.id,
                        encarregadoSelecionado.user_id
                      );
                      setEncarregadoSelecionado(null);
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
              Tem certeza que deseja eliminar este encarregado? Esta ação não pode ser
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