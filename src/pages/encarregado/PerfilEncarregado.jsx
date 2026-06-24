import { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Lock, Save, GraduationCap, MapPin } from 'lucide-react';
import api from '../../services/api';
import '../../styles/PerfilEncarregado.css';

export default function PerfilEncarregado() {
  // IDs de controle de banco de dados
  const [userId, setUserId] = useState(null);
  const [guardianId, setGuardianId] = useState(null);

  // Estados dos inputs de dados cadastrais
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [morada, setMorada] = useState("Luanda, Angola"); 

  // Estados de segurança
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  // Lista dinâmica de educandos tutelados
  const [educandosVinculados, setEducandosVinculados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  useEffect(() => {
    async function carregarDadosCompletos() {
      try {
        setCarregando(true);
        const token = localStorage.getItem("@EduTrack:token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Coleta dados essenciais do usuário autenticado
        const responseUser = await api.get("/users/me", { headers });
        const dadosUser = responseUser.data;
        
        setUserId(dadosUser.id);
        setNome(dadosUser.nome);
        setEmail(dadosUser.email);

        // Substitua a lógica antiga no useEffect por esta:
const responseGuardian = await api.get("/guardians/me", { headers });
const meuPerfilGuardian = responseGuardian.data;

if (meuPerfilGuardian) {
  setGuardianId(meuPerfilGuardian.id);
  setTelefone(meuPerfilGuardian.telefone || "");
  
  if (meuPerfilGuardian.students) {
    const alunosFormatados = meuPerfilGuardian.students.map(estudante => ({
      id: estudante.id,
      nome: estudante.user?.nome || "Estudante",
      turma: "Turma Ativa",
      curso: estudante.matricula ? `Matrícula: ${estudante.matricula}` : "Curso Regular"
    }));
    setEducandosVinculados(alunosFormatados);
  }
}
      } catch (error) {
        console.error("Erro ao sincronizar dados com o servidor:", error);
        exibirMensagem("danger", "Não foi possível resgatar seus dados cadastrais.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosCompletos();
  }, []);

  const exibirMensagem = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: "", texto: "" }), 5000);
  };

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("@EduTrack:token");
      const headers = { Authorization: `Bearer ${token}` };

      // Como o controller exige papel de gestor para alterar certos dados de terceiros,
      // no escopo de perfil próprio o encarregado atualiza sua estrutura base e telefone.
      await api.put(`/users/${userId}`, { nome, email }, { headers });
      
      if (guardianId) {
        await api.put(`/guardians/${guardianId}`, { telefone }, { headers });
      }

      exibirMensagem("success", "Alterações cadastrais aplicadas com sucesso!");
    } catch (error) {
      exibirMensagem("danger", error.response?.data?.error || "Erro ao tentar atualizar cadastro.");
    }
  };

  const handleAlterarSenha = async (e) => {
    e.preventDefault();
    if (!novaSenha || novaSenha.length < 6) {
      exibirMensagem("danger", "A nova senha precisa conter no mínimo 6 caracteres.");
      return;
    }

    try {
      const token = localStorage.getItem("@EduTrack:token");
      const headers = { Authorization: `Bearer ${token}` };

      // Envia a nova senha para a rota de atualização do usuário
      await api.put(`/users/${userId}`, { senha: novaSenha }, { headers });

      exibirMensagem("success", "Sua palavra-passe de acesso foi modificada com êxito!");
      setSenhaAtual("");
      setNovaSenha("");
    } catch (error) {
      exibirMensagem("danger", "Houve um problema de autenticação ao tentar alterar a senha.");
    }
  };

  if (carregando) {
    return (
      <div className="perfil-page">
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          Sincronizando dados com o sistema central da escola...
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Meu Perfil</h1>
          <p className="page-subtitle">Gerencie suas informações de contato, senhas de acesso e consulte os educandos vinculados à sua conta.</p>
        </div>
      </div>

      {mensagem.texto && (
        <div className={`alert alert-${mensagem.tipo}`} style={{ margin: "15px 0", padding: "12px", borderRadius: "6px" }}>
          {mensagem.texto}
        </div>
      )}

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
            <p className="sidebar-section-desc">Estes são os estudantes vinculados ao seu registro familiar para acompanhamento pedagógico na instituição.</p>

            <div className="students-tutela-list">
              {educandosVinculados.length === 0 ? (
                <p style={{ color: "#888", fontSize: "13px" }}>Nenhum educando vinculado a este perfil.</p>
              ) : (
                educandosVinculados.map((aluno) => (
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
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}