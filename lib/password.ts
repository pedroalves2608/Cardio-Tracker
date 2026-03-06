/**
 * Validação de força de senha: mínimo 6 caracteres e pelo menos um número.
 * Mensagens de erro claras para uso em registro, alterar senha e reset.
 */

const MIN_LENGTH = 6;

export function validatePasswordStrength(password: string): { valid: boolean; error?: string } {
  if (password.length < MIN_LENGTH) {
    return {
      valid: false,
      error: `Senha deve ter pelo menos ${MIN_LENGTH} caracteres.`,
    };
  }
  if (!/\d/.test(password)) {
    return {
      valid: false,
      error: "Senha deve conter pelo menos um número.",
    };
  }
  return { valid: true };
}

export const PASSWORD_RULES = `Mínimo ${MIN_LENGTH} caracteres e pelo menos um número.`;
