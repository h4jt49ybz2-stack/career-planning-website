import type {
  ActionItem,
  PathId,
  PathRecommendation,
  PlanAnalysis,
  Profile,
  ResumeCheck,
} from "../types";

/** All scores describe the supplied information, never an offer or admission probability. */
export const emptyProfile: Profile = {
  name: "",
  email: "",
  phone: "",
  city: "",
  school: "",
  major: "",
  degree: "",
  educationStart: "",
  graduation: "",
  gpa: "",
  english: "",
  goal: "explore",
  targetRole: "",
  interests: [],
  skills: [],
  preferredCities: [],
  expectedSalary: "",
  personalPriority: "growth",
  budget: 0,
  familyPreference: "open",
  familyNotes: "",
  autonomy: 80,
  internshipCompany: "",
  internshipRole: "",
  internshipMonths: 0,
  internshipAchievement: "",
  projectName: "",
  projectDescription: "",
  portfolioUrl: "",
  availability: "",
  jobType: "均可",
};

const hasText = (value: string) => value.trim().length > 0;
const hasItems = (items: string[]) => items.some(hasText);
const boundedNumber = (
  value: number,
  min: number,
  max: number,
  fallback = min,
) => (Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback);

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return false;
  const [local, domain] = trimmed.split("@");
  if (
    local.length > 64 ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..")
  )
    return false;
  const labels = domain.split(".");
  return (
    labels.every((label) =>
      /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label),
    ) && !/^\d+$/.test(labels.at(-1)!)
  );
}

export function isValidPhone(value: string): boolean {
  if (!/^[+\d\s()-]+$/.test(value)) return false;
  const normalized = value.replace(/[\s()-]/g, "");
  if (!/^\+?\d{7,15}$/.test(normalized)) return false;
  const digits = normalized.replace(/^\+/, "");
  if (/^(\d)\1+$/.test(digits)) return false;
  if (normalized.startsWith("+")) return !digits.startsWith("0");
  // Mainland mobile numbers; also permit a landline with an area code.
  return /^1[3-9]\d{9}$/.test(digits) || /^0\d{9,11}$/.test(digits);
}

const isMonth = (value: string) => /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(value);
const hasEducationDates = (p: Profile) =>
  isMonth(p.educationStart) &&
  isMonth(p.graduation) &&
  p.educationStart < p.graduation;
const hasEducation = (p: Profile) =>
  hasText(p.school) && hasText(p.major) && hasText(p.degree);
const hasInternship = (p: Profile) =>
  hasText(p.internshipCompany) &&
  hasText(p.internshipRole) &&
  Number.isFinite(p.internshipMonths) &&
  p.internshipMonths > 0;
const hasProject = (p: Profile) =>
  hasText(p.projectName) && hasText(p.projectDescription);
