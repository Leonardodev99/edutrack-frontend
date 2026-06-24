import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import api from "../../services/api.js";
import "../../styles/CriarProfessor.css";

export default function CriarProfessor() {
  const navigate = useNavigate();
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
    matricula: "", // Deixamos vazio para o gestor digitar ou ser gerado pelo backend
    departamento: "Ciências Exatas",
    disciplinas: [], // O teu backend espera uma string (ex: 'Matemática, Física') ou array dependendo da migração
  });

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // ID do utilizador retornado após salvar a Etapa 1
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

    if (!userData.senha) {
      novosErros.senha = "Senha é obrigatória";
    } else if (userData.senha.length < 6) {
      novosErros.senha = "Senha deve ter pelo menos 6 caracteres";
    }

    if (userData.senha !== userData.confirmarSenha) {
      novosErros.confirmarSenha = "As senhas não correspondem";
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

  // Avançar para a Etapa 2 realizando o primeiro insert na BD
  async function avancar() {
    if (!validarEtapa1()) return;

    setCarregando(true);
    setErros({});

    try {
      // Executa o POST para a rota /users do teu UserController
      const response = await api.post("/users", {
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha,
        tipo: "professor", // Forçamos o tipo para professor nesta tela
      });

      // Guardamos o ID gerado pelo banco de dados para usar na etapa seguinte
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
      // Como o teu Teacher Model espera a estrutura do TeacherController:
      // O teu backend recebe: user_id, departamento, disciplina
      await api.post("/teachers", {
        user_id: createdUserId,
        departamento: professorData.departamento,
        // Convertemos o array para string caso o teu campo 'disciplina' seja um VARCHAR simples na base de dados
        disciplina: professorData.disciplinas.join(", "), 
      });

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
          <h1 className="page-title">Criar Professor</h1>
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
              ✓ Professor registado com sucesso na Base de Dados! Redirecionando...
            </div>
          )}

          {/* ETAPA 1: DADOS DE ACESSO */}
          {etapa === 1 && (
            <>
              <div className="form-section">
                <h2>Dados de Acesso</h2>
                <p className="section-desc">Crie a conta base para o sistema de autenticação</p>
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
                  <label className="label">Senha *</label>
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
                  <label className="label">Confirmar Senha *</label>
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
                    <Loader2 size={16} className="animate-spin" /> Salvando...
                  </span>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Concluir Cadastro</span>
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