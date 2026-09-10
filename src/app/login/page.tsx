"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import styles from "./auth.module.css";

/**
 * Authenticates through the Auth.js HTTP endpoint instead of the
 * server-action `signIn()`. The browser obtains the CSRF token, POSTs
 * the credentials to the callback, and stores the session cookie from
 * the response — the flow that works reliably on localhost and Vercel.
 */
async function signInWithCredentials(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const csrfRes = await fetch("/api/auth/csrf", { credentials: "include" });
  if (!csrfRes.ok) return { ok: false, error: "Unable to sign in right now. Please try again." };
  const { csrfToken } = (await csrfRes.json()) as { csrfToken?: string };
  if (!csrfToken) return { ok: false, error: "Unable to sign in right now. Please try again." };

  const body = new URLSearchParams({ csrfToken, email, password, callbackUrl: "/journey" });
  const authRes = await fetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    credentials: "include",
    redirect: "manual",
  });

  const location = authRes.headers.get("location") ?? "";
  if (location.includes("error=")) {
    return { ok: false, error: "Invalid email or password." };
  }
  return { ok: true };
}

export default function LoginPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const result = await signInWithCredentials(email, password);
      setBusy(false);
      if (result.ok) {
        router.push("/journey");
        router.refresh();
      } else {
        setError(result.error ?? "Invalid email or password.");
      }
    } catch {
      setBusy(false);
      setError("Unable to sign in right now. Please try again.");
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