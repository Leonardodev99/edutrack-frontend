import { useState } from "react";
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
import "../../styles/Dashboardprofessor.css";

// ── Mock data ──────────────────────────────────────────────
const PROFESSOR = { id: 1, nome: "Prof. Ana Sousa", disciplina: "Matemática" };

const ATTENDANCES = [
  { id: 1, student_id: 10, schedule_id: 3, teacher_id: 1, data_aula: "2025-05-20", presente: true,  observacao: ""                  },
  { id: 2, student_id: 11, schedule_id: 3, teacher_id: 1, data_aula: "2025-05-20", presente: false, observacao: "Faltou sem justificação" },
  { id: 3, student_id: 12, schedule_id: 3, teacher_id: 1, data_aula: "2025-05-20", presente: true,  observacao: ""                  },
  { id: 4, student_id: 10, schedule_id: 3, teacher_id: 1, data_aula: "2025-05-21", presente: true,  observacao: ""                  },
  { id: 5, student_id: 11, schedule_id: 3, teacher_id: 1, data_aula: "2025-05-21", presente: true,  observacao: ""                  },
  { id: 6, student_id: 13, schedule_id: 4, teacher_id: 1, data_aula: "2025-05-22", presente: false, observacao: "Doença"            },
];

const TASKS = [
  { id: 1, title: "Exercícios de Álgebra",    description: "Capítulo 3, pág. 45–50", deadline: "2025-05-28", teacher_id: 1 },
  { id: 2, title: "Teste de Geometria",        description: "Matéria do 2.º trimestre", deadline: "2025-06-02", teacher_id: 1 },
  { id: 3, title: "Trabalho de Grupo – Stats", description: "Estatística descritiva",  deadline: "2025-06-10", teacher_id: 1 },
];

const SUBMISSIONS = [
  { id: 1,  task_id: 1, student_id: 10, content: "Resolução completa", file_url: null,          feedback: "Muito bom!",       status: "corrigido"  },
  { id: 2,  task_id: 1, student_id: 11, content: "Resolução parcial",  file_url: null,          feedback: "",                 status: "pendente"   },
  { id: 3,  task_id: 1, student_id: 12, content: "Resolução completa", file_url: "file.pdf",    feedback: "Correto",          status: "corrigido"  },
  { id: 4,  task_id: 2, student_id: 10, content: "Teste respondido",   file_url: null,          feedback: "",                 status: "pendente"   },
  { id: 5,  task_id: 2, student_id: 13, content: "Teste respondido",   file_url: null,          feedback: "",                 status: "pendente"   },
  { id: 6,  task_id: 3, student_id: 11, content: "Trabalho entregue",  file_url: "trabalho.pdf",feedback: "Aguarda revisão",  status: "pendente"   },
];

const GRADES = [
  { id: 1, submission_id: 1, teacher_id: 1, grade: 18, feedback: "Excelente trabalho" },
  { id: 2, submission_id: 3, teacher_id: 1, grade: 15, feedback: "Bom desempenho"     },
];

// ── Helpers ─────────────────────────────────────────────────
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
  if (d < 0)  return { label: "Expirada",  tone: "danger"  };
  if (d <= 3) return { label: `${d}d`,     tone: "warning" };
  return           { label: `${d}d`,       tone: "ok"      };
}

