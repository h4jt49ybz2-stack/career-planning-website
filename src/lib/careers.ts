import type { Profile } from "../types";

export interface CareerSuggestion {
  id: string;
  title: string;
  category: string;
  reasons: string[];
  skills: string[];
  experiment: string;
  hasSignals: boolean;
}

type SignalKind =
  | "major"
  | "interests"
  | "skills"
  | "internshipRole"
  | "targetRole";
type CareerDefinition = Omit<CareerSuggestion, "reasons" | "hasSignals"> & {
  keywords: Record<SignalKind, string[]>;
};

const definitions: CareerDefinition[] = [
  {
    id: "data-analysis",
    title: "数据分析",
    category: "数据与商业",
    skills: ["SQL 与数据清洗", "统计思维", "数据可视化", "业务问题表达"],
    experiment:
      "找一份公开样例数据，提出一个问题，用表格或 SQL 完成分析，做一页结论与局限说明。",
    keywords: {
      major: ["统计", "数学", "信息管理", "经济", "金融", "计量", "运筹"],
      interests: ["数据", "分析", "商业研究", "可视化", "商业分析"],
      skills: [
        "SQL",
        "Python",
        "R",
        "Excel",
        "Power BI",
        "PowerBI",
        "Tableau",
        "统计",
        "数据可视化",
      ],
      internshipRole: ["数据", "分析", "商业分析"],
      targetRole: ["数据", "分析", "商业分析"],
    },
  },
  {
    id: "product-planning",
    title: "产品策划 / 产品助理",
    category: "产品与商业",
    skills: ["需求分析", "用户访谈", "原型表达", "方案取舍"],
    experiment:
      "选一个每天使用的产品，访谈 3 位用户，围绕一个具体痛点画出改进草图并说明取舍。",
    keywords: {
      major: ["信息管理", "工商管理", "工业工程", "交互", "心理学"],
      interests: ["产品", "用户体验", "商业研究", "需求", "商业"],
      skills: ["需求分析", "Axure", "Figma", "原型", "竞品", "用户研究"],
      internshipRole: ["产品", "需求分析", "用户研究"],
      targetRole: ["产品", "需求分析", "用户研究"],
    },
  },
  {
    id: "software-development",
    title: "软件开发",
    category: "技术与工程",
    skills: ["编程与调试", "Git 版本管理", "自动化测试", "技术文档"],
    experiment:
      "做一个能解决自己小需求的工具，完成一个功能、一个测试和一份说明，再请同学试用。",
    keywords: {
      major: ["软件", "计算机", "网络工程", "人工智能", "电子信息", "自动化"],
      interests: ["编程", "开发", "人工智能", "开源", "计算机", "程序"],
      skills: [
        "JavaScript",
        "TypeScript",
        "Python",
        "Java",
        "C++",
        "C#",
        "Rust",
        "Go",
        "React",
        "Vue",
        "Node.js",
        "编程",
      ],
      internshipRole: ["开发", "程序", "软件测试", "技术研发"],
      targetRole: ["开发", "程序", "软件工程", "前端", "后端", "软件测试"],
    },
  },
  {
    id: "content-operations",
    title: "用户运营 / 内容策划",
    category: "市场与内容",
    skills: ["内容表达", "用户洞察", "活动执行", "运营数据复盘"],
    experiment:
      "围绕一个熟悉的话题做 3 篇内容或一次小活动，记录真实反馈，写出下次会如何改进。",
    keywords: {
      major: [
        "新媒体",
        "传播",
        "新闻",
        "市场营销",
        "广告",
        "汉语言",
        "社会学",
        "旅游管理",
      ],
      interests: [
        "写作",
        "传播",
        "营销",
        "内容",
        "社区",
        "运营",
        "用户增长",
        "活动",
      ],
      skills: ["写作", "文案", "编辑", "新媒体", "SEO", "沟通表达", "社群运营"],
      internshipRole: ["运营", "市场", "编辑", "社群", "品牌", "营销"],
      targetRole: ["运营", "市场", "编辑", "社群", "品牌", "营销", "内容"],
    },
  },
  {
    id: "design",
    title: "视觉 / 交互设计",
    category: "创意与体验",
    skills: ["视觉表达", "Figma 等设计工具", "交互逻辑", "作品集叙事"],
    experiment:
      "选择一个具体使用场景，画出两套界面或视觉方案，请 3 位同学完成任务并记录体验差异。",
    keywords: {
      major: ["视觉", "数字媒体", "设计", "美术", "建筑"],
      interests: ["视觉", "创意", "设计", "美学", "用户体验", "插画"],
      skills: [
        "Figma",
        "Photoshop",
        "Illustrator",
        "Sketch",
        "Adobe",
        "原型",
        "设计",
        "UI",
        "UX",
        "插画",
      ],
      internshipRole: ["设计", "视觉", "交互", "插画"],
      targetRole: ["设计", "视觉", "交互", "插画", "UI", "UX"],
    },
  },
  {
    id: "professional-research",
    title: "专业研究 / 科研助理",
    category: "研究与学术",
    skills: ["文献检索", "研究问题拆解", "研究方法", "论证与写作"],
    experiment:
      "选一个专业问题，阅读 3 篇入门文献，写一页问题、已有发现和未知之处，再向老师请教。",
    keywords: {
      major: [
        "生物",
        "化学",
        "物理",
        "基础医学",
        "材料",
        "哲学",
        "历史",
        "社会学",
        "心理学",
        "教育",
        "数学",
        "统计",
      ],
      interests: ["科研", "研究", "学术", "实验", "读博", "文献", "教育研究"],
      skills: [
        "实验设计",
        "文献检索",
        "统计分析",
        "R",
        "SPSS",
        "论文写作",
        "LaTeX",
      ],
      internshipRole: ["实验", "科研", "研究", "课题"],
      targetRole: ["科研", "研究", "实验", "课题"],
    },
  },
];

