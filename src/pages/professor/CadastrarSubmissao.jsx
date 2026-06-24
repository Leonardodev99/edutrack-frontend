import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Search, FileText, Link, User } from "lucide-react";
import api from "../../services/api";
import "../../styles/CadastrarSubmissao.css";

export default function CadastrarSubmissao() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);

  const [submissaoData, setSubmissaoData] = useState({
    task_id: "",
    student_id: "",
    content: "",
    file_url: "",
  });

  const [tarefasDisponiveis, setTarefasDisponiveis] = useState([]);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
  const [buscaTarefa, setBuscaTarefa] = useState("");
  const [buscaAluno, setBuscaAluno] = useState("");
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  // Carregar tarefas e alunos
  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const token = localStorage.getItem("@EduTrack:token");

      // Tarefas
      const tarefasRes = await api.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTarefasDisponiveis(tarefasRes.data);

      // Alunos (crie a rota /students se ainda não existir)
      const alunosRes = await api.get("/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlunosDisponiveis(alunosRes.data);
    } catch (error) {
      console.error(error);
      setErros({ geral: "Erro ao carregar dados." });
    } finally {
      setCarregandoDados(false);
    }
  }

  const tarefasFiltradas = useMemo(() => {
    return tarefasDisponiveis.filter(t => 
      t.title?.toLowerCase().includes(buscaTarefa.toLowerCase()) ||
      String(t.id).includes(buscaTarefa)
    );
  }, [tarefasDisponiveis, buscaTarefa]);

  const alunosFiltrados = useMemo(() => {
    return alunosDisponiveis.filter(a => 
      (a.user?.nome || a.nome || "").toLowerCase().includes(buscaAluno.toLowerCase()) ||
      String(a.id).includes(buscaAluno)
    );
  }, [alunosDisponiveis, buscaAluno]);

  const tarefaSelecionada = tarefasDisponiveis.find(t => String(t.id) === submissaoData.task_id);
  const alunoSelecionado = alunosDisponiveis.find(a => String(a.id) === submissaoData.student_id);

  function validarEtapa1() {
    const novosErros = {};
    if (!submissaoData.task_id) novosErros.task_id = "Selecione a tarefa";
    if (!submissaoData.student_id) novosErros.student_id = "Selecione o aluno";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function validarEtapa2() {
    const novosErros = {};
    if (!submissaoData.content?.trim()) {
      novosErros.content = "Informe o conteúdo ou observações da entrega";
    }
    if (!submissaoData.file_url?.trim()) {
      novosErros.file_url = "O link do arquivo é obrigatório";
    } else {
      try {
        new URL(submissaoData.file_url);
      } catch {
        novosErros.file_url = "Insira um link válido";
      }
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function avancar() {
    if (etapa === 1 && validarEtapa1()) {
      setEtapa(2);
      setErros({});
    }
  }

  function voltar() {
    if (etapa > 1) {
      setEtapa(etapa - 1);
      setErros({});
    } else {
      navigate("/professor");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (etapa !== 2 || !validarEtapa2()) return;

    setCarregando(true);
    setErros({});

    try {
      const token = localStorage.getItem("@EduTrack:token");

      const payload = {
        task_id: parseInt(submissaoData.task_id),
        student_id: parseInt(submissaoData.student_id),
        content: submissaoData.content.trim(),
        file_url: submissaoData.file_url.trim(),
      };

      await api.post("/submissions", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSucesso(true);
      setTimeout(() => {
        navigate("/professor"); 
      }, 1600);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Erro ao registrar submissão";
      setErros({ geral: msg });
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoDados) return <div className="loading">Carregando dados...</div>;

  return (
    <div className="cadastrar-submissao-page">
      <div className="page-header">
        <button className="btn-back" onClick={voltar}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Registrar Entrega</h1>
          <p className="page-subtitle">Professor registrando submissão de aluno</p>
        </div>
      </div>

      <div className="submissao-container">
        <form className="submissao-form" onSubmit={handleSubmit}>
          {erros.geral && <div className="alert alert-danger">{erros.geral}</div>}
          {sucesso && <div className="alert alert-success">✓ Submissão registrada com sucesso!</div>}

          {/* ETAPA 1: Seleção de Tarefa + Aluno */}
          {etapa === 1 && (
            <div className="form-step-animation">
              <div className="form-section">
                <h2>Identificar Tarefa e Aluno</h2>
              </div>

              {/* Busca e seleção de Tarefa */}
              <div className="busca-container">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar tarefa..."
                  value={buscaTarefa}
                  onChange={(e) => setBuscaTarefa(e.target.value)}
                />
              </div>
              <div className={`tarefas-grid ${erros.task_id ? "has-error" : ""}`}>
                {tarefasFiltradas.map((tarefa) => (
                  <label key={tarefa.id} className={`tarefa-card ${submissaoData.task_id === String(tarefa.id) ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      value={tarefa.id}
                      checked={submissaoData.task_id === String(tarefa.id)}
                      onChange={(e) => setSubmissaoData({ ...submissaoData, task_id: e.target.value })}
                    />
                    <div className="tarefa-card-content">
                      <FileText size={20} />
                      <div>
                        <strong>{tarefa.title}</strong>
                        <small>Prazo: {new Date(tarefa.deadline).toLocaleDateString("pt-BR")}</small>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Busca e seleção de Aluno */}
              <div className="busca-container mt-4">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar aluno por nome ou ID..."
                  value={buscaAluno}
                  onChange={(e) => setBuscaAluno(e.target.value)}
                />
              </div>
              <div className={`tarefas-grid ${erros.student_id ? "has-error" : ""}`}>
                {alunosFiltrados.map((aluno) => (
                  <label key={aluno.id} className={`tarefa-card ${submissaoData.student_id === String(aluno.id) ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      value={aluno.id}
                      checked={submissaoData.student_id === String(aluno.id)}
                      onChange={(e) => setSubmissaoData({ ...submissaoData, student_id: e.target.value })}
                    />
                    <div className="tarefa-card-content">
                      <User size={20} />
                      <div>
                        <strong>{aluno.user?.nome || aluno.nome}</strong>
                        <small>ID: {aluno.id}</small>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ETAPA 2: Dados da Submissão */}
          {etapa === 2 && (
            <div className="form-step-animation">
              <div className="form-section">
                <h2>Dados da Entrega</h2>
                <p>
                  Tarefa: <strong>{tarefaSelecionada?.title}</strong><br/>
                  Aluno: <strong>{alunoSelecionado?.user?.nome || alunoSelecionado?.nome}</strong>
                </p>
              </div>

              <div className="input-group">
                <label>Link do Arquivo</label>
                <div className={`field-container ${erros.file_url ? "field-error" : ""}`}>
                  <Link size={16} />
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={submissaoData.file_url}
                    onChange={(e) => setSubmissaoData({ ...submissaoData, file_url: e.target.value })}
                  />
                </div>
                {erros.file_url && <span className="error-msg">{erros.file_url}</span>}
              </div>

              <div className="input-group">
                <label>Observações / Conteúdo da Entrega</label>
                <textarea
                  rows="5"
                  placeholder="Descreva o trabalho entregue ou adicione observações..."
                  value={submissaoData.content}
                  onChange={(e) => setSubmissaoData({ ...submissaoData, content: e.target.value })}
                />
                {erros.content && <span className="error-msg">{erros.content}</span>}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={voltar}>
              {etapa === 1 ? "Cancelar" : "Voltar"}
            </button>
            {etapa < 2 ? (
              <button type="button" className="btn btn-primary" onClick={avancar}>
                Continuar
              </button>
            ) : (
              <button type="submit" className="btn btn-hero" disabled={carregando}>
                <Save size={18} />
                {carregando ? "Registrando..." : "Registrar Submissão"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}