import { useState } from 'react';
import { User, Mail, Phone, Shield, Lock, Save, GraduationCap, MapPin } from 'lucide-react';
import '../../styles/PerfilEncarregado.css';

export default function PerfilEncarregado() {
  // Estados para gerenciar as informações editáveis do formulário
  const [nome, setNome] = useState("Carlos Silva");
  const [email, setEmail] = useState("carlos.silva@email.com");
  const [telefone, setTelefone] = useState("+244 923 000 000");
  const [morada, setMorada] = useState("Centralidade do Kilamba, Bloco X, Luanda");

  // Estado para alteração de senha de segurança
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  // Dados estáticos do educando vinculado (Lucas Silva)
  const educandosVinculados = [
    { id: "e-200", nome: "Lucas Silva", turma: "Turma A - Alpha", curso: "Junior Game Development" }
  ];

  const handleSalvarPerfil = (e) => {
    e.preventDefault();
    alert("Alterações cadastrais salvas com sucesso!");
  };

  const handleAlterarSenha = (e) => {
    e.preventDefault();
    if (!senhaAtual || !novaSenha) {
      alert("Por favor, preencha os campos de senha.");
      return;
    }
    alert("Senha de segurança atualizada com sucesso!");
    setSenhaAtual("");
    setNovaSenha("");
  };

  return (
    <div className="perfil-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Meu Perfil</h1>
          <p className="page-subtitle">Gerencie suas informações de contato, senhas de acesso e consulte os educandos vinculados à sua conta.</p>
        </div>
      </div>

      <div className="perfil-layout-grid">
        {/* Coluna da Esquerda: Formulários de Edição e Segurança */}
        <div className="perfil-forms-column">
          
          {/* Bloco de Dados Pessoais */}
          <div className="perfil-card">
            <div className="perfil-card-header">
              <User size={18} className="text-primary" />
              <h2>Dados Cadastrais</h2>
            </div>

            <form onSubmit={handleSalvarPerfil} className="perfil-form">
              <div className="form-group-row">
                <div className="form-field">
                  <label htmlFor="nome">Nome Completo</label>
                  <input 
                    type="text" 
                    id="nome" 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group-grid-2">
                <div className="form-field">
                  <label htmlFor="email">Correio Eletrônico</label>
                  <div className="input-with-icon-wrapper">
                    <Mail size={14} className="input-inner-icon" />
                    <input 
                      type="email" 
                      id="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="telefone">Telefone / Contacto</label>
                  <div className="input-with-icon-wrapper">
                    <Phone size={14} className="input-inner-icon" />
                    <input 
                      type="text" 
                      id="telefone" 
                      value={telefone} 
                      onChange={(e) => setTelefone(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="morada">Morada Residencial</label>
                <div className="input-with-icon-wrapper">
                  <MapPin size={14} className="input-inner-icon" />
                  <input 
                    type="text" 
                    id="morada" 
                    value={morada} 
                    onChange={(e) => setMorada(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-actions-right">
                <button type="submit" className="btn-primary-save">
                  <Save size={16} />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>

          {/* Bloco de Segurança / Alteração de Senha */}
          <div className="perfil-card">
            <div className="perfil-card-header">
              <Shield size={18} className="text-warning" />
              <h2>Segurança da Conta</h2>
            </div>

            <form onSubmit={handleAlterarSenha} className="perfil-form">
              <div className="form-group-grid-2">
                <div className="form-field">
                  <label htmlFor="senhaAtual">Senha Atual</label>
                  <div className="input-with-icon-wrapper">
                    <Lock size={14} className="input-inner-icon" />
                    <input 
                      type="password" 
                      id="senhaAtual" 
                      value={senhaAtual} 
                      onChange={(e) => setSenhaAtual(e.target.value)} 
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="novaSenha">Nova Senha</label>
                  <div className="input-with-icon-wrapper">
                    <Lock size={14} className="input-inner-icon" />
                    <input 
                      type="password" 
                      id="novaSenha" 
                      value={novaSenha} 
                      onChange={(e) => setNovaSenha(e.target.value)} 
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions-right">
                <button type="submit" className="btn-secondary-security">
                  <span>Atualizar Palavra-Passe</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Coluna da Direita: Educandos Vinculados */}
        <div className="perfil-sidebar-column">
          <div className="perfil-card">
            <div className="perfil-card-header">
              <GraduationCap size={18} className="text-success" />
              <h2>Educandos Sob Tutela</h2>
            </div>
            <p className="sidebar-section-desc">Estes são os estudantes vinculados ao seu Número de Identificação Fiscal (NIF) para acompanhamento pedagógico.</p>

            <div className="students-tutela-list">
              {educandosVinculados.map((aluno) => (
                <div key={aluno.id} className="student-tutela-item-box">
                  <div className="student-avatar-placeholder">
                    <span>{aluno.nome.charAt(0)}</span>
                  </div>
                  <div className="student-tutela-details">
                    <h4>{aluno.nome}</h4>
                    <span className="student-info-badge">{aluno.curso}</span>
                    <p className="student-sub-detail">{aluno.turma}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}