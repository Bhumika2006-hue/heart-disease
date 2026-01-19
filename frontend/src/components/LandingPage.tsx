'use client';

import styles from './LandingPage.module.css';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className={styles.container}>
      <div className={styles.floatingIcons}>
        <div className={styles.floatingIcon}>🏥</div>
        <div className={styles.floatingIcon}>🩺</div>
        <div className={styles.floatingIcon}>💊</div>
        <div className={styles.floatingIcon}>🚑</div>
        <div className={styles.floatingIcon}>💉</div>
        <div className={styles.floatingIcon}>🧬</div>
        <div className={styles.floatingIcon}>🌡️</div>
        <div className={styles.floatingIcon}>🩹</div>
      </div>

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

        <div className={styles.features}>
          <div className={styles.feature} style={{ animationDelay: '0.1s' }}>
            <div className={styles.featureIcon}>📷</div>
            <h3 className={styles.featureTitle}>Upload an MRI</h3>
            <p className={styles.featureText}>Simply drag, drop, or paste your cardiac MRI image to get started</p>
          </div>

          <div className={styles.feature} style={{ animationDelay: '0.2s' }}>
            <div className={styles.featureIcon}>💬</div>
            <h3 className={styles.featureTitle}>Ask Questions</h3>
            <p className={styles.featureText}>Chat naturally about your scan and get clear explanations</p>
          </div>

          <div className={styles.feature} style={{ animationDelay: '0.3s' }}>
            <div className={styles.featureIcon}>🧠</div>
            <h3 className={styles.featureTitle}>Understand Results</h3>
            <p className={styles.featureText}>Learn about heart health markers in plain, easy-to-understand language</p>
          </div>
        </div>

        <div className={styles.reassurance}>
          <p className={styles.reassuranceText}>
            🔒 Your images are processed privately and not stored permanently
          </p>
        </div>

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
