/* =====================================================================
   PROJECTS — all case study content lives here.
   Each project is told as: problem → plan → outcome.

   Writing notes
   - `problemShort` and `resultShort` are the one-liners on the home page cards.
   - `**text**` renders as bold.
   - In `flow`, prefix a node with * to highlight it as the key step.
   - Only state outcomes that are true. No invented numbers.
   ===================================================================== */
window.PROJECTS = [
  {
    slug: "clinic-whatsapp-agent",
    problemShort: "A doctor's WhatsApp was flooded with bookings, questions and emergencies.",
    resultShort: "Parents book in Urdu around the clock, and emergencies reach the doctor at once.",
    name: "Clinic WhatsApp Agent",
    category: "AI agent · WhatsApp · Evaluation",
    tags: ["Agents", "WhatsApp"],
    role: "Design & full build",
    type: "Client project",
    audience: "A children's clinic and its patients' parents",
    built: "an AI front desk that books appointments in Urdu and escalates emergencies to the doctor.",
    summary:
      "A WhatsApp assistant for a paediatric clinic. It books and manages appointments, answers questions about the clinic, and hands urgent or sensitive conversations to the doctor, who replies through the same bridge.",
    links: [],
    problem: {
      title: "One doctor, one phone, and every parent's message landing in it.",
      body: [
        "Parents of young children message the clinic on WhatsApp for everything: a slot for tomorrow, the clinic address, a fee question, and sometimes a child who is seriously unwell. All of it arrived in one inbox, answered by hand, between patients.",
        "Routine questions took up the doctor's time, bookings were tracked manually, and nothing separated an emergency from a request for directions. Parents write in Urdu, in Roman Urdu and in English, often in the same message, so an off-the-shelf bot was never going to work.",
      ],
    },
    plan: {
      title: "Automate the routine, and get a human involved the moment it matters.",
      body: [
        "I split the system into two sides. Parents talk to an agent with booking tools. The doctor gets a separate, private command channel on the same WhatsApp number. The rules that must never break, such as one booking per family or never moving an appointment without consent, live in code, not in the prompt.",
      ],
      steps: [
        "**Two routers:** messages are routed as patient or doctor by the configured doctor number, and unverified privacy-ID senders are never treated as the doctor.",
        "**Token-based booking** that matches how the clinic really works: sequential daily tokens inside clinic hours with a daily cap, one live token per phone number, and cancelled numbers never reissued that day.",
        "**Consent in code:** moving a booking needs an explicit confirmation flag, and the tool refuses unless the parent actually agreed.",
        "**12 patient tools and 4 doctor tools,** covering booking, availability, emergencies, human handoff, patient lookup and schedules.",
        "**Emergency and handoff cases** run as a state machine with reminders, a grace period and reopen-on-late-reply. The sweep runs on every webhook and in a worker, so no case gets stuck.",
        "**Clinic knowledge without an embedding API:** a pure-Python BM25 retriever over the clinic's own notes, with a synonym table for Roman Urdu phrases.",
        "**Urdu replies, English data:** parents are answered in Urdu script while tool arguments stay in English, and a child's name is matched across script and spelling so one child never becomes two records.",
      ],
    },
    flow: ["Parent on WhatsApp", "OpenWA gateway", "FastAPI webhook", "*Patient agent + booking tools", "Database · Calendar · Sheets", "Emergency or handoff", "Doctor on WhatsApp"],
    stack: ["FastAPI", "OpenAI-compatible LLM (OpenRouter)", "OpenWA", "SQLAlchemy", "Alembic", "PostgreSQL", "Google Calendar", "Google Sheets", "BM25", "Docker", "DeepEval"],
    outcome: {
      title: "A front desk that never sleeps, with the doctor still in charge.",
      body: [
        "The assistant handles the repetitive conversations end to end, and the doctor only sees the ones that need a doctor. Medicine names and doses from the doctor are always relayed word for word, never rephrased by the model.",
      ],
      points: [
        "Parents book, move and cancel appointments in a natural conversation, in their own language.",
        "Emergencies and requests for a human are escalated to the doctor with a case number, and tracked until resolved.",
        "The doctor manages cases with short WhatsApp commands such as `1001: reply`, `cases` and `resolve`.",
        "Bookings are mirrored to Google Calendar and Sheets, while the database stays the source of truth.",
        "Flow tests run against a throwaway database and a stub WhatsApp, so testing can never message a real patient.",
        "**Piloted on real WhatsApp traffic:** 87 conversation turns from 21 families, mostly in Urdu and Roman Urdu.",
        "**Model chosen by evaluation, not by taste:** 5 candidate models compared on booking, multi-step and emergency cases; the winner scored 0.79 overall and passed all 3 emergency and safety scenarios.",
      ],
    },
    metrics: [
      { value: "3.95 s", label: "p95 reply time on WhatsApp" },
      { value: "< $0.01", label: "Cost per message" },
      { value: "3 / 3", label: "Emergency and safety scenarios passed" },
      { value: "30", label: "Golden tool-calling test cases" },
      { value: "48", label: "Offline flow tests" },
      { value: "5", label: "Models compared before choosing one" },
    ],
    value: "If your customers already message you on WhatsApp, I can make that channel book, answer and escalate on its own, and keep you in control of the conversations that matter.",
  },

  {
    slug: "edge-manpower-assistant",
    problemShort: "A recruitment chatbot that guesses a salary or visa rule does real harm.",
    resultShort: "Answers only from verified facts: 100% on correctness and safety in evaluation.",
    name: "Edge Manpower Assistant",
    category: "RAG · WhatsApp · Evaluation",
    tags: ["RAG", "WhatsApp"],
    role: "Design, build & evaluation",
    type: "Client project",
    audience: "An overseas recruitment company",
    built: "a WhatsApp assistant that answers only from verified facts, with an evaluation suite to prove it.",
    summary:
      "A WhatsApp assistant for Edge Manpower, an overseas recruitment company. It answers candidates from the company's knowledge base, refuses to invent what it doesn't know, and ships with an evaluation suite that measures every stage.",
    links: [{ label: "Evaluation harness", url: "https://github.com/GenAIwithMS/rag-eval-deepeval" }],
    problem: {
      title: "Job seekers ask the same questions all day. A wrong answer can cost them dearly.",
      body: [
        "People looking for work abroad message a recruiter constantly: which countries, which jobs, what is the process, how do I apply. Answering by hand does not scale, so a chatbot is the obvious move.",
        "But this is an industry where an invented salary, fee, visa rule or deadline can mislead someone into a serious decision. A normal chatbot fills gaps with plausible guesses. Here the assistant had to know exactly where its knowledge ends, and there had to be evidence that it does.",
      ],
    },
    plan: {
      title: "Ground everything, abstain by design, and measure every stage.",
      body: [
        "I built the pipeline and its evaluation together, so each design choice could be tested instead of argued about.",
      ],
      steps: [
        "**Structure-aware chunking:** each heading of the knowledge base becomes one chunk with its section as metadata, 18 in total, and a test verifies that every line survives chunking.",
        "**Local embeddings, then a reranker:** `bge-small` embeddings with no embedding API, a wide search of 10 narrowed to the best 3 by a cross-encoder.",
        "**Follow-ups that work:** a question-condensing step rewrites \"and in Qatar?\" into a full question using per-sender memory (last 10 exchanges, expiring after 6 idle hours).",
        "**An explicit never-invent list** in the prompt (salaries, fees, visas, eligibility, deadlines, guarantees), with a fixed abstention sentence followed by the official contact details.",
        "**Swappable WhatsApp transport:** it runs on the self-hosted OpenWA gateway today, and Meta's official Cloud API is fully wired and switched on by one setting. Webhooks are signature-verified and de-duplicated.",
        "**Evaluation with DeepEval:** 123 hand-written test cases across correctness, retrieval, faithfulness, scope, leakage and toxicity, including 11 hallucination traps where the only right answer is \"I don't know\".",
      ],
    },
    flow: ["Candidate on WhatsApp", "Signed webhook", "Condense follow-up", "Retrieve 10 → rerank to 3", "*Grounded answer, or abstain", "WhatsApp reply", "Evaluation suite"],
    stack: ["Python", "FastAPI", "LangChain", "ChromaDB", "bge-small embeddings", "Cross-encoder reranker", "OpenRouter", "DeepEval", "SQLite", "OpenWA", "Meta Cloud API", "Streamlit"],
    outcome: {
      title: "An assistant with a scorecard, including the parts that are not perfect.",
      body: [
        "After three rounds of fixes, these are the measured results. I report the weaker numbers too: answer relevancy came in at 65 to 75% and completeness at 70%, largely because the hallucination traps score near zero on relevancy by design, since the correct answer is an abstention.",
      ],
      points: [
        "**Correctness 100%,** with retrieval recall and precision both at 100%.",
        "**Safety 100%** on scope, prompt and internal leakage, personal data and toxicity.",
        "**Faithfulness 80 to 85%,** with several failures traced to the judge model rather than the assistant.",
        "**4.8 s p95** end-to-end reply time against a 5 s target, at **$0.00017 per question.**",
        "I replaced DeepEval's built-in personal-data metric after finding it flagged the company's own contact email as a leak.",
        "17 offline tests cover the webhook, memory and ingestion, with no API calls needed.",
      ],
    },
    metrics: [
      { value: "100%", label: "Correctness" },
      { value: "100%", label: "Safety" },
      { value: "80–85%", label: "Faithfulness" },
      { value: "4.8 s", label: "p95 reply time" },
      { value: "$0.00017", label: "Cost per question" },
      { value: "123", label: "Hand-written test cases" },
    ],
    value: "I don't hand over a chatbot and hope. You get the numbers that show where it is reliable and where it is not, before your customers find out.",
  },

  {
    slug: "stackminds-recruiting-agent",
    problemShort: "Hiring, sales and follow-up chats all landed on one WhatsApp number.",
    resultShort: "One assistant sorts them, screens candidates and emails HR a finished summary.",
    name: "StackMinds Recruiting Agent",
    status: "In progress",
    category: "Multi-agent · RAG · WhatsApp · Evaluation",
    tags: ["Agents", "RAG", "WhatsApp"],
    role: "Design & build",
    type: "Client project",
    audience: "A software company's HR and sales teams",
    built: "one assistant that screens candidates, answers company questions and emails HR a finished summary.",
    summary:
      "A WhatsApp-native assistant for StackMinds that does three jobs in one conversation: recruits candidates, answers company, pricing and support questions from a knowledge base, and handles follow-ups. This project is still in progress.",
    links: [{ label: "Evaluation harness", url: "https://github.com/GenAIwithMS/rag-eval-deepeval" }],
    problem: {
      title: "Three different conversations, one inbox, and a person sorting them by hand.",
      body: [
        "Candidates send CVs as PDFs, Word files and even photos. Prospects ask about services and pricing. Earlier applicants come back asking \"any update?\" or \"why was I rejected?\". All of it lands on the same WhatsApp number.",
        "Someone had to read each message, work out which kind it was, collect the missing details from candidates one question at a time, apply the eligibility policy consistently and write it all up for HR. It is slow, repetitive work, and it is easy to apply the rules unevenly.",
      ],
    },
    plan: {
      title: "One persona on the outside, specialised agents and hard rules on the inside.",
      body: [
        "To the user it is a single assistant. Underneath, a LangGraph workflow decides which specialist handles each message, and anything that must be consistent is enforced in code before the model ever sees it.",
      ],
      steps: [
        "**A decider routes each message** to recruitment, knowledge-base answers or follow-up handling, with every agent given the full conversation in the same framing.",
        "**Resume intake in any format:** PDF, DOCX or a photo read by OCR, then the assistant asks only for what is still missing.",
        "**Deterministic guards that bypass the LLM:** file uploads always go to recruitment, eligibility rules are applied in code, emails are validated server-side, and group or broadcast messages are dropped.",
        "**HR gets a finished summary by email,** with no human in the loop to assemble it.",
        "**The right store for each job:** Redis only for the transient layer (per-phone queue, 2-second debounce, locks, rate limits, loop protection) and PostgreSQL for the full conversation history.",
        "**A webhook that fails closed:** HMAC-authenticated, idempotent and rate-limited.",
        "**Evaluation as a release gate:** 460 hand-written cases (119 for RAG answers, 103 for retrieval, 89 for routing, 89 adversarial safety cases and 60 for detail collection), compared against a blessed baseline with a pass, review or fail verdict.",
      ],
    },
    flow: ["WhatsApp message", "Signed webhook + Redis queue", "Deterministic guards", "*LangGraph decider", "Recruit · Answer · Follow up", "PostgreSQL + ChromaDB", "Reply, and email to HR"],
    stack: ["Python", "FastAPI", "LangGraph", "DeepSeek", "ChromaDB", "PostgreSQL", "Redis", "OpenWA", "Resend", "DeepEval", "Docker", "GitHub Actions"],
    outcome: {
      title: "Not finished, but already measured.",
      body: [
        "The production rollout is still ahead, but the evaluation suite already runs against the live answer pipeline, and its results drive every change.",
      ],
      points: [
        "**Answer relevancy 98.1%** and **faithfulness 94.2%** across 103 graded questions. Faithfulness rose from 77.7% after a prompt-grounding fix that the suite caught.",
        "**Retrieval that finds the right evidence:** contextual recall 94.2%, precision 90.3%, and the right chunk in the top 20 for 97.1% of questions.",
        "**The reranker earned its place:** an A/B test lifted retrieval precision from 66% with plain embedding search to 88%.",
        "The three conversation types run through one assistant with a shared memory of the chat.",
        "Seven evaluation families are in place, including a retriever A/B test (plain top-3 against a cross-encoder reranker), a routing confusion matrix, and latency and cost tracking.",
        "CI runs linting, type checks and a security scan on every change.",
        "Deployment is automated: it initialises the database, restarts the service, polls the health check and aborts with logs if the service does not come up.",
        "Next: finish the evaluation rounds against the baseline and complete the production rollout.",
      ],
    },
    metrics: [
      { value: "3.95 s", label: "p95 reply time on WhatsApp" },
      { value: "$0.009", label: "Cost per answered question" },
      { value: "98.1%", label: "Answer relevancy" },
      { value: "94.2%", label: "Faithfulness" },
      { value: "97.1%", label: "Right evidence in the top 20" },
      { value: "460", label: "Hand-written test cases" },
    ],
    value: "If several kinds of conversation hit one inbox, I can build a single assistant that sorts them, acts on them and hands your team finished work.",
  },

  {
    slug: "opengpt",
    problemShort: "Teams want ChatGPT on their own server, with their own documents.",
    resultShort: "A self-hosted assistant with tools, document chat and memory that lasts.",
    name: "OpenGPT",
    category: "RAG · Agentic chatbot",
    tags: ["RAG", "Agents"],
    role: "Solo build",
    type: "Open-source product",
    audience: "Teams who want their own assistant",
    built: "a self-hosted AI assistant with tools, document chat and deep research.",
    summary:
      "A ChatGPT-style assistant you can run yourself: streaming answers, conversation threads that persist, chat with your own documents, and an agent that picks the right tool for the question.",
    links: [{ label: "GitHub", url: "https://github.com/GenAIwithMS/LangGraph-Chatbot" }],
    problem: {
      title: "Hosted chatbots don't know your documents, and you don't control them.",
      body: [
        "People want one chat window that can search the web, read the PDF they just uploaded and run real research. Hosted assistants do parts of this, but the data leaves your hands and the behaviour can't be changed.",
        "Most open-source alternatives are demos: they lose the conversation on refresh, forget uploaded documents when the server restarts, and fall over when two requests hit the same thread.",
      ],
    },
    plan: {
      title: "Build it as a graph, and treat persistence as a first-class feature.",
      body: [
        "I modelled the assistant as a LangGraph state graph: a chat node decides whether to answer or call a tool, the tool runs, and control returns to the chat node. Everything the user sees streams live over server-sent events.",
      ],
      steps: [
        "**Five tools the agent chooses between:** web search, weather, calculator, stock prices and deep research. Two larger sub-graphs handle blog writing (plan, fan out to parallel writers, merge) and supervised multi-step research.",
        "**Document chat:** PDF, Markdown and text files are split into 1,000-character chunks with 200 overlap, embedded with MiniLM and searched in FAISS. Each thread gets its own retriever, rebuilt from disk after a restart.",
        "**A custom MySQL checkpointer** I wrote for LangGraph, with per-thread locking and retry with backoff, so conversations survive restarts and concurrent requests.",
        "**Temporary chats** run on an in-memory graph and are never saved.",
        "**Reasoning shown separately:** the model's thinking streams into a collapsible bar while the stored answer stays clean.",
      ],
    },
    flow: ["React chat UI", "FastAPI + SSE stream", "*LangGraph agent", "Tools · Research · RAG", "FAISS per thread", "MySQL checkpoints"],
    stack: ["LangGraph", "LangChain", "FastAPI", "React", "FAISS", "MySQL", "Groq · gpt-oss-120b", "Sentence Transformers", "LangSmith", "Tailwind"],
    outcome: {
      title: "A complete assistant, not a weekend demo.",
      body: [
        "OpenGPT behaves the way people expect a modern assistant to behave, and it is open source under the MIT licence so anyone can run or extend it.",
      ],
      points: [
        "Streaming answers with a live progress view for long research and blog tasks.",
        "Multiple threads with auto-generated titles, rename, delete, regenerate and edit-and-resend.",
        "Drag-and-drop document upload, with retrieval skipped entirely when a thread has no document.",
        "12 documented API endpoints, typed error handling and LangSmith tracing.",
      ],
    },
    value: "Need an assistant that knows your documents and runs on your own infrastructure? This is the foundation I would start from.",
  },

  {
    slug: "gracewise",
    problemShort: "Valuable guidance was buried in PDFs nobody had time to search.",
    resultShort: "A live platform where parents simply ask, and answers come from the sources.",
    name: "GraceWise",
    category: "RAG · Education platform",
    tags: ["RAG", "Full-stack"],
    role: "AI & backend engineer",
    type: "Live platform",
    audience: "Parents and educators",
    built: "an AI-powered spiritual learning platform with a RAG guide and a curriculum system.",
    summary:
      "A children's spiritual growth platform for parents and educators. An AI guide answers questions from a curated library of source documents, and a curriculum system delivers structured lessons by age and learning stage.",
    links: [{ label: "Live site", url: "https://gracewise.org" }],
    problem: {
      title: "A rich library, and no practical way to ask it a question.",
      body: [
        "GraceWise helps parents and educators guide children's spiritual growth, and its knowledge lived in long PDF documents. Someone looking for guidance on a specific question had to know which document to open and where to look, which in practice meant most of that material went unread.",
        "A general chatbot was not an option either. On a subject this personal, an answer has to come from the platform's own trusted sources, not from whatever a model happens to remember. On top of that, educators needed a way to organise lessons for very different age groups.",
      ],
    },
    plan: {
      title: "Ground every answer in the source material, and give educators real structure.",
      body: [
        "I built two things that work together: a retrieval-augmented chatbot that only answers from the knowledge base, and a curriculum management system for the structured side of learning.",
      ],
      steps: [
        "**Document pipeline:** PDFs are extracted, split, embedded with Sentence Transformers and stored in ChromaDB, end to end and repeatable as the library grows.",
        "**Semantic search:** questions are matched by meaning, not keywords, so people can ask in their own words.",
        "**Grounded generation:** LangChain feeds the retrieved passages to the model (OpenAI and Groq), which reasons over them to give personal, relevant guidance.",
        "**Curriculum management:** create, organise and deliver structured content across multiple age groups and learning stages, backed by MySQL.",
      ],
    },
    flow: ["PDF library", "Extract + chunk", "Embeddings", "ChromaDB", "*Retrieve by meaning", "LLM answers from sources", "Parent or educator"],
    stack: ["Flask", "LangChain", "OpenAI API", "Groq", "ChromaDB", "Sentence Transformers", "MySQL", "SQLAlchemy"],
    outcome: {
      title: "A library you can talk to, running in production.",
      body: [
        "GraceWise is live. The knowledge base went from static files to something a parent or teacher can simply ask, and educators have one place to manage what each age group studies.",
      ],
      points: [
        "A production RAG chatbot giving personalised guidance grounded in the platform's own documents.",
        "New PDFs flow through the same pipeline, so the knowledge base grows without code changes.",
        "Structured curricula delivered across multiple age groups and learning stages.",
      ],
    },
    value: "If your organisation's knowledge is locked in documents, I can turn it into an assistant that answers from your sources, not from guesswork.",
  },

  {
    slug: "elevatexcrew-website",
    problemShort: "Every blog post or job opening needed a developer.",
    resultShort: "A fast, SEO-ready site the team now updates themselves.",
    name: "ElevateXCrew — website & CMS",
    category: "Full-stack · CMS",
    tags: ["Full-stack"],
    role: "Lead developer, end to end",
    type: "Company website + custom CMS",
    audience: "A software company and its marketing team",
    built: "a fast, SEO-ready corporate site with a CMS the team can run themselves.",
    summary:
      "The corporate website and content platform for ElevateXCrew, taken from business requirements to production: a server-rendered public site, a REST API and a dedicated admin portal.",
    links: [{ label: "Live site", url: "https://elevatexcrew.com" }],
    problem: {
      title: "Every blog post was a development task.",
      body: [
        "ElevateXCrew needed a website that does real work: win clients through search, show the portfolio, and attract applicants. That means content that changes every week.",
        "With a hand-coded site, each new article, case study or vacancy had to go through a developer. The site also had to be genuinely fast and visible to search engines, which rules out a simple client-rendered app.",
      ],
    },
    plan: {
      title: "Three parts, each doing one job well.",
      body: [
        "I led the project across its whole lifecycle and split the system into a public site, an API and an admin portal, so each could be built and deployed independently.",
      ],
      steps: [
        "**Public site:** Next.js 14 with server-side rendering, including dynamic pages for 12 services, 10 industries, blog posts and portfolio items.",
        "**API:** Express with Prisma and MySQL, 30 route handlers across auth, blogs, portfolio, jobs, gallery and uploads.",
        "**Admin portal:** a separate React app with 15 screens where staff write in Markdown, manage images and publish or unpublish content.",
        "**Security:** JWT sessions in httpOnly cookies, bcrypt-hashed passwords, an origin allowlist for CORS, and validated image uploads.",
        "**SEO groundwork:** generated sitemap including live blog and portfolio URLs, robots rules, canonical tags, Open Graph metadata and per-page metadata.",
        "**Operations:** a secret-protected revalidation endpoint to refresh cached pages, and a single deploy script for the cPanel production setup.",
      ],
    },
    flow: ["Admin portal", "Express API + JWT", "MySQL via Prisma", "*Next.js server rendering", "Visitors & search engines"],
    stack: ["Next.js 14", "React", "TypeScript", "Tailwind CSS", "Node.js", "Express.js", "Prisma", "MySQL", "JWT", "Vite", "Multer", "cPanel"],
    outcome: {
      title: "Live at elevatexcrew.com, and run by the team, not by developers.",
      body: [
        "The site is in production and the people responsible for content now control it directly.",
      ],
      points: [
        "Blogs, portfolio case studies, careers and gallery are all managed from the admin portal.",
        "Server-rendered pages with the technical SEO foundations in place.",
        "One command builds and deploys the site, the API or the admin portal.",
        "A maintainable codebase that the company continues to build on.",
      ],
    },
    value: "Need a website your team can actually run? I build the site, the CMS and the deployment, so publishing never waits on a developer.",
  },

  {
    slug: "raketh-voice-saas",
    problemShort: "A voice AI engine can't sell itself: no accounts, billing or admin.",
    resultShort: "A complete SaaS around it: credits, voice library and a back office.",
    name: "RaketH Clone — AI voice SaaS",
    category: "SaaS · Voice AI",
    tags: ["Full-stack"],
    role: "Design & full build",
    type: "Subscription SaaS platform",
    audience: "Creators and businesses using AI voice",
    built: "the full SaaS platform around a voice engine: cloning, multilingual speech, credits and admin.",
    summary:
      "The complete SaaS layer for an AI voice engine: it connects to a separate GPU voice backend and wraps voice cloning, multilingual speech and translated voice in everything needed to run them as a business.",
    links: [],
    problem: {
      title: "The AI part works. Everything around it is missing.",
      body: [
        "Voice AI models can clone a voice or read text aloud in seconds. But a model on its own can't take a customer's money, stop them overusing it, remember what they generated last week, or tell the owner how the business is doing.",
        "Turning voice AI into revenue means solving the unglamorous problems: accounts, fair usage, billing, history and administration, without the product feeling heavy to use.",
      ],
    },
    plan: {
      title: "Design the business around the model, then make it feel effortless.",
      body: [
        "The voice engine itself runs as a separate GPU service. My job was everything between that engine and a paying customer, so I treated the AI as one service inside a proper SaaS architecture, built on Next.js with a typed data layer from the database to the UI.",
      ],
      steps: [
        "**Three voice features** wired to the engine: cloning from uploaded samples, streaming text-to-speech, and translate-then-speak across 11+ languages.",
        "**Credit-based billing:** usage is metered in credits that are bought once and never expire, so pricing stays simple and predictable.",
        "**User workspace:** secure sign-in with NextAuth, a personal voice library, full generation history and responsive dashboards.",
        "**Admin tools:** real-time platform analytics, user and subscription management, credit allocation and customer engagement workflows.",
        "**Frontend that feels fast:** TanStack Query for data, Zustand for state, Zod-validated forms, Framer Motion for feedback.",
      ],
    },
    flow: ["User dashboard", "Auth + credit check", "*GPU voice engine: clone · TTS · translate", "Audio saved to library", "History + billing", "Admin analytics"],
    stack: ["Next.js 16", "TypeScript", "Prisma", "NextAuth.js", "MySQL", "Tailwind CSS", "shadcn/ui", "Zustand", "TanStack Query", "Zod", "Framer Motion"],
    outcome: {
      title: "A platform that is ready to take paying customers.",
      body: [
        "The finished product covers the whole journey, from a new visitor signing up to an administrator reviewing how the platform is performing.",
      ],
      points: [
        "Voice cloning, multilingual speech and translated voice in one place.",
        "Metered credits, generation history and a reusable voice library.",
        "An admin back office for analytics, users, subscriptions and credits.",
        "Production-ready architecture that supports commercial deployment.",
      ],
    },
    value: "Have an AI capability you want to sell? I can build the product, billing and back office that turn it into a business.",
  },

  {
    slug: "lms-agentic",
    problemShort: "School software buries every task under menus and forms.",
    resultShort: "An assistant that acts for you, limited to what your role allows.",
    name: "LMS Agentic",
    category: "Agentic AI · Education",
    tags: ["Agents", "Full-stack"],
    role: "Solo build",
    type: "Full-stack platform with an AI agent",
    audience: "Schools, teachers and students",
    built: "a learning management system with an AI assistant that knows your role.",
    summary:
      "A full learning management system for administrators, teachers and students, with a LangGraph assistant that carries out tasks using tools matched to the role of whoever is asking.",
    links: [{ label: "GitHub", url: "https://github.com/GenAIwithMS/LMS" }],
    problem: {
      title: "Three kinds of users, one system, a lot of clicking.",
      body: [
        "A learning management system serves people with very different jobs. An administrator manages the institution, a teacher runs courses, a student follows them. Traditional systems answer this with layers of menus and forms that everyone has to learn.",
        "Adding an AI assistant sounds like the fix, but it raises a harder question: how do you let an assistant take actions without letting a student do what only an admin should?",
      ],
    },
    plan: {
      title: "Give the assistant tools, and let the user's role decide which ones.",
      body: [
        "I built the LMS first as a solid role-based application, then added an agent on top that respects exactly the same boundaries.",
      ],
      steps: [
        "**Role-based access** for administrators, teachers and students across the whole platform.",
        "**Role-specific tools:** the LangGraph agent is handed only the tools that the signed-in user's role permits, so safety is structural, not a prompt instruction.",
        "**Workflow automation:** routine course tasks become a sentence typed to the assistant.",
        "**Persistent chat history,** so the assistant keeps context between sessions.",
        "**One unified dashboard** for course management, built with React and TypeScript on a Flask API.",
      ],
    },
    flow: ["Admin · Teacher · Student", "React dashboard", "Flask API + role check", "*LangGraph agent with role tools", "Course data", "Saved chat history"],
    stack: ["LangGraph", "OpenAI API", "React", "TypeScript", "Flask", "SQLAlchemy", "PostgreSQL / MySQL"],
    outcome: {
      title: "An LMS where asking is as valid as clicking.",
      body: [
        "Every user gets the full traditional interface plus an assistant that can act on their behalf, within their permissions.",
      ],
      points: [
        "Complete course management for three roles through a single dashboard.",
        "An AI assistant that performs real actions, not just answers questions.",
        "Permissions enforced by which tools the agent receives, per role.",
        "Conversations that persist, so work can be picked up later.",
      ],
    },
    value: "I can add an AI agent to your existing software that takes real actions, while respecting the permissions you already have.",
  },

  {
    slug: "youtube-rag-chat",
    problemShort: "Finding one answer in a two-hour video means scrubbing and guessing.",
    resultShort: "Ask the video directly and get answers grounded in its transcript.",
    name: "YouTube RAG Chat",
    category: "RAG · Chrome extension",
    tags: ["RAG"],
    role: "Solo build",
    type: "Browser extension + API",
    audience: "Anyone learning from long videos",
    built: "a Chrome extension that lets you ask questions of the video you're watching.",
    summary:
      "A Chrome extension that turns any YouTube video into something you can question. It reads the transcript, indexes it, and answers from what was actually said.",
    links: [{ label: "GitHub", url: "https://github.com/GenAIwithMS/Youtube-Chrome-Extension" }],
    problem: {
      title: "Long videos hide their answers.",
      body: [
        "Tutorials, lectures and podcasts are full of useful information, but video is the hardest format to search. Finding one explanation means scrubbing the timeline, guessing and rewatching.",
        "Pasting a link into a general chatbot does not help much either: it may never have seen the video, and it will happily make something up.",
      ],
    },
    plan: {
      title: "Bring the question box to the video, and answer only from the transcript.",
      body: [
        "The extension detects the video automatically and hands it to a FastAPI backend that builds a small search index for that video.",
      ],
      steps: [
        "**Automatic detection:** a Manifest V3 extension notices the current video, including YouTube's in-page navigation, and shows a badge when it is ready.",
        "**Transcript to index:** the transcript is fetched (English, Hindi, Bengali or Chinese), split into overlapping chunks, embedded with MiniLM and stored in FAISS.",
        "**Grounded answers:** the four most relevant passages go to the model, with instructions to say so when the video doesn't cover the question and never to invent timestamps.",
        "**Process once:** each video's index and chain are cached, so the expensive step runs a single time.",
        "**Remembers the chat:** conversation history is saved per video in the browser.",
      ],
    },
    flow: ["YouTube tab", "Extension detects video", "FastAPI", "Transcript → chunks → FAISS", "*Retrieve relevant passages", "LLM answer", "Chat popup"],
    stack: ["Chrome Extension (MV3)", "FastAPI", "LangChain", "FAISS", "Sentence Transformers", "YouTube Transcript API", "OpenAI-compatible LLM"],
    outcome: {
      title: "Ask the video instead of watching it twice.",
      body: [
        "The whole experience happens in a small popup on the page you are already on, and the answers stay faithful to the video.",
      ],
      points: [
        "Works on any video with a transcript, in four transcript languages.",
        "Answers come from the transcript, and the assistant says when the video doesn't cover something.",
        "Clear messages when a video has transcripts disabled or unavailable.",
        "Per-video chat history that is still there when you come back.",
      ],
    },
    value: "The same pattern works for your content: recorded calls, training videos or webinars that people can simply ask questions of.",
  },

  {
    slug: "openwa",
    problemShort: "WhatsApp bots could see a document arrive, but couldn't open it.",
    resultShort: "Files now reach the webhook, ready for AI and RAG pipelines.",
    name: "OpenWA — document support",
    category: "Open source · WhatsApp",
    tags: ["Open source", "WhatsApp"],
    role: "Open-source contributor",
    type: "Contribution to a WhatsApp API gateway",
    audience: "Developers building WhatsApp bots",
    built: "document download support for an open-source WhatsApp gateway, so files can feed AI pipelines.",
    summary:
      "OpenWA is an open-source, self-hosted HTTP gateway for WhatsApp. I extended it so documents sent by users actually arrive in the webhook and can be downloaded on demand.",
    links: [
      { label: "My fork", url: "https://github.com/GenAIwithMS/OpenWa" },
      { label: "OpenWA project", url: "https://github.com/rmyndharis/OpenWA" },
    ],
    problem: {
      title: "The file was sent. The bot received an empty marker.",
      body: [
        "I was building WhatsApp agents that needed to read what users send: a CV, a report, a PDF to add to a knowledge base. With OpenWA, those messages arrived at the webhook with no media attached at all.",
        "I traced it to the underlying library. It decides whether a message has media by looking for a download path, and for senders using WhatsApp's newer privacy IDs that path is missing. So the gateway concluded there was nothing to download, and every document-based workflow stopped right there.",
      ],
    },
    plan: {
      title: "Fix detection, add a fallback, and make media retrievable on demand.",
      body: [
        "Rather than patching around it in my own bot, I fixed it in the gateway so every project built on OpenWA benefits.",
      ],
      steps: [
        "**Detect media by message type** (image, video, document, audio, sticker, voice note) instead of trusting the missing path, for both incoming messages and echoes of sent ones.",
        "**Direct download fallback:** when the browser-based download fails, fetch the encrypted file from WhatsApp's CDN and decrypt it in Node, deriving the keys with HKDF and decrypting with AES-256-CBC.",
        "**New endpoint:** `GET /sessions/:id/messages/:chatId/:messageId/media` returns the file with its MIME type and filename.",
        "**Honest failures:** if both download paths fail, the webhook now says so with the file's type, name and size instead of sending nothing.",
        "**Done properly:** engine interface and capability matrix updated, unit tests added, OpenAPI spec and docs extended.",
      ],
    },
    flow: ["User sends a PDF", "OpenWA engine", "*Detect by message type", "Browser download, or CDN + decrypt", "Webhook with file", "AI / RAG ingestion"],
    stack: ["TypeScript", "NestJS", "Node.js crypto", "whatsapp-web.js", "Webhooks", "OpenAPI"],
    outcome: {
      title: "Documents became a first-class input for WhatsApp automation.",
      body: [
        "With this change, a user can send a file over WhatsApp and an AI system on the other side can actually read it. That is the step that makes resume screening, document Q&A and knowledge-base ingestion possible over chat.",
      ],
      points: [
        "Incoming PDF and DOCX files are captured, retrievable and persisted with the message.",
        "Works for senders where the library previously reported no media at all.",
        "Respects the gateway's existing size cap and concurrency limits.",
        "A related crash when loading chat history for those senders was fixed along the way.",
      ],
    },
    value: "When a tool almost does what you need, I can go into the source and close the gap, instead of telling you it can't be done.",
  },
];
