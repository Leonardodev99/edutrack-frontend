import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Calendar, FileText } from "lucide-react";
import api from "../../services/api";
import "../../styles/CadastrarTarefa.css";

export default function CadastrarTarefa() {
  const navigate = useNavigate();
  const [tarefaData, setTarefaData] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [teacherId, setTeacherId] = useState(null);
  const [carregandoTeacher, setCarregandoTeacher] = useState(true);

  // Buscar o ID do professor logado
  useEffect(() => {
    carregarProfessorLogado();
  }, []);

  async function carregarProfessorLogado() {
    try {
      const token = localStorage.getItem("@EduTrack:token");
      const response = await api.get("/teachers/me", {  // ← Crie esta rota se não existir
        headers: { Authorization: `Bearer ${token}` },
      });

      setTeacherId(response.data.id);   // ou response.data.teacher?.id
    } catch (error) {
      console.error(error);
      setErros({ geral: "Erro ao identificar seu cadastro de professor." });
    } finally {
      setCarregandoTeacher(false);
    }
  }

  function validarFormulario() {
    const novosErros = {};
    if (!tarefaData.title.trim()) novosErros.title = "O título da tarefa é obrigatório";
    if (!tarefaData.description.trim()) novosErros.description = "A descrição é obrigatória";
    if (!tarefaData.deadline) {
      novosErros.deadline = "Informe a data de entrega";
    } else {
      const prazo = new Date(tarefaData.deadline);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (prazo < hoje) {
        novosErros.deadline = "O prazo não pode ser no passado";
      }
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validarFormulario() || !teacherId) return;

    setCarregando(true);
    setErros({});

    try {
      const token = localStorage.getItem("@EduTrack:token");

      const payload = {
        title: tarefaData.title.trim(),
        description: tarefaData.description.trim(),
        deadline: tarefaData.deadline,
        teacher_id: teacherId,
      };

      await api.post("/tasks", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSucesso(true);
      setTimeout(() => {
        navigate("/professor"); 
      }, 1600);
    } catch (error) {
      console.error(error);
      const mensagem = error.response?.data?.error || "Erro ao cadastrar tarefa";
      setErros({ geral: mensagem });
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoTeacher) {
    return <div className="loading">Carregando suas informações...</div>;
  }

  return (
    <div className="cadastrar-tarefa-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate("/professor")}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Nova Tarefa</h1>
          <p className="page-subtitle">Cadastrar tarefa para os seus alunos</p>
        </div>
      </div>

      <div className="tarefa-container">
        <form onSubmit={handleSubmit} className="tarefa-form">
          {erros.geral && <div className="alert alert-danger">{erros.geral}</div>}
          {sucesso && (
            <div className="alert alert-success">
              ✓ Tarefa cadastrada com sucesso!
            </div>
          )}

          <div className="form-section">
            <h2>Detalhes da Tarefa</h2>
          </div>

          <div className="input-group">
            <label className="input-label">Título da Tarefa</label>
            <div className={`field-container ${erros.title ? "field-error" : ""}`}>
              <FileText size={16} />
              <input
                type="text"
                placeholder="Ex: Exercícios de Equações do 2º Grau"
                value={tarefaData.title}
                onChange={(e) => setTarefaData({ ...tarefaData, title: e.target.value })}
              />
            </div>
            {erros.title && <span className="error-msg">{erros.title}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Descrição / Instruções</label>
            <div className={`field-container textarea-container ${erros.description ? "field-error" : ""}`}>
              <textarea
                rows="6"
                placeholder="Descreva a atividade, critérios de avaliação, material de apoio..."
                value={tarefaData.description}
                onChange={(e) => setTarefaData({ ...tarefaData, description: e.target.value })}
              />
            </div>
            {erros.description && <span className="error-msg">{erros.description}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Data de Entrega</label>
            <div className={`field-container ${erros.deadline ? "field-error" : ""}`}>
              <Calendar size={16} />
              <input
                type="date"
                value={tarefaData.deadline}
                onChange={(e) => setTarefaData({ ...tarefaData, deadline: e.target.value })}
              />
            </div>
            {erros.deadline && <span className="error-msg">{erros.deadline}</span>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate("/professor")}
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
              {carregando ? "Publicando Tarefa..." : "Publicar Tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}