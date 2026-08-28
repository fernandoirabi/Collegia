import type { Guide } from "@/types/guides";

export const essayGuides: Guide[] = [
  {
    id: "g-personal-statement",
    slug: "personal-statement",
    title: "The Personal Statement",
    description:
      "Your personal statement is the heart of your application. Learn what it is, what it does, and how to write yours.",
    category: "essays",
    readTime: 9,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-20",
    featured: true,
    takeaways: [
      "The personal statement shows who you are beyond grades and scores.",
      "Admissions officers want to hear your authentic voice, not a perfect resume.",
      "Focus on a specific story or theme and let it carry your message.",
    ],
    sections: [
      {
        id: "what-it-is",
        title: "What the Personal Statement Is",
        content:
          "The personal statement is the main essay in your application, usually around 650 words on the Common App. Its job is not to summarize your achievements — that is what your resume and activities list do. It is your chance to let admissions officers hear your voice and understand what kind of person you are.",
      },
      {
        id: "what-officers-look-for",
        title: "What Admissions Officers Look For",
        content:
          "Officers look for authenticity, self-awareness, and the ability to write clearly. They want to understand your values, what drives you, and how you think. A strong essay reveals something real about you and shows that you reflected on it — not a list of accomplishments.",
      },
      {
        id: "voice-and-authenticity",
        title: "Voice and Authenticity",
        content:
          "Write the way you think and speak, within reason. Avoid pretending to be someone you are not or writing what you think they want to hear. The most memorable essays are the ones that feel genuine and specific. Your experience as an international student, your community, and your goals are legitimate, valuable material.",
      },
      {
        id: "show-dont-tell",
        title: "Show, Don't Tell",
        content:
          "Instead of saying 'I am resilient,' show a moment where you faced a challenge and how you responded. Specific, vivid details demonstrate qualities far more powerfully than adjectives. Let your story prove the point rather than stating it.",
      },
      {
        id: "the-writing-process",
        title: "The Writing Process",
        content:
          "Do not expect a finished essay in one sitting. Brainstorm, choose one idea, outline, write a rough draft, then revise repeatedly. Set it aside, get feedback from someone you trust, and return with fresh eyes. Editing is where good essays become great ones.",
      },
    ],
    relatedGuides: [
      { slug: "choosing-an-essay-topic", title: "Choosing an Essay Topic", category: "essays" },
      { slug: "essay-structure", title: "Essay Structure", category: "essays" },
      { slug: "common-essay-mistakes", title: "Common Essay Mistakes", category: "essays" },
    ],
  },
  {
    id: "g-choosing-essay-topic",
    slug: "choosing-an-essay-topic",
    title: "Choosing an Essay Topic",
    description:
      "The topic you choose sets the direction for your entire essay. Learn how to pick one that is both meaningful and effective.",
    category: "essays",
    readTime: 8,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-18",
    featured: false,
    takeaways: [
      "The best topics are personal, specific, and meaningful to you.",
      "Avoid overly common topics unless you add a fresh angle.",
      "A small, well-told moment often beats a big but vague story.",
    ],
    sections: [
      {
        id: "what-makes-a-good-topic",
        title: "What Makes a Good Topic",
        content:
          "A strong topic is one that matters to you and that you can tell specifically. It does not need to be dramatic or unusual. Admissions officers care more about how you tell the story and what it reveals about you than about the topic itself.",
      },
      {
        id: "personal-and-specific",
        title: "Make It Personal and Specific",
        content:
          "Choose something only you could write. A specific moment, relationship, or idea gives you concrete material to work with. Generic topics like 'winning taught me hard work' are weak because they could be written by anyone.",
      },
      {
        id: "common-topics",
        title: "Common Topics and How to Make Them Fresh",
        content:
          "Topics like sports, travel, music, or family can work — but only if you add an angle that is distinctly yours. Instead of recounting the win, explore what the sport taught you in an unexpected way. The freshness comes from your reflection, not the event itself.",
      },
      {
        id: "what-to-avoid",
        title: "What to Avoid",
        content:
          "Avoid topics you cannot write authentically about, controversial topics with no real reflection, and clichés like living through a tragedy for its own sake. If a topic feels forced or like it is fishing for pity, reconsider. Your essay should highlight your strengths and growth.",
      },
      {
        id: "how-to-choose",
        title: "How to Choose",
        content:
          "Brainstorm several possibilities, then ask: Which one lets me show my best qualities? Which one can I write specifically and vividly? Which one reflects who I really am? Pick the idea that excites you most, because genuine interest makes for better writing.",
      },
    ],
    relatedGuides: [
      { slug: "essay-brainstorming", title: "Essay Brainstorming", category: "essays" },
      { slug: "personal-statement", title: "Personal Statement", category: "essays" },
      { slug: "why-this-college", title: "Why This College?", category: "essays" },
    ],
  },
  {
    id: "g-essay-brainstorming",
    slug: "essay-brainstorming",
    title: "Essay Brainstorming",
    description:
      "Before you write a word, you need ideas. Use these techniques to uncover the strongest material for your essay.",
    category: "essays",
    readTime: 7,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-15",
    featured: false,
    takeaways: [
      "Brainstorm freely first; judge ideas later.",
      "Mine your life for specific moments, people, and turning points.",
      "Connect your raw ideas to the qualities you want to show.",
    ],
    sections: [
      {
        id: "start-broad",
        title: "Start Broad, Narrow Later",
        content:
          "In brainstorming, generate as many ideas as possible without judging them. Even ideas that seem silly can lead to something real. Write down moments, people, places, successes, failures, and interests. You can filter and combine them later.",
      },
      {
        id: "prompts-to-try",
        title: "Prompts to Get Started",
        content:
          "Try questions like: What moment changed how I see myself? What am I proud of that is not on a resume? What did I learn the hard way? What do I want admissions to remember about me? Answer honestly and in detail.",
      },
      {
        id: "mine-your-experiences",
        title: "Mine Your Own Experiences",
        content:
          "Your background as an international student, a move, a new language, a family tradition, or a curiosity you pursue — all of these are rich material. The most personal experiences often make the most compelling essays because they are uniquely yours.",
      },
      {
        id: "connect-to-qualities",
        title: "Connect Ideas to Qualities",
        content:
          "For each idea, ask what it reveals about you. Does it show curiosity, resilience, leadership, empathy, or creativity? An idea that can support several genuine qualities is usually worth developing.",
      },
      {
        id: "pick-the-strongest",
        title: "Pick the Strongest Idea",
        content:
          "After generating ideas, choose the one that is both personal and expressive of your best qualities, and that you can write specifically. If you are torn, write a paragraph on your top two and see which flows more naturally.",
      },
    ],
    relatedGuides: [
      { slug: "choosing-an-essay-topic", title: "Choosing an Essay Topic", category: "essays" },
      { slug: "essay-structure", title: "Essay Structure", category: "essays" },
      { slug: "personal-statement", title: "Personal Statement", category: "essays" },
    ],
  },
  {
    id: "g-essay-structure",
    slug: "essay-structure",
    title: "Essay Structure",
    description:
      "A clear structure keeps your essay focused and easy to read. Learn a framework that works for most personal essays.",
    category: "essays",
    readTime: 7,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-12",
    featured: false,
    takeaways: [
      "A strong opening hook pulls the reader in immediately.",
      "Build to a meaningful insight instead of just retelling events.",
      "End with a takeaway that ties back to who you are.",
    ],
    sections: [
      {
        id: "why-structure-matters",
        title: "Why Structure Matters",
        content:
          "Admissions officers read thousands of essays. A clear structure makes yours enjoyable to read and ensures your message lands. Structure is not about a rigid formula; it is about guiding the reader from a strong beginning to a meaningful end.",
      },
      {
        id: "the-opening",
        title: "The Opening Hook",
        content:
          "Start in the middle of a moment or with a striking detail, not with a general statement like 'I have always been interested in science.' Your first sentence should make the reader want to continue. Specificity is your friend here.",
      },
      {
        id: "the-body",
        title: "The Body: Show, Then Reflect",
        content:
          "The body unfolds your story with concrete details, then reflects on what it means. Alternate between showing what happened and exploring how it affected you. This rhythm — action plus reflection — is what turns a story into an essay.",
      },
      {
        id: "the-conclusion",
        title: "The Conclusion",
        content:
          "End with a takeaway that ties your story to who you are now or what you hope to do. Avoid tacking on a list of accomplishments or a generic 'this is why I will succeed.' A quiet, confident closing that echoes your opening can be very powerful.",
      },
      {
        id: "flow-and-transitions",
        title: "Flow and Transitions",
        content:
          "Move smoothly between ideas so the reader is never lost. Each paragraph should connect to the next. Read your draft aloud to find awkward jumps, and cut anything that does not serve your main point.",
      },
    ],
    relatedGuides: [
      { slug: "personal-statement", title: "Personal Statement", category: "essays" },
      { slug: "essay-brainstorming", title: "Essay Brainstorming", category: "essays" },
      { slug: "final-essay-checklist", title: "Final Essay Checklist", category: "essays" },
    ],
  },
  {
    id: "g-supplemental-essays",
    slug: "supplemental-essays",
    title: "Supplemental Essays",
    description:
      "Many colleges add their own short essays to the Common App. Learn how to answer them effectively without repeating yourself.",
    category: "essays",
    readTime: 8,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-10",
    featured: false,
    takeaways: [
      "Supplements show how well you researched and fit each college.",
      "Answer the question asked — do not copy a generic response everywhere.",
      "Each supplement should be genuinely tailored to that school.",
    ],
    sections: [
      {
        id: "what-are-supplements",
        title: "What Are Supplemental Essays?",
        content:
          "Supplemental essays are additional short responses that colleges request on top of the main personal statement. They might ask why you want to attend, how you would contribute, or what you would bring to a program. Their length ranges from a sentence to several paragraphs.",
      },
      {
        id: "why-they-matter",
        title: "Why They Matter",
        content:
          "Supplements let each college learn how you fit its specific community and programs. Strong supplements show genuine interest and research. Weak ones — especially generic answers recycled across schools — signal a lack of real interest, which colleges notice.",
      },
      {
        id: "answer-the-question",
        title: "Answer the Exact Question",
        content:
          "Read each prompt carefully and answer exactly what it asks. If a college wants to know why you chose your major, focus on that rather than restating your personal statement. Straying from the question is one of the most common and damaging mistakes.",
      },
      {
        id: "tailor-each-response",
        title: "Tailor Each Response",
        content:
          "Refer to specific programs, courses, professors, or resources that genuinely appeal to you at that school. Do your research and be sincere. Generic language like 'your prestigious university' convinces no one.",
      },
      {
        id: "find-the-forgotten-gems",
        title: "Use Your International Perspective",
        content:
          "Your global background is a genuine asset for supplements. Colleges often value the perspective international students bring. If a question asks how you would contribute, your experiences across cultures can be a compelling, specific answer — as long as it is sincere.",
      },
    ],
    relatedGuides: [
      { slug: "why-this-college", title: "Why This College?", category: "essays" },
      { slug: "why-this-major", title: "Why This Major?", category: "essays" },
      { slug: "common-essay-mistakes", title: "Common Essay Mistakes", category: "essays" },
    ],
  },
  {
    id: "g-why-this-college",
    slug: "why-this-college",
    title: "Why This College?",
    description:
      "The most common supplemental prompt asks why you want to attend. Here's how to answer it with genuine, specific reasons.",
    category: "essays",
    readTime: 7,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-08",
    featured: false,
    takeaways: [
      "Show you did real research into that specific school.",
      "Connect the school's strengths to your goals and values.",
      "Avoid generic praise — be specific and sincere.",
    ],
    sections: [
      {
        id: "what-they-are-asking",
        title: "What the Prompt Is Really Asking",
        content:
          "When a college asks why you want to attend, it wants evidence that you understand its identity and that you would fit and contribute. It is a test of fit and demonstrated interest as much as a writing exercise.",
      },
      {
        id: "do-your-research",
        title: "Do Real Research",
        content:
          "Spend time on the college's website and academic programs. Note specific courses, majors, research opportunities, study-abroad options, campus traditions, or communities that genuinely interest you. Specific, accurate references signal sincerity.",
      },
      {
        id: "connect-them-to-you",
        title: "Connect Their Strengths to Your Goals",
        content:
          "The strongest answers link what the college offers to who you are. For example, if you want to study engineering, mention a specific lab, professor, or program that matches your interests, and say why. Make it a two-way fit — what you would gain and what you would contribute.",
      },
      {
        id: "avoid-generic-phrases",
        title: "Avoid Generic Language",
        content:
          "Phrases like 'your distinguished university' or 'a top-notch education' could apply to any school and add nothing. Replace them with details that are true only of this college. If you could swap in another name and the essay still reads the same, it is not specific enough.",
      },
      {
        id: "length-and-focus",
        title: "Length and Focus",
        content:
          "Follow the word limit and stay focused on one or two strong reasons rather than listing everything. Quality beats quantity. A focused essay that goes deep on two genuine interests reads far better than a shallow overview of five.",
      },
    ],
    relatedGuides: [
      { slug: "supplemental-essays", title: "Supplemental Essays", category: "essays" },
      { slug: "why-this-major", title: "Why This Major?", category: "essays" },
      { slug: "how-to-build-a-college-list", title: "How to Build a College List", category: "application" },
    ],
    cta: {
      label: "Find Colleges That Fit",
      href: "/discover/match",
      description: "Build a list of schools worth researching deeply.",
    },
  },
  {
    id: "g-why-this-major",
    slug: "why-this-major",
    title: "Why This Major?",
    description:
      "Many applications ask why you chose your intended field of study. Learn how to answer with purpose and clarity.",
    category: "essays",
    readTime: 7,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-06",
    featured: false,
    takeaways: [
      "Connect your choice to a genuine origin story or experience.",
      "Show you understand the field and why it fits you.",
      "Link your major choice to real programs and goals.",
    ],
    sections: [
      {
        id: "what-they-want-to-know",
        title: "What They Want to Know",
        content:
          "Colleges ask about your major to understand your motivation and whether you have thought seriously about your path. They want to see genuine interest, some understanding of the field, and evidence you can succeed in it.",
      },
      {
        id: "start-with-origin",
        title: "Start With Why It Started",
        content:
          "A specific moment or experience that sparked your interest gives the essay a concrete anchor. It could be a project, a book, a problem you observed, or a person who inspired you. Show the spark, then how it grew into a serious interest.",
      },
      {
        id: "show-understanding",
        title: "Show You Understand the Field",
        content:
          "Briefly demonstrate what the field involves and why it excites you — the questions it asks, the problems it solves, or the skills it develops. This signals genuine engagement rather than a superficial interest in a lucrative career.",
      },
      {
        id: "connect-to-college",
        title: "Connect It to Your Goals",
        content:
          "Link your major to what you hope to learn and do. Mention specific programs or courses at that college if relevant, and connect your choice to your longer-term goals, including how you want to contribute. This ties your personal story to a forward-looking purpose.",
      },
      {
        id: "stay-honest",
        title: "Stay Honest and Flexible",
        content:
          "It is perfectly fine to be exploring. If you are unsure of your exact major, be honest about your curiosity and note related fields you are considering. Colleges appreciate students who are thoughtful and open to growth.",
      },
    ],
    relatedGuides: [
      { slug: "why-this-college", title: "Why This College?", category: "essays" },
      { slug: "personal-statement", title: "Personal Statement", category: "essays" },
      { slug: "supplemental-essays", title: "Supplemental Essays", category: "essays" },
    ],
  },
  {
    id: "g-common-essay-mistakes",
    slug: "common-essay-mistakes",
    title: "Common Essay Mistakes",
    description:
      "Avoid the pitfalls that weaken personal essays — clichés, repetition, and trying too hard to impress.",
    category: "essays",
    readTime: 7,
    difficulty: "intermediate",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-04",
    featured: false,
    takeaways: [
      "Repetition and generic clichés are the most common essay problems.",
      "Trying to sound impressive often backfires.",
      "Show specific moments instead of listing achievements.",
    ],
    sections: [
      {
        id: "repeating-your-resume",
        title: "Repeating Your Resume",
        content:
          "Listing awards and activities duplicates the rest of your application and wastes valuable essay space. Your essay should reveal something the resume cannot. If an essay only restates facts, it adds no new dimension to your candidacy.",
      },
      {
        id: "clichés-and-generalities",
        title: "Clichés and Generalities",
        content:
          "Openings like 'I have always been passionate about helping others' are instantly forgettable because they are vague and overused. Replace generic statements with a concrete, specific moment that demonstrates the quality.",
      },
      {
        id: "trying-too-hard-to-impress",
        title: "Trying Too Hard to Impress",
        content:
          "Using a thesaurus to sound intelligent, inventing grandiose life lessons, or writing what you think colleges want to hear often reads as inauthentic. Admissions officers are skilled at detecting essays that do not reflect the writer. Write like yourself.",
      },
      {
        id: "weak-or-missing-focus",
        title: "Weak or Missing Focus",
        content:
          "Essays that try to cover too much become shallow. If an essay has several stories or points with no clear thread, cut it down to one main message. Focus gives your writing power.",
      },
      {
        id: "ignoring-the-prompt",
        title: "Ignoring the Prompt",
        content:
          "Especially for supplements, failing to answer the actual question is a serious error. Always re-read the prompt after drafting and confirm your response addresses it directly.",
      },
      {
        id: "skipping-revision",
        title: "Skipping Revision",
        content:
          "Submitting a first draft shows. Real editing — tightening sentences, cutting filler, fixing errors, and reworking structure — turns an average essay into a strong one. Never submit without at least one careful revision pass and a proofread.",
      },
    ],
    relatedGuides: [
      { slug: "final-essay-checklist", title: "Final Essay Checklist", category: "essays" },
      { slug: "essay-structure", title: "Essay Structure", category: "essays" },
      { slug: "personal-statement", title: "Personal Statement", category: "essays" },
    ],
  },
  {
    id: "g-final-essay-checklist",
    slug: "final-essay-checklist",
    title: "Final Essay Checklist",
    description:
      "Before you submit, run through this checklist to make sure your essay is clear, authentic, and error-free.",
    category: "essays",
    readTime: 6,
    difficulty: "beginner",
    publishDate: "2026-08-01",
    lastUpdated: "2026-08-02",
    featured: false,
    takeaways: [
      "Check that you answered the prompt and stayed focused.",
      "Read aloud to catch awkward phrasing.",
      "Proofread for typos, grammar, and formatting.",
    ],
    sections: [
      {
        id: "content-check",
        title: "Content Check",
        content:
          "Confirm your essay has a clear focus, a strong opening, a story or reflection that reveals who you are, and a meaningful conclusion. Ask whether it adds something new to your application and whether it could be written by anyone else. If the answer is 'no' to both, it is on the right track.",
      },
      {
        id: "authenticity-check",
        title: "Authenticity Check",
        content:
          "Read your essay and ask: is this genuinely me? Does it sound like how I actually think and speak? If parts feel forced or formulaic, rewrite them in your own voice. An authentic essay is more memorable than a polished but hollow one.",
      },
      {
        id: "technical-check",
        title: "Technical Check",
        content:
          "Read the essay aloud to catch awkward or unclear sentences. Check for spelling and grammar errors, consistent tense, and correct formatting. Confirm you are within the word limit and that special characters, like dashes or accents, were pasted correctly.",
      },
      {
        id: "prompt-and-paste-check",
        title: "Prompt and Paste Check",
        content:
          "Re-read the exact prompt one final time and confirm your response answers it. If you are reusing an essay for multiple schools, make sure no college name from another school is accidentally left in the text. This is a common and embarrassing error.",
      },
      {
        id: "feedback-check",
        title: "Ask for Feedback",
        content:
          "Have someone you trust read it and tell you honestly what they learned about you. Their reaction is a good test of whether your essay communicates who you are. But keep the final voice your own — do not let them rewrite it.",
      },
    ],
    relatedGuides: [
      { slug: "common-essay-mistakes", title: "Common Essay Mistakes", category: "essays" },
      { slug: "essay-structure", title: "Essay Structure", category: "essays" },
      { slug: "personal-statement", title: "Personal Statement", category: "essays" },
    ],
  },
];
