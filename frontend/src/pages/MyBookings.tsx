import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Loader } from '../components/Loader'
import type { BookingOut } from '../types'
import styles from './MyBookings.module.css'

const STATUS_LABEL: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Подтверждено',
  rejected: 'Отклонено',
  cancelled: 'Отменено',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'var(--text-secondary)',
  approved: 'var(--success)',
  rejected: 'var(--danger)',
  cancelled: 'var(--text-secondary)',
}

function formatDate(iso: string) {
  const [, m, d] = iso.split('-').map(Number)
  const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']
  return `${d} ${months[m - 1]}`
}

function fmt(t: string) { return t.slice(0, 5) }

function getCancelFee(b: BookingOut): number {
  const startStr = b.chosen_start_time || b.slot.start_time
  const sessionStart = new Date(`${b.slot.date}T${startStr}`)
  const hoursUntil = (sessionStart.getTime() - Date.now()) / 3_600_000
  return hoursUntil < 12 ? 500 : 0
}

export function MyBookings() {
  const [bookings, setBookings] = useState<BookingOut[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  useEffect(() => {
    api.getMyBookings().then(setBookings).finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id: number) => {
    setCancelling(id)
    setConfirmId(null)
    try {
      await api.cancelBooking(id)
      setBookings(b => b.map(x => x.id === id ? { ...x, status: 'cancelled' } : x))
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return <Loader />

  if (bookings.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Заявок пока нет</p>
        <p className={styles.emptyText}>Забронируй время в студии и заявка появится здесь</p>
      </div>
    )
  }

  return (
    <div className={styles.list + ' fade-in'}>
      {bookings.map(b => {
        const canCancel = b.status === 'pending' || b.status === 'approved'
        const fee = canCancel ? getCancelFee(b) : 0
        const timeStr = b.chosen_start_time
          ? `${fmt(b.chosen_start_time)} – ${fmt(b.slot.start_time)}`
          : fmt(b.slot.start_time)

        return (
          <Card key={b.id}>
            <div className={styles.row}>
              <div className={styles.dateBlock}>
                <span className={styles.date}>{formatDate(b.slot.date)}</span>
                <span className={styles.time}>{timeStr}</span>
              </div>
              <div className={styles.info}>
                <p className={styles.duration}>{b.duration_hours} ч · {b.with_engineer ? 'со звукорежиссёром' : 'без звукорежиссёра'}</p>
                <p className={styles.price}>{Number(b.total_price).toLocaleString('ru-RU')} ₽</p>
              </div>
              <span className={styles.badge} style={{ color: STATUS_COLOR[b.status] }}>
                {STATUS_LABEL[b.status]}
              </span>
            </div>

            {b.admin_comment && (
              <p className={styles.comment}>💬 {b.admin_comment}</p>
            )}

            {canCancel && confirmId !== b.id && (
              <Button
                variant="ghost"
                className={styles.cancelBtn}
                onClick={() => setConfirmId(b.id)}
              >
                Отменить
              </Button>
            )}

            {confirmId === b.id && (
              <div className={styles.confirmBlock}>
                <p className={styles.confirmText}>
                  {fee > 0
                    ? `Отмена менее чем за 12 ч — штраф ${fee.toLocaleString('ru-RU')} ₽. Всё равно отменить?`
                    : 'Отменить бронирование?'}
                </p>
                <div className={styles.confirmActions}>
                  <Button variant="ghost" className={styles.confirmBtn} onClick={() => setConfirmId(null)}>
                    Назад
                  </Button>
                  <Button variant="secondary" className={styles.confirmBtn} loading={cancelling === b.id} onClick={() => handleCancel(b.id)}>
                    Подтвердить
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
