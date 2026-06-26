import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Search, FileText, User, Award } from "lucide-react";
import api from "../../services/api";
import "../../styles/LancarNota.css";

export default function LancarNota() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1); 

  // Estado para armazenar as submissões reais vindas do banco
  const [submissoesReal, setSubmissoesReal] = useState([]);

  // Dados da Avaliação
  const [avaliacaoData, setAvaliacaoData] = useState({
    submission_id: "",
    grade: "", // Mapeado para 'score' no envio
    feedback: ""
  });

  const [buscaAluno, setBuscaAluno] = useState("");
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  // Carregar submissões pendentes ao montar o componente
  useEffect(() => {
    carregarSubmissoes();
  }, []);

  async function carregarSubmissoes() {
    try {
      const token = localStorage.getItem("@EduTrack:token");

      // Faz a requisição autenticada para listar as submissões pendentes
      const response = await api.get("/submissions?status=pendente", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubmissoesReal(response.data);
    } catch (error) {
      console.error(error);
      setErros({ geral: "Erro ao carregar submissões do servidor." });
    } finally {
      setCarregandoDados(false);
    }
  }

  // Filtrar as submissões na tela com base na busca
  const submissoesPendentes = useMemo(() => {
    return submissoesReal.filter((sub) => {
      // Verifica se o nome do aluno (caso o backend faça populate/include) ou o student_id batem com a busca
      const nomeAluno = (sub.student?.user?.nome || sub.student?.nome || "").toLowerCase();
      const studentIdStr = String(sub.student_id || "").toLowerCase();
      const subIdStr = String(sub.id || "").toLowerCase();
      const busca = buscaAluno.toLowerCase();

      return studentIdStr.includes(busca) || subIdStr.includes(busca) || nomeAluno.includes(busca);
    });
  }, [buscaAluno, submissoesReal]);

  // Recupera o contexto completo do item selecionado para exibição no Passo 2
  const dadosContextoSelecao = useMemo(() => {
    if (!avaliacaoData.submission_id) return null;
    const submissao = submissoesReal.find(sub => String(sub.id) === String(avaliacaoData.submission_id));
    const tarefa = submissao?.task || null; 
    return { submissao, tarefa };
  }, [avaliacaoData.submission_id, submissoesReal]);

  function validarEtapa1() {
    const novosErros = {};
    if (!avaliacaoData.submission_id) {
      novosErros.submission_id = "Selecione o trabalho de um aluno para avaliar";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

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
    if (etapa !== 2 || !validarEtapa2()) return;

    setCarregando(true);
    setErros({});

    try {
      const token = localStorage.getItem("@EduTrack:token");

      // Transforma a estrutura do front para bater com o req.body do seu GradeController.store
      const payload = {
        submission_id: parseInt(avaliacaoData.submission_id),
        score: Number(avaliacaoData.grade),
        feedback: avaliacaoData.feedback.trim()
      };

      // Chamada oficial para criar a Nota
      await api.post("/grades", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSucesso(true);
      setTimeout(() => {
        navigate("/professor"); 
      }, 1600);

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Erro ao registrar nota e feedback";
      setErros({ geral: msg });
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoDados) return <div className="loading">Carregando submissões...</div>;

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
          {/* Indicador de Etapas */}
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
          {sucesso && <div className="alert alert-success">✓ Avaliação e nota publicadas com sucesso!</div>}

          {/* PASSO 1: SELECIONAR TRABALHO RECEBIDO */}
          {etapa === 1 && (
            <div className="form-step-animation">
              <div className="form-section">
                <h2>Submissões Aguardando Correção</h2>
                <p className="section-desc">Filtre por ID, nome do aluno ou selecione na lista abaixo.</p>
              </div>

              <div className="busca-container">
                <Search size={16} />
                <input
                  type="text"
                  className="input-busca"
                  placeholder="Filtrar por estudante ou submissão..."
                  value={buscaAluno}
                  onChange={(e) => setBuscaAluno(e.target.value)}
                />
              </div>

              {submissoesPendentes.length === 0 ? (
                <div className="empty-message">
                  <p>Não existem submissões pendentes de avaliação para os critérios informados.</p>
                </div>
              ) : (
                <div className={`submissoes-grid ${erros.submission_id ? "has-error" : ""}`}>
                  {submissoesPendentes.map((sub) => {
                    const nomeDoEstudante = sub.student?.user?.nome || sub.student?.nome || `ID: ${sub.student_id}`;
                    return (
                      <label
                        key={sub.id}
                        className={`submissao-card ${
                          String(avaliacaoData.submission_id) === String(sub.id) ? "is-selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="submission_id"
                          value={sub.id}
                          checked={String(avaliacaoData.submission_id) === String(sub.id)}
                          onChange={(e) => setAvaliacaoData({ ...avaliacaoData, submission_id: e.target.value })}
                        />
                        <div className="submissao-card-body">
                          <div className="submissao-icon">
                            <FileText size={18} />
                          </div>
                          <div className="submissao-meta">
                            <div className="student-id-badge">Estudante: {nomeDoEstudante}</div>
                            <p className="submissao-preview">
                              {sub.content ? `${sub.content.substring(0, 75)}...` : "Sem texto descritivo"}
                            </p>
                            <span className="delivery-date">
                              Enviado em: {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString("pt-BR") : "Disponível"}
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
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
                  A avaliar o trabalho de: <strong className="text-highlight">{dadosContextoSelecao?.submissao?.student?.user?.nome || dadosContextoSelecao?.submissao?.student?.nome || dadosContextoSelecao?.submissao?.student_id}</strong> para a tarefa: <em>{dadosContextoSelecao?.tarefa?.title || "Tarefa Associada"}</em>
                </p>
              </div>

              {/* Box de apoio contendo o arquivo do aluno */}
              <div className="revisao-trabalho-box">
                <h3>Conteúdo Enviado pelo Aluno:</h3>
                <p className="txt-conteudo">"{dadosContextoSelecao?.submissao?.content || "Nenhum texto inserido"}"</p>
                {dadosContextoSelecao?.submissao?.file_url && (
                  <a 
                    href={dadosContextoSelecao?.submissao?.file_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="link-arquivo-aluno"
                  >
                    Abrir Arquivo do Trabalho ↗
                  </a>
                )}
              </div>

              <div className="row-inputs">
                <div className="input-group">
                  <label className="input-label">Ref. da Entrega</label>
                  <div className="field-container disabled-field">
                    <User size={16} />
                    <input type="text" value={`Submissão #${avaliacaoData.submission_id}`} disabled />
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
              {etapa === 1 ? "Cancelar" : "Mudar Trabalho"}
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
                {carregando ? "Registrando..." : "Emitir Nota Oficial"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}