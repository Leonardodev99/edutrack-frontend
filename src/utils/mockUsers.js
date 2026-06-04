// Mock data para Users e Profiles
let _userId = 100;
let _alunoId = 1000;
let _professorId = 1000;
let _encarregadoId = 1000;

const nextUserId = () => ++_userId;
const nextAlunoId = () => ++_alunoId;
const nextProfessorId = () => ++_professorId;
const nextEncarregadoId = () => ++_encarregadoId;

// Usuários base
export const users = [
  { id: 1, nome: "João Pedro Silva", email: "joao.silva@edutrack.pt", senha: "senha123", tipo: "aluno", criado_em: "2024-01-15" },
  { id: 2, nome: "Mariana Ferreira", email: "mariana.ferreira@edutrack.pt", senha: "senha123", tipo: "aluno", criado_em: "2024-01-16" },
  { id: 3, nome: "Mário Tavares", email: "mario.tavares@edutrack.pt", senha: "senha123", tipo: "professor", criado_em: "2024-01-10" },
  { id: 4, nome: "Ana Maria Costa", email: "ana.costa@edutrack.pt", senha: "senha123", tipo: "encarregado", criado_em: "2024-01-12" },
];

// Perfis de Alunos
export const alunos = [
  { id: 1, user_id: 1, matricula: "ALU-2024-001", curso: "Ensino Secundário", ano_ingresso: 2022 },
  { id: 2, user_id: 2, matricula: "ALU-2024-002", curso: "Ensino Secundário", ano_ingresso: 2023 },
];

// Perfis de Professores
export const professores = [
  { id: 1, user_id: 3, matricula: "PROF-2024-001", departamento: "Ciências Exatas", disciplinas: "Matemática" },
];

// Perfis de Encarregados
export const encarregados = [
  { id: 1, user_id: 4, matricula: "ENC-2024-001", telefone: "961 100 200", telefonePrincipal: "", estudantes: [1, 2] },
];

// Funções auxiliares para criar stores
function makeUserStore(arr) {
  return {
    list: () => [...arr],
    get: (id) => arr.find((x) => x.id === id) || null,
    getByEmail: (email) => arr.find((x) => x.email === email) || null,
    create: (data) => {
      const item = { id: nextUserId(), ...data, criado_em: new Date().toISOString().split('T')[0] };
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

function makeProfileStore(arr, nextIdFunc) {
  return {
    list: () => [...arr],
    get: (id) => arr.find((x) => x.id === id) || null,
    getByUserId: (user_id) => arr.find((x) => x.user_id === user_id) || null,
    create: (data) => {
      const item = { id: nextIdFunc(), ...data };
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

export const usersStore = makeUserStore(users);
export const alunosStore = makeProfileStore(alunos, nextAlunoId);
export const professoresStore = makeProfileStore(professores, nextProfessorId);
export const encarregadosStore = makeProfileStore(encarregados, nextEncarregadoId);

// ========================================
// FUNÇÕES DE VALIDAÇÃO
// ========================================

export function verificarEmailExistente(email) {
  return users.some((u) => u.email === email);
}

// ========================================
// FUNÇÕES PARA GERAR MATRÍCULAS
// ========================================

export function gerarMatricula() {
  const ano = new Date().getFullYear();
  const numero = String(alunosStore.list().length + 1).padStart(3, '0');
  return `ALU-${ano}-${numero}`;
}

export function gerarMatriculaProfessor() {
  const ano = new Date().getFullYear();
  const numero = String(professoresStore.list().length + 1).padStart(3, '0');
  return `PROF-${ano}-${numero}`;
}

export function gerarMatriculaEncarregado() {
  const ano = new Date().getFullYear();
  const numero = String(encarregadosStore.list().length + 1).padStart(3, '0');
  return `ENC-${ano}-${numero}`;
}

// ========================================
// FUNÇÕES PARA CRIAR PERFIS
// ========================================

export function criarAluno(userData, alunoData) {
  // Verifica se email já existe
  if (verificarEmailExistente(userData.email)) {
    return { sucesso: false, erro: "Email já registado no sistema" };
  }

  // Cria usuário
  const novoUser = usersStore.create({
    nome: userData.nome,
    email: userData.email,
    senha: userData.senha,
    tipo: "aluno",
  });

  if (!novoUser) {
    return { sucesso: false, erro: "Erro ao criar usuário" };
  }

  // Cria perfil de aluno
  const novoAluno = alunosStore.create({
    user_id: novoUser.id,
    matricula: alunoData.matricula,
    curso: alunoData.curso,
    ano_ingresso: parseInt(alunoData.ano_ingresso),
  });

  return {
    sucesso: true,
    user: novoUser,
    aluno: novoAluno,
  };
}

export function criarProfessor(userData, professorData) {
  // Verifica se email já existe
  if (verificarEmailExistente(userData.email)) {
    return { sucesso: false, erro: "Email já registado no sistema" };
  }

  // Cria usuário
  const novoUser = usersStore.create({
    nome: userData.nome,
    email: userData.email,
    senha: userData.senha,
    tipo: "professor",
  });

  if (!novoUser) {
    return { sucesso: false, erro: "Erro ao criar usuário" };
  }

  // Cria perfil de professor
  const novoProfessor = professoresStore.create({
    user_id: novoUser.id,
    matricula: professorData.matricula,
    departamento: professorData.departamento,
    disciplinas: professorData.disciplinas.join(", "), // Converte array em string
  });

  return {
    sucesso: true,
    user: novoUser,
    professor: novoProfessor,
  };
}

export function criarEncarregado(userData, encarregadoData) {
  // Verifica se email já existe
  if (verificarEmailExistente(userData.email)) {
    return { sucesso: false, erro: "Email já registado no sistema" };
  }

  // Cria usuário
  const novoUser = usersStore.create({
    nome: userData.nome,
    email: userData.email,
    senha: userData.senha,
    tipo: "encarregado",
  });

  if (!novoUser) {
    return { sucesso: false, erro: "Erro ao criar usuário" };
  }

  // Cria perfil de encarregado
  const novoEncarregado = encarregadosStore.create({
    user_id: novoUser.id,
    matricula: encarregadoData.matricula,
    telefone: encarregadoData.telefone,
    telefonePrincipal: encarregadoData.telefonePrincipal || "",
    estudantes: encarregadoData.estudantes,
  });

  return {
    sucesso: true,
    user: novoUser,
    encarregado: novoEncarregado,
  };
}