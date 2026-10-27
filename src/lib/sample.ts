import type { Profile } from "../types";
import { emptyProfile } from "./planner";

const today = new Date();
const academicYear =
  today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;

/** Fictional demonstration only. No real student's information is included. */
export const demoProfile: Profile = {
  ...emptyProfile,
  name: "林同学",
  email: "lin@example.com",
  phone: "",
  city: "杭州",
  school: "示例大学",
  major: "信息管理与信息系统",
  degree: "本科",
  educationStart: `${academicYear - 2}-09`,
  graduation: `${academicYear + 2}-06`,
  gpa: "3.6 / 4.0",
  english: "英语六级 520 分（示例）",
  goal: "work",
  targetRole: "数据分析师",
  interests: ["数据分析", "商业研究", "产品策划"],
  skills: ["Excel", "SQL", "Python", "数据可视化"],
  preferredCities: ["上海", "杭州"],
  expectedSalary: "8k–12k / 月",
  budget: 20,
  familyPreference: "domestic",
  familyNotes: "希望继续深造，获得更扎实的专业基础，也重视未来工作的稳定性。",
  autonomy: 80,
  internshipCompany: "某互联网公司（示例）",
  internshipRole: "用户运营实习生",
  internshipMonths: 3,
  internshipAchievement:
    "独立整理周度用户活跃数据，制作 8 份运营分析报告，协助团队找到活动转化流程中的改进点。",
  projectName: "校园二手交易数据分析",
  projectDescription:
    "使用 Python 清洗公开样例数据，通过 SQL 分析成交与品类分布，并用可视化报告展示发现。",
  availability: "寒暑假每周 4 天，可连续实习 3 个月",
  jobType: "实习",
};
