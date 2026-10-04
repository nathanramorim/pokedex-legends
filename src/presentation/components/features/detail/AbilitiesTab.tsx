import type { Ability, AbilitySlot } from '@/domain';
import { formatName } from '@/presentation/format';
import styles from './tabs.module.css';

interface Props {
  slots: AbilitySlot[];
  abilities: Ability[];
}

export function AbilitiesTab({ slots, abilities }: Props) {
  return (
    <ul className={styles.list}>
      {slots.map((slot) => {
        const ability = abilities.find((a) => a.name === slot.name);
        return (
          <li key={slot.name} className={styles.card}>
            <div className={styles.cardHeader}>
              <strong>{formatName(slot.name)}</strong>
              {slot.isHidden ? <span className={styles.tag}>Oculta</span> : null}
            </div>
            <p className={styles.muted}>{ability?.description || 'Sem descrição disponível.'}</p>
          </li>
        );
      })}
    </ul>
  );
}
