import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY || 're_A3qedWaW_G4PW3b3oihm2gKrE5KbNJoQN';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'contato.obraintegrada@resend.dev';

console.log('Testing Resend with:');
console.log('API Key:', apiKey.substring(0, 10) + '...');
console.log('From Email:', fromEmail);

const resend = new Resend(apiKey);

(async () => {
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: 'teste+verify3@gmail.com',
      subject: 'Teste de Verificação',
      html: '<p>Seu código de verificação é: <strong>123456</strong></p>',
      text: 'Seu código de verificação é: 123456'
    });
    console.log('✅ Email sent successfully:', result);
  } catch (error) {
    console.error('❌ Error sending email:', {
      message: error.message,
      status: error.status,
      statusCode: error.statusCode,
      name: error.name,
      response: error.response,
    });
  }
})();
