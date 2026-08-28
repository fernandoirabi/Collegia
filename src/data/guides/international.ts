import type { Guide } from "@/types/guides";

export const internationalGuides: Guide[] = [
  {
    id: "g-applying-international",
    slug: "applying-as-an-international-student",
    title: "Applying as an International Student",
    description:
      "U.S. admissions looks different for international applicants. Learn the extra steps, documents, and considerations.",
    category: "international",
    readTime: 9,
    difficulty: "beginner",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-20",
    featured: true,
    takeaways: [
      "International applicants face additional requirements beyond the standard application.",
      "Colleges classify international students differently, so check each school.",
      "Plan extra time for transcripts, tests, and financial documents.",
    ],
    sections: [
      {
        id: "how-admissions-differs",
        title: "How Admissions Differs for International Students",
        content:
          "As an international applicant, you are reviewed on the same core elements — academics, essays, activities, and recommendations — but with additional factors. Colleges consider your country's educational system, your English proficiency, your ability to fund your studies, and how you fit their international student community.",
      },
      {
        id: "who-counts-as-international",
        title: "Who Counts as International?",
        content:
          "Colleges define 'international' in different ways. Most use it to mean students who are not U.S. citizens or permanent residents, regardless of where they attend secondary school. A few consider your country of residence or where you attend school. Because definitions vary, check how each college classifies you and what application requirements follow.",
      },
      {
        id: "extra-requirements",
        title: "The Extra Requirements",
        content:
          "Beyond the standard application, international students typically need:\n\n• English proficiency test scores (TOEFL, IELTS, or Duolingo)\n• Translated and evaluated academic records\n• Financial documentation proving you can fund your studies\n• A passport copy and, after admission, an I-20 and student visa\n\nNot every school needs all of these, so verify each one.",
      },
      {
        id: "financial-considerations",
        title: "Financial Considerations",
        content:
          "Most U.S. colleges require international students to show they can pay, and many do not offer aid. Research which schools are need-blind or need-aware for international applicants, and whether they offer merit scholarships. Your financial situation may affect both your admission chances and your visa documents.",
      },
      {
        id: "strong-strategies",
        title: "Strategies for a Strong Application",
        content:
          "Emphasize what makes your international perspective valuable. Highlight academic strength, your ability to adapt, and your English ability. Choose a balanced list that includes schools genuinely open to international students, and use tools like College Match to find schools where you are competitive.",
      },
    ],
    relatedGuides: [
      { slug: "english-proficiency-tests", title: "English Proficiency Tests", category: "international" },
      { slug: "international-transcripts", title: "International Transcripts", category: "international" },
      { slug: "international-financial-aid", title: "International Financial Aid", category: "international" },
    ],
    cta: {
      label: "Find International-Friendly Colleges",
      href: "/discover/match",
      description: "See colleges that welcome and support international students.",
    },
  },
  {
    id: "g-english-proficiency-tests",
    slug: "english-proficiency-tests",
    title: "English Proficiency Tests",
    description:
      "Most U.S. colleges require proof of English proficiency. Compare TOEFL, IELTS, and the Duolingo English Test.",
    category: "international",
    readTime: 8,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-18",
    featured: false,
    takeaways: [
      "Colleges differ on which tests they accept and their minimum scores.",
      "TOEFL, IELTS, and Duolingo are the most common options.",
      "Check required and recommended scores for each school in advance.",
    ],
    sections: [
      {
        id: "why-it-is-required",
        title: "Why Colleges Require It",
        content:
          "U.S. colleges need assurance that you can succeed in an English-speaking classroom. English proficiency tests measure your reading, listening, speaking, and writing. Whether you need one, and which you can use, depends on the college and your educational background.",
      },
      {
        id: "toefl-ielts-duolingo",
        title: "TOEFL, IELTS, and Duolingo",
        content:
          "The most common options are the TOEFL, the IELTS Academic, and the Duolingo English Test (DET). TOEFL is widely used for U.S. admissions, IELTS is recognized globally, and Duolingo offers an at-home, lower-cost option with faster results. Each uses a different scoring scale.",
      },
      {
        id: "which-to-choose",
        title: "Which Test Should You Take?",
        content:
          "Check which tests your target colleges accept. If multiple are accepted, weigh the test format against your strengths — for example, whether you prefer computer-based or in-person testing. Consider cost, availability in your country, and how quickly you need results.",
      },
      {
        id: "score-targets",
        title: "Score Targets",
        content:
          "Every college sets its own minimums and recommended scores. A few even waive the requirement for students whose secondary education was in English. Look up each school's exact requirements and aim comfortably above the minimum to keep your options open.",
      },
      {
        id: "timing",
        title: "Timing Your Test",
        content:
          "Test and score reporting can take weeks, so plan early and schedule well before your application deadlines. If your first score is below target, leave time for a retake. Strong English performance also strengthens the rest of your application.",
      },
    ],
    relatedGuides: [
      { slug: "applying-as-an-international-student", title: "Applying as an International Student", category: "international" },
      { slug: "standardized-testing", title: "Standardized Testing", category: "application" },
      { slug: "international-transcripts", title: "International Transcripts", category: "international" },
    ],
  },
  {
    id: "g-international-transcripts",
    slug: "international-transcripts",
    title: "International Transcripts",
    description:
      "Submitting foreign academic records to U.S. colleges comes with specific rules. Here's how to get it right.",
    category: "international",
    readTime: 7,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-15",
    featured: false,
    takeaways: [
      "Grading scales and course structures differ by country.",
      "Some colleges require accredited credential evaluation.",
      "Prepare translations and official copies well ahead of deadlines.",
    ],
    sections: [
      {
        id: "what-colleges-need",
        title: "What Colleges Need",
        content:
          "Colleges need your official secondary school records listing the courses you took and the grades you earned. Because education systems and grading scales differ worldwide, schools may ask for translations or an evaluation that explains how your grades compare to a U.S. scale.",
      },
      {
        id: "translations",
        title: "Translations",
        content:
          "Many colleges require official English translations of foreign-language documents. Confirm whether your school can provide them or whether you need a certified translator. Submit records in the original language alongside the translation when required.",
      },
      {
        id: "credential-evaluation",
        title: "Foreign Credential Evaluation",
        content:
          "Some colleges ask for an evaluation by a recognized agency that converts your foreign credentials into U.S. equivalents, including an estimated GPA. This is not always required, so check each school. Evaluations take time and cost money, so plan ahead.",
      },
      {
        id: "gpa-considerations",
        title: "GPA Considerations",
        content:
          "Your secondary school likely uses a different grading scale than the U.S. system. Admissions officers are trained to read international records and compare them within your educational context. You do not need a U.S. GPA, but an evaluation can help when a college requests one.",
      },
      {
        id: "submission-logistics",
        title: "Submission Logistics",
        content:
          "Ask your school how to send official records — electronically, by mail, or both. Understand each college's rules, because some require documents directly from your school. Start this process early, as international mail and evaluation delays can be significant.",
      },
    ],
    relatedGuides: [
      { slug: "transcripts-academic-records", title: "Transcripts & Academic Records", category: "application" },
      { slug: "applying-as-an-international-student", title: "Applying as an International Student", category: "international" },
      { slug: "common-app-guide", title: "Common App Guide", category: "application" },
    ],
  },
  {
    id: "g-international-financial-aid",
    slug: "international-financial-aid",
    title: "International Financial Aid",
    description:
      "Financial aid for international students is limited and varies by school. Learn what is available and how to find it.",
    category: "international",
    readTime: 9,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-12",
    featured: true,
    takeaways: [
      "U.S. federal aid (FAFSA) is generally not available to international students.",
      "Institutional merit scholarships are the most common aid for internationals.",
      "Aid policies and generosity differ greatly between colleges.",
    ],
    sections: [
      {
        id: "the-federal-rule",
        title: "The Key Rule: Know Your Aid Eligibility",
        content:
          "The most important fact for international students: U.S. federal financial aid, which is based on the FAFSA, is generally not available to international students who are not U.S. citizens or eligible non-citizens. Do not assume you can access federal grants or loans. Instead, focus on institutional and private sources of aid.",
      },
      {
        id: "institutional-aid",
        title: "Institutional Aid",
        content:
          "Your best source of aid is usually the college itself. Some private colleges offer generous aid to international students, including merit scholarships and even full-need packages. Public universities may offer smaller merit awards but rarely need-based aid to internationals.",
      },
      {
        id: "merit-scholarships",
        title: "Merit Scholarships for Internationals",
        content:
          "Merit scholarships are awarded for your achievements and do not require proof of financial need, which makes them the most accessible aid for international applicants. Their amounts range from a few thousand dollars to full tuition. See our Merit Scholarships guide for details.",
      },
      {
        id: "private-scholarships",
        title: "Private Scholarships",
        content:
          "Beyond colleges, some private foundations and organizations fund international students studying in the U.S. Eligibility and amounts vary widely. Research reputable opportunities and beware of any scholarship that asks for payment to apply.",
      },
      {
        id: "aid-policies-differ",
        title: "Policies Differ by College",
        content:
          "There is no one rule for international aid. Whether a college is need-blind or need-aware, whether it meets full need for internationals, and how much merit aid it offers all vary by school. Research each school's financial aid policies for international students before applying.",
      },
    ],
    relatedGuides: [
      { slug: "financial-aid-explained", title: "Financial Aid Explained", category: "financial-aid" },
      { slug: "need-blind-vs-need-aware", title: "Need-Blind vs Need-Aware", category: "international" },
      { slug: "merit-scholarships", title: "Merit Scholarships", category: "financial-aid" },
    ],
    cta: {
      label: "Compare Colleges That Offer Aid",
      href: "/discover/search",
      description: "Filter colleges by aid availability and cost.",
    },
  },
  {
    id: "g-need-blind-vs-need-aware",
    slug: "need-blind-vs-need-aware",
    title: "Need-Blind vs Need-Aware Admissions",
    description:
      "Understand two policies that shape international admissions and financial aid decisions at every college.",
    category: "international",
    readTime: 7,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-10",
    featured: false,
    takeaways: [
      "Need-blind means your ability to pay is not considered in admission.",
      "Need-aware means requesting aid can affect the admission decision.",
      "Fewer schools are need-blind for international students than for domestic students.",
    ],
    sections: [
      {
        id: "definitions",
        title: "The Two Policies",
        content:
          "Need-blind admissions means a college does not consider your financial need when deciding whether to admit you. Need-aware (sometimes called need-sensitive) means a college may consider how much financial aid you request when making its decision, because aid budgets are limited.",
      },
      {
        id: "why-it-matters",
        title: "Why It Matters For You",
        content:
          "If you plan to request financial aid, this distinction is critical. At a need-aware school, asking for aid can reduce your chances of admission, especially at highly selective colleges. At a need-blind school, you can request aid without affecting the admission decision — but need-blind does not mean need-blind aid is guaranteed.",
      },
      {
        id: "international-vs-domestic",
        title: "The International Difference",
        content:
          "Many colleges that are need-blind for domestic students are need-aware for international students, because international aid comes from limited budgets. Only a small number of colleges are need-blind for international applicants. Check the specific policy at each school.",
      },
      {
        id: "need-blind-vs-full-need",
        title: "Need-Blind vs Meeting Full Need",
        content:
          "These are separate ideas. A college can be need-blind (ignores need in admission) without meeting full need (guaranteeing enough aid to cover your entire cost). Research both for every college you are considering, especially if you need significant aid.",
      },
      {
        id: "how-to-use-this",
        title: "How to Use This Information",
        content:
          "Build your list with this in mind. If you need substantial aid, prioritize schools that are need-blind for internationals or that meet full need. If you can self-fund, need-aware schools are less of a concern. Use a balanced list to manage financial risk.",
      },
    ],
    relatedGuides: [
      { slug: "international-financial-aid", title: "International Financial Aid", category: "international" },
      { slug: "need-based-aid", title: "Need-Based Financial Aid", category: "financial-aid" },
      { slug: "how-to-build-a-college-list", title: "How to Build a College List", category: "application" },
    ],
    cta: {
      label: "Build a Balanced List",
      href: "/discover/match",
      description: "Find schools aligned with your financial situation.",
    },
  },
  {
    id: "g-student-visa-basics",
    slug: "student-visa-basics",
    title: "Student Visa Basics",
    description:
      "After admission, you will need an F-1 student visa. Learn the basics of the visa process and where to find official guidance.",
    category: "international",
    readTime: 8,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-08",
    featured: true,
    takeaways: [
      "The F-1 visa is the standard visa for full-time academic students.",
      "You need an I-20 from your school before applying for the visa.",
      "Always verify current requirements with official government sources.",
    ],
    sections: [
      {
        id: "the-f1-visa",
        title: "The F-1 Student Visa",
        content:
          "The F-1 visa is the U.S. visa category for international students pursuing a full course of study at an accredited institution. It allows you to enter the U.S. to study. Other categories exist, but F-1 is by far the most common for undergraduate students.",
      },
      {
        id: "the-application-flow",
        title: "How the Process Works",
        content:
          "The general flow is: 1) get admitted and confirm your school, 2) provide financial documents so your school can issue an I-20 form, 3) pay the SEVIS fee, 4) complete the DS-160 visa application and pay the fee, and 5) attend a visa interview at a U.S. embassy or consulate. Requirements can change, so confirm current steps with official sources.",
      },
      {
        id: "maintaining-status",
        title: "Maintaining Your F-1 Status",
        content:
          "Once in the U.S., you must maintain your F-1 status by enrolling full-time, keeping your visa documents current, and following restrictions on work. Understanding your responsibilities before you travel helps you avoid problems.",
      },
      {
        id: "work-options",
        title: "Working as an F-1 Student",
        content:
          "F-1 students have limited work options. On-campus jobs are generally allowed, while off-campus employment is restricted and usually requires authorization through programs like Curricular Practical Training (CPT) or Optional Practical Training (OPT). Always verify rules before taking any job.",
      },
      {
        id: "official-sources",
        title: "Always Check Official Sources",
        content:
          "Visa rules change and each embassy is different. For current, official information, rely on the U.S. Department of State travel website, the U.S. Citizenship and Immigration Services (USCIS) website, and your university's international student office. Treat this guide as an orientation, not a substitute for official guidance.",
      },
    ],
    relatedGuides: [
      { slug: "i20-proof-of-funds", title: "I-20 and Proof of Funds", category: "international" },
      { slug: "what-happens-after-admission", title: "What Happens After Admission", category: "international" },
      { slug: "applying-as-an-international-student", title: "Applying as an International Student", category: "international" },
    ],
  },
  {
    id: "g-i20-proof-of-funds",
    slug: "i20-proof-of-funds",
    title: "I-20 and Proof of Funds",
    description:
      "Your I-20 is the document that lets you apply for an F-1 visa. Learn how to get one, including the financial proof required.",
    category: "international",
    readTime: 7,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-06",
    featured: false,
    takeaways: [
      "The I-20 is an official form your school issues after you are admitted.",
      "You must show proof of funds to support one full year of study.",
      "Keep your I-20 safe and keep it valid throughout your studies.",
    ],
    sections: [
      {
        id: "what-is-the-i20",
        title: "What Is the I-20?",
        content:
          "The I-20 is an official Certificate of Eligibility issued by your school through the U.S. government's SEVIS system. It is the document you need to apply for an F-1 visa and to enter the U.S. as a student. You cannot get an F-1 visa without an I-20 from your school.",
      },
      {
        id: "how-to-get-one",
        title: "How to Get Your I-20",
        content:
          "After admission, your school's international student office will ask you to confirm your enrollment and provide proof of funds. Once your school verifies your financial ability, it issues your I-20 and sends it to you, sometimes electronically. Respond promptly and accurately to keep the process moving.",
      },
      {
        id: "proof-of-funds",
        title: "Proof of Funds",
        content:
          "To issue an I-20, your school must certify that you can afford your first year. You will provide bank statements or a sponsor's financial documents showing sufficient funds for tuition, living expenses, and other costs. The exact amount needed is based on your school's cost of attendance.",
      },
      {
        id: "keeping-it-valid",
        title: "Keeping Your I-20 Valid",
        content:
          "Your I-20 includes an expiration date linked to your program. To keep it valid, you must maintain full-time enrollment and keep your school informed of any changes to your situation. Extend or renew it through your international student office if needed.",
      },
      {
        id: "other-documents",
        title: "Other Documents You'll Need",
        content:
          "Alongside the I-20, you will need your passport valid for the duration of study, the SEVIS fee receipt, proof of your financial ability, and other items your school or embassy requests. Confirm the exact list with your school and the U.S. embassy in your country.",
      },
    ],
    relatedGuides: [
      { slug: "student-visa-basics", title: "Student Visa Basics", category: "international" },
      { slug: "what-happens-after-admission", title: "What Happens After Admission", category: "international" },
      { slug: "international-financial-aid", title: "International Financial Aid", category: "international" },
    ],
  },
  {
    id: "g-after-admission",
    slug: "what-happens-after-admission",
    title: "What Happens After Admission",
    description:
      "You got in — now what? Learn the practical steps from accepting an offer to your first weeks on a U.S. campus.",
    category: "international",
    readTime: 9,
    difficulty: "beginner",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-04",
    featured: true,
    takeaways: [
      "Celebrate, then work through deadlines for enrollment and housing.",
      "Get your I-20, visa, and travel arrangements done early.",
      "Plan ahead for academics, costs, and culture before you arrive.",
    ],
    sections: [
      {
        id: "accept-your-offer",
        title: "Accept Your Offer",
        content:
          "Compare your admission and financial aid offers, then accept your choice before the school's response deadline. If you accepted an Early Decision offer, remember it is binding. Other schools may require a deposit, which is often applied to your first semester but can come with deadlines.",
      },
      {
        id: "visa-and-travel",
        title: "Visa and Travel Steps",
        content:
          "Start your F-1 process as soon as you accept: provide proof of funds and confirm your enrollment so your school can issue an I-20, pay the SEVIS fee, complete your visa application, and schedule your interview early. Book international travel after your visa is approved and plan to arrive before orientation.",
      },
      {
        id: "housing-and-before-you-go",
        title: "Housing and Pre-Arrival Tasks",
        content:
          "Complete housing applications and deposits early, since on-campus housing can fill. Register for orientation, submit required health forms and immunizations, and enroll in courses once registration opens. Confirm whether you need to arrange international student health insurance.",
      },
      {
        id: "your-first-weeks",
        title: "Your First Weeks on Campus",
        content:
          "Attend orientation, meet your academic advisor, open a U.S. bank account if helpful, and learn about your international student office. Connect with international clubs and communities to build your network. Give yourself time to adjust to a new culture, classes, and daily life.",
      },
      {
        id: "transitioning-to-us-life",
        title: "Transitioning to U.S. College Life",
        content:
          "Adapting takes time and is completely normal. U.S. classes often emphasize participation and discussion, which may feel different from your previous schooling. Ask questions, use office hours, and reach out to support services. Building a support network early helps you thrive personally and academically.",
      },
    ],
    relatedGuides: [
      { slug: "student-visa-basics", title: "Student Visa Basics", category: "international" },
      { slug: "i20-proof-of-funds", title: "I-20 and Proof of Funds", category: "international" },
      { slug: "comparing-financial-aid-offers", title: "Comparing Financial Aid Offers", category: "financial-aid" },
    ],
  },
];
