import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import LearningCategoryHub from "@/components/learning/LearningCategoryHub";
import { internationalGuides } from "@/data/guides/international";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "International Students",
  description:
    "The complete U.S. college application guide for international students — transcripts, tests, aid, visas, and life after admission.",
};

export default function InternationalStudentsPage() {
  const bySlug = (slug: string) => internationalGuides.find((g) => g.slug === slug)!;
  const featured = internationalGuides.filter((g) => g.featured);

  const groups = [
    {
      title: "Getting Started",
      description: "The extra steps, tests, and documents international applicants need.",
      guides: [
        bySlug("applying-as-an-international-student"),
        bySlug("english-proficiency-tests"),
        bySlug("international-transcripts"),
      ],
    },
    {
      title: "Financial Aid & Admission Policies",
      description: "How aid works for internationals and how need-blind vs need-aware changes your options.",
      guides: [
        bySlug("international-financial-aid"),
        bySlug("need-blind-vs-need-aware"),
      ],
    },
    {
      title: "Visas & After Admission",
      description: "From your I-20 and F-1 visa to your first weeks on a U.S. campus.",
      guides: [
        bySlug("student-visa-basics"),
        bySlug("i20-proof-of-funds"),
        bySlug("what-happens-after-admission"),
      ],
    },
  ];

  return (
    <>
      <Navigation />
      <LearningCategoryHub
        eyebrow="Learning · International Students"
        title="International Students"
        subtitle="The U.S. college application process looks different for international students. Here's how to handle transcripts, tests, financial aid, visas, and what happens after you get in."
        featured={featured}
        groups={groups}
        primaryAction={{ label: "Find International-Friendly Colleges", href: "/discover/match" }}
        secondaryAction={{ label: "Browse All Guides", href: "/learn/all-guides" }}
        bottomTitle="Your journey, step by step"
        bottomDescription="From researching colleges to arriving on campus, every stage is covered. Build a list that truly supports international students."
        bottomAction={{ label: "Get Your College Match", href: "/discover/match" }}
      >
        <Pathway />
      </LearningCategoryHub>
      <Footer />
    </>
  );
}

function Pathway() {
  const steps = [
    { label: "Research & Apply", desc: "Tests, transcripts, essays, and a balanced list." },
    { label: "Financial Planning", desc: "Aid, scholarships, and proof of funds." },
    { label: "Visa & I-20", desc: "Get your F-1 visa and student documents in order." },
    { label: "Arrive & Thrive", desc: "Move to campus and make the transition a success." },
  ];

  return (
    <section className={styles.pathwaySection}>
      <div className={styles.pathwayHeader}>
        <h2 className={styles.pathwayTitle}>The International Student Journey</h2>
        <p className={styles.pathwayLead}>
          Four phases carry you from first question to first day of class.
        </p>
      </div>
      <div className={styles.pathway}>
        {steps.map((step, i) => (
          <div className={styles.pathwayItem} key={step.label}>
            <span className={styles.pathwayNum}>{String(i + 1).padStart(2, "0")}</span>
            <h3 className={styles.pathwayStep}>{step.label}</h3>
            <p className={styles.pathwayDesc}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
