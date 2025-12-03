import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.warn(
    '⚠️ NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti per /api/admin/users'
  );
}

function getAdminClient() {
  return createClient(supabaseUrl, serviceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// GET: lista utenti per organizzazione
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orgId = url.searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json(
        { error: 'orgId mancante' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // 1) Profili
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(
        'id, role, store_id, area_id, organization_id, created_at'
      )
      .eq('organization_id', orgId);

    if (profilesError) {
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      );
    }

    const userIds = (profiles ?? []).map((p: any) => p.id);

    // 2) Users auth (admin)
    const { data: usersData, error: usersError } =
      await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      return NextResponse.json(
        { error: usersError.message },
        { status: 500 }
      );
    }

    const userMap = new Map(
      (usersData?.users ?? [])
        .filter((u: any) => userIds.includes(u.id))
        .map((u: any) => [u.id, u])
    );

    // 3) Stores
    const storeIds = Array.from(
      new Set(
        (profiles ?? [])
          .map((p: any) => p.store_id)
          .filter((x: any) => !!x)
      )
    );

    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name, code')
      .in('id', storeIds.length ? storeIds : ['00000000-0000-0000-0000-000000000000']);

    if (storesError) {
      return NextResponse.json(
        { error: storesError.message },
        { status: 500 }
      );
    }

    const storeMap = new Map(
      (stores ?? []).map((s: any) => [s.id, s])
    );

    // 4) Areas
    const areaIds = Array.from(
      new Set(
        (profiles ?? [])
          .map((p: any) => p.area_id)
          .filter((x: any) => !!x)
      )
    );

    const { data: areas, error: areasError } = await supabase
      .from('areas')
      .select('id, name')
      .in('id', areaIds.length ? areaIds : ['00000000-0000-0000-0000-000000000000']);

    if (areasError) {
      return NextResponse.json(
        { error: areasError.message },
        { status: 500 }
      );
    }

    const areaMap = new Map(
      (areas ?? []).map((a: any) => [a.id, a])
    );

    const result = (profiles ?? []).map((p: any) => {
      const u = userMap.get(p.id);
      const s = p.store_id ? storeMap.get(p.store_id) : null;
      const a = p.area_id ? areaMap.get(p.area_id) : null;

      const meta = u?.user_metadata ?? {};
      const disabled = meta?.disabled === true;

      return {
        id: p.id,
        email: u?.email ?? '',
        role: p.role,
        store_id: p.store_id,
        store_name: s?.name ?? null,
        store_code: s?.code ?? null,
        area_name: a?.name ?? null,
        disabled,
        created_at: p.created_at,
      };
    });

    return NextResponse.json({ users: result }, { status: 200 });
  } catch (e: any) {
    console.error('/api/admin/users GET error', e);
    return NextResponse.json(
      { error: e?.message ?? 'Errore sconosciuto' },
      { status: 500 }
    );
  }
}

// POST: azione su utente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, user_id } = body as {
      action: string;
      user_id: string;
      [key: string]: any;
    };

    if (!action || !user_id) {
      return NextResponse.json(
        { error: 'action e user_id sono obbligatori.' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // ---- attiva / disattiva ----
    if (action === 'toggleActive') {
      const { disabled } = body as { disabled: boolean };

      const { error } = await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: { disabled },
      });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { ok: true, disabled },
        { status: 200 }
      );
    }

    // ---- update profilo (ruolo + negozio, area derivata dal negozio) ----
    if (action === 'updateProfile') {
      const { role, store_id } = body as {
        role: string;
        store_id: string | null;
      };

      let area_id: string | null = null;

      if (store_id) {
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('area_id')
          .eq('id', store_id)
          .single();

        if (storeError) {
          return NextResponse.json(
            { error: storeError.message },
            { status: 500 }
          );
        }

        area_id = (storeData as any)?.area_id ?? null;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          role,
          store_id: store_id || null,
          area_id,
        })
        .eq('id', user_id);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // ---- reset password ----
    if (action === 'resetPassword') {
      const { new_password } = body as { new_password: string };

      if (!new_password) {
        return NextResponse.json(
          { error: 'new_password mancante.' },
          { status: 400 }
        );
      }

      const { error } = await supabase.auth.admin.updateUserById(user_id, {
        password: new_password,
      });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // ---- elimina utente ----
    if (action === 'deleteUser') {
      // prima profilo, poi auth (per sicurezza FK)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user_id);

      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 }
        );
      }

      const { error: authError } = await supabase.auth.admin.deleteUser(
        user_id
      );

      if (authError) {
        return NextResponse.json(
          { error: authError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Azione non supportata.' },
      { status: 400 }
    );
  } catch (e: any) {
    console.error('/api/admin/users POST error', e);
    return NextResponse.json(
      { error: e?.message ?? 'Errore sconosciuto' },
      { status: 500 }
    );
  }
}
