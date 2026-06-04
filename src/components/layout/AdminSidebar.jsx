import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserSquare2,
  School,
  ShieldCheck,
  Clock
} from 'lucide-react';
import '../../styles/AdminSidebar.css'

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/professor/criar", label: "Cadastrar Professor", icon: UserSquare2 },
  { to: "/admin/encarregados/criar", label: "Cadastrar Encarregado", icon: Users },
  { to: "/admin/aluno/criar", label: "Cadastrar Aluno", icon: GraduationCap },
  { to: "/admin/turmas/criar", label: "Cadastrar Turmas", icon: School },
  { to: "/admin/horarios/criar", label: "Criar Horários", icon: Clock },
];

export default function AdminSidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <ShieldCheck size={22} />
        </div>
        <div>
          <div className="sidebar-brand-name">EduTrack</div>
          <div className="sidebar-brand-sub">Administração</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " is-active" : "")
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-tip">
          <strong>Painel admin:</strong> faça a gestão completa de utilizadores
          e turmas da escola.
        </div>
      </div>
    </aside>
  );
}