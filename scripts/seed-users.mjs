// Creates the initial staff accounts (one per role) via the Admin API.
// Re-runnable: updates password/role if the user already exists.
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const users = [
  { email: 'admin@greatrainbowacademy.com',     password: 'Rainbow@Admin2025',   full_name: 'System Administrator', role: 'system_administrator' },
  { email: 'principal@greatrainbowacademy.com', password: 'Rainbow@School2025',  full_name: 'Mrs. Deborah Asare',   role: 'school_administrator' },
  { email: 'teacher@greatrainbowacademy.com',   password: 'Rainbow@Teach2025',   full_name: 'Demo Teacher',         role: 'teacher' },
  { email: 'staff@greatrainbowacademy.com',     password: 'Rainbow@Staff2025',   full_name: 'Demo Staff',           role: 'staff' },
];

async function findByEmail(email) {
  // listUsers is paginated; small user base so a couple of pages is plenty.
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

async function run() {
  for (const u of users) {
    const existing = await findByEmail(u.email);
    if (existing) {
      await supabase.auth.admin.updateUserById(existing.id, {
        password: u.password,
        user_metadata: { full_name: u.full_name, role: u.role },
        email_confirm: true,
      });
      await supabase.from('profiles').update({ full_name: u.full_name, role: u.role, email: u.email, status: 'active' }).eq('id', existing.id);
      console.log(`updated  ${u.role.padEnd(22)} ${u.email}`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name, role: u.role },
      });
      if (error) { console.error(`  ! ${u.email}: ${error.message}`); continue; }
      // ensure profile reflects role (trigger also handles this)
      await supabase.from('profiles').upsert({ id: data.user.id, email: u.email, full_name: u.full_name, role: u.role, status: 'active' });
      console.log(`created  ${u.role.padEnd(22)} ${u.email}`);
    }
  }
  console.log('Users seeded.');
}

run().catch((e) => { console.error(e); process.exit(1); });
