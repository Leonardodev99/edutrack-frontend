// Mock data + helpers CRUD em memória para o painel de administração.
let _id = 1000;
const nextId = (prefix) => `${prefix}-${++_id}`;

export const professores = [
  { id: "p-1", nome: "Mário Tavares", email: "mario.tavares@edutrack.pt", telefone: "912 345 678", disciplina: "Matemática", estado: "ativo" },
  { id: "p-2", nome: "Helena Ribeiro", email: "helena.ribeiro@edutrack.pt", telefone: "913 222 110", disciplina: "Português", estado: "ativo" },
  { id: "p-3", nome: "Rui Mendes", email: "rui.mendes@edutrack.pt", telefone: "914 887 220", disciplina: "Física", estado: "ativo" },
];

export const encarregados = [
  { id: "e-1", nome: "Ana Maria Costa", email: "ana.costa@edutrack.pt", telefone: "961 100 200", parentesco: "Mãe" },
  { id: "e-2", nome: "Carlos Ferreira", email: "carlos.ferreira@edutrack.pt", telefone: "962 300 400", parentesco: "Pai" },
  { id: "e-3", nome: "Sofia Almeida", email: "sofia.almeida@edutrack.pt", telefone: "963 500 600", parentesco: "Mãe" },
];

export const turmas = [
  { id: "t-1", nome: "10º A", ano_letivo: "2024/2025", sala: "A1", curso: "Ensino Secundário", teacher_id: 1, alunos: ["a-1", "a-2"], codigo: "TUR-2024-001", criado_em: "2024-01-10" },
  { id: "t-2", nome: "10º B", ano_letivo: "2024/2025", sala: "B2", curso: "Ensino Secundário", teacher_id: 1, alunos: ["a-3"], codigo: "TUR-2024-002", criado_em: "2024-01-11" },
  { id: "t-3", nome: "11º A", ano_letivo: "2024/2025", sala: "A3", curso: "Ensino Secundário", teacher_id: 1, alunos: [], codigo: "TUR-2024-003", criado_em: "2024-01-12" },
];

export const alunosAdmin = [
  { id: "a-1", nome: "João Pedro Silva", email: "joao.silva@edutrack.pt", dataNasc: "2008-05-12", turmaId: "t-1", encarregadoId: "e-1" },
  { id: "a-2", nome: "Mariana Ferreira", email: "mariana.ferreira@edutrack.pt", dataNasc: "2008-09-30", turmaId: "t-1", encarregadoId: "e-2" },
  { id: "a-3", nome: "Tiago Almeida", email: "tiago.almeida@edutrack.pt", dataNasc: "2009-02-18", turmaId: "t-2", encarregadoId: "e-3" },
];

function makeStore(arr, prefix) {
  return {
    list: () => [...arr],
    get: (id) => arr.find((x) => x.id === id) || null,
    create: (data) => { 
      const item = { id: nextId(prefix), ...data }; 
      arr.push(item); 
      return item; 
    },
    update: (id, data) => {
      const i = arr.findIndex((x) => x.id === id);
      if (i === -1) return null;
      arr[i] = { ...arr[i], ...data, id };
      return arr[i];
    },
    remove: (id) => {
      const i = arr.findIndex((x) => x.id === id);
      if (i === -1) return false;
      arr.splice(i, 1);
      return true;
    },
  };
}

export const professoresStore = makeStore(professores, "p");
export const encarregadosStore = makeStore(encarregados, "e");
export const turmasStore = makeStore(turmas, "t");
export const alunosStore = makeStore(alunosAdmin, "a");

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

export function matricularAluno(turmaId, alunoId) {
  const turma = turmas.find((t) => t.id === turmaId);
  const aluno = alunosAdmin.find((a) => a.id === alunoId);
  if (!turma || !aluno) return false;
  turmas.forEach((t) => { t.alunos = t.alunos.filter((id) => id !== alunoId); });
  turma.alunos.push(alunoId);
  aluno.turmaId = turmaId;
  return true;
}

export function desmatricularAluno(alunoId) {
  turmas.forEach((t) => { t.alunos = t.alunos.filter((id) => id !== alunoId); });
  const aluno = alunosAdmin.find((a) => a.id === alunoId);
  if (aluno) aluno.turmaId = null;
}

export const nomeEncarregado = (id) => encarregados.find((e) => e.id === id)?.nome || "—";
export const nomeTurma = (id) => turmas.find((t) => t.id === id)?.nome || "—";
export const nomeProfessor = (id) => professores.find((p) => p.id === id)?.nome || "—";

// ========================================
// FUNÇÕES PARA TURMAS
// ========================================

export function gerarCodigoTurma() {
  const ano = new Date().getFullYear();
  const numero = String(turmasStore.list().length + 1).padStart(3, '0');
  return `TUR-${ano}-${numero}`;
}

export function criarTurma(turmaData) {
  // Verifica se o nome da turma já existe para o mesmo ano letivo
  const turmaExistente = turmasStore.list().find(
    (t) =>
      t.nome.toLowerCase() === turmaData.nome.toLowerCase() &&
      t.ano_letivo === turmaData.ano_letivo
  );

  if (turmaExistente) {
    return {
      sucesso: false,
      erro: "Já existe uma turma com este nome neste ano letivo",
    };
  }

  // Cria turma
  const novaTurma = turmasStore.create({
    nome: turmaData.nome,
    ano_letivo: turmaData.ano_letivo,
    curso: turmaData.curso,
    teacher_id: parseInt(turmaData.teacher_id),
    codigo: turmaData.codigo,
    alunos: [],
    criado_em: new Date().toISOString().split('T')[0],
  });

  return {
    sucesso: true,
    turma: novaTurma,
  };
}

export function adicionarAlunoTurma(turmaId, alunoId) {
  const turma = turmasStore.get(turmaId);
  if (!turma) {
    return { sucesso: false, erro: "Turma não encontrada" };
  }

  if (turma.alunos.includes(alunoId)) {
    return { sucesso: false, erro: "Aluno já está nesta turma" };
  }

  turmasStore.update(turmaId, {
    alunos: [...turma.alunos, alunoId],
  });

  return { sucesso: true };
}

export function removerAlunoTurma(turmaId, alunoId) {
  const turma = turmasStore.get(turmaId);
  if (!turma) {
    return { sucesso: false, erro: "Turma não encontrada" };
  }

  turmasStore.update(turmaId, {
    alunos: turma.alunos.filter((id) => id !== alunoId),
  });

  return { sucesso: true };
}