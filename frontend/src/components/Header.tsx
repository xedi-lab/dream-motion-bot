import type { Theme } from '../types'
import styles from './Header.module.css'

interface Props {
  theme: Theme
  onToggleTheme: () => void
  onBack?: () => void
  title?: string
}

export function Header({ theme, onToggleTheme, onBack, title }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {onBack ? (
          <button className={styles.backBtn} onClick={onBack} aria-label="Назад">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <span className={styles.logo}>DM</span>
        )}
        {title && <span className={styles.title}>{title}</span>}
      </div>

      <button className={styles.themeBtn} onClick={onToggleTheme} aria-label="Сменить тему">
        {theme === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </header>
  )
}
