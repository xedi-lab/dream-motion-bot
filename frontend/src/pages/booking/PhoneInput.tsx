import { useState } from 'react'
import { Button } from '../../components/Button'
import styles from './Booking.module.css'

interface Props {
  initialPhone?: string
  onNext: (phone: string) => void
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  let result = '+'
  if (digits[0] === '7' || digits[0] === '8') {
    result += '7'
    if (digits.length > 1) result += ' (' + digits.slice(1, 4)
    if (digits.length > 4) result += ') ' + digits.slice(4, 7)
    if (digits.length > 7) result += '-' + digits.slice(7, 9)
    if (digits.length > 9) result += '-' + digits.slice(9, 11)
  } else {
    result += digits
  }
  return result
}

export function PhoneInput({ initialPhone = '', onNext }: Props) {
  const [phone, setPhone] = useState(initialPhone)
  const [error, setError] = useState('')

  const digits = phone.replace(/\D/g, '')
  const valid = digits.length >= 10

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setPhone(formatPhone(e.target.value))
  }

  const handleSubmit = () => {
    if (!valid) { setError('Введите корректный номер телефона'); return }
    onNext(phone.replace(/\s/g, ''))
  }

  return (
    <div className={styles.section + ' fade-in'}>
      <p className={styles.label}>Контактный номер</p>
      <p className={styles.sublabel}>Мы свяжемся с тобой для подтверждения</p>

      <div className={styles.inputWrap}>
        <input
          className={[styles.input, error ? styles.inputError : ''].join(' ')}
          type="tel"
          inputMode="tel"
          placeholder="+7 (___) ___-__-__"
          value={phone}
          onChange={handleChange}
          autoFocus
        />
        {error && <p className={styles.errorMsg}>{error}</p>}
      </div>

      <Button fullWidth onClick={handleSubmit} disabled={!valid}>
        Продолжить
      </Button>
    </div>
  )
}
