import { useState } from 'react'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import type { BookingDraft, StudioConfig } from '../../types'
import styles from './Booking.module.css'

interface Props {
  draft: BookingDraft
  config: StudioConfig
  onDone: () => void
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
  return `${d} ${months[m - 1]} ${y}`
}

function fmt(t: string) { return t.slice(0, 5) }

export function Summary({ draft, config, onDone }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const slot = draft.slot!
  const price = draft.durationHours * (draft.withEngineer
    ? config.price_per_hour_with_engineer
    : config.price_per_hour)

  const rows = [
    { label: 'Дата', value: formatDate(draft.date!) },
    { label: 'Время', value: `${fmt(slot.start_time)} – ${fmt(slot.end_time)}` },
    { label: 'Длительность', value: `${draft.durationHours} ч` },
    { label: 'Звукорежиссёр', value: draft.withEngineer ? 'Да' : 'Нет' },
    { label: 'Телефон', value: draft.phone },
  ]

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      await api.createBooking({
        slot_id: slot.id,
        with_engineer: draft.withEngineer,
        duration_hours: draft.durationHours,
        phone: draft.phone,
      })
      onDone()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка при отправке заявки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.section + ' fade-in'}>
      <p className={styles.label}>Проверьте заявку</p>

      <Card>
        <div className={styles.summaryRows}>
          {rows.map(r => (
            <div key={r.label} className={styles.summaryRow}>
              <span className={styles.summaryKey}>{r.label}</span>
              <span className={styles.summaryVal}>{r.value}</span>
            </div>
          ))}
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryRow}>
          <span className={styles.summaryKey}>Итого</span>
          <span className={styles.summaryPrice}>{price.toLocaleString('ru-RU')} {config.currency}</span>
        </div>
      </Card>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <p className={styles.hint}>После отправки заявка уйдёт на подтверждение. Мы уведомим тебя в Telegram.</p>

      <Button fullWidth loading={loading} onClick={handleConfirm}>
        Отправить заявку
      </Button>
    </div>
  )
}
