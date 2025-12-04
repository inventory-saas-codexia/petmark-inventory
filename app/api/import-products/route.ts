// app/api/import-products/route.ts
import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type RawCsvRow = {
  sku?: string;
  name?: string;
  category?: string;
  brand?: string;
  is_active?: string;
};

type CleanProductRow = {
  organization_id: string;
  sku: string;
  name: string;
  category: string | null;
  brand: string | null;
  is_active: boolean;
};

const BATCH_SIZE = 1000;

function parseBoolean(value: string | undefined): boolean {
  if (!value) return true; // default true
  const v = value.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'y';
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const organizationIdValue = formData.get('organization_id');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'CSV file is required (field name: file)' },
        { status: 400 }
      );
    }

    if (!organizationIdValue || typeof organizationIdValue !== 'string') {
      return NextResponse.json(
        { error: 'organization_id is required' },
        { status: 400 }
      );
    }

    const organizationId = organizationIdValue;

    const text = await (file as File).text();

    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as RawCsvRow[];

    const cleanRows: CleanProductRow[] = [];
    const errors: { line: number; message: string; row: RawCsvRow }[] = [];

    records.forEach((row, index) => {
      const lineNumber = index + 2; // header = line 1

      const sku = row.sku?.trim();
      const name = row.name?.trim();

      if (!sku || !name) {
        errors.push({
          line: lineNumber,
          message: 'Missing sku or name',
          row,
        });
        return;
      }

      cleanRows.push({
        organization_id: organizationId,
        sku,
        name,
        category: row.category?.trim() || null,
        brand: row.brand?.trim() || null,
        is_active: parseBoolean(row.is_active),
      });
    });

    if (cleanRows.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid rows to import',
          errors,
        },
        { status: 400 }
      );
    }

    let processed = 0;

    // batch upsert
    for (let i = 0; i < cleanRows.length; i += BATCH_SIZE) {
      const batch = cleanRows.slice(i, i + BATCH_SIZE);

      const { error } = await supabaseAdmin
        .from('products')
        .upsert(batch, { onConflict: 'organization_id,sku' });

      if (error) {
        return NextResponse.json(
          {
            error: 'Supabase upsert error',
            details: error.message,
            processed,
            partial: i > 0,
          },
          { status: 500 }
        );
      }

      processed += batch.length;
    }

    return NextResponse.json({
      ok: true,
      processed,
      skipped: errors.length,
      errors,
    });
  } catch (err: unknown) {
    console.error('Import products error', err);
    const message = err instanceof Error ? err.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Unexpected error',
        details: message,
      },
      { status: 500 }
    );
  }
}
