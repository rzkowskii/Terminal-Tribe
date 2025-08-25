import React from 'react';
import styles from './SceneViewport.module.css';

interface SceneViewportProps {
  label?: string;
  biome?: 'outpost' | 'jungle' | 'arctic' | 'archipelago' | 'lunar';
  effectsEnabled?: boolean;
}

const SceneViewport: React.FC<SceneViewportProps> = ({ label, biome = 'outpost', effectsEnabled = true }) => {
  const biomeClass =
    biome === 'jungle' ? styles.biomeJungle :
    biome === 'arctic' ? styles.biomeArctic :
    biome === 'archipelago' ? styles.biomeArchipelago :
    biome === 'lunar' ? styles.biomeLunar :
    styles.biomeOutpost;
  const effectsClass = effectsEnabled ? '' : styles.noEffects;
  return (
    <div className={`${styles.sceneViewport} ${styles.scanlines} ${biomeClass} ${effectsClass}`} aria-hidden>
      <div className={styles.sceneSky}>
        <div className={styles.stars} />
      </div>
      <div className={styles.sceneGround}>
        <div className={styles.sceneGroundTop} />
      </div>
      <div className={styles.ruinsLayer}>
        <div className={`${styles.building} ${styles.building1}`} />
        <div className={`${styles.building} ${styles.building2}`} />
        <div className={`${styles.building} ${styles.building3}`}>
          <div className={styles.building3Roof} />
        </div>
        <div className={`${styles.building} ${styles.building4}`} />
        <div className={styles.distantTower} />
      </div>
      <div className={styles.fogLayer} />
      <div className={styles.locationLabel}>
        {label || 'Sector: Outpost Ruins'}
      </div>
    </div>
  );
};

export default SceneViewport;


