import fs from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const CSV_PATH = path.join(process.cwd(), 'data', 'openrice_tko.csv')
const DISTRICT = process.env.SEED_DISTRICT ?? '將軍澳'

// 簡單 RFC4180 parser（支援 quoted 欄，例如電話 "23300204, 60693500"）
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        cell += ch
      }
      continue
    }
    if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (ch === '\r') {
      // skip
    } else {
      cell += ch
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

function priceBand(value: string): { min: number | null; max: number | null } {
  const m = value.match(/(\d+)\s*-\s*(\d+)/)
  if (!m) return { min: null, max: null }
  return { min: Number(m[1]), max: Number(m[2]) }
}

function seats(value: string): number | null {
  const n = Number(value.trim())
  return Number.isInteger(n) && n > 0 ? n : null
}

function poiId(value: string): string | null {
  const m = value.match(/poiId=(\d+)/)
  return m ? m[1] : null
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing')

  const raw = fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, '')
  const rows = parseCsv(raw)
  const header = rows[0]
  const idx = (name: string) => header.indexOf(name)

  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  })

  let created = 0
  let updated = 0
  let skipped = 0

  for (const r of rows.slice(1)) {
    const id = poiId(r[idx('備註')] ?? '')
    if (!id) {
      skipped++
      continue
    }

    const band = priceBand(r[idx('人均價錢')] ?? '')
    const cuisines = (r[idx('類型')] ?? '')
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean)

    const data = {
      nameZh: r[idx('中文名')] || null,
      nameEn: r[idx('英文名')] || null,
      address: r[idx('地址')] || '',
      district: DISTRICT,
      cuisines,
      priceMin: band.min,
      priceMax: band.max,
      seats: seats(r[idx('座位')] ?? ''),
      phone: r[idx('電話')] || null,
      notes: r[idx('備註')] || null,
      licence: r[idx('食環署核對')] || null,
      hours: r[idx('營業時間')] || null,
      source: r[idx('來源')] || 'OpenRice',
      poiId: id,
    }

    const existing = await prisma.restaurant.findUnique({ where: { poiId: id } })
    if (existing) {
      await prisma.restaurant.update({ where: { poiId: id }, data })
      updated++
    } else {
      await prisma.restaurant.create({ data })
      created++
    }
  }

  console.log(`seed: created=${created} updated=${updated} skipped=${skipped} district=${DISTRICT}`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
