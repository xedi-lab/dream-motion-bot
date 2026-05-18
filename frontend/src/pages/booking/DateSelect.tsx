import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Loader } from '../../components/Loader'
import { Button } from '../../components/Button'
import type { SlotOut } from '../../types'
import styles from './Booking.module.css'

interface Props {
  onSelect: (date: string) => void
}

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function DateSelect({ onSelect }: Props) {
  const [slots, setSlots] = useState<SlotOut[]>([])
  const [loading, setLoading] = useState(true)
  const [viewDate, setViewDate] = useState(() => new Date())

  useEffect(() => {
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + 60)
    api.getSlots({ from_date: isoDate(from), to_date: isoDate(to), available_only: true })
      .then(setSlots)
      .finally(() => setLoading(false))
  }, [])

  const availableDates = new Set(slots.map(s => s.date))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // week starts Monday
  const startOffset = (firstDay.getDay() + 6) % 7
  const cells: (Date | null)[] = Array(startOffset).fill(null)
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d))

  const today = isoDate(new Date())

  if (loading) return <Loader />

  return (
    <div className={styles.section + ' fade-in'}>
      <p className={styles.label}>Выберите дату</p>

      <Card>
        <div className={styles.calNav}>
          <button className={styles.calArrow} onClick={() => setViewDate(new Date(year, month - 1, 1))}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L6 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className={styles.calMonth}>{MONTHS[month]} {year}</span>
          <button className={styles.calArrow} onClick={() => setViewDate(new Date(year, month + 1, 1))}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L10 8L6 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.calGrid}>
          {DAYS.map(d => <div key={d} className={styles.calDayName}>{d}</div>)}
          {cells.map((date, i) => {
            if (!date) return <div key={`e-${i}`} />
            const iso = isoDate(date)
            const hasSlot = availableDates.has(iso)
            const isPast = iso < today
            return (
              <button
                key={iso}
                className={[
                  styles.calDay,
                  hasSlot && !isPast ? styles.calDayAvail : '',
                  isPast ? styles.calDayPast : '',
                  iso === today ? styles.calDayToday : '',
                ].join(' ')}
                disabled={!hasSlot || isPast}
                onClick={() => onSelect(iso)}
              >
                {date.getDate()}
                {hasSlot && !isPast && <span className={styles.dot} />}
              </button>
            )
          })}
        </div>
      </Card>

      {availableDates.size === 0 && (
        <p className={styles.empty}>Свободных дат пока нет. Загляни позже.</p>
      )}
    </div>
  )
}
