import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 [deploy-db.js] Script starting');
console.log('🚀 [deploy-db.js] import.meta.url:', import.meta.url);
console.log('🚀 [deploy-db.js] process.argv[1]:', process.argv[1]);
console.log('🚀 [deploy-db.js] Are they equal?', import.meta.url === `file://${process.argv[1]}`);

/**
 * Deploy custom SQL procedures, triggers and functions
 * Should be run after Prisma migrations
 */
async function deployCustomSQL() {
  console.log('🚀 [deployCustomSQL] Starting...');
  const prisma = new PrismaClient();
  console.log('🚀 [deployCustomSQL] PrismaClient created');

  try {
    console.log('🚀 [deployCustomSQL] Deploying custom SQL procedures, triggers and functions...');

    // Deploy procedures
    const proceduresDir = path.join(__dirname, '../src/sql/procedures');
    console.log(`🚀 [deployCustomSQL] Checking procedures dir: ${proceduresDir}`);
    if (fs.existsSync(proceduresDir)) {
      const procedureFiles = fs.readdirSync(proceduresDir).filter(f => f.endsWith('.sql'));
      console.log(`🚀 [deployCustomSQL] Found ${procedureFiles.length} procedure files`);

      for (const file of procedureFiles) {
        console.log(`🚀 [deployCustomSQL] Processing procedure file: ${file}`);
        const sql = fs.readFileSync(path.join(proceduresDir, file), 'utf8');
        console.log(`🚀 [deployCustomSQL] Read SQL for ${file}, length: ${sql.length}`);
        // Procedures are single statements
        console.log(`🚀 [deployCustomSQL] About to execute procedure: ${file}`);
        await prisma.$executeRawUnsafe(sql);
        console.log(`✅ [deployCustomSQL] Procedure deployed: ${file}`);
      }
    } else {
      console.log('🚀 [deployCustomSQL] Procedures directory does not exist');
    }

    // Deploy triggers - need to handle multiple statements
    const triggersDir = path.join(__dirname, '../src/sql/triggers');
    console.log(`🚀 [deployCustomSQL] Checking triggers dir: ${triggersDir}`);
    if (fs.existsSync(triggersDir)) {
      const triggerFiles = fs.readdirSync(triggersDir).filter(f => f.endsWith('.sql'));
      console.log(`🚀 [deployCustomSQL] Found ${triggerFiles.length} trigger files`);

      for (const file of triggerFiles) {
        console.log(`🚀 [deployCustomSQL] Processing trigger file: ${file}`);
        const sqlFull = fs.readFileSync(path.join(triggersDir, file), 'utf8');
        console.log(`🚀 [deployCustomSQL] Read SQL for ${file}, length: ${sqlFull.length}`);

        // For our specific trigger file, we need to split into two statements:
        // 1. The CREATE OR REPLACE FUNCTION ... $$ LANGUAGE plpgsql;
        // 2. The CREATE TRIGGER ...

        // Find the end of the function definition: looks for "$$ LANGUAGE plpgsql;"
        const functionEndMatch = sqlFull.match(/\$\$ LANGUAGE plpgsql;/);
        if (functionEndMatch) {
          console.log(`🚀 [deployCustomSQL] Found function end match for ${file}`);
          const functionEndIndex = functionEndMatch.index + functionEndMatch[0].length;

          // Extract function part (up to and including the language declaration)
          const functionPart = sqlFull.substring(0, functionEndIndex).trim();
          // Extract trigger part (everything after)
          const triggerPart = sqlFull.substring(functionEndIndex).trim();

          console.log(`🚀 [deployCustomSQL] Function part length: ${functionPart.length}`);
          console.log(`🚀 [deployCustomSQL] Trigger part length: ${triggerPart.length}`);

          // Execute function part
          if (functionPart) {
            console.log(`🚀 [deployCustomSQL] Executing function part for ${file}`);
            await prisma.$executeRawUnsafe(functionPart);
            console.log(`✅ [deployCustomSQL] Function deployed: ${file}`);
          }

          // Execute trigger part
          if (triggerPart) {
            console.log(`🚀 [deployCustomSQL] Executing trigger part for ${file}`);
            await prisma.$executeRawUnsafe(triggerPart);
            console.log(`✅ [deployCustomSQL] Trigger deployed: ${file}`);
          }
        } else {
          console.log(`🚀 [deployCustomSQL] No function end match found for ${file}, trying as single statement`);
          // Fallback: try to execute as single statement (for simple triggers)
          await prisma.$executeRawUnsafe(sqlFull);
          console.log(`✅ [deployCustomSQL] Trigger deployed: ${file}`);
        }
      }
    } else {
      console.log('🚀 [deployCustomSQL] Triggers directory does not exist');
    }

    // Deploy queries (though these are typically just read, not executed)
    const queriesDir = path.join(__dirname, '../src/sql/queries');
    console.log(`🚀 [deployCustomSQL] Checking queries dir: ${queriesDir}`);
    if (fs.existsSync(queriesDir)) {
      const queryFiles = fs.readdirSync(queriesDir).filter(f => f.endsWith('.sql'));
      console.log(`📋 [deployCustomSQL] ${queryFiles.length} SQL queries available for use`);
    }

    console.log('🎉 [deployCustomSQL] All custom SQL deployed successfully!');
  } catch (error) {
    console.error('❌ [deployCustomSQL] Error deploying custom SQL:', error);
    throw error;
  } finally {
    console.log('🚀 [deployCustomSQL] Disconnecting PrismaClient...');
    await prisma.$disconnect();
    console.log('✅ [deployCustomSQL] Disconnected');
  }
}

/**
 * Verify that custom database objects exist
 */
async function verifyCustomObjects() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 [verifyCustomObjects] Verifying custom database objects...');

    // Check for procedures
    const procedures = await prisma.$queryRaw`
      SELECT proname as name
      FROM pg_proc
      JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
      WHERE nspname = 'public'
        AND proname IN ('calcular_custo_obra')
    `;

    console.log(`✅ [verifyCustomObjects] Found ${procedures.length} custom procedures`);

    // Check for triggers
    const triggers = await prisma.$queryRaw`
      SELECT tgname as name
      FROM pg_trigger
      JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
      WHERE tgname LIKE 'trigger_%'
    `;

    console.log(`✅ [verifyCustomObjects] Found ${triggers.length} custom triggers`);

  } catch (error) {
    console.error('❌ [verifyCustomObjects] Error verifying custom objects:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 [deploy-db.js] Running as main script');
  const action = process.argv[2];

  if (action === 'verify') {
    console.log('🚀 [deploy-db.js] Running verify action');
    verifyCustomObjects().catch(console.error);
  } else {
    console.log('🚀 [deploy-db.js] Running deploy action');
    deployCustomSQL().catch(console.error);
  }
} else {
  console.log('🚀 [deploy-db.js] Imported as module');
  // When imported as module, we still want to be able to run the functions
  // But for direct execution, we need another way to detect it
  // Let's check if the module is the main module
  const isMain = !import.meta.url || import.meta.url === `file://${process.argv[1]}`;
  if (!isMain && process.argv[1] && process.argv[1].endsWith('deploy-db.js')) {
    console.log('🚀 [deploy-db.js] Detected direct execution via argv check');
    const action = process.argv[2];

    if (action === 'verify') {
      console.log('🚀 [deploy-db.js] Running verify action');
      verifyCustomObjects().catch(console.error);
    } else {
      console.log('🚀 [deploy-db.js] Running deploy action');
      deployCustomSQL().catch(console.error);
    }
  }
}

export { deployCustomSQL, verifyCustomObjects };