const signalNames: Record<SignalKind, string> = {
  major: "专业",
  interests: "兴趣",
  skills: "技能",
  internshipRole: "实习岗位",
  targetRole: "目标方向",
};
const weights: Record<SignalKind, number> = {
  major: 2,
  interests: 4,
  skills: 4,
  internshipRole: 3,
  targetRole: 5,
};
const normalize = (value: string) =>
  value.normalize("NFKC").trim().toLowerCase();

function matches(value: string, keyword: string): boolean {
  const normalized = normalize(value);
  const token = normalize(keyword);
  if (!token || !normalized) return false;
  // Avoid matching R inside "React", Java inside "JavaScript", or Go inside "Google".
  if (/^[a-z0-9 +.#-]+$/.test(token)) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "i").test(
      normalized,
    );
  }
  return normalized.includes(token);
}

/**
 * Keyword-based starting points, not an aptitude assessment or employment forecast.
 * University name, degree, family wishes, GPA and language scores never filter careers.
 */
export function recommendCareers(profile: Profile): CareerSuggestion[] {
  const input: Record<SignalKind, string[]> = {
    major: [profile.major],
    interests: profile.interests,
    skills: profile.skills,
    internshipRole: [profile.internshipRole],
    targetRole: [profile.targetRole],
  };
  const ranked = definitions
    .map((definition, order) => {
      const evidence: { reason: string; weight: number }[] = [];
      for (const kind of Object.keys(input) as SignalKind[]) {
        // A long list in one field cannot overwhelm signals from several sources.
        const hits = input[kind]
          .filter((value) =>
            definition.keywords[kind].some((keyword) =>
              matches(value, keyword),
            ),
          )
          .slice(0, 2);
        for (const value of hits) {
          evidence.push({
            reason: `你填写的${signalNames[kind]}「${value.trim()}」提供了探索${definition.title}的线索。`,
            weight: weights[kind],
          });
        }
      }
      const { keywords: _keywords, ...suggestion } = definition;
      return {
        suggestion: {
          ...suggestion,
          reasons: evidence
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 3)
            .map((item) => item.reason),
          hasSignals: evidence.length > 0,
        },
        score: evidence.reduce((sum, item) => sum + item.weight, 0),
        order,
      };
    })
    .filter((item) => item.suggestion.hasSignals)
    .sort((a, b) => b.score - a.score || a.order - b.order);

  if (ranked.length) return ranked.slice(0, 3).map((item) => item.suggestion);

  return ["data-analysis", "content-operations", "professional-research"].map(
    (id) => {
      const definition = definitions.find((item) => item.id === id)!;
      const { keywords: _keywords, ...suggestion } = definition;
      return {
        ...suggestion,
        reasons: [
          "目前还没有足够的职业线索。这是跨领域探索示例，并非根据你的个人能力作出的推荐。",
        ],
        hasSignals: false,
      };
    },
  );
}
