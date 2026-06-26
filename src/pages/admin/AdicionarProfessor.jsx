import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Save, Loader } from "lucide-react";
import api from "../../services/api";
import "../../styles/MatricularAluno.css"; // Reaproveitando os estilos fornecidos

export default function AdicionarProfessor() {
  const { id: turmaId } = useParams();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1); // 1: Selecionar Professor, 2: Selecionar Turma, 3: Confirmação

  // Estados de dados do backend
  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);

  // Seleções do utilizador
  const [professorSelecionado, setProfessorSelecionado] = useState(null);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);

  // Estados de Filtro/Busca
  const [buscaProfessor, setBuscaProfessor] = useState("");
  const [buscaTurma, setBuscaTurma] = useState("");

  // Estados de Carregamento e Feedback
  const [carregandoProfessores, setCarregandoProfessores] = useState(true);
  const [carregandoTurmas, setCarregandoTurmas] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erros, setErros] = useState({});

  const token = localStorage.getItem("@EduTrack:token");

  // 🔄 Carregar lista de professores ativos no sistema
  useEffect(() => {
    async function carregarProfessores() {
      try {
        setCarregandoProfessores(true);
        const response = await api.get("/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfessores(response.data);
      } catch (error) {
        console.error("Erro ao carregar professores:", error);
        setErros((prev) => ({ ...prev, professores: "Falha ao carregar a lista de professores." }));
      } finally {
        setCarregandoProfessores(false);
      }
    }
    carregarProfessores();
  }, [token]);

  // 🔄 Carregar lista de turmas disponíveis
  useEffect(() => {
    async function carregarTurmas() {
      try {
        setCarregandoTurmas(true);
        const response = await api.get("/classes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTurmas(response.data);
      } catch (error) {
        console.error("Erro ao carregar turmas:", error);
        setErros((prev) => ({ ...prev, turmas: "Falha ao carregar a lista de turmas." }));
      } finally {
        setCarregandoTurmas(false);
      }
    }
    carregarTurmas();
  }, [token]);

  // Se um ID de turma veio pela URL, pré-seleciona a turma assim que a listagem carregar
  useEffect(() => {
    if (turmaId && turmas.length > 0) {
      const turmaAlvo = turmas.find((t) => String(t.id) === String(turmaId));
      if (turmaAlvo) {
        setTurmaSelecionada(turmaAlvo);
      }
    }
  }, [turmaId, turmas]);

  // Filtros em tempo real baseados nos inputs de busca
  const profesoresFiltrados = professores.filter((prof) => {
    const nome = prof.user?.nome || prof.nome || "";
    return nome.toLowerCase().includes(buscaProfessor.toLowerCase());
  });

  const turmasFiltradas = turmas.filter((turma) => {
    const nome = turma.nome || "";
    const codigo = turma.codigo || "";
    return (
      nome.toLowerCase().includes(buscaTurma.toLowerCase()) ||
      codigo.toLowerCase().includes(buscaTurma.toLowerCase())
    );
  });

  // Funções de navegação do formulário
  function avancarEtapa() {
    const novosErros = {};

    if (etapa === 1 && !professorSelecionado) {
      novosErros.professor = "Selecione um professor antes de avançar.";
      setErros(novosErros);
      return;
    }

    if (etapa === 2 && !turmaSelecionada) {
      novosErros.turma = "Selecione uma turma antes de avançar.";
      setErros(novosErros);
      return;
    }

    setErros({});
    setEtapa((prev) => prev + 1);
  }

  function voltarEtapa() {
    if (etapa === 1) {
      navigate("/admin/turmas");
    } else {
      setErros({});
      setEtapa((prev) => prev - 1);
    }
  }

  // 🚀 Envio final da associação para o Back-end (Modificado para relação N:M)
  async function handleSubmit(e) {
    e.preventDefault();
    if (!professorSelecionado || !turmaSelecionada) return;

    setSalvando(true);
    setErros({});

    try {
      const token = localStorage.getItem("@EduTrack:token");
      
      // ALTERADO: Agora faz um POST para a rota pivô sem modificar/substituir o registro da turma
      const response = await api.post(
        `/classes/${turmaSelecionada.id}/attach-teacher`,
        {
          teacher_id: professorSelecionado.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSucesso(true);
        setTimeout(() => {
          navigate("/admin/turmas");
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao vincular professor:", error);
      const msg = error.response?.data?.error || "Erro ao alocar o professor à turma.";
      setErros({ geral: msg });
    } finally {
      setSalvando(false);
    }
  }

  // Helper para gerar as primeiras letras do nome (Avatar)
  function obterIniciais(nome) {
    if (!nome) return "PR";
    const partes = nome.trim().split(" ");
    if (partes.length > 1) {
      return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
    }
    return partes[0].slice(0, 2).toUpperCase();
  }

  return (
    <div className="matricular-aluno-page">
      {/* Cabeçalho da Página */}
      <div className="page-header">
        <button type="button" className="btn-back" onClick={voltarEtapa}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Alocar Professor</h1>
          <p className="page-subtitle">
            {etapa === 1 && "Passo 1 de 3: Selecione o Professor"}
            {etapa === 2 && "Passo 2 de 3: Selecione a Turma Alvo"}
            {etapa === 3 && "Passo 3 de 3: Confirmar Vinculação"}
          </p>
        </div>
      </div>

      <div className="matricular-container">
        <form className="matricular-form" onSubmit={handleSubmit}>
          
          {/* Indicador de Etapas */}
          <div className="etapas-indicator">
            <div className={`etapa ${etapa >= 1 ? "ativa" : ""}`}>
              <span>1</span>
              <label>Professor</label>
            </div>
            <div className="etapa-linha" />
            <div className={`etapa ${etapa >= 2 ? "ativa" : ""}`}>
              <span>2</span>
              <label>Turma</label>
            </div>
            <div className="etapa-linha" />
            <div className={`etapa ${etapa >= 3 ? "ativa" : ""}`}>
              <span>3</span>
              <label>Confirmação</label>
            </div>
          </div>

          {/* Notificações e Alertas */}
          {erros.geral && <div className="alert alert-danger">{erros.geral}</div>}
          {sucesso && (
            <div className="alert alert-success">
              ✓ Professor alocado com sucesso à turma! A redirecionar...
            </div>
          )}

          {/* ETAPA 1: SELECIONAR PROFESSOR */}
          {etapa === 1 && (
            <>
              <div className="form-section">
                <h2>Selecione o Professor</h2>
                <p className="section-desc">Busque e selecione o docente corporativo para a regência.</p>
              </div>

              <div className="busca-container">
                <Search size={18} />
                <input
                  type="text"
                  className="input-busca"
                  placeholder="Pesquisar professor por nome..."
                  value={buscaProfessor}
                  onChange={(e) => setBuscaProfessor(e.target.value)}
                />
              </div>

              {erros.professor && <span className="error-msg">{erros.professor}</span>}

              {carregandoProfessores ? (
                <div className="empty-message">
                  <Loader size={24} className="spinner animate-spin" style={{ margin: "0 auto 10px" }} />
                  <p>A carregar corpo docente...</p>
                </div>
              ) : profesoresFiltrados.length === 0 ? (
                <div className="empty-message">Nenhum professor encontrado com esse nome.</div>
              ) : (
                <div className={`alunos-grid ${erros.professor ? "has-error" : ""}`}>
                  {profesoresFiltrados.map((prof) => {
                    const nomeProf = prof.user?.nome || prof.nome || "Professor Sem Nome";
                    const emailProf = prof.user?.email || prof.email || "";
                    const isSelected = professorSelecionado?.id === prof.id;

                    return (
                      <div
                        key={prof.id}
                        className={`aluno-card ${isSelected ? "is-selected" : ""}`}
                        onClick={() => setProfessorSelecionado(prof)}
                      >
                        <input
                          type="radio"
                          name="professor"
                          checked={isSelected}
                          onChange={() => setProfessorSelecionado(prof)}
                        />
                        <div className="aluno-card-content">
                          <div className="aluno-avatar">{obterIniciais(nomeProf)}</div>
                          <div className="aluno-dados">
                            <span className="aluno-nome">{nomeProf}</span>
                            <span className="aluno-email">{emailProf}</span>
                            <span className="aluno-id">ID: {prof.id}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ETAPA 2: SELECIONAR TURMA */}
          {etapa === 2 && (
            <>
              <div className="form-section">
                <h2>Selecione a Turma</h2>
                <p className="section-desc">Escolha a turma à qual este professor ministrará aulas.</p>
              </div>

              {/* Informação contextual do professor selecionado */}
              <div className="aluno-selecionado">
                <strong>Professor Selecionado</strong>
                <div className="aluno-info">
                  <div className="aluno-avatar-small">
                    {obterIniciais(professorSelecionado?.user?.nome || professorSelecionado?.nome)}
                  </div>
                  <div>
                    <div className="aluno-nome">
                      {professorSelecionado?.user?.nome || professorSelecionado?.nome}
                    </div>
                    <div className="aluno-email">
                      {professorSelecionado?.user?.email || professorSelecionado?.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="busca-container">
                <Search size={18} />
                <input
                  type="text"
                  className="input-busca"
                  placeholder="Pesquisar por código, classe ou curso..."
                  value={buscaTurma}
                  onChange={(e) => setBuscaTurma(e.target.value)}
                />
              </div>

              {erros.turma && <span className="error-msg">{erros.turma}</span>}

              {carregandoTurmas ? (
                <div className="empty-message">
                  <Loader size={24} className="spinner animate-spin" style={{ margin: "0 auto 10px" }} />
                  <p>A carregar listagem de turmas...</p>
                </div>
              ) : turmasFiltradas.length === 0 ? (
                <div className="empty-message">Nenhuma turma ativa corresponde à pesquisa.</div>
              ) : (
                <div className={`turmas-grid ${erros.turma ? "has-error" : ""}`}>
                  {turmasFiltradas.map((turma) => {
                    const isSelected = turmaSelecionada?.id === turma.id;
                    const totalAlunos = turma.total_alunos || 0;
                    const capacidadeMax = turma.capacidade || 30;
                    const percentagemOcupacao = Math.min((totalAlunos / capacidadeMax) * 100, 100);

                    let classeLotacao = "baixo";
                    if (percentagemOcupacao > 50 && percentagemOcupacao <= 85) classeLotacao = "medio";
                    if (percentagemOcupacao > 85) classeLotacao = "alto";

                    return (
                      <div
                        key={turma.id}
                        className={`turma-card ${isSelected ? "is-selected" : ""}`}
                        onClick={() => setTurmaSelecionada(turma)}
                      >
                        <input
                          type="radio"
                          name="turma"
                          checked={isSelected}
                          onChange={() => setTurmaSelecionada(turma)}
                        />
                        <div className="turma-card-content">
                          <div className="turma-avatar">{turma.codigo?.slice(0, 2) || "TM"}</div>
                          <div className="turma-dados">
                            <span className="turma-nome">{turma.nome || "Sem Nome"}</span>
                            <span className="turma-codigo">{turma.codigo}</span>
                            <span className="turma-curso">{turma.curso || "Período Regular"}</span>
                            
                            <div className="turma-stats">
                              <div className="stat">
                                <span className="label">Alunos</span>
                                <span className="value">{totalAlunos}/{capacidadeMax}</span>
                              </div>
                            </div>
                            <div className="lotacao-bar" style={{ marginTop: "8px" }}>
                              <div
                                className={`lotacao-fill ${classeLotacao}`}
                                style={{ width: `${percentagemOcupacao}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ETAPA 3: CONFIRMAÇÃO */}
          {etapa === 3 && (
            <>
              <div className="form-section">
                <h2>Confirmar Atribuição</h2>
                <p className="section-desc">
                  Por favor, valide os dados antes de consolidar a alocação no EduTrack.
                </p>
              </div>

              <div className="confirmacao-container">
                {/* Bloco do Docente */}
                <div className="confirmacao-bloco">
                  <h3>Docente Selecionado</h3>
                  <div className="confirmacao-item">
                    <div className="item-avatar">
                      {obterIniciais(professorSelecionado?.user?.nome || professorSelecionado?.nome)}
                    </div>
                    <div className="item-info">
                      <div className="nome">
                        {professorSelecionado?.user?.nome || professorSelecionado?.nome}
                      </div>
                      <div className="email">
                        {professorSelecionado?.user?.email || professorSelecionado?.email}
                      </div>
                      <div className="id">Nº Registro: {professorSelecionado?.id}</div>
                    </div>
                  </div>
                </div>

                {/* Bloco da Turma */}
                <div className="confirmacao-bloco">
                  <h3>Turma de Destino</h3>
                  <div className="confirmacao-item">
                    <div className="item-avatar">
                      {turmaSelecionada?.codigo?.slice(0, 2) || "TM"}
                    </div>
                    <div className="item-info">
                      <div className="nome">{turmaSelecionada?.nome}</div>
                      <div className="codigo">Código Único: {turmaSelecionada?.codigo}</div>
                      <div className="curso">Curso: {turmaSelecionada?.curso || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Barra de Botões de Ação Inferior */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={voltarEtapa}
              disabled={salvando || sucesso}
            >
              {etapa === 1 ? "Cancelar" : "Voltar"}
            </button>

            {etapa < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={avancarEtapa}
              >
                Avançar Passo
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-hero"
                disabled={salvando || sucesso}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                {salvando ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Processando vínculo...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Confirmar e Salvar
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}