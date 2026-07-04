import { NextResponse } from 'next/server';
import { serverClient, deleteDocument } from '@/lib/supabase';
import { rateLimit, clientIp } from '@/lib/rateLimit';

/** Anonymous capability-URL delete (document id is an unguessable uuid). Live
 * only when Supabase is reachable. */
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const rl = rateLimit(`del:${clientIp(req)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: '요청이 너무 많습니다.' }, { status: 429 });
  }
  const { id } = await ctx.params;
  try {
    await deleteDocument(serverClient(), id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
