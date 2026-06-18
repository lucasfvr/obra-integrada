// Validações de formulário
import validarInscricaoEstadual from "inscricaoestadual";


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

export const formatCEP = (value) => {
  const cleaned = value.replace(/\D/g, "").slice(0, 8);
  if (cleaned.length <= 5) return cleaned;
  return cleaned.replace(/(\d{5})(\d{1,3})/, "$1-$2");
};

export const validateCEP = (cep) => {
  const cleaned = cep.replace(/\D/g, "");
  if (cleaned.length !== 8) {
    return { valid: false, message: "CEP deve ter 8 dígitos" };
  }
  return { valid: true, message: "CEP válido" };
};

// Valida email
export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/;
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
  if (!/^[a-záéíóúãõâêôç\s\-']+$/i.test(trimmed)) {
    return { valid: false, message: "Nome deve conter apenas letras e caracteres válidos" };
  }
  return { valid: true, message: "Nome válido" };
};

// Valida Razão Social
export const validateRazaoSocial = (razaoSocial) => {
  const trimmed = razaoSocial.trim();
  if (trimmed.length < 3) {
    return { valid: false, message: "Razão Social deve ter no mínimo 3 caracteres" };
  }
  // Garante que não seja apenas números
  if (/^\d+$/.test(trimmed)) {
    return { valid: false, message: "Razão Social não pode conter apenas números" };
  }
  // Garante que tenha pelo menos uma letra
  if (!/[a-z]/i.test(trimmed)) {
    return { valid: false, message: "Razão Social deve conter pelo menos uma letra" };
  }
  return { valid: true, message: "Razão Social válida" };
};

// Formata Celular: 11987654321 -> (11) 98765-4321
export const formatCelular = (value) => {
  const cleaned = value.replace(/\D/g, "").slice(0, 11);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 6) return cleaned.replace(/(\d{2})(\d+)/, "($1) $2");
  if (cleaned.length <= 10) return cleaned.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

// Formata Telefone: 1133334444 -> (11) 3333-4444
export const formatTelefone = (value) => {
  const cleaned = value.replace(/\D/g, "").slice(0, 10);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 6) return cleaned.replace(/(\d{2})(\d+)/, "($1) $2");
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
};

// Valida celular
export const validateCelular = (celular) => {
  const cleaned = celular.replace(/\D/g, "");

  if (cleaned.length !== 11) {
    return { valid: false, message: "Celular deve ter 11 dígitos com o DDD" };
  }

  return { valid: true, message: "Celular válido" };
};

// Valida telefone fixo ou celular secundário
export const validateTelefone = (telefone) => {
  const cleaned = telefone.replace(/\D/g, "");

  if (cleaned.length === 0) {
    return { valid: true, message: "Telefone opcional" };
  }

  if (cleaned.length !== 10 && cleaned.length !== 11) {
    return {
      valid: false,
      message: "Telefone deve ter 10 dígitos com o DDD ou 11 dígitos se for celular (Opcional)",
    };
  }

  return { valid: true, message: "Telefone válido" };
};

const applyMask = (value, mask) => {
  let i = 0;
  let masked = "";
  for (let m of mask) {
    if (i >= value.length) break;
    if (m === "#") {
      masked += value[i];
      i++;
    } else {
      masked += m;
    }
  }
  return masked;
};

export const getMaskForState = (uf) => {
  switch(uf) {
    case 'AC': return '##.###.###/###-##';  // 13
    case 'AL': return '########-#';          // 9
    case 'AP': return '########-#';          // 9
    case 'AM': return '##.###.###-#';        // 9
    case 'BA': return '########-#';          // 9 (8 ou 9)
    case 'CE': return '########-#';          // 9
    case 'DF': return '##.###.###/###-##';  // 13
    case 'ES': return '########-#';          // 9
    case 'GO': return '##.###.###-#';        // 9
    case 'MA': return '########-#';          // 9
    case 'MT': return '##########-#';        // 11
    case 'MS': return '########-#';          // 9
    case 'MG': return '###.###.###/####';    // 13
    case 'PA': return '##-######-#';         // 9
    case 'PB': return '########-#';          // 9
    case 'PR': return '########-##';         // 10
    case 'PE': return '##.#.###.#######-#';  // 14 (9 ou 14)
    case 'PI': return '########-#';          // 9
    case 'RJ': return '##.###.##-#';         // 8
    case 'RN': return '##.#.###.###-#';      // 10
    case 'RS': return '###/#######';         // 10
    case 'RO': return '##############';      // 14
    case 'RR': return '########-#';          // 9
    case 'SC': return '###.###.###';         // 9
    case 'SP': return '###.###.###.###';     // 12
    case 'SE': return '########-#';          // 9
    case 'TO': return '##########-#';        // 11
    default: return '##############';        // 14 (fallback)
  }
};

// Formata Inscrição Estadual conforme o estado
export const formatInscricaoEstadual = (value, estado = "") => {
  const upperValue = value.toUpperCase();
  if ("ISENTO".startsWith(upperValue) && upperValue.length > 0) {
    return upperValue;
  }

  const uf = estado?.toUpperCase() || "";
  const cleaned = value.replace(/\D/g, "");

  if (cleaned.length === 0) return cleaned;

  const mask = getMaskForState(uf, cleaned.length);
  return applyMask(cleaned, mask);
};

// Valida Inscrição Estadual (Básica e Avançada)
export const validateInscricaoEstadual = (value, estado = "") => {
  if (value.toUpperCase() === "ISENTO") {
    return { valid: true, message: "Inscrição estadual isenta" };
  }

  const cleaned = value.replace(/\D/g, "");
  if (!cleaned) {
    return { valid: false, message: "A Inscrição Estadual não pode ser vazia" };
  }

  // Se o estado estiver vazio, tenta apenas validar se tem um tamanho genérico plausível
  if (!estado) {
    if (cleaned.length < 8 || cleaned.length > 14) {
      return { valid: false, message: "Inscrição Estadual com tamanho inválido" };
    }
    return { valid: true, message: "Inscrição Estadual plausível (estado não informado)" };
  }

  // Validação real usando a biblioteca para o estado correspondente
  const isValid = validarInscricaoEstadual(cleaned, estado.toUpperCase());
  if (!isValid) {
    return { valid: false, message: `Inscrição Estadual inválida para o estado de ${estado.toUpperCase()}` };
  }

  return { valid: true, message: "Inscrição Estadual válida" };
};
