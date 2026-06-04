// Mock data + helpers CRUD em memória para a gestão de Submissões de Tarefas.
let _id = 3000;
const nextId = (prefix) => `${prefix}-${++_id}`;

// Massa de dados inicial para testes
export const submissoes = [
  {
    id: "sub-3001",
    task_id: "tar-2001",    // ID da tarefa correspondente
    student_id: "a-1",      // ID do estudante (João Pedro Silva)
    content: "Segue em anexo a resolução dos exercícios de equações quadráticas. Fiquei com uma pequena dúvida na questão 7, mas cheguei a um resultado.",
    file_url: "https://drive.google.com/file/d/1x2y3z4_resolucao_joao/view",
    entregue_em: "2026-05-24",
    status: "pendente",     // avaliado | pendente
    nota: null,
    feedback_professor: ""
  },
  {
    id: "sub-3002",
    task_id: "tar-2002",    // ID da tarefa correspondente
    student_id: "a-2",      // ID da estudante (Mariana Ferreira)
    content: "Professor, enviei o ensaio em PDF com a análise completa do Canto III. Aguardo o feedback.",
    file_url: "https://github.com/marianaferreira/edutrack-docs/raw/main/lusiadas_canto3.pdf",
    entregue_em: "2026-05-25",
    status: "avaliado",
    nota: 18,               // Escala 0-20
    feedback_professor: "Excelente análise crítica e ótima estrutura gramatical. Parabéns!"
  }
];

// Fábrica de Store genérica idêntica ao ecossistema do projeto
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

// Store Exportada para operações base
export const submissoesStore = makeStore(submissoes, "sub");

// ========================================
// FUNÇÕES UTILITÁRIAS / REGRAS DE NEGÓCIO
// ========================================

/**
 * Cria e valida o envio de uma nova submissão por parte do aluno.
 * @param {Object} submissaoData - Objeto contendo { task_id, student_id, content, file_url }
 * @returns {Object|null} Retorna a submissão criada ou null caso falte algum dado obrigatório.
 */
export function cadastrarSubmissao(submissaoData) {
  const { task_id, student_id, content, file_url } = submissaoData;

  // Validação estrita de presença dos campos solicitados
  if (!task_id || !student_id || !content.trim() || !file_url.trim()) {
    return null;
  }

  // Verifica se o aluno já enviou uma resposta para esta mesma tarefa
  // (Evita duplicidade caso a regra de negócio exija envio único)
  const jaSubmetido = submissoes.some(
    (s) => s.task_id === task_id && s.student_id === student_id
  );
  
  if (jaSubmetido) {
    // Se já existir, podemos atualizar o envio existente ou bloquear.
    // Para este fluxo, vamos atualizar o envio anterior substituindo os dados.
    const submissaoExistente = submissoes.find(
      (s) => s.task_id === task_id && s.student_id === student_id
    );
    
    return submissoesStore.update(submissaoExistente.id, {
      content: content.trim(),
      file_url: file_url.trim(),
      entregue_em: new Date().toISOString().split('T')[0],
      status: "pendente" // Retorna para análise do professor se for redefinido
    });
  }

  // Adiciona a nova submissão ao array global através da store
  const novaSubmissao = submissoesStore.create({
    task_id,
    student_id,
    content: content.trim(),
    file_url: file_url.trim(),
    entregue_em: new Date().toISOString().split('T')[0],
    status: "pendente",
    nota: null,
    feedback_professor: ""
  });

  return novaSubmissao;
}

/**
 * Filtra a listagem de submissões feitas por um aluno específico.
 */
export function listarSubmissoesPorAluno(studentId) {
  return submissoes.filter((s) => s.student_id === studentId);
}

/**
 * Filtra submissões recebidas em uma determinada tarefa (Visão do Professor).
 */
export function listarSubmissoesPorTarefa(taskId) {
  return submissoes.filter((s) => s.task_id === taskId);
}

/**
 * Aplica nota e feedback pedagógico a uma submissão recebida.
 * @param {string} submissaoId - ID único do registro de entrega.
 * @param {number} nota - Valor numérico atribuído ao trabalho.
 * @param {string} feedback - Comentário descritivo de correção.
 */
export function avaliarSubmissao(submissaoId, nota, feedback) {
  const submissao = submissoesStore.get(submissaoId);
  if (!submissao) return false;

  return submissoesStore.update(submissaoId, {
    status: "avaliado",
    nota: Number(nota),
    feedback_professor: feedback.trim()
  });
}