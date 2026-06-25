// Applies every .sql file in supabase/migrations in lexical order.
// Tracks applied files in public.schema_migrations so re-runs are safe.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { config } from 'dotenv';

config({ path: '.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

const onlyFile = process.argv[2]; // optional: run a single file

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  await client.query(`
    create table if not exists public.schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const applied = new Set(
    (await client.query('select filename from public.schema_migrations')).rows.map((r) => r.filename)
  );

  let files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  if (onlyFile) files = files.filter((f) => f === onlyFile || f.includes(onlyFile));

  for (const file of files) {
    const isSeed = file.includes('seed');
    if (applied.has(file) && !isSeed) {
      console.log(`= skip   ${file} (already applied)`);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    process.stdout.write(`> apply  ${file} ... `);
    try {
      await client.query('begin');
      await client.query(sql);
      await client.query(
        'insert into public.schema_migrations(filename) values ($1) on conflict (filename) do update set applied_at = now()',
        [file]
      );
      await client.query('commit');
      console.log('done');
    } catch (e) {
      await client.query('rollback');
      console.error(`\nFAILED in ${file}:\n${e.message}`);
      process.exit(1);
    }
  }
  await client.end();
  console.log('All migrations applied.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
