import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { criarHorario, gerarCodigoHorario } from "../../utils/adminMockHorarios";
import { turmasStore } from "../../utils/adminMockData.js";
import { professoresStore, usersStore } from "../../utils/mockUsers.js";
import "../../styles/CriarHorario.css";

export default function CriarHorario() {
  const navigate = useNavigate();

  // Dados do Horário
  const [horarioData, setHorarioData] = useState({
    class_id: "",
    teacher_id: "",
    disciplina: "",
    dia_semana: "Segunda-feira",
    hora_inicio: "08:00",
    hora_fim: "09:00",
    sala: "",
    codigo: gerarCodigoHorario(),
  });

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const diasSemana = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
  ];

  const horasDisponiveis = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  const disciplinasDisponiveis = [
    "Matemática",
    "Português",
    "Inglês",
    "Física",
    "Química",
    "Biologia",
    "História",
    "Geografia",
    "Educação Física",
    "Artes",
    "Tecnologias da Informação",
  ];

  // Obter turmas disponíveis
  const turmasDisponiveis = turmasStore.list();

  // Obter professores disponíveis
  const professoresDisponiveis = professoresStore.list().map((prof) => ({
    ...prof,
    user: usersStore.get(prof.user_id),
  }));

  // Validação
  function validar() {
    const novosErros = {};

    if (!horarioData.class_id.trim()) {
      novosErros.class_id = "Turma é obrigatória";
    }

    if (!horarioData.teacher_id) {
      novosErros.teacher_id = "Professor é obrigatório";
    }

    if (!horarioData.disciplina.trim()) {
      novosErros.disciplina = "Disciplina é obrigatória";
    }

    if (!horarioData.dia_semana.trim()) {
      novosErros.dia_semana = "Dia da semana é obrigatório";
    }

    if (!horarioData.hora_inicio.trim()) {
      novosErros.hora_inicio = "Hora de início é obrigatória";
    }

    if (!horarioData.hora_fim.trim()) {
      novosErros.hora_fim = "Hora de fim é obrigatória";
    }

    // Validar se hora_fim é maior que hora_inicio
    if (horarioData.hora_inicio && horarioData.hora_fim) {
      const inicio = horarioData.hora_inicio.split(":").map(Number);
      const fim = horarioData.hora_fim.split(":").map(Number);
      const inicioMinutos = inicio[0] * 60 + inicio[1];
      const fimMinutos = fim[0] * 60 + fim[1];

      if (fimMinutos <= inicioMinutos) {
        novosErros.hora_fim = "Hora de fim deve ser maior que hora de início";
      }
    }

    if (!horarioData.sala.trim()) {
      novosErros.sala = "Sala é obrigatória";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Voltar
  function voltar() {
    navigate("/admin/horarios");
  }

  // Submeter formulário
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validar()) {
      return;
    }

    setCarregando(true);

    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      const resultado = criarHorario(horarioData);

      if (resultado.sucesso) {
        setSucesso(true);
        setTimeout(() => {
          navigate("/admin/horarios");
        }, 1500);
      } else {
        setErros({ geral: resultado.erro });
      }
    } catch (error) {
      setErros({ geral: "Erro ao criar horário. Tente novamente." });
    } finally {
      setCarregando(false);
    }
  }

  // Obter nome da turma
  function obterNomeTurma(turmaId) {
    const turma = turmasStore.get(turmaId);
    return turma?.nome || "";
  }

  // Obter nome do professor
  function obterNomeProfessor(professorId) {
    const prof = professoresDisponiveis.find((p) => p.id == professorId);
    return prof?.user?.nome || "";
  }

  return (
    <div className="criar-horario-page">
      <div className="page-header">
        <button className="btn-back" onClick={voltar}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Criar Horário</h1>
          <p className="page-subtitle">
            Configure os dados do novo horário de aula
          </p>
        </div>
      </div>

      <div className="criar-horario-container">
        <form className="criar-horario-form" onSubmit={handleSubmit}>
          {/* Mensagem de Erro Geral */}
          {erros.geral && (
            <div className="alert alert-danger">
              {erros.geral}
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {sucesso && (
            <div className="alert alert-success">
              ✓ Horário criado com sucesso! Redirecionando...
            </div>
          )}

          {/* Seção de Informações Básicas */}
          <div className="form-section">
            <h2>Informações Básicas</h2>
            <p className="section-desc">
              Configure os dados principais do horário
            </p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Turma *</label>
              {turmasDisponiveis.length === 0 ? (
                <div className="empty-message">
                  <p>Nenhuma turma disponível</p>
                </div>
              ) : (
                <select
                  className={`input ${erros.class_id ? "is-invalid" : ""}`}
                  value={horarioData.class_id}
                  onChange={(e) =>
                    setHorarioData({ ...horarioData, class_id: e.target.value })
                  }
                >
                  <option value="">Selecione uma turma...</option>
                  {turmasDisponiveis.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome} ({turma.codigo})
                    </option>
                  ))}
                </select>
              )}
              {erros.class_id && (
                <span className="error-msg">{erros.class_id}</span>
              )}
            </div>

            <div className="form-group">
              <label className="label">Professor *</label>
              {professoresDisponiveis.length === 0 ? (
                <div className="empty-message">
                  <p>Nenhum professor disponível</p>
                </div>
              ) : (
                <select
                  className={`input ${erros.teacher_id ? "is-invalid" : ""}`}
                  value={horarioData.teacher_id}
                  onChange={(e) =>
                    setHorarioData({ ...horarioData, teacher_id: e.target.value })
                  }
                >
                  <option value="">Selecione um professor...</option>
                  {professoresDisponiveis.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.user?.nome} ({prof.departamento})
                    </option>
                  ))}
                </select>
              )}
              {erros.teacher_id && (
                <span className="error-msg">{erros.teacher_id}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Disciplina *</label>
            <select
              className={`input ${erros.disciplina ? "is-invalid" : ""}`}
              value={horarioData.disciplina}
              onChange={(e) =>
                setHorarioData({ ...horarioData, disciplina: e.target.value })
              }
            >
              <option value="">Selecione uma disciplina...</option>
              {disciplinasDisponiveis.map((disc) => (
                <option key={disc} value={disc}>
                  {disc}
                </option>
              ))}
            </select>
            {erros.disciplina && (
              <span className="error-msg">{erros.disciplina}</span>
            )}
          </div>

          {/* Seção de Horário */}
          <div className="form-section">
            <h2>Horário</h2>
            <p className="section-desc">
              Configure o dia e horário da aula
            </p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Dia da Semana *</label>
              <select
                className={`input ${erros.dia_semana ? "is-invalid" : ""}`}
                value={horarioData.dia_semana}
                onChange={(e) =>
                  setHorarioData({ ...horarioData, dia_semana: e.target.value })
                }
              >
                {diasSemana.map((dia) => (
                  <option key={dia} value={dia}>
                    {dia}
                  </option>
                ))}
              </select>
              {erros.dia_semana && (
                <span className="error-msg">{erros.dia_semana}</span>
              )}
            </div>

            <div className="form-group">
              <label className="label">Sala *</label>
              <input
                type="text"
                className={`input ${erros.sala ? "is-invalid" : ""}`}
                placeholder="Ex: A1, B2, C3"
                value={horarioData.sala}
                onChange={(e) =>
                  setHorarioData({ ...horarioData, sala: e.target.value.toUpperCase() })
                }
              />
              {erros.sala && (
                <span className="error-msg">{erros.sala}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Hora de Início *</label>
              <select
                className={`input ${erros.hora_inicio ? "is-invalid" : ""}`}
                value={horarioData.hora_inicio}
                onChange={(e) =>
                  setHorarioData({ ...horarioData, hora_inicio: e.target.value })
                }
              >
                {horasDisponiveis.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
              {erros.hora_inicio && (
                <span className="error-msg">{erros.hora_inicio}</span>
              )}
            </div>

            <div className="form-group">
              <label className="label">Hora de Fim *</label>
              <select
                className={`input ${erros.hora_fim ? "is-invalid" : ""}`}
                value={horarioData.hora_fim}
                onChange={(e) =>
                  setHorarioData({ ...horarioData, hora_fim: e.target.value })
                }
              >
                {horasDisponiveis.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
              {erros.hora_fim && (
                <span className="error-msg">{erros.hora_fim}</span>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={voltar}
              disabled={carregando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-hero"
              disabled={carregando}
            >
              <Save size={18} />
              {carregando ? "Criando..." : "Criar Horário"}
            </button>
          </div>
        </form>

        {/* Card de Resumo */}
        <div className="form-resumo">
          <h3>Resumo</h3>
          <div className="resumo-item">
            <span className="resumo-label">Código:</span>
            <span className="resumo-value codigo-badge">{horarioData.codigo}</span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Turma:</span>
            <span className="resumo-value">
              {horarioData.class_id ? obterNomeTurma(horarioData.class_id) : "—"}
            </span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Professor:</span>
            <span className="resumo-value">
              {horarioData.teacher_id ? obterNomeProfessor(horarioData.teacher_id) : "—"}
            </span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Disciplina:</span>
            <span className="resumo-value">
              {horarioData.disciplina || "—"}
            </span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Dia:</span>
            <span className="resumo-value">
              {horarioData.dia_semana}
            </span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Horário:</span>
            <span className="resumo-value horario-badge">
              {horarioData.hora_inicio} - {horarioData.hora_fim}
            </span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Sala:</span>
            <span className="resumo-value">
              {horarioData.sala || "—"}
            </span>
          </div>

          <div className="resumo-info">
            <strong>ℹ Informação:</strong>
            <p>
              Após criar o horário, será visível no calendário de aulas e
              poderá ser editado a qualquer momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}