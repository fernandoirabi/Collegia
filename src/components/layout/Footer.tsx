import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Brand Column */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>COLLEGIA</Link>
          <p className={styles.tagline}>Navigate your future.</p>
          <p className={styles.mission}>
            Helping international students discover colleges that fit their
            profile, understand where they stand, and build a path to get there.
          </p>
          <div className={styles.badge}>🌎 Built for international students</div>
        </div>

        {/* Link Columns */}
        <div className={styles.columns}>
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Discover</h3>
            <ul className={styles.columnLinks}>
              <li><Link href="/discover">Explore Colleges</Link></li>
              <li><Link href="/discover/search">Search</Link></li>
              <li><Link href="/discover/match">College Match</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>My Journey</h3>
            <ul className={styles.columnLinks}>
              <li><Link href="/journey">Dashboard</Link></li>
              <li><Link href="/journey/colleges">My Colleges</Link></li>
              <li><Link href="/journey/goals">Goals</Link></li>
              <li><Link href="/profile">Profile</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Learn</h3>
            <ul className={styles.columnLinks}>
              <li><Link href="/learn/how-to-apply">How to Apply</Link></li>
              <li><Link href="/learn/financial-aid">Financial Aid</Link></li>
              <li><Link href="/learn/essays">Essays</Link></li>
              <li><Link href="/learn/international-students">International Guide</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Company</h3>
            <ul className={styles.columnLinks}>
              <li><Link href="#">About</Link></li>
              <li><Link href="#">Blog</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>© 2026 Collegia. All rights reserved.</p>
            <div className={styles.legal}>
              <Link href="#">Privacy Policy</Link>
              <Link href="#">Terms of Use</Link>
              <Link href="#">Cookie Settings</Link>
            </div>
            <p className={styles.disclaimer}>
              College match information is for guidance only and does not predict actual admissions outcomes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
