'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowserClient } from '../supabase/browserClient';

export interface StoreInventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string | null;
  product_brand: string | null;
  expiry_date: string; // ISO date
  quantity: number;
  batch_code: string | null;
  note: string | null;
  daysToExpiry: number | null;
}

interface UseStoreInventoryResult {
  items: StoreInventoryItem[];
  loading: boolean;
  error: string | null;
}

export function useStoreInventory(storeId: string | null): UseStoreInventoryResult {
  const [items, setItems] = useState<StoreInventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setItems([]);
      setLoading(false);
      setError('Nessun negozio associato al profilo.');
      return;
    }

    let isMounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabaseBrowserClient
        .from('inventory_batches')
        .select(
          `
          id,
          product_id,
          expiry_date,
          quantity,
          batch_code,
          note,
          products (
            name,
            sku,
            brand
          )
        `
        )
        .eq('store_id', storeId)
        .order('expiry_date', { ascending: true })
        .limit(200);

      if (!isMounted) return;

      if (error) {
        setError(error.message);
        setItems([]);
        setLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mapped: StoreInventoryItem[] = (data ?? []).map((row: any) => {
        let daysToExpiry: number | null = null;

        if (row.expiry_date) {
          const exp = new Date(row.expiry_date);
          exp.setHours(0, 0, 0, 0);

          const diffMs = exp.getTime() - today.getTime();
          daysToExpiry = Math.round(diffMs / (1000 * 60 * 60 * 24));
        }

        return {
          id: row.id,
          product_id: row.product_id,
          product_name: row.products?.name ?? 'Senza nome',
          product_sku: row.products?.sku ?? null,
          product_brand: row.products?.brand ?? null,
          expiry_date: row.expiry_date,
          quantity: row.quantity,
          batch_code: row.batch_code ?? null,
          note: row.note ?? null,
          daysToExpiry,
        };
      });

      setItems(mapped);
      setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [storeId]);

  return { items, loading, error };
}
