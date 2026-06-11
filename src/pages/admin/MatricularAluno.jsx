import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Search } from "lucide-react";
import api from "../../services/api.js";
import "../../styles/MatricularAluno.css";

export default function MatricularAluno() {
  const navigate = useNavigate();
  const location = useLocation();
  const turmaIdInicial = location.state?.turmaId || "";

  const [etapa, setEtapa] = useState(1); // 1: Selecionar Aluno, 2: Selecionar Turma, 3: Confirmar

  const [matriculaData, setMatriculaData] = useState({
    student_id: "",
    turma_id: turmaIdInicial,
  });

  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [busca, setBusca] = useState("");
  const [buscaTurma, setBuscaTurma] = useState("");
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [sucesso, setSucesso] = useState(false);

  // Buscar alunos e turmas da API ao montar
  useEffect(() => {
    async function carregarDados() {
      setCarregandoDados(true);
      try {
        const [resAlunos, resTurmas] = await Promise.all([
          api.get("/students"),
          api.get("/classes"),
        ]);
        setAlunos(resAlunos.data);
        setTurmas(resTurmas.data);

        // Se veio turmaId inicial por state, pular para etapa 1 normalmente
        // (turma já pré-selecionada)
        if (turmaIdInicial) {
          setMatriculaData((prev) => ({ ...prev, turma_id: turmaIdInicial }));
        }
      } catch (error) {
        setErros({ geral: "Erro ao carregar dados. Tente recarregar a página." });
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDados();
  }, [turmaIdInicial]);

  // Alunos filtrados pela busca
  const alunosDisponiveis = useMemo(() => {
    const termo = busca.toLowerCase();
    return alunos.filter(
      (aluno) =>
        aluno.nome?.toLowerCase().includes(termo) ||
        String(aluno.id).toLowerCase().includes(termo) ||
        aluno.email?.toLowerCase().includes(termo)
    );
  }, [alunos, busca]);

  // Turmas filtradas pela busca
  const turmasDisponiveis = useMemo(() => {
    const termo = buscaTurma.toLowerCase();
    return turmas.filter(
      (turma) =>
        turma.nome?.toLowerCase().includes(termo) ||
        turma.codigo?.toLowerCase().includes(termo)
    );
  }, [turmas, buscaTurma]);

  function obterAlunoSelecionado() {
    return alunos.find((a) => String(a.id) === String(matriculaData.student_id)) || null;
  }

  function obterTurmaSelecionada() {
    return turmas.find((t) => String(t.id) === String(matriculaData.turma_id)) || null;
  }

  function validarEtapa1() {
    const novosErros = {};
    if (!matriculaData.student_id) {
      novosErros.student_id = "Selecione um aluno";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function validarEtapa2() {
    const novosErros = {};
    if (!matriculaData.turma_id) {
      novosErros.turma_id = "Selecione uma turma";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function avancar() {
    if (etapa === 1 && validarEtapa1()) {
      setEtapa(2);
      setErros({});
    } else if (etapa === 2 && validarEtapa2()) {
      setEtapa(3);
      setErros({});
    }
  }

  function voltar() {
    if (etapa > 1) {
      setEtapa(etapa - 1);
      setErros({});
    } else {
      navigate("/admin/alunos");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (etapa !== 3) return;

    setCarregando(true);
    setErros({});

    try {
      await api.post(`/classes/${matriculaData.turma_id}/enroll`, {
        student_id: matriculaData.student_id,
      });

      setSucesso(true);
      setTimeout(() => {
        navigate("/admin/turmas");
      }, 1500);
    } catch (error) {
      const mensagem =
        error.response?.data?.error || "Erro ao matricular aluno. Tente novamente.";
      setErros({ geral: mensagem });
    } finally {
      setCarregando(false);
    }
  }

  function calcularLotacao() {
    const turma = obterTurmaSelecionada();
    // A API pode retornar `students_count` ou um array `alunos`
    const quantidade = turma?.students_count ?? turma?.alunos?.length ?? 0;
    const percentual = Math.round((quantidade / 30) * 100);
    return { quantidade, percentual };
  }

  const { quantidade: quantidadeAlunos, percentual } = calcularLotacao();

  if (carregandoDados) {
    return (
      <div className="matricular-aluno-page">
        <div className="loading-state">
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="matricular-aluno-page">
      <div className="page-header">
        <button className="btn-back" onClick={voltar}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Matricular Aluno</h1>
          <p className="page-subtitle">
            {etapa === 1
              ? "Passo 1 de 3: Selecione o Aluno"
              : etapa === 2
              ? "Passo 2 de 3: Selecione a Turma"
              : "Passo 3 de 3: Confirme a Matrícula"}
          </p>
        </div>
      </div>

      <div className="matricular-container">
        <form className="matricular-form" onSubmit={handleSubmit}>
          {/* Indicador de Etapas */}
          <div className="etapas-indicator">
            <div className={`etapa ${etapa >= 1 ? "ativa" : ""}`}>
              <span>1</span>
              <label>Aluno</label>
            </div>
            <div className="etapa-linha" />
            <div className={`etapa ${etapa >= 2 ? "ativa" : ""}`}>
              <span>2</span>
              <label>Turma</label>
            </div>
            <div className="etapa-linha" />
            <div className={`etapa ${etapa >= 3 ? "ativa" : ""}`}>
              <span>3</span>
              <label>Confirmar</label>
            </div>
          </div>

          {/* Erro Geral */}
          {erros.geral && (
            <div className="alert alert-danger">{erros.geral}</div>
          )}

          {/* Sucesso */}
          {sucesso && (
            <div className="alert alert-success">
              ✓ Aluno matriculado com sucesso! Redirecionando...
            </div>
          )}

          {/* ETAPA 1: SELECIONAR ALUNO */}
          {etapa === 1 && (
            <>
              <div className="form-section">
                <h2>Selecione o Aluno</h2>
                <p className="section-desc">Escolha o aluno que deseja matricular</p>
              </div>

              <div className="busca-container">
                <Search size={16} />
                <input
                  type="text"
                  className="input-busca"
                  placeholder="Buscar por nome, ID ou email..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              {alunosDisponiveis.length === 0 ? (
                <div className="empty-message">
                  <p>Nenhum aluno encontrado</p>
                </div>
              ) : (
                <div className={`alunos-grid ${erros.student_id ? "has-error" : ""}`}>
                  {alunosDisponiveis.map((aluno) => (
                    <label
                      key={aluno.id}
                      className={`aluno-card ${
                        String(matriculaData.student_id) === String(aluno.id)
                          ? "is-selected"
                          : ""
                      } ${aluno.class_id ? "is-disabled" : ""}`}
                    >
                      <input
                        type="radio"
                        name="student_id"
                        value={aluno.id}
                        checked={
                          String(matriculaData.student_id) === String(aluno.id)
                        }
                        onChange={(e) =>
                          setMatriculaData({
                            ...matriculaData,
                            student_id: e.target.value,
                          })
                        }
                        disabled={!!aluno.class_id}
                      />
                      <div className="aluno-card-content">
                        <div className="aluno-avatar">
                          {aluno.nome?.charAt(0).toUpperCase()}
                        </div>
                        <div className="aluno-dados">
                          <div className="aluno-nome">{aluno.nome}</div>
                          <div className="aluno-email">{aluno.email}</div>
                          <div className="aluno-id">ID: {aluno.id}</div>
                        </div>
                        {aluno.class_id && (
                          <div className="status-badge">Já matriculado</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {erros.student_id && (
                <span className="error-msg">{erros.student_id}</span>
              )}
            </>
          )}

          {/* ETAPA 2: SELECIONAR TURMA */}
          {etapa === 2 && (
            <>
              <div className="form-section">
                <h2>Selecione a Turma</h2>
                <p className="section-desc">
                  Escolha a turma para matricular o aluno
                </p>
              </div>

              <div className="aluno-selecionado">
                <strong>Aluno Selecionado:</strong>
                <div className="aluno-info">
                  <div className="aluno-avatar-small">
                    {obterAlunoSelecionado()?.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="aluno-nome">
                      {obterAlunoSelecionado()?.nome}
                    </div>
                    <div className="aluno-email">
                      {obterAlunoSelecionado()?.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="busca-container">
                <Search size={16} />
                <input
                  type="text"
                  className="input-busca"
                  placeholder="Buscar por nome ou código..."
                  value={buscaTurma}
                  onChange={(e) => setBuscaTurma(e.target.value)}
                />
              </div>

              {turmasDisponiveis.length === 0 ? (
                <div className="empty-message">
                  <p>Nenhuma turma encontrada</p>
                </div>
              ) : (
                <div className={`turmas-grid ${erros.turma_id ? "has-error" : ""}`}>
                  {turmasDisponiveis.map((turma) => (
                    <label
                      key={turma.id}
                      className={`turma-card ${
                        String(matriculaData.turma_id) === String(turma.id)
                          ? "is-selected"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="turma_id"
                        value={turma.id}
                        checked={
                          String(matriculaData.turma_id) === String(turma.id)
                        }
                        onChange={(e) =>
                          setMatriculaData({
                            ...matriculaData,
                            turma_id: e.target.value,
                          })
                        }
                      />
                      <div className="turma-card-content">
                        <div className="turma-avatar">
                          {turma.nome?.charAt(0).toUpperCase()}
                        </div>
                        <div className="turma-dados">
                          <div className="turma-nome">{turma.nome}</div>
                          <div className="turma-codigo">{turma.codigo}</div>
                          <div className="turma-curso">{turma.curso}</div>
                        </div>
                        <div className="turma-stats">
                          <div className="stat">
                            <span className="label">Alunos</span>
                            <span className="value">
                              {turma.students_count ?? turma.alunos?.length ?? 0}
                            </span>
                          </div>
                          <div className="stat">
                            <span className="label">Ano</span>
                            <span className="value">{turma.ano_letivo}</span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {erros.turma_id && (
                <span className="error-msg">{erros.turma_id}</span>
              )}
            </>
          )}

          {/* ETAPA 3: CONFIRMAR MATRÍCULA */}
          {etapa === 3 && (
            <>
              <div className="form-section">
                <h2>Confirme a Matrícula</h2>
                <p className="section-desc">Revise os dados antes de confirmar</p>
              </div>

              <div className="confirmacao-container">
                {/* Aluno */}
                <div className="confirmacao-bloco">
                  <h3>Aluno</h3>
                  <div className="confirmacao-item">
                    <div className="item-avatar">
                      {obterAlunoSelecionado()?.nome?.charAt(0).toUpperCase()}
                    </div>
                    <div className="item-info">
                      <div className="nome">{obterAlunoSelecionado()?.nome}</div>
                      <div className="email">{obterAlunoSelecionado()?.email}</div>
                      <div className="id">ID: {obterAlunoSelecionado()?.id}</div>
                    </div>
                  </div>
                </div>

                {/* Turma */}
                <div className="confirmacao-bloco">
                  <h3>Turma</h3>
                  <div className="confirmacao-item">
                    <div className="item-avatar">
                      {obterTurmaSelecionada()?.nome?.charAt(0).toUpperCase()}
                    </div>
                    <div className="item-info">
                      <div className="nome">{obterTurmaSelecionada()?.nome}</div>
                      <div className="codigo">{obterTurmaSelecionada()?.codigo}</div>
                      <div className="curso">{obterTurmaSelecionada()?.curso}</div>
                    </div>
                  </div>
                </div>

                {/* Lotação */}
                <div className="confirmacao-bloco">
                  <h3>Informações da Turma</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Alunos Atuais</span>
                      <span className="value">{quantidadeAlunos}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Lotação</span>
                      <span className="value">{percentual}%</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Ano Letivo</span>
                      <span className="value">
                        {obterTurmaSelecionada()?.ano_letivo}
                      </span>
                    </div>
                  </div>

                  <div className="lotacao-bar">
                    <div
                      className={`lotacao-fill ${
                        percentual >= 80
                          ? "alto"
                          : percentual >= 50
                          ? "medio"
                          : "baixo"
                      }`}
                      style={{ width: `${Math.min(percentual, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <strong>ℹ Informação:</strong> Após confirmar, o aluno será
                matriculado nesta turma e não poderá ser matriculado em outra
                enquanto estiver ativo.
              </div>
            </>
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

            {etapa < 3 ? (
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
                disabled={carregando || sucesso}
              >
                <Save size={18} />
                {carregando ? "Matriculando..." : "Confirmar Matrícula"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
