import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, List } from "lucide-react";
import api from "../../services/api"; 
import "../../styles/CriarTurma.css";

export default function CriarTurma() {
  const navigate = useNavigate();
  const { id } = useParams(); // 📌 Captura o ID da URL se for edição
  const isEditing = Boolean(id); // 📌 Define se o modo atual é Edição

  // Dados da Turma ajustados para o Backend
  const [turmaData, setTurmaData] = useState({
    nome: "",
    ano_letivo: new Date().getFullYear(),
    curso: "Ensino Secundário",
    teacher_id: "",
  });

  // Estados para dados dinâmicos do Banco
  const [professoresDisponiveis, setProfessoresDisponiveis] = useState([]);
  const [cursosDisponiveis, setCursosDisponiveis] = useState([
    "Ensino Básico",
    "Ensino Secundário",
    "Cursos Profissionais",
  ]);

  // Estados de controle de interface e feedback
  const [cursoCustomizado, setCursoCustomizado] = useState(false);
  const [novoCursoNome, setNovoCursoNome] = useState("");
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [sucesso, setSucesso] = useState(false);

  // 📌 Carregar dados reais do Banco de Dados ao montar o componente
  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        setCarregandoDados(true);
        const token = localStorage.getItem("@EduTrack:token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1️⃣ Busca os professores reais cadastrados no sistema
        const responseProfessores = await api.get("/teachers", { headers });
        setProfessoresDisponiveis(responseProfessores.data);

        // 2️⃣ Buscar cursos já cadastrados nas turmas existentes para alimentar o Select
        const responseTurmas = await api.get("/classes", { headers });
        let cursosUnicosPadrao = ["Ensino Básico", "Ensino Secundário", "Cursos Profissionais"];
        
        if (responseTurmas.data && responseTurmas.data.length > 0) {
          const cursosDoBanco = responseTurmas.data.map((t) => t.curso);
          cursosUnicosPadrao = Array.from(
            new Set([...cursosUnicosPadrao, ...cursosDoBanco])
          ).filter(Boolean);
          setCursosDisponiveis(cursosUnicosPadrao);
        }

        // 3️⃣ SE FOR EDIÇÃO: Buscar os dados específicos desta turma e preencher o formulário
        if (isEditing) {
          const responseEspecifica = await api.get(`/classes/${id}`, { headers });
          const turma = responseEspecifica.data;

          // Verifica se o curso vindo do banco pertence aos padrões, senão ativa o customizado
          if (cursosUnicosPadrao.includes(turma.curso)) {
            setTurmaData({
              nome: turma.nome || "",
              ano_letivo: turma.ano_letivo || new Date().getFullYear(),
              curso: turma.curso || "Ensino Secundário",
              teacher_id: turma.teacher_id || turma.teacher?.id || "",
            });
          } else {
            // Caso seja um curso customizado antigo, ativa o input de texto livre
            setCursoCustomizado(true);
            setNovoCursoNome(turma.curso || "");
            setTurmaData({
              nome: turma.nome || "",
              ano_letivo: turma.ano_letivo || new Date().getFullYear(),
              curso: "",
              teacher_id: turma.teacher_id || turma.teacher?.id || "",
            });
          }
        }

      } catch (error) {
        console.error("Erro ao carregar dados iniciais do banco:", error);
        setErros({ geral: "Erro ao conectar com o servidor para carregar os dados da turma." });
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDadosIniciais();
  }, [id, isEditing]);

  // Alternador para curso novo escrito manualmente
  function handleAlternarCursoCustomizado() {
    if (cursoCustomizado) {
      // Voltando para o select
      setTurmaData({ ...turmaData, curso: cursosDisponiveis[0] || "" });
    } else {
      // Indo para o input de texto livre
      setTurmaData({ ...turmaData, curso: "" });
      setNovoCursoNome("");
    }
    setCursoCustomizado(!cursoCustomizado);
  }

  // Validação do Frontend
  function validar() {
    const novosErros = {};
    const cursoFinal = cursoCustomizado ? novoCursoNome.trim() : turmaData.curso.trim();

    if (!turmaData.nome.trim()) {
      novosErros.nome = "Nome da turma é obrigatório";
    } else if (turmaData.nome.trim().length < 2) {
      novosErros.nome = "Nome deve ter pelo menos 2 caracteres";
    }

    const anoNum = Number(turmaData.ano_letivo);
    if (!turmaData.ano_letivo) {
      novosErros.ano_letivo = "Ano letivo é obrigatório";
    } else if (isNaN(anoNum) || anoNum < 2000 || anoNum > new Date().getFullYear() + 1) {
      novosErros.ano_letivo = `Ano inválido (entre 2000 e ${new Date().getFullYear() + 1})`;
    }

    if (!cursoFinal) {
      novosErros.curso = "O nome do curso é obrigatório";
    }

    if (!turmaData.teacher_id) {
      novosErros.teacher_id = "Professor é obrigatório";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function voltar() {
    navigate("/admin/turmas");
  }

  // Submeter formulário para a API (POST ou PUT)
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validar()) return;

    setCarregando(true);
    setErros({});

    const cursoFinal = cursoCustomizado ? novoCursoNome.trim() : turmaData.curso.trim();
    
    // Dados formatados para o back-end
    const payload = {
      nome: turmaData.nome,
      ano_letivo: Number(turmaData.ano_letivo),
      curso: cursoFinal,
      teacher_id: Number(turmaData.teacher_id),
    };

    try {
      const token = localStorage.getItem("@EduTrack:token");
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing) {
        // 📌 Modo Edição: Executa a rota PUT
        await api.put(`/classes/${id}`, payload, { headers });
      } else {
        // 📌 Modo Criação: Executa a rota POST
        await api.post("/classes", payload, { headers });
      }

      setSucesso(true);
      setTimeout(() => {
        navigate("/admin/turmas");
      }, 1500);

    } catch (error) {
      const msgErro = error.response?.data?.error || "Erro ao salvar dados da turma. Tente novamente.";
      setErros({ geral: msgErro });
    } finally {
      setCarregando(false);
    }
  }

  function obterNomeProfessor(teacherId) {
    const prof = professoresDisponiveis.find((p) => p.id == teacherId);
    return prof?.user?.nome || "Não encontrado";
  }

  if (carregandoDados) {
    return (
      <div className="criar-turma-page-loading">
        <div className="loading-spinner"></div>
        <p className="page-subtitle">Sincronizando dados com o servidor...</p>
      </div>
    );
  }

  return (
    <div className="criar-turma-page">
      <div className="page-header">
        <button type="button" className="btn-back" onClick={voltar}>
          <ArrowLeft size={20} />
        </button>
        <div>
          {/* 📌 Título Dinâmico */}
          <h1 className="page-title">{isEditing ? "Editar Turma" : "Criar Turma"}</h1>
          <p className="page-subtitle">
            {isEditing ? `Modifique os dados da turma ID #${id}` : "Configure os dados da nova turma baseados no sistema real"}
          </p>
        </div>
      </div>

      <div className="criar-turma-container">
        <form className="criar-turma-form" onSubmit={handleSubmit}>
          {erros.geral && <div className="alert alert-danger">{erros.geral}</div>}
          {sucesso && (
            <div className="alert alert-success">
              {isEditing ? "✓ Turma atualizada com sucesso! Redirecionando..." : "✓ Turma criada com sucesso! Redirecionando..."}
            </div>
          )}

          <div className="form-section">
            <h2>Informações Básicas</h2>
            <p className="section-desc">Configure os dados principais da turma</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Nome da Turma *</label>
              <input
                type="text"
                className={`input ${erros.nome ? "is-invalid" : ""}`}
                placeholder="10º A"
                value={turmaData.nome}
                onChange={(e) => setTurmaData({ ...turmaData, nome: e.target.value })}
              />
              {erros.nome && <span className="error-msg">{erros.nome}</span>}
              <span className="input-hint">Ex: 10º A, 11º B, 12º C</span>
            </div>

            <div className="form-group">
              <label className="label">Ano Letivo *</label>
              <input
                type="number"
                min="2000"
                max={new Date().getFullYear() + 1}
                className={`input ${erros.ano_letivo ? "is-invalid" : ""}`}
                placeholder="2026"
                value={turmaData.ano_letivo}
                onChange={(e) => setTurmaData({ ...turmaData, ano_letivo: e.target.value })}
              />
              {erros.ano_letivo && <span className="error-msg">{erros.ano_letivo}</span>}
              <span className="input-hint">Formato: AAAA (Ex: 2026)</span>
            </div>
          </div>

          {/* Campo de Curso Dinâmico e Customizável */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label className="label" style={{ margin: 0 }}>Curso *</label>
              <button
                type="button"
                onClick={handleAlternarCursoCustomizado}
                className="btn-link"
                style={{
                  fontSize: "13px",
                  background: "none",
                  border: "none",
                  color: "#3b82f6",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: 0
                }}
              >
                {cursoCustomizado ? (
                  <>
                    <List size={14} /> Selecionar Existente
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Escrever Novo Curso
                  </>
                )}
              </button>
            </div>

            {cursoCustomizado ? (
              <input
                type="text"
                className={`input ${erros.curso ? "is-invalid" : ""}`}
                placeholder="Digite o nome do novo curso..."
                value={novoCursoNome}
                onChange={(e) => setNovoCursoNome(e.target.value)}
              />
            ) : (
              <select
                className={`input ${erros.curso ? "is-invalid" : ""}`}
                value={turmaData.curso}
                onChange={(e) => setTurmaData({ ...turmaData, curso: e.target.value })}
              >
                <option value="">Selecione um curso...</option>
                {cursosDisponiveis.map((curso) => (
                  <option key={curso} value={curso}>
                    {curso}
                  </option>
                ))}
              </select>
            )}
            {erros.curso && <span className="error-msg">{erros.curso}</span>}
          </div>

          <div className="form-section">
            <h2>Professor Responsável</h2>
            <p className="section-desc">Selecione o professor coordenador a partir dos registros do banco</p>
          </div>

          <div className="form-group">
            <label className="label">Professor *</label>
            {professoresDisponiveis.length === 0 ? (
              <div className="empty-professores" style={{ padding: "12px", border: "1px dashed #ef4444", borderRadius: "6px", backgroundColor: "#fef2f2" }}>
                <p style={{ color: '#ef4444', margin: 0, fontSize: "14px" }}>Nenhum professor cadastrado no banco de dados.</p>
              </div>
            ) : (
              <select
                className={`input ${erros.teacher_id ? "is-invalid" : ""}`}
                value={turmaData.teacher_id}
                onChange={(e) => setTurmaData({ ...turmaData, teacher_id: e.target.value })}
              >
                <option value="">Selecione um professor...</option>
                {professoresDisponiveis.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.user?.nome || "Professor sem nome"} ({prof.materia || "Geral"})
                  </option>
                ))}
              </select>
            )}
            {erros.teacher_id && <span className="error-msg">{erros.teacher_id}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={voltar} disabled={carregando}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-hero" disabled={carregando || professoresDisponiveis.length === 0}>
              <Save size={18} />
              {/* 📌 Botão Dinâmico */}
              {carregando ? (isEditing ? "Salvando..." : "Criando...") : (isEditing ? "Salvar Alterações" : "Criar Turma")}
            </button>
          </div>
        </form>

        {/* Card de Resumo Lateral */}
        <div className="form-resumo">
          <h3>Resumo</h3>
          <div className="resumo-item">
            <span className="resumo-label">Nome:</span>
            <span className="resumo-value">{turmaData.nome || "—"}</span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Ano Letivo:</span>
            <span className="resumo-value">{turmaData.ano_letivo || "—"}</span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Curso:</span>
            <span className="resumo-value">
              {cursoCustomizado ? novoCursoNome || "Escrevendo..." : turmaData.curso || "—"}
            </span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Professor:</span>
            <span className="resumo-value">
              {turmaData.teacher_id ? obterNomeProfessor(turmaData.teacher_id) : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}