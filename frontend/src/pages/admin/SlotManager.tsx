import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Loader } from '../../components/Loader'
import type { SlotOut } from '../../types'
import styles from './Admin.module.css'

function isoDate(d: Date) { return d.toISOString().slice(0, 10) }
function fmt(t: string) { return t.slice(0, 5) }
function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
  return `${d} ${months[m - 1]} ${y}`
}

const today = isoDate(new Date())

export function SlotManager() {
  const [slots, setSlots] = useState<SlotOut[]>([])
  const [loading, setLoading] = useState(true)

  const [date, setDate] = useState(today)
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('14:00')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const load = () =>
    api.getSlots({ from_date: today, available_only: false })
      .then(setSlots)
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    setError('')
    setCreating(true)
    try {
      const slot = await api.createSlot({ date, start_time: startTime + ':00', end_time: endTime + ':00' })
      setSlots(s => [...s, slot].sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time)))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    await api.deleteSlot(id)
    setSlots(s => s.filter(x => x.id !== id))
  }

  const handleToggle = async (id: number) => {
    const updated = await api.toggleSlot(id)
    setSlots(s => s.map(x => x.id === id ? updated : x))
  }

  if (loading) return <Loader />

  const grouped = slots.reduce<Record<string, SlotOut[]>>((acc, s) => {
    ;(acc[s.date] ??= []).push(s)
    return acc
  }, {})

  return (
    <div className={styles.section + ' fade-in'}>
      <Card>
        <p className={styles.groupLabel} style={{ marginBottom: 14 }}>Добавить окно</p>
        <div className={styles.formStack}>
          <label className={styles.formLabel}>
            Дата
            <input type="date" className={styles.formInput} value={date} min={today} onChange={e => setDate(e.target.value)} />
          </label>
          <div className={styles.timeRow}>
            <label className={styles.formLabel}>
              Начало
              <input type="time" className={styles.formInput} value={startTime} onChange={e => setStartTime(e.target.value)} />
            </label>
            <label className={styles.formLabel}>
              Конец
              <input type="time" className={styles.formInput} value={endTime} onChange={e => setEndTime(e.target.value)} />
            </label>
          </div>
        </div>
        {error && <p className={styles.errorMsg}>{error}</p>}
        <Button fullWidth loading={creating} onClick={handleCreate} className={styles.addBtn}>
          Добавить
        </Button>
      </Card>

      {Object.keys(grouped).sort().map(d => (
        <div key={d}>
          <p className={styles.groupLabel}>{formatDate(d)}</p>
          {grouped[d].map(slot => (
            <Card key={slot.id} className={styles.slotCard}>
              <div className={styles.slotRow}>
                <span className={styles.slotTime}>{fmt(slot.start_time)} – {fmt(slot.end_time)}</span>
                <span className={[styles.slotStatus, slot.is_available ? styles.avail : styles.unavail].join(' ')}>
                  {slot.is_available ? 'Свободно' : 'Занято'}
                </span>
                <div className={styles.slotActions}>
                  <button className={styles.iconBtn} onClick={() => handleToggle(slot.id)} title="Переключить">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className={styles.iconBtn + ' ' + styles.iconBtnDanger} onClick={() => handleDelete(slot.id)} title="Удалить">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ))}

      {slots.length === 0 && (
        <p className={styles.empty}>Окон нет. Добавьте первое.</p>
      )}
    </div>
  )
}
