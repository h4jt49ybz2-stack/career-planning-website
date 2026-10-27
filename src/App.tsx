import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Compass,
  FileCheck2,
  FileText,
  Flag,
  Globe2,
  GraduationCap,
  Heart,
  HelpCircle,
  LayoutDashboard,
  Leaf,
  ListChecks,
  LockKeyhole,
  Menu,
  Navigation,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PageId, PathId, PathRecommendation, Profile } from "./types";
import { analyzeProfile, emptyProfile } from "./lib/planner";
import { demoProfile } from "./lib/sample";
import { recommendCareers } from "./lib/careers";
import ProfileEditor from "./components/ProfileEditor";
import {
  ActionsView,
  ResourcesView,
  ResumeView,
} from "./components/WorkspaceViews";

const STORAGE_KEY = "xiangyuan.workspace.v1";
const navigation: { id: PageId; name: string; icon: LucideIcon; en: string }[] =
  [
    {
      id: "overview",
      name: "生涯总览",
      icon: LayoutDashboard,
      en: "YOUR NEXT CHAPTER",
    },
    {
      id: "profile",
      name: "我的档案",
      icon: UserRound,
      en: "GET TO KNOW YOURSELF",
    },
    {
      id: "directions",
      name: "探索方向",
      icon: Compass,
      en: "EXPLORE THE POSSIBILITIES",
    },
    {
      id: "resume",
      name: "简历准备",
      icon: FileText,
      en: "MAKE YOUR EXPERIENCE COUNT",
    },
    {
      id: "actions",
      name: "行动计划",
      icon: ListChecks,
      en: "SMALL STEPS, REAL PROGRESS",
    },
    {
      id: "resources",
      name: "成长资源",
      icon: BookOpen,
      en: "KEEP LEARNING, KEEP GROWING",
    },
  ];
const pathMeta: Record<
  PathId,
  {
    icon: LucideIcon;
    label: string;
    english: string;
    className: string;
    title: string;
  }
> = {
  work: {
    icon: BriefcaseBusiness,
    label: "求职就业",
    english: "CAREER",
    className: "career",
    title: "把热爱，变成职业的起点",
  },
  domestic: {
    icon: GraduationCap,
    label: "国内升学",
    english: "FURTHER STUDY",
    className: "study",
    title: "继续深耕，让专业成为底气",
  },
  overseas: {
    icon: Globe2,
    label: "海外升学",
    english: "STUDY ABROAD",
    className: "abroad",
    title: "去更大的世界，发现可能",
  },
};

function readWorkspace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.profile && typeof data.profile === "object") {
        const profile = { ...emptyProfile };
        for (const key of Object.keys(emptyProfile) as (keyof Profile)[]) {
          const value = data.profile[key];
          if (Array.isArray(emptyProfile[key])) {
            if (
              Array.isArray(value) &&
              value.every((item: unknown) => typeof item === "string")
            )
              Object.assign(profile, { [key]: value });
          } else if (typeof value === typeof emptyProfile[key])
            Object.assign(profile, { [key]: value });
        }
        // Local storage is user-editable; validate enums and bounds at the boundary.
        if (!["work", "domestic", "overseas", "explore"].includes(profile.goal))
          profile.goal = "explore";
        if (
          !["work", "domestic", "overseas", "open"].includes(
            profile.familyPreference,
          )
        )
          profile.familyPreference = "open";
        if (!["本科", "硕士", "博士", "专科", ""].includes(profile.degree))
          profile.degree = "";
        if (
          !["growth", "stability", "balance"].includes(profile.personalPriority)
        )
          profile.personalPriority = "growth";
        if (!["全职", "实习", "均可"].includes(profile.jobType))
          profile.jobType = "均可";
        profile.autonomy = Number.isFinite(profile.autonomy)
          ? Math.max(0, Math.min(100, profile.autonomy))
          : 80;
        profile.budget = Number.isFinite(profile.budget)
          ? Math.max(0, Math.min(1000, profile.budget))
          : 0;
        profile.internshipMonths = Number.isFinite(profile.internshipMonths)
          ? Math.max(0, Math.min(120, profile.internshipMonths))
          : 0;
        return {
          profile,
          completed: Array.isArray(data.completed)
            ? (data.completed.filter(
                (x: unknown) => typeof x === "string",
              ) as string[])
            : [],
          isDemo: data.isDemo === true,
        };
      }
    }
  } catch {
    /* A blocked or damaged local store must not prevent using the app. */
  }
  return {
    profile: { ...demoProfile },
    completed: [] as string[],
    isDemo: true,
  };
}

