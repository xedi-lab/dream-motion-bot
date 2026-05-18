import { useEffect, useState } from 'react'
import { useTelegram } from './hooks/useTelegram'
import { useTheme } from './hooks/useTheme'
import { api, setInitData } from './api/client'
import { Header } from './components/Header'
import { Loader } from './components/Loader'
import { Button } from './components/Button'
import { DateSelect } from './pages/booking/DateSelect'
import { SlotSelect } from './pages/booking/SlotSelect'
import { Options } from './pages/booking/Options'
import { PhoneInput } from './pages/booking/PhoneInput'
import { Summary } from './pages/booking/Summary'
import { MyBookings } from './pages/MyBookings'
import { Dashboard } from './pages/admin/Dashboard'
import { SlotManager } from './pages/admin/SlotManager'
import type { BookingDraft, BookingStep, Page, StudioConfig, UserOut } from './types'
import styles from './App.module.css'

export default function App() {
  const { tg, initData, colorScheme, user: tgUser } = useTelegram()
  const [theme, toggleTheme] = useTheme(colorScheme)

  const [config, setConfig] = useState<StudioConfig | null>(null)
  const [me, setMe] = useState<UserOut | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState<Page>('home')
  const [bookingStep, setBookingStep] = useState<BookingStep>('date')
  const [draft, setDraft] = useState<BookingDraft>({
    date: null, slot: null, durationHours: 1, withEngineer: false, phone: '',
  })

  useEffect(() => {
    tg?.ready()
    tg?.expand()
    setInitData(initData)

    const fallbackConfig = { studio_name: 'Dream Motion', city: 'Санкт-Петербург', currency: '₽', min_session_hours: 1, price_per_hour: 1000, price_per_hour_with_engineer: 1500, working_hours: { from: 10, to: 23 }, admin_ids: [] }

    Promise.allSettled([api.getConfig(), api.getMe()]).then(([cfgRes, meRes]) => {
      const cfg = cfgRes.status === 'fulfilled' ? cfgRes.value : fallbackConfig
      setConfig(cfg)

      if (meRes.status === 'fulfilled') {
        setMe(meRes.value)
        if (meRes.value.is_admin) setIsAdmin(true)
      }

      // Check admin by config admin_ids OR hardcoded fallback
      const adminIds: number[] = cfg.admin_ids?.length ? cfg.admin_ids : [7639287231]
      if (tgUser && adminIds.includes(tgUser.id)) setIsAdmin(true)

      setLoading(false)
    })
  }, [])

  if (loading) return <div className={styles.fullLoader}><Loader /></div>

  // ── Booking flow ──────────────────────────────────────
  if (page === 'booking') {
    const steps: BookingStep[] = ['date', 'slot', 'options', 'phone', 'summary', 'done']
    const stepIndex = steps.indexOf(bookingStep)

    const handleBack = () => {
      if (bookingStep === 'date') { setPage('home'); return }
      setBookingStep(steps[Math.max(0, stepIndex - 1)])
    }

    const stepTitles: Record<BookingStep, string> = {
      date: 'Выбор даты',
      slot: 'Выбор времени',
      options: 'Параметры',
      phone: 'Контакт',
      summary: 'Заявка',
      done: 'Готово',
    }

    return (
      <div className="page">
        <Header theme={theme} onToggleTheme={toggleTheme} onBack={handleBack} title={stepTitles[bookingStep]} />
        <div className="page-content">
          {bookingStep === 'date' && (
            <DateSelect onSelect={date => { setDraft(d => ({ ...d, date })); setBookingStep('slot') }} />
          )}
          {bookingStep === 'slot' && (
            <SlotSelect
              date={draft.date!}
              onSelect={slot => { setDraft(d => ({ ...d, slot })); setBookingStep('options') }}
            />
          )}
          {bookingStep === 'options' && (
            <Options
              slot={draft.slot!}
              config={config!}
              onNext={(durationHours, withEngineer) => {
                setDraft(d => ({ ...d, durationHours, withEngineer }))
                setBookingStep('phone')
              }}
            />
          )}
          {bookingStep === 'phone' && (
            <PhoneInput
              initialPhone={me?.phone ?? ''}
              onNext={phone => { setDraft(d => ({ ...d, phone })); setBookingStep('summary') }}
            />
          )}
          {bookingStep === 'summary' && (
            <Summary
              draft={draft}
              config={config!}
              onDone={() => setBookingStep('done')}
            />
          )}
          {bookingStep === 'done' && (
            <div className={styles.doneScreen}>
              <div className={styles.doneIcon}>✓</div>
              <h2 className={styles.doneTitle}>Заявка отправлена!</h2>
              <p className={styles.doneSub}>Мы рассмотрим её и уведомим тебя в Telegram</p>
              <Button fullWidth onClick={() => { setPage('home'); setBookingStep('date'); setDraft({ date: null, slot: null, durationHours: 1, withEngineer: false, phone: '' }) }}>
                На главную
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Admin pages ───────────────────────────────────────
  if (page === 'admin-dashboard' || page === 'admin-slots') {
    return (
      <div className="page">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onBack={() => setPage('home')}
          title={page === 'admin-dashboard' ? 'Заявки' : 'Слоты'}
        />
        <div className={styles.adminTabs}>
          <button
            className={[styles.tab, page === 'admin-dashboard' ? styles.tabActive : ''].join(' ')}
            onClick={() => setPage('admin-dashboard')}
          >Заявки</button>
          <button
            className={[styles.tab, page === 'admin-slots' ? styles.tabActive : ''].join(' ')}
            onClick={() => setPage('admin-slots')}
          >Слоты</button>
        </div>
        <div className="page-content">
          {page === 'admin-dashboard' && <Dashboard />}
          {page === 'admin-slots' && <SlotManager />}
        </div>
      </div>
    )
  }

  // ── My bookings ───────────────────────────────────────
  if (page === 'my-bookings') {
    return (
      <div className="page">
        <Header theme={theme} onToggleTheme={toggleTheme} onBack={() => setPage('home')} title="Мои заявки" />
        <div className="page-content">
          <MyBookings />
        </div>
      </div>
    )
  }

  // ── Home ──────────────────────────────────────────────
  const firstName = tgUser?.first_name ?? ''

  return (
    <div className="page">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <div className={styles.homeContent}>
        <div className={styles.hero}>
          <p className={styles.heroLabel}>Студия звукозаписи</p>
          <h1 className={styles.heroTitle}>DREAM<br />MOTION</h1>
          {config?.city && <p className={styles.heroCity}>{config.city}</p>}
        </div>

        <div className={styles.homeActions}>
          {firstName && <p className={styles.greeting}>Привет, {firstName}</p>}

          <Button fullWidth onClick={() => setPage('booking')}>
            Забронировать
          </Button>

          <Button fullWidth variant="secondary" onClick={() => setPage('my-bookings')}>
            Мои заявки
          </Button>

          {isAdmin && (
            <Button fullWidth variant="ghost" onClick={() => setPage('admin-dashboard')}>
              Панель управления
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
