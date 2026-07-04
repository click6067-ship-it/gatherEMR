import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Chunk } from './chunking';
import { detect } from './deid';

/** Server-side Supabase client. Prefers the SECRET key when present; otherwise
 * falls back to the publishable (anon) key governed by RLS. */
export function serverClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Supabase env not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

export type SaveInput = {
  sessionId: string;
  specialty: string;
  maskedText: string; // MUST be de-identified — this is the ONLY source text stored
  chunks: Chunk[];
  summary: unknown; // ResolvedSummary
  lint: unknown;
  model: string;
};

export type StoredDocument = {
  id: string;
  sessionId: string;
  specialty: string;
  maskedText: string;
  chunks: Chunk[];
  summary: unknown;
  lint: unknown;
  model: string;
  createdAt: string;
};

export async function saveDocument(db: SupabaseClient, input: SaveInput): Promise<{ documentId: string }> {
  // Hard guard: never persist text that still contains detectable identifiers.
  if (detect(input.maskedText).length > 0) {
    throw new Error('saveDocument: residual identifiers detected — refusing to store non-de-identified text');
  }
  const { data: doc, error: e1 } = await db
    .from('documents')
    .insert({ session_id: input.sessionId, specialty: input.specialty, masked_text: input.maskedText })
    .select('id')
    .single();
  if (e1 || !doc) throw new Error(`saveDocument documents: ${e1?.message}`);
  const documentId = doc.id as string;

  const { error: e2 } = await db.from('chunks').insert(
    input.chunks.map((c) => ({
      document_id: documentId,
      id: c.id,
      start_pos: c.start,
      end_pos: c.end,
      line: c.line,
      text: c.text,
    })),
  );
  if (e2) throw new Error(`saveDocument chunks: ${e2.message}`);

  const { error: e3 } = await db.from('summaries').insert({
    document_id: documentId,
    specialty: input.specialty,
    content: input.summary,
    lint: input.lint,
    model: input.model,
  });
  if (e3) throw new Error(`saveDocument summaries: ${e3.message}`);

  return { documentId };
}

export async function getDocument(db: SupabaseClient, id: string): Promise<StoredDocument | null> {
  const { data: doc } = await db.from('documents').select('*').eq('id', id).maybeSingle();
  if (!doc) return null;
  const { data: chunkRows } = await db
    .from('chunks')
    .select('*')
    .eq('document_id', id)
    .order('line', { ascending: true });
  const { data: sum } = await db
    .from('summaries')
    .select('*')
    .eq('document_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return {
    id: doc.id,
    sessionId: doc.session_id,
    specialty: doc.specialty,
    maskedText: doc.masked_text,
    chunks: (chunkRows ?? []).map((r) => ({
      id: r.id, start: r.start_pos, end: r.end_pos, line: r.line, text: r.text,
    })),
    summary: sum?.content ?? null,
    lint: sum?.lint ?? [],
    model: sum?.model ?? '',
    createdAt: doc.created_at,
  };
}

/** Anonymous capability-URL delete: removes the document; chunks/summaries
 * cascade via FK. */
export async function deleteDocument(db: SupabaseClient, id: string): Promise<void> {
  const { error } = await db.from('documents').delete().eq('id', id);
  if (error) throw new Error(`deleteDocument: ${error.message}`);
}
