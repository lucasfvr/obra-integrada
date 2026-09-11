import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_DIR = path.join(__dirname, '../src/sql');

/**
 * Ordem de deploy. Nao e alfabetica de proposito: as views e os triggers usam a
 * UDF fn_distancia_metros, entao as funcoes tem de existir antes.
 * A pasta queries/ fica fora: sao consultas soltas para copiar e colar, nao
 * objetos que moram no banco.
 */
const ORDEM = ['functions', 'procedures', 'triggers', 'views'];

/**
 * Quebra um arquivo .sql em statements executaveis.
 *
 * Precisa existir porque o corpo de uma funcao plpgsql vem entre $$ ... $$ e
 * contem ponto-e-virgula por toda parte -- um split(';') cru picaria a funcao no
 * meio. Aqui os ponto-e-virgulas dentro de um bloco $$ sao ignorados, o que
 * permite um arquivo com DROP TRIGGER + CREATE FUNCTION + CREATE TRIGGER junto.
 */
function separarStatements(sql) {
  const statements = [];
  let atual = '';
  let dentroDoDollar = false;

  const linhas = sql.split('\n');

  for (const linha of linhas) {
    // Comentario de linha inteira nao influencia o parser.
    if (linha.trim().startsWith('--')) {
      atual += linha + '\n';
      continue;
    }

    // Cada $$ alterna entrada/saida do corpo da funcao.
    const marcadores = (linha.match(/\$\$/g) || []).length;
    for (let i = 0; i < marcadores; i++) dentroDoDollar = !dentroDoDollar;

    atual += linha + '\n';

    if (!dentroDoDollar && linha.trimEnd().endsWith(';')) {
      if (atual.replace(/--.*$/gm, '').trim()) statements.push(atual.trim());
      atual = '';
    }
  }

  if (atual.replace(/--.*$/gm, '').trim()) statements.push(atual.trim());
  return statements;
}

export async function deployCustomSQL() {
  const prisma = new PrismaClient();
  let total = 0;

  try {
    for (const pasta of ORDEM) {
      const dir = path.join(SQL_DIR, pasta);
      if (!fs.existsSync(dir)) continue;

      const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
      if (!arquivos.length) continue;

      console.log(`\n[${pasta}]`);

      for (const arquivo of arquivos) {
        const sql = fs.readFileSync(path.join(dir, arquivo), 'utf8');
        const statements = separarStatements(sql);

        try {
          for (const statement of statements) {
            await prisma.$executeRawUnsafe(statement);
          }
          console.log(`  ok  ${arquivo} (${statements.length} statement(s))`);
          total++;
        } catch (erro) {
          // Falha em um arquivo nao deve esconder os outros: reporta e segue.
          console.error(`  ERRO ${arquivo}: ${erro.message.split('\n')[0]}`);
          throw erro;
        }
      }
    }

    console.log(`\n${total} arquivo(s) aplicado(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

/** Confere no catalogo do Postgres o que de fato existe depois do deploy. */
export async function verifyCustomObjects() {
  const prisma = new PrismaClient();

  try {
    const funcoes = await prisma.$queryRaw`
      SELECT p.proname AS nome,
             CASE p.prokind WHEN 'p' THEN 'procedure' ELSE 'function' END AS tipo
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = 'public'
         AND (p.proname LIKE 'fn_%' OR p.proname LIKE 'sp_%')
       ORDER BY tipo, nome`;

    const views = await prisma.$queryRaw`
      SELECT viewname AS nome FROM pg_views
       WHERE schemaname = 'public' AND viewname LIKE 'vw_%'
       ORDER BY viewname`;

    const triggers = await prisma.$queryRaw`
      SELECT t.tgname AS nome, c.relname AS tabela
        FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
       WHERE NOT t.tgisinternal AND t.tgname LIKE 'tr%'
       ORDER BY t.tgname`;

    console.log(`\nfunctions/procedures (${funcoes.length}):`);
    funcoes.forEach((f) => console.log(`  ${f.tipo.padEnd(9)} ${f.nome}`));
    console.log(`\nviews (${views.length}):`);
    views.forEach((v) => console.log(`  ${v.nome}`));
    console.log(`\ntriggers (${triggers.length}):`);
    triggers.forEach((t) => console.log(`  ${t.nome} -> ${t.tabela}`));
  } finally {
    await prisma.$disconnect();
  }
}

const executadoDireto = process.argv[1] && process.argv[1].endsWith('deploy-db.js');

if (executadoDireto) {
  const acao = process.argv[2];
  const rotina = acao === 'verify' ? verifyCustomObjects : deployCustomSQL;

  rotina().catch((erro) => {
    console.error(erro.message);
    process.exit(1);
  });
}