const hasAcademicInfo = (p: Profile) => hasText(p.gpa) && /\d/.test(p.gpa);
const hasLanguageInfo = (p: Profile) => hasText(p.english);
const hasPortfolio = (value: string) => {
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

function resumeChecks(p: Profile): ResumeCheck[] {
  return [
    {
      id: "name",
      label: "姓名",
      complete: hasText(p.name),
      required: true,
      tip: "用于招聘方识别你的投递，请填写可联系到本人的姓名。",
    },
    {
      id: "email",
      label: "联系邮箱",
      complete: isValidEmail(p.email),
      required: true,
      tip: "填写格式正确、常用且能接收面试通知的邮箱。",
    },
    {
      id: "phone",
      label: "联系电话",
      complete: isValidPhone(p.phone),
      required: true,
      tip: "填写有效手机号、含区号的座机或带 + 国家代码的国际号码。",
    },
    {
      id: "education",
      label: "院校、学历与专业",
      complete: hasEducation(p),
      required: true,
      tip: "补齐院校、学历层次和专业，按真实在读或已获学历填写。",
    },
    {
      id: "educationDates",
      label: "入学与预计毕业时间",
      complete: hasEducationDates(p),
      required: true,
      tip: "入学、毕业年月应完整，毕业时间应晚于入学时间。应届生注明预计毕业。",
    },
    {
      id: "role",
      label: "目标岗位与求职类型",
      complete: hasText(p.targetRole) && hasText(p.jobType),
      required: true,
      tip: "明确一个目标岗位，并说明申请实习还是全职。",
    },
    {
      id: "cities",
      label: "所在城市与意向城市",
      complete: hasText(p.city) && hasItems(p.preferredCities),
      required: true,
      tip: "补充当前所在地与可接受的工作城市，便于核对办公地点。",
    },
    {
      id: "availability",
      label: "可到岗时间",
      complete: hasText(p.availability),
      required: true,
      tip: "写明预计可到岗时间；实习可同时写每周天数和持续月份。",
    },
    {
      id: "skills",
      label: "岗位相关技能",
      complete: hasItems(p.skills),
      required: false,
      tip: "对照目标岗位要求写技能和熟练程度，避免堆砌无法举证的关键词。",
    },
    {
      id: "internship",
      label: "实习经历",
      complete: hasInternship(p),
      required: false,
      tip: "有实习时补齐单位、岗位和时长；暂无实习可用课程项目或社团实践替代。",
    },
    {
      id: "achievement",
      label: "实践成果",
      complete: hasText(p.internshipAchievement) || hasProject(p),
      required: false,
      tip: "写清背景、你的行动与成果。数字须可核实，无数字时写具体交付物。",
    },
    {
      id: "project",
      label: "项目或作品",
      complete: hasProject(p),
      required: false,
      tip: "补充项目名称、职责和交付物。作品和项目对技能型岗位尤其有帮助。",
    },
    {
      id: "portfolio",
      label: "作品集链接",
      complete: hasPortfolio(p.portfolioUrl),
      required: false,
      tip: "如有作品集，可填写可访问的 http 或 https 链接；并非所有岗位都要求。",
    },
  ];
}

function preferenceBonus(p: Profile, id: PathId): number {
  const personalWeight =
    boundedNumber(p.autonomy, 0, 100, emptyProfile.autonomy) / 100;
  const personal = p.goal === id ? 24 * personalWeight : 0;
  const family = p.familyPreference === id ? 24 * (1 - personalWeight) : 0;
  return personal + family;
}

const pathNames: Record<PathId, string> = {
  work: "就业发展",
  domestic: "国内升学",
  overseas: "海外升学",
};

function makePaths(p: Profile): PathRecommendation[] {
  const education = hasEducation(p);
  const academic = hasAcademicInfo(p);
  const language = hasLanguageInfo(p);
  const internship = hasInternship(p);
  const project = hasProject(p);
  const interests = hasItems(p.interests);
  const skills = hasItems(p.skills);
  const budget = boundedNumber(p.budget, 0, Number.MAX_SAFE_INTEGER);
  const common = (education ? 12 : 0) + (interests ? 5 : 0);

  const workReasons = [
    ...(hasText(p.targetRole)
      ? [`你已把「${p.targetRole.trim()}」列为目标岗位，可据此反推能力要求。`]
      : []),
    ...(internship
      ? [
          `已有 ${p.internshipMonths} 个月「${p.internshipRole.trim()}」实习，可用来证明实践能力。`,
        ]
      : []),
    ...(skills
      ? [
          `已列出 ${p.skills.filter(hasText).length} 项技能，适合结合招聘描述逐项验证。`,
        ]
      : []),
    ...(p.goal === "work" ? ["你的个人意愿倾向先就业，已纳入参考分。"] : []),
  ];
  const workGaps = [
    ...(!education ? ["教育信息尚不完整，参考分暂按资料不足处理。"] : []),
    ...(!hasText(p.targetRole) ? ["尚未明确目标岗位，先选 1–2 个方向。"] : []),
    ...(!skills ? ["还未填写岗位相关技能。"] : []),
    ...(!internship && !project ? ["还缺少可以展示的实习或项目证据。"] : []),
    ...(internship && !hasText(p.internshipAchievement)
      ? ["实习经历尚未说明你的行动和成果。"]
      : []),
    ...(!isValidEmail(p.email) || !isValidPhone(p.phone)
      ? ["投递前需补齐有效联系方式。"]
      : []),
  ];
  const domesticReasons = [
    ...(education
      ? [`已填写「${p.major.trim()}」教育背景，可开始核对目标专业的报考条件。`]
      : []),
    ...(academic ? ["已记录成绩信息，可进一步与目标项目的官方要求对照。"] : []),
    ...(project ? ["已有项目经历，可整理为研究兴趣或专业能力的说明。"] : []),
    ...(p.goal === "domestic" ? ["你希望继续国内升学，已纳入个人意愿。"] : []),
    ...(p.familyPreference === "domestic"
      ? ["家庭倾向国内升学，可围绕时间安排与支持方式进一步沟通。"]
      : []),
  ];
  const domesticGaps = [
    ...(!education ? ["需要先补齐院校、学历和专业。"] : []),
    ...(!academic ? ["尚未填写 GPA 或均分，无法评估成绩材料准备情况。"] : []),
    ...(!hasEducationDates(p)
      ? ["补充有效的入学与毕业年月，以核对报考年份与应届身份。"]
      : []),
    "尚需依据当年官方简章核对报考资格、考试科目和截止日期。",
  ];
  const overseasReasons = [
    ...(education ? ["已有基础教育信息，可开始整理成绩单和学位材料。"] : []),
    ...(language
      ? ["已记录语言情况；是否符合要求仍需按考试类型、分数和有效期核对。"]
      : []),
    ...(budget >= 15
      ? [`你填写的预算为 ${budget} 万元，可结合地区与学制比较总费用。`]
      : []),
    ...(p.goal === "overseas"
      ? ["你的个人意愿倾向海外升学，已纳入参考分。"]
      : []),
  ];
  const overseasGaps = [
    ...(!education ? ["需要先补齐院校、学历和专业，当前参考信息不足。"] : []),
    ...(!academic ? ["需要补充 GPA 或均分及计分制。"] : []),
    ...(!language ? ["需要补充语言成绩或制定备考计划。"] : []),
    ...(budget <= 0
      ? ["预算未填写或为 0，需先核实资金来源与可行性。"]
      : budget < 15
        ? ["预算较紧，需优先核实低学费项目、生活费与奖学金条件。"]
        : []),
    "需逐个核对目标项目的先修课、语言、材料、费用和签证要求。",
  ];

  const paths: PathRecommendation[] = [
    {
      id: "work",
      title: "就业发展",
      subtitle: "把能力变成职业的起点",
      score:
        8 +
        common +
        (skills ? 9 : 0) +
        (internship ? 15 + Math.min(8, p.internshipMonths * 2) : 0) +
        (project ? 9 : 0) +
        (hasText(p.targetRole) ? 8 : 0) +
        (hasItems(p.preferredCities) ? 4 : 0) +
        preferenceBonus(p, "work"),
      description: "从目标岗位出发，用实习、项目和可验证的成果搭建求职竞争力。",
      reasons: workReasons.length
        ? workReasons
        : ["先补充兴趣、技能和实践信息，再判断适合的求职方向。"],
      gaps: workGaps,
      nextSteps: [
        "收集 5 份同类岗位描述，整理共同要求。",
        "选一个经历，用“情境—行动—结果”写成简历素材。",
        "筛选真实在招岗位，核对工作地点、毕业年份和到岗要求。",
      ],
      tags: ["实践积累", "岗位探索", "职业成长"],
    },
    {
      id: "domestic",
      title: "国内升学",
      subtitle: "为感兴趣的领域，再向前一步",
      score:
        8 +
        common +
        (academic ? 12 : 0) +
        (language ? 5 : 0) +
        (project ? 8 : 0) +
        preferenceBonus(p, "domestic"),
      description:
        "围绕专业兴趣比较深造的必要性，并核实报考资格、备考时间和机会成本。",
      reasons: domesticReasons.length
        ? domesticReasons
        : ["先填写教育背景与成绩，再比较继续深造的路径。"],
      gaps: domesticGaps,
      nextSteps: [
        "明确希望深造的专业，区分学术与职业目标。",
        "在院校官网或研招网核对当年招生简章与报名条件。",
        "用一周试学检验备考节奏，再安排长期计划。",
      ],
      tags: ["专业深耕", "资格核对", "长期投入"],
    },
    {
      id: "overseas",
      title: "海外升学",
      subtitle: "换一个视角，拓展未来的边界",
      score:
        5 +
        common +
        (academic ? 10 : 0) +
        (language ? 8 : 0) +
        (project ? 5 : 0) +
        (budget >= 30 ? 18 : budget >= 15 ? 10 : budget > 0 ? 3 : 0) +
        preferenceBonus(p, "overseas"),
      description: "一起比较专业、语言准备和总预算，制定适合你的申请方案。",
      reasons: overseasReasons.length
        ? overseasReasons
        : ["尚缺教育、语言或预算信息，先建立申请的基本条件清单。"],
      gaps: overseasGaps,
      nextSteps: [
        "按专业兴趣与总预算，初选 3–5 个项目。",
        "逐个查阅项目官方页面，记录先修课、语言要求和截止日期。",
        "核算学费、生活费、保险与申请费用，并保留资金余量。",
      ],
      tags: ["国际视野", "语言准备", "费用规划"],
    },
  ];
  // Missing foundational education details must not look like a confident recommendation.
  const scoreCeiling = education ? 95 : 40;
  return paths
    .map((path) => ({
      ...path,
      score: Math.round(boundedNumber(path.score, 0, scoreCeiling)),
    }))
    .sort((a, b) => b.score - a.score);
}

function makeActions(
  p: Profile,
  topPath: PathId,
  checks: ResumeCheck[],
): ActionItem[] {
  const actions: ActionItem[] = [];
  const missing = checks.filter((check) => check.required && !check.complete);
  if (missing.length)
    actions.push({
      id: "complete-profile",
      title: "补齐求职基础信息",
      description: `优先补充${missing
        .slice(0, 3)
        .map((check) => check.label)
        .join("、")}${missing.length > 3 ? "等信息" : ""}，避免投递材料缺项。`,
      category: "求职准备",
      priority: "优先",
      duration: "20 分钟",
      week: 1,
    });
  actions.push({
    id: "compare-directions",
    title: "做一次方向小实验",
    description:
      "选两个感兴趣的方向，各看 3 个岗位或培养方案，记录最想做与不想做的事情。",
    category: "方向探索",
    priority: "重要",
    duration: "45 分钟",
    week: 1,
  });
  if (!hasProject(p) || !hasText(p.internshipAchievement))
    actions.push({
      id: "experience-evidence",
      title: "把经历写成可展示的成果",
      description:
        "从实习、课程或社团中选一个经历，写清你的职责、行动和真实产出；没有经历时先做一个小项目。",
      category: "求职准备",
      priority: "重要",
      duration: "60 分钟",
      week: 1,
    });
  if (p.familyPreference !== "open")
    actions.push({
      id: "family-conversation",
      title: "和家人聊一次具体的未来",
      description: `把个人意愿与家庭对${pathNames[p.familyPreference]}的期待分别列出，讨论费用、城市和时间边界。最终决定由你做出。`,
      category: "沟通计划",
      priority: "建议",
      duration: "30 分钟",
      week: 1,
    });
  if (topPath === "work" || p.goal === "explore")
    actions.push({
      id: "job-research",
      title: "拆解 5 份目标岗位描述",
      description: `搜索${hasText(p.targetRole) ? p.targetRole : "感兴趣的岗位"}，对照常见技能、学历与到岗要求，形成自己的能力差距清单。`,
      category: "求职准备",
      priority: "重要",
      duration: "60 分钟",
      week: 2,
    });
  if (
    topPath === "domestic" ||
    p.goal === "domestic" ||
    p.familyPreference === "domestic"
  )
    actions.push({
      id: "domestic-research",
      title: "建立国内升学项目清单",
      description:
        "选择 3 个项目，仅依据当年官方简章记录报考资格、科目、费用与时间；资格未确认时标记待核实。",
      category: "升学准备",
      priority: "重要",
      duration: "90 分钟",
      week: 2,
    });
  if (topPath === "overseas" || p.goal === "overseas")
    actions.push({
      id: "overseas-budget",
      title: "核算申请的完整预算",
      description:
        "为 3 个项目列出学费、生活费、保险、申请费和语言考试费，核对汇率并预留余量。",
      category: "升学准备",
      priority: "重要",
      duration: "60 分钟",
      week: 2,
    });
  actions.push({
    id: "practical-project",
    title: "完成一个方向验证项目",
    description:
      "给自己两周做一个小型作品或研究阅读记录，用真实体验检验这个方向是否适合。",
    category: "方向探索",
    priority: "重要",
    duration: "2 周",
    week: 3,
  });
  actions.push({
    id: "review-plan",
    title: "复盘一次，调整下一步",
    description:
      "记录新发现、完成的行动和仍不确定的问题，更新档案后重新比较三条路径。",
    category: "方向探索",
    priority: "建议",
    duration: "30 分钟",
    week: 4,
  });
  return actions;
}

export function analyzeProfile(profile: Profile): PlanAnalysis {
  const checks = resumeChecks(profile);
  const required = checks.filter((check) => check.required);
  const completeness = Math.round(
    (required.filter((check) => check.complete).length / required.length) * 100,
  );
  const paths = makePaths(profile);
  const personalName =
    profile.goal === "explore" ? "尚在探索" : pathNames[profile.goal];
  const weight = boundedNumber(profile.autonomy, 0, 100, emptyProfile.autonomy);
  let familyAlignment =
    profile.familyPreference === "open"
      ? "尚未设置明确的家庭倾向。可以先整理个人偏好，再和家人讨论期待与所需支持。"
      : profile.goal === profile.familyPreference
        ? `你和家人都倾向${pathNames[profile.familyPreference]}。下一步把共识变成具体的时间与预算安排。`
        : `你的意愿是「${personalName}」，家人倾向${pathNames[profile.familyPreference]}。当前个人意愿权重 ${weight}%，家庭意见 ${100 - weight}%；可把分歧拆成费用、城市和时间分别讨论。`;
  if (
    !hasEducation(profile) &&
    !hasItems(profile.interests) &&
    !hasItems(profile.skills)
  ) {
    familyAlignment += " 当前资料较少，先完善档案，暂不据此决定人生方向。";
  }
  const enoughInfo =
    hasEducation(profile) &&
    (hasItems(profile.interests) ||
      hasItems(profile.skills) ||
      profile.goal !== "explore");
  return {
    paths,
    actions: makeActions(profile, paths[0].id, checks),
    resumeChecks: checks,
    completeness,
    familyAlignment,
    focusRole: hasText(profile.targetRole)
      ? profile.targetRole.trim()
      : "探索你的职业方向",
    summary: enoughInfo
      ? `根据你填写的教育、意愿与实践信息，可优先探索「${paths[0].title}」，同时保留其他选择。参考分反映当前资料与准备情况，不代表录取或就业概率。`
      : "先补充教育背景、个人兴趣和实践经历，我们再一起比较未来方向。资料不足时，参考分不能用于确定适合的路径。",
  };
}
