import { useState } from "react";
import { User, Mail, ShieldCheck, Shield, Key, Calendar, MapPin, Smartphone, BookOpen } from "lucide-react";
import "../../styles/PerfilProfessor.css";

export default function PerfilProfessor() {
  // Dados simulados exclusivos do Professor logado no EduTrack
  const [professorProfile] = useState({
    nome: "Mário Tavares",
    email: "mario.tavares@edutrack.com",
    role: "Professor de Tecnologia",
    id: "p-1",
    telefone: "+244 923 456 789",
    localizacao: "Luanda, Angola",
    membro_desde: "2025-02-10",
    status: "Ativo",
    escola: "Happy Angola",
    disciplinas: ["Junior Game Development", "Digital Sciences"]
  });

  // Histórico de acessos de segurança do painel do professor
  const logsAcesso = [
    { data: "2026-05-26 16:10", ip: "102.223.40.105", dispositivo: "Chrome - Windows 11" },
    { data: "2026-05-25 08:45", ip: "102.223.40.105", dispositivo: "Chrome - Windows 11" },
    { data: "2026-05-22 14:12", ip: "197.214.15.34", dispositivo: "Firefox - MacOS" },
  ];

  const obterIniciais = (nome) => {
    return nome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

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
            {obterIniciais(professorProfile.nome)}
          </div>
          <h2 className="profile-name">{professorProfile.nome}</h2>
          <span className="profile-badge-role-prof">
            <ShieldCheck size={14} />
            {professorProfile.role}
          </span>
          <div className="status-indicator">
            <span className="status-dot online"></span>
            Painel do Professor Ativo
          </div>

          <hr className="divider-perfil" />

          <div className="mini-meta-list">
            <div className="meta-item">
              <Key size={14} />
              <span>ID Professor: <strong>{professorProfile.id}</strong></span>
            </div>
            <div className="meta-item">
              <Calendar size={14} />
              <span>No EduTrack desde: {new Date(professorProfile.membro_desde).toLocaleDateString("pt-BR")}</span>
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
                  <span>{professorProfile.nome}</span>
                </div>
              </div>

              <div className="info-field-box">
                <label className="field-label-view">E-mail Institucional</label>
                <div className="field-value-container">
                  <Mail size={16} />
                  <span>{professorProfile.email}</span>
                </div>
              </div>

              <div className="info-field-box">
                <label className="field-label-view">Contacto Telefônico</label>
                <div className="field-value-container">
                  <Smartphone size={16} />
                  <span>{professorProfile.telefone}</span>
                </div>
              </div>

              <div className="info-field-box">
                <label className="field-label-view">Instituição / Centro</label>
                <div className="field-value-container">
                  <MapPin size={16} />
                  <span>{professorProfile.escola} ({professorProfile.localizacao})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Atribuição de Cursos / Disciplinas */}
          <div className="details-section-card">
            <h3 className="section-card-title">Minhas Turmas e Cursos Ativos</h3>
            <div className="disciplinas-prof-container">
              {professorProfile.disciplinas.map((disc, idx) => (
                <div key={idx} className="disciplina-prof-tag">
                  <BookOpen size={16} />
                  <span>{disc}</span>
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