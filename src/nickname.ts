/** 中文网名生成：流行风格词库，本地安全随机 */

/** 文艺唯美 · 完整网名 */
const LITERARY = [
  '浅笑安然',
  '余生请多指教',
  '南风知我意',
  '岁月如歌',
  '浮生若梦',
  '清茶与酒',
  '北城以北',
  '南城旧梦',
  '旧事晚风',
  '山河无恙',
  '温柔乡',
  '月光倾城',
  '清风挽酒',
  '星河滚烫',
  '人间清欢',
  '江南暮色',
  '长安故里',
  '一纸荒年',
  '人间失格',
  '你是人间理想',
  '且听风吟',
  '偷得浮生',
  '晚风温柔',
  '心有猛虎',
  '岁岁平安',
  '万事胜意',
  '平安喜乐',
  '好事发生',
  '今日晴朗',
  '自在如风'
]

/** 可爱搞怪 */
const CUTE_FULL = [
  '吃不饱的猪',
  '困困小羊',
  '奶盖三分糖',
  '一只小废物',
  '今天也想喝奶',
  '草莓味的风',
  '甜甜圈本甜',
  '佛系小青年',
  '社恐但可爱',
  '摸鱼小能手',
  '熬夜冠军',
  '摆烂小天才',
  '快乐干饭人',
  '奶茶续命选手',
  '被窝探险家',
  '拖延症晚期',
  '人间小甜瓜',
  '可爱超标了',
  '今天也很困',
  '不想起床鸭'
]

const CUTE_PREFIX = ['小', '一只', '半个', '野生', '迷路', '社恐', '佛系', '摆烂']
const CUTE_NOUN = [
  '团子',
  '布丁',
  '奶盖',
  '泡芙',
  '仓鼠',
  '兔子',
  '企鹅',
  '柴犬',
  '橘猫',
  '水豚',
  '考拉',
  '糯米',
  '芋圆',
  '麻薯',
  '曲奇',
  '可乐',
  '西瓜',
  '草莓'
]

/** 酷帅个性 */
const COOL_FULL = [
  '孤独患者',
  '杀红了眼',
  '不羁的风',
  '绝版好男人',
  '限量版疯子',
  '生人勿近',
  '往事随风',
  '一念成执',
  '再战江湖',
  '逆风而行',
  '傲骨难屈',
  '浪子回头',
  '旧城旧梦',
  '北岛迷途',
  '南巷清风',
  '浅墨入画',
  '长夜难明',
  '不问归期',
  '笑看风云',
  '独步天下'
]

const COOL_ADJ = ['孤独', '清冷', '不羁', '狂野', '沉默', '绝版', '限量', '逆风', '旧城', '浅墨']
const COOL_NOUN = ['患者', '浪子', '旅人', '过客', '诗人', '猎人', '玩家', '少年', '疯子', '行者']

/** 简约两字三字 */
const MINIMAL = [
  '阿离',
  '南巷',
  '北陌',
  '子柒',
  '初遇',
  '北念',
  '清欢',
  '浅墨',
  '凉城',
  '墨白',
  '浅夏',
  '星野',
  '鹿鸣',
  '云深',
  '归途',
  '晚棠',
  '青衫',
  '白栀',
  '时雨',
  '沐风',
  '听澜',
  '予安',
  '知秋',
  '念安',
  '予初',
  '亦辰',
  '景行',
  '望舒',
  '清川',
  '北辰'
]

const DECOR_LEFT = ['丶', '乄', '°', 'ζ', '๓', '『', '「']
const DECOR_RIGHT = ['丶', '乄', '°', '』', '」', '~~', '']

export type NicknameStyle = 'literary' | 'cute' | 'cool' | 'minimal'

export type NicknameOptions = {
  style: NicknameStyle
  /** 末尾随机数字（QQ 风） */
  digits: number
  /** 偶尔加装饰符号 */
  decor: boolean
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

function randomDigits(count: number): string {
  if (count <= 0) return ''
  let out = ''
  for (let i = 0; i < count; i += 1) {
    out += String(secureIndex(10))
  }
  return out
}

function maybeDecor(base: string, options: NicknameOptions): string {
  let name = base
  if (options.decor && secureIndex(3) === 0) {
    const left = pick(DECOR_LEFT)
    const right = pick(DECOR_RIGHT)
    name = `${left}${name}${right}`
  }
  return `${name}${randomDigits(options.digits)}`
}

export function generateNickname(options: NicknameOptions): string {
  if (options.style === 'literary') {
    return maybeDecor(pick(LITERARY), options)
  }

  if (options.style === 'cute') {
    if (secureIndex(2) === 0) {
      return maybeDecor(pick(CUTE_FULL), options)
    }
    const tpl = secureIndex(2) === 0
      ? `${pick(CUTE_PREFIX)}${pick(CUTE_NOUN)}`
      : `${pick(CUTE_NOUN)}本${pick(['甜', '萌', '乖', '酷', '飒'])}`
    return maybeDecor(tpl, options)
  }

  if (options.style === 'cool') {
    if (secureIndex(2) === 0) {
      return maybeDecor(pick(COOL_FULL), options)
    }
    return maybeDecor(`${pick(COOL_ADJ)}${pick(COOL_NOUN)}`, options)
  }

  // minimal
  return maybeDecor(pick(MINIMAL), options)
}

export function generateNicknameBatch(count: number, options: NicknameOptions): string[] {
  const n = Math.min(20, Math.max(1, count))
  const set = new Set<string>()
  let guard = 0
  while (set.size < n && guard < n * 24) {
    set.add(generateNickname(options))
    guard += 1
  }
  return [...set]
}
