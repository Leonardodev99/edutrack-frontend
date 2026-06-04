import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  KeyRound,
  BadgeCheck,
} from "lucide-react";
import "../../styles/PerfilAdmin.css";

const adminMock = {
  nome: "Enoque Filipe",
  email: "filipeenoque27@gmail.com",
  senha: "123456",
  tipo: "gestor",
};

export default function PerfilAdmin() {
  const [admin, setAdmin] = useState(adminMock);

  // Edição de informações
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ nome: admin.nome, email: admin.email });
  const [errosInfo, setErrosInfo] = useState({});

  // Alteração de senha
  const [editandoSenha, setEditandoSenha] = useState(false);
  const [senhaForm, setSenhaForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [errosSenha, setErrosSenha] = useState({});
  const [mostrarSenhas, setMostrarSenhas] = useState({
    senhaAtual: false,
    novaSenha: false,
    confirmarSenha: false,
  });

  const [sucessoInfo, setSucessoInfo] = useState(false);
  const [sucessoSenha, setSucessoSenha] = useState(false);

  // --- Validação Info ---
  function validarInfo() {
    const erros = {};
    if (!infoForm.nome.trim()) erros.nome = "Nome é obrigatório";
    if (!infoForm.email.trim()) erros.email = "Email é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(infoForm.email))
      erros.email = "Email inválido";
    setErrosInfo(erros);
    return Object.keys(erros).length === 0;
  }

  function salvarInfo() {
    if (!validarInfo()) return;
    setAdmin((prev) => ({ ...prev, nome: infoForm.nome, email: infoForm.email }));
    setEditandoInfo(false);
    setSucessoInfo(true);
    setTimeout(() => setSucessoInfo(false), 3000);
  }

  function cancelarInfo() {
    setInfoForm({ nome: admin.nome, email: admin.email });
    setErrosInfo({});
    setEditandoInfo(false);
  }

  // --- Validação Senha ---
  function validarSenha() {
    const erros = {};
    if (!senhaForm.senhaAtual) erros.senhaAtual = "Senha atual é obrigatória";
    else if (senhaForm.senhaAtual !== admin.senha) erros.senhaAtual = "Senha atual incorreta";
    if (!senhaForm.novaSenha) erros.novaSenha = "Nova senha é obrigatória";
    else if (senhaForm.novaSenha.length < 6) erros.novaSenha = "Mínimo de 6 caracteres";
    if (!senhaForm.confirmarSenha) erros.confirmarSenha = "Confirme a nova senha";
    else if (senhaForm.novaSenha !== senhaForm.confirmarSenha)
      erros.confirmarSenha = "As senhas não coincidem";
    setErrosSenha(erros);
    return Object.keys(erros).length === 0;
  }

  function salvarSenha() {
    if (!validarSenha()) return;
    setAdmin((prev) => ({ ...prev, senha: senhaForm.novaSenha }));
    setSenhaForm({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    setEditandoSenha(false);
    setSucessoSenha(true);
    setTimeout(() => setSucessoSenha(false), 3000);
  }

  function cancelarSenha() {
    setSenhaForm({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    setErrosSenha({});
    setEditandoSenha(false);
  }

  function toggleVerSenha(campo) {
    setMostrarSenhas((prev) => ({ ...prev, [campo]: !prev[campo] }));
  }

  const iniciais = admin.nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="perfil-admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Meu Perfil</h1>
          <p className="page-subtitle">Gerencie as suas informações pessoais e segurança</p>
        </div>
      </div>

      <div className="perfil-layout">
        {/* Coluna esquerda — cartão de identidade */}
        <div className="perfil-sidebar">
          <div className="identity-card">
            <div className="avatar-area">
              <div className="avatar-circle">
                <span>{iniciais}</span>
              </div>
              <div className="avatar-badge">
                <ShieldCheck size={14} />
              </div>
            </div>

            <div className="identity-info">
              <h2 className="identity-nome">{admin.nome}</h2>
              <p className="identity-email">{admin.email}</p>
            </div>

            <div className="identity-tipo">
              <BadgeCheck size={15} />
              <span>
                {admin.tipo.charAt(0).toUpperCase() + admin.tipo.slice(1)}
              </span>
            </div>
          </div>

          <div className="perfil-stats">
            <div className="stat-row">
              <span className="stat-label">Função</span>
              <span className="stat-value">Administrador</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Tipo de conta</span>
              <span className="stat-value capitalize">{admin.tipo}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Estado</span>
              <span className="badge-ativo">● Ativo</span>
            </div>
          </div>
        </div>

        {/* Coluna direita — formulários */}
        <div className="perfil-forms">
          {/* Informações Pessoais */}
          <div className="perfil-card">
            <div className="card-head">
              <div className="card-head-left">
                <div className="card-icon-wrap">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="card-title">Informações Pessoais</h3>
                  <p className="card-subtitle">Nome e endereço de email</p>
                </div>
              </div>
              {!editandoInfo && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditandoInfo(true)}
                >
                  <Edit2 size={14} />
                  Editar
                </button>
              )}
            </div>

            {sucessoInfo && (
              <div className="alert alert-success">✓ Informações atualizadas com sucesso!</div>
            )}

            <div className="card-body">
              {/* Nome */}
              <div className="form-group">
                <label className="label">
                  <User size={13} />
                  Nome completo
                </label>
                {editandoInfo ? (
                  <>
                    <input
                      type="text"
                      className={`input ${errosInfo.nome ? "is-invalid" : ""}`}
                      value={infoForm.nome}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, nome: e.target.value })
                      }
                      placeholder="Nome completo"
                    />
                    {errosInfo.nome && (
                      <span className="error-msg">{errosInfo.nome}</span>
                    )}
                  </>
                ) : (
                  <div className="field-display">{admin.nome}</div>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="label">
                  <Mail size={13} />
                  Endereço de email
                </label>
                {editandoInfo ? (
                  <>
                    <input
                      type="email"
                      className={`input ${errosInfo.email ? "is-invalid" : ""}`}
                      value={infoForm.email}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, email: e.target.value })
                      }
                      placeholder="email@exemplo.com"
                    />
                    {errosInfo.email && (
                      <span className="error-msg">{errosInfo.email}</span>
                    )}
                  </>
                ) : (
                  <div className="field-display">{admin.email}</div>
                )}
              </div>

              {editandoInfo && (
                <div className="form-actions">
                  <button className="btn btn-outline" onClick={cancelarInfo}>
                    <X size={15} />
                    Cancelar
                  </button>
                  <button className="btn btn-hero" onClick={salvarInfo}>
                    <Save size={15} />
                    Guardar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Segurança */}
          <div className="perfil-card">
            <div className="card-head">
              <div className="card-head-left">
                <div className="card-icon-wrap card-icon-warn">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="card-title">Segurança</h3>
                  <p className="card-subtitle">Altere a sua palavra-passe</p>
                </div>
              </div>
              {!editandoSenha && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditandoSenha(true)}
                >
                  <Lock size={14} />
                  Alterar
                </button>
              )}
            </div>

            {sucessoSenha && (
              <div className="alert alert-success">✓ Palavra-passe alterada com sucesso!</div>
            )}

            {editandoSenha ? (
              <div className="card-body">
                {/* Senha Atual */}
                <div className="form-group">
                  <label className="label">
                    <Lock size={13} />
                    Senha atual
                  </label>
                  <div className="input-password-wrap">
                    <input
                      type={mostrarSenhas.senhaAtual ? "text" : "password"}
                      className={`input ${errosSenha.senhaAtual ? "is-invalid" : ""}`}
                      value={senhaForm.senhaAtual}
                      onChange={(e) =>
                        setSenhaForm({ ...senhaForm, senhaAtual: e.target.value })
                      }
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="toggle-senha"
                      onClick={() => toggleVerSenha("senhaAtual")}
                    >
                      {mostrarSenhas.senhaAtual ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errosSenha.senhaAtual && (
                    <span className="error-msg">{errosSenha.senhaAtual}</span>
                  )}
                </div>

                {/* Nova Senha */}
                <div className="form-group">
                  <label className="label">
                    <Lock size={13} />
                    Nova senha
                  </label>
                  <div className="input-password-wrap">
                    <input
                      type={mostrarSenhas.novaSenha ? "text" : "password"}
                      className={`input ${errosSenha.novaSenha ? "is-invalid" : ""}`}
                      value={senhaForm.novaSenha}
                      onChange={(e) =>
                        setSenhaForm({ ...senhaForm, novaSenha: e.target.value })
                      }
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      className="toggle-senha"
                      onClick={() => toggleVerSenha("novaSenha")}
                    >
                      {mostrarSenhas.novaSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errosSenha.novaSenha && (
                    <span className="error-msg">{errosSenha.novaSenha}</span>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div className="form-group">
                  <label className="label">
                    <Lock size={13} />
                    Confirmar nova senha
                  </label>
                  <div className="input-password-wrap">
                    <input
                      type={mostrarSenhas.confirmarSenha ? "text" : "password"}
                      className={`input ${errosSenha.confirmarSenha ? "is-invalid" : ""}`}
                      value={senhaForm.confirmarSenha}
                      onChange={(e) =>
                        setSenhaForm({ ...senhaForm, confirmarSenha: e.target.value })
                      }
                      placeholder="Repita a nova senha"
                    />
                    <button
                      type="button"
                      className="toggle-senha"
                      onClick={() => toggleVerSenha("confirmarSenha")}
                    >
                      {mostrarSenhas.confirmarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errosSenha.confirmarSenha && (
                    <span className="error-msg">{errosSenha.confirmarSenha}</span>
                  )}
                </div>

                <div className="form-actions">
                  <button className="btn btn-outline" onClick={cancelarSenha}>
                    <X size={15} />
                    Cancelar
                  </button>
                  <button className="btn btn-hero" onClick={salvarSenha}>
                    <Save size={15} />
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-body">
                <div className="senha-placeholder">
                  <Lock size={15} />
                  <span>••••••••••••</span>
                  <span className="senha-hint">Última alteração desconhecida</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}