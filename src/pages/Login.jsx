import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock } from "lucide-react";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState("professor", "encarregado");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    
    // Redireciona para /admin se o perfil for admin
    if (perfil === "admin") {
      navigate("/admin");
    } else if(perfil === "professor") {
      navigate("/professor");
    } else {
      navigate("/encarregado");
    }

    /*   // Redireciona para /professor se o perfil for professor
    if (perfil === "professor") {
      navigate("/professor/");
    } else {
      navigate("/professor/dashboardteacher");
    }*/
  
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

          <div className="login-tabs">
            {[
              { id: "admin", label: "Administrador" },
              { id: "professor", label: "Professor" },
              { id: "encarregado", label: "Encarregado" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
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
                required
              />
            </div>
          </div>

          <div className="login-forgot">
            <Link to="/recuperar-senha">Esqueceu a senha?</Link>
          </div>

          <button type="submit" className="btn btn-hero btn-block">
            Entrar
          </button>

          <div className="login-foot">
            <Link to="/">Voltar à página inicial</Link>
          </div>
        </form>
      </div>
    </div>
  );
}