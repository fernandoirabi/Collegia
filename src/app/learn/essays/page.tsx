import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import LearningCategoryHub from "@/components/learning/LearningCategoryHub";
import { essayGuides } from "@/data/guides/essays";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "College Essays",
  description:
    "Learn how to write authentic, compelling college essays — from choosing a topic to your final revision.",
};

export default function EssaysPage() {
  const bySlug = (slug: string) => essayGuides.find((g) => g.slug === slug)!;
  const featured = essayGuides.filter((g) => g.featured);

  const groups = [
    {
      title: "Finding Your Idea",
      description: "Choose a meaningful topic and brainstorm the strongest material.",
      guides: [
        bySlug("choosing-an-essay-topic"),
        bySlug("essay-brainstorming"),
      ],
    },
    {
      title: "Writing the Essay",
      description: "Structure your essay, develop your voice, and show who you really are.",
      guides: [
        bySlug("essay-structure"),
        bySlug("why-this-major"),
      ],
    },
    {
      title: "Supplemental Essays",
      description: "Answer 'Why this college?' and other school-specific prompts well.",
      guides: [
        bySlug("supplemental-essays"),
        bySlug("why-this-college"),
      ],
    },
    {
      title: "Polishing Your Work",
      description: "Avoid common mistakes and run a final checklist before you submit.",
      guides: [
        bySlug("common-essay-mistakes"),
        bySlug("final-essay-checklist"),
      ],
    },
  ];

  return (
    <>
      <Navigation />
      <LearningCategoryHub
        eyebrow="Learning · Essays"
        title="College Essays"
        subtitle="Your essay is your chance to speak directly to admissions officers. Learn how to write authentic, compelling essays that show who you really are."
        featured={featured}
        groups={groups}
        secondaryAction={{ label: "Browse All Guides", href: "/learn/all-guides" }}
        bottomTitle="Write an essay that sounds like you"
        bottomDescription="Authenticity, structure, and revision are the keys. Start with the guide that matches where you are in the process."
        bottomAction={{ label: "Browse All Guides", href: "/learn/all-guides" }}
      >
        <EssayWorkflow />
      </LearningCategoryHub>
      <Footer />
    </>
  );
}

function EssayWorkflow() {
  const steps = ["IDEA", "OUTLINE", "DRAFT", "REVISE", "FINAL"];

  return (
    <section className={styles.workflowSection}>
      <div className={styles.workflowHeader}>
        <h2 className={styles.workflowTitle}>How to Approach Any Essay</h2>
        <p className={styles.workflowLead}>
          Great essays are not written in one sitting — they are built through a clear, repeatable process.
        </p>
      </div>
      <div className={styles.workflow}>
        {steps.map((step, i) => (
          <div className={styles.workflowItem} key={step}>
            <span className={styles.workflowNum}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.workflowStep}>{step}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
