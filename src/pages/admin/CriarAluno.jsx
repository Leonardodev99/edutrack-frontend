import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import api from "../../services/api.js";
import "../../styles/CriarAluno.css";

// Função utilitária local para gerar a matrícula temporária/inicial se necessário
function gerarMatricula() {
  return `ALU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function CriarAluno() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1); // 1: Usuário, 2: Perfil Aluno

  // Dados do Utilizador (Fase 1)
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  // Dados do Aluno (Fase 2)
  const [alunoData, setAlunoData] = useState({
    matricula: gerarMatricula(),
    curso: "Ensino Secundário",
    ano_ingresso: new Date().getFullYear(),
  });

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // ID do utilizador retornado após salvar a Etapa 1
  const [createdUserId, setCreatedUserId] = useState(null);

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

    if (!alunoData.matricula.trim()) {
      novosErros.matricula = "Matrícula é obrigatória";
    }

    if (!alunoData.curso.trim()) {
      novosErros.curso = "Curso é obrigatório";
    }

    if (!alunoData.ano_ingresso) {
      novosErros.ano_ingresso = "Ano de ingresso é obrigatório";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Avançar para a Etapa 2 realizando o primeiro insert na BD (/users)
  async function avancar() {
    if (!validarEtapa1()) return;

    setCarregando(true);
    setErros({});

    try {
      const response = await api.post("/users", {
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha,
        tipo: "aluno", // Forçamos o tipo para aluno nesta tela
      });

      // Guardamos o ID do utilizador recém-criado
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
      navigate("/admin/alunos");
    }
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
      // Enviamos os dados para a tabela de alunos associando o user_id obtido na etapa 1
      await api.post("/students", {
        user_id: createdUserId,
        matricula: alunoData.matricula,
        curso: alunoData.curso,
        ano_ingresso: alunoData.ano_ingresso,
      });

      setSucesso(true);
      setTimeout(() => {
        navigate("/admin/alunos");
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErros({ geral: error.response.data.error });
      } else {
        setErros({ geral: "Erro ao vincular dados académicos do aluno." });
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="criar-aluno-page">
      <div className="page-header">
        <button type="button" className="btn-back" onClick={voltar}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Criar Aluno</h1>
          <p className="page-subtitle">
            {etapa === 1
              ? "Passo 1 de 2: Dados de Acesso"
              : "Passo 2 de 2: Dados Académicos"}
          </p>
        </div>
      </div>

      <div className="criar-aluno-container">
        <form className="criar-aluno-form" onSubmit={handleSubmit}>
          
          {/* Indicador de Etapas */}
          <div className="etapas-indicator">
            <div className={`etapa ${etapa >= 1 ? "ativa" : ""}`}>
              <span>1</span>
              <label>Usuário</label>
            </div>
            <div className="etapa-linha" />
            <div className={`etapa ${etapa >= 2 ? "ativa" : ""}`}>
              <span>2</span>
              <label>Aluno</label>
            </div>
          </div>

          {/* Erros Gerais */}
          {erros.geral && <div className="alert alert-danger">{erros.geral}</div>}

          {/* Sucesso */}
          {sucesso && (
            <div className="alert alert-success">
              ✓ Aluno registado com sucesso na Base de Dados! Redirecionando...
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
                  placeholder="João Pedro Silva"
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
                  placeholder="joao.silva@edutrack.pt"
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

          {/* ETAPA 2: DADOS ACADÉMICOS */}
          {etapa === 2 && (
            <>
              <div className="form-section">
                <h2>Dados Académicos</h2>
                <p className="section-desc">Associe as informações escolares do Aluno</p>
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
                <label className="label">Matrícula *</label>
                <input
                  type="text"
                  className={`input ${erros.matricula ? "is-invalid" : ""}`}
                  placeholder="ALU-2026-001"
                  value={alunoData.matricula}
                  onChange={(e) => setAlunoData({ ...alunoData, matricula: e.target.value })}
                  disabled={carregando}
                />
                {erros.matricula && <span className="error-msg">{erros.matricula}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Curso *</label>
                  <select
                    className="input"
                    value={alunoData.curso}
                    onChange={(e) => setAlunoData({ ...alunoData, curso: e.target.value })}
                    disabled={carregando}
                  >
                    <option value="Ensino Básico">Ensino Básico</option>
                    <option value="Ensino Secundário">Ensino Secundário</option>
                    <option value="Cursos Profissionais">Cursos Profissionais</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Ano de Ingresso *</label>
                  <input
                    type="number"
                    className={`input ${erros.ano_ingresso ? "is-invalid" : ""}`}
                    value={alunoData.ano_ingresso}
                    onChange={(e) => setAlunoData({ ...alunoData, ano_ingresso: parseInt(e.target.value) || "" })}
                    disabled={carregando}
                  />
                  {erros.ano_ingresso && <span className="error-msg">{erros.ano_ingresso}</span>}
                </div>
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
              <span className="resumo-label">Matrícula:</span>
              <span className="resumo-value">{alunoData.matricula}</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Curso:</span>
              <span className="resumo-value">{alunoData.curso}</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Ano Ingresso:</span>
              <span className="resumo-value">{alunoData.ano_ingresso}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}