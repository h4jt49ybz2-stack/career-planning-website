import { describe, expect, it } from "vitest";
import {
  analyzeProfile,
  emptyProfile,
  isValidEmail,
  isValidPhone,
} from "./planner";
import { demoProfile } from "./sample";
import type { PathId, Profile } from "../types";

const score = (p: Profile, id: PathId) =>
  analyzeProfile(p).paths.find((path) => path.id === id)!.score;

describe("explainable direction comparison", () => {
  it("keeps an empty profile inconclusive rather than inventing readiness", () => {
    const result = analyzeProfile(emptyProfile);
    expect(result.completeness).toBe(0);
    expect(result.paths).toHaveLength(3);
    expect(result.paths.every((path) => path.score < 20)).toBe(true);
    expect(result.summary).toContain("资料不足");
    expect(
      result.resumeChecks
        .filter((check) => check.required)
        .every((check) => !check.complete),
    ).toBe(true);
    expect(result.actions[0].id).toBe("complete-profile");
  });

  it("makes demonstrated experience and skills affect career preparation", () => {
    const basic: Profile = {
      ...emptyProfile,
      school: "示例大学",
      major: "统计学",
      degree: "本科",
    };
    const practical: Profile = {
      ...basic,
      skills: ["SQL"],
      internshipCompany: "示例企业",
      internshipRole: "分析实习",
      internshipMonths: 3,
      projectName: "课程项目",
      projectDescription: "完成分析报告",
    };
    expect(score(practical, "work")).toBeGreaterThan(score(basic, "work"));
    expect(
      analyzeProfile(practical)
        .paths.find((path) => path.id === "work")!
        .reasons.join(""),
    ).toContain("3 个月");
  });

  it("changes suggestions when the personal goal changes", () => {
    const shared = {
      ...emptyProfile,
      school: "示例大学",
      major: "计算机",
      degree: "本科" as const,
      autonomy: 100,
    };
    expect(analyzeProfile({ ...shared, goal: "work" }).paths[0].id).toBe(
      "work",
    );
    expect(analyzeProfile({ ...shared, goal: "domestic" }).paths[0].id).toBe(
      "domestic",
    );
    expect(analyzeProfile({ ...shared, goal: "overseas" }).paths[0].id).toBe(
      "overseas",
    );
  });

  it("keeps family and personal preferences separate and honors the chosen weight", () => {
    const conflicted: Profile = {
      ...emptyProfile,
      goal: "work",
      familyPreference: "domestic",
    };
    expect(score({ ...conflicted, autonomy: 100 }, "work")).toBeGreaterThan(
      score({ ...conflicted, autonomy: 0 }, "work"),
    );
    expect(score({ ...conflicted, autonomy: 0 }, "domestic")).toBeGreaterThan(
      score({ ...conflicted, autonomy: 100 }, "domestic"),
    );
    expect(
      analyzeProfile({ ...conflicted, autonomy: 80 }).familyAlignment,
    ).toContain("个人意愿权重 80%");
    expect(
      analyzeProfile(conflicted).actions.find(
        (action) => action.id === "family-conversation",
      )?.description,
    ).toContain("最终决定由你");
  });

  it("does not rank people by university name", () => {
    expect(
      analyzeProfile({ ...demoProfile, school: "普通大学" }).paths,
    ).toEqual(analyzeProfile({ ...demoProfile, school: "名牌大学" }).paths);
  });

  it("requires budget and language preparation rather than treating missing information as met", () => {
    const missing = { ...demoProfile, budget: 0, english: "" };
    const prepared = { ...demoProfile, budget: 35, english: "雅思 7.0" };
    expect(score(prepared, "overseas")).toBeGreaterThan(
      score(missing, "overseas"),
    );
    const gaps = analyzeProfile(missing)
      .paths.find((path) => path.id === "overseas")!
      .gaps.join("");
    expect(gaps).toContain("语言");
    expect(gaps).toContain("预算");
    expect(
      analyzeProfile(prepared)
        .paths.find((path) => path.id === "overseas")!
        .gaps.join(""),
    ).toContain("逐个核对");
  });

  it("keeps scores finite and bounded for invalid numeric input", () => {
    const result = analyzeProfile({
      ...demoProfile,
      autonomy: Number.NaN,
      budget: Infinity,
      internshipMonths: Number.NaN,
    });
    expect(
      result.paths.every(
        (path) =>
          Number.isFinite(path.score) && path.score >= 0 && path.score <= 95,
      ),
    ).toBe(true);
  });

  it("does not count nonfinite or negative internship duration as completed experience", () => {
    for (const duration of [Infinity, Number.NaN, -1, 0]) {
      const result = analyzeProfile({
        ...demoProfile,
        internshipMonths: duration,
      });
      expect(
        result.resumeChecks.find((check) => check.id === "internship")
          ?.complete,
      ).toBe(false);
      expect(
        result.paths.find((path) => path.id === "work")!.reasons.join(""),
      ).not.toContain("个月");
    }
  });

  it("limits confidence when foundational education information is missing", () => {
    const result = analyzeProfile({
      ...demoProfile,
      school: "",
      budget: 100,
      autonomy: 100,
    });
    expect(result.paths.every((path) => path.score <= 40)).toBe(true);
    expect(result.summary).toContain("资料不足");
    expect(
      result.paths.find((path) => path.id === "work")!.gaps.join(""),
    ).toContain("教育信息");
  });

  it("clamps weights and defaults invalid values without silently prioritizing the family", () => {
    const conflicted: Profile = {
      ...emptyProfile,
      goal: "work",
      familyPreference: "domestic",
    };
    expect(analyzeProfile({ ...conflicted, autonomy: -100 }).paths).toEqual(
      analyzeProfile({ ...conflicted, autonomy: 0 }).paths,
    );
    expect(analyzeProfile({ ...conflicted, autonomy: 200 }).paths).toEqual(
      analyzeProfile({ ...conflicted, autonomy: 100 }).paths,
    );
    expect(
      analyzeProfile({ ...conflicted, autonomy: Number.NaN }).paths,
    ).toEqual(analyzeProfile({ ...conflicted, autonomy: 80 }).paths);
    expect(
      analyzeProfile({ ...conflicted, autonomy: Infinity }).familyAlignment,
    ).toContain("个人意愿权重 80%");
  });

  it("does not infer support from an unset family preference or stability from a degree", () => {
    expect(analyzeProfile(emptyProfile).familyAlignment).toContain(
      "尚未设置明确",
    );
    expect(
      analyzeProfile({ ...demoProfile, personalPriority: "stability" }).paths,
    ).toEqual(
      analyzeProfile({ ...demoProfile, personalPriority: "growth" }).paths,
    );
  });
});

