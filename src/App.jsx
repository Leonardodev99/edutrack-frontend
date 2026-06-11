import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ForgetPassword from './pages/ForgetPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';


import AdminLayout from './components/layout/AdminLayout.jsx';
import DashboardAdmin from './pages/admin/DashboardAdmin.jsx';
import CriarAluno from './pages/admin/CriarAluno.jsx';
import ListarAlunos from './pages/admin/ListarAlunos.jsx';
import CriarProfessor from './pages/admin/CriarProfessor.jsx';
import ListarProfessores from './pages/admin/ListarProfessores.jsx';
import CriarEncarregado from './pages/admin/CriarEncarregado.jsx';
import ListarEncarregados from './pages/admin/ListarEncarregados.jsx';
import CriarTurma from './pages/admin/CriarTurma.jsx';
import ListarTurmas from './pages/admin/ListarTurmas.jsx';
import MatricularAluno from './pages/admin/MatricularAluno.jsx';
import CriarHorario from './pages/admin/CriarHorario.jsx';
import ListarHorarios from './pages/admin/ListarHorarios.jsx';
import PerfilAdmin from './pages/admin/PerfilAdmin.jsx';

import ProfessorLayout from './components/layout/ProfessorLayout.jsx';
import DashboardProfessor from './pages/professor/Dashboardprofessor.jsx';
import CadastrarTarefa from './pages/professor/CadastrarTarefa.jsx';
import CadastrarSubmissao from './pages/professor/CadastrarSubmissao.jsx';
import LancarNota from './pages/professor/LancarNota.jsx';
import MarcarPresenca from './pages/professor/MarcarPresenca.jsx';
import PerfilProfessor from './pages/professor/PerfilProfessor.jsx';


import EncarregadoLayout from './components/layout/EncarregadoLayout.jsx';
import DashboardEncarregado from './pages/encarregado/DashboardEncarregado.jsx';
import ComparenciaEducando from './pages/encarregado/ComparenciaEducando.jsx';
import BoletimTrimestral from './pages/encarregado/BoletimTrimestral.jsx';
import DesempenhoEducando from './pages/encarregado/DesempenhoEducando.jsx';
import PerfilEncarregado from './pages/encarregado/PerfilEncarregado.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-senha" element={<ForgetPassword />} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rotas do Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardAdmin />} />
          <Route path="perfil" element={<PerfilAdmin />} />
          <Route path="/admin/aluno/criar" element={<CriarAluno />} />
          <Route path="/admin/alunos/" element={<ListarAlunos />} />
          <Route path="/admin/alunos/editar/:id" element={<CriarAluno />} />
          <Route path="/admin/matricular" element={<MatricularAluno />} />
          <Route path="/admin/professor/criar" element={<CriarProfessor />} />
          <Route path="/admin/professores" element={<ListarProfessores />} />
          <Route path="/admin/professores/editar/:id" element={<CriarProfessor />} />
          <Route path="/admin/encarregados/criar" element={<CriarEncarregado />} />
          <Route path="/admin/encarregados" element={<ListarEncarregados />} />
          <Route path="encarregados/editar/:id" element={<CriarEncarregado />} />
          <Route path="/admin/turmas/criar" element={<CriarTurma />} />
          <Route path="turmas" element={<ListarTurmas />} />
          <Route path="turmas/editar/:id" element={<CriarTurma />} />
          <Route path="/admin/horarios/criar" element={<CriarHorario />} />
          <Route path="horarios" element={<ListarHorarios />} />
          <Route path="horarios/editar/:id" element={<CriarHorario />} />
        </Route>

        {/* Rotas do Professor */}
        <Route path="/professor" element={<ProfessorLayout />}>
          <Route index element={<DashboardProfessor />} />
          <Route path="perfil" element={<PerfilProfessor />} />
          <Route path="/professor/tarefas/criar" element={<CadastrarTarefa />} />
          <Route path="/professor/submissoes/criar" element={<CadastrarSubmissao />} />
          <Route path="/professor/notas/lancar" element={<LancarNota />} />
          <Route path="presencas" element={<MarcarPresenca />} />
          
        </Route>

        {/* Rotas do Ecarregado */}
        <Route path="/encarregado" element={<EncarregadoLayout />}>
        <Route index element={<DashboardEncarregado />} />
        <Route path="/encarregado/presencas" element={<ComparenciaEducando />} />
        <Route path="/encarregado/boletim" element={<BoletimTrimestral />} />
        <Route path="/encarregado/desempenho" element={<DesempenhoEducando />} />
        <Route path="/encarregado/perfil" element={<PerfilEncarregado />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
