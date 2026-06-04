let _horarioId = 1000;
const nextHorarioId = () => ++_horarioId;

// Horários iniciais
export const horarios = [
  {
    id: "h-1",
    class_id: "t-1",
    teacher_id: 1,
    disciplina: "Matemática",
    dia_semana: "Segunda-feira",
    hora_inicio: "08:00",
    hora_fim: "09:00",
    sala: "A1",
    codigo: "HOR-2024-001",
    criado_em: "2024-01-10",
  },
  {
    id: "h-2",
    class_id: "t-1",
    teacher_id: 1,
    disciplina: "Física",
    dia_semana: "Terça-feira",
    hora_inicio: "10:00",
    hora_fim: "11:00",
    sala: "A1",
    codigo: "HOR-2024-002",
    criado_em: "2024-01-11",
  },
];

// Store de Horários
function makeHorarioStore(arr) {
  return {
    list: () => [...arr],
    get: (id) => arr.find((x) => x.id === id) || null,
    getByTurmaAndDia: (turmaId, dia) =>
      arr.filter((x) => x.class_id === turmaId && x.dia_semana === dia),
    create: (data) => {
      const item = { id: `h-${nextHorarioId()}`, ...data };
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

export const horariosStore = makeHorarioStore(horarios);

// Função para gerar código único
export function gerarCodigoHorario() {
  const ano = new Date().getFullYear();
  const numero = String(horariosStore.list().length + 1).padStart(3, "0");
  return `HOR-${ano}-${numero}`;
}

// Criar horário
export function criarHorario(horarioData) {
  // Verifica se já existe horário no mesmo dia/hora/sala
  const horarioExistente = horariosStore.list().find(
    (h) =>
      h.dia_semana === horarioData.dia_semana &&
      h.sala === horarioData.sala &&
      ((horarioData.hora_inicio >= h.hora_inicio &&
        horarioData.hora_inicio < h.hora_fim) ||
        (horarioData.hora_fim > h.hora_inicio &&
          horarioData.hora_fim <= h.hora_fim))
  );

  if (horarioExistente) {
    return {
      sucesso: false,
      erro: "Já existe um horário nesta sala e horário",
    };
  }

  // Verifica se professor já tem aula no mesmo horário
  const professorOcupado = horariosStore.list().find(
    (h) =>
      h.teacher_id == horarioData.teacher_id &&
      h.dia_semana === horarioData.dia_semana &&
      ((horarioData.hora_inicio >= h.hora_inicio &&
        horarioData.hora_inicio < h.hora_fim) ||
        (horarioData.hora_fim > h.hora_inicio &&
          horarioData.hora_fim <= h.hora_fim))
  );

  if (professorOcupado) {
    return {
      sucesso: false,
      erro: "Professor já tem uma aula neste horário",
    };
  }

  // Cria horário
  const novoHorario = horariosStore.create({
    class_id: horarioData.class_id,
    teacher_id: parseInt(horarioData.teacher_id),
    disciplina: horarioData.disciplina,
    dia_semana: horarioData.dia_semana,
    hora_inicio: horarioData.hora_inicio,
    hora_fim: horarioData.hora_fim,
    sala: horarioData.sala.toUpperCase(),
    codigo: horarioData.codigo,
    criado_em: new Date().toISOString().split("T")[0],
  });

  return {
    sucesso: true,
    horario: novoHorario,
  };
}

// Obter horários da turma
export function obterHorariosTurma(turmaId) {
  return horariosStore.list().filter((h) => h.class_id === turmaId);
}

// Obter horários do professor
export function obterHorariosProfessor(professorId) {
  return horariosStore.list().filter((h) => h.teacher_id === professorId);
}

// Verificar conflito de horário
export function verificarConflitoHorario(turmaId, dia, horaInicio, horaFim) {
  return horariosStore.list().some((h) => {
    if (h.class_id !== turmaId || h.dia_semana !== dia) return false;

    return (
      (horaInicio >= h.hora_inicio && horaInicio < h.hora_fim) ||
      (horaFim > h.hora_inicio && horaFim <= h.hora_fim)
    );
  });
}