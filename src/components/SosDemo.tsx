import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

const HOLD_MS = 3000

const contacts = [
  { initials: 'CA', name: 'Carlos', role: 'Filho', tone: 'blue' },
  { initials: 'RO', name: 'Roberta', role: 'Neta', tone: 'green' },
  { initials: 'DR', name: 'Dr. Silva', role: 'Cardiologista', tone: 'purple' },
] as const

type Phase = 'idle' | 'holding' | 'sent'

export function SosDemo() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [notified, setNotified] = useState(0)
  const frame = useRef<number | null>(null)
  const start = useRef(0)

  const stopHold = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
  }

  const beginHold = () => {
    if (phase === 'sent') return
    setPhase('holding')
    start.current = performance.now()
    const tick = (now: number) => {
      const value = Math.min((now - start.current) / HOLD_MS, 1)
      setProgress(value)
      if (value >= 1) {
        stopHold()
        setPhase('sent')
        return
      }
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  const cancelHold = () => {
    if (phase !== 'holding') return
    stopHold()
    setPhase('idle')
    setProgress(0)
  }

  const reset = () => {
    setPhase('idle')
    setProgress(0)
    setNotified(0)
  }

  useEffect(() => {
    if (phase !== 'sent') return
    const timers = contacts.map((_, index) =>
      window.setTimeout(() => setNotified(index + 1), 450 * (index + 1)),
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [phase])

  useEffect(() => stopHold, [])

  const circumference = 2 * Math.PI * 92
  const secondsLeft = Math.ceil((1 - progress) * (HOLD_MS / 1000))

  return (
    <div className={`sos-demo sos-demo--${phase}`}>
      <div className="sos-demo__stage">
        <svg className="sos-demo__ring" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="92" className="sos-demo__ring-track" />
          <circle
            cx="100"
            cy="100"
            r="92"
            className="sos-demo__ring-progress"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
        <button
          type="button"
          className="sos-demo__button"
          onPointerDown={beginHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onKeyDown={(event) => {
            if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
              event.preventDefault()
              beginHold()
            }
          }}
          onKeyUp={cancelHold}
          onContextMenu={(event) => event.preventDefault()}
          aria-label="Simular botão SOS: pressione e segure por 3 segundos"
        >
          <Icon name="siren" size={34} />
          <span className="sos-demo__label">SOS</span>
          <span className="sos-demo__sub">
            {phase === 'holding' ? `Segure… ${secondsLeft}s` : phase === 'sent' ? 'Enviado' : 'Emergência'}
          </span>
        </button>
      </div>

      <div className="sos-demo__panel" aria-live="polite">
        {phase === 'sent' ? (
          <>
            <p className="sos-demo__status sos-demo__status--sent">
              <Icon name="check" size={18} /> Alerta disparado com localização
            </p>
            <ul className="sos-demo__contacts">
              {contacts.map((contact, index) => (
                <li
                  key={contact.initials}
                  className={index < notified ? 'is-notified' : undefined}
                >
                  <span className={`avatar avatar--${contact.tone}`}>{contact.initials}</span>
                  <span>
                    <strong>{contact.name}</strong>
                    <small>{contact.role}</small>
                  </span>
                  <em>{index < notified ? 'Notificado' : 'Enviando…'}</em>
                </li>
              ))}
            </ul>
            <button type="button" className="link-button" onClick={reset}>
              Simular de novo
            </button>
          </>
        ) : (
          <>
            <p className="sos-demo__status">
              <Icon name="phone" size={18} /> Pressione e segure por 3 segundos
            </p>
            <p className="sos-demo__hint">
              O tempo de espera evita toques acidentais. Ao completar, a rede familiar
              e o SAMU (192) recebem o alerta com a localização do idoso.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
