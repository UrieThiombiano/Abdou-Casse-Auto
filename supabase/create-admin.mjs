// Cree (ou met a jour le mot de passe d') un compte admin — equivalent de
// database/seeders/AdminUserSeeder.php. Il n'y a pas d'inscription publique :
// c'est le seul moyen de provisionner un compte.
//
// Usage :
//   SUPABASE_URL=https://xxxx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=xxxx \
//   ADMIN_EMAIL=admin@abdoucasseauto.com \
//   ADMIN_PASSWORD=changeme123 \
//   node supabase/create-admin.mjs
//
// La cle "service role" se trouve dans Supabase > Project Settings > API.
// Ne jamais l'exposer cote client ni la committer.

import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL ?? 'admin@abdoucasseauto.com'
const password = process.env.ADMIN_PASSWORD ?? 'changeme123'

if (!url || !serviceRoleKey) {
    console.error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.')
    process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
})

const { data: existing } = await supabase.auth.admin.listUsers()
const found = existing?.users.find((u) => u.email === email)

if (found) {
    const { error } = await supabase.auth.admin.updateUserById(found.id, { password })
    if (error) throw error
    console.log(`Mot de passe mis a jour pour ${email}.`)
} else {
    const { error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: 'Administrateur' },
    })
    if (error) throw error
    console.log(`Compte admin cree : ${email}.`)
}
