import { useState } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import type { SlotOut, StudioConfig } from '../../types'
import styles from './Booking.module.css'

interface Props {
  slot: SlotOut
  config: StudioConfig
  onNext: (durationHours: number, withEngineer: boolean, startTime: string, endTime: string) => void
}

const pad = (n: number) => String(n).padStart(2, '0')

export function Options({ slot, config, onNext }: Props) {
  const fromHour = parseInt(slot.start_time.split(':')[0])
  const toHour = parseInt(slot.end_time.split(':')[0])
  const minDur = Math.max(1, Math.ceil(config.min_session_hours))

  const [startH, setStartH] = useState(fromHour)
  const [endH, setEndH] = useState(Math.min(fromHour + minDur, toHour))
  const [withEngineer, setWithEngineer] = useState(false)

  const duration = endH - startH
  const price = duration * (withEngineer ? config.price_per_hour_with_engineer : config.price_per_hour)

  const decStart = () => {
    const ns = Math.max(fromHour, startH - 1)
    setStartH(ns)
    if (endH < ns + minDur) setEndH(ns + minDur)
  }
  const incStart = () => {
    const ns = Math.min(toHour - minDur, startH + 1)
    setStartH(ns)
    if (endH < ns + minDur) setEndH(ns + minDur)
  }
  const decEnd = () => setEndH(e => Math.max(startH + minDur, e - 1))
  const incEnd = () => setEndH(e => Math.min(toHour, e + 1))

  return (
    <div className={styles.section + ' fade-in'}>
      <p className={styles.label}>Параметры сессии</p>

      <Card>
        <p className={styles.optionTitle}>Время сессии</p>
        <div className={styles.timeRange}>
          <div className={styles.timeField}>
            <span className={styles.timeFieldLabel}>С</span>
            <div className={styles.counter}>
              <button className={styles.counterBtn} onClick={decStart} disabled={startH <= fromHour}>−</button>
              <span className={styles.counterVal}>{pad(startH)}:00</span>
              <button className={styles.counterBtn} onClick={incStart} disabled={startH >= toHour - minDur}>+</button>
            </div>
          </div>
          <div className={styles.timeRangeSep}>—</div>
          <div className={styles.timeField}>
            <span className={styles.timeFieldLabel}>До</span>
            <div className={styles.counter}>
              <button className={styles.counterBtn} onClick={decEnd} disabled={endH <= startH + minDur}>−</button>
              <span className={styles.counterVal}>{pad(endH)}:00</span>
              <button className={styles.counterBtn} onClick={incEnd} disabled={endH >= toHour}>+</button>
            </div>
          </div>
        </div>
        <p className={styles.durationHint}>{duration} ч</p>
      </Card>

      <Card onClick={() => setWithEngineer(v => !v)} active={withEngineer}>
        <div className={styles.optionRow}>
          <div>
            <p className={styles.optionTitle}>Звукорежиссёр</p>
            {config.price_per_hour_with_engineer > config.price_per_hour && (
              <p className={styles.optionSub}>+{config.price_per_hour_with_engineer - config.price_per_hour} {config.currency}/ч</p>
            )}
          </div>
          <div className={[styles.toggle, withEngineer ? styles.toggleOn : ''].join(' ')} />
        </div>
      </Card>

      {price > 0 && (
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>Итого</span>
          <span className={styles.priceVal}>{price.toLocaleString('ru-RU')} {config.currency}</span>
        </div>
      )}

      <Button fullWidth onClick={() => onNext(duration, withEngineer, `${pad(startH)}:00:00`, `${pad(endH)}:00:00`)}>
        Продолжить
      </Button>
    </div>
  )
}
