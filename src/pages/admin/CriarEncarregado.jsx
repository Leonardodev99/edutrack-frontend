import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { criarEncarregado, gerarMatriculaEncarregado, verificarEmailExistente } from "../../utils/mockUsers";
import { alunosStore } from "../../utils/adminMockData";
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
    matricula: gerarMatriculaEncarregado(),
    telefone: "",
    telefonePrincipal: "",
    estudantes: [], // IDs dos alunos
  });

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Obter lista de alunos disponíveis
  const alunosDisponiveis = alunosStore.list();

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

  // Validação da Etapa 2 (Encarregado)
  function validarEtapa2() {
    const novosErros = {};

    if (!encarregadoData.matricula.trim()) {
      novosErros.matricula = "Matrícula é obrigatória";
    }

    if (!encarregadoData.telefone.trim()) {
      novosErros.telefone = "Telefone é obrigatório";
    } else if (!/^\d{9}$/.test(encarregadoData.telefone.replace(/\s/g, ""))) {
      novosErros.telefone = "Telefone deve ter 9 dígitos";
    }

    if (encarregadoData.estudantes.length === 0) {
      novosErros.estudantes = "Selecione pelo menos um aluno";
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
      navigate("/admin/encarregados");
    }
  }

  // Adicionar/Remover aluno
  function toggleEstudante(alunoId) {
    setEncarregadoData((prev) => {
      const estudantes = prev.estudantes.includes(alunoId)
        ? prev.estudantes.filter((id) => id !== alunoId)
        : [...prev.estudantes, alunoId];
      return { ...prev, estudantes };
    });
  }

  // Formatar telefone
  function formatarTelefone(valor) {
    const digitos = valor.replace(/\D/g, "");
    if (digitos.length <= 3) return digitos;
    if (digitos.length <= 6) return `${digitos.slice(0, 3)} ${digitos.slice(3)}`;
    return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6, 9)}`;
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

      const resultado = criarEncarregado(userData, encarregadoData);

      if (resultado.sucesso) {
        setSucesso(true);
        setTimeout(() => {
          navigate("/admin/encarregados");
        }, 1500);
      } else {
        setErros({ geral: resultado.erro });
      }
    } catch (error) {
      setErros({ geral: "Erro ao criar encarregado. Tente novamente." });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="criar-encarregado-page">
      <div className="page-header">
        <button className="btn-back" onClick={voltar}>
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

          {/* Mensagem de Erro Geral */}
          {erros.geral && (
            <div className="alert alert-danger">
              {erros.geral}
            </div>
          )}

          {/* Mensagem de Sucesso */}
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
                  onChange={(e) => setUserData({ ...userData, nome: e.target.value })}
                />
                {erros.nome && <span className="error-msg">{erros.nome}</span>}
              </div>

              <div className="form-group">
                <label className="label">Email *</label>
                <input
                  type="email"
                  className={`input ${erros.email ? "is-invalid" : ""}`}
                  placeholder="ana.costa@edutrack.pt"
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
                  placeholder="ENC-2024-001"
                  value={encarregadoData.matricula}
                  onChange={(e) =>
                    setEncarregadoData({ ...encarregadoData, matricula: e.target.value })
                  }
                />
                {erros.matricula && (
                  <span className="error-msg">{erros.matricula}</span>
                )}
                <span className="input-hint">
                  Número único do encarregado no sistema
                </span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Telefone Principal *</label>
                  <input
                    type="tel"
                    className={`input ${erros.telefone ? "is-invalid" : ""}`}
                    placeholder="961 100 200"
                    value={encarregadoData.telefone}
                    onChange={(e) =>
                      setEncarregadoData({
                        ...encarregadoData,
                        telefone: formatarTelefone(e.target.value),
                      })
                    }
                  />
                  {erros.telefone && (
                    <span className="error-msg">{erros.telefone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="label">Telefone Secundário</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="913 000 000"
                    value={encarregadoData.telefonePrincipal}
                    onChange={(e) =>
                      setEncarregadoData({
                        ...encarregadoData,
                        telefonePrincipal: formatarTelefone(e.target.value),
                      })
                    }
                  />
                  <span className="input-hint">Opcional</span>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Alunos Associados *</label>
                <p className="section-desc-small">
                  Selecione os alunos que este encarregado representa
                </p>

                {alunosDisponiveis.length === 0 ? (
                  <div className="empty-alunos">
                    <p>Nenhum aluno disponível no sistema</p>
                  </div>
                ) : (
                  <div className="estudantes-grid">
                    {alunosDisponiveis.map((aluno) => (
                      <label
                        key={aluno.id}
                        className={`estudante-checkbox ${
                          encarregadoData.estudantes.includes(aluno.id)
                            ? "is-checked"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={encarregadoData.estudantes.includes(aluno.id)}
                          onChange={() => toggleEstudante(aluno.id)}
                        />
                        <span className="checkbox-label">
                          <strong>{aluno.nome}</strong>
                          <small>{aluno.id}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {erros.estudantes && (
                  <span className="error-msg">{erros.estudantes}</span>
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
                {carregando ? "Criando..." : "Criar Encarregado"}
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
              <span className="resumo-value">{encarregadoData.matricula}</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Telefone:</span>
              <span className="resumo-value">{encarregadoData.telefone}</span>
            </div>
            <div className="resumo-section">
              <span className="resumo-label">Alunos Associados:</span>
              <div className="alunos-resumo">
                {encarregadoData.estudantes.length > 0 ? (
                  encarregadoData.estudantes.map((alunoId) => {
                    const aluno = alunosDisponiveis.find((a) => a.id === alunoId);
                    return (
                      <span key={alunoId} className="badge badge-primary">
                        {aluno?.nome}
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