"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import styles from "./Navigation.module.css";

const navLinks = [
  {
    label: "Discover",
    href: "/discover",
    children: [
      { label: "Search Colleges", href: "/discover/search", desc: "Browse all US colleges" },
      { label: "College Match", href: "/discover/match", desc: "Find colleges that fit you" },
    ],
  },
  {
    label: "My Journey",
    href: "/journey",
    children: [
      { label: "My Colleges", href: "/journey/colleges", desc: "Your saved college list" },
      { label: "Goals", href: "/journey/goals", desc: "Track your improvement" },
    ],
  },
  {
    label: "Learn",
    href: "/learn",
    children: [
      { label: "How to Apply", href: "/learn/how-to-apply", desc: "Step-by-step application guide" },
      { label: "Financial Aid", href: "/learn/financial-aid", desc: "Scholarships & aid for internationals" },
      { label: "Essays", href: "/learn/essays", desc: "Write a standout essay" },
      { label: "International Students", href: "/learn/international-students", desc: "Visa, F-1, OPT & more" },
    ],
  },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isHomepage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navClass = [
    styles.nav,
    isHomepage && !scrolled ? styles.transparent : styles.solid,
    scrolled ? styles.scrolled : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <nav className={navClass} role="navigation" aria-label="Main navigation">
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo} aria-label="COLLEGIA Home">
            COLLEGIA
          </Link>

          {/* Desktop Nav Links */}
          <div className={styles.links} role="menubar">
            {navLinks.map((item) => (
              <div
                key={item.label}
                className={styles.navItem}
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
                onFocus={() => setActiveDropdown(item.label)}
                onBlur={() => setActiveDropdown(null)}
                role="menuitem"
              >
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${pathname.startsWith(item.href) ? styles.active : ""}`}
                >
                  {item.label}
                  {item.children && <ChevronDown size={14} className={styles.chevron} />}
                </Link>

                {item.children && activeDropdown === item.label && (
                  <div className={styles.dropdown} role="menu">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href} className={styles.dropdownItem} role="menuitem">
                        <span className={styles.dropdownLabel}>{child.label}</span>
                        <span className={styles.dropdownDesc}>{child.desc}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className={styles.actions}>
            <button className={styles.searchBtn} aria-label="Search">
              <Search size={18} />
            </button>
            <Link href="/profile" className={styles.signIn}>
              Sign In
            </Link>
            <Link href="/discover/match" className={`btn btn-primary btn-sm ${styles.cta}`}>
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ""}`} aria-hidden={!mobileOpen}>
        <div className={styles.mobileInner}>
          <div className={styles.mobileLinks}>
            {navLinks.map((item) => (
              <div key={item.label} className={styles.mobileGroup}>
                <Link href={item.href} className={styles.mobileGroupTitle}>
                  {item.label}
                </Link>
                {item.children && (
                  <div className={styles.mobileChildren}>
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href} className={styles.mobileChild}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.mobileActions}>
            <Link href="/profile" className="btn btn-secondary" style={{width:"100%", justifyContent:"center"}}>
              Sign In
            </Link>
            <Link href="/discover/match" className="btn btn-primary" style={{width:"100%", justifyContent:"center"}}>
              Get Started — It&apos;s Free
            </Link>
          </div>

          <div className={styles.mobileBadge}>
            <span>🌎 Built for international students</span>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
