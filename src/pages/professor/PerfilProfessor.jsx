import { useState, useEffect } from "react";
import { User, Mail, ShieldCheck, Shield, Key, Calendar, MapPin, Smartphone, BookOpen } from "lucide-react";
import api from "../../services/api"; // Instância configurada do Axios
import "../../styles/PerfilProfessor.css";

export default function PerfilProfessor() {
  // Estado para armazenar os dados consolidados vindos da API
  const [professorProfile, setProfessorProfile] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Histórico de acessos (pode ser mantido estático se não houver tabela de logs no banco)
  const logsAcesso = [
    { data: "2026-05-26 16:10", ip: "102.223.40.105", dispositivo: "Chrome - Windows 11" },
    { data: "2026-05-25 08:45", ip: "102.223.40.105", dispositivo: "Chrome - Windows 11" },
    { data: "2026-05-22 14:12", ip: "197.214.15.34", dispositivo: "Firefox - MacOS" },
  ];

  useEffect(() => {
    async function carregarPerfilDocente() {
      try {
        setCarregando(true);
        setErro("");
        
        // Recupera o token salvo no ecossistema EduTrack
        const token = localStorage.getItem("@EduTrack:token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Busca os dados de conta do Utilizador (/users/me)
        const responseUser = await api.get("/users/me", { headers });
        const dadosUser = responseUser.data;

        // 2. Busca os dados de docência do Professor (/teachers/me ou rota equivalente ao método myTeacher)
        // Nota: Certifique-se de que a rota mapeia para TeacherController.myTeacher no seu arquivo de rotas.
        let dadosTeacher = { departamento: "Geral", disciplina: "" };
        try {
          const responseTeacher = await api.get("/teachers/me", { headers });
          dadosTeacher = responseTeacher.data;
        } catch (errTeacher) {
          console.warn("Não foi possível carregar as especificidades de professor:", errTeacher);
        }

        // 3. Consolida e formata os dados no padrão esperado pela interface
        // Tratamento para transformar a string separada por vírgulas ou array vindo do banco em tags
        const listaDisciplinas = dadosTeacher.disciplina 
          ? (typeof dadosTeacher.disciplina === "string" ? dadosTeacher.disciplina.split(",") : dadosTeacher.disciplina)
          : ["Sem disciplinas atribuídas"];

        setProfessorProfile({
          nome: dadosUser.nome,
          email: dadosUser.email,
          role: dadosUser.tipo === "professor" ? "Professor de Tecnologia" : dadosUser.tipo,
          id: dadosTeacher.id || `u-${dadosUser.id}`,
          telefone: dadosUser.telefone || "Não cadastrado", // Fallback caso tenha no seu modelo
          localizacao: "Luanda, Angola", 
          membro_desde: dadosUser.created_at || new Date().toISOString(),
          status: dadosUser.ativo ? "Ativo" : "Inativo",
          escola: dadosTeacher.departamento || "Happy Angola",
          disciplinas: listaDisciplinas
        });

      } catch (error) {
        console.error(error);
        setErro(error.response?.data?.error || "Erro ao conectar com o servidor do EduTrack.");
      } finally {
        setCarregando(false);
      }
    }

    carregarPerfilDocente();
  }, []);

  const obtenerIniciais = (nome) => {
    if (!nome) return "??";
    return nome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (carregando) {
    return (
      <div className="perfil-professor-page">
        <div className="loading-container">
          <p className="page-subtitle">Buscando credenciais e dados docentes no servidor...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="perfil-professor-page">
        <div className="alert alert-danger" style={{ padding: "20px", borderRadius: "8px" }}>
          <h4>Houve um problema de autenticação</h4>
          <p>{erro}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-professor-page">
      <div className="page-header-perfil">
        <h1 className="page-title">Meu Perfil Docente</h1>
        <p className="page-subtitle">Gerencie suas informações profissionais e credenciais de acesso.</p>
      </div>

      <div className="perfil-grid-layout">
        
        {/* COLUNA ESQUERDA: CARD PRINCIPAL DO PROFESSOR */}
        <div className="perfil-card-main">
          <div className="avatar-circle-prof">
            {obtenerIniciais(professorProfile?.nome)}
          </div>
          <h2 className="profile-name">{professorProfile?.nome}</h2>
          <span className="profile-badge-role-prof">
            <ShieldCheck size={14} />
            {professorProfile?.role}
          </span>
          <div className={`status-indicator ${professorProfile?.status === "Ativo" ? "online" : "offline"}`}>
            <span className={`status-dot ${professorProfile?.status === "Ativo" ? "online" : "offline"}`}></span>
            Painel do Professor {professorProfile?.status}
          </div>

          <hr className="divider-perfil" />

          <div className="mini-meta-list">
            <div className="meta-item">
              <Key size={14} />
              <span>ID Interno: <strong>{professorProfile?.id}</strong></span>
            </div>
            <div className="meta-item">
              <Calendar size={14} />
              <span>No EduTrack desde: {new Date(professorProfile?.membro_desde).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: DADOS DO PROFESSOR & DISCIPLINAS */}
        <div className="perfil-details-wrapper">
          
          {/* Dados Cadastrais */}
          <div className="details-section-card">
            <h3 className="section-card-title">Informações Pessoais e de Contato</h3>
            
            <div className="info-fields-grid">
              <div className="info-field-box">
                <label className="field-label-view">Nome Completo</label>
                <div className="field-value-container">
                  <User size={16} />
                  <span>{professorProfile?.nome}</span>
                </div>
              </div>

              <div className="info-field-box">
                <label className="field-label-view">E-mail Institucional</label>
                <div className="field-value-container">
                  <Mail size={16} />
                  <span>{professorProfile?.email}</span>
                </div>
              </div>

              <div className="info-field-box">
                <label className="field-label-view">Contacto Telefônico</label>
                <div className="field-value-container">
                  <Smartphone size={16} />
                  <span>{professorProfile?.telefone}</span>
                </div>
              </div>

              <div className="info-field-box">
                <label className="field-label-view">Instituição / Centro</label>
                <div className="field-value-container">
                  <MapPin size={16} />
                  <span>{professorProfile?.escola} ({professorProfile?.localizacao})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Atribuição de Cursos / Disciplinas */}
          <div className="details-section-card">
            <h3 className="section-card-title">Minhas Turmas e Cursos Ativos</h3>
            <div className="disciplinas-prof-container">
              {professorProfile?.disciplinas.map((disc, idx) => (
                <div key={idx} className="disciplina-prof-tag">
                  <BookOpen size={16} />
                  <span>{disc.trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Registro de Acessos */}
          <div className="details-section-card">
            <div className="section-card-header-flex">
              <h3 className="section-card-title">Histórico de Segurança</h3>
              <span className="security-shield-tag"><Shield size={14} /> Sessão Segura</span>
            </div>
            
            <div className="table-logs-wrapper">
              <table className="table-logs">
                <thead>
                  <tr>
                    <th>Data e Hora do Login</th>
                    <th>IP de Origem</th>
                    <th>Navegador / Sistema Operacional</th>
                  </tr>
                </thead>
                <tbody>
                  {logsAcesso.map((log, index) => (
                    <tr key={index}>
                      <td>{log.data}</td>
                      <td className="font-mono">{log.ip}</td>
                      <td>{log.dispositivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}