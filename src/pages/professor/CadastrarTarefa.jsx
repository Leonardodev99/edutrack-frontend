import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Search, Calendar, FileText, User } from "lucide-react";
import { professoresStore, cadastrarTarefa } from "../../utils/tarefaMockData.js";
import "../../styles/CadastrarTarefa.css";

export default function CadastrarTarefa() {
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState(1); // 1: Detalhes da Tarefa, 2: Selecionar Professor e Confirmar

  // Dados da Tarefa
  const [tarefaData, setTarefaData] = useState({
    title: "",
    description: "",
    deadline: "",
    teacher_id: "",
  });

  const [buscaProfessor, setBuscaProfessor] = useState("");
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Obter professores disponíveis para seleção
  const professoresDisponiveis = useMemo(() => {
    return professoresStore.list().filter((professor) => {
      const matchBusca =
        professor.nome.toLowerCase().includes(buscaProfessor.toLowerCase()) ||
        professor.id.toLowerCase().includes(buscaProfessor.toLowerCase()) ||
        professor.materia.toLowerCase().includes(buscaProfessor.toLowerCase());

      return matchBusca;
    });
  }, [buscaProfessor]);

  // Obter professor selecionado
  function obterProfessorSelecionado() {
    return professoresStore.get(tarefaData.teacher_id) || null;
  }

  // Validar Etapa 1: Dados textuais e data
  function validarEtapa1() {
    const novosErros = {};

    if (!tarefaData.title.trim()) {
      novosErros.title = "O título da tarefa é obrigatório";
    }
    if (!tarefaData.description.trim()) {
      novosErros.description = "A descrição da tarefa é obrigatória";
    }
    if (!tarefaData.deadline) {
      novosErros.deadline = "Defina um prazo de entrega (Data limite)";
    } else {
      const dataPrazo = new Date(tarefaData.deadline);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (dataPrazo < hoje) {
        novosErros.deadline = "O prazo não pode ser uma data passada";
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Validar Etapa 2: Seleção do professor
  function validarEtapa2() {
    const novosErros = {};

    if (!tarefaData.teacher_id) {
      novosErros.teacher_id = "Selecione o professor responsável por esta tarefa";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Avançar etapa
  function avancar() {
    if (etapa === 1) {
      if (validarEtapa1()) {
        setEtapa(2);
        setErros({});
      }
    }
  }

  // Voltar etapa
  function voltar() {
    if (etapa > 1) {
      setEtapa(etapa - 1);
      setErros({});
    } else {
      navigate("/professor");
    }
  }

  // Submeter cadastro da tarefa
  async function handleSubmit(e) {
    e.preventDefault();

    if (etapa !== 2) return;
    if (!validarEtapa2()) return;

    setCarregando(true);

    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Realiza o cadastro
      const resultado = cadastrarTarefa(tarefaData);

      if (resultado) {
        setSucesso(true);
        setTimeout(() => {
          navigate("/admin/tarefas");
        }, 1500);
      } else {
        setErros({ geral: "Erro ao cadastrar tarefa. Tente novamente." });
      }
    } catch (error) {
      setErros({ geral: "Erro interno no servidor. Tente novamente." });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="cadastrar-tarefa-page">
      <div className="page-header">
        <button className="btn-back" onClick={voltar}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Cadastrar Nova Tarefa</h1>
          <p className="page-subtitle">
            {etapa === 1
              ? "Passo 1 de 2: Detalhes da Tarefa"
              : "Passo 2 de 2: Selecionar Professor e Confirmar"}
          </p>
        </div>
      </div>

      <div className="tarefa-container">
        <form className="tarefa-form" onSubmit={handleSubmit}>
          {/* Indicador de Etapas */}
          <div className="etapas-indicator">
            <div className={`etapa ${etapa >= 1 ? "ativa" : ""}`}>
              <span>1</span>
              <label>Detalhes</label>
            </div>
            <div className="etapa-linha" />
            <div className={`etapa ${etapa >= 2 ? "ativa" : ""}`}>
              <span>2</span>
              <label>Professor & Fim</label>
            </div>
          </div>

          {/* Mensagem de Erro Geral */}
          {erros.geral && <div className="alert alert-danger">{erros.geral}</div>}

          {/* Mensagem de Sucesso */}
          {sucesso && (
            <div className="alert alert-success">
              ✓ Tarefa cadastrada com sucesso! Redirecionando...
            </div>
          )}

          {/* ETAPA 1: DETALHES DA TAREFA */}
          {etapa === 1 && (
            <div className="form-step-animation">
              <div className="form-section">
                <h2>Informações da Tarefa</h2>
                <p className="section-desc">Insira o título, a descrição detalhada e o prazo de entrega.</p>
              </div>

              <div className="input-group">
                <label className="input-label">Título da Tarefa</label>
                <div className={`field-container ${erros.title ? "field-error" : ""}`}>
                  <FileText size={16} />
                  <input
                    type="text"
                    placeholder="Ex: Lista de Exercícios sobre Funções"
                    value={tarefaData.title}
                    onChange={(e) => setTarefaData({ ...tarefaData, title: e.target.value })}
                  />
                </div>
                {erros.title && <span className="error-msg">{erros.title}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Descrição / Instruções</label>
                <div className={`field-container textarea-container ${erros.description ? "field-error" : ""}`}>
                  <textarea
                    rows="5"
                    placeholder="Descreva o que os alunos devem fazer, critérios de avaliação ou links úteis..."
                    value={tarefaData.description}
                    onChange={(e) => setTarefaData({ ...tarefaData, description: e.target.value })}
                  />
                </div>
                {erros.description && <span className="error-msg">{erros.description}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Data de Entrega (Deadline)</label>
                <div className={`field-container ${erros.deadline ? "field-error" : ""}`}>
                  <Calendar size={16} />
                  <input
                    type="date"
                    value={tarefaData.deadline}
                    onChange={(e) => setTarefaData({ ...tarefaData, deadline: e.target.value })}
                  />
                </div>
                {erros.deadline && <span className="error-msg">{erros.deadline}</span>}
              </div>
            </div>
          )}

          {/* ETAPA 2: SELECIONAR PROFESSOR E CONFIRMAR */}
          {etapa === 2 && (
            <div className="form-step-animation">
              <div className="form-section">
                <h2>Vincular Professor Responsável</h2>
                <p className="section-desc">Selecione o docente que irá avaliar e gerenciar esta tarefa.</p>
              </div>

              <div className="busca-container">
                <Search size={16} />
                <input
                  type="text"
                  className="input-busca"
                  placeholder="Buscar por nome, ID ou matéria do professor..."
                  value={buscaProfessor}
                  onChange={(e) => setBuscaProfessor(e.target.value)}
                />
              </div>

              {professoresDisponiveis.length === 0 ? (
                <div className="empty-message">
                  <p>Nenhum professor encontrado</p>
                </div>
              ) : (
                <div className={`professores-grid ${erros.teacher_id ? "has-error" : ""}`}>
                  {professoresDisponiveis.map((prof) => (
                    <label
                      key={prof.id}
                      className={`professor-card ${
                        tarefaData.teacher_id === prof.id ? "is-selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="teacher_id"
                        value={prof.id}
                        checked={tarefaData.teacher_id === prof.id}
                        onChange={(e) => setTarefaData({ ...tarefaData, teacher_id: e.target.value })}
                      />
                      <div className="professor-card-content">
                        <div className="professor-avatar">
                          {prof.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="professor-dados">
                          <div className="professor-nome">{prof.nome}</div>
                          <div className="professor-materia">{prof.materia}</div>
                          <div className="professor-id">{prof.id}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {erros.teacher_id && <span className="error-msg">{erros.teacher_id}</span>}

              {/* Resumo da revisão antes de salvar */}
              {tarefaData.title && tarefaData.deadline && (
                <div className="resumo-tarefa">
                  <h3>Resumo do Cadastro</h3>
                  <div className="resumo-grid">
                    <div className="resumo-item">
                      <span className="label">Título</span>
                      <span className="value">{tarefaData.title}</span>
                    </div>
                    <div className="resumo-item">
                      <span className="label">Prazo Final</span>
                      <span className="value">
                        {new Date(tarefaData.deadline).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {obterProfessorSelecionado() && (
                      <div className="resumo-item">
                        <span className="label">Professor Designado</span>
                        <span className="value text-primary">
                          {obterProfessorSelecionado()?.nome}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={voltar}
              disabled={carregando}
            >
              {etapa === 1 ? "Cancelar" : "Voltar"}
            </button>

            {etapa < 2 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={avancar}
                disabled={carregando}
              >
                Continuar
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-hero"
                disabled={carregando}
              >
                <Save size={18} />
                {carregando ? "Salvando..." : "Confirmar e Publicar"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}