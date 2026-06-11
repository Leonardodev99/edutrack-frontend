import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Clock, Trash2, Edit, Calendar, BookOpen, User, School, Loader } from "lucide-react";
import api from "../../services/api";
import "../../styles/ListarHorarios.css";

const DIAS_SEMANA = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
];

// 🔄 Tradutor do formato do Banco para o formato do Front-end
const MAPA_BANCO_PARA_FRONT = {
  "segunda": "Segunda-feira",
  "terca": "Terça-feira",
  "quarta": "Quarta-feira",
  "quinta": "Quinta-feira",
  "sexta": "Sexta-feira"
};

export default function ListarHorarios() {
  const navigate = useNavigate();

  const [horarios, setHorarios] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroDia, setFiltroDia] = useState("Todos");
  const [filtroTurma, setFiltroTurma] = useState("Todas");
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const [carregando, setCarregando] = useState(true);
  const [erroGeral, setErroGeral] = useState("");
  const [turmas, setTurmas] = useState([]);

  async function carregarHorarios() {
    setCarregando(true);
    setErroGeral("");
    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      const response = await api.get("/schedules", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mapeia os horários normalizando o dia_semana vindo do back-end
      const horariosNormalizados = response.data.map(h => ({
        ...h,
        // Se vier "segunda", vira "Segunda-feira". Se já vier correto, mantém.
        dia_semana: MAPA_BANCO_PARA_FRONT[h.dia_semana] || h.dia_semana
      }));

      setHorarios(horariosNormalizados);
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao carregar lista de horários.";
      setErroGeral(msg);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarTurmas() {
    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      const response = await api.get("/classes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTurmas(response.data);
    } catch (error) {
      console.error("Erro ao carregar turmas:", error);
    }
  }

  useEffect(() => {
    carregarHorarios();
    carregarTurmas();
  }, []);

  // Filtrar horários
  const horariosFiltrados = useMemo(() => {
    return horarios.filter((h) => {
      // Garante suporte tanto para "class" quanto para "Class" (vulnerabilidade comum do Sequelize)
      const dadosTurma = h.class || h.Class;
      const dadosProfessor = h.teacher || h.Teacher;

      const nomeTurma = (dadosTurma?.nome || "").toLowerCase();
      
      // Procura o nome do usuário associado ao professor de forma segura nas duas capitalizações
      const nomeProfessor = (
        dadosProfessor?.User?.nome || 
        dadosProfessor?.user?.nome || 
        ""
      ).toLowerCase();

      const disciplina = (h.disciplina || "").toLowerCase();
      const sala = (h.sala || "").toLowerCase();
      const termo = pesquisa.toLowerCase();

      const matchPesquisa =
        !termo ||
        nomeTurma.includes(termo) ||
        nomeProfessor.includes(termo) ||
        disciplina.includes(termo) ||
        sala.includes(termo) ||
        (h.id || "").toString().includes(termo);

      const matchDia = filtroDia === "Todos" || h.dia_semana === filtroDia;
      const matchTurma = filtroTurma === "Todas" || h.class_id == filtroTurma;

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

  async function handleEliminar(id) {
    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      await api.delete(`/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setHorarios((prev) => prev.filter((h) => h.id !== id));
      setConfirmDelete(null);
    } catch (error) {
      const msg = error.response?.data?.error || "Apenas gestores podem eliminar horários.";
      alert(msg);
      setConfirmDelete(null);
    }
  }

  const diasAbrev = {
    "Segunda-feira": "SEG",
    "Terça-feira": "TER",
    "Quarta-feira": "QUA",
    "Quinta-feira": "QUI",
    "Sexta-feira": "SEX",
  };

  if (carregando) {
    return (
      <div className="listar-horarios-page">
        <div className="loading-state">
          <Loader size={48} className="spinner" />
          <p>A carregar horários do sistema...</p>
        </div>
      </div>
    );
  }

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

      {erroGeral && <div className="alert alert-danger">{erroGeral}</div>}

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
            {turmas.map((t) => (
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
                {lista.map((h) => {
                  const tObj = h.class || h.Class;
                  const pObj = h.teacher || h.Teacher;
                  // Remove os segundos (:00) finais das horas para ficar visualmente limpo
                  const inicioFormatado = h.hora_inicio?.slice(0, 5) || "—";
                  const fimFormatado = h.hora_fim?.slice(0, 5) || "—";

                  return (
                    <div key={h.id} className="horario-card">
                      <div className="horario-card-top">
                        <span className="horario-codigo">ID #{h.id}</span>
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
                        <span>{h.disciplina || "—"}</span>
                      </div>

                      <div className="horario-time">
                        <Clock size={14} />
                        <span>
                          {inicioFormatado} — {fimFormatado}
                        </span>
                      </div>

                      <div className="horario-meta">
                        <div className="meta-item">
                          <School size={13} />
                          <span>{tObj?.nome || "—"}</span>
                        </div>
                        <div className="meta-item">
                          <User size={13} />
                          <span>{pObj?.User?.nome || pObj?.user?.nome || `Prof. ID ${h.teacher_id}`}</span>
                        </div>
                      </div>

                      <div className="horario-sala">
                        Sala <strong>{h.sala || "—"}</strong>
                      </div>
                    </div>
                  );
                })}
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