function initialPage(): PageId {
  const page = window.location.hash.slice(1);
  return navigation.some((item) => item.id === page)
    ? (page as PageId)
    : "overview";
}

function JourneyIllustration() {
  return (
    <svg
      className="journey-art"
      viewBox="0 0 320 256"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="hill"
          x1="160"
          y1="60"
          x2="160"
          y2="250"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d0dcc8" />
          <stop offset="1" stopColor="#e8eddf" />
        </linearGradient>
      </defs>
      <circle cx="179" cy="119" r="91" stroke="#b9c8ad" strokeDasharray="3 7" />
      <circle cx="179" cy="119" r="66" stroke="#cbd5c0" />
      <path d="M34 213 100 139l45 41 68-99 85 132H34Z" fill="url(#hill)" />
      <path
        d="m34 213 66-74 45 41 68-99 85 132"
        stroke="#a9baa0"
        strokeWidth="1.5"
      />
      <path
        d="M145 237c53-47-42-45 23-93 31-23 42-26 45-63"
        stroke="#fff"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M145 237c53-47-42-45 23-93 31-23 42-26 45-63"
        stroke="#627c56"
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />
      <path d="M213 82V44" stroke="#425b3c" strokeWidth="2" />
      <path d="m214 44 26 8-26 9V44Z" fill="#647f4d" />
      <path
        d="m95 75 35-20-8 35-9-13-18-2Z"
        fill="#fbfff1"
        stroke="#748768"
        strokeWidth="1.5"
      />
      <path d="m113 77 17-22" stroke="#748768" strokeWidth="1.5" />
      <circle cx="73" cy="165" r="5" fill="#7f976b" />
      <circle cx="73" cy="165" r="10" stroke="#7f976b" strokeOpacity=".25" />
      <circle cx="257" cy="126" r="5" fill="#d5a765" />
      <g transform="translate(177 164)">
        <rect width="104" height="37" rx="10" fill="white" />
        <circle cx="18" cy="18.5" r="9" fill="#edf3df" />
        <path
          d="m14 19 3 3 5-6"
          stroke="#6d8559"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <text
          x="34"
          y="22"
          fontSize="10"
          fill="#40523b"
          fontFamily="sans-serif"
        >
          每一步，都算数
        </text>
      </g>
      <path
        d="m266 47 2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7ZM65 108l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"
        fill="#a4b48d"
      />
      <text
        x="47"
        y="238"
        fontSize="8"
        fill="#839173"
        fontFamily="monospace"
        letterSpacing="2"
      >
        FIND YOUR OWN WAY
      </text>
    </svg>
  );
}

function ProgressRing({ value, size = 78 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#eef0e8"
          strokeWidth="5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#728b57"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span>
        {value}
        <small>%</small>
      </span>
    </div>
  );
}