// ── Component ────────────────────────────────────────────────
export default function DashboardProfessor() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("visao");

  const totalPresencas   = ATTENDANCES.filter((a) => a.presente).length;
  const totalFaltas      = ATTENDANCES.filter((a) => !a.presente).length;
  const taxaPresenca     = Math.round((totalPresencas / ATTENDANCES.length) * 100);
  const submPendentes    = SUBMISSIONS.filter((s) => s.status === "pendente");
  const submCorrigidas   = SUBMISSIONS.filter((s) => s.status === "corrigido");
  const semNota          = submCorrigidas.filter(
    (s) => !GRADES.find((g) => g.submission_id === s.id)
  );
  const mediaNotas =
    GRADES.length
      ? (GRADES.reduce((acc, g) => acc + g.grade, 0) / GRADES.length).toFixed(1)
      : "—";

  // Presença agrupada por data
  const presencaPorData = ATTENDANCES.reduce((acc, a) => {
    acc[a.data_aula] = acc[a.data_aula] || { presentes: 0, faltas: 0 };
    a.presente ? acc[a.data_aula].presentes++ : acc[a.data_aula].faltas++;
    return acc;
  }, {});

  const TABS = [
    { id: "visao",      label: "Visão Geral"  },
    { id: "presencas",  label: "Presenças"    },
    { id: "tarefas",    label: "Tarefas"      },
    { id: "submissoes", label: "Submissões"   },
    { id: "notas",      label: "Notas"        },
  ];

  return (
    <div className="dash-prof">
      {/* ── Header ── */}
      <div className="dash-header">
        <div className="dash-header-text">
          <p className="dash-greeting">Bem-vindo de volta,</p>
          <h1 className="dash-title">{PROFESSOR.nome}</h1>
          <p className="dash-sub">{PROFESSOR.disciplina} · Ano letivo 2024/2025</p>
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
              <StatCard icon={Users}        label="Taxa de Presença" value={`${taxaPresenca}%`} hint={`${totalFaltas} falta${totalFaltas !== 1 ? "s" : ""} registada${totalFaltas !== 1 ? "s" : ""}`} tone="primary" />
              <StatCard icon={BookOpen}     label="Tarefas Ativas"  value={TASKS.length}        hint="Este período"                    tone="ok"      />
              <StatCard icon={ClipboardList}label="Submissões"       value={SUBMISSIONS.length}  hint={`${submPendentes.length} pendente${submPendentes.length !== 1 ? "s" : ""}`} tone="warning" />
              <StatCard icon={Star}         label="Média das Notas"  value={mediaNotas}          hint={`${GRADES.length} nota${GRADES.length !== 1 ? "s" : ""} atribuída${GRADES.length !== 1 ? "s" : ""}`} tone="success" />
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
                  {TASKS.slice(0, 3).map((t) => {
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
                  })}
                </div>
              </div>

              {/* Submissões pendentes */}
              <div className="panel">
                <div className="panel-head">
                  <span className="panel-title">Para Corrigir</span>
                  <button className="panel-link" onClick={() => setActiveTab("submissoes")}>
                    Ver todas <ArrowRight size={14} />
                  </button>
                </div>
                {submPendentes.length === 0 ? (
                  <div className="panel-empty">
                    <CheckCircle2 size={28} />
                    <span>Tudo em dia!</span>
                  </div>
                ) : (
                  <div className="panel-list">
                    {submPendentes.slice(0, 4).map((s) => {
                      const task = TASKS.find((t) => t.id === s.task_id);
                      return (
                        <div key={s.id} className="subm-row">
                          <Circle size={8} className="subm-dot" />
                          <div>
                            <div className="subm-row-title">{task?.title || "Tarefa"}</div>
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
              {Object.entries(presencaPorData)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([data, counts]) => (
                  <div key={data} className="presenca-date-group">
                    <div className="presenca-date-label">
                      <CalendarDays size={14} />
                      {formatDate(data)}
                    </div>
                    <div className="presenca-rows">
                      {ATTENDANCES.filter((a) => a.data_aula === data).map((a) => (
                        <div key={a.id} className={`presenca-row ${a.presente ? "row-presente" : "row-falta"}`}>
                          <div className="presenca-row-left">
                            {a.presente
                              ? <CheckCircle2 size={16} className="icon-ok" />
                              : <AlertCircle  size={16} className="icon-danger" />}
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
                ))}
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
              {TASKS.map((t) => {
                const s     = taskStatus(t.deadline);
                const subs  = SUBMISSIONS.filter((s) => s.task_id === t.id);
                const pend  = subs.filter((s) => s.status === "pendente").length;
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
                        <FileCheck size={13} /> {subs.length} submissão{subs.length !== 1 ? "ões" : ""}
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
              })}
            </div>
          </div>
        )}

        {/* ══════════ SUBMISSÕES ══════════ */}
        {activeTab === "submissoes" && (
          <div className="panel panel-full">
            <div className="panel-head">
              <span className="panel-title">Submissões</span>
              <div className="subm-chips">
                <span className="presenca-chip chip-warning">{submPendentes.length} pendentes</span>
                <span className="presenca-chip chip-ok">{submCorrigidas.length} corrigidas</span>
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
                  {SUBMISSIONS.map((s) => {
                    const task = TASKS.find((t) => t.id === s.task_id);
                    return (
                      <tr key={s.id}>
                        <td className="td-bold">{task?.title || "—"}</td>
                        <td>Aluno #{s.student_id}</td>
                        <td className="td-content">{s.content}</td>
                        <td>
                          {s.file_url
                            ? <a href="#" className="file-link">📎 {s.file_url}</a>
                            : <span className="td-muted">—</span>}
                        </td>
                        <td>
                          <span className={`badge-status badge-${s.status === "pendente" ? "pendente" : "ok"}`}>
                            {s.status === "pendente" ? "Pendente" : "Corrigido"}
                          </span>
                        </td>
                        <td className="td-muted">{s.feedback || "—"}</td>
                      </tr>
                    );
                  })}
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
                <span className="panel-count">{GRADES.length}</span>
              </div>
              <div className="grades-list">
                {GRADES.map((g) => {
                  const sub  = SUBMISSIONS.find((s) => s.id === g.submission_id);
                  const task = TASKS.find((t) => t.id === sub?.task_id);
                  return (
                    <div key={g.id} className="grade-row">
                      <div className="grade-row-left">
                        <div className={`grade-badge ${g.grade >= 10 ? "grade-ok" : "grade-fail"}`}>
                          {g.grade}
                        </div>
                        <div>
                          <div className="grade-task">{task?.title || "—"}</div>
                          <div className="grade-student">Aluno #{sub?.student_id}</div>
                        </div>
                      </div>
                      <div className="grade-feedback">{g.feedback}</div>
                    </div>
                  );
                })}
              </div>
              <div className="media-bar">
                <TrendingUp size={15} />
                <span>Média geral: <strong>{mediaNotas} / 20</strong></span>
              </div>
            </div>

            {/* Submissões sem nota */}
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title">Sem Nota</span>
                <span className="panel-count panel-count-warn">{submPendentes.length}</span>
              </div>
              {submPendentes.length === 0 ? (
                <div className="panel-empty">
                  <CheckCircle2 size={28} />
                  <span>Todas avaliadas!</span>
                </div>
              ) : (
                <div className="grades-list">
                  {submPendentes.map((s) => {
                    const task = TASKS.find((t) => t.id === s.task_id);
                    return (
                      <div key={s.id} className="grade-row">
                        <div className="grade-row-left">
                          <div className="grade-badge grade-empty">—</div>
                          <div>
                            <div className="grade-task">{task?.title || "—"}</div>
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
