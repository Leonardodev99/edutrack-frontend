
// funcionalidades futuras:
import { turmasStore } from "./adminMockData";

export function obterTurmasPorCurso(curso) {
  return turmasStore.list().filter((t) => t.curso === curso);
}

export function obterTurmasPorAnoLetivo(anoLetivo) {
  return turmasStore.list().filter((t) => t.ano_letivo === anoLetivo);
}

export function obterTurmasPorProfessor(teacherId) {
  return turmasStore.list().filter((t) => t.teacher_id === teacherId);
}

export function obterAlunosDaTurma(turmaId) {
  const turma = turmasStore.get(turmaId);
  return turma?.alunos || [];
}

export function contarAlunosTurma(turmaId) {
  return turmasStore.get(turmaId)?.alunos.length || 0;
}