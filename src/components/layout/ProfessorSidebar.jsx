import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  FileCheck,
  Star,
  GraduationCap,
} from 'lucide-react';
import '../../styles/AdminSidebar.css';

const links = [
  { to: "/professor",               label: "Dashboard",    icon: LayoutDashboard, end: true },
  { to: "/professor/presencas",     label: "Presenças",    icon: ClipboardList },
  { to: "/professor/tarefas/criar",       label: "Tarefas",      icon: BookOpen },
  { to: "/professor/submissoes/criar",    label: "Submissões",   icon: FileCheck },
  { to: "/professor/notas/lancar",         label: "Notas",        icon: Star },
];

export default function ProfessorSidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <GraduationCap size={22} />
        </div>
        <div>
          <div className="sidebar-brand-name">EduTrack</div>
          <div className="sidebar-brand-sub">Professor</div>
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
          <strong>Área do professor:</strong> gira presenças, tarefas,
          submissões e notas dos seus alunos.
        </div>
      </div>
    </aside>
  );
}
