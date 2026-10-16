export type CharSets = {
  lower: boolean
  upper: boolean
  digits: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*-_=+?~'
const AMBIGUOUS = new Set('0OIl1|`')

export type Strength = {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  entropyBits: number
}

function poolFromOptions(options: CharSets): string {
  let pool = ''
  if (options.lower) pool += LOWER
  if (options.upper) pool += UPPER
  if (options.digits) pool += DIGITS
  if (options.symbols) pool += SYMBOLS
  if (options.excludeAmbiguous) {
    pool = [...pool].filter((c) => !AMBIGUOUS.has(c)).join('')
  }
  return pool
}

/** 密码学安全的均匀随机下标 */
function secureIndex(max: number): number {
  if (max <= 0) throw new Error('字符集为空')
  const limit = Math.floor(0x100000000 / max) * max
  const buf = new Uint32Array(1)
  for (;;) {
    crypto.getRandomValues(buf)
    if (buf[0]! < limit) return buf[0]! % max
  }
}

export function generatePassword(length: number, options: CharSets): string {
  const pool = poolFromOptions(options)
  if (!pool) throw new Error('请至少勾选一种字符类型')
  if (length < 4 || length > 128) throw new Error('长度需在 4–128 之间')

  // 保证每种已勾选类型至少出现一次
  const required: string[] = []
  const pushRequired = (chars: string, enabled: boolean) => {
    if (!enabled) return
    let set = chars
    if (options.excludeAmbiguous) {
      set = [...chars].filter((c) => !AMBIGUOUS.has(c)).join('')
    }
    if (set.length > 0) required.push(set[secureIndex(set.length)]!)
  }
  pushRequired(LOWER, options.lower)
  pushRequired(UPPER, options.upper)
  pushRequired(DIGITS, options.digits)
  pushRequired(SYMBOLS, options.symbols)

  const out: string[] = []
  for (let i = 0; i < length; i += 1) {
    out.push(pool[secureIndex(pool.length)]!)
  }

  // 把必含字符随机塞进结果
  for (let i = 0; i < required.length && i < length; i += 1) {
    const pos = secureIndex(length)
    out[pos] = required[i]!
  }

  return out.join('')
}

export function estimateStrength(password: string, options: CharSets): Strength {
  const pool = poolFromOptions(options)
  const poolSize = Math.max(pool.length, 1)
  const entropyBits = Math.round(password.length * Math.log2(poolSize))

  let score: Strength['score'] = 0
  if (entropyBits >= 90) score = 4
  else if (entropyBits >= 70) score = 3
  else if (entropyBits >= 50) score = 2
  else if (entropyBits >= 28) score = 1

  const labels = ['很弱', '较弱', '一般', '较强', '很强'] as const
  return { score, label: labels[score], entropyBits }
}

export function generateBatch(
  count: number,
  length: number,
  options: CharSets
): string[] {
  return Array.from({ length: count }, () => generatePassword(length, options))
}
