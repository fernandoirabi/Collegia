import type { Guide } from "@/types/guides";

export const financialAidGuides: Guide[] = [
  {
    id: "g-understanding-us-college-costs",
    slug: "understanding-us-college-costs",
    title: "Understanding U.S. College Costs",
    description:
      "U.S. colleges use a cost of attendance that includes more than tuition. Learn what the sticker price really covers.",
    category: "financial-aid",
    readTime: 8,
    difficulty: "beginner",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-20",
    featured: true,
    takeaways: [
      "The sticker price includes tuition, room and board, books, and personal expenses.",
      "The sticker price is not what most students actually pay.",
      "Costs and financial aid policies differ a lot between colleges.",
    ],
    sections: [
      {
        id: "the-sticker-price",
        title: "What Is the Sticker Price?",
        content:
          "The sticker price is the official cost a college lists before any aid. For international students, it usually includes the higher international tuition rate. It is a starting point, not the final cost, but it is essential for understanding the total financial commitment.",
      },
      {
        id: "components-of-cost",
        title: "The Cost of Attendance",
        content:
          "Colleges break costs into several parts that together make up the cost of attendance (COA):\n\n• Tuition and fees — the academic charges\n• Room — on-campus housing\n• Board — meals and dining plans\n• Books and supplies — required course materials\n• Personal expenses — transportation, health costs, and everyday items\n• Health insurance — many colleges require international students to have coverage",
      },
      {
        id: "sticker-vs-net",
        title: "Sticker Price vs Net Cost",
        content:
          "The net cost is what you will actually pay after scholarships and grants are deducted. The difference between sticker and net price can be large. This is why two colleges with very different sticker prices may end up costing you similar amounts.",
      },
      {
        id: "public-vs-private",
        title: "Public vs Private Costs",
        content:
          "Public universities charge in-state students less, but international students usually pay out-of-state or international rates, which are much higher. Private colleges charge one tuition rate for everyone but often have larger aid budgets. Compare the net cost, not just the sticker price.",
      },
      {
        id: "how-aid-fits-in",
        title: "How Financial Aid Fits In",
        content:
          "Financial aid reduces your cost in two main ways: scholarships and grants (which you do not repay) and loans or work opportunities (which add obligations). For international students, grants and scholarships matter most, because U.S. federal student aid is generally not available to international students.",
      },
    ],
    relatedGuides: [
      { slug: "financial-aid-explained", title: "Financial Aid Explained", category: "financial-aid" },
      { slug: "merit-scholarships", title: "Merit Scholarships", category: "financial-aid" },
      { slug: "international-financial-aid", title: "International Financial Aid", category: "international" },
    ],
    cta: {
      label: "Compare College Costs",
      href: "/discover/search",
      description: "Search colleges and compare tuition, total cost, and aid availability.",
    },
  },
  {
    id: "g-financial-aid-explained",
    slug: "financial-aid-explained",
    title: "Financial Aid Explained",
    description:
      "The big picture: how merit aid, need-based aid, grants, and loans combine to change what you actually pay.",
    category: "financial-aid",
    readTime: 9,
    difficulty: "beginner",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-18",
    featured: true,
    takeaways: [
      "Aid comes from many sources: colleges, the government, and private organizations.",
      "Merit aid rewards achievement; need-based aid depends on your finances.",
      "Grants and scholarships do not have to be repaid — loans do.",
    ],
    sections: [
      {
        id: "types-of-aid",
        title: "The Main Types of Aid",
        content:
          "Financial aid generally falls into two groups:\n\n• Merit-based — awarded for academic, athletic, or artistic achievement, regardless of financial need\n• Need-based — awarded because your family cannot afford the full cost\n\nWithin each, aid can be a grant or scholarship (no repayment), a loan (repaid later), or work-study (a part-time job).",
      },
      {
        id: "institutional-aid",
        title: "Institutional Aid",
        content:
          "Colleges themselves are a major source of aid through their own scholarships and grant programs. Institutional merit scholarships are common and often aimed at international students. Need-based institutional aid is given only by schools with generous budgets and policies.",
      },
      {
        id: "federal-and-government-aid",
        title: "Federal and Government Aid",
        content:
          "In the U.S., the federal government provides aid through programs funded by the FAFSA. International students are generally not eligible for federal student aid. Check each college's policy, but do not assume you qualify for U.S. federal aid as an international applicant.",
      },
      {
        id: "loans-vs-grants",
        title: "Grants vs Loans",
        content:
          "A grant or scholarship is money you never repay — it directly lowers your cost. A loan must be repaid with interest, adding to your long-term cost. When comparing aid offers, weigh how much of each package is free money versus borrowing, because loans affect your future finances.",
      },
      {
        id: "how-aid-changes-net-price",
        title: "How Aid Changes the Net Price",
        content:
          "Start with the sticker price, subtract the grants and scholarships you receive, and the result is your net cost. Understanding this calculation helps you compare schools fairly. Our Financial Aid hub walks through this process with examples.",
      },
    ],
    relatedGuides: [
      { slug: "understanding-us-college-costs", title: "Understanding U.S. College Costs", category: "financial-aid" },
      { slug: "merit-scholarships", title: "Merit Scholarships", category: "financial-aid" },
      { slug: "need-based-aid", title: "Need-Based Financial Aid", category: "financial-aid" },
    ],
  },
  {
    id: "g-merit-scholarships",
    slug: "merit-scholarships",
    title: "Merit Scholarships",
    description:
      "Merit scholarships reward your achievements. Learn where they come from, who gets them, and how to find them.",
    category: "financial-aid",
    readTime: 7,
    difficulty: "beginner",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-15",
    featured: false,
    takeaways: [
      "Merit aid is based on achievement, not financial need.",
      "Colleges, governments, and private organizations all offer merit scholarships.",
      "International students are often eligible for institutional merit awards.",
    ],
    sections: [
      {
        id: "what-is-merit-aid",
        title: "What Is Merit Aid?",
        content:
          "Merit scholarships are awarded for your accomplishments — strong grades, high test scores, leadership, talent, or special skills. Unlike need-based aid, they do not depend on your family's finances. Any strong student can qualify, which makes them an important option for international applicants who may not qualify for need-based federal aid.",
      },
      {
        id: "where-merit-aid-comes-from",
        title: "Where It Comes From",
        content:
          "Merit aid comes from several places:\n\n• Colleges — many offer automatic scholarships based on GPA and test scores\n• Government programs — some countries fund students studying abroad\n• Private foundations and organizations — searchable online\n\nFor international students, institutional scholarships are often the most reliable source.",
      },
      {
        id: "automatic-vs-competitive",
        title: "Automatic vs Competitive Scholarships",
        content:
          "Some institutional scholarships are automatic — if you meet certain criteria, you receive a set amount. Others are competitive, requiring a separate application, essay, or interview. Read each scholarship's criteria carefully, because some are granted at admission and others expect an additional process.",
      },
      {
        id: "how-to-find-them",
        title: "How to Find Merit Scholarships",
        content:
          "Start with each college's financial aid and international admissions pages, because eligibility varies. Look for automatic scholarships tied to your grades and scores, and note any deadlines that differ from the application deadline. Then explore reputable external scholarship databases for additional opportunities.",
      },
      {
        id: "renewal-conditions",
        title: "Check the Renewal Conditions",
        content:
          "Merit scholarships are often renewable for subsequent years, but usually on conditions such as maintaining a minimum GPA. Before you accept a scholarship, understand what it takes to keep it every year, because losing it later changes your total cost.",
      },
    ],
    relatedGuides: [
      { slug: "financial-aid-explained", title: "Financial Aid Explained", category: "financial-aid" },
      { slug: "comparing-financial-aid-offers", title: "Comparing Financial Aid Offers", category: "financial-aid" },
      { slug: "international-financial-aid", title: "International Financial Aid", category: "international" },
    ],
  },
  {
    id: "g-need-based-aid",
    slug: "need-based-aid",
    title: "Need-Based Financial Aid",
    description:
      "Need-based aid depends on your family's financial situation. Understand how it works — and how it differs for international students.",
    category: "financial-aid",
    readTime: 8,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-12",
    featured: false,
    takeaways: [
      "Need-based aid is awarded after reviewing your family's financial need.",
      "Aid policies vary tremendously between colleges.",
      "International access to need-based aid is limited and often need-aware.",
    ],
    sections: [
      {
        id: "what-is-need-based-aid",
        title: "What Is Need-Based Aid?",
        content:
          "Need-based aid is awarded based on your family's demonstrated financial need — the gap between what your family can contribute and the cost of attendance. Colleges determine this using financial documents and forms like the CSS Profile or their own application forms.",
      },
      {
        id: "meets-full-need",
        title: "What 'Meets Full Need' Means",
        content:
          "A school that meets full need promises to provide enough aid to cover the gap between what your family can pay and the full cost of attendance. Fewer schools do this for international students. If a school meets full need, its aid package likely includes grants that cover most of your remaining cost.",
      },
      {
        id: "intl-eligibility",
        title: "Need-Based Aid for International Students",
        content:
          "The most important thing to know: need-based federal aid in the U.S. is generally not available to international students. Only some private colleges offer institutional need-based aid to international applicants, and many of those are need-aware — meaning your aid request can affect your admission decision. Research each school's policy carefully.",
      },
      {
        id: "documenting-need",
        title: "Documenting Your Need",
        content:
          "Schools that consider international need ask for financial documents such as bank statements, family income records, and sometimes the CSS Profile. Prepare these early, because schools need them to build an aid package before or alongside your admission decision.",
      },
      {
        id: "need-blind-vs-need-aware",
        title: "Need-Blind vs Need-Aware",
        content:
          "A need-blind college does not consider your ability to pay when deciding admission. A need-aware college may consider financial need for international applicants, which can work against you if you request large amounts of aid. See our Need-Blind vs Need-Aware guide for a fuller explanation.",
      },
    ],
    relatedGuides: [
      { slug: "css-profile", title: "CSS Profile", category: "financial-aid" },
      { slug: "need-blind-vs-need-aware", title: "Need-Blind vs Need-Aware", category: "international" },
      { slug: "international-financial-aid", title: "International Financial Aid", category: "international" },
    ],
  },
  {
    id: "g-css-profile",
    slug: "css-profile",
    title: "CSS Profile",
    description:
      "The CSS Profile helps colleges assess your family's finances for institutional aid. Here's what international applicants need to know.",
    category: "financial-aid",
    readTime: 7,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-10",
    featured: false,
    takeaways: [
      "The CSS Profile is a detailed financial form used by many private colleges.",
      "International students can often file it, but policies and fees vary.",
      "Gather family income and asset documents before you start.",
    ],
    sections: [
      {
        id: "what-is-the-css-profile",
        title: "What Is the CSS Profile?",
        content:
          "The CSS Profile is an online financial aid form administered by the College Board. Many private colleges use it to gather detailed information about your family's finances to determine institutional aid. It asks more specific questions than the FAFSA and is available to international families in many countries.",
      },
      {
        id: "who-needs-to-file",
        title: "Who Needs to File It",
        content:
          "Only file the CSS Profile if the colleges you are applying to require or recommend it. Each college decides whether to use it, and many have their own deadlines. Check each school's international financial aid page for its exact requirements and deadline.",
      },
      {
        id: "documents-youll-need",
        title: "Documents You'll Need",
        content:
          "Be ready to report income, savings, investments, property, and family expenses. Gather up-to-date bank statements, tax records, and proof of income from your parents. Because the form asks for current finances, having documents organized in advance saves time and reduces errors.",
      },
      {
        id: "international-considerations",
        title: "International Considerations",
        content:
          "The CSS Profile is available worldwide, and you can file it even if you are not applying for U.S. federal aid. Some colleges require it specifically to consider you for institutional grants. There is a filing fee, though fee waivers may be available based on circumstances.",
      },
      {
        id: "accuracy-matters",
        title: "Accuracy Matters",
        content:
          "The information you provide directly affects your aid award. Report honestly and completely, and double-check numbers before you submit. If your financial situation changes, contact the financial aid office, because aid offers are typically recalibrated each year.",
      },
    ],
    relatedGuides: [
      { slug: "need-based-aid", title: "Need-Based Financial Aid", category: "financial-aid" },
      { slug: "financial-aid-explained", title: "Financial Aid Explained", category: "financial-aid" },
      { slug: "comparing-financial-aid-offers", title: "Comparing Financial Aid Offers", category: "financial-aid" },
    ],
  },
  {
    id: "g-comparing-financial-aid-offers",
    slug: "comparing-financial-aid-offers",
    title: "Comparing Financial Aid Offers",
    description:
      "Not all aid packages are equal. Learn how to compare offers side by side and calculate the real net cost of each school.",
    category: "financial-aid",
    readTime: 8,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-08",
    featured: false,
    takeaways: [
      "STICKER PRICE – GRANTS = your true net cost.",
      "Compare grants and scholarships, not just the total aid amount.",
      "Loans and work-study are obligations, not free money.",
    ],
    sections: [
      {
        id: "read-the-package",
        title: "Read the Whole Package",
        content:
          "A financial aid offer usually lists several components: grants or scholarships, loans, and work-study opportunities. To compare fairly, separate the free money (grants and scholarships) from the rest. The free money is what actually reduces your cost of attendance.",
      },
      {
        id: "calculate-net-cost",
        title: "Calculate the Real Net Cost",
        content:
          "For each school, take the cost of attendance and subtract only the grants and scholarships you were awarded. The result is the net cost you would pay from savings, family contributions, or loans. Compare these net costs directly — the school with the higher sticker price may actually be the better value.",
      },
      {
        id: "account-for-loans",
        title: "Account for Loans and Work-Study",
        content:
          "Loans must be repaid with interest, adding to your total cost over time. Work-study requires you to work and may not be guaranteed. When the task says compare offers, the key metric is net cost after free aid — not the gross amount of the package.",
      },
      {
        id: "renewability",
        title: "Check Renewability",
        content:
          "Ask whether each award is renewable across all four years and under what conditions. A generous first-year scholarship that requires a very high GPA each year could shrink in later years, changing your total cost.",
      },
      {
        id: "negotiate-politely",
        title: "Can You Ask for More?",
        content:
          "If one school offers significantly more aid, you can sometimes politely ask another school to reconsider, especially if circumstances changed or a competitor offer is substantially better. Financial aid offers are determined by policy, so expectations should stay realistic, but it never hurts to ask respectfully.",
      },
    ],
    relatedGuides: [
      { slug: "financial-aid-explained", title: "Financial Aid Explained", category: "financial-aid" },
      { slug: "merit-scholarships", title: "Merit Scholarships", category: "financial-aid" },
      { slug: "international-financial-aid", title: "International Financial Aid", category: "international" },
    ],
    cta: {
      label: "Compare College Costs",
      href: "/discover/search",
      description: "Search colleges and compare cost and aid at a glance.",
    },
  },
];
