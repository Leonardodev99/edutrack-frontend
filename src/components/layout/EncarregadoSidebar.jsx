import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  FileSpreadsheet,
  LineChart,
  GraduationCap,
} from 'lucide-react';
import '../../styles/AdminSidebar.css'; // Reutiliza a estrutura de layout e cores da Sidebar

const linksEncarregado = [
  { to: "/encarregado", label: "Painel Geral", icon: LayoutDashboard, end: true },
  { to: "/encarregado/presencas", label: "Comparência", icon: UserCheck },
  { to: "/encarregado/boletim", label: "Boletim de Notas", icon: FileSpreadsheet },
  { to: "/encarregado/desempenho", label: "Desempenho", icon: LineChart },
];

export default function EncarregadoSidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <GraduationCap size={22} />
        </div>
        <div>
          <div className="sidebar-brand-name">EduTrack</div>
          <div className="sidebar-brand-sub">Encarregado</div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {linksEncarregado.map(({ to, label, icon: Icon, end }) => (
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
          <strong>Acompanhamento:</strong> Consulte o aproveitamento escolar, faltas e métricas pedagógicas do seu educando.
        </div>
      </div>
    </aside>
  );
}