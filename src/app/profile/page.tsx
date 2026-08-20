import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import ProfileContent from "@/components/profile/ProfileContent";
import { getStudentProfile } from "@/lib/services/profile.service";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your academic profile and college preferences.",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getStudentProfile();

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        <div className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.sub}>Update your academic details and preferences to get better college matches.</p>
          </div>
        </div>

        {profile ? (
          <ProfileContent profile={profile} />
        ) : (
          <div className="container" style={{paddingTop: "var(--space-16)"}}>
            <div className="card" style={{padding: "var(--space-12)", textAlign: "center"}}>
              <h2 style={{fontSize: 20, fontWeight: 700, marginBottom: "var(--space-3)"}}>Welcome to COLLEGIA</h2>
              <p className="body-sm" style={{color: "var(--color-ink-muted)", maxWidth: 480, margin: "0 auto"}}>
                Your profile has not been set up yet. Run the development seed to create a starter profile,
                or complete the on-boarding flow in a future phase.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}