"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Hero section">
      {/* Background Photo */}
      <div className={styles.bg}>
        <Image
          src="/images/hero_campus.jpg"
          alt="Diverse international college students walking across a beautiful American university campus"
          fill
          style={{ objectFit: "cover", objectPosition: "center 30%" }}
          priority
          sizes="100vw"
        />
        <div className={styles.overlay} />
      </div>

      {/* Content */}
      <div className={`container ${styles.content}`}>
        <div className={styles.badge}>
          <Globe size={14} />
          Built for international students
        </div>

        <h1 className={styles.headline}>
          Your future starts<br />
          <em>with knowing where</em><br />
          you belong.
        </h1>

        <p className={styles.sub}>
          Find colleges that fit you, understand where you stand,<br className={styles.br} />
          and build your path to get there.
        </p>

        <div className={styles.actions}>
          <Link href="/discover/match" className={`btn btn-primary btn-lg ${styles.primary}`} id="hero-cta-match">
            Find My Colleges
            <ArrowRight size={18} />
          </Link>
          <Link href="/discover" className={`btn btn-outline-white btn-lg`} id="hero-cta-explore">
            Explore Colleges
          </Link>
        </div>

        {/* Floating stat cards */}
        <div className={styles.floatingCards}>
          <div className={styles.floatCard}>
            <span className={styles.floatNumber}>4,000+</span>
            <span className={styles.floatLabel}>US Colleges</span>
          </div>
          <div className={`${styles.floatCard} ${styles.floatCardAlt}`}>
            <span className={styles.floatNumber}>140+</span>
            <span className={styles.floatLabel}>Countries</span>
          </div>
          <div className={styles.floatCard}>
            <span className={styles.floatNumber}>Free</span>
            <span className={styles.floatLabel}>To Get Started</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollHint} aria-hidden="true">
        <div className={styles.scrollLine} />
        <span>Scroll</span>
      </div>
    </section>
  );
}
