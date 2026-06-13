# ADR-003 — Escolha da Ferramenta de Validação de Schemas
## Architecture Decision Record

**Status:** Aceito  
**Data:** 13 de junho de 2026  
**Decisores:** Time de Engenharia Obra Integrada

---

## Contexto

Atualmente, a validação de dados recebidos pelo backend (parâmetros de rota, query strings e corpo de requisições HTTP) é dispersa, utilizando condicionais manuais e expressões regulares (*regex*). Essa falta de padronização expõe a plataforma a:
1. Erros HTTP 500 não tratados vazando logs internos ou detalhes do banco de dados (ex: violação de constraint do Prisma).
2. Vulnerabilidades de segurança do tipo injeção de dados maliciosos ou poluição de parâmetros.
3. Inconsistência nos tipos de dados salvos.

Toda rota de entrada de dados da API precisa de uma validação declarativa, robusta e que integre perfeitamente com o ecossistema TypeScript planejado (ADR-001).

---

## Opções Consideradas

### Opção A — Zod
* **Prós:**
  - **Type Inference:** Permite inferir os tipos estáticos do TypeScript a partir dos schemas runtime automaticamente (`z.infer<typeof schema>`). Evita duplicar a tipagem manual.
  - **Ergonomia e Legibilidade:** API muito declarativa e limpa.
  - **Ecossistema:** Amplamente utilizado em 2026 com ferramentas como `@anatine/zod-openapi` para gerar documentação OpenAPI/Swagger automaticamente, e integradores como `react-hook-form` (frontend).
* **Contras:**
  - Desempenho ligeiramente inferior a validadores baseados em compilação prévia (como AJV) sob volumes massivos de dados, porém imperceptível para a escala de requisições do sistema.

### Opção B — Joi
* **Prós:**
  - Altamente maduro, com dezenas de utilitários de validação e anos de estrada no ecossistema Node.js.
* **Contras:**
  - Não foi criado pensando em TypeScript. A integração de tipos estáticos exige escrever os tipos e os validadores manualmente (duplicidade de código).

### Opção C — Yup
* **Prós:**
  - Sintaxe limpa, muito comum em validações React no frontend.
* **Contras:**
  - Suporte a inferência TypeScript e ecossistema de APIs backend menos maduro quando comparado ao Zod.

### Opção D — Valibot
* **Prós:**
  - Extremamente leve (~2 KB vs ~60 KB do Zod) devido a sua arquitetura *tree-shakeable*, tornando-o ideal para rodar no browser/client.
* **Contras:**
  - Ecossistema mais jovem com menos integrações prontas para geração automática de Swagger ou tratamento de middleware Express.

---

## Decisão Recomendada

**Opção A — Zod.**

O Zod será adotado como o padrão oficial de validação de schemas em toda a plataforma Obra Integrada. Os schemas do Zod serão estruturados em arquivos `.schema.ts` compartilhados, permitindo que a mesma regra de validação seja utilizada tanto pelo backend no middleware do Express quanto pelo frontend na validação de formulários (`react-hook-form`).

### Exemplo de Estrutura Esperada

```typescript
// apps/api/src/schemas/obra.schema.ts
import { z } from 'zod';

export const CriarObraSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres').max(255),
  tipo_obra: z.enum(['residencial', 'comercial', 'industrial']),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  valor_orcado: z.number().positive('O valor deve ser maior que zero').optional(),
});

export type CriarObraInput = z.infer<typeof CriarObraSchema>;
```

Middleware utilitário para o Express:
```typescript
// apps/api/src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateBody = (schema: AnyZodObject) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'fail',
          error: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
```

---

## Consequências

- **Positivas:**
  - Garantia de que dados inválidos ou maliciosos serão rejeitados na borda da API Express antes de tocarem os controladores ou serviços.
  - Código limpo sem condicionais redundantes de verificação de campos.
  - Compartilhamento fácil de schemas no monorepo entre API e Web App.
- **Negativas:**
  - Curva de aprendizado inicial mínima para os desenvolvedores que não estão acostumados com a API do Zod.
  - Pequeno acréscimo de dependência no bundle do frontend (compensado pela eliminação de outros pacotes de validação como regex personalizadas).
