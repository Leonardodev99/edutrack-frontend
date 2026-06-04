import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import "../styles/ResetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (password.length < 8) {
      setErro("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErro("As palavras-passe não coincidem.");
      return;
    }

    // Mock — sem backend
    setSucesso(true);
    setTimeout(() => navigate("/login"), 2500);
  }

  return (
    <div className="reset-page">
      <div className="reset-side">
        <Link to="/" className="reset-brand">
          <div className="reset-brand-logo">
            <GraduationCap size={22} />
          </div>
          <span>EduTrack</span>
        </Link>
        <h1>Defina uma nova palavra-passe</h1>
        <p>
          Crie uma palavra-passe forte e única para manter a sua conta protegida
          e o acesso aos dados dos seus educandos seguro.
        </p>
        <ul className="reset-bullets">
          <li>Mínimo de 8 caracteres</li>
          <li>Combine letras, números e símbolos</li>
          <li>Não reutilize palavras-passe antigas</li>
        </ul>
      </div>

      <div className="reset-form-wrap">
        <form className="reset-form" onSubmit={handleSubmit}>
          <Link to="/login" className="reset-back">
            <ArrowLeft size={16} />
            <span>Voltar ao login</span>
          </Link>

          {!sucesso ? (
            <>
              <h2>Criar nova palavra-passe</h2>
              <p className="reset-form-sub">
                Introduza e confirme a sua nova palavra-passe para concluir a
                recuperação da conta.
              </p>

              <div className="reset-field">
                <label className="label">Nova palavra-passe</label>
                <div className="reset-input">
                  <Lock size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="reset-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Mostrar palavra-passe"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="reset-field">
                <label className="label">Confirmar palavra-passe</label>
                <div className="reset-input">
                  <Lock size={16} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="reset-toggle"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label="Mostrar confirmação"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {erro && <div className="reset-error">{erro}</div>}

              <button type="submit" className="btn btn-hero btn-block">
                Redefinir palavra-passe
              </button>

              <div className="reset-foot">
                Lembrou-se da palavra-passe?{" "}
                <Link to="/login">Iniciar sessão</Link>
              </div>
            </>
          ) : (
            <div className="reset-success">
              <div className="reset-success-icon">
                <CheckCircle2 size={36} />
              </div>
              <h2>Palavra-passe alterada</h2>
              <p className="reset-form-sub">
                A sua palavra-passe foi redefinida com sucesso. Será redirecionado
                para a página de login em instantes.
              </p>
              <Link to="/login" className="btn btn-hero btn-block">
                Ir para o login
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
