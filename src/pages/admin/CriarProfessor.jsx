import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { criarProfessor, gerarMatriculaProfessor, verificarEmailExistente } from "../../utils/mockUsers";
import "../../styles/CriarProfessor.css";

export default function CriarProfessor() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1); // 1: Usuário, 2: Perfil Professor

  // Dados do Usuário
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  // Dados do Professor
  const [professorData, setProfessorData] = useState({
    matricula: gerarMatriculaProfessor(),
    departamento: "Ciências",
    disciplinas: [],
  });

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const disciplinasDisponiveis = [
    "Matemática",
    "Português",
    "Inglês",
    "Física",
    "Química",
    "Biologia",
    "História",
    "Geografia",
    "Educação Física",
    "Artes",
    "Tecnologias da Informação",
  ];

  const departamentosDisponiveis = [
    "Ciências Exatas",
    "Ciências Naturais",
    "Humanidades",
    "Linguagem",
    "Educação Física",
    "Artes",
  ];

  // Validação da Etapa 1 (Usuário)
  function validarEtapa1() {
    const novosErros = {};

    if (!userData.nome.trim()) {
      novosErros.nome = "Nome é obrigatório";
    } else if (userData.nome.trim().length < 3) {
      novosErros.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!userData.email.trim()) {
      novosErros.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      novosErros.email = "Email inválido";
    } else if (verificarEmailExistente(userData.email)) {
      novosErros.email = "Este email já está registado";
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

  // Validação da Etapa 2 (Professor)
  function validarEtapa2() {
    const novosErros = {};

    if (!professorData.matricula.trim()) {
      novosErros.matricula = "Matrícula é obrigatória";
    }

    if (!professorData.departamento.trim()) {
      novosErros.departamento = "Departamento é obrigatório";
    }

    if (professorData.disciplinas.length === 0) {
      novosErros.disciplinas = "Selecione pelo menos uma disciplina";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Avançar para próxima etapa
  function avancar() {
    if (etapa === 1) {
      if (validarEtapa1()) {
        setEtapa(2);
      }
    }
  }

  // Voltar para etapa anterior
  function voltar() {
    if (etapa === 2) {
      setEtapa(1);
    } else {
      navigate("/admin/professores");
    }
  }

  // Adicionar/Remover disciplina
  function toggleDisciplina(disciplina) {
    setProfessorData((prev) => {
      const disciplinas = prev.disciplinas.includes(disciplina)
        ? prev.disciplinas.filter((d) => d !== disciplina)
        : [...prev.disciplinas, disciplina];
      return { ...prev, disciplinas };
    });
  }

  // Submeter formulário
  async function handleSubmit(e) {
    e.preventDefault();

    if (etapa === 1) {
      avancar();
      return;
    }

    if (!validarEtapa2()) {
      return;
    }

    setCarregando(true);

    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      const resultado = criarProfessor(userData, professorData);

      if (resultado.sucesso) {
        setSucesso(true);
        setTimeout(() => {
          navigate("/admin/professores");
        }, 1500);
      } else {
        setErros({ geral: resultado.erro });
      }
    } catch (error) {
      setErros({ geral: "Erro ao criar professor. Tente novamente." });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="criar-professor-page">
      <div className="page-header">
        <button className="btn-back" onClick={voltar}>
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

          {/* Mensagem de Erro Geral */}
          {erros.geral && (
            <div className="alert alert-danger">
              {erros.geral}
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {sucesso && (
            <div className="alert alert-success">
              ✓ Professor criado com sucesso! Redirecionando...
            </div>
          )}

          {/* ETAPA 1: DADOS DO USUÁRIO */}
          {etapa === 1 && (
            <>
              <div className="form-section">
                <h2>Dados de Acesso</h2>
                <p className="section-desc">
                  Crie uma conta para o novo professor
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
                    onChange={(e) =>
                      setUserData({ ...userData, confirmarSenha: e.target.value })
                    }
                  />
                  {erros.confirmarSenha && (
                    <span className="error-msg">{erros.confirmarSenha}</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ETAPA 2: DADOS DO PROFESSOR */}
          {etapa === 2 && (
            <>
              <div className="form-section">
                <h2>Dados Profissionais</h2>
                <p className="section-desc">
                  Defina as responsabilidades e disciplinas do professor
                </p>
              </div>

              <div className="form-group">
                <label className="label">Email (Leitura) *</label>
                <input
                  type="email"
                  className="input is-disabled"
                  value={userData.email}
                  disabled
                />
                <span className="input-hint">Email do usuário criado</span>
              </div>

              <div className="form-group">
                <label className="label">Matrícula *</label>
                <input
                  type="text"
                  className={`input ${erros.matricula ? "is-invalid" : ""}`}
                  placeholder="PROF-2024-001"
                  value={professorData.matricula}
                  onChange={(e) =>
                    setProfessorData({ ...professorData, matricula: e.target.value })
                  }
                />
                {erros.matricula && (
                  <span className="error-msg">{erros.matricula}</span>
                )}
                <span className="input-hint">
                  Número único do professor no sistema
                </span>
              </div>

              <div className="form-group">
                <label className="label">Departamento *</label>
                <select
                  className={`input ${erros.departamento ? "is-invalid" : ""}`}
                  value={professorData.departamento}
                  onChange={(e) =>
                    setProfessorData({ ...professorData, departamento: e.target.value })
                  }
                >
                  {departamentosDisponiveis.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {erros.departamento && (
                  <span className="error-msg">{erros.departamento}</span>
                )}
              </div>

              <div className="form-group">
                <label className="label">Disciplinas *</label>
                <p className="section-desc-small">
                  Selecione todas as disciplinas que este professor leciona
                </p>
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
                      />
                      <span className="checkbox-label">{disciplina}</span>
                    </label>
                  ))}
                </div>
                {erros.disciplinas && (
                  <span className="error-msg">{erros.disciplinas}</span>
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
              Cancelar
            </button>

            {etapa === 1 ? (
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
                {carregando ? "Criando..." : "Criar Professor"}
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
              <span className="resumo-label">Matrícula:</span>
              <span className="resumo-value">{professorData.matricula}</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Departamento:</span>
              <span className="resumo-value">{professorData.departamento}</span>
            </div>
            <div className="resumo-section">
              <span className="resumo-label">Disciplinas:</span>
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