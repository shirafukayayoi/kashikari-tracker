import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'kashikari-tracker-history'

const initialEntries = [
  {
    id: 1,
    type: 'borrow',
    person: '先輩A',
    amount: 12000,
    note: '終電を逃した夜',
    date: '2026-05-08',
  },
  {
    id: 2,
    type: 'borrow',
    person: '友人B',
    amount: 4800,
    note: '昼飯とタクシー',
    date: '2026-05-10',
  },
]

const currency = new Intl.NumberFormat('ja-JP')

function loadEntries() {
  const saved = window.localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return initialEntries
  }

  try {
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : initialEntries
  } catch {
    return initialEntries
  }
}

function App() {
  const [entries, setEntries] = useState(loadEntries)
  const [person, setPerson] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [flash, setFlash] = useState(false)
  const [jackpotBurst, setJackpotBurst] = useState(false)
  const [entryType, setEntryType] = useState('borrow')

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    if (!flash) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setFlash(false)
    }, 4200)

    return () => window.clearTimeout(timeoutId)
  }, [flash])

  useEffect(() => {
    if (!jackpotBurst) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setJackpotBurst(false)
    }, 1800)

    return () => window.clearTimeout(timeoutId)
  }, [jackpotBurst])

  const stats = useMemo(() => {
    const borrowed = entries
      .filter((entry) => entry.type === 'borrow')
      .reduce((sum, entry) => sum + entry.amount, 0)

    const repaid = entries
      .filter((entry) => entry.type === 'repay')
      .reduce((sum, entry) => sum + entry.amount, 0)

    const total = borrowed - repaid
    const lenders = new Set(entries.map((entry) => entry.person).filter(Boolean)).size

    return { borrowed, repaid, total, lenders }
  }, [entries])

  const personSuggestions = useMemo(() => {
    return [...new Set(entries.map((entry) => entry.person).filter(Boolean))]
  }, [entries])

  const mood = stats.total > 0 ? 'gloom' : 'fever'

  function submitEntry(type) {
    const parsedAmount = Number(amount)

    if (!person.trim() || !parsedAmount || parsedAmount < 0) {
      return
    }

    const nextEntry = {
      id: Date.now(),
      type,
      person: person.trim(),
      amount: parsedAmount,
      note: note.trim(),
      date,
    }

    const nextEntries = [nextEntry, ...entries]
    setEntries(nextEntries)
    setAmount('')
    setNote('')
    setPerson('')

    const nextBorrowed =
      stats.borrowed + (type === 'borrow' ? parsedAmount : 0)
    const nextRepaid =
      stats.repaid + (type === 'repay' ? parsedAmount : 0)

    if (type === 'repay') {
      setJackpotBurst(false)
      window.requestAnimationFrame(() => {
        setJackpotBurst(true)
      })
    }

    if (nextBorrowed - nextRepaid <= 0) {
      setFlash(true)
    }
  }

  return (
    <main className={`app ${mood} ${flash ? 'flash-mode' : ''}`}>
      <div className="background-layer" aria-hidden="true">
        <div className="vignette" />
        <div className="scanlines" />
        <div className="strobe-layer" />
        <div className="lights">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="marquee-beams">
          <span />
          <span />
          <span />
        </div>
        <div className="confetti confetti-a" />
        <div className="confetti confetti-b" />
      </div>

      {jackpotBurst ? (
        <div className="jackpot-overlay" aria-hidden="true">
          <div className="jackpot-reel jackpot-left">
            <span>777</span>
            <span>777</span>
            <span>777</span>
          </div>
          <div className="jackpot-center">
            <strong>COMPLETE</strong>
            <b>777</b>
          </div>
          <div className="jackpot-reel jackpot-right">
            <span>COMPLETE</span>
            <span>COMPLETE</span>
            <span>COMPLETE</span>
          </div>
        </div>
      ) : null}

      <section className="hero-panel">
        <p className="eyebrow">借金可視化システム</p>
        <h1>借りた金の重さを、毎回ちゃんと見せる。</h1>
        <p className="lead">
          借りた瞬間は底の見えない闇。返し切った瞬間はパチンコの大当たり。
          その温度差ごと記録するサイトです。
        </p>

        <div className="status-strip">
          <div>
            <span>現在のムード</span>
            <strong>{mood === 'gloom' ? '返済待ちの暗黒期' : '完済フィーバー'}</strong>
          </div>
          <div>
            <span>関係者数</span>
            <strong>{stats.lenders}人</strong>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="panel debt-panel">
          <p className="panel-label">TOTAL DAMAGE</p>
          <div className="debt-amount">¥{currency.format(Math.max(stats.total, 0))}</div>
          <p className="debt-copy">
            {stats.total > 0
              ? 'まだ返していない金額。画面全体を暗くする原因です。'
              : '未返済ゼロ。祝福演出を受ける権利があります。'}
          </p>

          <div className="stat-row">
            <article className="stat-card borrow">
              <span>借りた総額</span>
              <strong>¥{currency.format(stats.borrowed)}</strong>
            </article>
            <article className="stat-card repay">
              <span>返した総額</span>
              <strong>¥{currency.format(stats.repaid)}</strong>
            </article>
          </div>
        </div>

        <form className="panel form-panel" onSubmit={(event) => event.preventDefault()}>
          <p className="panel-label">ENTRY CONTROL</p>
          <div className="type-toggle" role="tablist" aria-label="記録タイプ">
            <button
              type="button"
              className={entryType === 'borrow' ? 'toggle-chip active borrow-chip' : 'toggle-chip'}
              onClick={() => setEntryType('borrow')}
            >
              借りた入力
            </button>
            <button
              type="button"
              className={entryType === 'repay' ? 'toggle-chip active repay-chip' : 'toggle-chip'}
              onClick={() => setEntryType('repay')}
            >
              返した入力
            </button>
          </div>
          <label>
            {entryType === 'borrow' ? '誰から借りた' : '誰に返した'}
            <input
              value={person}
              onChange={(event) => setPerson(event.target.value)}
              placeholder={entryType === 'borrow' ? '例: 田中 / 親 / 同僚' : '候補から選ぶか直接入力'}
              list="person-suggestions"
            />
          </label>
          <label>
            金額
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="numeric"
              placeholder="例: 5000"
            />
          </label>
          <label>
            日付
            <input value={date} onChange={(event) => setDate(event.target.value)} type="date" />
          </label>
          <label>
            メモ
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="何に消えた金なのか"
              rows="3"
            />
          </label>

          <div className="action-row">
            <button type="button" className="doom-button" onClick={() => submitEntry('borrow')}>
              借りた
            </button>
            <button type="button" className="fever-button" onClick={() => submitEntry('repay')}>
              返した
            </button>
          </div>
          <datalist id="person-suggestions">
            {personSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </form>
      </section>

      <section className="panel history-panel">
        <div className="history-header">
          <div>
            <p className="panel-label">HISTORY</p>
            <h2>借金ログ</h2>
          </div>
          {flash ? <div className="jackpot-banner">完済おめでとう！！！！</div> : null}
        </div>

        <div className="history-list">
          {entries.map((entry) => (
            <article key={entry.id} className={`entry-card ${entry.type}`}>
              <div className="entry-main">
                <p>{entry.type === 'borrow' ? '借入' : '返済'}</p>
                <strong>{entry.person}</strong>
                <span>{entry.note || 'メモなし'}</span>
              </div>
              <div className="entry-side">
                <strong>¥{currency.format(entry.amount)}</strong>
                <span>{entry.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
