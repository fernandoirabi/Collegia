import type { Metadata } from "next";
import ProfileComingSoon from "@/components/profile/ProfileComingSoon";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Your personalized student profile is coming soon to COLLEGIA.",
};

export default function ProfilePage() {
  return <ProfileComingSoon />;
}