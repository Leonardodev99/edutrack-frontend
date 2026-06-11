import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, Loader2 } from "lucide-react";
import api from "../services/api.js"; 
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  
  // Estados do formulário
  const [perfil, setPerfil] = useState("professor"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Estados de controlo da API
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); 
    
    try {
      
      const response = await api.post("/tokens", {
        email,
        senha: password 
      });

      const { token, user } = response.data;

      // 2. Validação de segurança: verificar se o perfil escolhido na tab bate com o tipo do user na BD
      
      if (user.tipo !== perfil) {
        throw new Error(`Este utilizador não está registado como ${perfil === 'gestor' ? 'Administrador' : perfil}.`);
      }

      // 3. Guardar os dados essenciais com segurança no localStorage
      localStorage.setItem("@EduTrack:token", token);
      localStorage.setItem("@EduTrack:user", JSON.stringify(user));

      // 4. Injetar o token por padrão em todas as futuras requisições do Axios
      api.defaults.headers.authorization = `Bearer ${token}`;

      // 5. Redirecionamento baseado no tipo do utilizador
      if (user.tipo === "gestor") {
        navigate("/admin");
      } else if (user.tipo === "professor") {
        navigate("/professor");
      } else if (user.tipo === "encarregado") {
        navigate("/encarregado");
      } else {
        navigate("/aluno");
      }

    } catch (err) {
      // Captura a mensagem de erro vinda do backend (ex: 'Senha inválida', 'Usuário não encontrado')
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else if (err.message) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Ocorreu um erro ao iniciar sessão. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-side">
        <Link to="/" className="login-brand">
          <div className="login-brand-logo">
            <GraduationCap size={22} />
          </div>
          <span>EduTrack</span>
        </Link>
        <h1>Bem-vindo de volta</h1>
        <p>
          Acompanhe o percurso escolar dos seus educandos com clareza, dados em
          tempo real e alertas inteligentes.
        </p>
        <ul className="login-bullets">
          <li>Notas e frequência sempre atualizadas</li>
          <li>Alertas automáticos de desempenho</li>
          <li>Relatórios detalhados por trimestre</li>
        </ul>
      </div>

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar sessão</h2>
          <p className="login-form-sub">
            Selecione o seu perfil e introduza as credenciais.
          </p>

          {/* Exibição de Erros */}
          {errorMsg && (
            <div className="login-error-badge" style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', border: '1px solid #fee2e2' }}>
              {errorMsg}
            </div>
          )}

          <div className="login-tabs">
            {[
              { id: "gestor", label: "Administrador" }, // Alterado id de "admin" para "gestor"
              { id: "professor", label: "Professor" },
              { id: "encarregado", label: "Encarregado" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={loading}
                onClick={() => setPerfil(p.id)}
                className={"login-tab" + (perfil === p.id ? " is-active" : "")}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="login-field">
            <label className="label">Email</label>
            <div className="login-input">
              <Mail size={16} />
              <input
                type="email"
                className="input"
                placeholder="seu@email.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label className="label">Palavra-passe</label>
            <div className="login-input">
              <Lock size={16} />
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="login-forgot">
            <Link to="/recuperar-senha">Esqueceu a senha?</Link>
          </div>

          <button type="submit" className="btn btn-hero btn-block" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 size={16} className="animate-spin" /> Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>

          <div className="login-foot">
            <Link to="/">Voltar à página inicial</Link>
          </div>
        </form>
      </div>
    </div>
  );
}