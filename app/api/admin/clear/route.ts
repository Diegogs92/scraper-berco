import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/firebase';

/**
 * Endpoint para limpiar toda la información del scraper
 * Solo accesible para desarrolladores
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Solo desarrollador puede limpiar todo
    if (decoded.rol !== 'desarrollador') {
      return NextResponse.json(
        { error: 'Solo el desarrollador puede limpiar el sistema' },
        { status: 403 }
      );
    }

    const { type } = await req.json();

    let deletedCount = 0;
    let message = '';

    switch (type) {
      case 'urls':
        // Limpiar todas las URLs
        const urlsSnapshot = await db.collection('urls').get();
        const urlsDeletePromises = urlsSnapshot.docs.map((doc) => doc.ref.delete());
        await Promise.all(urlsDeletePromises);
        deletedCount = urlsSnapshot.size;
        message = `Se eliminaron ${deletedCount} URLs`;
        break;

      case 'resultados':
        // Limpiar todos los resultados
        const resultadosSnapshot = await db.collection('resultados').get();
        const resultadosDeletePromises = resultadosSnapshot.docs.map((doc) => doc.ref.delete());
        await Promise.all(resultadosDeletePromises);
        deletedCount = resultadosSnapshot.size;
        message = `Se eliminaron ${deletedCount} resultados`;
        break;

      case 'all':
        // Limpiar URLs y resultados
        const [urlsSnap, resultadosSnap] = await Promise.all([
          db.collection('urls').get(),
          db.collection('resultados').get(),
        ]);

        await Promise.all([
          ...urlsSnap.docs.map((doc) => doc.ref.delete()),
          ...resultadosSnap.docs.map((doc) => doc.ref.delete()),
        ]);

        // Resetear configuración del scraper
        await db.collection('config').doc('scraper').set({
          scrapingActivo: false,
          ultimaEjecucion: null,
        });

        deletedCount = urlsSnap.size + resultadosSnap.size;
        message = `Sistema limpiado: ${urlsSnap.size} URLs y ${resultadosSnap.size} resultados eliminados`;
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo inválido. Use: urls, resultados, o all' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message,
      deletedCount,
    });
  } catch (error) {
    console.error('POST /api/admin/clear error', error);
    return NextResponse.json({ error: 'Error al limpiar el sistema' }, { status: 500 });
  }
}
