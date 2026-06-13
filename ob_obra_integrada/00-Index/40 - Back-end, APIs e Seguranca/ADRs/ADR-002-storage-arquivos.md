# ADR-002 — Estratégia de Storage de Arquivos
## Architecture Decision Record

**Status:** Em revisão (storage local → S3/R2)  
**Data:** Outubro de 2024  
**Revisado em:** Junho de 2026 — DECISÃO MUDOU  
**Decisores:** Time Obra Integrada

---

## Contexto

A plataforma permite upload de arquivos de obras (fotos de diário, documentos, comprovantes). Precisamos de uma solução que:
- Funcione com deploy serverless na Vercel (sem disco persistente)
- Seja escalável (arquivos crescem conforme a plataforma)
- Permita acesso seguro por URL assinada (S3 presigned URLs)
- Seja economicamente viável (startup)

## Decisão Original (MVP — 2024)

Usar **Multer com `diskStorage`** salvando em `backend/uploads/`.

## Por Que Esta Decisão Está Errada

> ⚠️ **Erro crítico identificado na auditoria técnica (Jun/2026):**
> A Vercel usa ambiente **serverless stateless** — o sistema de arquivos local **não é persistente**. Qualquer arquivo salvo em `backend/uploads/` é **perdido após o redeploy** ou quando a função serverless é encerrada.

## Nova Decisão (Jun/2026)

Migrar para **armazenamento externo** com as seguintes opções em ordem de preferência:

| Opção | Custo inicial | Egress | Vantagem |
|-------|-------------|--------|---------|
| **Cloudflare R2** | Gratuito até 10GB/mês | Gratuito | Sem egress fees |
| **AWS S3 (sa-east-1)** | ~$0.023/GB | $0.09/GB | Maturidade |
| **Supabase Storage** | Gratuito até 1GB | Taxa | Integrado ao Postgres |

**Decisão:** Cloudflare R2 (zero egress fees, generosa tier gratuita para MVP)

## Implementação

```javascript
// multer com storage em memória → upload direto para R2
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const storage = multer.memoryStorage(); // Não salva em disco
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// No controller:
const client = new S3Client({ endpoint: process.env.R2_ENDPOINT });
await client.send(new PutObjectCommand({
  Bucket: process.env.STORAGE_BUCKET,
  Key: `obras/${id_obra}/${Date.now()}-${filename}`,
  Body: file.buffer,
}));
```

## Consequências

**Positivas:**
- Compatível com Vercel serverless
- Arquivos persistentes e replicados
- URLs presigned para acesso seguro

**Negativas:**
- Requer migração dos arquivos existentes em `uploads/`
- Custo variável (baixo, mas presente)
- Dependência de serviço externo adicional

---

**Sprint de implementação:** Sprint 1 (P0)  
**Relacionado a:** Threat Model T2 | `.vercelignore`
