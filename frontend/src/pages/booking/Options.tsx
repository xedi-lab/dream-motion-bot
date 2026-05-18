import { useState } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import type { SlotOut, StudioConfig } from '../../types'
import styles from './Booking.module.css'

interface Props {
  slot: SlotOut
  config: StudioConfig
  onNext: (durationHours: number, withEngineer: boolean) => void
}

export function Options({ slot, config, onNext }: Props) {
  const [duration, setDuration] = useState(config.min_session_hours)
  const [withEngineer, setWithEngineer] = useState(false)

  // Max duration = slot length
  const [sh, sm] = slot.start_time.split(':').map(Number)
  const [eh, em] = slot.end_time.split(':').map(Number)
  const maxHours = (eh * 60 + em - (sh * 60 + sm)) / 60

  const price = duration * (withEngineer ? config.price_per_hour_with_engineer : config.price_per_hour)

  const step = 0.5
  const dec = () => setDuration(d => Math.max(config.min_session_hours, +(d - step).toFixed(1)))
  const inc = () => setDuration(d => Math.min(maxHours, +(d + step).toFixed(1)))

  return (
    <div className={styles.section + ' fade-in'}>
      <p className={styles.label}>Параметры сессии</p>

      {/* Duration */}
      <Card>
        <p className={styles.optionTitle}>Длительность</p>
        <div className={styles.counter}>
          <button className={styles.counterBtn} onClick={dec} disabled={duration <= config.min_session_hours}>−</button>
          <span className={styles.counterVal}>
            {duration % 1 === 0 ? duration : duration.toFixed(1)} ч
          </span>
          <button className={styles.counterBtn} onClick={inc} disabled={duration >= maxHours}>+</button>
        </div>
      </Card>

      {/* Engineer */}
      <Card
        onClick={() => setWithEngineer(v => !v)}
        active={withEngineer}
      >
        <div className={styles.optionRow}>
          <div>
            <p className={styles.optionTitle}>Звукорежиссёр</p>
            <p className={styles.optionSub}>+{config.price_per_hour_with_engineer - config.price_per_hour} {config.currency}/ч</p>
          </div>
          <div className={[styles.toggle, withEngineer ? styles.toggleOn : ''].join(' ')} />
        </div>
      </Card>

      {/* Price */}
      <div className={styles.priceRow}>
        <span className={styles.priceLabel}>Итого</span>
        <span className={styles.priceVal}>{price.toLocaleString('ru-RU')} {config.currency}</span>
      </div>

      <Button fullWidth onClick={() => onNext(duration, withEngineer)}>
        Продолжить
      </Button>
    </div>
  )
}
