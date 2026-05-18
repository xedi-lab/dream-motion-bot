import type { StudioConfig } from '../types'
import styles from './About.module.css'

interface Props {
  config: StudioConfig
}

export function About({ config }: Props) {
  const hours = config.working_hours
  const hoursStr = `${hours.from}:00 – ${hours.to}:00`

  return (
    <div className={styles.wrap + ' fade-in'}>
      {config.about && (
        <p className={styles.about}>{config.about}</p>
      )}

      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>📍</span>
          <div>
            <p className={styles.infoLabel}>Адрес</p>
            <p className={styles.infoValue}>{config.address ?? config.city}</p>
          </div>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>🕐</span>
          <div>
            <p className={styles.infoLabel}>Режим работы</p>
            <p className={styles.infoValue}>{hoursStr}</p>
          </div>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>💰</span>
          <div>
            <p className={styles.infoLabel}>Цена за час</p>
            <p className={styles.infoValue}>
              от {config.price_per_hour.toLocaleString('ru-RU')} {config.currency}
            </p>
          </div>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>🎚️</span>
          <div>
            <p className={styles.infoLabel}>Со звукорежиссёром</p>
            <p className={styles.infoValue}>
              {config.price_per_hour_with_engineer.toLocaleString('ru-RU')} {config.currency}/ч
            </p>
          </div>
        </div>
      </div>

      {config.features && config.features.length > 0 && (
        <div className={styles.features}>
          <p className={styles.featuresTitle}>Почему мы</p>
          <ul className={styles.featuresList}>
            {config.features.map((f, i) => (
              <li key={i} className={styles.featureItem}>
                <span className={styles.featureDot} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
