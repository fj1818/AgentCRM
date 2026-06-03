/** Utilidades de formato para Ofertas (replica money() del prototipo). */

export const money = (n: number | string): string =>
  '$' + Number(n || 0).toLocaleString('es-MX')

export function distinct(arr: string[]): string[] {
  return arr.filter((v, i) => arr.indexOf(v) === i).sort()
}

export function dmyToYmd(s: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s || '').trim())
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}
export function ymdToDmy(s: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim())
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}
