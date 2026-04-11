// Validações de formulário

// Formata CPF: 12345678901 -> 123.456.789-01
export const formatCPF = (value) => {
  const cleaned = value.replace(/\D/g, "").slice(0, 11);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return cleaned.replace(/(\d{3})(\d+)/, "$1.$2");
  if (cleaned.length <= 9) return cleaned.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

// Valida CPF
export const validateCPF = (cpf) => {
  const cleaned = cpf.replace(/\D/g, "");
  
  if (cleaned.length !== 11) {
    return { valid: false, message: "CPF deve ter 11 dígitos" };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return { valid: false, message: "CPF inválido" };
  }

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  digit1 = digit1 >= 10 ? 0 : digit1;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  digit2 = digit2 >= 10 ? 0 : digit2;

  if (
    digit1 !== parseInt(cleaned[9]) ||
    digit2 !== parseInt(cleaned[10])
  ) {
    return { valid: false, message: "CPF inválido" };
  }

  return { valid: true, message: "CPF válido" };
};

// Formata CNPJ: 12345678901234 -> 12.345.678/9012-34
export const formatCNPJ = (value) => {
  const cleaned = value.replace(/\D/g, "").slice(0, 14);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return cleaned.replace(/(\d{2})(\d+)/, "$1.$2");
  if (cleaned.length <= 8) return cleaned.replace(/(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
  if (cleaned.length <= 12) return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

// Valida CNPJ
export const validateCNPJ = (cnpj) => {
  const cleaned = cnpj.replace(/\D/g, "");

  if (cleaned.length !== 14) {
    return { valid: false, message: "CNPJ deve ter 14 dígitos" };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) {
    return { valid: false, message: "CNPJ inválido" };
  }

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
    return { valid: false, message: "CNPJ inválido" };
  }

  return { valid: true, message: "CNPJ válido" };
};

// Valida email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return { valid: false, message: "Email inválido" };
  }
  return { valid: true, message: "Email válido" };
};

// Valida senha (para cadastro / regras fortes)
export const validatePassword = (password) => {
  if (password.length < 6) {
    return { valid: false, message: "Senha deve ter no mínimo 6 caracteres" };
  }
  // Verifica se tem pelo menos uma letra maiúscula, uma minúscula e um número
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  if (!regex.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número" };
  }
  return { valid: true, message: "Senha válida" };
};

// Valida senha no login (regras leves)
export const validatePasswordLogin = (password) => {
  if (password.length < 6) {
    return { valid: false, message: "Senha deve ter no mínimo 6 caracteres" };
  }
  return { valid: true, message: "Senha válida" };
};

// Valida nome
export const validateName = (name) => {
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return { valid: false, message: "Nome deve ter no mínimo 3 caracteres" };
  }
  if (!/^[a-záéíóúãõâêôç\s]+$/i.test(trimmed)) {
    return { valid: false, message: "Nome deve conter apenas letras" };
  }
  return { valid: true, message: "Nome válido" };
};

// Valida celular
export const validateCelular = (celular) => {
  const cleaned = celular.replace(/\D/g, "");
  
  if (cleaned.length !== 11) {
    return { valid: false, message: "Celular deve ter 11 dígitos" };
  }
  
  // Verifica se começa com 9 (celulares brasileiros)
  if (cleaned[2] !== "9") {
    return { valid: false, message: "Celular inválido" };
  }
  
  return { valid: true, message: "Celular válido" };
};

// Valida telefone fixo
export const validateTelefone = (telefone) => {
  const cleaned = telefone.replace(/\D/g, "");
  
  if (cleaned.length !== 10) {
    return { valid: false, message: "Telefone deve ter 10 dígitos" };
  }
  
  // Verifica se o terceiro dígito não é 9 (telefones fixos não têm 9)
  if (cleaned[2] === "9") {
    return { valid: false, message: "Telefone inválido" };
  }
  
  return { valid: true, message: "Telefone válido" };
};
