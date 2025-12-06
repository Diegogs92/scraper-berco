import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { detectProveedor } from '@/lib/scraper';
import { isoNow } from '@/lib/utils';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const docRef = db.collection('urls').doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: 'URL no encontrada' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      fechaAgregada: snapshot.data()?.fechaAgregada || isoNow(),
    };

    if (body.url) {
      updates.url = body.url;
      updates.proveedor = detectProveedor(body.url);
    }
    if (body.proveedor) updates.proveedor = body.proveedor;
    if (body.status) updates.status = body.status;

    await docRef.update(updates);
    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error('PATCH /api/urls/[id] error', error);
    return NextResponse.json({ error: 'No se pudo actualizar la URL' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const docRef = db.collection('urls').doc(id);
    await docRef.delete();

    // Eliminar resultados asociados
    const results = await db.collection('resultados').where('urlId', '==', id).get();
    if (!results.empty) {
      const batch = db.batch();
      results.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/urls/[id] error', error);
    return NextResponse.json({ error: 'No se pudo eliminar la URL' }, { status: 500 });
  }
}
