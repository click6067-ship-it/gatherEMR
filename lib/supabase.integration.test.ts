import { describe, it, expect } from 'vitest';
import { serverClient, saveDocument, getDocument, deleteDocument } from './supabase';
import { chunkText } from './chunking';

// Runs only when Supabase env is present (loaded via `node --env-file=.env.local`).
describe.skipIf(!process.env.NEXT_PUBLIC_SUPABASE_URL)('supabase round-trip', () => {
  it('saves, reads, and deletes a de-identified document', async () => {
    const db = serverClient();
    const masked = 'CC: chest pain\nTroponin 0.8 -> 2.1 (19:22 -> 20:46)';
    const chunks = chunkText(masked);

    const { documentId } = await saveDocument(db, {
      sessionId: 'integration-test',
      specialty: 'emergency',
      maskedText: masked,
      chunks,
      summary: { acuity: [{ text: 'Sick', citations: ['c1'], label: 'derived', span: { start: 0, end: 5 } }] },
      lint: [],
      model: 'gpt-5.5',
    });
    expect(documentId).toBeTruthy();

    const got = await getDocument(db, documentId);
    expect(got).not.toBeNull();
    expect(got!.maskedText).toBe(masked);
    expect(got!.chunks).toHaveLength(chunks.length);
    expect(got!.chunks[0].id).toBe('c1');

    await deleteDocument(db, documentId);
    expect(await getDocument(db, documentId)).toBeNull();
  }, 30_000);
});
