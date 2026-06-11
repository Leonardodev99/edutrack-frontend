import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus } from "lucide-react";
import api from "../../services/api"; 
import "../../styles/CriarHorario.css";

const MAPA_DIAS_SEMANA = {
  "Segunda-feira": "segunda",
  "Terça-feira": "terca",
  "Quarta-feira": "quarta",
  "Quinta-feira": "quinta",
  "Sexta-feira": "sexta",
};

export default function CriarHorario() {
  const navigate = useNavigate();

  // Estados dos dados do formulário
  const [horarioData, setHorarioData] = useState({
    class_id: "",
    teacher_id: "",
    disciplina: "",
    dia_semana: "Segunda-feira",
    hora_inicio: "08:00",
    hora_fim: "09:00",
    sala: "",
  });

  // Estado auxiliar para quando o usuário quer digitar uma nova disciplina
  const [novaDisciplina, setNovaDisciplina] = useState("");
  const [isNovaDisciplina, setIsNovaDisciplina] = useState(false);

  // Estados para dados carregados da API
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([]);
  const [professoresDisponiveis, setProfessoresDisponiveis] = useState([]);
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState([]);

  // Estados de controle de fluxo e erros
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [sucesso, setSucesso] = useState(false);

  const diasSemana = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
  ];

  const horasDisponiveis = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00",
  ];

  // Carregar dados dinâmicos da API
  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const token = localStorage.getItem("@EduTrack:token");
        
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Adicionado a rota /schedules/disciplines na busca paralela
        const [resTurmas, resProfessores, resDisciplinas] = await Promise.all([
          api.get("/classes", config),
          api.get("/teachers", config),
          api.get("/schedules/disciplines", config)
        ]);

        setTurmasDisponiveis(resTurmas.data);
        setProfessoresDisponiveis(resProfessores.data);
        
        // Se o banco retornar vazio (primeira execução), define uma lista base padrão
        if (resDisciplinas.data && resDisciplinas.data.length > 0) {
          setDisciplinasDisponiveis(resDisciplinas.data);
        } else {
          setDisciplinasDisponiveis([
            "Matemática", "Português", "Inglês", "Física", "Química", "Tecnologias da Informação"
          ]);
        }
      } catch (error) {
        setErros({ geral: "Não foi possível carregar os dados necessários do servidor." });
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDadosIniciais();
  }, []);

  // Monitora a escolha do Select de Disciplina
  function handleDisciplinaChange(e) {
    const valor = e.target.value;
    if (valor === "NOVA_DISCIPLINA") {
      setIsNovaDisciplina(true);
      setHorarioData({ ...horarioData, disciplina: "" });
    } else {
      setIsNovaDisciplina(false);
      setHorarioData({ ...horarioData, disciplina: valor });
    }
  }

  function validar() {
    const novosErros = {};

    if (!horarioData.class_id.toString().trim()) {
      novosErros.class_id = "A turma é obrigatória";
    }

    if (!horarioData.teacher_id.toString().trim()) {
      novosErros.teacher_id = "O professor é obrigatório";
    }

    // Validação condicional da disciplina
    const disciplinaFinal = isNovaDisciplina ? novaDisciplina : horarioData.disciplina;
    if (!disciplinaFinal.trim()) {
      novosErros.disciplina = "A disciplina é obrigatória";
    }

    if (!horarioData.dia_semana.trim()) {
      novosErros.dia_semana = "O dia da semana é obrigatório";
    }

    if (!horarioData.hora_inicio.trim()) {
      novosErros.hora_inicio = "A hora de início é obrigatória";
    }

    if (!horarioData.hora_fim.trim()) {
      novosErros.hora_fim = "A hora de fim é obrigatória";
    }

    if (horarioData.hora_inicio && horarioData.hora_fim) {
      const inicio = horarioData.hora_inicio.split(":").map(Number);
      const fim = horarioData.hora_fim.split(":").map(Number);
      const inicioMinutos = inicio[0] * 60 + inicio[1];
      const fimMinutos = fim[0] * 60 + fim[1];

      if (fimMinutos <= inicioMinutos) {
        novosErros.hora_fim = "A hora de fim deve ser maior que a hora de início";
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function voltar() {
    navigate("/admin/horarios");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validar()) {
      return;
    }

    setCarregando(true);
    setErros({});

    try {
      const token = localStorage.getItem("@EduTrack:token");

      if (!token) {
        setErros({ geral: "Sessão expirada. Por favor, faça login novamente." });
        setCarregando(false);
        return;
      }

      // Define se usa o valor do SELECT ou do INPUT manual de nova disciplina
      const disciplinaFinal = isNovaDisciplina ? novaDisciplina.trim() : horarioData.disciplina;

      const payload = {
        class_id: Number(horarioData.class_id),
        teacher_id: Number(horarioData.teacher_id),
        disciplina: disciplinaFinal,
        dia_semana: MAPA_DIAS_SEMANA[horarioData.dia_semana] || "segunda",
        hora_inicio: `${horarioData.hora_inicio}:00`, 
        hora_fim: `${horarioData.hora_fim}:00`,       
        sala: horarioData.sala || null,
      };

      await api.post("/schedules", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSucesso(true);
      setTimeout(() => {
        navigate("/admin/horarios");
      }, 1500);
    } catch (error) {
      const mensagemErro = error.response?.data?.error || "Erro de conexão com o servidor.";
      setErros({ geral: mensagemErro });
    } finally {
      setCarregando(false);
    }
  }

  function obterNomeTurma(turmaId) {
    const turma = turmasDisponiveis.find((t) => t.id == turmaId);
    return turma ? turma.nome : "";
  }

  function obterNomeProfessor(professorId) {
    const prof = professoresDisponiveis.find((p) => p.id == professorId);
    return prof?.User?.nome || prof?.user?.nome || ""; 
  }

  if (carregandoDados) {
    return (
      <div className="criar-horario-page">
        <p className="page-subtitle">A carregar formulário...</p>
      </div>
    );
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
          {erros.geral && <div className="alert alert-danger">{erros.geral}</div>}

          {sucesso && (
            <div className="alert alert-success">
              ✓ Horário criado com sucesso! A redirecionar...
            </div>
          )}

          <div className="form-section">
            <h2>Informações Básicas</h2>
            <p className="section-desc">Configure os dados principais do horário</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Turma *</label>
              {turmasDisponiveis.length === 0 ? (
                <div className="empty-message">
                  <p>Nenhuma turma disponível no sistema</p>
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
                      {turma.nome}
                    </option>
                  ))}
                </select>
              )}
              {erros.class_id && <span className="error-msg">{erros.class_id}</span>}
            </div>

            <div className="form-group">
              <label className="label">Professor *</label>
              {professoresDisponiveis.length === 0 ? (
                <div className="empty-message">
                  <p>Nenhum professor disponível no sistema</p>
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
                      {prof.User?.nome || prof.user?.nome || `Professor ID ${prof.id}`}
                    </option>
                  ))}
                </select>
              )}
              {erros.teacher_id && <span className="error-msg">{erros.teacher_id}</span>}
            </div>
          </div>

          {/* 🔄 CAMPO DE DISCIPLINA DINÂMICO */}
          <div className="form-group">
            <label className="label">Disciplina *</label>
            <select
              className={`input ${erros.disciplina ? "is-invalid" : ""}`}
              value={isNovaDisciplina ? "NOVA_DISCIPLINA" : horarioData.disciplina}
              onChange={handleDisciplinaChange}
            >
              <option value="">Selecione uma disciplina...</option>
              {disciplinasDisponiveis.map((disc) => (
                <option key={disc} value={disc}>
                  {disc}
                </option>
              ))}
              <option value="NOVA_DISCIPLINA" style={{ fontWeight: "bold", color: "#4f46e5" }}>
                ➕ [ Inserir Nova Disciplina... ]
              </option>
            </select>

            {/* 📝 Exibe este input somente se selecionou "Inserir Nova Disciplina..." */}
            {isNovaDisciplina && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  className={`input ${erros.disciplina ? "is-invalid" : ""}`}
                  placeholder="Escreva o nome da nova disciplina..."
                  value={novaDisciplina}
                  onChange={(e) => setNovaDisciplina(e.target.value)}
                />
              </div>
            )}
            {erros.disciplina && <span className="error-msg">{erros.disciplina}</span>}
          </div>

          <div className="form-section">
            <h2>Horário</h2>
            <p className="section-desc">Configure o dia e horário da aula</p>
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
              {erros.dia_semana && <span className="error-msg">{erros.dia_semana}</span>}
            </div>

            <div className="form-group">
              <label className="label">Sala</label>
              <input
                type="text"
                className={`input ${erros.sala ? "is-invalid" : ""}`}
                placeholder="Ex: A1, Laboratório de Informática"
                value={horarioData.sala}
                onChange={(e) =>
                  setHorarioData({ ...horarioData, sala: e.target.value.toUpperCase() })
                }
              />
              {erros.sala && <span className="error-msg">{erros.sala}</span>}
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
              {erros.hora_inicio && <span className="error-msg">{erros.hora_inicio}</span>}
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
              {erros.hora_fim && <span className="error-msg">{erros.hora_fim}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={voltar}
              disabled={carregando}
            >
              Cancelar
            </button>

            <button type="submit" className="btn btn-hero" disabled={carregando}>
              <Save size={18} />
              {carregando ? "A criar..." : "Criar Horário"}
            </button>
          </div>
        </form>

        {/* Card de Resumo Lateral */}
        <div className="form-resumo">
          <h3>Resumo</h3>
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
              {isNovaDisciplina ? novaDisciplina || "[Nova em digitação]" : horarioData.disciplina || "—"}
            </span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Dia:</span>
            <span className="resumo-value">{horarioData.dia_semana}</span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Horário:</span>
            <span className="resumo-value horario-badge">
              {horarioData.hora_inicio} - {horarioData.hora_fim}
            </span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Sala:</span>
            <span className="resumo-value">{horarioData.sala || "—"}</span>
          </div>

          <div className="resumo-info">
            <strong>ℹ Informação:</strong>
            <p>
              O formulário está conectado com a API do EduTrack na porta 3005. Novas disciplinas digitadas serão salvas automaticamente ao gerar o horário.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}