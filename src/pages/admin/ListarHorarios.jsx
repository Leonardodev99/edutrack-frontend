import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Clock, Trash2, Edit, Calendar, BookOpen, User, School } from "lucide-react";
import { horariosStore } from "../../utils/adminMockHorarios";
import { turmasStore } from "../../utils/adminMockData.js";
import { professoresStore, usersStore } from "../../utils/mockUsers.js";
import "../../styles/ListarHorarios.css";

const DIAS_SEMANA = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
];

export default function ListarHorarios() {
  const navigate = useNavigate();

  const [pesquisa, setPesquisa] = useState("");
  const [filtroDia, setFiltroDia] = useState("Todos");
  const [filtroTurma, setFiltroTurma] = useState("Todas");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const turmasDisponiveis = turmasStore.list();
  const professoresDisponiveis = professoresStore.list().map((prof) => ({
    ...prof,
    user: usersStore.get(prof.user_id),
  }));

  const horarios = horariosStore.list();

  function obterNomeTurma(classId) {
    return turmasStore.get(classId)?.nome || "—";
  }

  function obterNomeProfessor(teacherId) {
    const prof = professoresDisponiveis.find((p) => p.id == teacherId);
    return prof?.user?.nome || "—";
  }

  const horariosFiltrados = useMemo(() => {
    return horarios.filter((h) => {
      const nomeTurma = obterNomeTurma(h.class_id).toLowerCase();
      const nomeProfessor = obterNomeProfessor(h.teacher_id).toLowerCase();
      const disciplina = (h.disciplina || "").toLowerCase();
      const sala = (h.sala || "").toLowerCase();
      const termo = pesquisa.toLowerCase();

      const matchPesquisa =
        !termo ||
        nomeTurma.includes(termo) ||
        nomeProfessor.includes(termo) ||
        disciplina.includes(termo) ||
        sala.includes(termo) ||
        (h.codigo || "").toLowerCase().includes(termo);

      const matchDia = filtroDia === "Todos" || h.dia_semana === filtroDia;
      const matchTurma =
        filtroTurma === "Todas" || h.class_id == filtroTurma;

      return matchPesquisa && matchDia && matchTurma;
    });
  }, [horarios, pesquisa, filtroDia, filtroTurma]);

  // Agrupar por dia da semana
  const horariosPorDia = useMemo(() => {
    const diasComHorarios = DIAS_SEMANA.filter((dia) =>
      horariosFiltrados.some((h) => h.dia_semana === dia)
    );
    return diasComHorarios.map((dia) => ({
      dia,
      horarios: horariosFiltrados
        .filter((h) => h.dia_semana === dia)
        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
    }));
  }, [horariosFiltrados]);

  function handleEliminar(id) {
    horariosStore.delete(id);
    setConfirmDelete(null);
  }

  const diasAbrev = {
    "Segunda-feira": "SEG",
    "Terça-feira": "TER",
    "Quarta-feira": "QUA",
    "Quinta-feira": "QUI",
    "Sexta-feira": "SEX",
  };

  return (
    <div className="listar-horarios-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Horários</h1>
          <p className="page-subtitle">
            {horarios.length} horário{horarios.length !== 1 ? "s" : ""} registado{horarios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="btn btn-hero"
          onClick={() => navigate("/admin/horarios/criar")}
        >
          <Plus size={18} />
          Novo Horário
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Pesquisar por turma, professor, disciplina ou sala..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>

        <div className="filtros-selects">
          <select
            className="filtro-select"
            value={filtroDia}
            onChange={(e) => setFiltroDia(e.target.value)}
          >
            <option value="Todos">Todos os dias</option>
            {DIAS_SEMANA.map((dia) => (
              <option key={dia} value={dia}>
                {dia}
              </option>
            ))}
          </select>

          <select
            className="filtro-select"
            value={filtroTurma}
            onChange={(e) => setFiltroTurma(e.target.value)}
          >
            <option value="Todas">Todas as turmas</option>
            {turmasDisponiveis.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conteúdo */}
      {horarios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Calendar size={48} />
          </div>
          <h3>Nenhum horário criado</h3>
          <p>Comece por adicionar o primeiro horário de aulas.</p>
          <button
            className="btn btn-hero"
            onClick={() => navigate("/admin/horarios/criar")}
          >
            <Plus size={18} />
            Criar Horário
          </button>
        </div>
      ) : horariosFiltrados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={48} />
          </div>
          <h3>Sem resultados</h3>
          <p>Nenhum horário corresponde aos filtros selecionados.</p>
          <button
            className="btn btn-outline"
            onClick={() => {
              setPesquisa("");
              setFiltroDia("Todos");
              setFiltroTurma("Todas");
            }}
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="horarios-content">
          {horariosPorDia.map(({ dia, horarios: lista }) => (
            <div key={dia} className="dia-section">
              <div className="dia-header">
                <span className="dia-abrev">{diasAbrev[dia]}</span>
                <span className="dia-nome">{dia}</span>
                <span className="dia-count">
                  {lista.length} aula{lista.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="horarios-grid">
                {lista.map((h) => (
                  <div key={h.id} className="horario-card">
                    <div className="horario-card-top">
                      <span className="horario-codigo">{h.codigo}</span>
                      <div className="horario-actions">
                        <button
                          className="icon-btn icon-btn-edit"
                          title="Editar"
                          onClick={() => navigate(`/admin/horarios/editar/${h.id}`)}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="icon-btn icon-btn-delete"
                          title="Eliminar"
                          onClick={() => setConfirmDelete(h.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="horario-disciplina">
                      <BookOpen size={16} />
                      <span>{h.disciplina}</span>
                    </div>

                    <div className="horario-time">
                      <Clock size={14} />
                      <span>
                        {h.hora_inicio} — {h.hora_fim}
                      </span>
                    </div>

                    <div className="horario-meta">
                      <div className="meta-item">
                        <School size={13} />
                        <span>{obterNomeTurma(h.class_id)}</span>
                      </div>
                      <div className="meta-item">
                        <User size={13} />
                        <span>{obterNomeProfessor(h.teacher_id)}</span>
                      </div>
                    </div>

                    <div className="horario-sala">
                      Sala <strong>{h.sala}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmação */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Eliminar horário?</h3>
            <p>Esta ação não pode ser revertida.</p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleEliminar(confirmDelete)}
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
