import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Calendar, Clock, UserCheck, AlertCircle } from "lucide-react";
import { alunosStore } from "../../utils/adminMockData.js"; // Para listar os alunos da turma
import "../../styles/MarcarPresenca.css";

export default function MarcarPresenca() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1); // 1: Filtros da Aula, 2: Lista de Chamada

  // Dados de Configuração da Aula
  const [aulaData, setAulaData] = useState({
    schedule_id: "",
    data_aula: new Date().toISOString().split("T")[0],
    teacher_id: "p-1", // Simulação do professor logado
  });

  // Estado que guarda a presença de cada aluno [student_id]: { presente: bool, observacao: string }
  const [listaPresenca, setListaPresenca] = useState({});
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Mock estático de horários disponíveis vinculados a este professor para o Passo 1
  const horariosDisponiveis = [
    { id: "sch-501", turma: "Sub-14 A", disciplina: "Junior Game Development", hora: "09:00 - 10:30" },
    { id: "sch-502", turma: "Sub-12 B", disciplina: "Digital Sciences", hora: "10:45 - 12:15" },
  ];

  // Listar alunos cadastrados para fazer a chamada no Passo 2
  const alunosDaTurma = useMemo(() => {
    if (typeof alunosStore?.list !== "function") return [];
    return alunosStore.list();
  }, []);

  // Inicializar o estado da chamada quando avançar para a Etapa 2
  function inicializarListaChamada() {
    const estadoInicial = {};
    alunosDaTurma.forEach((aluno) => {
      estadoInicial[aluno.id] = {
        presente: true, // Padrão: Presente
        observacao: "",
      };
    });
    setListaPresenca(estadoInicial);
  }

  function validarEtapa1() {
    const novosErros = {};
    if (!aulaData.schedule_id) {
      novosErros.schedule_id = "Selecione o horário e a turma da aula";
    }
    if (!aulaData.data_aula) {
      novosErros.data_aula = "A data da aula é obrigatória";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function avancar() {
    if (etapa === 1 && validarEtapa1()) {
      inicializarListaChamada();
      setEtapa(2);
      setErros({});
    }
  }

  function voltar() {
    if (etapa > 1) {
      setEtapa(etapa - 1);
    } else {
      navigate("/professor");
    }
  }

  function handlePresencaChange(studentId, valor) {
    setListaPresenca((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], presente: valor },
    }));
  }

  function handleObservacaoChange(studentId, texto) {
    setListaPresenca((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], observacao: texto },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (etapa !== 2) return;

    setCarregando(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Estruturação final dos dados mapeando cada aluno conforme os requisitos
      const registrosPresenca = Object.keys(listaPresenca).map((studentId) => ({
        student_id: studentId,
        schedule_id: aulaData.schedule_id,
        teacher_id: aulaData.teacher_id,
        data_aula: aulaData.data_aula,
        presente: listaPresenca[studentId].presente,
        observacao: listaPresenca[studentId].observacao,
      }));

      console.log("Salvando Presenças no Banco:", registrosPresenca);

      setSucesso(true);
      setTimeout(() => {
        navigate("/professor");
      }, 1500);
    } catch (error) {
      setErros({ geral: "Erro ao salvar o livro de presenças." });
    } finally {
      setCarregando(false);
    }
  }

  const horarioSelecionado = horariosDisponiveis.find(h => h.id === aulaData.schedule_id);

  return (
    <div className="marcar-presenca-page">
      <div className="page-header">
        <button type="button" className="btn-back" onClick={voltar}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Livro de Presenças</h1>
          <p className="page-subtitle">
            {etapa === 1 ? "Passo 1 de 2: Identificar Aula" : "Passo 2 de 2: Lista de Chamada"}
          </p>
        </div>
      </div>

      <div className="presenca-container">
        <form className="presenca-form" onSubmit={handleSubmit}>
          
          {/* Indicador de Etapas */}
          <div className="etapas-indicator">
            <div className={`etapa ${etapa >= 1 ? "ativa" : ""}`}>
              <span>1</span>
              <label>Aula</label>
            </div>
            <div className="etapa-linha" />
            <div className={`etapa ${etapa >= 2 ? "ativa" : ""}`}>
              <span>2</span>
              <label>Chamada</label>
            </div>
          </div>

          {erros.geral && <div className="alert alert-danger">{erros.geral}</div>}
          {sucesso && (
            <div className="alert alert-success">✓ Presenças registradas com sucesso no EduTrack!</div>
          )}

          {/* ETAPA 1: SELEÇÃO DE HORÁRIO E DATA */}
          {etapa === 1 && (
            <div className="form-step-animation">
              <div className="form-section">
                <h2>Qual é a turma e o horário de hoje?</h2>
                <p className="section-desc">Selecione abaixo um dos seus horários atribuídos para abrir a chamada.</p>
              </div>

              <div className="input-group">
                <label className="input-label">Data da Aula</label>
                <div className={`field-container ${erros.data_aula ? "field-error" : ""}`}>
                  <Calendar size={16} />
                  <input
                    type="date"
                    value={aulaData.data_aula}
                    onChange={(e) => setAulaData({ ...aulaData, data_aula: e.target.value })}
                  />
                </div>
                {erros.data_aula && <span className="error-msg">{erros.data_aula}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Selecione a Aula na Grade</label>
                <div className={`horarios-grid ${erros.schedule_id ? "has-error" : ""}`}>
                  {horariosDisponiveis.map((horario) => (
                    <label
                      key={horario.id}
                      className={`horario-card ${aulaData.schedule_id === horario.id ? "is-selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="schedule_id"
                        value={horario.id}
                        checked={aulaData.schedule_id === horario.id}
                        onChange={(e) => setAulaData({ ...aulaData, schedule_id: e.target.value })}
                      />
                      <div className="horario-card-content">
                        <div className="horario-icon">
                          <Clock size={18} />
                        </div>
                        <div className="horario-dados">
                          <span className="horario-turma">{horario.turma}</span>
                          <span className="horario-disc">{horario.disciplina}</span>
                          <span className="horario-tempo">{horario.hora}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {erros.schedule_id && <span className="error-msg">{erros.schedule_id}</span>}
              </div>
            </div>
          )}

          {/* ETAPA 2: LISTA DE ALUNOS (CHAMADA) */}
          {etapa === 2 && (
            <div className="form-step-animation">
              <div className="form-section-chamada">
                <div>
                  <h2>Lista de Chamada Oficial</h2>
                  <p className="section-desc">
                    Turma: <strong>{horarioSelecionado?.turma}</strong> | Data: <strong>{new Date(aulaData.data_aula).toLocaleDateString("pt-BR")}</strong>
                  </p>
                </div>
                <div className="teacher-badge">Professor ID: {aulaData.teacher_id}</div>
              </div>

              {alunosDaTurma.length === 0 ? (
                <div className="empty-message">
                  <p>Não existem estudantes matriculados nesta turma para realizar a chamada.</p>
                </div>
              ) : (
                <div className="tabela-chamada-wrapper">
                  <table className="tabela-chamada">
                    <thead>
                      <tr>
                        <th>Estudante</th>
                        <th className="text-center">Status de Presença</th>
                        <th>Observações / Justificativas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alunosDaTurma.map((aluno) => {
                        const statusAtual = listaPresenca[aluno.id] || { presente: true, observacao: "" };
                        return (
                          <tr key={aluno.id} className={!statusAtual.presente ? "linha-ausente" : ""}>
                            <td>
                              <div className="aluno-info-tabela">
                                <span className="aluno-nome-tab">{aluno.nome || "Estudante"}</span>
                                <span className="aluno-id-tab">ID: {aluno.id}</span>
                              </div>
                            </td>
                            <td>
                              <div className="toggle-presenca-container">
                                <button
                                  type="button"
                                  className={`btn-toggle-p presente ${statusAtual.presente ? "ativo" : ""}`}
                                  onClick={() => handlePresencaChange(aluno.id, true)}
                                >
                                  <UserCheck size={14} /> Presente
                                </button>
                                <button
                                  type="button"
                                  className={`btn-toggle-p ausente ${!statusAtual.presente ? "ativo" : ""}`}
                                  onClick={() => handlePresencaChange(aluno.id, false)}
                                >
                                  <AlertCircle size={14} /> Ausente
                                </button>
                              </div>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="input-table-obs"
                                placeholder="Ex: Atraso de 15 min, consulta médica..."
                                value={statusAtual.observacao}
                                onChange={(e) => handleObservacaoChange(aluno.id, e.target.value)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Ações do Formulário */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={voltar}
              disabled={carregando}
            >
              {etapa === 1 ? "Cancelar" : "Voltar e Alterar Aula"}
            </button>

            {etapa < 2 ? (
              <button type="button" className="btn btn-primary" onClick={avancar}>
                Iniciar Chamada
              </button>
            ) : (
              <button type="submit" className="btn btn-hero" disabled={carregando}>
                <Save size={18} />
                {carregando ? "Registrando..." : "Finalizar Pauta de Presenças"}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}