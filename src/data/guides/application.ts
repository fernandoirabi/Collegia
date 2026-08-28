import type { Guide } from "@/types/guides";

export const applicationGuides: Guide[] = [
  {
    id: "g-how-us-admissions-works",
    slug: "how-us-college-admissions-works",
    title: "How U.S. College Admissions Works",
    description:
      "A clear overview of how American colleges evaluate applicants, so you can understand the process before you start.",
    category: "application",
    readTime: 9,
    difficulty: "beginner",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-20",
    featured: true,
    takeaways: [
      "Admissions is holistic — grades, scores, essays, activities, and fit all matter.",
      "Colleges balance academic strength with the rest of your story.",
      "Each college evaluates applicants independently, so no single number decides everything.",
    ],
    sections: [
      {
        id: "holistic-review",
        title: "What Is Holistic Review?",
        content:
          "Most U.S. colleges use holistic review. That means they look at your application as a whole rather than ranking you purely on one score or grade. Admissions officers consider your grades, the rigor of your classes, your test scores, your essays, your activities, and your recommendation letters together.\n\nHolistic review is not the same at every school. Large public universities often rely more heavily on numbers like GPA and test scores because they process tens of thousands of applications. Small private colleges tend to weigh your essays, activities, and personal story more heavily.",
      },
      {
        id: "who-is-in-the-room",
        title: "Who Decides?",
        content:
          "At most colleges, a committee of admissions officers reviews applications. Each reader takes notes and may assign a rating. Then the committee discusses borderline applicants together. This is why a distinctive essay or a passionate recommendation letter can make a real difference—people remember a story, not just a transcript.",
      },
      {
        id: "the-core-elements",
        title: "The Core Elements Every College Reviews",
        content:
          "Although every college is different, nearly all evaluate these pieces of your application:\n\n• Academic record — your grades and the difficulty of the courses you took\n• Standardized tests — SAT or ACT, where required or recommended\n• Personal essay — your opportunity to show who you are beyond the transcript\n• Activities and involvement — what you do outside of class\n• Letters of recommendation — what teachers and counselors say about you\n• Demonstrated interest and fit — whether you seem like a good match for the community",
      },
      {
        id: "academic-then-personal",
        title: "Academic Fit Comes First",
        content:
          "In almost every case, colleges first ask: can this student handle the work here? Your grades and the rigor of your course load are the most important part of this question. If your academic record is strong, the rest of your application can elevate you above other similarly qualified students. If your academics are weak for that school, even a brilliant essay rarely compensates.",
      },
      {
        id: "what-fit-means",
        title: "What Colleges Mean by 'Fit'",
        content:
          "Fit is about whether you seem like someone who will thrive on campus and contribute to it. Colleges want students who will engage in class, join clubs, lead projects, and add to the community. In your essays, showing genuine interest in a school's programs, values, and culture helps convince them you are a good fit.",
      },
      {
        id: "international-applicants",
        title: "How This Applies to International Students",
        content:
          "As an international applicant, you are reviewed on the same core elements, but colleges also consider your educational system, your English proficiency, and your ability to fund your studies. Some schools review international students in a separate applicant pool. Always check whether a college is need-blind or need-aware for international students, because that directly affects how your financial aid request is treated.",
      },
    ],
    relatedGuides: [
      { slug: "how-to-build-a-college-list", title: "How to Build a College List", category: "application" },
      { slug: "reach-vs-target-vs-likely-vs-safety", title: "Reach, Target, Likely & Safety", category: "application" },
      { slug: "application-deadlines", title: "Application Deadlines", category: "application" },
    ],
    cta: {
      label: "Build Your College List",
      href: "/discover/match",
      description: "See which colleges fit your academic profile and goals.",
    },
  },
  {
    id: "g-how-to-build-college-list",
    slug: "how-to-build-a-college-list",
    title: "How to Build a College List",
    description:
      "A strategic approach to creating a balanced list of colleges that matches your goals, budget, and chances.",
    category: "application",
    readTime: 8,
    difficulty: "beginner",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-18",
    featured: true,
    takeaways: [
      "Build a balanced list with reaches, targets, and safeties.",
      "Consider academics, cost, location, and culture together.",
      "Your list should reflect your goals, not just prestige.",
    ],
    sections: [
      {
        id: "why-the-list-matters",
        title: "Why Your College List Matters",
        content:
          "Your college list is the foundation of your entire application. It determines where you apply, how you spend your time, and how you compare offers later. A well-balanced list gives you options and peace of mind. A poorly built one can leave you with rejections you did not expect or schools you cannot afford.",
      },
      {
        id: "start-with-your-priorities",
        title: "Start With Your Priorities",
        content:
          "Before looking at any college, write down what matters most to you. Consider your intended major and whether a school is strong in it, your budget and financial aid needs, preferred location and campus setting, size, and the overall culture you want. Your list will be far more useful if it reflects your real priorities rather than a generic ranking.",
      },
      {
        id: "build-a-balanced-range",
        title: "Build a Balanced Range",
        content:
          "A strong list mixes three types of schools:\n\n• Reach — schools where your profile is below the typical admitted student\n• Target — schools where you are a competitive match\n• Likely / Safety — schools where you are very likely to be admitted\n\nAim for a list that gives you realistic options at every level. Balanced lists are covered in detail in our guide to Reach vs Target vs Likely vs Safety.",
      },
      {
        id: "how-many-schools",
        title: "How Many Schools Should You Apply To?",
        content:
          "There is no magic number, but a common approach is 8 to 12 schools. Spread across your list so that you have at least two likely schools that you would genuinely be happy to attend, a good number of targets, and a few reaches. Applying to too many schools spreads your time thin and raises application costs.",
      },
      {
        id: "consider-cost-and-aid",
        title: "Factor in Cost and Financial Aid",
        content:
          "For international students, cost is often the single most important practical factor. Research the total cost of attendance for each school, and find out whether it provides aid to international students. A school that meets full demonstrated need could be far more affordable than a cheaper-looking one that gives no aid at all.",
      },
      {
        id: "use-the-tools",
        title: "Use Collegia to Shortlist",
        content:
          "Use College Match to see which colleges fit your academic profile and goals, and the college search to filter by major, cost, location, and size. Build a shortlist, then read each school's website to confirm its requirements and culture before you commit to applying.",
      },
    ],
    relatedGuides: [
      { slug: "reach-vs-target-vs-likely-vs-safety", title: "Reach, Target, Likely & Safety", category: "application" },
      { slug: "understanding-us-college-costs", title: "Understanding U.S. College Costs", category: "financial-aid" },
      { slug: "common-app-guide", title: "Common App Guide", category: "application" },
    ],
    cta: {
      label: "Get Your College Match",
      href: "/discover/match",
      description: "Find reaches, targets, and safeties based on your profile.",
    },
  },
  {
    id: "g-reach-target-likely-safety",
    slug: "reach-vs-target-vs-likely-vs-safety",
    title: "Reach vs Target vs Likely vs Safety",
    description:
      "Understand the four categories every college list should use — and why a balanced mix is essential.",
    category: "application",
    readTime: 6,
    difficulty: "beginner",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-15",
    featured: false,
    takeaways: [
      "Reaches are a stretch, targets are a competitive match, safeties are near-certain.",
      "Balance lets you aim high without risking everything.",
      "Your 'safety' should be a school you would genuinely want to attend.",
    ],
    sections: [
      {
        id: "the-four-categories",
        title: "The Four Categories",
        content:
          "Admissions counselors sort schools into four buckets based on how your academic profile compares with typical admitted students:\n\n• Reach — you fall below the typical range for accepted students, or admission is extremely competitive\n• Target — you sit within the typical range and are a competitive applicant\n• Likely — you are comfortably above the typical range for admitted students\n• Safety — you are very likely to be admitted given your profile",
      },
      {
        id: "how-to-categorize",
        title: "How to Categorize Your Options",
        content:
          "Compare your GPA and test scores against each school's admitted student range. If you are in the top part of the range, it is likely a target or safer; if you are below the range, it is a reach. Keep in mind that match is not only about numbers — fit, major availability, and demand all play a role. Use Collegia's College Match to get a data-informed view.",
      },
      {
        id: "why-balance-matters",
        title: "Why Balance Matters",
        content:
          "A list that is all reaches ends in disappointment for most students. A list that is all safeties leaves you with no growth or ambition. Balance gives you the best of both: a realistic chance at excellent schools and a solid fallback no matter what.",
      },
      {
        id: "ranges-not-certainties",
        title: "Remember: These Are Ranges, Not Guarantees",
        content:
          "Admission is never guaranteed, even at a school where you are well above the typical range. And strong applicants can be rejected from schools that seem like a match. Treat these categories as useful planning tools, not promises.",
      },
    ],
    relatedGuides: [
      { slug: "how-to-build-a-college-list", title: "How to Build a College List", category: "application" },
      { slug: "how-us-college-admissions-works", title: "How U.S. Admissions Works", category: "application" },
      { slug: "application-deadlines", title: "Application Deadlines", category: "application" },
    ],
    cta: {
      label: "See Your Reach & Target Schools",
      href: "/discover/match",
      description: "Get a match that sorts colleges by likelihood and fit.",
    },
  },
  {
    id: "g-application-deadlines",
    slug: "application-deadlines",
    title: "Application Deadlines",
    description:
      "Every U.S. application has a deadline. Learn the difference between early and regular decision — and how to stay on schedule.",
    category: "application",
    readTime: 7,
    difficulty: "beginner",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-12",
    featured: false,
    takeaways: [
      "Early decision is binding; early action is not.",
      "Most regular decision deadlines fall between November and February.",
      "Deadlines vary by school — always confirm on the school's site.",
    ],
    sections: [
      {
        id: "common-deadlines",
        title: "Common Deadline Types",
        content:
          "U.S. colleges use several application rounds:\n\n• Early Decision (ED) — binding; if admitted, you must attend\n• Early Action (EA) — non-binding; you hear back early but are not committed\n• Regular Decision (RD) — the standard round with a deadline usually in winter\n• Rolling Admission — schools review applications as they arrive until seats fill",
      },
      {
        id: "ed-vs-ea",
        title: "Early Decision vs Early Action",
        content:
          "Early Decision sends a strong signal of commitment because it is binding, and many colleges admit a larger share of ED applicants. But you can apply ED to only one school and you are locked in if accepted. Early Action has no such commitment, so it is a lower-risk way to apply early to multiple schools.",
      },
      {
        id: "typical-timeline",
        title: "A Typical Timeline",
        content:
          "Most applications open on August 1. Early deadlines commonly fall around November 1 or November 15. Regular decision deadlines usually fall between November 30 and February 1, though some are later. Because exact dates vary by school and change, always check the official college website and plan to submit a few days early.",
      },
      {
        id: "why-deadlines-matter",
        title: "Why Deadlines Matter for International Students",
        content:
          "International students often need extra time for transcripts, English proficiency tests, and visa documents. If you are applying for aid, note that some aid deadlines are earlier than the general application deadline. Missing a deadline can mean losing a scholarship opportunity entirely, so keep a calendar of every date.",
      },
    ],
    relatedGuides: [
      { slug: "common-app-guide", title: "Common App Guide", category: "application" },
      { slug: "how-to-build-a-college-list", title: "How to Build a College List", category: "application" },
      { slug: "applying-as-an-international-student", title: "Applying as an International Student", category: "international" },
    ],
  },
  {
    id: "g-common-app-guide",
    slug: "common-app-guide",
    title: "Common App Guide",
    description:
      "The Common App lets you apply to hundreds of colleges with one application. Here's how to complete it correctly.",
    category: "application",
    readTime: 10,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-10",
    featured: true,
    takeaways: [
      "One Common App submission is sent to every college on your list.",
      "Some colleges require their own supplemental questions.",
      "Preview your full application and proofread before you hit submit.",
    ],
    sections: [
      {
        id: "what-is-the-common-app",
        title: "What Is the Common App?",
        content:
          "The Common Application is an online platform used by more than a thousand colleges to accept applications. You fill out one central application, then submit it to each college on your list. It includes your personal information, academic history, activities, essays, and a place for recommendation requests.",
      },
      {
        id: "how-to-get-started",
        title: "How to Get Started",
        content:
          "Create an account and add colleges to your dashboard. Gather the information you will need: your transcript details, standardized test scores, activities and honors, and contact information for recommenders. The application opens each year on August 1, so you can start early and save your work as you go.",
      },
      {
        id: "sections-of-the-app",
        title: "Key Sections of the Application",
        content:
          "The Common App includes your Profile, Family, Education, Testing, Activities, and Writing sections. The Activities section lets you list up to ten activities with short descriptions — choose the ones that matter most and describe them specifically. The Writing section contains the main personal essay.",
      },
      {
        id: "college-specific-questions",
        title: "College-Specific Questions",
        content:
          "Many Common App schools add their own questions, including supplemental essays and 'Why This College?' prompts. These are required and submitted along with your main application. Treat supplements as an important part of your application, not an afterthought.",
      },
      {
        id: "supporting-documents",
        title: "Requesting Recommendations and Transcripts",
        content:
          "The Common App sends electronic requests to your teachers, counselors, and schools. Give recommenders plenty of advance notice and follow up politely as deadlines approach. Transcript requirements vary by country, so ask each college how international records should be submitted.",
      },
      {
        id: "before-you-submit",
        title: "Before You Submit",
        content:
          "Preview your application for each college, because some sections display differently. Proofread the essays, double-check dates and addresses, and confirm you have attached all required documents for each school. Submit well before the deadline, since the platform can slow down in the final hours.",
      },
    ],
    relatedGuides: [
      { slug: "how-to-build-a-college-list", title: "How to Build a College List", category: "application" },
      { slug: "letters-of-recommendation", title: "Letters of Recommendation", category: "application" },
      { slug: "application-deadlines", title: "Application Deadlines", category: "application" },
    ],
  },
  {
    id: "g-letters-of-recommendation",
    slug: "letters-of-recommendation",
    title: "Letters of Recommendation",
    description:
      "Strong recommendation letters add a human voice to your application. Learn how to choose recommenders and prepare them.",
    category: "application",
    readTime: 7,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-08",
    featured: false,
    takeaways: [
      "Choose teachers who know you well, not just who gave you the best grade.",
      "Give recommenders plenty of time and useful context.",
      "Follow up politely and say thank you.",
    ],
    sections: [
      {
        id: "why-recommendations-matter",
        title: "Why Recommendations Matter",
        content:
          "Recommendation letters let admissions officers hear from the people who know you best. A specific, personal letter can humanize your application and confirm the strengths described in your essays. A generic letter adds little, which is why choosing the right recommenders matters.",
      },
      {
        id: "who-to-ask",
        title: "Who to Ask",
        content:
          "Most colleges want one counselor recommendation and one or two teacher recommendations. Choose teachers from subjects relevant to your intended major if possible — for example, a math or science teacher if you plan to study engineering. More importantly, choose teachers who know you personally and can speak to your growth, curiosity, and character.",
      },
      {
        id: "how-to-ask",
        title: "How to Ask",
        content:
          "Ask in person when you can, then follow up in writing. Ask early — at least a month before the deadline, and ideally more. Explain which colleges you are applying to, when letters are due, and which qualities you hope they can speak to. Give them a list of your activities and memorable moments from their class.",
      },
      {
        id: "waive-your-right",
        title: "Should You Waive the Right to View the Letter?",
        content:
          "Most guidance is simple: waive your right to see the recommendation. Admissions officers trust letters written in confidence, and recommenders feel freer to be candid. Waiving signals that you trust the process and is the standard choice.",
      },
      {
        id: "thank-your-recommenders",
        title: "Follow Up and Say Thank You",
        content:
          "A thoughtful thank-you note after your applications are submitted is both kind and professional. Teachers write many letters each year; a warm message of appreciation stands out and keeps the relationship positive.",
      },
    ],
    relatedGuides: [
      { slug: "common-app-guide", title: "Common App Guide", category: "application" },
      { slug: "how-us-college-admissions-works", title: "How U.S. Admissions Works", category: "application" },
      { slug: "personal-statement", title: "Personal Statement", category: "essays" },
    ],
  },
  {
    id: "g-standardized-testing",
    slug: "standardized-testing",
    title: "Standardized Testing",
    description:
      "SAT and ACT basics for international applicants — which test to take, whether to submit scores, and how they fit into your application.",
    category: "application",
    readTime: 8,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-06",
    featured: false,
    takeaways: [
      "Policies vary — some colleges are test-optional, others still require scores.",
      "Choose the SAT or ACT based on which plays to your strengths.",
      "A strong score can help, but grades and essays still matter most.",
    ],
    sections: [
      {
        id: "sat-vs-act",
        title: "SAT vs ACT",
        content:
          "Most U.S. colleges accept either the SAT or the ACT. The SAT emphasizes reading, writing, and math. The ACT also includes a science section and is sometimes seen as more content-driven. Neither is 'better' — try practice tests and choose the one where you score more strongly.",
      },
      {
        id: "test-optional-and-required",
        title: "Test-Optional, Test-Required, and Test-Blind",
        content:
          "College testing policies fall into a few groups:\n\n• Test-optional — you can choose whether to submit scores\n• Test-required — you must submit them\n• Test-blind — scores are not considered even if submitted\n\nPolicies change frequently and vary for international students, so confirm each school's current policy on its website.",
      },
      {
        id: "should-you-submit",
        title: "Should You Submit Scores If Optional?",
        content:
          "If a school is test-optional, submit your score when it strengthens your application — generally when it is at or above the school's typical admitted range. If your score is below the typical range, you may be better off not submitting and letting the rest of your application speak.",
      },
      {
        id: "preparing-and-registering",
        title: "Preparing and Registering",
        content:
          "International students may take the SAT or ACT in many countries. Check available test centers and registration deadlines early, and leave time for multiple attempts if needed. Plan your testing schedule so scores arrive before your application deadlines, since score reporting can take weeks.",
      },
      {
        id: "english-proficiency",
        title: "English Proficiency",
        content:
          "Separate from the SAT or ACT, many colleges require an English proficiency test such as TOEFL, IELTS, or the Duolingo English Test. Each school sets its own minimums, so confirm them in advance. See our English Proficiency Tests guide for details.",
      },
    ],
    relatedGuides: [
      { slug: "english-proficiency-tests", title: "English Proficiency Tests", category: "international" },
      { slug: "how-us-college-admissions-works", title: "How U.S. Admissions Works", category: "application" },
      { slug: "application-deadlines", title: "Application Deadlines", category: "application" },
    ],
  },
  {
    id: "g-transcripts-academic-records",
    slug: "transcripts-academic-records",
    title: "Transcripts & Academic Records",
    description:
      "Your academic transcript is the centerpiece of your application. Learn how to prepare and submit international academic records.",
    category: "application",
    readTime: 7,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-04",
    featured: false,
    takeaways: [
      "Colleges need official academic records in your own language, plus a certified translation if needed.",
      "Course rigor matters as much as your grades.",
      "Some schools require foreign credential evaluation.",
    ],
    sections: [
      {
        id: "what-is-a-transcript",
        title: "What Is a Transcript?",
        content:
          "A transcript is the official record of the courses you took and the grades you earned in secondary school. U.S. colleges see it as the single most important indicator of your academic readiness. Your transcript tells them both how well you did and how challenging your courses were.",
      },
      {
        id: "international-transcripts",
        title: "International Transcripts",
        content:
          "International applicants usually submit academic records in their original language, along with an official translation into English when required. Each college has its own rules about translations, grading scales, and whether documents must be mailed or sent electronically by your school.",
      },
      {
        id: "credential-evaluation",
        title: "Foreign Credential Evaluation",
        content:
          "Some colleges request an evaluation of your foreign credentials by a recognized agency that converts grades and course levels into a U.S. equivalent. This is not universal, so check each school's requirements. Budget extra time, because evaluations can take several weeks.",
      },
      {
        id: "course-rigor",
        title: "Course Rigor Matters",
        content:
          "Admissions officers look not only at your grades but at the difficulty of the courses you took. Challenging yourself in subjects related to your intended major, when available in your school, signals readiness for college-level work.",
      },
      {
        id: "what-to-prepare",
        title: "What to Prepare",
        content:
          "Well before deadlines, ask your school for official copies of your records, confirm whether translations are needed, and learn how each college wants them submitted. Build a checklist per college, because requirements differ.",
      },
    ],
    relatedGuides: [
      { slug: "international-transcripts", title: "International Transcripts", category: "international" },
      { slug: "how-us-college-admissions-works", title: "How U.S. Admissions Works", category: "application" },
      { slug: "common-app-guide", title: "Common App Guide", category: "application" },
    ],
  },
];
