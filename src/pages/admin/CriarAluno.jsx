import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { criarAluno, gerarMatricula, verificarEmailExistente } from "../../utils/mockUsers";
import "../../styles/CriarAluno.css";

export default function CriarAluno() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1); // 1: Usuário, 2: Perfil Aluno

  // Dados do Usuário
  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  // Dados do Aluno
  const [alunoData, setAlunoData] = useState({
    matricula: gerarMatricula(),
    curso: "Ensino Secundário",
    ano_ingresso: new Date().getFullYear(),
  });

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

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

  // Validação da Etapa 2 (Aluno)
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
      navigate("/admin");
    }
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

      const resultado = criarAluno(userData, alunoData);

      if (resultado.sucesso) {
        setSucesso(true);
        setTimeout(() => {
          navigate("/admin/alunos");
        }, 1500);
      } else {
        setErros({ geral: resultado.erro });
      }
    } catch (error) {
      setErros({ geral: "Erro ao criar aluno. Tente novamente." });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="criar-aluno-page">
      <div className="page-header">
        <button className="btn-back" onClick={voltar}>
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

          {/* Mensagem de Erro Geral */}
          {erros.geral && (
            <div className="alert alert-danger">
              {erros.geral}
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {sucesso && (
            <div className="alert alert-success">
              ✓ Aluno criado com sucesso! Redirecionando...
            </div>
          )}

          {/* ETAPA 1: DADOS DO USUÁRIO */}
          {etapa === 1 && (
            <>
              <div className="form-section">
                <h2>Dados de Acesso</h2>
                <p className="section-desc">
                  Crie uma conta para o novo aluno
                </p>
              </div>

              <div className="form-group">
                <label className="label">Nome Completo *</label>
                <input
                  type="text"
                  className={`input ${erros.nome ? "is-invalid" : ""}`}
                  placeholder="João Pedro Silva"
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
                  placeholder="joao.silva@edutrack.pt"
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

          {/* ETAPA 2: DADOS DO ALUNO */}
          {etapa === 2 && (
            <>
              <div className="form-section">
                <h2>Dados Académicos</h2>
                <p className="section-desc">
                  Associe os dados académicos ao novo aluno
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
                  placeholder="ALU-2024-001"
                  value={alunoData.matricula}
                  onChange={(e) =>
                    setAlunoData({ ...alunoData, matricula: e.target.value })
                  }
                />
                {erros.matricula && (
                  <span className="error-msg">{erros.matricula}</span>
                )}
                <span className="input-hint">
                  Número único do aluno no sistema
                </span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Curso *</label>
                  <select
                    className={`input ${erros.curso ? "is-invalid" : ""}`}
                    value={alunoData.curso}
                    onChange={(e) =>
                      setAlunoData({ ...alunoData, curso: e.target.value })
                    }
                  >
                    <option value="Ensino Básico">Ensino Básico</option>
                    <option value="Ensino Secundário">Ensino Secundário</option>
                    <option value="Cursos Profissionais">Cursos Profissionais</option>
                  </select>
                  {erros.curso && (
                    <span className="error-msg">{erros.curso}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="label">Ano de Ingresso *</label>
                  <input
                    type="number"
                    className={`input ${erros.ano_ingresso ? "is-invalid" : ""}`}
                    placeholder="2024"
                    value={alunoData.ano_ingresso}
                    onChange={(e) =>
                      setAlunoData({
                        ...alunoData,
                        ano_ingresso: parseInt(e.target.value),
                      })
                    }
                  />
                  {erros.ano_ingresso && (
                    <span className="error-msg">{erros.ano_ingresso}</span>
                  )}
                </div>
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
                {carregando ? "Criando..." : "Criar Aluno"}
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