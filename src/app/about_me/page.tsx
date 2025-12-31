import AboutSection from "@/components/AboutSection";
import styles from "./about.module.css";

export default function AboutMePage() {
  return (
    <main className={styles.page}>
      <a className={styles.backLink} href="/">
        &lt; Back home
      </a>
      <div className={styles.parallax}>
        <AboutSection />
      </div>
    </main>
  );
}
