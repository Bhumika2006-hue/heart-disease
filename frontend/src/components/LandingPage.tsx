'use client';

import styles from './LandingPage.module.css';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className={styles.container}>
      <div className={styles.robotContainer}>
        <div className={styles.robot}>
          <div className={styles.robotBody}>
            <div className={styles.robotHead}>
              <div className={styles.cap}>
                <div className={styles.capSymbol}>+</div>
              </div>
              <div className={styles.face}>
                <div className={styles.eye}></div>
                <div className={styles.eye}></div>
                <div className={styles.smile}></div>
              </div>
            </div>
            <div className={styles.robotTorso}></div>
            <div className={styles.robotArms}>
              <div className={styles.arm}></div>
              <div className={styles.arm}></div>
            </div>
            <div className={styles.robotLegs}>
              <div className={styles.leg}></div>
              <div className={styles.leg}></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <h1 className={styles.headline}>
          Heart Health Insights from Your MRI Scans
        </h1>
        <p className={styles.description}>
          Upload your cardiac MRI image and get educational insights powered by AI. 
          Our assistant helps you understand heart health markers in simple, clear language.
        </p>
        <p className={styles.disclaimer}>
          This tool is designed for educational purposes only. It provides supportive 
          information and is not a medical diagnosis. Always consult with qualified 
          healthcare professionals for medical advice.
        </p>
        <button className={styles.getStartedButton} onClick={onGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}
