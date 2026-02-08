import { prisma } from '@/app/lib/prisma'

/**
 * Yeni kullanıcı için sıradaki userNo'yu döndürür.
 * 000001'den başlar, 6 haneli (max 999999).
 */
export async function getNextUserNo(): Promise<number> {
  const result = await prisma.user.aggregate({
    _max: { userNo: true },
    _count: { id: true },
  })
  const maxNo = result._max.userNo ?? 0
  const nextNo = maxNo + 1
  if (nextNo > 999999) {
    throw new Error('Maksimum kullanıcı numarası limitine ulaşıldı (999999)')
  }
  return nextNo
}

/**
 * userNo'yu 6 haneli string formatında döndürür (örn: "000001")
 */
export function formatUserNo(userNo: number | null | undefined): string {
  if (userNo == null) return '-'
  return String(userNo).padStart(6, '0')
}
