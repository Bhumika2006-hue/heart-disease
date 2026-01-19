'use client';

import styles from './AboutModal.module.css';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className={styles.content}>
          <h2 className={styles.title}>About This App</h2>

          <section className={styles.section}>
            <h3 className={styles.heading}>What This App Does</h3>
            <p className={styles.text}>
              This app helps you understand cardiac MRI images using AI. You can upload your MRI scan
              and get clear, simple explanations about what the image shows. It&apos;s designed to make
              heart health information easier to understand.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.heading}>Important Medical Disclaimer</h3>
            <p className={styles.text}>
              This tool is for educational purposes only. It provides supportive information to help
              you understand your MRI scan, but it is not a medical diagnosis. The insights are
              meant to inform, not replace professional medical judgment.
            </p>
            <p className={styles.text}>
              Always consult with qualified healthcare professionals for medical advice, diagnosis,
              or treatment. Do not use this app as a substitute for professional medical care.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.heading}>Your Privacy</h3>
            <p className={styles.text}>
              Your images are processed to provide analysis and are not stored permanently. After
              your session ends, the images are discarded. We respect your privacy and are committed
              to keeping your health information safe.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.heading}>Who This Is For</h3>
            <p className={styles.text}>
              This app is for patients and caregivers who want to better understand cardiac MRI
              results. It can help you:
            </p>
            <ul className={styles.list}>
              <li>Learn what different parts of a heart MRI show</li>
              <li>Understand common heart health markers</li>
              <li>Prepare questions for your doctor</li>
              <li>Feel more informed about your health</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3 className={styles.heading}>Who This Is Not For</h3>
            <p className={styles.text}>
              This app is not for:
            </p>
            <ul className={styles.list}>
              <li>Making medical decisions on your own</li>
              <li>Emergency situations or urgent care</li>
              <li>Replacing professional medical advice</li>
              <li>Diagnosing or treating medical conditions</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3 className={styles.heading}>Frequently Asked Questions</h3>
            
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Is this a medical diagnosis?</h4>
              <p className={styles.faqAnswer}>
                No. This app provides educational information based on AI analysis of your MRI
                image. It is not a medical diagnosis. Always consult your doctor for accurate
                diagnosis and treatment.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>What kind of MRI images work best?</h4>
              <p className={styles.faqAnswer}>
                This app is designed for cardiac MRI scans. Clear images with good contrast and
                resolution work best. Images should be in common formats like JPG, PNG, or DICOM
                exports.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Is my data saved?</h4>
              <p className={styles.faqAnswer}>
                No. Your images are processed to give you results and are not stored permanently.
                Once your session ends, the images are deleted. We do not keep your personal
                health information.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Can I use this without uploading images?</h4>
              <p className={styles.faqAnswer}>
                Yes! You can ask questions about heart health, cardiac MRI procedures, or general
                information about heart conditions. The AI assistant is here to help you learn.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>What should I do if the AI flags a concern?</h4>
              <p className={styles.faqAnswer}>
                If the AI mentions anything concerning, don&apos;t panic. Take note of what it says and
                discuss it with your doctor. This app is a starting point for conversation, not a
                final word on your health.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Does this replace a doctor?</h4>
              <p className={styles.faqAnswer}>
                Absolutely not. No AI can replace the expertise, judgment, and care of a qualified
                healthcare professional. This app is here to support you and your doctor, not to
                take their place.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
