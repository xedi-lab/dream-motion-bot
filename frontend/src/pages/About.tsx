import type { StudioConfig } from '../types'
import styles from './About.module.css'

interface Props {
  config: StudioConfig
}

export function About({ config }: Props) {
  const hours = config.working_hours_label ?? `${config.working_hours.from}:00 – ${config.working_hours.to}:00`
  const priceStr = config.price_per_hour > 0
    ? `${config.price_per_hour.toLocaleString('ru-RU')} ${config.currency}`
    : '—'
  const priceEngStr = config.price_per_hour_with_engineer > 0
    ? `${config.price_per_hour_with_engineer.toLocaleString('ru-RU')} ${config.currency}`
    : '—'

  return (
    <div className={styles.wrap + ' fade-in'}>

      {/* Hero intro */}
      {config.about && (
        <div className={styles.hero}>
          <p className={styles.heroLabel}>Студия звукозаписи · {config.city}</p>
          <p className={styles.heroText}>{config.about}</p>
        </div>
      )}

      {/* Photo gallery */}
      <div className={styles.gallery}>
        <img src="/studio/studio1.jpeg" className={styles.galleryHero} alt="Dream Motion Studio" />
        <div className={styles.galleryGrid}>
          <img src="/studio/studio2.jpeg" className={styles.galleryImg} alt="" />
          <img src="/studio/studio3.jpeg" className={styles.galleryImg} alt="" />
          <img src="/studio/studio5.jpeg" className={styles.galleryImg} alt="" />
          <img src="/studio/studio4.jpeg" className={styles.galleryImg} alt="" />
        </div>
        <img src="/studio/studio6.jpeg" className={styles.galleryWide} alt="" />
      </div>

      {/* Key stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{hours}</span>
          <span className={styles.statLabel}>Режим работы</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{priceStr}</span>
          <span className={styles.statLabel}>Цена за час</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{priceEngStr}</span>
          <span className={styles.statLabel}>С режиссёром</span>
        </div>
      </div>

      {/* Address */}
      {config.address && (
        <div className={styles.addressCard}>
          <div className={styles.addressIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" opacity=".15"/>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div>
            <p className={styles.addressLabel}>Адрес</p>
            <p className={styles.addressValue}>{config.address}, {config.city}</p>
          </div>
        </div>
      )}

      {/* Equipment */}
      {config.equipment && config.equipment.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Наше оборудование</p>
          <div className={styles.equipList}>
            {config.equipment.map((item, i) => (
              <div key={i} className={styles.equipItem}>
                <div className={styles.equipIdx}>{String(i + 1).padStart(2, '0')}</div>
                <div className={styles.equipInfo}>
                  <p className={styles.equipName}>{item.name}</p>
                  <p className={styles.equipDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why us */}
      {config.features && config.features.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Почему мы?</p>
          <div className={styles.features}>
            {config.features.map((f, i) => (
              <div key={i} className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
