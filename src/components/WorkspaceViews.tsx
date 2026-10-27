import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  Copy,
  FileText,
  GraduationCap,
  ListChecks,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { ActionItem, PlanAnalysis, Profile } from "../types";
import "./WorkspaceViews.css";

const textOrMissing = (value: string) => value.trim() || "待补充";

function buildResume(profile: Profile) {
  return [
    `${textOrMissing(profile.name)} · 个人简历`,
    "",
    "基本信息",
    `邮箱：${textOrMissing(profile.email)}`,
    `电话：${textOrMissing(profile.phone)}`,
    `所在城市：${textOrMissing(profile.city)}`,
    "",
    "求职意向",
    `目标岗位：${textOrMissing(profile.targetRole)}`,
    `求职类型：${profile.jobType}`,
    `意向城市：${profile.preferredCities.join("、") || "待补充"}`,
    `预计到岗：${textOrMissing(profile.availability)}`,
    `期望薪资：${textOrMissing(profile.expectedSalary)}`,
    "",
    "教育背景",
    `学校：${textOrMissing(profile.school)}`,
    `专业：${textOrMissing(profile.major)}`,
    `学历：${profile.degree || "待补充"}`,
    `就读时间：${textOrMissing(profile.educationStart)} — ${textOrMissing(profile.graduation)}`,
    `学业成绩：${textOrMissing(profile.gpa)}`,
    `语言能力：${textOrMissing(profile.english)}`,
    "",
    "实习经历",
    profile.internshipCompany || profile.internshipRole
      ? `${textOrMissing(profile.internshipCompany)} · ${textOrMissing(profile.internshipRole)}`
      : "待补充真实实习经历；暂无经历可删除本节。",
    profile.internshipMonths > 0
      ? `实习时长：${profile.internshipMonths} 个月`
      : "实习时长：待补充",
    `工作内容与成果：${textOrMissing(profile.internshipAchievement)}`,
    "",
    "项目经历",
    `项目名称：${textOrMissing(profile.projectName)}`,
    `项目内容与个人贡献：${textOrMissing(profile.projectDescription)}`,
    "",
    "专业技能",
    profile.skills.join("、") || "待补充",
    `作品链接：${textOrMissing(profile.portfolioUrl)}`,
  ].join("\n");
}

