import styles from './Card.module.css'

interface Props {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
}

export function Card({ children, className, onClick, active, disabled }: Props) {
  return (
    <div
      className={[
        styles.card,
        onClick ? styles.clickable : '',
        active ? styles.active : '',
        disabled ? styles.disabled : '',
        className ?? '',
      ].join(' ')}
      onClick={!disabled ? onClick : undefined}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  )
}
