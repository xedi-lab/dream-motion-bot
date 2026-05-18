import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Loader } from '../../components/Loader'
import type { BookingOut } from '../../types'
import styles from './Admin.module.css'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ожидает',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  cancelled: 'Отменено',
}

function formatDate(iso: string) {
  const [, m, d] = iso.split('-').map(Number)
  const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']
  return `${d} ${months[m - 1]}`
}
function fmt(t: string) { return t.slice(0, 5) }

export function Dashboard() {
  const [bookings, setBookings] = useState<BookingOut[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [commentFor, setCommentFor] = useState<number | null>(null)

  useEffect(() => {
    api.getAllBookings().then(setBookings).finally(() => setLoading(false))
  }, [])

  const pending = bookings.filter(b => b.status === 'pending')
  const rest = bookings.filter(b => b.status !== 'pending')

  const handleAction = async (id: number, status: 'approved' | 'rejected') => {
    setActionId(id)
    try {
      const updated = await api.updateBookingStatus(id, status, commentFor === id ? comment : undefined)
      setBookings(b => b.map(x => x.id === id ? updated : x))
      setCommentFor(null)
      setComment('')
    } finally {
      setActionId(null)
    }
  }

  if (loading) return <Loader />

  return (
    <div className={styles.section + ' fade-in'}>
      {pending.length === 0 && rest.length === 0 && (
        <p className={styles.empty}>Заявок пока нет</p>
      )}

      {pending.length > 0 && (
        <>
          <p className={styles.groupLabel}>Новые заявки · {pending.length}</p>
          {pending.map(b => (
            <Card key={b.id}>
              <BookingRow b={b} formatDate={formatDate} fmt={fmt} />

              {commentFor === b.id && (
                <input
                  className={styles.commentInput}
                  placeholder="Причина (необязательно)"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  autoFocus
                />
              )}

              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  className={styles.actionBtn}
                  loading={actionId === b.id}
                  onClick={() => {
                    if (commentFor !== b.id) setCommentFor(b.id)
                    else handleAction(b.id, 'rejected')
                  }}
                >
                  {commentFor === b.id ? 'Подтвердить отказ' : 'Отклонить'}
                </Button>
                <Button
                  className={styles.actionBtn}
                  loading={actionId === b.id}
                  onClick={() => handleAction(b.id, 'approved')}
                >
                  Одобрить
                </Button>
              </div>
            </Card>
          ))}
        </>
      )}

      {rest.length > 0 && (
        <>
          <p className={styles.groupLabel}>История</p>
          {rest.map(b => (
            <Card key={b.id}>
              <BookingRow b={b} formatDate={formatDate} fmt={fmt} />
              <span className={styles.statusBadge} data-status={b.status}>
                {STATUS_LABEL[b.status]}
              </span>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}

function BookingRow({ b, formatDate, fmt }: { b: BookingOut; formatDate: (s: string) => string; fmt: (s: string) => string }) {
  const username = b.user.username ? `@${b.user.username}` : b.user.first_name ?? '—'
  return (
    <div className={styles.bookingRow}>
      <div className={styles.bookingDate}>
        <span>{formatDate(b.slot.date)}</span>
        <strong>{fmt(b.slot.start_time)}</strong>
      </div>
      <div className={styles.bookingInfo}>
        <p className={styles.bookingUser}>{username}</p>
        <p className={styles.bookingMeta}>{b.phone} · {b.duration_hours}ч · {b.with_engineer ? 'со звукорежиссёром' : 'без'}</p>
        <p className={styles.bookingPrice}>{Number(b.total_price).toLocaleString('ru-RU')} ₽</p>
      </div>
    </div>
  )
}