function App() {
  const [workspace, setWorkspace] = useState(readWorkspace);
  const [page, setPage] = useState<PageId>(initialPage);
  const [mobileNav, setMobileNav] = useState(false);
  const [selectedPath, setSelectedPath] = useState<PathRecommendation | null>(
    null,
  );
  const [info, setInfo] = useState<
    "privacy" | "method" | "notifications" | "reset" | null
  >(null);
  const [toast, setToast] = useState("");
  const [directionFilter, setDirectionFilter] = useState<"all" | PathId>("all");
  const { profile, completed, isDemo } = workspace;
  const analysis = useMemo(() => analyzeProfile(profile), [profile]);
  const careers = useMemo(() => recommendCareers(profile), [profile]);
  const currentNav = navigation.find((item) => item.id === page)!;
  const activeCompleted = analysis.actions.filter((item) =>
    completed.includes(item.id),
  ).length;
  const pendingCount = analysis.actions.length - activeCompleted;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      setToast("浏览器未允许本地保存，当前操作仍可使用；刷新后可能丢失。");
    }
  }, [workspace]);
  useEffect(() => {
    const handler = () => {
      setPage(initialPage());
      setMobileNav(false);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!selectedPath && !info) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPath(null);
        setInfo(null);
      }
    };
    const lastFocus = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(".modal-close")?.focus(),
    );
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handler);
      lastFocus?.focus();
    };
  }, [selectedPath, info]);

  function navigate(next: PageId) {
    window.location.hash = next;
    setPage(next);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function toggleTask(id: string) {
    setWorkspace((current) => ({
      ...current,
      completed: current.completed.includes(id)
        ? current.completed.filter((item) => item !== id)
        : [...current.completed, id],
    }));
  }
  function saveProfile(next: Profile) {
    setWorkspace((current) => ({ ...current, profile: next, isDemo: false }));
    navigate("directions");
    setToast("档案已保存，新的方向建议与行动计划已生成。");
  }
  function exportPlan() {
    const lines = [
      "向远 · 我的生涯规划",
      isDemo ? "示例档案，仅用于体验" : `${profile.name || "我的"}档案`,
      `生成日期：${new Date().toLocaleDateString("zh-CN")}`,
      "",
      analysis.summary,
      "",
      "路径适配分仅是基于已填写信息的规则参考，不代表就业或录取概率。",
      ...analysis.paths.flatMap((path) => [
        "",
        `${path.title} · 参考 ${path.score}/100`,
        path.description,
        "依据：",
        ...path.reasons.map((x) => `- ${x}`),
        "待准备：",
        ...path.gaps.map((x) => `- ${x}`),
        "下一步：",
        ...path.nextSteps.map((x) => `- ${x}`),
      ]),
      "",
      "个人与家庭",
      analysis.familyAlignment,
      "",
      "行动计划",
      ...analysis.actions.map(
        (action) =>
          `${completed.includes(action.id) ? "[已完成]" : "[待完成]"} 第${action.week}周 · ${action.title}\n${action.description}`,
      ),
    ];
    const url = URL.createObjectURL(
      new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "向远-生涯规划.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast("规划已导出，可随时回顾和调整。");
  }
  const missingRequired = analysis.resumeChecks.filter(
    (item) => item.required && !item.complete,
  ).length;

  function renderPathCard(path: PathRecommendation, index: number) {
    const meta = pathMeta[path.id];
    const Icon = meta.icon;
    const isRecommended =
      index === 0 && Boolean(profile.school && profile.major && profile.degree);
    return (
      <article
        className={`path-card ${meta.className} ${isRecommended ? "recommended" : ""}`}
        key={path.id}
      >
        <div className="path-card-top">
          <span className={`path-icon ${meta.className}`}>
            <Icon size={22} strokeWidth={1.6} />
          </span>
          <span className="path-english">{meta.english}</span>
          {isRecommended && (
            <span className="recommend-label">
              <Sparkles size={10} />
              优先探索
            </span>
          )}
        </div>
        <div className="path-title-row">
          <h3>{meta.label}</h3>
          <span className="score">
            {path.score}
            <small> / 100</small>
          </span>
        </div>
        <p className="path-tagline">{meta.title}</p>
        <div
          className="score-track"
          aria-label={`规则适配参考 ${path.score}/100`}
        >
          <span style={{ width: `${path.score}%` }} />
        </div>
        <p className="path-reason">{path.reasons[0] || path.description}</p>
        <div className="path-card-bottom">
          <span className="path-chip">{path.tags[0] || "从了解自己开始"}</span>
          <button className="text-button" onClick={() => setSelectedPath(path)}>
            查看路径
            <ArrowUpRight size={16} />
          </button>
        </div>
      </article>
    );
  }

  return (
    <div className="app-shell">
      {mobileNav && (
        <button
          className="sidebar-scrim"
          aria-label="关闭导航"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <a
          href="#overview"
          className="brand"
          onClick={() => navigate("overview")}
          aria-label="向远首页"
        >
          <span className="brand-symbol">
            <Navigation size={25} fill="currentColor" strokeWidth={1.4} />
          </span>
          <span>
            <strong>
              向远<span className="brand-dot">.</span>
            </strong>
            <small>YOUR CAREER COMPASS</small>
          </span>
        </a>
        <div className="sidebar-group-label">
          个人工作台<span>WORKSPACE</span>
        </div>
        <nav aria-label="主导航">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
              aria-current={page === item.id ? "page" : undefined}
            >
              <item.icon size={19} strokeWidth={1.7} />
              <span>{item.name}</span>
              {item.id === "actions" && (
                <span className="nav-count">{pendingCount}</span>
              )}
              {page === item.id && item.id !== "actions" && (
                <span className="active-dot" />
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Leaf size={24} strokeWidth={1.2} />
            <p>
              成长没有标准答案，
              <br />
              你的方向，由你定义。
            </p>
            <span>GROW AT YOUR OWN PACE</span>
          </div>
          <button className="sidebar-help" onClick={() => setInfo("method")}>
            <HelpCircle size={17} />
            了解向远
            <ArrowUpRight size={14} />
          </button>
          <button className="sidebar-user" onClick={() => navigate("profile")}>
            <span className="avatar">{profile.name?.charAt(0) || "我"}</span>
            <span>
              <strong>{profile.name || "我的档案"}</strong>
              <small>
                {isDemo
                  ? "体验中 · 示例档案"
                  : `${profile.degree || "我的"} · 生涯探索者`}
              </small>
            </span>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu icon-button"
              aria-label="打开导航"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={21} />
            </button>
            <span>我的工作台</span>
            <ChevronRight size={14} />
            <strong>{currentNav.name}</strong>
          </div>
          <div className="topbar-right">
            <span className="live-caption">
              <i />
              未来有很多种可能
            </span>
            <button className="privacy-pill" onClick={() => setInfo("privacy")}>
              <LockKeyhole size={13} />
              <span>数据仅存本地</span>
            </button>
            <span className="topbar-divider" />
            <button
              className="icon-button notification-button"
              aria-label="查看动态"
              onClick={() => setInfo("notifications")}
            >
              <Bell size={19} />
              {pendingCount > 0 && <i />}
            </button>
            <button
              className="avatar avatar-small"
              aria-label="编辑我的档案"
              onClick={() => navigate("profile")}
            >
              {profile.name?.charAt(0) || "我"}
            </button>
          </div>
        </header>
        <main className="main-content" id="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">{currentNav.en}</div>
              <h1>
                {page === "overview"
                  ? "把未来，走成自己的方向"
                  : page === "profile"
                    ? "每一面真实的你，都很重要"
                    : page === "directions"
                      ? "让每一个选择，都有据可循"
                      : page === "resume"
                        ? "让你的经历，被更好地看见"
                        : page === "actions"
                          ? "小步向前，也是一种了不起"
                          : "好资源，陪你走得更远"}
                <span className="heading-period">.</span>
              </h1>
              <p>
                {page === "overview"
                  ? "从认识自己开始，把关于未来的想象，变成一步步的行动。"
                  : page === "profile"
                    ? "不用一次想清楚全部，先从你已经知道的事情开始。"
                    : page === "directions"
                      ? "结合你的背景、意愿与经历，发现值得投入的下一步。"
                      : page === "resume"
                        ? "梳理常见招聘信息，把真实的积累变成清晰的表达。"
                        : page === "actions"
                          ? "把远处的目标，拆解成今天就能开始的事情。"
                          : "精选官方平台与实用指南，少一点信息差，多一点确定感。"}
              </p>
            </div>
            {page === "overview" ? (
              <button
                className="button button-white heading-button"
                onClick={() => navigate("profile")}
              >
                <Plus size={16} />
                完善我的档案
              </button>
            ) : page === "directions" ? (
              <button
                className="button button-white heading-button"
                onClick={exportPlan}
              >
                <ArrowDownToLine size={16} />
                导出我的规划
              </button>
            ) : null}
          </div>

          {isDemo && (
            <div className="demo-notice">
              <span>
                <Sparkles size={14} />
                <strong>先看看，未来如何被规划</strong>
                <span className="demo-detail">
                  当前为示例档案，填写自己的信息后，建议将随之更新。
                </span>
              </span>
              <button
                onClick={() => {
                  setWorkspace({
                    profile: { ...emptyProfile },
                    completed: [],
                    isDemo: false,
                  });
                  navigate("profile");
                }}
              >
                创建我的档案
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {page === "overview" && (
            <>
              <section className="intro-grid" aria-label="生涯规划概览">
                <div className="journey-hero">
                  <div className="hero-content">
                    <span className="hero-kicker">
                      <span />
                      每一程，都有新的可能
                    </span>
                    <h2>
                      不必现在就有答案，
                      <br />
                      先找到自己的方向。
                    </h2>
                    <p>
                      把你的经历、热爱与期待，
                      <br />
                      串成一条通往未来的路。
                    </p>
                    <button
                      className="button button-dark"
                      onClick={() => navigate("directions")}
                    >
                      探索我的可能
                      <ArrowUpRight size={17} />
                    </button>
                    <div className="hero-footnote">
                      <Heart size={12} />
                      尊重你的选择，也听见家人的期待
                    </div>
                  </div>
                  <JourneyIllustration />
                </div>
                <div className="profile-snapshot">
                  <div className="card-heading">
                    <h2>我的成长档案</h2>
                    <button
                      className="icon-button"
                      aria-label="查看我的档案"
                      onClick={() => navigate("profile")}
                    >
                      <ArrowUpRight size={19} />
                    </button>
                  </div>
                  <div className="snapshot-progress">
                    <ProgressRing value={analysis.completeness} />
                    <div>
                      <strong>
                        {analysis.completeness >= 85
                          ? "更完整的你，更清晰的路"
                          : "多了解自己一点"}
                      </strong>
                      <p>简历资料完整度</p>
                      <span>
                        {missingRequired > 0
                          ? `还有 ${missingRequired} 项常见必填信息待补充`
                          : "常见必填信息已齐备"}
                      </span>
                    </div>
                  </div>
                  <div className="snapshot-details">
                    <div>
                      <GraduationCap size={15} />
                      <span>教育背景</span>
                      <strong>
                        {profile.degree
                          ? `${profile.degree} · ${profile.major || "专业待补充"}`
                          : "待补充"}
                      </strong>
                    </div>
                    <div>
                      <Target size={15} />
                      <span>兴趣方向</span>
                      <strong>
                        {profile.targetRole ||
                          profile.interests.slice(0, 2).join(" / ") ||
                          "还在探索中"}
                      </strong>
                    </div>
                    <div>
                      <BriefcaseBusiness size={15} />
                      <span>实践积累</span>
                      <strong>
                        {profile.internshipMonths
                          ? `${profile.internshipMonths} 个月实习经历`
                          : "每一份经历都值得记录"}
                      </strong>
                    </div>
                  </div>
                  <button
                    className="snapshot-link"
                    onClick={() => navigate("profile")}
                  >
                    更新档案，让建议更懂你
                    <ArrowRight size={14} />
                  </button>
                </div>
              </section>

              <section className="direction-section">
                <div className="section-heading">
                  <div>
                    <h2>
                      未来，不止一种可能
                      <span className="tiny-label">YOUR POSSIBILITIES</span>
                    </h2>
                    <p>三条成长路径，找到当下更适合你的节奏。</p>
                  </div>
                  <button
                    className="text-button section-link"
                    onClick={() => navigate("directions")}
                  >
                    查看完整分析
                    <ArrowRight size={15} />
                  </button>
                </div>
                <div className="path-grid">
                  {analysis.paths.map(renderPathCard)}
                </div>
                <p className="scoring-note">
                  <HelpCircle size={12} />
                  适配分仅为当前信息下的规则参考，不代表录取或就业概率。
                </p>
              </section>

              <section className="bottom-grid">
                <div className="action-preview">
                  <div className="card-heading">
                    <h2>
                      把想法，变成下一步
                      <span className="task-count">
                        {activeCompleted}/{analysis.actions.length}
                      </span>
                    </h2>
                    <button
                      className="text-button"
                      onClick={() => navigate("actions")}
                    >
                      全部计划
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="action-preview-list">
                    {analysis.actions.slice(0, 3).map((action) => (
                      <div
                        className={`mini-task ${completed.includes(action.id) ? "done" : ""}`}
                        key={action.id}
                      >
                        <button
                          className="task-checkbox"
                          role="checkbox"
                          aria-checked={completed.includes(action.id)}
                          aria-label={`完成：${action.title}`}
                          onClick={() => toggleTask(action.id)}
                        >
                          {completed.includes(action.id) && <Check size={13} />}
                        </button>
                        <div>
                          <strong>{action.title}</strong>
                          <span>
                            {action.category} <i /> 预计{action.duration}
                          </span>
                        </div>
                        <span
                          className={`priority-label priority-${action.priority}`}
                        >
                          {action.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="action-card-footer">
                    <span>
                      <span className="small-green-dot" />
                      {activeCompleted
                        ? `已经完成 ${activeCompleted} 个小目标，继续保持`
                        : "不必一步到位，今天先前进一步"}
                    </span>
                    <Flag size={14} />
                  </div>
                </div>
                <div className="mindset-card">
                  <div className="mindset-top">
                    <span>A NOTE TO YOUR FUTURE SELF</span>
                    <Sparkles size={17} strokeWidth={1.3} />
                  </div>
                  <h2>
                    Your path,
                    <br />
                    <em>your pace.</em>
                  </h2>
                  <p>
                    不必与别人走在同一条路上。
                    <br />
                    找到自己的节奏，就已经在向前。
                  </p>
                  <span className="mindset-bottom">
                    <i />
                    慢慢来，也能走很远
                    <ArrowUpRight size={17} />
                  </span>
                  <svg
                    className="mindset-line"
                    viewBox="0 0 160 180"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M154 174C17 155 166 76 92 71S-3 15 45-5"
                      stroke="#bbc6aa"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M145 185C8 166 155 88 81 82S-14 27 34 7"
                      stroke="#c7cfbb"
                    />
                  </svg>
                </div>
              </section>
              <footer className="page-footer">
                <span>
                  向远 XIANGYUAN <i /> 让未来，有迹可循。
                </span>
                <button onClick={() => setInfo("privacy")}>
                  <LockKeyhole size={12} />
                  你的信息，只属于你
                </button>
              </footer>
            </>
          )}

          {page === "profile" && (
            <ProfileEditor
              key={isDemo ? "demo" : "personal"}
              initial={profile}
              onSave={saveProfile}
              onCancel={() => navigate("overview")}
            />
          )}
          {page === "directions" && (
            <>
              <div className="analysis-summary">
                <div className="summary-icon">
                  <Compass size={26} strokeWidth={1.5} />
                </div>
                <div>
                  <span className="eyebrow">YOUR PERSONAL COMPASS</span>
                  <h2>
                    {profile.name ? `${profile.name}，` : ""}
                    让未来的选择从理解自己开始
                  </h2>
                  <p>{analysis.summary}</p>
                </div>
                <button
                  className="button button-white"
                  onClick={() => navigate("profile")}
                >
                  调整我的信息
                  <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="direction-toolbar">
                <div className="tab-list" aria-label="方向筛选">
                  {[
                    { id: "all", label: "全部路径" },
                    ...Object.entries(pathMeta).map(([id, item]) => ({
                      id,
                      label: item.label,
                    })),
                  ].map((item) => (
                    <button
                      className={directionFilter === item.id ? "selected" : ""}
                      key={item.id}
                      onClick={() =>
                        setDirectionFilter(item.id as typeof directionFilter)
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <span className="rules-badge">
                  <CheckCheck size={14} />
                  建议依据可查看
                </span>
              </div>
              <div className="path-grid expanded-path-grid">
                {analysis.paths
                  .filter(
                    (path) =>
                      directionFilter === "all" || path.id === directionFilter,
                  )
                  .map(renderPathCard)}
              </div>
              <p className="scoring-note">
                <HelpCircle size={12} />
                分数是准备情况与意愿的规则参考，用于比较当前路径，不是就业、录取概率或院校排名。
              </p>
              <section className="career-exploration">
                <div className="section-heading">
                  <div>
                    <h2>从兴趣，到一个具体的方向</h2>
                    <p>依据已填线索挑选探索起点，通过小实验检验真实感受。</p>
                  </div>
                  <span className="rules-badge">
                    <Sparkles size={14} />
                    从体验中找答案
                  </span>
                </div>
                <div className="career-suggestion-grid">
                  {careers.map((career, index) => (
                    <article className="career-suggestion" key={career.id}>
                      <div className="career-suggestion-top">
                        <span>
                          0{index + 1} / {career.category}
                        </span>
                        <span className="career-signal">
                          {career.hasSignals ? "已有线索" : "探索示例"}
                        </span>
                      </div>
                      <h3>{career.title}</h3>
                      <p>{career.reasons[0]}</p>
                      <div className="career-skills">
                        {career.skills.slice(0, 3).map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                      <div className="career-experiment">
                        <span>
                          <Flag size={13} />
                          一个小实验
                        </span>
                        <p>{career.experiment}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <p className="scoring-note">
                  <HelpCircle size={12} />
                  候选方向来自有限的关键词规则，不是职业能力测评，也不排除你探索其他领域。
                </p>
              </section>
              <section className="family-card">
                <div className="family-icon">
                  <Heart size={23} strokeWidth={1.5} />
                </div>
                <div>
                  <span className="eyebrow">YOUR VOICE MATTERS</span>
                  <h2>听见家人的期待，也不丢掉自己的声音</h2>
                  <p>{analysis.familyAlignment}</p>
                  {profile.familyNotes && (
                    <blockquote className="family-note">
                      <span>你记录的家庭期待</span>
                      {profile.familyNotes}
                    </blockquote>
                  )}
                  <div className="family-preferences">
                    <span>
                      个人意愿权重 <strong>{profile.autonomy}%</strong>
                    </span>
                    <span>
                      家庭期待权重 <strong>{100 - profile.autonomy}%</strong>
                    </span>
                  </div>
                </div>
                <button
                  className="text-button"
                  onClick={() => navigate("profile")}
                >
                  调整权重
                  <ArrowUpRight size={15} />
                </button>
              </section>
              <div className="next-step-banner">
                <span>
                  <ListChecks size={22} />
                  <span>
                    <strong>方向之后，是行动。</strong>
                    <small>
                      为你整理了 {analysis.actions.length}{" "}
                      项可以着手的准备事项。
                    </small>
                  </span>
                </span>
                <button
                  className="button button-dark"
                  onClick={() => navigate("actions")}
                >
                  查看我的行动计划
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
          {page === "resume" && (
            <ResumeView
              profile={profile}
              analysis={analysis}
              onEdit={() => navigate("profile")}
            />
          )}
          {page === "actions" && (
            <ActionsView
              actions={analysis.actions}
              completed={completed}
              onToggle={toggleTask}
            />
          )}
          {page === "resources" && <ResourcesView />}
        </main>
      </div>

      {(selectedPath || info) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setSelectedPath(null);
            setInfo(null);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const elements = event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not([disabled]), a[href], input, select, textarea, [tabindex="0"]',
            );
            if (!elements.length) return;
            const first = elements[0],
              last = elements[elements.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }}
        >
          <section
            className={`modal ${selectedPath ? "path-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              aria-label="关闭弹窗"
              onClick={() => {
                setSelectedPath(null);
                setInfo(null);
              }}
            >
              <X size={21} />
            </button>
            {selectedPath ? (
              <>
                <span
                  className={`path-icon ${pathMeta[selectedPath.id].className}`}
                >
                  {(() => {
                    const Icon = pathMeta[selectedPath.id].icon;
                    return <Icon size={25} />;
                  })()}
                </span>
                <div className="eyebrow modal-eyebrow">
                  {pathMeta[selectedPath.id].english}
                </div>
                <h2 id="modal-title">{selectedPath.title}</h2>
                <p className="modal-description">{selectedPath.description}</p>
                <div className="modal-score">
                  <span>规则适配参考</span>
                  <strong>
                    {selectedPath.score}
                    <small>/100</small>
                  </strong>
                  <p>基于你的档案和意愿，并非录取或就业概率。</p>
                </div>
                <div className="modal-list">
                  <h3>
                    <CheckCheck size={17} />
                    为什么值得探索
                  </h3>
                  <ul>
                    {selectedPath.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
                <div className="modal-list">
                  <h3>
                    <Flag size={17} />
                    需要继续准备
                  </h3>
                  <ul>
                    {selectedPath.gaps.length ? (
                      selectedPath.gaps.map((gap) => <li key={gap}>{gap}</li>)
                    ) : (
                      <li>
                        继续核实具体学校或岗位要求，准备结果仍取决于实际申请与招聘流程。
                      </li>
                    )}
                  </ul>
                </div>
                <div className="modal-list">
                  <h3>
                    <Navigation size={17} />
                    下一步可以这样做
                  </h3>
                  <ol>
                    {selectedPath.nextSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                <button
                  className="button button-dark full-button"
                  onClick={() => {
                    setSelectedPath(null);
                    navigate("actions");
                  }}
                >
                  把方向变成行动
                  <ArrowRight size={17} />
                </button>
              </>
            ) : info === "privacy" ? (
              <>
                <span className="modal-icon">
                  <LockKeyhole size={26} />
                </span>
                <h2 id="modal-title">你的信息，只属于你</h2>
                <p className="modal-description">
                  档案与行动进度只保存在当前浏览器的本地存储中。此版本没有账号服务，也不会将档案发送到服务器或
                  AI 服务。
                </p>
                <div className="info-panel">
                  <strong>换设备或清理浏览器会怎样？</strong>
                  <p>
                    本地数据不会跨设备同步，清除浏览器数据后也将丢失。你可以导出规划，保留一份自己的记录。
                  </p>
                  <strong>我们不会询问这些信息</strong>
                  <p>
                    身份证号、婚育状况、民族等信息不参与规划。联系方式只用于你主动生成的文本简历。
                  </p>
                </div>
                <div className="modal-button-row">
                  <button
                    className="button button-white"
                    onClick={() => {
                      setInfo(null);
                      exportPlan();
                    }}
                  >
                    <ArrowDownToLine size={16} />
                    导出规划
                  </button>
                  <button
                    className="button button-danger"
                    onClick={() => setInfo("reset")}
                  >
                    <RotateCcw size={15} />
                    清除我的数据
                  </button>
                </div>
              </>
            ) : info === "reset" ? (
              <>
                <h2 id="modal-title">清除当前浏览器的档案？</h2>
                <p className="modal-description">
                  你的个人资料和行动进度将被清除，网站会恢复为示例模式。此操作无法撤销，请先导出需要保留的规划。
                </p>
                <div className="modal-button-row">
                  <button
                    className="button button-white"
                    onClick={() => setInfo("privacy")}
                  >
                    保留数据
                  </button>
                  <button
                    className="button button-danger"
                    onClick={() => {
                      setWorkspace({
                        profile: { ...demoProfile },
                        completed: [],
                        isDemo: true,
                      });
                      setInfo(null);
                      navigate("overview");
                      setToast("个人档案和行动进度已清除，现为示例模式。");
                    }}
                  >
                    确认清除
                  </button>
                </div>
              </>
            ) : info === "notifications" ? (
              <>
                <span className="modal-icon">
                  <Bell size={25} />
                </span>
                <h2 id="modal-title">每一步，都值得被看见</h2>
                <p className="modal-description">
                  这里记录你当前的准备状态，不会发送外部通知。
                </p>
                <div className="notification-item">
                  <FileCheck2 size={20} />
                  <div>
                    <strong>资料完整度 {analysis.completeness}%</strong>
                    <p>
                      {missingRequired
                        ? `补充 ${missingRequired} 项常见必填信息，让简历准备更从容。`
                        : "常见必填信息已经齐备，可以继续打磨经历与成果。"}
                    </p>
                  </div>
                </div>
                <div className="notification-item">
                  <ListChecks size={20} />
                  <div>
                    <strong>{pendingCount} 项行动，等你开启</strong>
                    <p>
                      已完成 {activeCompleted} 项。按自己的节奏，慢慢靠近目标。
                    </p>
                  </div>
                </div>
                <button
                  className="button button-dark full-button"
                  onClick={() => {
                    setInfo(null);
                    navigate("actions");
                  }}
                >
                  去看看行动计划
                  <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="modal-icon">
                  <Navigation size={26} />
                </span>
                <h2 id="modal-title">向远，让未来有迹可循</h2>
                <p className="modal-description">
                  一个为高校学生与应届生设计的开源生涯规划工具。我们相信，好的规划始于真实地认识自己。
                </p>
                <div className="info-panel">
                  <strong>建议从哪里来？</strong>
                  <p>
                    当前版本使用可解释的本地规则，结合教育、技能、经历、预算及个人与家庭意愿比较三条路径。没有接入
                    AI、实时招聘库或招生数据库。
                  </p>
                  <strong>你始终拥有决定权</strong>
                  <p>
                    分数只用于辅助梳理，不是成功概率。具体招聘、申请资格、费用和截止时间，请以公司与学校官方说明为准。
                  </p>
                  <strong>开放，也尊重隐私</strong>
                  <p>
                    项目采用 MIT 许可证，欢迎一起完善。档案只存在你的浏览器中。
                  </p>
                  <a
                    href="https://github.com/h4jt49ybz2-stack/career-planning-website"
                    target="_blank"
                    rel="noreferrer"
                    className="text-button"
                  >
                    查看 GitHub 开源项目
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              </>
            )}
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
