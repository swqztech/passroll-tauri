/** 用户名生成：可读词组 + 可选数字，本地安全随机 */

const ADJECTIVES = [
  'amber',
  'bright',
  'calm',
  'clever',
  'cool',
  'crisp',
  'daring',
  'eager',
  'fair',
  'fast',
  'fresh',
  'gentle',
  'golden',
  'happy',
  'hidden',
  'keen',
  'kind',
  'light',
  'lucky',
  'mild',
  'neat',
  'noble',
  'plain',
  'quick',
  'quiet',
  'rapid',
  'sharp',
  'silent',
  'silver',
  'smart',
  'solid',
  'swift',
  'tidy',
  'vivid',
  'warm',
  'wise'
]

const NOUNS = [
  'apple',
  'arrow',
  'bear',
  'bird',
  'brook',
  'cloud',
  'coral',
  'crane',
  'creek',
  'deer',
  'eagle',
  'ember',
  'falcon',
  'field',
  'finch',
  'fox',
  'glade',
  'hawk',
  'lake',
  'leaf',
  'lion',
  'maple',
  'moon',
  'oak',
  'otter',
  'pine',
  'raven',
  'river',
  'robin',
  'stone',
  'storm',
  'tiger',
  'trail',
  'wave',
  'wolf',
  'cedar'
]

export type UsernameStyle = 'wordy' | 'compact' | 'handle'

export type UsernameOptions = {
  style: UsernameStyle
  /** 附加数字位数，0 表示不加 */
  digits: number
  /** 词间分隔：无 / 下划线 / 点 */
  separator: '' | '_' | '.'
  capitalize: boolean
}

function secureIndex(max: number): number {
  if (max <= 0) throw new Error('集合为空')
  const limit = Math.floor(0x100000000 / max) * max
  const buf = new Uint32Array(1)
  for (;;) {
    crypto.getRandomValues(buf)
    if (buf[0]! < limit) return buf[0]! % max
  }
}

function pick<T>(list: readonly T[]): T {
  return list[secureIndex(list.length)]!
}

function capitalizeWord(word: string, on: boolean) {
  if (!on || !word) return word
  return word[0]!.toUpperCase() + word.slice(1)
}

function randomDigits(count: number): string {
  if (count <= 0) return ''
  let out = ''
  for (let i = 0; i < count; i += 1) {
    out += String(secureIndex(10))
  }
  return out
}

export function generateUsername(options: UsernameOptions): string {
  const sep = options.separator
  const adj = capitalizeWord(pick(ADJECTIVES), options.capitalize)
  const noun = capitalizeWord(pick(NOUNS), options.capitalize)
  const digits = randomDigits(options.digits)

  if (options.style === 'compact') {
    // coolfox42
    return `${adj.toLowerCase()}${noun.toLowerCase()}${digits}`
  }

  if (options.style === 'handle') {
    // @cool_fox_42 风格，不含 @
    const parts = [adj.toLowerCase(), noun.toLowerCase()]
    if (digits) parts.push(digits)
    return parts.join(sep || '_')
  }

  // wordy: Cool_Fox_42
  const parts = [adj, noun]
  if (digits) parts.push(digits)
  return parts.join(sep)
}

export function generateUsernameBatch(count: number, options: UsernameOptions): string[] {
  const n = Math.min(20, Math.max(1, count))
  const set = new Set<string>()
  let guard = 0
  while (set.size < n && guard < n * 20) {
    set.add(generateUsername(options))
    guard += 1
  }
  return [...set]
}
