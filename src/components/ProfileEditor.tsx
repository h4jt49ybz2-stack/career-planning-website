import { useId, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Compass,
  HeartHandshake,
  Info,
  LockKeyhole,
  Plus,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import type { Profile } from "../types";
import { isValidEmail, isValidPhone } from "../lib/planner";
import "./ProfileEditor.css";

interface ProfileEditorProps {
  initial: Profile;
  onSave: (profile: Profile) => void;
  onCancel: () => void;
}

const steps = [
  { title: "教育背景", description: "认识你的起点", icon: BookOpen },
  { title: "我的意愿", description: "向往怎样的未来", icon: Compass },
  {
    title: "家庭期待",
    description: "让彼此的想法被看见",
    icon: HeartHandshake,
  },
  {
    title: "实践经历",
    description: "发现你的独特优势",
    icon: BriefcaseBusiness,
  },
  { title: "求职信息", description: "补齐简历常用信息", icon: UserRound },
];

function Field({
  label,
  hint,
  error,
  children,
  wide = false,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  wide?: boolean;
  htmlFor: string;
}) {
  return (
    <div
      className={`pe-field${wide ? " pe-wide" : ""}${error ? " pe-field-error" : ""}`}
    >
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? (
        <span id={`${htmlFor}-description`} className="pe-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${htmlFor}-description`} className="pe-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function Tags({
  label,
  values,
  suggestions,
  placeholder,
  onChange,
}: {
  label: string;
  values: string[];
  suggestions: string[];
  placeholder: string;
  onChange: (values: string[]) => void;
}) {
  const id = useId();
  const [entry, setEntry] = useState("");
  const [notice, setNotice] = useState("");
  const add = (value: string) => {
    const additions = value
      .split(/[,，、]/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (!additions.length) return;
    if (
      values.length +
        additions.filter((item) => !values.includes(item)).length >
      12
    ) {
      setNotice("最多填写 12 项，保留最能代表你的内容就好。");
      return;
    }
    onChange([...new Set([...values, ...additions])]);
    setEntry("");
    setNotice("");
  };
  return (
    <div className="pe-field pe-wide pe-tags-field">
      <label htmlFor={id}>{label}</label>
      {values.length > 0 && (
        <div className="pe-tags-selected">
          {values.map((value) => (
            <span className="pe-tag" key={value}>
              {value}
              <button
                type="button"
                aria-label={`移除${value}`}
                onClick={() =>
                  onChange(values.filter((item) => item !== value))
                }
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="pe-tag-entry">
        <input
          id={id}
          value={entry}
          placeholder={placeholder}
          maxLength={80}
          onChange={(event) => setEntry(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault();
              add(entry);
            }
          }}
        />
        <button
          type="button"
          aria-label={`添加${label}`}
          onClick={() => add(entry)}
        >
          <Plus size={17} /> 添加
        </button>
      </div>
      <div className="pe-suggestions">
        {suggestions
          .filter((value) => !values.includes(value))
          .map((value) => (
            <button type="button" key={value} onClick={() => add(value)}>
              + {value}
            </button>
          ))}
      </div>
      <span className="pe-hint">
        回车添加，多个内容可用逗号分隔。
        {notice && <span role="status"> {notice}</span>}
      </span>
    </div>
  );
}

export default function ProfileEditor({
  initial,
  onSave,
  onCancel,
}: ProfileEditorProps) {
  const [profile, setProfile] = useState<Profile>(() => ({
    ...initial,
    interests: [...initial.interests],
    skills: [...initial.skills],
    preferredCities: [...initial.preferredCities],
  }));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const prefix = useId();
  const id = (key: keyof Profile) => `${prefix}-${key}`;
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
  };
  const text = (key: keyof Profile, placeholder = "", type = "text") => (
    <input
      id={id(key)}
      type={type}
      value={String(profile[key])}
      placeholder={placeholder}
      onChange={(event) => update(key, event.target.value as never)}
      maxLength={type === "email" ? 254 : 160}
      aria-invalid={Boolean(errors[key])}
      aria-describedby={errors[key] ? `${id(key)}-description` : undefined}
    />
  );
  const textarea = (key: keyof Profile, placeholder: string, rows = 4) => (
    <textarea
      id={id(key)}
      value={String(profile[key])}
      placeholder={placeholder}
      rows={rows}
      maxLength={3000}
      onChange={(event) => update(key, event.target.value as never)}
      aria-invalid={Boolean(errors[key])}
      aria-describedby={errors[key] ? `${id(key)}-description` : undefined}
    />
  );
  const numericValue = (value: string, maximum: number) => {
    const numeric = Number(value);
    return Number.isFinite(numeric)
      ? Math.max(0, Math.min(maximum, numeric))
      : 0;
  };
  const validate = () => {
    const next: Record<string, string> = {};
    if (profile.email.trim() && !isValidEmail(profile.email))
      next.email = "请填写有效的邮箱地址，例如 hello@example.com。";
    if (profile.phone.trim() && !isValidPhone(profile.phone))
      next.phone = "请填写有效手机号、含区号的座机或带 + 国家代码的国际号码。";
    if (profile.portfolioUrl.trim()) {
      try {
        const url = new URL(profile.portfolioUrl.trim());
        if (!["https:", "http:"].includes(url.protocol))
          next.portfolioUrl = "请使用以 https:// 或 http:// 开头的链接。";
      } catch {
        next.portfolioUrl = "请填写完整链接，例如 https://example.com。";
      }
    }
    if (
      profile.educationStart &&
      profile.graduation &&
      profile.educationStart >= profile.graduation
    )
      next.graduation = "毕业时间应晚于入学时间。";
    setErrors(next);
    if (Object.keys(next).length) {
      const errorStep = next.graduation ? 0 : next.portfolioUrl ? 3 : 4;
      setStep(errorStep);
      window.setTimeout(
        () =>
          document
            .getElementById(
              id(
                next.graduation
                  ? "graduation"
                  : next.portfolioUrl
                    ? "portfolioUrl"
                    : next.email
                      ? "email"
                      : "phone",
              ),
            )
            ?.focus(),
        0,
      );
      return false;
    }
    return true;
  };
  const save = () => {
    if (!validate()) return;
    const normalized = Object.fromEntries(
      Object.entries(profile).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ]),
    ) as unknown as Profile;
    onSave(normalized);
  };

  return (
    <section className="pe-editor" aria-label="编辑个人档案">
      <div className="pe-topline">
        <button type="button" className="pe-back-link" onClick={onCancel}>
          <ArrowLeft size={16} /> 返回概览
        </button>
        <span>
          <LockKeyhole size={13} /> 仅保存在当前浏览器
        </span>
      </div>
      <div className="pe-layout">
        <aside className="pe-sidebar" aria-label="档案填写步骤">
          <div className="pe-sidebar-caption">你的生涯拼图</div>
          <nav className="pe-step-list">
            {steps.map((item, index) => (
              <button
                type="button"
                key={item.title}
                className={`pe-step${step === index ? " pe-step-active" : ""}${index < step ? " pe-step-done" : ""}`}
                aria-current={step === index ? "step" : undefined}
                onClick={() => setStep(index)}
              >
                <span className="pe-step-number">
                  {index < step ? (
                    <Check size={17} />
                  ) : (
                    String(index + 1).padStart(2, "0")
                  )}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                {step === index && <span className="pe-step-dot" />}
              </button>
            ))}
          </nav>
          <div className="pe-sidebar-note">
            <Sparkles size={20} />
            <strong>规划，由你定义</strong>
            <p>
              家庭的期待值得倾听，你自己的意愿同样重要。我们会分别考虑，帮助你找到更适合的平衡。
            </p>
          </div>
        </aside>
        <form
          className="pe-form-card"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (step < steps.length - 1) setStep(step + 1);
            else save();
          }}
        >
          <div className="pe-form-top">
            <div className="pe-form-icon">
              {(() => {
                const Icon = steps[step].icon;
                return <Icon size={23} strokeWidth={1.6} />;
              })()}
            </div>
            <span>
              步骤 {step + 1} / {steps.length}
            </span>
          </div>
          <div
            className="pe-progress"
            role="progressbar"
            aria-label="档案填写步骤进度"
            aria-valuenow={step + 1}
            aria-valuemin={0}
            aria-valuemax={5}
          >
            <span style={{ width: `${(step + 1) * 20}%` }} />
          </div>
          <div className="pe-section-title">
            <h2>{steps[step].title}</h2>
            <p>
              {
                [
                  "教育是起点，不是边界。让我们先了解你的学习经历。",
                  "先把别人的期待放一边，你真正想要的是什么？",
                  "把家人的想法写下来，也为自己的选择保留空间。",
                  "实习、课程项目和社团实践，都是你积累的真实能力。",
                  "提前整理招聘中常见的信息，让机会来临时更从容。",
                ][step]
              }
            </p>
          </div>
          <div className="pe-fields" key={step}>
            {step === 0 && (
              <>
                <Field
                  label="怎么称呼你"
                  htmlFor={id("name")}
                  hint="可以用昵称，无需填写真实姓名。"
                >
                  {text("name", "例如：林同学")}
                </Field>
                <Field label="目前学历" htmlFor={id("degree")}>
                  <select
                    id={id("degree")}
                    value={profile.degree}
                    onChange={(event) =>
                      update("degree", event.target.value as Profile["degree"])
                    }
                  >
                    <option value="">请选择学历</option>
                    {["专科", "本科", "硕士", "博士"].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="就读院校" htmlFor={id("school")}>
                  {text("school", "例如：某某大学")}
                </Field>
                <Field label="所学专业" htmlFor={id("major")}>
                  {text("major", "例如：信息管理与信息系统")}
                </Field>
                <Field label="入学时间" htmlFor={id("educationStart")}>
                  {text("educationStart", "", "month")}
                </Field>
                <Field
                  label="预计 / 实际毕业时间"
                  htmlFor={id("graduation")}
                  error={errors.graduation}
                >
                  {text("graduation", "", "month")}
                </Field>
                <Field
                  label="学业成绩"
                  htmlFor={id("gpa")}
                  hint="请注明满分或排名，避免不同计分制度混淆。"
                >
                  {text("gpa", "例如：3.6/4.0，或年级前 20%")}
                </Field>
                <Field
                  label="语言能力"
                  htmlFor={id("english")}
                  hint="填写考试名称、成绩，或目前的实际水平。"
                >
                  {text("english", "例如：CET-6 520 分 / 雅思 6.5")}
                </Field>
              </>
            )}
            {step === 1 && (
              <>
                <fieldset className="pe-choice-field pe-wide">
                  <legend>目前更想探索哪条路</legend>
                  <div className="pe-goal-options">
                    {(
                      [
                        {
                          value: "explore",
                          label: "还在探索",
                          sub: "多看看，再决定",
                        },
                        {
                          value: "work",
                          label: "直接就业",
                          sub: "走向职场，积累经验",
                        },
                        {
                          value: "domestic",
                          label: "国内升学",
                          sub: "继续学习，深入专业",
                        },
                        {
                          value: "overseas",
                          label: "海外升学",
                          sub: "拓宽视野，体验多元",
                        },
                      ] as const
                    ).map((item) => (
                      <label
                        key={item.value}
                        className={`pe-choice${profile.goal === item.value ? " pe-choice-selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`${prefix}-goal`}
                          value={item.value}
                          checked={profile.goal === item.value}
                          onChange={() => update("goal", item.value)}
                        />
                        <span>
                          <strong>{item.label}</strong>
                          <small>{item.sub}</small>
                        </span>
                        <span className="pe-radio-dot" />
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field
                  label="感兴趣的岗位 / 方向"
                  htmlFor={id("targetRole")}
                  wide
                >
                  {text("targetRole", "例如：数据分析、产品经理、教育研究")}
                </Field>
                <Tags
                  label="兴趣领域"
                  values={profile.interests}
                  suggestions={[
                    "互联网与科技",
                    "商业与金融",
                    "教育与研究",
                    "创意与设计",
                    "公共服务",
                  ]}
                  placeholder="输入你感兴趣的领域"
                  onChange={(values) => update("interests", values)}
                />
                <Tags
                  label="已具备的技能"
                  values={profile.skills}
                  suggestions={[
                    "Excel",
                    "Python",
                    "SQL",
                    "数据分析",
                    "沟通表达",
                    "写作",
                    "设计",
                  ]}
                  placeholder="输入技能，例如：Python"
                  onChange={(values) => update("skills", values)}
                />
                <Tags
                  label="期望发展城市"
                  values={profile.preferredCities}
                  suggestions={["上海", "北京", "杭州", "深圳", "成都", "不限"]}
                  placeholder="输入你向往的城市"
                  onChange={(values) => update("preferredCities", values)}
                />
                <Field label="你最在意什么" htmlFor={id("personalPriority")}>
                  <select
                    id={id("personalPriority")}
                    value={profile.personalPriority}
                    onChange={(event) =>
                      update(
                        "personalPriority",
                        event.target.value as Profile["personalPriority"],
                      )
                    }
                  >
                    <option value="growth">成长空间与探索机会</option>
                    <option value="stability">稳定与确定性</option>
                    <option value="balance">生活与工作的平衡</option>
                  </select>
                </Field>
                <Field label="期望月薪（可选）" htmlFor={id("expectedSalary")}>
                  {text("expectedSalary", "例如：8k–12k，或面议")}
                </Field>
                <Field
                  label="可接受的升学总预算（万元）"
                  htmlFor={id("budget")}
                  hint="包含学费及生活费，仅用于提醒资金准备，不作为个人能力评价。"
                  wide
                >
                  <div className="pe-number-input">
                    <input
                      id={id("budget")}
                      type="number"
                      min={0}
                      max={1000}
                      step={1}
                      value={profile.budget}
                      onChange={(event) =>
                        update("budget", numericValue(event.target.value, 1000))
                      }
                    />
                    <span>万元</span>
                  </div>
                </Field>
              </>
            )}
            {step === 2 && (
              <>
                <Field
                  label="家人目前更支持的方向"
                  htmlFor={id("familyPreference")}
                  wide
                >
                  <select
                    id={id("familyPreference")}
                    value={profile.familyPreference}
                    onChange={(event) =>
                      update(
                        "familyPreference",
                        event.target.value as Profile["familyPreference"],
                      )
                    }
                  >
                    <option value="open">尊重我的选择 / 暂未沟通</option>
                    <option value="work">直接就业</option>
                    <option value="domestic">国内升学</option>
                    <option value="overseas">海外升学</option>
                  </select>
                </Field>
                <Field
                  label="他们的期待与顾虑"
                  htmlFor={id("familyNotes")}
                  wide
                  hint="例如经济支持、离家远近、稳定性，或还没有达成共识的事情。"
                >
                  {textarea(
                    "familyNotes",
                    "例如：家人希望我先读研，也担心一线城市生活成本较高。",
                  )}
                </Field>
                <div className="pe-autonomy pe-wide">
                  <div>
                    <label htmlFor={id("autonomy")}>
                      规划时，个人意愿占多大比重
                    </label>
                    <strong>{profile.autonomy}%</strong>
                  </div>
                  <input
                    id={id("autonomy")}
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={profile.autonomy}
                    aria-valuetext={`个人意愿 ${profile.autonomy}%，家庭意见 ${100 - profile.autonomy}%`}
                    onChange={(event) =>
                      update("autonomy", Number(event.target.value))
                    }
                  />
                  <div className="pe-range-labels">
                    <span>更多参考家庭意见</span>
                    <span>更多尊重个人意愿</span>
                  </div>
                  <p>
                    个人意愿 {profile.autonomy}% · 家庭意见{" "}
                    {100 - profile.autonomy}
                    %。你可以随时调整，这不是对关系的评价。
                  </p>
                </div>
                <div className="pe-soft-note pe-wide">
                  <HeartHandshake size={19} />
                  <p>
                    有分歧也很正常。建议会分别说明你的选择与家庭期待，帮助你带着具体的方案去沟通，而不是替你做决定。
                  </p>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <Field
                  label="实习 / 实践单位"
                  htmlFor={id("internshipCompany")}
                >
                  {text("internshipCompany", "企业、机构或社团名称")}
                </Field>
                <Field label="担任角色" htmlFor={id("internshipRole")}>
                  {text("internshipRole", "例如：数据运营实习生")}
                </Field>
                <Field
                  label="累计实习 / 实践时长（月）"
                  htmlFor={id("internshipMonths")}
                  wide
                >
                  <div className="pe-number-input">
                    <input
                      id={id("internshipMonths")}
                      type="number"
                      min={0}
                      max={120}
                      step={0.5}
                      value={profile.internshipMonths}
                      onChange={(event) =>
                        update(
                          "internshipMonths",
                          numericValue(event.target.value, 120),
                        )
                      }
                    />
                    <span>个月</span>
                  </div>
                </Field>
                <Field
                  label="主要工作与成果"
                  htmlFor={id("internshipAchievement")}
                  wide
                  hint="试着用「做了什么 → 怎样做的 → 带来什么结果」描述，数据如实填写。"
                >
                  {textarea(
                    "internshipAchievement",
                    "例如：负责每周用户数据整理，使用 Excel 建立自动化看板，将报表整理时间从 3 小时缩短至 1 小时。",
                  )}
                </Field>
                <div className="pe-field-divider pe-wide">
                  <span>项目经历</span>
                </div>
                <Field label="代表项目名称" htmlFor={id("projectName")} wide>
                  {text(
                    "projectName",
                    "课程作业、毕业设计、比赛或个人项目均可",
                  )}
                </Field>
                <Field
                  label="你的贡献与成果"
                  htmlFor={id("projectDescription")}
                  wide
                >
                  {textarea(
                    "projectDescription",
                    "简要描述项目背景、你承担的任务、使用的方法，以及可验证的成果。",
                  )}
                </Field>
                <Field
                  label="作品集 / 项目链接（可选）"
                  htmlFor={id("portfolioUrl")}
                  error={errors.portfolioUrl}
                  wide
                >
                  {text("portfolioUrl", "https://example.com", "url")}
                </Field>
              </>
            )}
            {step === 4 && (
              <>
                <div className="pe-soft-note pe-wide">
                  <Info size={19} />
                  <p>
                    以下为招聘中常见的信息，具体必填项以岗位要求为准。暂时不想填写的内容可以留空，之后再补充。
                  </p>
                </div>
                <Field
                  label="联系邮箱"
                  htmlFor={id("email")}
                  error={errors.email}
                  hint="用于简历展示，不会用于发送邮件。"
                >
                  {text("email", "hello@example.com", "email")}
                </Field>
                <Field
                  label="联系电话"
                  htmlFor={id("phone")}
                  error={errors.phone}
                  hint="仅供你整理个人简历，可暂不填写。"
                >
                  {text("phone", "填写可联系到你的电话号码", "tel")}
                </Field>
                <Field label="目前所在城市" htmlFor={id("city")}>
                  {text("city", "例如：南京")}
                </Field>
                <Field label="求职类型" htmlFor={id("jobType")}>
                  <select
                    id={id("jobType")}
                    value={profile.jobType}
                    onChange={(event) =>
                      update(
                        "jobType",
                        event.target.value as Profile["jobType"],
                      )
                    }
                  >
                    <option value="全职">全职</option>
                    <option value="实习">实习</option>
                    <option value="均可">全职 / 实习均可</option>
                  </select>
                </Field>
                <Field
                  label="预计到岗时间"
                  htmlFor={id("availability")}
                  wide
                  hint="实习可补充每周天数与可持续月数。"
                >
                  {text(
                    "availability",
                    "例如：两周内到岗，每周 4 天，可持续 3 个月",
                  )}
                </Field>
                <div className="pe-privacy pe-wide">
                  <LockKeyhole size={20} />
                  <div>
                    <strong>你的信息，由你掌握</strong>
                    <p>
                      保存后仅存储在当前浏览器，不会上传到服务器。建议使用个人设备；可点击顶部“数据仅存本地”清除数据。不需要身份证、婚育等隐私信息。
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="pe-form-footer">
            <button
              type="button"
              className="pe-btn-secondary"
              onClick={() => (step === 0 ? onCancel() : setStep(step - 1))}
            >
              <ArrowLeft size={16} />
              {step === 0 ? "稍后再填" : "上一步"}
            </button>
            <span>可以留空，之后随时补充</span>
            <button type="submit" className="pe-btn-primary">
              {step === steps.length - 1 ? (
                <>
                  <Sparkles size={16} /> 保存并生成规划
                </>
              ) : (
                <>
                  下一步 <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