describe("resume field checks", () => {
  it("validates contact formats and does not accept arbitrary nonempty strings", () => {
    expect(isValidEmail("lin@example.com")).toBe(true);
    expect(isValidEmail("邮箱")).toBe(false);
    expect(isValidEmail("someone@invalid")).toBe(false);
    expect(isValidEmail("someone@example..com")).toBe(false);
    expect(isValidEmail("someone@-example.com")).toBe(false);
    expect(isValidEmail("some..one@example.com")).toBe(false);
    expect(isValidEmail("someone@example.123")).toBe(false);
    expect(isValidPhone("13812345678")).toBe(true);
    expect(isValidPhone("+44 20 7946 0958")).toBe(true);
    expect(isValidPhone("010-12345678")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("12345678901")).toBe(false);
    expect(isValidPhone("00000000000")).toBe(false);
    const result = analyzeProfile({
      ...demoProfile,
      phone: "错误",
      email: "错误",
    });
    expect(
      result.resumeChecks.find((check) => check.id === "phone")?.complete,
    ).toBe(false);
    expect(
      result.resumeChecks.find((check) => check.id === "email")?.complete,
    ).toBe(false);
  });

  it("distinguishes core fields from optional experience instead of requiring internships for everyone", () => {
    const result = analyzeProfile(demoProfile);
    expect(
      result.resumeChecks.find((check) => check.id === "internship")?.required,
    ).toBe(false);
    expect(
      result.resumeChecks.find((check) => check.id === "portfolio")?.required,
    ).toBe(false);
    expect(
      result.resumeChecks.find((check) => check.id === "education")?.required,
    ).toBe(true);
    expect(result.completeness).toBeLessThan(100);
  });

  it("rejects reversed or incomplete education dates", () => {
    const check = (profile: Profile) =>
      analyzeProfile(profile).resumeChecks.find(
        (item) => item.id === "educationDates",
      )!.complete;
    expect(
      check({
        ...demoProfile,
        educationStart: "2024-09",
        graduation: "2028-06",
      }),
    ).toBe(true);
    expect(
      check({
        ...demoProfile,
        educationStart: "2028-06",
        graduation: "2024-09",
      }),
    ).toBe(false);
    expect(check({ ...demoProfile, educationStart: "2024-13" })).toBe(false);
    expect(check({ ...demoProfile, educationStart: "0000-01" })).toBe(false);
    expect(
      check({
        ...demoProfile,
        educationStart: "2024-09",
        graduation: "2024-09",
      }),
    ).toBe(false);
    expect(check({ ...demoProfile, graduation: "" })).toBe(false);
  });

  it("accepts a project as a source of evidence without an internship", () => {
    const result = analyzeProfile({
      ...emptyProfile,
      projectName: "课程项目",
      projectDescription: "独立完成报告",
    });
    expect(
      result.resumeChecks.find((check) => check.id === "achievement")?.complete,
    ).toBe(true);
    expect(
      result.resumeChecks.find((check) => check.id === "internship")?.complete,
    ).toBe(false);
  });

  it("reaches full core completeness only when the missing phone is supplied", () => {
    expect(
      analyzeProfile({ ...demoProfile, phone: "+86 13812345678" }).completeness,
    ).toBe(100);
    expect(
      analyzeProfile({ ...demoProfile, phone: "" }).completeness,
    ).toBeLessThan(100);
  });
});
