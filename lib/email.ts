import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM ?? "Cardio Tracker <onboarding@resend.dev>";

export function canSendEmail(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
  if (!resend) return false;
  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: "Redefinição de senha - Cardio Tracker",
    html: `
      <p>Você solicitou a redefinição de senha.</p>
      <p><a href="${resetLink}">Clique aqui para definir uma nova senha</a>.</p>
      <p>O link expira em 1 hora. Se não foi você, ignore este email.</p>
    `,
  });
  return !error;
}

export async function sendVerificationEmail(to: string, verifyLink: string): Promise<boolean> {
  if (!resend) return false;
  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: "Confirme seu email - Cardio Tracker",
    html: `
      <p>Confirme seu email para ativar sua conta.</p>
      <p><a href="${verifyLink}">Clique aqui para confirmar</a>.</p>
      <p>O link expira em 24 horas.</p>
    `,
  });
  return !error;
}
