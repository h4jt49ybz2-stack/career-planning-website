import { describe, expect, it } from "vitest";
import { recommendCareers } from "./careers";
import { emptyProfile } from "./planner";
import { demoProfile } from "./sample";

describe("career exploration suggestions", () => {
  it("labels cross-field examples when there is no evidence", () => {
    const suggestions = recommendCareers(emptyProfile);
    expect(suggestions).toHaveLength(3);
    expect(suggestions.every((item) => !item.hasSignals)).toBe(true);
    expect(
      suggestions.every((item) => item.reasons.join("").includes("探索示例")),
    ).toBe(true);
    expect(new Set(suggestions.map((item) => item.category)).size).toBe(3);
  });

  it("uses concrete data skills and explains the actual filled signals", () => {
    const suggestions = recommendCareers({
      ...emptyProfile,
      skills: ["SQL", "Excel"],
      interests: ["数据分析"],
    });
    expect(suggestions[0].id).toBe("data-analysis");
    expect(suggestions[0].hasSignals).toBe(true);
    expect(suggestions[0].reasons.join("")).toContain("SQL");
    expect(suggestions[0].skills).toContain("SQL 与数据清洗");
    expect(suggestions[0].experiment.length).toBeGreaterThan(20);
  });

  it("changes direction when interests change", () => {
    const coding = recommendCareers({
      ...emptyProfile,
      interests: ["编程", "开源"],
    });
    const design = recommendCareers({
      ...emptyProfile,
      interests: ["视觉设计", "插画"],
    });
    expect(coding[0].id).toBe("software-development");
    expect(design[0].id).toBe("design");
  });

  it("does not use school prestige, degree, family or language to screen professions", () => {
    const original = recommendCareers(demoProfile);
    const changed = recommendCareers({
      ...demoProfile,
      school: "另一所学校",
      degree: "专科",
      familyPreference: "overseas",
      autonomy: 0,
      gpa: "0 / 4",
      english: "尚未考试",
    });
    expect(changed).toEqual(original);
  });

  it("does not confuse isolated programming tokens with unrelated words", () => {
    const google = recommendCareers({
      ...emptyProfile,
      skills: ["Google Docs"],
    });
    expect(google.every((item) => !item.hasSignals)).toBe(true);
    const react = recommendCareers({ ...emptyProfile, skills: ["React"] });
    expect(react.map((item) => item.id)).toEqual(["software-development"]);
    const cpp = recommendCareers({ ...emptyProfile, skills: ["C++"] });
    expect(cpp[0].id).toBe("software-development");
  });

  it("uses internship roles, caps results, and does not fabricate unfilled evidence", () => {
    const suggestions = recommendCareers({
      ...emptyProfile,
      internshipRole: "新媒体运营实习生",
    });
    expect(suggestions[0].id).toBe("content-operations");
    expect(suggestions[0].reasons.join("")).toContain("新媒体运营实习生");
    expect(suggestions[0].reasons.join("")).not.toContain("专业");
    expect(recommendCareers(demoProfile).length).toBeLessThanOrEqual(3);
  });

  it("matches equivalent casing and full-width characters", () => {
    const suggestions = recommendCareers({
      ...emptyProfile,
      skills: ["ｓｑｌ", "python"],
    });
    expect(suggestions[0].id).toBe("data-analysis");
  });

  it("uses the target role as an explicit exploration preference", () => {
    const suggestions = recommendCareers({
      ...emptyProfile,
      targetRole: "教育研究",
    });
    expect(suggestions[0].id).toBe("professional-research");
    expect(suggestions[0].reasons.join("")).toContain("目标方向");
  });
});
