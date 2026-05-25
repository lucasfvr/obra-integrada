/**
 * validation.js
 * Utilitários de validação para o backend.
 */

/**
 * Valida CPF (Algoritmo de checksum)
 */
export function validarCPF(cpf) {
  if (!cpf) return false;

  // Remove caracteres não numéricos
  const cleanCPF = String(cpf).replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;

  // Bloqueia CPFs com todos os dígitos iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;

  // Validação do Primeiro Dígito
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cleanCPF.charAt(9))) return false;

  // Validação do Segundo Dígito
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Valida formato de E-mail
 */
export function validarEmail(email) {
  if (!email) return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}
