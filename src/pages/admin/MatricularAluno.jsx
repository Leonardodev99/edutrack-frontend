import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Search } from "lucide-react";
import { turmasStore, alunosStore, matricularAluno } from "../../utils/adminMockData.js";
import "../../styles/MatricularAluno.css";

export default function MatricularAluno() {
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState(1); // 1: Selecionar Aluno, 2: Selecionar Turma, 3: Confirmar

  // Dados da Matrícula
  const [matriculaData, setMatriculaData] = useState({
    student_id: "",
    turma_id: "",
  });

  const [busca, setBusca] = useState("");
  const [buscaTurma, setBuscaTurma] = useState("");
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Obter alunos disponíveis
  const alunosDisponiveis = useMemo(() => {
    return alunosStore.list().filter((aluno) => {
      const matchBusca =
        aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
        aluno.id.toLowerCase().includes(busca.toLowerCase()) ||
        aluno.email.toLowerCase().includes(busca.toLowerCase());

      return matchBusca;
    });
  }, [busca]);

  // Obter turmas disponíveis
  const turmasDisponiveis = useMemo(() => {
    return turmasStore.list().filter((turma) => {
      const matchBusca =
        turma.nome.toLowerCase().includes(buscaTurma.toLowerCase()) ||
        turma.codigo.toLowerCase().includes(buscaTurma.toLowerCase());

      return matchBusca;
    });
  }, [buscaTurma]);

  // Obter aluno selecionado
  function obterAlunoSelecionado() {
    return alunosStore.get(matriculaData.student_id) || null;
  }

  // Obter turma selecionada
  function obterTurmaSelecionada() {
    return turmasStore.get(matriculaData.turma_id) || null;
  }

  // Validar Etapa 1
  function validarEtapa1() {
    const novosErros = {};

    if (!matriculaData.student_id) {
      novosErros.student_id = "Selecione um aluno";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Validar Etapa 2
  function validarEtapa2() {
    const novosErros = {};

    if (!matriculaData.turma_id) {
      novosErros.turma_id = "Selecione uma turma";
    }

    const aluno = obterAlunoSelecionado();
    const turma = obterTurmaSelecionada();

    // Verifica se aluno já está em uma turma
    if (aluno?.turmaId) {
      novosErros.aluno_turma = `Este aluno já está matriculado na turma ${aluno.turmaId}`;
    }

    // Verifica se aluno já está nesta turma
    if (turma?.alunos.includes(matriculaData.student_id)) {
      novosErros.aluno_existe = "Este aluno já está matriculado nesta turma";
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
    } else if (etapa === 2) {
      if (validarEtapa2()) {
        setEtapa(3);
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
      navigate("/admin/alunos");
    }
  }

  // Submeter matrícula
  async function handleSubmit(e) {
    e.preventDefault();

    if (etapa !== 3) {
      return;
    }

    setCarregando(true);

    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Realiza a matrícula
      const resultado = matricularAluno(
        matriculaData.turma_id,
        matriculaData.student_id
      );

      if (resultado) {
        setSucesso(true);
        setTimeout(() => {
          navigate("/admin/turmas");
        }, 1500);
      } else {
        setErros({ geral: "Erro ao matricular aluno. Tente novamente." });
      }
    } catch (error) {
      setErros({ geral: "Erro ao matricular aluno. Tente novamente." });
    } finally {
      setCarregando(false);
    }
  }

  // Calcular quantidade de alunos na turma selecionada
  function calcularLotacao() {
    const turma = obterTurmaSelecionada();
    const quantidade = turma?.alunos?.length || 0;
    const percentual = Math.round((quantidade / 30) * 100); // Supondo 30 lugares max
    return { quantidade, percentual };
  }

  const { quantidade: quantidadeAlunos, percentual } = calcularLotacao();

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

          {/* Mensagem de Erro Geral */}
          {erros.geral && (
            <div className="alert alert-danger">
              {erros.geral}
            </div>
          )}

          {/* Mensagem de Sucesso */}
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
                <p className="section-desc">
                  Escolha o aluno que deseja matricular
                </p>
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
                        matriculaData.student_id === aluno.id ? "is-selected" : ""
                      } ${aluno.turmaId ? "is-disabled" : ""}`}
                    >
                      <input
                        type="radio"
                        name="student_id"
                        value={aluno.id}
                        checked={matriculaData.student_id === aluno.id}
                        onChange={(e) =>
                          setMatriculaData({
                            ...matriculaData,
                            student_id: e.target.value,
                          })
                        }
                        disabled={!!aluno.turmaId}
                      />
                      <div className="aluno-card-content">
                        <div className="aluno-avatar">
                          {aluno.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="aluno-dados">
                          <div className="aluno-nome">{aluno.nome}</div>
                          <div className="aluno-email">{aluno.email}</div>
                          <div className="aluno-id">{aluno.id}</div>
                        </div>
                        {aluno.turmaId && (
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
                    {obterAlunoSelecionado()?.nome.charAt(0).toUpperCase()}
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
                        matriculaData.turma_id === turma.id ? "is-selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="turma_id"
                        value={turma.id}
                        checked={matriculaData.turma_id === turma.id}
                        onChange={(e) =>
                          setMatriculaData({
                            ...matriculaData,
                            turma_id: e.target.value,
                          })
                        }
                      />
                      <div className="turma-card-content">
                        <div className="turma-avatar">
                          {turma.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="turma-dados">
                          <div className="turma-nome">{turma.nome}</div>
                          <div className="turma-codigo">{turma.codigo}</div>
                          <div className="turma-curso">{turma.curso}</div>
                        </div>
                        <div className="turma-stats">
                          <div className="stat">
                            <span className="label">Alunos</span>
                            <span className="value">{turma.alunos?.length || 0}</span>
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

              {(erros.turma_id || erros.aluno_turma || erros.aluno_existe) && (
                <span className="error-msg">
                  {erros.turma_id || erros.aluno_turma || erros.aluno_existe}
                </span>
              )}
            </>
          )}

          {/* ETAPA 3: CONFIRMAR MATRÍCULA */}
          {etapa === 3 && (
            <>
              <div className="form-section">
                <h2>Confirme a Matrícula</h2>
                <p className="section-desc">
                  Revise os dados antes de confirmar
                </p>
              </div>

              <div className="confirmacao-container">
                {/* Aluno */}
                <div className="confirmacao-bloco">
                  <h3>Aluno</h3>
                  <div className="confirmacao-item">
                    <div className="item-avatar">
                      {obterAlunoSelecionado()?.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="item-info">
                      <div className="nome">{obterAlunoSelecionado()?.nome}</div>
                      <div className="email">{obterAlunoSelecionado()?.email}</div>
                      <div className="id">{obterAlunoSelecionado()?.id}</div>
                    </div>
                  </div>
                </div>

                {/* Turma */}
                <div className="confirmacao-bloco">
                  <h3>Turma</h3>
                  <div className="confirmacao-item">
                    <div className="item-avatar">
                      {obterTurmaSelecionada()?.nome.charAt(0).toUpperCase()}
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

                  {/* Barra de Lotação */}
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
                <strong>ℹ Informação:</strong>
                Após confirmar, o aluno será matriculado nesta turma e será
                removido de qualquer outra turma anterior.
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
                disabled={carregando}
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