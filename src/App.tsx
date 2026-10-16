import { useEffect, useMemo, useRef, useState } from 'react'
import {
  estimateStrength,
  generateBatch,
  generatePassword,
  type CharSets
} from './password'
import {
  generateUsername,
  generateUsernameBatch,
  type UsernameOptions,
  type UsernameStyle
} from './username'
import {
  generateNickname,
  generateNicknameBatch,
  type NicknameOptions,
  type NicknameStyle
} from './nickname'

const DEFAULT_OPTS: CharSets = {
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: true
}

const DEFAULT_USER: UsernameOptions = {
  style: 'compact',
  digits: 2,
  separator: '',
  capitalize: false
}

const DEFAULT_NICK: NicknameOptions = {
  style: 'literary',
  digits: 0,
  decor: true
}

const SCRAMBLE = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%*风云月明星辰浅笑安然'

type TabId = 'password' | 'username' | 'nickname'

function useRolledText(target: string, spinning: boolean) {
  const [display, setDisplay] = useState(target)
  const frame = useRef(0)

  useEffect(() => {
    if (!spinning) {
      setDisplay(target)
      return
    }
    let tick = 0
    const maxTicks = 14
    cancelAnimationFrame(frame.current)
    const step = () => {
      tick += 1
      const next = target
        .split('')
        .map((ch, i) => {
          if (tick > maxTicks - 3 + (i % 3)) return ch
          return SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]!
        })
        .join('')
      setDisplay(next)
      if (tick < maxTicks) {
        frame.current = requestAnimationFrame(step)
      } else {
        setDisplay(target)
      }
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [target, spinning])

  return display
}

export default function App() {
  const [tab, setTab] = useState<TabId>('password')

  const [length, setLength] = useState(20)
  const [opts, setOpts] = useState<CharSets>(DEFAULT_OPTS)
  const [password, setPassword] = useState('')
  const [batch, setBatch] = useState<string[]>([])
  const [spinToken, setSpinToken] = useState(0)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const [userOpts, setUserOpts] = useState<UsernameOptions>(DEFAULT_USER)
  const [username, setUsername] = useState('')
  const [userBatch, setUserBatch] = useState<string[]>([])
  const [userSpin, setUserSpin] = useState(0)
  const [userCopied, setUserCopied] = useState(false)

  const [nickOpts, setNickOpts] = useState<NicknameOptions>(DEFAULT_NICK)
  const [nickname, setNickname] = useState('')
  const [nickBatch, setNickBatch] = useState<string[]>([])
  const [nickSpin, setNickSpin] = useState(0)
  const [nickCopied, setNickCopied] = useState(false)

  const display = useRolledText(password, spinToken > 0)
  const userDisplay = useRolledText(username, userSpin > 0)
  const nickDisplay = useRolledText(nickname, nickSpin > 0)
  const strength = useMemo(
    () => (password ? estimateStrength(password, opts) : null),
    [password, opts]
  )

  const rollPassword = (next: string) => {
    setPassword(next)
    setSpinToken((n) => n + 1)
    setCopied(false)
    setError('')
  }

  const rollUsername = (next: string) => {
    setUsername(next)
    setUserSpin((n) => n + 1)
    setUserCopied(false)
    setError('')
  }

  const rollNickname = (next: string) => {
    setNickname(next)
    setNickSpin((n) => n + 1)
    setNickCopied(false)
    setError('')
  }

  const onGenerate = () => {
    try {
      rollPassword(generatePassword(length, opts))
      setBatch([])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const onBatch = () => {
    try {
      const list = generateBatch(6, length, opts)
      setBatch(list)
      rollPassword(list[0]!)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const onGenUser = () => {
    try {
      rollUsername(generateUsername(userOpts))
      setUserBatch([])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const onUserBatch = () => {
    try {
      const list = generateUsernameBatch(6, userOpts)
      setUserBatch(list)
      rollUsername(list[0]!)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const onGenNick = () => {
    try {
      rollNickname(generateNickname(nickOpts))
      setNickBatch([])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const onNickBatch = () => {
    try {
      const list = generateNicknameBatch(6, nickOpts)
      setNickBatch(list)
      rollNickname(list[0]!)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const onCopy = async (text: string, kind: 'password' | 'username' | 'nickname' = 'password') => {
    try {
      if (window.api?.writeClipboardText) {
        await window.api.writeClipboardText(text)
      } else {
        await navigator.clipboard.writeText(text)
      }
      if (kind === 'username') {
        setUserCopied(true)
        window.setTimeout(() => setUserCopied(false), 1600)
      } else if (kind === 'nickname') {
        setNickCopied(true)
        window.setTimeout(() => setNickCopied(false), 1600)
      } else {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      }
    } catch {
      setError('复制失败，请手动选择')
    }
  }

  useEffect(() => {
    try {
      setPassword(generatePassword(length, opts))
      setUsername(generateUsername(userOpts))
      setNickname(generateNickname(nickOpts))
    } catch {
      // ignore initial
    }
    // 仅首屏生成一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = (key: keyof CharSets) => {
    setOpts((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const setStyle = (style: UsernameStyle) => {
    setUserOpts((prev) => ({
      ...prev,
      style,
      separator:
        style === 'compact' ? '' : prev.separator || (style === 'handle' ? '_' : ''),
      capitalize: style === 'wordy' ? true : prev.capitalize
    }))
  }

  const setNickStyle = (style: NicknameStyle) => {
    setNickOpts((prev) => ({ ...prev, style }))
  }

  const tagline =
    tab === 'password'
      ? '掷一次，拿一把新钥匙'
      : tab === 'username'
        ? '掷一次，拿一个新用户名'
        : '掷一次，换一个流行网名'

  const footNote =
    tab === 'password'
      ? '字符从勾选集合中均匀抽取'
      : tab === 'username'
        ? '形容词 + 名词组合生成'
        : '文艺 / 可爱 / 酷帅 / 简约，流行中文网名词库'

  return (
    <div className="app">
      <div className="glow" aria-hidden />
      <header className="hero">
        <p className="brand">随密</p>
        <h1 className="tagline">{tagline}</h1>
        <p className="lead">本地生成 · 不上传 · 用浏览器安全随机源</p>
        <nav className="tabs" aria-label="功能">
          <button
            type="button"
            className={`tab ${tab === 'password' ? 'on' : ''}`}
            onClick={() => setTab('password')}
          >
            密码
          </button>
          <button
            type="button"
            className={`tab ${tab === 'username' ? 'on' : ''}`}
            onClick={() => setTab('username')}
          >
            用户名
          </button>
          <button
            type="button"
            className={`tab ${tab === 'nickname' ? 'on' : ''}`}
            onClick={() => setTab('nickname')}
          >
            网名
          </button>
        </nav>
      </header>

      {tab === 'password' && (
        <>
          <section className="dial" aria-live="polite">
            <div className="dial-ring">
              <code className={`password ${spinToken > 0 ? 'is-spinning' : ''}`}>
                {display || '····'}
              </code>
            </div>
            {strength && (
              <div className={`strength s-${strength.score}`}>
                <div
                  className="strength-bar"
                  style={{ width: `${(strength.score + 1) * 20}%` }}
                />
                <span>
                  {strength.label} · 约 {strength.entropyBits} bit
                </span>
              </div>
            )}
          </section>

          <section className="panel">
            <label className="length">
              <div className="length-head">
                <span>长度</span>
                <strong className="mono">{length}</strong>
              </div>
              <input
                type="range"
                min={8}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
              />
            </label>

            <div className="toggles">
              {(
                [
                  ['lower', '小写 a-z'],
                  ['upper', '大写 A-Z'],
                  ['digits', '数字 0-9'],
                  ['symbols', '符号 !@#'],
                  ['excludeAmbiguous', '排除易混 0OIl1']
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`chip ${opts[key] ? 'on' : ''}`}
                  aria-pressed={opts[key]}
                  onClick={() => toggle(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {error && <p className="error">{error}</p>}

            <div className="actions">
              <button type="button" className="primary" onClick={onGenerate}>
                再掷一次
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => void onCopy(password)}
                disabled={!password}
              >
                {copied ? '已复制' : '复制'}
              </button>
              <button type="button" className="ghost" onClick={onBatch}>
                一次六个
              </button>
            </div>
          </section>

          {batch.length > 0 && (
            <section className="batch">
              <h2>备选</h2>
              <ul>
                {batch.map((item) => (
                  <li key={item}>
                    <code className="mono">{item}</code>
                    <button
                      type="button"
                      className="mini"
                      onClick={() => void onCopy(item)}
                    >
                      复制
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {tab === 'username' && (
        <>
          <section className="dial" aria-live="polite">
            <div className="dial-ring">
              <code className={`password ${userSpin > 0 ? 'is-spinning' : ''}`}>
                {userDisplay || '····'}
              </code>
            </div>
            <p className="user-hint">可读词组用户名，适合注册账号时快速取名</p>
          </section>

          <section className="panel">
            <div className="toggles">
              {(
                [
                  ['compact', '紧凑 coolfox42'],
                  ['handle', '手柄 cool_fox_42'],
                  ['wordy', '标题 Cool_Fox_42']
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`chip ${userOpts.style === key ? 'on' : ''}`}
                  aria-pressed={userOpts.style === key}
                  onClick={() => setStyle(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="length">
              <div className="length-head">
                <span>尾部数字位数</span>
                <strong className="mono">{userOpts.digits}</strong>
              </div>
              <input
                type="range"
                min={0}
                max={6}
                value={userOpts.digits}
                onChange={(e) =>
                  setUserOpts((prev) => ({ ...prev, digits: Number(e.target.value) }))
                }
              />
            </label>

            {userOpts.style !== 'compact' && (
              <div className="toggles">
                {(
                  [
                    ['', '无分隔'],
                    ['_', '下划线 _'],
                    ['.', '点 .']
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={label}
                    type="button"
                    className={`chip ${userOpts.separator === key ? 'on' : ''}`}
                    onClick={() => setUserOpts((prev) => ({ ...prev, separator: key }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="toggles">
              <button
                type="button"
                className={`chip ${userOpts.capitalize ? 'on' : ''}`}
                aria-pressed={userOpts.capitalize}
                onClick={() =>
                  setUserOpts((prev) => ({ ...prev, capitalize: !prev.capitalize }))
                }
              >
                首字母大写
              </button>
            </div>

            {error && <p className="error">{error}</p>}

            <div className="actions">
              <button type="button" className="primary" onClick={onGenUser}>
                再掷一次
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => void onCopy(username, 'username')}
                disabled={!username}
              >
                {userCopied ? '已复制' : '复制'}
              </button>
              <button type="button" className="ghost" onClick={onUserBatch}>
                一次六个
              </button>
            </div>
          </section>

          {userBatch.length > 0 && (
            <section className="batch">
              <h2>备选用户名</h2>
              <ul>
                {userBatch.map((item) => (
                  <li key={item}>
                    <code className="mono">{item}</code>
                    <button
                      type="button"
                      className="mini"
                      onClick={() => void onCopy(item, 'username')}
                    >
                      复制
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {tab === 'nickname' && (
        <>
          <section className="dial" aria-live="polite">
            <div className="dial-ring">
              <code className={`password net-name ${nickSpin > 0 ? 'is-spinning' : ''}`}>
                {nickDisplay || '····'}
              </code>
            </div>
            <p className="user-hint">流行中文网名，适合游戏、社交、论坛注册</p>
          </section>

          <section className="panel">
            <div className="toggles">
              {(
                [
                  ['literary', '文艺 浅笑安然'],
                  ['cute', '可爱 困困小羊'],
                  ['cool', '酷帅 孤独患者'],
                  ['minimal', '简约 南巷']
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`chip ${nickOpts.style === key ? 'on' : ''}`}
                  aria-pressed={nickOpts.style === key}
                  onClick={() => setNickStyle(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="toggles">
              <button
                type="button"
                className={`chip ${nickOpts.decor ? 'on' : ''}`}
                aria-pressed={nickOpts.decor}
                onClick={() => setNickOpts((prev) => ({ ...prev, decor: !prev.decor }))}
              >
                装饰符号 丶乄°
              </button>
            </div>

            <label className="length">
              <div className="length-head">
                <span>末尾数字位数</span>
                <strong className="mono">{nickOpts.digits}</strong>
              </div>
              <input
                type="range"
                min={0}
                max={4}
                value={nickOpts.digits}
                onChange={(e) =>
                  setNickOpts((prev) => ({ ...prev, digits: Number(e.target.value) }))
                }
              />
            </label>

            {error && <p className="error">{error}</p>}

            <div className="actions">
              <button type="button" className="primary" onClick={onGenNick}>
                再掷一次
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => void onCopy(nickname, 'nickname')}
                disabled={!nickname}
              >
                {nickCopied ? '已复制' : '复制'}
              </button>
              <button type="button" className="ghost" onClick={onNickBatch}>
                一次六个
              </button>
            </div>
          </section>

          {nickBatch.length > 0 && (
            <section className="batch">
              <h2>备选网名</h2>
              <ul>
                {nickBatch.map((item) => (
                  <li key={item}>
                    <code className="mono net-name">{item}</code>
                    <button
                      type="button"
                      className="mini"
                      onClick={() => void onCopy(item, 'nickname')}
                    >
                      复制
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <footer className="foot">
        Passroll · {footNote}
      </footer>
    </div>
  )
}
