# Normas de Segurança da Informação e Privacidade Interna
## Obra Integrada — Diretrizes de Segurança Corporativa e Conduta Tecnológica

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** ISO 27001 (A.8 - Gestão de Ativos / A.9 - Controle de Acesso)

---

## 1. Controle de Acessos e Contas de Usuários

Todos os colaboradores (desenvolvedores, gerentes, suporte CS) devem seguir as seguintes regras rígidas para gerenciar seus acessos corporativos:

- **Autenticação de Dois Fatores (MFA):** É obrigatório ativar o MFA (via aplicativo autenticador, ex: Google Authenticator) em todas as ferramentas utilizadas no trabalho:
  - Contas de e-mail institucional Google Workspace.
  - GitHub (acesso ao monorepo).
  - Slack ou canal oficial de comunicação.
  - Console da Vercel e console do Neon DB.
- **Padrão de Senhas Fortes:** As senhas de contas profissionais devem ter no mínimo **12 caracteres**, incluindo letras maiúsculas, minúsculas, números e caracteres especiais (símbolos). Não reutilizar senhas pessoais em ferramentas corporativas.

---

## 2. Segurança de Dispositivos e Notebooks (BYOD / Corporativos)

Qualquer notebook, smartphone ou computador utilizado para trabalhar no código-fonte ou acessar dados da plataforma deve ser configurado com:

1. **Criptografia de Disco:** O disco rígido do dispositivo deve ter criptografia ativa (ex: BitLocker no Windows, FileVault no macOS).
2. **Antivírus Atualizado:** Instalação e execução contínua de software de proteção contra malwares ativo.
3. **Bloqueio Automático:** Tela de descanso configurada para bloquear o dispositivo automaticamente após **5 minutos** de inatividade.
4. **Sem Redes Wi-Fi Públicas Sem VPN:** Proibido conectar-se a painéis de controle do banco de dados Neon DB ou servidores de staging/produção usando redes Wi-Fi públicas (ex: aeroportos, cafeterias) sem a utilização de uma conexão VPN criptografada segura.

---

## 3. Confidencialidade e Regras para Dados de Clientes

- **Acordo de Confidencialidade (NDA):** Todos os dados de clientes, schemas de banco de dados, especificações de produtos e códigos-fonte do repositório são de propriedade intelectual exclusiva da empresa e confidenciais. É proibido compartilhar arquivos internos com terceiros sob risco de demissão por justa causa e sanções judiciais.
- **Proibição de Extração de Dados Pessoais (LGPD):** Desenvolvedores e agentes de suporte **nunca** devem extrair ou baixar backups de produção contendo dados pessoais de funcionários de construtoras (ex: CPFs, atestados PCMSO de saúde) para seus computadores pessoais. Qualquer depuração deve ser feita utilizando dados de teste ou mocks no ambiente de desenvolvimento local (`dev`).
- **Comunicação de Incidentes de Segurança:** Se um funcionário identificar ou suspeitar de uma brecha de segurança ou vazamento de dados, deve reportar imediatamente para o e-mail `security@obraintegrada.com.br` para acionar o time de resposta a incidentes.
