import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import api from "../../services/api.js";
import "../../styles/CriarProfessor.css";

export default function CriarProfessor() {
  const navigate = useNavigate();
  const { id } = useParams(); // 📌 Captura o ID da URL se for uma edição (ex: /admin/professores/editar/:id)
  const isEdit = Boolean(id); // 📌 Define se o modo atual é Edição ou Criação

  const [etapa, setEtapa] = useState(1); // 1: Usuário, 2: Perfil Professor

  // Dados do Utilizador (Fase 1)
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  // Dados do Professor (Fase 2)
  const [professorData, setProfessorData] = useState({
    matricula: "",
    departamento: "Ciências Exatas",
    disciplinas: [],
  });

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // ID do utilizador vinculado ao professor
  const [createdUserId, setCreatedUserId] = useState(null);

  const disciplinasDisponiveis = [
    "Matemática", "Português", "Inglês", "Física", "Química",
    "Biologia", "História", "Geografia", "Educação Física",
    "Artes", "Tecnologias da Informação",
  ];

  const departamentosDisponiveis = [
    "Ciências Exatas", "Ciências Naturais", "Humanidades",
    "Linguagem", "Educação Física", "Artes",
  ];

  // 📌 NOVO: Carregar dados anteriores caso seja uma Edição
  useEffect(() => {
    if (isEdit) {
      async function carregarDadosProfessor() {
        setCarregando(true);
        try {
          // Ajusta a rota de detalhe de acordo com a tua API (ex: /teachers/:id ou /professores/:id)
          const response = await api.get(`/teachers/${id}`);
          const professor = response.data;

          if (professor) {
            // Guarda o ID do User vinculado para a Etapa 2
            setCreatedUserId(professor.user_id);

            // Preenche os dados do Usuário (Etapa 1)
            setUserData({
              nome: professor.user?.nome || "",
              email: professor.user?.email || "",
              senha: "", // Mantém vazio por segurança na edição
              confirmarSenha: "",
            });

            // Tratamento das disciplinas (caso venham como string separada por vírgulas)
            let listaDisciplinas = [];
            if (professor.disciplina) {
              listaDisciplinas = professor.disciplina.split(", ").map(d => d.trim());
            }

            // Preenche os dados do Professor (Etapa 2)
            setProfessorData({
              matricula: professor.matricula || "",
              departamento: professor.departamento || "Ciências Exatas",
              disciplinas: listaDisciplinas,
            });
          }
        } catch (error) {
          console.error("Erro ao carregar dados do professor:", error);
          setErros({ geral: "Erro ao carregar dados anteriores para edição." });
        } finally {
          setCarregando(false);
        }
      }

      carregarDadosProfessor();
    }
  }, [id, isEdit]);

  // Validação Local da Etapa 1
  function validarEtapa1() {
    const novosErros = {};

    if (!userData.nome.trim()) {
      novosErros.nome = "Nome é obrigatório";
    } else if (userData.nome.trim().length < 5) {
      novosErros.nome = "O nome deve ter entre 5 e 150 caracteres (Regra API)";
    }

    if (!userData.email.trim()) {
      novosErros.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      novosErros.email = "Email inválido";
    }

    // 📌 Na Edição, a senha só é obrigatória se o gestor a preencher para alterar
    if (!isEdit) {
      if (!userData.senha) {
        novosErros.senha = "Senha é obrigatória";
      } else if (userData.senha.length < 6) {
        novosErros.senha = "Senha deve ter pelo menos 6 caracteres";
      }

      if (userData.senha !== userData.confirmarSenha) {
        novosErros.confirmarSenha = "As senhas não correspondem";
      }
    } else if (userData.senha) { // Se estiver editando e digitou algo na senha
      if (userData.senha.length < 6) {
        novosErros.senha = "Senha deve ter pelo menos 6 caracteres";
      }
      if (userData.senha !== userData.confirmarSenha) {
        novosErros.confirmarSenha = "As senhas não correspondem";
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Validação Local da Etapa 2
  function validarEtapa2() {
    const novosErros = {};

    if (!professorData.departamento.trim()) {
      novosErros.departamento = "Departamento é obrigatório";
    }

    if (professorData.disciplinas.length === 0) {
      novosErros.disciplinas = "Selecione pelo menos uma disciplina";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Avançar para a Etapa 2 (Insert ou Update na tabela de utilizadores)
  async function avancar() {
    if (!validarEtapa1()) return;

    setCarregando(true);
    setErros({});

    try {
      const payload = {
        nome: userData.nome,
        email: userData.email,
        tipo: "professor",
      };

      // Só envia a senha se tiver sido preenchida (útil para criação ou alteração opcional na edição)
      if (userData.senha) {
        payload.senha = userData.senha;
      }

      if (isEdit) {
        // 📌 Se for Edição, atualiza o utilizador existente
        await api.put(`/users/${createdUserId}`, payload);
        setEtapa(2);
      } {
        // Se for Criação, faz o fluxo normal de registrar novo
        const response = await api.post("/users", payload);
        setCreatedUserId(response.data.id);
        setEtapa(2);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErros({ email: error.response.data.error });
      } else {
        setErros({ geral: "Erro ao processar utilizador no servidor." });
      }
    } finally {
      setCarregando(false);
    }
  }

  function voltar() {
    if (etapa === 2) {
      setEtapa(1);
    } else {
      navigate("/admin/professores");
    }
  }

  function toggleDisciplina(disciplina) {
    setProfessorData((prev) => {
      const disciplinas = prev.disciplinas.includes(disciplina)
        ? prev.disciplinas.filter((d) => d !== disciplina)
        : [...prev.disciplinas, disciplina];
      return { ...prev, disciplinas };
    });
  }

  // Submissão Final (Etapa 2)
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
      const payloadTeacher = {
        user_id: createdUserId,
        departamento: professorData.departamento,
        disciplina: professorData.disciplinas.join(", "), 
      };

      if (isEdit) {
        // 📌 Se for Edição, envia o PUT para os dados do professor
        await api.put(`/teachers/${id}`, payloadTeacher);
      } else {
        // Se for Criação, envia o POST normal
        await api.post("/teachers", payloadTeacher);
      }

      setSucesso(true);
      setTimeout(() => {
        navigate("/admin/professores");
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErros({ geral: error.response.data.error });
      } else {
        setErros({ geral: "Erro ao vincular dados profissionais do professor." });
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="criar-professor-page">
      <div className="page-header">
        <button type="button" className="btn-back" onClick={voltar}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">{isEdit ? "Editar Professor" : "Criar Professor"}</h1>
          <p className="page-subtitle">
            {etapa === 1
              ? "Passo 1 de 2: Dados de Acesso"
              : "Passo 2 de 2: Dados Profissionais"}
          </p>
        </div>
      </div>

      <div className="criar-professor-container">
        <form className="criar-professor-form" onSubmit={handleSubmit}>
          
          {/* Indicador de Etapas */}
          <div className="etapas-indicator">
            <div className={`etapa ${etapa >= 1 ? "ativa" : ""}`}>
              <span>1</span>
              <label>Usuário</label>
            </div>
            <div className="etapa-linha" />
            <div className={`etapa ${etapa >= 2 ? "ativa" : ""}`}>
              <span>2</span>
              <label>Professor</label>
            </div>
          </div>

          {/* Erros Gerais */}
          {erros.geral && <div className="alert alert-danger">{erros.geral}</div>}

          {/* Sucesso */}
          {sucesso && (
            <div className="alert alert-success">
              ✓ Dados do professor guardados com sucesso! Redirecionando...
            </div>
          )}

          {/* ETAPA 1: DADOS DE ACESSO */}
          {etapa === 1 && (
            <>
              <div className="form-section">
                <h2>Dados de Acesso</h2>
                <p className="section-desc">
                  {isEdit ? "Atualize a conta de autenticação do professor" : "Crie a conta base para o sistema de autenticação"}
                </p>
              </div>

              <div className="form-group">
                <label className="label">Nome Completo *</label>
                <input
                  type="text"
                  className={`input ${erros.nome ? "is-invalid" : ""}`}
                  placeholder="Mário Tavares"
                  value={userData.nome}
                  onChange={(e) => setUserData({ ...userData, nome: e.target.value })}
                  disabled={carregando}
                />
                {erros.nome && <span className="error-msg">{erros.nome}</span>}
              </div>

              <div className="form-group">
                <label className="label">Email *</label>
                <input
                  type="email"
                  className={`input ${erros.email ? "is-invalid" : ""}`}
                  placeholder="mario.tavares@edutrack.pt"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  disabled={carregando}
                />
                {erros.email && <span className="error-msg">{erros.email}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Senha {isEdit && "(Deixe em branco para manter)"}</label>
                  <input
                    type="password"
                    className={`input ${erros.senha ? "is-invalid" : ""}`}
                    placeholder="••••••••"
                    value={userData.senha}
                    onChange={(e) => setUserData({ ...userData, senha: e.target.value })}
                    disabled={carregando}
                  />
                  {erros.senha && <span className="error-msg">{erros.senha}</span>}
                </div>

                <div className="form-group">
                  <label className="label">Confirmar Senha</label>
                  <input
                    type="password"
                    className={`input ${erros.confirmarSenha ? "is-invalid" : ""}`}
                    placeholder="••••••••"
                    value={userData.confirmarSenha}
                    onChange={(e) => setUserData({ ...userData, confirmarSenha: e.target.value })}
                    disabled={carregando}
                  />
                  {erros.confirmarSenha && <span className="error-msg">{erros.confirmarSenha}</span>}
                </div>
              </div>
            </>
          )}

          {/* ETAPA 2: DADOS PROFISSIONAIS */}
          {etapa === 2 && (
            <>
              <div className="form-section">
                <h2>Dados Profissionais</h2>
                <p className="section-desc">Defina o departamento e as áreas de ensino</p>
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
                <label className="label">Departamento *</label>
                <select
                  className="input"
                  value={professorData.departamento}
                  onChange={(e) => setProfessorData({ ...professorData, departamento: e.target.value })}
                  disabled={carregando}
                >
                  {departamentosDisponiveis.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label">Disciplinas *</label>
                <p className="section-desc-small">Selecione as disciplinas atribuídas a este professor</p>
                <div className="disciplinas-grid">
                  {disciplinasDisponiveis.map((disciplina) => (
                    <label
                      key={disciplina}
                      className={`disciplina-checkbox ${
                        professorData.disciplinas.includes(disciplina) ? "is-checked" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={professorData.disciplinas.includes(disciplina)}
                        onChange={() => toggleDisciplina(disciplina)}
                        disabled={carregando}
                      />
                      <span className="checkbox-label">{disciplina}</span>
                    </label>
                  ))}
                </div>
                {erros.disciplinas && <span className="error-msg">{erros.disciplinas}</span>}
              </div>
            </>
          )}

          {/* Botões de Controlo */}
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
                    <Loader2 size={16} className="animate-spin" /> Processando...
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </span>
                ) : (
                  <>
                    <Save size={18} />
                    <span>{isEdit ? "Atualizar Registo" : "Concluir Cadastro"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Painel lateral de Resumo */}
        {etapa === 2 && (
          <div className="form-resumo">
            <h3>Resumo do Registo</h3>
            <div className="resumo-item">
              <span className="resumo-label">Nome:</span>
              <span className="resumo-value">{userData.nome}</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Email:</span>
              <span className="resumo-value">{userData.email}</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Departamento:</span>
              <span className="resumo-value">{professorData.departamento}</span>
            </div>
            <div className="resumo-section">
              <span className="resumo-label">Disciplinas Selecionadas:</span>
              <div className="disciplinas-resumo">
                {professorData.disciplinas.map((d) => (
                  <span key={d} className="badge badge-primary">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}