export function ResumeView({
  profile,
  analysis,
  onEdit,
}: {
  profile: Profile;
  analysis: PlanAnalysis;
  onEdit: () => void;
}) {
  const [copyStatus, setCopyStatus] = useState("");
  const resumeText = useMemo(() => buildResume(profile), [profile]);
  const requiredChecks = analysis.resumeChecks.filter(
    (check) => check.required,
  );
  const missingRequired = requiredChecks.filter(
    (check) => !check.complete,
  ).length;

  useEffect(() => {
    setCopyStatus("");
  }, [resumeText]);

  async function copyResume() {
    try {
      await navigator.clipboard.writeText(resumeText);
      setCopyStatus("已复制简历文本，请核对后使用。");
    } catch {
      setCopyStatus("当前浏览器不支持复制，请使用「下载文本」保存简历。");
    }
  }

  function downloadResume() {
    const url = URL.createObjectURL(
      new Blob([resumeText], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(profile.name.trim() || "我的").replace(/[\\/:*?"<>|]/g, "_")}-简历.txt`;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="wv-page">
      <div className="wv-resume-overview">
        <div
          className="wv-progress-circle"
          style={
            { "--wv-progress": `${analysis.completeness}%` } as CSSProperties
          }
        >
          <div>
            <strong>
              {analysis.completeness}
              <small>%</small>
            </strong>
            <span>资料完整度</span>
          </div>
        </div>
        <div className="wv-resume-summary">
          <span className="wv-pill">
            <FileText size={13} /> 简历准备度
          </span>
          <h3>
            {missingRequired
              ? `还有 ${missingRequired} 项基础信息值得优先补齐`
              : "基础信息已备齐，继续打磨你的经历表达"}
          </h3>
          <p>
            这是资料完整度检查，不代表简历通过率。具体必填字段以招聘方和岗位要求为准。
          </p>
          <div className="wv-private-note">
            <ShieldCheck size={13} />
            <span>家庭意愿与规划偏好不会写入导出简历</span>
          </div>
        </div>
        <div className="wv-overview-actions">
          <button className="wv-primary" type="button" onClick={onEdit}>
            完善我的档案 <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      <div className="wv-resume-layout">
        <section className="wv-panel">
          <div className="wv-panel-heading">
            <div>
              <h3>投递前检查清单</h3>
              <p>根据已填写的档案逐项核对</p>
            </div>
            <ListChecks size={20} />
          </div>
          <div className="wv-checklist">
            {analysis.resumeChecks.map((check) => (
              <div
                className={`wv-check-row ${check.complete ? "is-complete" : ""}`}
                key={check.id}
              >
                <span className="wv-check-mark">
                  {check.complete ? <Check size={13} /> : <span />}
                </span>
                <div>
                  <div className="wv-check-label">
                    {check.label}
                    <span
                      className={check.required ? "wv-required" : "wv-optional"}
                    >
                      {check.required ? "基础项" : "加分项"}
                    </span>
                  </div>
                  <p>{check.tip}</p>
                </div>
                <span className="wv-check-status">
                  {check.complete ? "已填写" : "待完善"}
                </span>
              </div>
            ))}
          </div>
          <div className="wv-note">
            无需填写身份证号、婚育信息等敏感资料。简历只保留与岗位相关、真实且可核实的信息。
          </div>
        </section>

        <section className="wv-panel wv-resume-panel">
          <div className="wv-panel-heading">
            <div>
              <h3>你的简历底稿</h3>
              <p>基于档案生成，可复制后继续编辑</p>
            </div>
            <span className="wv-pill wv-pill-muted">文本版</span>
          </div>
          <div className="wv-resume-paper">
            <h3>{profile.name.trim() || "你的姓名"}</h3>
            <p className="wv-resume-role">
              {profile.targetRole.trim() || "求职意向待补充"} <span>·</span>{" "}
              {profile.jobType}
            </p>
            <div className="wv-resume-contact">
              <span>{textOrMissing(profile.email)}</span>
              <span>{textOrMissing(profile.phone)}</span>
              <span>
                <MapPin size={12} />
                {textOrMissing(profile.city)}
              </span>
            </div>
            <ResumeSection title="教育背景">
              <strong>{textOrMissing(profile.school)}</strong>
              <p>
                {textOrMissing(profile.major)} ·{" "}
                {profile.degree || "学历待补充"}
              </p>
              <p>
                {textOrMissing(profile.educationStart)} —{" "}
                {textOrMissing(profile.graduation)}
              </p>
              {profile.gpa && <p>学业成绩：{profile.gpa}</p>}
            </ResumeSection>
            <ResumeSection title="实习经历">
              <strong>{profile.internshipCompany || "待补充实习经历"}</strong>
              {profile.internshipRole && (
                <p>
                  {profile.internshipRole}
                  {profile.internshipMonths > 0 &&
                    ` · ${profile.internshipMonths} 个月`}
                </p>
              )}
              <p>
                {profile.internshipAchievement ||
                  "补充你负责的工作、采取的行动和实际成果。"}
              </p>
            </ResumeSection>
            <ResumeSection title="项目经历">
              <strong>{profile.projectName || "待补充项目经历"}</strong>
              <p>
                {profile.projectDescription ||
                  "可以填写课程项目、竞赛或个人作品，说明你的具体贡献。"}
              </p>
            </ResumeSection>
            <ResumeSection title="技能与补充">
              <p>{profile.skills.join(" / ") || "技能待补充"}</p>
              {profile.english && <p>语言：{profile.english}</p>}
              <p>
                意向城市：{profile.preferredCities.join("、") || "待补充"} ·
                到岗时间：{textOrMissing(profile.availability)}
              </p>
              {profile.portfolioUrl && <p>作品集：{profile.portfolioUrl}</p>}
            </ResumeSection>
          </div>
          <div className="wv-resume-tools">
            <button className="wv-secondary" type="button" onClick={copyResume}>
              <Copy size={15} /> 复制文本
            </button>
            <button
              className="wv-primary"
              type="button"
              onClick={downloadResume}
            >
              <ArrowDownToLine size={15} /> 下载文本
            </button>
          </div>
          <p className="wv-copy-status" role="status">
            {copyStatus || "导出前请核实所有内容，并删除暂未填写的项目。"}
          </p>
        </section>
      </div>
    </section>
  );
}

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="wv-resume-section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

export function ActionsView({
  actions,
  completed,
  onToggle,
}: {
  actions: ActionItem[];
  completed: string[];
  onToggle: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"全部" | "未完成" | "已完成">("全部");
  const completedCount = actions.filter((action) =>
    completed.includes(action.id),
  ).length;
  const progress = actions.length
    ? Math.round((completedCount / actions.length) * 100)
    : 0;
  const visibleActions = actions.filter(
    (action) =>
      filter === "全部" ||
      (filter === "已完成"
        ? completed.includes(action.id)
        : !completed.includes(action.id)),
  );
  const weeks = [...new Set(visibleActions.map((action) => action.week))].sort(
    (a, b) => a - b,
  );

  return (
    <section className="wv-page">
      <div className="wv-actions-summary">
        <div className="wv-actions-summary-icon">
          <CheckCheck size={25} />
        </div>
        <div>
          <span className="wv-label">这份计划的进度</span>
          <h3>
            已完成 <strong>{completedCount}</strong>
            <span> / {actions.length} 项行动</span>
          </h3>
        </div>
        <div className="wv-actions-progress">
          <div>
            <span>每一步，都算数</span>
            <strong>{progress}%</strong>
          </div>
          <progress max={100} value={progress} aria-label="行动计划完成进度" />
        </div>
      </div>
      <div className="wv-filterbar">
        <div className="wv-filters" role="group" aria-label="按完成状态筛选">
          {(["全部", "未完成", "已完成"] as const).map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              className={filter === item ? "is-active" : ""}
            >
              {item}
              <span>
                {item === "全部"
                  ? actions.length
                  : item === "已完成"
                    ? completedCount
                    : actions.length - completedCount}
              </span>
            </button>
          ))}
        </div>
        <span className="wv-filter-note">计划会随档案更新而调整</span>
      </div>
      {weeks.map((week) => (
        <section className="wv-week" key={week}>
          <div className="wv-week-label">
            <span>W{String(week).padStart(2, "0")}</span>
            <h3>第 {week} 周</h3>
            <p>
              {week === 1
                ? "先搭好起点"
                : week === 2
                  ? "让准备更扎实"
                  : week === 3
                    ? "尝试，收集反馈"
                    : "复盘，再向前"}
            </p>
          </div>
          <div className="wv-task-list">
            {visibleActions
              .filter((action) => action.week === week)
              .map((action) => {
                const checked = completed.includes(action.id);
                return (
                  <article
                    className={`wv-task ${checked ? "is-complete" : ""}`}
                    key={action.id}
                  >
                    <button
                      className="wv-task-toggle"
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      aria-label={`${checked ? "标记未完成" : "完成"}：${action.title}`}
                      onClick={() => onToggle(action.id)}
                    >
                      {checked && <Check size={15} />}
                    </button>
                    <div className="wv-task-body">
                      <div className="wv-task-topline">
                        <span className="wv-task-category">
                          {action.category}
                        </span>
                        <span
                          className={`wv-priority ${action.priority === "优先" ? "is-high" : ""}`}
                        >
                          {action.priority}
                        </span>
                      </div>
                      <h4>{action.title}</h4>
                      <p>{action.description}</p>
                      <span className="wv-task-duration">
                        <Clock3 size={13} />
                        {action.duration}
                      </span>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>
      ))}
      {!visibleActions.length && (
        <div className="wv-empty-state">
          <CheckCheck size={35} />
          <h3>
            {filter === "未完成" && actions.length
              ? "这份计划，已全部完成。"
              : filter === "已完成"
                ? "第一个小成就，在等你。"
                : "先填写档案，开始你的计划。"}
          </h3>
          <p>
            {filter === "未完成" && actions.length
              ? "回顾你的收获，调整档案，再为下一阶段设定方向。"
              : "完成行动后，点击左侧勾选即可记录进度。"}
          </p>
        </div>
      )}
      <div className="wv-note wv-bottom-note">
        <BookOpen size={17} />
        <span>
          这里的周次是推进建议，不是申请截止日期。院校申请、招聘批次与考试时间，请以官方通知为准。
        </span>
      </div>
    </section>
  );
}

const resources = [
  {
    title: "国家大学生就业服务平台",
    category: "找实习 · 找工作",
    description: "查询校园招聘、就业政策与指导信息，从官方渠道了解岗位。",
    href: "https://www.ncss.cn/",
    host: "ncss.cn",
    icon: BriefcaseBusiness,
    color: "green",
  },
  {
    title: "中国研究生招生信息网",
    category: "国内升学",
    description: "查询招生政策、院校信息与报考通知，核实当年的申请要求。",
    href: "https://yz.chsi.com.cn/",
    host: "yz.chsi.com.cn",
    icon: GraduationCap,
    color: "orange",
  },
  {
    title: "中国高等教育学生信息网",
    category: "学历 · 学籍",
    description: "查询和验证学籍、学历信息，准备升学与求职需要的认证材料。",
    href: "https://www.chsi.com.cn/",
    host: "chsi.com.cn",
    icon: FileText,
    color: "blue",
  },
  {
    title: "国家留学网",
    category: "海外升学",
    description: "了解国家公派留学政策与项目。其他留学项目请查询院校官网。",
    href: "https://www.csc.edu.cn/",
    host: "csc.edu.cn",
    icon: BookOpen,
    color: "purple",
  },
];

const guides = [
  {
    number: "01",
    title: "还没有明确方向，怎么开始？",
    label: "方向探索",
    content: [
      "从过去的真实体验出发：列出三个你愿意主动投入的任务，以及三个让你持续消耗的任务。",
      "选择两个感兴趣的岗位，各阅读 5 份真实岗位描述，整理反复出现的技能和工作内容。",
      "用一周完成一个小作品，或访谈一位相关从业者。比较做事的体验，再决定是否继续投入。",
    ],
  },
  {
    number: "02",
    title: "实习经历不多，简历能写什么？",
    label: "求职准备",
    content: [
      "选择与目标岗位相关的课程项目、竞赛、社团工作或个人作品，并准确说明个人职责。",
      "用「背景—行动—结果」描述经历。没有可核实的数据时，说明实际交付物，不编造成效。",
      "为重要作品准备可访问的链接；涉及实习单位资料时，先确认对外展示权限并做好脱敏。",
    ],
  },
  {
    number: "03",
    title: "升学之前，先核对哪些信息？",
    label: "升学准备",
    content: [
      "国内升学：确认目标专业的考试科目、招生简章、复试要求和费用；推免、统考等路径分别核实。",
      "海外升学：逐一查询项目官网的学历、课程先修、语言、学费、材料与截止日期要求。",
      "把学费、生活费和时间成本单独列出，再与可承担预算比较；不要只按院校排名决定。",
    ],
  },
  {
    number: "04",
    title: "我的想法和家人的期待不同，怎么办？",
    label: "沟通计划",
    content: [
      "先分别写清个人目标和家人的担忧：对方可能更在意经济成本、稳定性、距离或信息不足。",
      "围绕同一份事实比较两条路径：准备时间、预算上限、最坏情况与备选方案。",
      "约定一个阶段性尝试期限与复盘时间。家庭意见是参考，长期选择仍需要你理解并认可。",
    ],
  },
];

export function ResourcesView() {
  return (
    <section className="wv-page">
      <div className="wv-section-heading">
        <h3>从官方信息开始</h3>
        <span>
          4 个常用入口 <ArrowUpRight size={14} />
        </span>
      </div>
      <div className="wv-resource-grid">
        {resources.map(
          ({ title, category, description, href, host, icon: Icon, color }) => (
            <a
              className="wv-resource"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              key={href}
            >
              <div className="wv-resource-top">
                <span className={`wv-resource-icon is-${color}`}>
                  <Icon size={23} />
                </span>
                <ArrowUpRight size={18} />
              </div>
              <span className="wv-resource-category">{category}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="wv-resource-footer">
                <span>{host}</span>
                <span>
                  访问官网 <ArrowRight size={14} />
                </span>
              </div>
            </a>
          ),
        )}
      </div>
      <div className="wv-guide-section">
        <div className="wv-guide-intro">
          <span className="wv-kicker">YOUR NEXT CHAPTER</span>
          <h3>
            困惑时，
            <br />
            从一个小问题开始。
          </h3>
          <p>
            不急着找到唯一答案。
            <br />
            先让下一步变得具体。
          </p>
          <div className="wv-guide-decoration" aria-hidden="true">
            <span />
            <span />
            <ArrowUpRight size={34} />
          </div>
        </div>
        <div className="wv-guides">
          {guides.map((guide) => (
            <details className="wv-guide" key={guide.number}>
              <summary>
                <span className="wv-guide-number">{guide.number}</span>
                <div>
                  <span>{guide.label}</span>
                  <h4>{guide.title}</h4>
                </div>
                <ChevronDown className="wv-guide-chevron" size={18} />
              </summary>
              <ol>
                {guide.content.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </div>
      <div className="wv-note wv-bottom-note">
        <ShieldCheck size={18} />
        <span>
          外部链接将打开第三方网站。政策、岗位与申请要求可能变化，请核实官方最新公告；本站不承诺录取或求职结果。
        </span>
      </div>
    </section>
  );
}
