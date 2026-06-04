import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Search, FileText, Link, User } from "lucide-react";

// CORREÇÃO AQUI: Importar as tarefas do arquivo de tarefas e a função de submissão do arquivo de submissões
import { tarefasStore } from "../../utils/tarefaMockData.js"; 
import { cadastrarSubmissao } from "../../utils/submissaoMockData.js";

import "../../styles/CadastrarSubmissao.css";

export default function CadastrarSubmissao() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);

  const [submissaoData, setSubmissaoData] = useState({
    task_id: "",
    student_id: "a-1", // Ajustado para "a-1" para bater com o ID padrão dos mocks do aluno (João Pedro)
    content: "",
    file_url: "",
  });

  const [buscaTarefa, setBuscaTarefa] = useState("");
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Filtrar tarefas disponíveis para submissão
  const tarefasDisponiveis = useMemo(() => {
    // Adicionada uma verificação de segurança (guard clause) para evitar quebrar caso o arquivo mude
    if (!tarefasStore || typeof tarefasStore.list !== "function") {
      return [];
    }
    return tarefasStore.list().filter((tarefa) => {
      const matchBusca =
        tarefa.title.toLowerCase().includes(buscaTarefa.toLowerCase()) ||
        tarefa.id.toLowerCase().includes(buscaTarefa.toLowerCase());
      return matchBusca;
    });
  }, [buscaTarefa]);

  // Obter detalhes da tarefa selecionada
  const tarefaSelecionada = useMemo(() => {
    if (!tarefasStore || !submissaoData.task_id) return null;
    return tarefasStore.get(submissaoData.task_id) || null;
  }, [submissaoData.task_id]);

  // ... O restante do seu código do formulário permanece igual ...
  // Validar Etapa 1: Seleção da Tarefa
  function validarEtapa1() {
    const novosErros = {};
    if (!submissaoData.task_id) {
      novosErros.task_id = "Selecione a tarefa que deseja responder";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Validar Etapa 2: Conteúdo e Arquivo
  function validarEtapa2() {
    const novosErros = {};
    if (!submissaoData.content.trim()) {
      novosErros.content = "Introduza uma resposta ou comentário sobre o seu trabalho";
    }
    if (!submissaoData.file_url.trim()) {
      novosErros.file_url = "O link do arquivo de submissão é obrigatório";
    } else {
      // Validação simples de URL
      try {
        new URL(submissaoData.file_url);
      } catch (_) {
        novosErros.file_url = "Insira um link válido (ex: https://drive.google.com/...)";
      }
    }
    if (!submissaoData.student_id) {
      novosErros.student_id = "Identificação do estudante em falta";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function avancar() {
    if (etapa === 1 && validarEtapa1()) {
      setEtapa(2);
      setErros({});
    }
  }

  function voltar() {
    if (etapa > 1) {
      setEtapa(etapa - 1);
      setErros({});
    } else {
      navigate("/aluno/tarefas");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (etapa !== 2) return;
    if (!validarEtapa2()) return;

    setCarregando(true);

    try {
      // Simulação de delay de envio
      await new Promise((resolve) => setTimeout(resolve, 800));

      const resultado = cadastrarSubmissao(submissaoData);

      if (resultado) {
        setSucesso(true);
        setTimeout(() => {
          navigate("/aluno/submissoes");
        }, 1500);
      } else {
        setErros({ geral: "Erro ao enviar a submissão. Tente novamente." });
      }
    } catch (error) {
      setErros({ geral: "Erro de rede ou falha no servidor." });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="cadastrar-submissao-page">
      <div className="page-header">
        <button className="btn-back" onClick={voltar}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Entregar Tarefa</h1>
          <p className="page-subtitle">
            {etapa === 1
              ? "Passo 1 de 2: Selecione a Tarefa"
              : "Passo 2 de 2: Enviar Resolução e Arquivo"}
          </p>
        </div>
      </div>

      <div className="submissao-container">
        <form className="submissao-form" onSubmit={handleSubmit}>
          {/* Indicador de Etapas */}
          <div className="etapas-indicator">
            <div className={`etapa ${etapa >= 1 ? "ativa" : ""}`}>
              <span>1</span>
              <label>Tarefa</label>
            </div>
            <div className="etapa-linha" />
            <div className={`etapa ${etapa >= 2 ? "ativa" : ""}`}>
              <span>2</span>
              <label>Entrega</label>
            </div>
          </div>

          {/* Mensagens de Feedback */}
          {erros.geral && <div className="alert alert-danger">{erros.geral}</div>}
          {sucesso && (
            <div className="alert alert-success">
              ✓ Submissão enviada com sucesso! Redirecionando...
            </div>
          )}

          {/* ETAPA 1: SELECIONAR TAREFA */}
          {etapa === 1 && (
            <div className="form-step-animation">
              <div className="form-section">
                <h2>Selecione a Tarefa Pendente</h2>
                <p className="section-desc">Escolha na lista abaixo a tarefa à qual deseja associar a sua entrega.</p>
              </div>

              <div className="busca-container">
                <Search size={16} />
                <input
                  type="text"
                  className="input-busca"
                  placeholder="Buscar tarefa por título ou código..."
                  value={buscaTarefa}
                  onChange={(e) => setBuscaTarefa(e.target.value)}
                />
              </div>

              {tarefasDisponiveis.length === 0 ? (
                <div className="empty-message">
                  <p>Nenhuma tarefa pendente encontrada</p>
                </div>
              ) : (
                <div className={`tarefas-grid ${erros.task_id ? "has-error" : ""}`}>
                  {tarefasDisponiveis.map((tarefa) => (
                    <label
                      key={tarefa.id}
                      className={`tarefa-card ${
                        submissaoData.task_id === tarefa.id ? "is-selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="task_id"
                        value={tarefa.id}
                        checked={submissaoData.task_id === tarefa.id}
                        onChange={(e) => setSubmissaoData({ ...submissaoData, task_id: e.target.value })}
                      />
                      <div className="tarefa-card-content">
                        <div className="tarefa-icon">
                          <FileText size={20} />
                        </div>
                        <div className="tarefa-dados">
                          <div className="tarefa-title">{tarefa.title}</div>
                          <div className="tarefa-deadline">
                            Prazo: {new Date(tarefa.deadline).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {erros.task_id && <span className="error-msg">{erros.task_id}</span>}
            </div>
          )}

          {/* ETAPA 2: DADOS DA SUBMISSÃO */}
          {etapa === 2 && (
            <div className="form-step-animation">
              <div className="form-section">
                <h2>Detalhes da Entrega</h2>
                <p className="section-desc">
                  Tarefa selecionada: <strong className="text-primary">{tarefaSelecionada?.title}</strong>
                </p>
              </div>

              <div className="input-group">
                <label className="input-label">ID do Aluno (Remetente)</label>
                <div className="field-container disabled-field">
                  <User size={16} />
                  <input type="text" value={submissaoData.student_id} disabled />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Link do Arquivo (Google Drive, OneDrive, GitHub...)</label>
                <div className={`field-container ${erros.file_url ? "field-error" : ""}`}>
                  <Link size={16} />
                  <input
                    type="text"
                    placeholder="https://exemplo.com/seu-trabalho"
                    value={submissaoData.file_url}
                    onChange={(e) => setSubmissaoData({ ...submissaoData, file_url: e.target.value })}
                  />
                </div>
                {erros.file_url && <span className="error-msg">{erros.file_url}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Notas / Comentários do Aluno</label>
                <div className={`field-container textarea-container ${erros.content ? "field-error" : ""}`}>
                  <textarea
                    rows="4"
                    placeholder="Escreva notas adicionais para o professor, justificativas ou respostas diretas textuais..."
                    value={submissaoData.content}
                    onChange={(e) => setSubmissaoData({ ...submissaoData, content: e.target.value })}
                  />
                </div>
                {erros.content && <span className="error-msg">{erros.content}</span>}
              </div>
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
                {carregando ? "Enviando..." : "Submeter Resolução"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}