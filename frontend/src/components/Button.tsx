import styles from './Button.module.css'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  fullWidth?: boolean
  loading?: boolean
}

export function Button({ variant = 'primary', fullWidth, loading, children, className, disabled, ...rest }: Props) {
  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        fullWidth ? styles.full : '',
        loading ? styles.loading : '',
        className ?? '',
      ].join(' ')}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  )
}
