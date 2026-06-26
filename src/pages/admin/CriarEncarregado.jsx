import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader } from "lucide-react";
import api from "../../services/api";
import "../../styles/CriarEncarregado.css";

export default function CriarEncarregado() {
  const navigate = useNavigate();
  const { id } = useParams(); // 🌟 Captura o ID da URL se for modo Edição (/admin/encarregados/editar/:id)
  const isEditMode = Boolean(id);

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

  // Armazena o ID do user correspondente
  const [createdUserId, setCreatedUserId] = useState(null);

  // 🔄 1. Buscar os dados do encarregado caso seja Modo Edição
  useEffect(() => {
    async function carregarDadosEncarregado() {
      if (!isEditMode) return;

      setCarregando(true);
      try {
        const token = localStorage.getItem("@EduTrack:token");
        
        // Ajuste o endpoint conforme a sua API do backend (ex: /guardians/:id)
        const response = await api.get(`/guardians/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const encarregado = response.data;

        // Preenche os dados do Usuário (vincular do objeto encarregado.user se o backend retornar aninhado)
        setUserData({
          nome: encarregado.user?.nome || encarregado.nome || "",
          email: encarregado.user?.email || encarregado.email || "",
          senha: "", // Senha mantida vazia na edição por segurança
          confirmarSenha: "",
        });

        // Preenche os dados específicos do encarregado
        setEncarregadoData({
          telefone: formatarTelefone(encarregado.telefone || ""),
          // Garante que mapeia apenas os IDs dos alunos vinculados
          students: encarregado.students?.map(s => s.id) || [], 
        });

        setCreatedUserId(encarregado.user_id || encarregado.user?.id || null);
      } catch (error) {
        console.error("Erro ao carregar dados do encarregado para edição:", error);
        setErros({ geral: "Não foi possível carregar os dados deste encarregado." });
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosEncarregado();
  }, [id, isEditMode]);

  // 🔄 2. Buscar todos os alunos disponíveis do backend
  useEffect(() => {
    async function carregarAlunos() {
      setCarregandoAlunos(true);
      try {
        const token = localStorage.getItem("@EduTrack:token");

        const response = await api.get("/students", {
          headers: { Authorization: `Bearer ${token}` },
        });

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

    // 🌟 Na Edição, a senha só é obrigatória se o administrador digitar algo para alterá-la
    if (!isEditMode) {
      if (!userData.senha) {
        novosErros.senha = "Senha é obrigatória";
      } else if (userData.senha.length < 6) {
        novosErros.senha = "Senha deve ter pelo menos 6 caracteres";
      }
    } else if (userData.senha && userData.senha.length < 6) {
      novosErros.senha = "A nova senha deve ter pelo menos 6 caracteres";
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

  // Avançar para a Etapa 2 (Salva ou atualiza a conta de User)
  async function avancar() {
    if (!validarEtapa1()) return;

    setCarregando(true);
    setErros({});

    try {
      const token = localStorage.getItem("@EduTrack:token");

      const userPayload = {
        nome: userData.nome,
        email: userData.email,
        tipo: "encarregado",
      };

      // Só envia a senha se ela foi preenchida (útil para a Edição opcional)
      if (userData.senha) {
        userPayload.senha = userData.senha;
      }

      if (isEditMode && createdUserId) {
        // 🌟 Atualiza Usuário Existente via PUT
        await api.put(`/users/${createdUserId}`, userPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (!createdUserId) {
        // Cria Usuário Novo via POST (Apenas se ainda não tiver ID criado)
        const response = await api.post("/users", userPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCreatedUserId(response.data.id);
      }

      setEtapa(2);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErros({ email: error.response.data.error });
      } else {
        setErros({ geral: "Erro ao salvar utilizador no servidor." });
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

  // 🚀 Submissão Final (Salvar Perfil e Vínculos)
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

      const payload = {
        user_id: createdUserId,
        telefone: encarregadoData.telefone.replace(/\s/g, ""), 
        students: encarregadoData.students, 
      };

      if (isEditMode) {
        // 🌟 Rota de Atualização do Encarregado via PUT
        await api.put(`/guardians/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Rota de Criação via POST
        await api.post("/guardians", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setSucesso(true);
      setTimeout(() => {
        navigate("/admin/encarregados");
      }, 1500);
    } catch (error) {
      const msgErro =
        error.response?.data?.error || "Erro ao salvar dados do encarregado.";
      setErros({ geral: msgErro });
      console.error("Erro ao salvar encarregado:", error);
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
          <h1 className="page-title">{isEditMode ? "Editar Encarregado" : "Criar Encarregado"}</h1>
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
              ✓ Dados salvos com sucesso! Redirecionando...
            </div>
          )}

          {/* ETAPA 1: DADOS DO USUÁRIO */}
          {etapa === 1 && (
            <>
              <div className="form-section">
                <h2>Dados de Acesso</h2>
                <p className="section-desc">
                  {isEditMode ? "Modifique as credenciais de acesso do encarregado" : "Crie uma conta para o novo encarregado de educação"}
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
                  <label className="label">Senha {isEditMode ? "(Deixe em branco para manter)" : "*"}</label>
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
                  <label className="label">Confirmar Senha</label>
                  <input
                    type="password"
                    className={`input ${erros.confirmarSenha ? "is-invalid" : ""}`}
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

            <button
              type="submit"
              className={etapa === 1 ? "btn btn-primary" : "btn btn-hero"}
              disabled={carregando}
            >
              {carregando ? (
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Loader size={16} className="animate-spin" /> Processando...
                </span>
              ) : etapa === 1 ? (
                "Avançar Passo"
              ) : (
                <>
                  <Save size={18} />
                  {isEditMode ? "Atualizar Encarregado" : "Criar Encarregado"}
                </>
              )}
            </button>
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