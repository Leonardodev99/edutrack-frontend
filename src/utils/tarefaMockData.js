// Mock data + helpers CRUD em memória para a gestão de Tarefas Escolares.
let _id = 2000;
const nextId = (prefix) => `${prefix}-${++_id}`;

// Reutilização da lista de professores para consistência e validações cruzadas
export const professoresMock = [
  { id: "p-1", nome: "Mário Tavares", materia: "Matemática" },
  { id: "p-2", nome: "Helena Ribeiro", materia: "Português" },
  { id: "p-3", nome: "Rui Mendes", materia: "Física" },
];

// Dados iniciais de tarefas de exemplo
export const tarefas = [
  {
    id: "tar-2001",
    title: "Ficha de Trabalho: Equações do 2º Grau",
    description: "Resolver os exercícios de 1 a 10 da página 45 do manual escolar. Enviar em formato PDF.",
    deadline: "2026-06-05",
    teacher_id: "p-1",
    criado_em: "2026-05-20",
    estado: "publicada"
  },
  {
    id: "tar-2002",
    title: "Análise Textual: Os Lusíadas",
    description: "Leitura do Canto III e redação de um texto dissertativo-argumentativo (300 a 500 palavras) sobre o episódio de Inês de Castro.",
    deadline: "2026-06-12",
    teacher_id: "p-2",
    criado_em: "2026-05-22",
    estado: "publicada"
  }
];

// Fábrica de Store genérica idêntica ao padrão usado no sistema
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

// Stores Exportadas
export const tarefasStore = makeStore(tarefas, "tar");

// Mock da store de professores necessária para o componente renderizar a listagem no Passo 2
export const professoresStore = {
  list: () => [...professoresMock],
  get: (id) => professoresMock.find((p) => p.id === id) || null,
};

// ========================================
// FUNÇÕES UTILITÁRIAS / CRUD EXPANDIDO
// ========================================

/**
 * Cadastra uma nova tarefa no sistema após realizar as validações de consistência.
 * @param {Object} tarefaData - Dados vindos do formulário (title, description, deadline, teacher_id)
 * @returns {Object|boolean} Retorna o objeto criado se houver sucesso, ou false se falhar.
 */
export function cadastrarTarefa(tarefaData) {
  if (!tarefaData.title || !tarefaData.description || !tarefaData.deadline || !tarefaData.teacher_id) {
    return false;
  }

  // Verifica se o professor associado realmente existe na base
  const professorExiste = professoresStore.get(tarefaData.teacher_id);
  if (!professorExiste) {
    return false;
  }

  // Insere metadados operacionais e salva na memória
  const novaTarefa = tarefasStore.create({
    title: tarefaData.title.trim(),
    description: tarefaData.description.trim(),
    deadline: tarefaData.deadline,
    teacher_id: tarefaData.teacher_id,
    criado_em: new Date().toISOString().split('T')[0],
    estado: "publicada" // padrão inicial
  });

  return novaTarefa;
}

/**
 * Retorna o nome do professor responsável com base no ID fornecido.
 */
export const obterNomeProfessorResponsavel = (teacherId) => {
  return professoresMock.find((p) => p.id === teacherId)?.nome || "Professor Não Atribuído";
};

/**
 * Retorna uma lista de tarefas filtradas por um determinado professor.
 */
export function listarTarefasPorProfessor(teacherId) {
  return tarefas.filter((t) => t.teacher_id === teacherId);
}

/**
 * Verifica se uma tarefa está atrasada com base na data atual do sistema.
 */
export function verificarTarefaExpirada(tarefaId) {
  const tarefa = tarefasStore.get(tarefaId);
  if (!tarefa) return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prazo = new Date(tarefa.deadline);

  return prazo < hoje;
}