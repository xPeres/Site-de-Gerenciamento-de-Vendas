import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id: number = Number(searchParams.get("id"))

  try {
    const vendas = await prisma.vendas.findMany({
      where: { idLoja: id },
      orderBy: { id: 'desc' },
      take: 3
    })

    const compradores = await Promise.all(
      vendas.map(async (row) => {
        const usuario = await prisma.usuario.findUnique({
          where: { id: row.comprador },
        });

        if (!usuario) throw new Error("Usuário não encontrado");

        return {
          ordem: row.order,
          comprador: usuario.nome,
          data: row.rg,
          status: row.status
        };
      })
    );

    return NextResponse.json(compradores);
  } catch(err) {
    console.error("[GET Ultimos Pedidos]:", err)
    return new NextResponse("Erro ao encontrar dados", { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
