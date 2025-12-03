import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL non configurata');
}
if (!serviceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY non configurata');
}

export async function POST(request: Request) {
  try {
    if (!serviceKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY non configurata sul server.' },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      email,
      password,
      role,
      organization_id,
      store_id,
      area_id,
    } = body as {
      email: string;
      password: string;
      role: string;
      organization_id: string;
      store_id?: string | null;
      area_id?: string | null;
    };

    if (!email || !password || !role || !organization_id) {
      return NextResponse.json(
        { error: 'Dati mancanti (email, password, role, organization_id).' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1) crea utente auth
    const { data: userRes, error: userError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (userError || !userRes.user) {
      return NextResponse.json(
        { error: userError?.message ?? 'Errore nella creazione dell\'utente.' },
        { status: 500 }
      );
    }

    const newUser = userRes.user;

    // 2) crea profilo
    const { error: profileError } = await supabase.from('profiles').insert({
      id: newUser.id,
      organization_id,
      store_id: store_id ?? null,
      area_id: area_id ?? null,
      role, // enum user_role
    });

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        user_id: newUser.id,
        email: newUser.email,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error('create-users ERROR', e);
    return NextResponse.json(
      { error: e?.message ?? 'Errore sconosciuto.' },
      { status: 500 }
    );
  }
}
