import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BarChart3,
  Bell,
  Users,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import '../styles/Landing.css';

const features = [
  {
    icon: BarChart3,
    title: "Análise Inteligente",
    desc: "Identifica automaticamente as disciplinas com maior dificuldade através de gráficos claros.",
  },
  {
    icon: Bell,
    title: "Alertas em Tempo Real",
    desc: "Encarregados recebem notificações sobre notas, faltas e progresso académico.",
  },
  {
    icon: Users,
    title: "Comunicação Escola–Família",
    desc: "Aproxima professores, alunos e encarregados num único espaço integrado.",
  },
  {
    icon: ShieldCheck,
    title: "Dados Seguros",
    desc: "Cada perfil acede apenas à informação relevante, com privacidade garantida.",
  },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-brand">
          <div className="landing-brand-logo">
            <GraduationCap size={22} />
          </div>
          <span>EduTrack</span>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn btn-ghost">
            Entrar
          </Link>
          <Link to="/login" className="btn btn-primary">
            Aceder ao sistema
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <span className="hero-pill">Sistema de acompanhamento académico</span>
          <h1 className="hero-title">
            Acompanhe o desempenho escolar com{" "}
            <span className="hero-highlight">clareza e proximidade</span>
          </h1>
          <p className="hero-subtitle">
            O EduTrack regista avaliações, identifica disciplinas críticas e
            mantém os encarregados de educação informados sobre cada passo do
            percurso académico.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="btn btn-hero">
              Ver demonstração <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline">
              Iniciar sessão
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <strong>+1200</strong>
              <span>alunos acompanhados</span>
            </div>
            <div>
              <strong>98%</strong>
              <span>satisfação das famílias</span>
            </div>
            <div>
              <strong>3 perfis</strong>
              <span>admin, professor, encarregado</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card hero-card-1">
            <div className="hero-card-label">Média do trimestre</div>
            <div className="hero-card-value">14.2</div>
            <div className="hero-card-bar">
              <span style={{ width: "72%" }} />
            </div>
          </div>
          <div className="hero-card hero-card-2">
            <div className="hero-card-label">Frequência</div>
            <div className="hero-card-value">92%</div>
            <div className="hero-card-trend">+4% vs trimestre anterior</div>
          </div>
          <div className="hero-card hero-card-3">
            <div className="hero-card-label">Disciplinas críticas</div>
            <div className="hero-card-pill">Matemática</div>
            <div className="hero-card-pill">Física</div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-head">
          <h2>Tudo o que precisa para acompanhar o percurso escolar</h2>
          <p>
            Uma plataforma desenhada para professores, encarregados de educação e
            administradores escolares.
          </p>
        </div>
        <div className="features-grid">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feature">
              <div className="feature-icon">
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} EduTrack — Acompanhamento Académico</span>
      </footer>
    </div>
  );
}