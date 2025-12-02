// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// ID organizzazione PetMark (preso dalla tabella "profiles")
const ORG_ID = '042dc385-f734-4496-8a37-b665a42e946e';

type ProfileRow = {
  id: string;
  role: string | null;
  store_id: string | null;
};

type StoreRow = {
  id: string;
  name: string;
  code: string | null;
};

// GET: lista utenti con profilo e negozio
export async function GET() {
  try {
    const { data: usersData, error: usersErr } =
      await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersErr) {
      console.error('usersErr', usersErr);
      return NextResponse.json(
        { error: 'Errore nel recupero utenti' },
        { status: 500 }
      );
    }

    const { data: profilesData, error: profilesErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role, store_id');

    if (profilesErr) {
      console.error('profilesErr', profilesErr);
      return NextResponse.json(
        { error: 'Errore nel recupero profili' },
        { status: 500 }
      );
    }

    const { data: storesData, error: storesErr } = await supabaseAdmin
      .from('stores')
      .select('id, name, code');

    if (storesErr) {
      console.error('storesErr', storesErr);
      return NextResponse.json(
        { error: 'Errore nel recupero negozi' },
        { status: 500 }
      );
    }

    const profiles = (profilesData || []) as ProfileRow[];
    const stores = (storesData || []) as StoreRow[];

    const users = (usersData?.users || []).map((u) => {
      const p = profiles.find((pr) => pr.id === u.id);
      const store = p ? stores.find((s) => s.id === p.store_id) : undefined;

      return {
        id: u.id,
        email: u.email,
        role: p?.role ?? null,
        store_id: p?.store_id ?? null,
        store_name: store?.name ?? null,
        store_code: store?.code ?? null,
      };
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error('GET /api/admin/users ERR', err);
    return NextResponse.json(
      { error: 'Errore interno server' },
      { status: 500 }
    );
  }
}

// POST: crea nuovo utente + profilo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      role,
      store_id,
    }: { email: string; password: string; role: string; store_id: string | null } =
      body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'email, password e ruolo sono obbligatori' },
        { status: 400 }
      );
    }

    // crea utente auth
    const { data: newUserData, error: createErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createErr || !newUserData?.user) {
      console.error('createErr', createErr);
      return NextResponse.json(
        { error: 'Errore nella creazione utente', detail: createErr?.message },
        { status: 500 }
      );
    }

    const userId = newUserData.user.id;

    // crea profilo (qui DEVE esserci organization_id)
    const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      role,
      store_id: store_id || null,
      organization_id: ORG_ID,
    });

    if (profileErr) {
      console.error('profileErr (POST insert)', profileErr);
      return NextResponse.json(
        {
          error: 'Utente creato ma errore nella creazione profilo',
          detail: profileErr.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/users ERR', err);
    return NextResponse.json(
      { error: 'Errore interno server', detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}

// PATCH: aggiorna ruolo / store_id nel profilo
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      role,
      store_id,
    }: { id: string; role: string | null; store_id: string | null } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id utente mancante' },
        { status: 400 }
      );
    }

    // 1) vediamo se il profilo ESISTE già
    const { data: existing, error: selErr } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (selErr) {
      console.error('profiles select ERR', selErr);
      return NextResponse.json(
        { error: 'Errore nel recupero profilo', detail: selErr.message },
        { status: 500 }
      );
    }

    if (!existing) {
      // 2) se non esiste → INSERT con organization_id
      const { error: insErr } = await supabaseAdmin.from('profiles').insert({
        id,
        role,
        store_id,
        organization_id: ORG_ID,
      });

      if (insErr) {
        console.error('profiles insert (PATCH) ERR', insErr);
        return NextResponse.json(
          { error: 'Errore nella creazione profilo', detail: insErr.message },
          { status: 500 }
        );
      }
    } else {
      // 3) se esiste → UPDATE solo di role e store_id (organization_id resta com’è)
      const { error: updErr } = await supabaseAdmin
        .from('profiles')
        .update({
          role,
          store_id,
        })
        .eq('id', id);

      if (updErr) {
        console.error('profiles update ERR', updErr);
        return NextResponse.json(
          { error: 'Errore nell’aggiornamento profilo', detail: updErr.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('PATCH /api/admin/users ERR', err);
    return NextResponse.json(
      { error: 'Errore interno server', detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
