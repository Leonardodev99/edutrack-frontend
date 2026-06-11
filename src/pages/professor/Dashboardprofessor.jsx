import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  BookOpen,
  FileCheck,
  Star,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Circle,
  TrendingUp,
  Users,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import api from "../../services/api";
import "../../styles/Dashboardprofessor.css";

// Helpers mantidos para formatação e regras de prazo
function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function daysUntil(iso) {
  const diff = new Date(iso) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function taskStatus(deadline) {
  const d = daysUntil(deadline);
  if (d < 0) return { label: "Expirada", tone: "danger" };
  if (d <= 3) return { label: `${d}d`, tone: "warning" };
  return { label: `${d}d`, tone: "ok" };
}

export default function DashboardProfessor() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("visao");

  // Estados dos dados carregados do backend
  const [attendances, setAttendances] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [grades, setGrades] = useState([]);

  // Estados de controle da interface
  const [carregando, setCarregando] = useState(true);
  const [erroGeral, setErroGeral] = useState("");

  // O ID e Nome do professor podem ser extraídos dinamicamente do Token se preferir, 
  // aqui mantemos uma referência local baseada no fluxo do EduTrack.
  const [professor] = useState({ nome: "Professor", disciplina: "EduTrack" });

  useEffect(() => {
    async function carregarDadosDashboard() {
      try {
        setCarregando(true);
        const token = localStorage.getItem("@EduTrack:token");
        const headers = { Authorization: `Bearer ${token}` };

        // Carregamento simultâneo de todos os dados protegidos do backend
        const [
          attendancesRes,
          tasksRes,
          submissionsRes,
          pendingRes,
          gradesRes
        ] = await Promise.all([
          api.get("/attendances", { headers }).catch(() => ({ data: [] })),
          api.get("/tasks", { headers }).catch(() => ({ data: [] })),
          api.get("/submissions", { headers }).catch(() => ({ data: [] })),
          api.get("/submissions/pending", { headers }).catch(() => ({ data: [] })),
          api.get("/grades", { headers }).catch(() => ({ data: [] }))
        ]);

        setAttendances(attendancesRes.data);
        setTasks(tasksRes.data);
        setSubmissions(submissionsRes.data);
        setPendingSubmissions(pendingRes.data);
        setGrades(gradesRes.data);
      } catch (error) {
        console.error("Erro ao processar dados do dashboard:", error);
        setErroGeral("Houve um problema ao carregar as informações do servidor.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosDashboard();
  }, []);

  // ── Cálculos Dinâmicos baseados no Backend (Memos) ───────────────────────
  const totalPresencas = useMemo(() => attendances.filter((a) => a.presente).length, [attendances]);
  const totalFaltas = useMemo(() => attendances.filter((a) => !a.presente).length, [attendances]);
  
  const taxaPresenca = useMemo(() => {
    return attendances.length ? Math.round((totalPresencas / attendances.length) * 100) : 0;
  }, [attendances, totalPresencas]);

  const mediaNotas = useMemo(() => {
    if (!grades.length) return "—";
    // Mapeia tanto para 'score' quanto para 'grade' caso varie no backend
    const soma = grades.reduce((acc, g) => acc + Number(g.score || g.grade || 0), 0);
    return (soma / grades.length).toFixed(1);
  }, [grades]);

  // Agrupamento de chamadas de presença por data
  const presencaPorData = useMemo(() => {
    return attendances.reduce((acc, a) => {
      const dataChave = a.data_aula || (a.createdAt ? a.createdAt.split("T")[0] : "Sem Data");
      acc[dataChave] = acc[dataChave] || { presentes: 0, faltas: 0 };
      a.presente ? acc[dataChave].presentes++ : acc[dataChave].faltas++;
      return acc;
    }, {});
  }, [attendances]);

  const TABS = [
    { id: "visao", label: "Visão Geral" },
    { id: "presencas", label: "Presenças" },
    { id: "tarefas", label: "Tarefas" },
    { id: "submissoes", label: "Submissões" },
    { id: "notas", label: "Notas" },
  ];

  if (carregando) return <div className="loading">Carregando painel de controle...</div>;
  if (erroGeral) return <div className="alert alert-danger">{erroGeral}</div>;

  return (
    <div className="dash-prof">
      {/* ── Header ── */}
      <div className="dash-header">
        <div className="dash-header-text">
          <p className="dash-greeting">Bem-vindo de volta,</p>
          <h1 className="dash-title">{professor.nome}</h1>
          <p className="dash-sub">{professor.disciplina} · Gestão Escolar</p>
        </div>
        <div className="dash-header-date">
          <CalendarDays size={16} />
          <span>{new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="dash-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`dash-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="dash-body">

        {/* ══════════ VISÃO GERAL ══════════ */}
        {activeTab === "visao" && (
          <>
            <div className="stat-grid">
              <StatCard icon={Users} label="Taxa de Presença" value={`${taxaPresenca}%`} hint={`${totalFaltas} faltas registadas`} tone="primary" />
              <StatCard icon={BookOpen} label="Tarefas Ativas" value={tasks.length} hint="Total publicado" tone="ok" />
              <StatCard icon={ClipboardList} label="Submissões" value={submissions.length} hint={`${pendingSubmissions.length} pendentes`} tone="warning" />
              <StatCard icon={Star} label="Média das Notas" value={mediaNotas} hint={`${grades.length} atribuídas`} tone="success" />
            </div>

            <div className="dash-two-col">
              {/* Próximas tarefas */}
              <div className="panel">
                <div className="panel-head">
                  <span className="panel-title">Próximas Tarefas</span>
                  <button className="panel-link" onClick={() => setActiveTab("tarefas")}>
                    Ver todas <ArrowRight size={14} />
                  </button>
                </div>
                <div className="panel-list">
                  {tasks.length === 0 ? (
                    <div className="panel-empty-text">Nenhuma tarefa cadastrada.</div>
                  ) : (
                    tasks.slice(0, 3).map((t) => {
                      const s = taskStatus(t.deadline);
                      return (
                        <div key={t.id} className="task-row">
                          <div className="task-row-left">
                            <div className={`deadline-dot dot-${s.tone}`} />
                            <div>
                              <div className="task-row-title">{t.title}</div>
                              <div className="task-row-meta">{formatDate(t.deadline)}</div>
                            </div>
                          </div>
                          <span className={`badge-deadline badge-${s.tone}`}>{s.label}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Submissões pendentes usando /submissions/pending */}
              <div className="panel">
                <div className="panel-head">
                  <span className="panel-title">Para Corrigir</span>
                  <button className="panel-link" onClick={() => setActiveTab("submissoes")}>
                    Ver todas <ArrowRight size={14} />
                  </button>
                </div>
                {pendingSubmissions.length === 0 ? (
                  <div className="panel-empty">
                    <CheckCircle2 size={28} />
                    <span>Tudo em dia!</span>
                  </div>
                ) : (
                  <div className="panel-list">
                    {pendingSubmissions.slice(0, 4).map((s) => {
                      const currentTask = tasks.find((t) => t.id === s.task_id);
                      return (
                        <div key={s.id} className="subm-row">
                          <Circle size={8} className="subm-dot" />
                          <div>
                            <div className="subm-row-title">{currentTask?.title || `Tarefa #${s.task_id}`}</div>
                            <div className="subm-row-meta">Aluno #{s.student_id}</div>
                          </div>
                          <span className="badge-status badge-pendente">Pendente</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ══════════ PRESENÇAS ══════════ */}
        {activeTab === "presencas" && (
          <div className="panel panel-full">
            <div className="panel-head">
              <span className="panel-title">Registo de Presenças</span>
              <div className="presenca-summary">
                <span className="presenca-chip chip-ok">✓ {totalPresencas} presentes</span>
                <span className="presenca-chip chip-danger">✗ {totalFaltas} faltas</span>
              </div>
            </div>

            <div className="presenca-by-date">
              {Object.entries(presencaPorData).length === 0 ? (
                <div className="panel-empty-text">Sem registo de faltas ou presenças nesta turma.</div>
              ) : (
                Object.entries(presencaPorData)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([data, counts]) => (
                    <div key={data} className="presenca-date-group">
                      <div className="presenca-date-label">
                        <CalendarDays size={14} />
                        {formatDate(data)}
                      </div>
                      <div className="presenca-rows">
                        {attendances.filter((a) => (a.data_aula || a.createdAt?.split("T")[0]) === data).map((a) => (
                          <div key={a.id} className={`presenca-row ${a.presente ? "row-presente" : "row-falta"}`}>
                            <div className="presenca-row-left">
                              {a.presente
                                ? <CheckCircle2 size={16} className="icon-ok" />
                                : <AlertCircle size={16} className="icon-danger" />}
                              <span>Aluno #{a.student_id}</span>
                            </div>
                            <div className="presenca-row-right">
                              {a.observacao && <span className="presenca-obs">{a.observacao}</span>}
                              <span className={`badge-status ${a.presente ? "badge-ok" : "badge-danger"}`}>
                                {a.presente ? "Presente" : "Falta"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>

            <button className="btn-add" onClick={() => navigate("/professor/presencas/registar")}>
              + Registar Presença
            </button>
          </div>
        )}

        {/* ══════════ TAREFAS ══════════ */}
        {activeTab === "tarefas" && (
          <div className="panel panel-full">
            <div className="panel-head">
              <span className="panel-title">Tarefas</span>
              <button className="btn-add-sm" onClick={() => navigate("/professor/tarefas/criar")}>
                + Nova Tarefa
              </button>
            </div>
            <div className="tasks-list">
              {tasks.length === 0 ? (
                <div className="panel-empty-text">Nenhuma tarefa publicada.</div>
              ) : (
                tasks.map((t) => {
                  const s = taskStatus(t.deadline);
                  const subs = submissions.filter((sub) => sub.task_id === t.id);
                  const pend = pendingSubmissions.filter((sub) => sub.task_id === t.id).length;
                  return (
                    <div key={t.id} className="task-card">
                      <div className="task-card-head">
                        <div>
                          <div className="task-card-title">{t.title}</div>
                          <div className="task-card-desc">{t.description}</div>
                        </div>
                        <span className={`badge-deadline badge-${s.tone}`}>
                          <Clock size={12} /> {formatDate(t.deadline)}
                        </span>
                      </div>
                      <div className="task-card-foot">
                        <span className="task-meta-item">
                          <FileCheck size={13} /> {subs.length} submissões
                        </span>
                        {pend > 0 && (
                          <span className="task-meta-item task-meta-warn">
                            <AlertCircle size={13} /> {pend} por corrigir
                          </span>
                        )}
                        <button className="task-card-btn" onClick={() => navigate(`/professor/tarefas/${t.id}`)}>
                          Ver detalhes <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ══════════ SUBMISSÕES ══════════ */}
        {activeTab === "submissoes" && (
          <div className="panel panel-full">
            <div className="panel-head">
              <span className="panel-title">Submissões</span>
              <div className="subm-chips">
                <span className="presenca-chip chip-warning">{pendingSubmissions.length} pendentes</span>
                <span className="presenca-chip chip-ok">{submissions.length - pendingSubmissions.length} corrigidas</span>
              </div>
            </div>

            <div className="subm-table-wrap">
              <table className="subm-table">
                <thead>
                  <tr>
                    <th>Tarefa</th>
                    <th>Aluno</th>
                    <th>Conteúdo</th>
                    <th>Ficheiro</th>
                    <th>Estado</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="td-muted" style={{ textAlign: "center" }}>Nenhuma entrega efetuada ainda.</td>
                    </tr>
                  ) : (
                    submissions.map((s) => {
                      const currentTask = tasks.find((t) => t.id === s.task_id);
                      const isPending = pendingSubmissions.some((p) => p.id === s.id);
                      return (
                        <tr key={s.id}>
                          <td className="td-bold">{currentTask?.title || `Tarefa #${s.task_id}`}</td>
                          <td>Aluno #{s.student_id}</td>
                          <td className="td-content">{s.content || "—"}</td>
                          <td>
                            {s.file_url ? (
                              <a href={s.file_url} target="_blank" rel="noreferrer" className="file-link">📎 Abrir Ficheiro</a>
                            ) : (
                              <span className="td-muted">—</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge-status badge-${isPending ? "pendente" : "ok"}`}>
                              {isPending ? "Pendente" : "Corrigido"}
                            </span>
                          </td>
                          <td className="td-muted">{s.feedback || "—"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════ NOTAS ══════════ */}
        {activeTab === "notas" && (
          <div className="dash-two-col">
            {/* Notas atribuídas */}
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">Notas Atribuídas</span>
                <span className="panel-count">{grades.length}</span>
              </div>
              <div className="grades-list">
                {grades.length === 0 ? (
                  <div className="panel-empty-text">Nenhuma nota emitida.</div>
                ) : (
                  grades.map((g) => {
                    const sub = submissions.find((s) => s.id === g.submission_id);
                    const task = tasks.find((t) => t.id === sub?.task_id);
                    const notaExibida = g.score || g.grade || 0;
                    return (
                      <div key={g.id} className="grade-row">
                        <div className="grade-row-left">
                          <div className={`grade-badge ${notaExibida >= 10 ? "grade-ok" : "grade-fail"}`}>
                            {notaExibida}
                          </div>
                          <div>
                            <div className="grade-task">{task?.title || "Tarefa Eliminada"}</div>
                            <div className="grade-student">Aluno #{sub?.student_id || g.student_id}</div>
                          </div>
                        </div>
                        <div className="grade-feedback">{g.feedback || "Sem observações descritivas."}</div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="media-bar">
                <TrendingUp size={15} />
                <span>Média geral: <strong>{mediaNotas} / 20</strong></span>
              </div>
            </div>

            {/* Submissões sem nota (Aproveitando a lista pendente) */}
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">Aguardando Avaliação</span>
                <span className="panel-count panel-count-warn">{pendingSubmissions.length}</span>
              </div>
              {pendingSubmissions.length === 0 ? (
                <div className="panel-empty">
                  <CheckCircle2 size={28} />
                  <span>Todas avaliadas!</span>
                </div>
              ) : (
                <div className="grades-list">
                  {pendingSubmissions.map((s) => {
                    const task = tasks.find((t) => t.id === s.task_id);
                    return (
                      <div key={s.id} className="grade-row">
                        <div className="grade-row-left">
                          <div className="grade-badge grade-empty">—</div>
                          <div>
                            <div className="grade-task">{task?.title || `Tarefa #${s.task_id}`}</div>
                            <div className="grade-student">Aluno #{s.student_id}</div>
                          </div>
                        </div>
                        <button className="btn-avaliar" onClick={() => navigate(`/professor/notas/avaliar/${s.id}`)}>
                          Avaliar
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── StatCard helper ──────────────────────────────────────────
function StatCard({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-icon-wrap">
        <Icon size={20} />
      </div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </div>
  );
}