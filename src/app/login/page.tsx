"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { loginAction } from "@/actions/auth";
import styles from "./auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await loginAction({
      email: form.get("email"),
      password: form.get("password"),
    });
    setBusy(false);
    if (result.ok) {
      router.push("/journey");
      router.refresh();
    } else {
      setError(result.error ?? "Unable to sign in.");
    }
  };

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        <div className="container-narrow">
          <div className={`card ${styles.card}`}>
            <div className={styles.header}>
              <h1 className={styles.title}>Welcome back</h1>
              <p className={styles.sub}>Sign in to continue your college journey.</p>
            </div>
            <form className={styles.form} onSubmit={onSubmit}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
                required
              />
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder="Your password"
                required
              />
              {error && <p className={styles.error}>{error}</p>}
              <button className={`btn btn-primary ${styles.submit}`} disabled={busy}>
                {busy ? "Signing in…" : "Sign In"}
              </button>
            </form>
            <p className={styles.footnote}>
              New to COLLEGIA?{" "}
              <Link href="/signup" className={styles.link}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}