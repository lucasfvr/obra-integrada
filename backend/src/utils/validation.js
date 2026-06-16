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

/**
 * Valida CNPJ (Algoritmo de checksum)
 */
export function validarCNPJ(cnpj) {
  if (!cnpj) return false;
  const cleaned = String(cnpj).replace(/\D/g, "");

  if (cleaned.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  const firstMultiplier = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * firstMultiplier[i];
  }
  let digit1 = 11 - (sum % 11);
  digit1 = digit1 >= 10 ? 0 : digit1;

  // Calcula segundo dígito verificador
  sum = 0;
  const secondMultiplier = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * secondMultiplier[i];
  }
  let digit2 = 11 - (sum % 11);
  digit2 = digit2 >= 10 ? 0 : digit2;

  if (
    digit1 !== parseInt(cleaned[12]) ||
    digit2 !== parseInt(cleaned[13])
  ) {
    return false;
  }

  return true;
}
