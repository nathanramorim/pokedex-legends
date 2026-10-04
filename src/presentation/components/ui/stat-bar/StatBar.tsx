import styles from './StatBar.module.css';

interface Props {
  label: string;
  value: number;
  max?: number;
}

export function StatBar({ label, value, max = 255 }: Props) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      <div className={styles.track} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
