import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader } from "lucide-react";
import api from "../../services/api";
import "../../styles/CriarEncarregado.css";

export default function CriarEncarregado() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1); // 1: Usuário, 2: Perfil Encarregado

  // Dados do Usuário
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  // Dados do Encarregado
  const [encarregadoData, setEncarregadoData] = useState({
    telefone: "",
    students: [], // IDs dos alunos selecionados
  });

  const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoAlunos, setCarregandoAlunos] = useState(true);
  const [sucesso, setSucesso] = useState(false);

  // ID do utilizador retornado após guardar a Etapa 1
  const [createdUserId, setCreatedUserId] = useState(null);

  // 🔄 Buscar alunos reais do backend ao montar o componente
  useEffect(() => {
    async function carregarAlunos() {
      setCarregandoAlunos(true);
      try {
        const token = localStorage.getItem("@EduTrack:token");

        // GET /students - retorna todos os alunos usando a API configurada
        const response = await api.get("/students", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Alunos carregados:", response.data);

        // Mapear os alunos para ter a estrutura correta
        const alunos = response.data.map((aluno) => ({
          id: aluno.id,
          nome: aluno.user?.nome || aluno.nome || "Sem nome",
          email: aluno.user?.email || aluno.email,
          matricula: aluno.matricula,
          user: aluno.user,
        }));

        setAlunosDisponiveis(alunos);
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        console.error("Resposta de erro:", error.response?.data);
      } finally {
        setCarregandoAlunos(false);
      }
    }
    carregarAlunos();
  }, []);

  // Validação da Etapa 1 (Usuário)
  function validarEtapa1() {
    const novosErros = {};

    if (!userData.nome.trim()) {
      novosErros.nome = "Nome é obrigatório";
    } else if (userData.nome.trim().length < 5) {
      novosErros.nome = "O nome deve ter entre 5 e 150 caracteres";
    } else if (/^\d/.test(userData.nome.trim())) {
      novosErros.nome = "O nome não pode começar com um número";
    }

    if (!userData.email.trim()) {
      novosErros.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      novosErros.email = "Email inválido";
    }

    if (!userData.senha) {
      novosErros.senha = "Senha é obrigatória";
    } else if (userData.senha.length < 6) {
      novosErros.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    if (userData.senha !== userData.confirmarSenha) {
      novosErros.confirmarSenha = "Senhas não correspondem";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Validação da Etapa 2 (Encarregado)
  function validarEtapa2() {
    const novosErros = {};
    const telefoneLimpo = encarregadoData.telefone.replace(/\s/g, "");

    if (!telefoneLimpo) {
      novosErros.telefone = "Telefone é obrigatório";
    } else if (telefoneLimpo.length !== 9) {
      novosErros.telefone = "O telefone deve ter exatamente 9 dígitos";
    } else if (!/^9\d{8}$/.test(telefoneLimpo)) {
      novosErros.telefone = "O telefone em Angola deve começar com o dígito 9";
    }

    if (encarregadoData.students.length === 0) {
      novosErros.students = "Selecione pelo menos um aluno";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Avançar para a Etapa 2 criando primeiro o utilizador no backend
  async function avancar() {
    if (!validarEtapa1()) return;

    setCarregando(true);
    setErros({});

    try {
      const token = localStorage.getItem("@EduTrack:token");

      // Executa o POST para a rota global de utilizadores, passando o tipo correto
      const response = await api.post("/users", {
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha,
        tipo: "encarregado",
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Guardamos o ID gerado pelo banco para a próxima fase
      setCreatedUserId(response.data.id);
      setEtapa(2);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErros({ email: error.response.data.error });
      } else {
        setErros({ geral: "Erro ao validar utilizador no servidor." });
      }
    } finally {
      setCarregando(false);
    }
  }

  function voltar() {
    if (etapa === 2) {
      setEtapa(1);
    } else {
      navigate("/admin/encarregados");
    }
  }

  function toggleEstudante(alunoId) {
    setEncarregadoData((prev) => {
      const students = prev.students.includes(alunoId)
        ? prev.students.filter((id) => id !== alunoId)
        : [...prev.students, alunoId];
      return { ...prev, students };
    });
  }

  function formatarTelefone(valor) {
    const digitos = valor.replace(/\D/g, "");
    if (digitos.length <= 3) return digitos;
    if (digitos.length <= 6)
      return `${digitos.slice(0, 3)} ${digitos.slice(3)}`;
    return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6, 9)}`;
  }

  // 🚀 Submissão Final para a rota de encarregados
  async function handleSubmit(e) {
    e.preventDefault();

    if (etapa === 1) {
      await avancar();
      return;
    }

    if (!validarEtapa2()) return;

    setCarregando(true);
    setErros({});

    try {
      const token = localStorage.getItem("@EduTrack:token");

      // Enviamos apenas o user_id, telefone e o array de alunos associados
      const payload = {
        user_id: createdUserId,
        telefone: encarregadoData.telefone.replace(/\s/g, ""), 
        students: encarregadoData.students, 
      };

      const response = await api.post("/guardians", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        setSucesso(true);
        setTimeout(() => {
          navigate("/admin/encarregados");
        }, 1500);
      }
    } catch (error) {
      const msgErro =
        error.response?.data?.error || "Erro ao vincular dados do encarregado.";
      setErros({ geral: msgErro });
      console.error("Erro ao criar encarregado:", error);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="criar-encarregado-page">
      <div className="page-header">
        <button type="button" className="btn-back" onClick={voltar}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Criar Encarregado</h1>
          <p className="page-subtitle">
            {etapa === 1
              ? "Passo 1 de 2: Dados de Acesso"
              : "Passo 2 de 2: Dados do Encarregado"}
          </p>
        </div>
      </div>

      <div className="criar-encarregado-container">
        <form className="criar-encarregado-form" onSubmit={handleSubmit}>
          {/* Indicador de Etapas */}
          <div className="etapas-indicator">
            <div className={`etapa ${etapa >= 1 ? "ativa" : ""}`}>
              <span>1</span>
              <label>Usuário</label>
            </div>
            <div className="etapa-linha" />
            <div className={`etapa ${etapa >= 2 ? "ativa" : ""}`}>
              <span>2</span>
              <label>Encarregado</label>
            </div>
          </div>

          {erros.geral && <div className="alert alert-danger">{erros.geral}</div>}

          {sucesso && (
            <div className="alert alert-success">
              ✓ Encarregado criado com sucesso! Redirecionando...
            </div>
          )}

          {/* ETAPA 1: DADOS DO USUÁRIO */}
          {etapa === 1 && (
            <>
              <div className="form-section">
                <h2>Dados de Acesso</h2>
                <p className="section-desc">
                  Crie uma conta para o novo encarregado de educação
                </p>
              </div>

              <div className="form-group">
                <label className="label">Nome Completo *</label>
                <input
                  type="text"
                  className={`input ${erros.nome ? "is-invalid" : ""}`}
                  placeholder="Ana Maria Costa"
                  value={userData.nome}
                  onChange={(e) =>
                    setUserData({ ...userData, nome: e.target.value })
                  }
                  disabled={carregando}
                />
                {erros.nome && <span className="error-msg">{erros.nome}</span>}
              </div>

              <div className="form-group">
                <label className="label">Email *</label>
                <input
                  type="email"
                  className={`input ${erros.email ? "is-invalid" : ""}`}
                  placeholder="ana.costa@escola.com"
                  value={userData.email}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  disabled={carregando}
                />
                {erros.email && <span className="error-msg">{erros.email}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Senha *</label>
                  <input
                    type="password"
                    className={`input ${erros.senha ? "is-invalid" : ""}`}
                    placeholder="••••••••"
                    value={userData.senha}
                    onChange={(e) =>
                      setUserData({ ...userData, senha: e.target.value })
                    }
                    disabled={carregando}
                  />
                  {erros.senha && (
                    <span className="error-msg">{erros.senha}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="label">Confirmar Senha *</label>
                  <input
                    type="password"
                    className={`input ${
                      erros.confirmarSenha ? "is-invalid" : ""
                    }`}
                    placeholder="••••••••"
                    value={userData.confirmarSenha}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        confirmarSenha: e.target.value,
                      })
                    }
                    disabled={carregando}
                  />
                  {erros.confirmarSenha && (
                    <span className="error-msg">{erros.confirmarSenha}</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ETAPA 2: DADOS DO ENCARREGADO */}
          {etapa === 2 && (
            <>
              <div className="form-section">
                <h2>Dados do Encarregado</h2>
                <p className="section-desc">
                  Configure os dados de contacto e associe os alunos
                </p>
              </div>

              <div className="form-group">
                <label className="label">Utilizador Vinculado (Apenas Leitura)</label>
                <input
                  type="text"
                  className="input is-disabled"
                  value={`${userData.nome} (${userData.email})`}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="label">Telefone Principal *</label>
                <input
                  type="tel"
                  className={`input ${erros.telefone ? "is-invalid" : ""}`}
                  placeholder="9XX XXX XXX"
                  value={encarregadoData.telefone}
                  onChange={(e) =>
                    setEncarregadoData({
                      ...encarregadoData,
                      telefone: formatarTelefone(e.target.value),
                    })
                  }
                  disabled={carregando}
                />
                {erros.telefone && (
                  <span className="error-msg">{erros.telefone}</span>
                )}
              </div>

              <div className="form-group">
                <label className="label">Alunos Associados *</label>
                <p className="section-desc-small">
                  Selecione os alunos que este encarregado representa
                </p>

                {carregandoAlunos ? (
                  <div className="loading-alunos">
                    <Loader size={24} className="spinner" />
                    <p>A carregar alunos...</p>
                  </div>
                ) : alunosDisponiveis.length === 0 ? (
                  <div className="empty-alunos">
                    <p>Nenhum aluno disponível no sistema</p>
                  </div>
                ) : (
                  <div className="estudantes-grid">
                    {alunosDisponiveis.map((aluno) => (
                      <label
                        key={aluno.id}
                        className={`estudante-checkbox ${
                          encarregadoData.students.includes(aluno.id)
                            ? "is-checked"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={encarregadoData.students.includes(aluno.id)}
                          onChange={() => toggleEstudante(aluno.id)}
                          disabled={carregando}
                        />
                        <span className="checkbox-label">
                          <strong>{aluno.nome}</strong>
                          <small>Matrícula: {aluno.matricula || "—"}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {erros.students && (
                  <span className="error-msg">{erros.students}</span>
                )}
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
              {etapa === 2 ? "Voltar" : "Cancelar"}
            </button>

            {etapa === 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={avancar}
                disabled={carregando}
              >
                {carregando ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Loader size={16} className="animate-spin" /> Processando...
                  </span>
                ) : (
                  "Avançar Passo"
                )}
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-hero"
                disabled={carregando}
              >
                {carregando ? (
                  <>
                    <Loader size={18} className="spinner-small animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Criar Encarregado
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Card de Resumo */}
        {etapa === 2 && (
          <div className="form-resumo">
            <h3>Resumo</h3>
            <div className="resumo-item">
              <span className="resumo-label">Nome:</span>
              <span className="resumo-value">{userData.nome}</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Email:</span>
              <span className="resumo-value">{userData.email}</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Telefone:</span>
              <span className="resumo-value">{encarregadoData.telefone}</span>
            </div>
            <div className="resumo-section">
              <span className="resumo-label">Alunos Associados:</span>
              <div className="alunos-resumo">
                {encarregadoData.students.length > 0 ? (
                  encarregadoData.students.map((alunoId) => {
                    const aluno = alunosDisponiveis.find(
                      (a) => a.id === alunoId
                    );
                    return (
                      <span key={alunoId} className="badge badge-primary">
                        {aluno?.nome || "Aluno"}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-muted">Nenhum aluno selecionado</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}