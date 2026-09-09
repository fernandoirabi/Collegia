"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { signupAction } from "@/actions/auth";
import styles from "../login/auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await signupAction({
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      password: form.get("password"),
    });
    setBusy(false);
    if (result.ok) {
      router.push("/journey");
      router.refresh();
    } else {
      setError(result.error ?? "Unable to create your account.");
    }
  };

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        <div className="container-narrow">
          <div className={`card ${styles.card}`}>
            <div className={styles.header}>
              <h1 className={styles.title}>Create your account</h1>
              <p className={styles.sub}>
                Get your own personalized college matches, saved lists, and improvement goals.
              </p>
            </div>
            <form className={styles.form} onSubmit={onSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <label className={styles.label} htmlFor="firstName">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    className="input"
                    placeholder="Aiko"
                  />
                </div>
                <div>
                  <label className={styles.label} htmlFor="lastName">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    className="input"
                    placeholder="Tanaka"
                  />
                </div>
              </div>
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
                autoComplete="new-password"
                className="input"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
              {error && <p className={styles.error}>{error}</p>}
              <button className={`btn btn-primary ${styles.submit}`} disabled={busy}>
                {busy ? "Creating account…" : "Create Account"}
              </button>
              <p className={styles.footnote}>
                By signing up you agree that your data is yours alone.{" "}
                <Link href="/login" className={styles.link}>
                  Already have an account?
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}