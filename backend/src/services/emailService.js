import nodemailer from 'nodemailer';

function buildTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  const host = SMTP_HOST || (SMTP_USER?.toLowerCase().endsWith('@gmail.com') ? 'smtp.gmail.com' : undefined);
  const port = Number(SMTP_PORT || (host === 'smtp.gmail.com' ? 465 : 587));
  const secure = SMTP_SECURE !== undefined ? SMTP_SECURE === 'true' : host === 'smtp.gmail.com';

  if (!host || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

const transporter = buildTransporter();

if (!transporter) {
  console.warn('SMTP configuration incomplete — email sending will fail if used.');
}

function getTransporterOrThrow() {
  if (!transporter) {
    throw new Error('SMTP mailer not configured. Configure SMTP_HOST, SMTP_USER and SMTP_PASS, or use Gmail with an app password.');
  }

  return transporter;
}

export async function sendVerificationEmail(toEmail, code, purpose = 'verification') {
  const from = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'contato@exemplo.com';
  const appName = process.env.APP_NAME || 'Obra Integrada';
  const subject = purpose === 'password' ? 'Código para redefinição de senha' : 'Código de verificação de cadastro';
  const actionText = purpose === 'password' ? 'redefinir sua senha' : 'confirmar seu cadastro';
  const text = `Olá,\n\nSeu código para ${actionText} é: ${code}\n\nEle expira em 15 minutos.\n\nSe você não solicitou este código, ignore esta mensagem.\n\nAtenciosamente,\n${appName}`;
  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#eef2ff;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.12);">
            <tr>
              <td style="background:#465fff;padding:28px 32px;text-align:center;color:#ffffff;">
                <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.02em;">${appName}</h1>
                <p style="margin:10px 0 0;font-size:16px;color:rgba(255,255,255,0.85);">${subject}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;">
                <p style="margin:0 0 22px;font-size:16px;line-height:1.75;color:#334155;">Olá,</p>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.75;color:#334155;">Use o código abaixo para <strong>${actionText}</strong>. Ele expira em 15 minutos.</p>
                <div style="display:inline-block;width:100%;padding:22px 0;margin:0 0 28px;text-align:center;font-size:40px;font-weight:800;letter-spacing:0.22em;color:#111827;background:#eef2ff;border:1px dashed #c7d2fe;border-radius:18px;">${code}</div>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#475569;">Se você não solicitou este código, basta ignorar este e-mail. Seu acesso continuará seguro.</p>
                <p style="margin:0;font-size:15px;line-height:1.8;color:#475569;">Atenciosamente,<br><strong>Equipe ${appName}</strong></p>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:20px 32px;text-align:center;color:#64748b;font-size:13px;">
                <p style="margin:0;">Este é um e-mail automático. Por favor, não responda diretamente.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return getTransporterOrThrow().sendMail({
    from,
    to: toEmail,
    subject,
    text,
    html,
  });
}

export async function sendPasswordResetEmail(toEmail, resetUrl) {
  const from = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'contato@exemplo.com';
  const appName = process.env.APP_NAME || 'Obra Integrada';
  const subject = 'Redefina sua senha';
  const text = `Olá,\n\nRecebemos uma solicitação para redefinir a senha da sua conta.\n\nAcesse o link abaixo para criar uma nova senha:\n${resetUrl}\n\nO link expira em 15 minutos.\n\nSe você não solicitou esta alteração, ignore este e-mail.\n\nAtenciosamente,\n${appName}`;
  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#eef2ff;color:#1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.12);">
            <tr>
              <td style="background:#465fff;padding:28px 32px;text-align:center;color:#ffffff;">
                <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.02em;">${appName}</h1>
                <p style="margin:10px 0 0;font-size:16px;color:rgba(255,255,255,0.85);">Redefinição de senha</p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;">
                <p style="margin:0 0 22px;font-size:16px;line-height:1.75;color:#334155;">Olá,</p>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.75;color:#334155;">Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para continuar.</p>
                <div style="text-align:center;margin:0 0 28px;">
                  <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:#465fff;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;">Redefinir senha</a>
                </div>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:#64748b;word-break:break-all;">${resetUrl}</p>
                <p style="margin:0;font-size:15px;line-height:1.8;color:#475569;">Se você não solicitou esta alteração, ignore este e-mail.</p>
                <p style="margin:24px 0 0;font-size:15px;line-height:1.8;color:#475569;">Atenciosamente,<br><strong>Equipe ${appName}</strong></p>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:20px 32px;text-align:center;color:#64748b;font-size:13px;">
                <p style="margin:0;">Este é um e-mail automático. Por favor, não responda diretamente.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return getTransporterOrThrow().sendMail({
    from,
    to: toEmail,
    subject,
    text,
    html,
  });
}

export async function sendGenericEmail(toEmail, subject, html) {
  const from = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'contato@exemplo.com';
  return getTransporterOrThrow().sendMail({
    from,
    to: toEmail,
    subject,
    text: html.replace(/<[^>]+>/g, ''),
    html,
  });
}

export default { sendVerificationEmail, sendGenericEmail };
