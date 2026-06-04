import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Search, CheckCircle, FileText, User, Award } from "lucide-react";
import { submissoesStore, avaliarSubmissao } from "../../utils/submissaoMockData.js";
import { tarefasStore } from "../../utils/tarefaMockData.js";
import "../../styles/LancarNota.css";

export default function LancarNota() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1); // 1: Selecionar Trabalho, 2: Avaliação e Nota

  // Dados da Avaliação
  const [avaliacaoData, setAvaliacaoData] = useState({
    submission_id: "",
    teacher_id: "p-1", // Simulação do professor logado (Ex: Mário Tavares)
    grade: "",
    feedback: ""
  });

  const [buscaAluno, setBuscaAluno] = useState("");
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Filtrar apenas submissões com status "pendente" para o professor avaliar
  const submissoesPendentes = useMemo(() => {
    if (!submissoesStore || typeof submissoesStore.list !== "function") return [];
    
    return submissoesStore.list().filter((sub) => {
      const isPendente = sub.status === "pendente";
      const matchBusca = 
        sub.student_id.toLowerCase().includes(buscaAluno.toLowerCase()) ||
        sub.id.toLowerCase().includes(buscaAluno.toLowerCase());
      return isPendente && matchBusca;
    });
  }, [buscaAluno]);

  // Obter detalhes completos da submissão e da respectiva tarefa selecionada
  const dadosContextoSelecao = useMemo(() => {
    if (!avaliacaoData.submission_id) return null;
    const submissao = submissoesStore.get(avaliacaoData.submission_id);
    const tarefa = submissao ? tarefasStore.get(submissao.task_id) : null;
    return { submissao, tarefa };
  }, [avaliacaoData.submission_id]);

  // Validar Passo 1
  function validarEtapa1() {
    const novosErros = {};
    if (!avaliacaoData.submission_id) {
      novosErros.submission_id = "Selecione o trabalho de um aluno para avaliar";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Validar Passo 2
  function validarEtapa2() {
    const novosErros = {};
    const notaNum = Number(avaliacaoData.grade);

    if (avaliacaoData.grade === "" || isNaN(notaNum)) {
      novosErros.grade = "Introduza uma nota válida";
    } else if (notaNum < 0 || notaNum > 20) {
      novosErros.grade = "A nota deve ser um valor entre 0 e 20 valores";
    }

    if (!avaliacaoData.feedback.trim()) {
      novosErros.feedback = "O feedback descritivo de correção é obrigatório";
    } else if (avaliacaoData.feedback.trim().length < 10) {
      novosErros.feedback = "Escreva um feedback mais detalhado para o estudante (mínimo 10 caracteres)";
    }

    if (!avaliacaoData.teacher_id) {
      novosErros.teacher_id = "Identificação do professor avaliador em falta";
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
      navigate("/professor");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (etapa !== 2) return;
    if (!validarEtapa2()) return;

    setCarregando(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const atualizado = avaliarSubmissao(
        avaliacaoData.submission_id,
        avaliacaoData.grade,
        avaliacaoData.feedback
      );

      if (atualizado) {
        setSucesso(true);
        setTimeout(() => {
          navigate("/professor/notas");
        }, 1500);
      } else {
        setErros({ geral: "Não foi possível registrar a avaliação. Verifique os dados." });
      }
    } catch (error) {
      setErros({ geral: "Erro de comunicação com o servidor de dados." });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="lancar-nota-page">
      <div className="page-header">
        <button type="button" className="btn-back" onClick={voltar}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Avaliar Trabalhos</h1>
          <p className="page-subtitle">
            {etapa === 1 
              ? "Passo 1 de 2: Selecione a Entrega do Aluno" 
              : "Passo 2 de 2: Atribuição de Nota e Feedback"}
          </p>
        </div>
      </div>

      <div className="nota-container">
        <form className="nota-form" onSubmit={handleSubmit}>
          {/* Timeline de progresso */}
          <div className="etapas-indicator">
            <div className={`etapa ${etapa >= 1 ? "ativa" : ""}`}>
              <span>1</span>
              <label>Trabalhos</label>
            </div>
            <div className="etapa-linha" />
            <div className={`etapa ${etapa >= 2 ? "ativa" : ""}`}>
              <span>2</span>
              <label>Avaliação</label>
            </div>
          </div>

          {erros.geral && <div className="alert alert-danger">{erros.geral}</div>}
          {sucesso && (
            <div className="alert alert-success">
              ✓ Avaliação e nota publicadas com sucesso!
            </div>
          )}

          {/* PASSO 1: SELECIONAR TRABALHO RECEBIDO */}
          {etapa === 1 && (
            <div className="form-step-animation">
              <div className="form-section">
                <h2>Submissões Aguardando Correção</h2>
                <p className="section-desc">Filtre por ID do aluno ou selecione diretamente na lista de envios pendentes.</p>
              </div>

              <div className="busca-container">
                <Search size={16} />
                <input
                  type="text"
                  className="input-busca"
                  placeholder="Filtrar por ID do estudante..."
                  value={buscaAluno}
                  onChange={(e) => setBuscaAluno(e.target.value)}
                />
              </div>

              {submissoesPendentes.length === 0 ? (
                <div className="empty-message">
                  <p>Não existem submissões pendentes de avaliação com os critérios indicados.</p>
                </div>
              ) : (
                <div className={`submissoes-grid ${erros.submission_id ? "has-error" : ""}`}>
                  {submissoesPendentes.map((sub) => (
                    <label
                      key={sub.id}
                      className={`submissao-card ${
                        avaliacaoData.submission_id === sub.id ? "is-selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="submission_id"
                        value={sub.id}
                        checked={avaliacaoData.submission_id === sub.id}
                        onChange={(e) => setAvaliacaoData({ ...avaliacaoData, submission_id: e.target.value })}
                      />
                      <div className="submissao-card-body">
                        <div className="submissao-icon">
                          <FileText size={18} />
                        </div>
                        <div className="submissao-meta">
                          <div className="student-id-badge">Estudante: {sub.student_id}</div>
                          <p className="submissao-preview">{sub.content.substring(0, 75)}...</p>
                          <span className="delivery-date">Enviado em: {sub.entregue_em}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {erros.submission_id && <span className="error-msg">{erros.submission_id}</span>}
            </div>
          )}

          {/* PASSO 2: LANÇAMENTO DE NOTAS */}
          {etapa === 2 && (
            <div className="form-step-animation">
              <div className="form-section">
                <h2>Lançar Nota e Parecer Pedagógico</h2>
                <p className="section-desc">
                  A avaliar o trabalho do aluno <strong className="text-highlight">{dadosContextoSelecao?.submissao?.student_id}</strong> para a tarefa: <em>{dadosContextoSelecao?.tarefa?.title}</em>
                </p>
              </div>

              {/* Box de apoio contendo o arquivo do aluno */}
              <div className="revisao-trabalho-box">
                <h3>Conteúdo Enviado pelo Aluno:</h3>
                <p className="txt-conteudo">"{dadosContextoSelecao?.submissao?.content}"</p>
                <a 
                  href={dadosContextoSelecao?.submissao?.file_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="link-arquivo-aluno"
                >
                  Abrir Arquivo do Trabalho ↗
                </a>
              </div>

              <div className="row-inputs">
                <div className="input-group">
                  <label className="input-label">Professor Avaliador (ID)</label>
                  <div className="field-container disabled-field">
                    <User size={16} />
                    <input type="text" value={avaliacaoData.teacher_id} disabled />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Nota Quantitativa (0 a 20)</label>
                  <div className={`field-container ${erros.grade ? "field-error" : ""}`}>
                    <Award size={16} />
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      placeholder="Ex: 16.5"
                      value={avaliacaoData.grade}
                      onChange={(e) => setAvaliacaoData({ ...avaliacaoData, grade: e.target.value })}
                    />
                  </div>
                  {erros.grade && <span className="error-msg">{erros.grade}</span>}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Feedback Qualitativo e Correções</label>
                <div className={`field-container textarea-container ${erros.feedback ? "field-error" : ""}`}>
                  <textarea
                    rows="5"
                    placeholder="Escreva as observações de melhoria, pontos fortes e fracos do trabalho entregue..."
                    value={avaliacaoData.feedback}
                    onChange={(e) => setAvaliacaoData({ ...avaliacaoData, feedback: e.target.value })}
                  />
                </div>
                {erros.feedback && <span className="error-msg">{erros.feedback}</span>}
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
              {etapa === 1 ? "Voltar ao Início" : "Mudar Trabalho"}
            </button>

            {etapa < 2 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={avancar}
                disabled={carregando}
              >
                Avaliar Trabalho
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-hero"
                disabled={carregando}
              >
                <Save size={18} />
                {carregando ? "Salvando..." : "Emitir Nota Oficial"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}