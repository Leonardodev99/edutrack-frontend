import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { criarTurma, gerarCodigoTurma, nomeProfessor } from "../../utils/adminMockData";
import { professoresStore, usersStore } from "../../utils/mockUsers";
import "../../styles/CriarTurma.css";

export default function CriarTurma() {
  const navigate = useNavigate();

  // Dados da Turma
  const [turmaData, setTurmaData] = useState({
    nome: "",
    ano_letivo: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
    curso: "Ensino Secundário",
    teacher_id: "",
    codigo: gerarCodigoTurma(),
  });

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const cursosDisponiveis = [
    "Ensino Básico",
    "Ensino Secundário",
    "Cursos Profissionais",
  ];

  // Obter professores disponíveis - usando mockUsers
  const professoresDisponiveis = professoresStore.list().map((prof) => ({
    ...prof,
    user: usersStore.get(prof.user_id),
  }));

  // Validação
  function validar() {
    const novosErros = {};

    if (!turmaData.nome.trim()) {
      novosErros.nome = "Nome da turma é obrigatório";
    } else if (turmaData.nome.trim().length < 2) {
      novosErros.nome = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!turmaData.ano_letivo.trim()) {
      novosErros.ano_letivo = "Ano letivo é obrigatório";
    } else if (!/^\d{4}\/\d{4}$/.test(turmaData.ano_letivo)) {
      novosErros.ano_letivo = "Formato deve ser: 2024/2025";
    }

    if (!turmaData.curso.trim()) {
      novosErros.curso = "Curso é obrigatório";
    }

    if (!turmaData.teacher_id) {
      novosErros.teacher_id = "Professor é obrigatório";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  // Voltar
  function voltar() {
    navigate("/admin/turmas");
  }

  // Submeter formulário
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validar()) {
      return;
    }

    setCarregando(true);

    try {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      const resultado = criarTurma(turmaData);

      if (resultado.sucesso) {
        setSucesso(true);
        setTimeout(() => {
          navigate("/admin/turmas");
        }, 1500);
      } else {
        setErros({ geral: resultado.erro });
      }
    } catch (error) {
      setErros({ geral: "Erro ao criar turma. Tente novamente." });
    } finally {
      setCarregando(false);
    }
  }

  // Obter nome do professor
  function obterNomeProfessor(teacherId) {
    const prof = professoresDisponiveis.find((p) => p.id == teacherId);
    return prof?.user?.nome || "";
  }

  // Formatar ano letivo
  function formatarAnoLetivo(valor) {
    const digitos = valor.replace(/\D/g, "");
    if (digitos.length <= 4) return digitos;
    return `${digitos.slice(0, 4)}/${digitos.slice(4, 8)}`;
  }

  return (
    <div className="criar-turma-page">
      <div className="page-header">
        <button className="btn-back" onClick={voltar}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Criar Turma</h1>
          <p className="page-subtitle">
            Configure os dados da nova turma
          </p>
        </div>
      </div>

      <div className="criar-turma-container">
        <form className="criar-turma-form" onSubmit={handleSubmit}>
          {/* Mensagem de Erro Geral */}
          {erros.geral && (
            <div className="alert alert-danger">
              {erros.geral}
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {sucesso && (
            <div className="alert alert-success">
              ✓ Turma criada com sucesso! Redirecionando...
            </div>
          )}

          {/* Seção de Informações Básicas */}
          <div className="form-section">
            <h2>Informações Básicas</h2>
            <p className="section-desc">
              Configure os dados principais da turma
            </p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Nome da Turma *</label>
              <input
                type="text"
                className={`input ${erros.nome ? "is-invalid" : ""}`}
                placeholder="10º A"
                value={turmaData.nome}
                onChange={(e) =>
                  setTurmaData({ ...turmaData, nome: e.target.value })
                }
              />
              {erros.nome && <span className="error-msg">{erros.nome}</span>}
              <span className="input-hint">Ex: 10º A, 11º B, 12º C</span>
            </div>

            <div className="form-group">
              <label className="label">Ano Letivo *</label>
              <input
                type="text"
                className={`input ${erros.ano_letivo ? "is-invalid" : ""}`}
                placeholder="2024/2025"
                value={turmaData.ano_letivo}
                onChange={(e) =>
                  setTurmaData({
                    ...turmaData,
                    ano_letivo: formatarAnoLetivo(e.target.value),
                  })
                }
              />
              {erros.ano_letivo && (
                <span className="error-msg">{erros.ano_letivo}</span>
              )}
              <span className="input-hint">Formato: AAAA/AAAA</span>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Curso *</label>
            <select
              className={`input ${erros.curso ? "is-invalid" : ""}`}
              value={turmaData.curso}
              onChange={(e) =>
                setTurmaData({ ...turmaData, curso: e.target.value })
              }
            >
              {cursosDisponiveis.map((curso) => (
                <option key={curso} value={curso}>
                  {curso}
                </option>
              ))}
            </select>
            {erros.curso && <span className="error-msg">{erros.curso}</span>}
          </div>

          {/* Seção de Professor Responsável */}
          <div className="form-section">
            <h2>Professor Responsável</h2>
            <p className="section-desc">
              Selecione o professor coordenador da turma
            </p>
          </div>

          <div className="form-group">
            <label className="label">Professor *</label>
            {professoresDisponiveis.length === 0 ? (
              <div className="empty-professores">
                <p>Nenhum professor disponível no sistema</p>
              </div>
            ) : (
              <select
                className={`input ${erros.teacher_id ? "is-invalid" : ""}`}
                value={turmaData.teacher_id}
                onChange={(e) =>
                  setTurmaData({ ...turmaData, teacher_id: e.target.value })
                }
              >
                <option value="">Selecione um professor...</option>
                {professoresDisponiveis.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.user?.nome} ({prof.departamento})
                  </option>
                ))}
              </select>
            )}
            {erros.teacher_id && (
              <span className="error-msg">{erros.teacher_id}</span>
            )}
          </div>

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

            <button
              type="submit"
              className="btn btn-hero"
              disabled={carregando}
            >
              <Save size={18} />
              {carregando ? "Criando..." : "Criar Turma"}
            </button>
          </div>
        </form>

        {/* Card de Resumo */}
        <div className="form-resumo">
          <h3>Resumo</h3>
          <div className="resumo-item">
            <span className="resumo-label">Código:</span>
            <span className="resumo-value codigo-badge">{turmaData.codigo}</span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Nome:</span>
            <span className="resumo-value">
              {turmaData.nome || "—"}
            </span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Ano Letivo:</span>
            <span className="resumo-value">
              {turmaData.ano_letivo || "—"}
            </span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Curso:</span>
            <span className="resumo-value">
              {turmaData.curso || "—"}
            </span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Professor:</span>
            <span className="resumo-value">
              {turmaData.teacher_id
                ? obterNomeProfessor(turmaData.teacher_id)
                : "—"}
            </span>
          </div>

          <div className="resumo-info">
            <strong>ℹ Informação:</strong>
            <p>
              Após criar a turma, você poderá adicionar alunos e configurar
              mais detalhes conforme necessário.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}