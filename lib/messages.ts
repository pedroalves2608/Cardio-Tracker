/**
 * Mensagens motivacionais em PT-BR para toasts e telas.
 * Escolha aleatória quando há várias opções.
 */

const POST_WORKOUT = [
  "Treino salvo. Mais um passo!",
  "Registrado. Bora evoluir!",
  "Anotado. Você está no caminho!",
  "Treino salvo. Consistência é a chave!",
];

const GOAL_ATTAINED = [
  "Meta da semana atingida. Parabéns!",
  "Você bateu sua meta! Muito bem!",
  "Meta cumprida. Sensacional!",
];

const NEW_PR = [
  "Novo recorde! Você está evoluindo!",
  "PR batido! Parabéns pelo progresso!",
  "Novo recorde. Continue assim!",
];

const STREAK_DAYS = (n: number) => {
  if (n <= 0) return [];
  if (n === 1) return ["1 dia de treino. Começou!"];
  if (n < 7)
    return [
      `${n} dias seguidos! Mantenha o ritmo.`,
      `${n} dias sem faltar. Fogo!`,
    ];
  if (n < 14)
    return [
      `${n} dias seguidos! Você está no fogo.`,
      "1 semana sem faltar! Incrível!",
    ];
  return [
    `${n} dias seguidos! Disciplina pura.`,
    `${n} dias. Você é consistente!`,
  ];
};

const REST_DAY_SUGGESTION = [
  "Você está há muitos dias seguidos. Que tal um dia de descanso?",
  "Descanso também é treino. Considere um dia de recuperação.",
];

const GREETING_MORNING = [
  "Bom dia! Hora de mover o corpo.",
  "Bom dia! Que tal um treino?",
];

const GREETING_AFTERNOON = [
  "Boa tarde! Mantenha o foco.",
  "Boa tarde! Já treinou hoje?",
];

const GREETING_EVENING = [
  "Boa noite! Amanhã tem mais.",
  "Boa noite! Descanse bem.",
];

function pick<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getPostWorkoutMessage(): string {
  return pick(POST_WORKOUT) ?? "Treino salvo!";
}

export function getGoalAttainedMessage(): string {
  return pick(GOAL_ATTAINED) ?? "Meta da semana atingida!";
}

export function getNewPrMessage(): string {
  return pick(NEW_PR) ?? "Novo recorde!";
}

export function getStreakMessage(days: number): string {
  const options = STREAK_DAYS(days);
  return pick(options) ?? `${days} dias seguidos!`;
}

export function getRestDaySuggestion(): string {
  return pick(REST_DAY_SUGGESTION) ?? "Considere um dia de descanso.";
}

export function getGreetingMessage(): string {
  const h = new Date().getHours();
  if (h < 12) return pick(GREETING_MORNING) ?? "Bom dia!";
  if (h < 18) return pick(GREETING_AFTERNOON) ?? "Boa tarde!";
  return pick(GREETING_EVENING) ?? "Boa noite!";
}
