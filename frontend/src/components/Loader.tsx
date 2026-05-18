import styles from './Loader.module.css'

export function Loader() {
  return (
    <div className={styles.wrap}>
      <div className={styles.ring} />
    </div>
  )
}
