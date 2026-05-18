import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Loader } from '../../components/Loader'
import type { SlotOut } from '../../types'
import styles from './Booking.module.css'

interface Props {
  date: string
  onSelect: (slot: SlotOut) => void
}

function fmt(t: string) {
  return t.slice(0, 5)
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
  return `${d} ${months[m - 1]} ${y}`
}

export function SlotSelect({ date, onSelect }: Props) {
  const [slots, setSlots] = useState<SlotOut[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getSlots({ from_date: date, to_date: date, available_only: true })
      .then(setSlots)
      .finally(() => setLoading(false))
  }, [date])

  if (loading) return <Loader />

  return (
    <div className={styles.section + ' fade-in'}>
      <p className={styles.label}>Доступное время</p>
      <p className={styles.sublabel}>{formatDate(date)}</p>

      {slots.length === 0 ? (
        <p className={styles.empty}>На эту дату нет свободных слотов.</p>
      ) : (
        <div className={styles.slotGrid}>
          {slots.map(slot => (
            <Card key={slot.id} onClick={() => onSelect(slot)}>
              <div className={styles.slotTime}>
                {fmt(slot.start_time)} – {fmt(slot.end_time)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
