import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "../services/api.js";
import "../styles/ForgetPassword.css";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await api.post("/passwords/forgot", { email });
      setEnviado(true);
    } catch (error) {
      const mensagem =
        error.response?.data?.error ||
        "Erro ao enviar o link. Tente novamente.";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  function handleTentarNovamente() {
    setEnviado(false);
    setErro("");
  }

  return (
    <div className="forget-page">
      <div className="forget-side">
        <Link to="/" className="forget-brand">
          <div className="forget-brand-logo">
            <GraduationCap size={22} />
          </div>
          <span>EduTrack</span>
        </Link>
        <h1>Recuperar acesso</h1>
        <p>
          Não se preocupe. Enviamos-lhe um link seguro para redefinir a sua
          palavra-passe em poucos segundos.
        </p>
        <ul className="forget-bullets">
          <li>Processo rápido e seguro</li>
          <li>Link válido por 30 minutos</li>
          <li>Suporte disponível se precisar de ajuda</li>
        </ul>
      </div>

      <div className="forget-form-wrap">
        <form className="forget-form" onSubmit={handleSubmit}>
          <Link to="/login" className="forget-back">
            <ArrowLeft size={16} />
            <span>Voltar ao login</span>
          </Link>

          {!enviado ? (
            <>
              <h2>Esqueceu a sua palavra-passe?</h2>
              <p className="forget-form-sub">
                Introduza o email associado à sua conta e enviaremos um link
                para criar uma nova palavra-passe.
              </p>

              <div className="forget-field">
                <label className="label">Email</label>
                <div className="forget-input">
                  <Mail size={16} />
                  <input
                    type="email"
                    className="input"
                    placeholder="seu@email.pt"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={carregando}
                  />
                </div>
              </div>

              {erro && <div className="alert alert-danger">{erro}</div>}

              <button
                type="submit"
                className="btn btn-hero btn-block"
                disabled={carregando}
              >
                {carregando ? "A enviar..." : "Enviar link de recuperação"}
              </button>

              <div className="forget-foot">
                Lembrou-se da palavra-passe?{" "}
                <Link to="/login">Iniciar sessão</Link>
              </div>
            </>
          ) : (
            <div className="forget-success">
              <div className="forget-success-icon">
                <CheckCircle2 size={36} />
              </div>
              <h2>Verifique o seu email</h2>
              <p className="forget-form-sub">
                Enviámos um link de recuperação para <strong>{email}</strong>.
                Verifique a sua caixa de entrada e siga as instruções.
              </p>
              <Link to="/login" className="btn btn-hero btn-block">
                Voltar ao login
              </Link>
              <div className="forget-foot">
                Não recebeu o email?{" "}
                <button
                  type="button"
                  className="forget-resend"
                  onClick={handleTentarNovamente}
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
