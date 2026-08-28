import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import LearningCategoryHub from "@/components/learning/LearningCategoryHub";
import { financialAidGuides } from "@/data/guides/financial-aid";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Financial Aid",
  description:
    "Understand U.S. college costs, tuition, scholarships, financial aid, and how to compare offers — from sticker price to net cost.",
};

export default function FinancialAidPage() {
  const bySlug = (slug: string) => financialAidGuides.find((g) => g.slug === slug)!;
  const featured = financialAidGuides.filter((g) => g.featured);

  const groups = [
    {
      title: "Understanding the Costs",
      description: "Learn what you actually pay and how the sticker price becomes a net cost.",
      guides: [
        bySlug("understanding-us-college-costs"),
        bySlug("financial-aid-explained"),
        bySlug("merit-scholarships"),
      ],
    },
    {
      title: "Applying for Aid",
      description: "Navigating need-based aid, the CSS Profile, and comparing your offers.",
      guides: [
        bySlug("need-based-aid"),
        bySlug("css-profile"),
        bySlug("comparing-financial-aid-offers"),
      ],
    },
  ];

  return (
    <>
      <Navigation />
      <LearningCategoryHub
        eyebrow="Learning · Financial Aid"
        title="Financial Aid for College"
        subtitle="Understanding tuition, scholarships, financial aid, and the true cost of studying in the U.S. — so you can plan with confidence."
        featured={featured}
        groups={groups}
        primaryAction={{ label: "Compare College Costs", href: "/discover/search" }}
        secondaryAction={{ label: "Browse All Guides", href: "/learn/all-guides" }}
        bottomTitle="How do you get from sticker price to net cost?"
        bottomDescription="Compare colleges and their aid policies side by side to estimate what you will actually pay."
        bottomAction={{ label: "Search Colleges", href: "/discover/search" }}
      >
        <StickerToNet />
      </LearningCategoryHub>
      <Footer />
    </>
  );
}

function StickerToNet() {
  const steps = [
    {
      label: "STICKER PRICE",
      note: "Tuition · Room · Board · Books",
      desc: "The official cost before any aid — higher for international students.",
    },
    {
      label: "FINANCIAL AID",
      note: "Federal · Institutional · CSS Profile",
      desc: "Aid reduces what you pay. Note: U.S. federal aid is generally not available to international students.",
    },
    {
      label: "SCHOLARSHIPS",
      note: "Merit · Need · Grants",
      desc: "Grants and scholarships that never have to be repaid.",
    },
    {
      label: "NET COST",
      note: "What you actually pay",
      desc: "The real price you plan for — compare this across schools.",
    },
  ];

  return (
    <section className={styles.calcSection}>
      <div className={styles.calcHeader}>
        <h2 className={styles.calcTitle}>From Sticker Price to Net Cost</h2>
        <p className={styles.calcLead}>
          Helpful for international students: understand the chain that determines what a college truly costs.
        </p>
      </div>
      <div className={styles.calcFlow}>
        {steps.map((step, i) => (
          <div className={styles.calcBlock} key={step.label}>
            <div className={styles.calcCard}>
              <span className={styles.calcLabel}>{step.label}</span>
              <span className={styles.calcNote}>{step.note}</span>
              <p className={styles.calcDesc}>{step.desc}</p>
            </div>
            {i < steps.length - 1 && <span className={styles.calcArrow}>↓</span>}
          </div>
        ))}
      </div>
      <div className={styles.calcFootnote}>
        The sticker price is a starting point, not the bill. Two schools can look very different on paper but cost
        you similar amounts after aid and scholarships — always compare by net cost.
      </div>
    </section>
  );
}
