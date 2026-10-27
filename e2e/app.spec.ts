import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const privateFamilyNote = "仅供家庭沟通的测试备注，不应出现在简历中";

async function navigate(page: Page, name: string) {
  if (
    await page
      .getByRole("button", { name: "打开导航", exact: true })
      .isVisible()
  ) {
    await page.getByRole("button", { name: "打开导航", exact: true }).click();
  }
  await page
    .getByRole("navigation", { name: "主导航" })
    .getByRole("button", { name, exact: false })
    .click();
}

async function enterPersonalProfile(page: Page) {
  await page.getByRole("button", { name: "创建我的档案", exact: true }).click();
  await page.getByLabel("怎么称呼你", { exact: true }).fill("测试同学");
  await page.getByLabel("目前学历", { exact: true }).selectOption("本科");
  await page.getByLabel("就读院校", { exact: true }).fill("测试大学");
  await page.getByLabel("所学专业", { exact: true }).fill("信息管理");
  await page.getByLabel("入学时间", { exact: true }).fill("2024-09");
  await page.getByLabel("预计 / 实际毕业时间", { exact: true }).fill("2028-06");
  await page.getByLabel("学业成绩", { exact: true }).fill("3.8/4.0");
  await page.getByLabel("语言能力", { exact: true }).fill("雅思 7.0（测试）");
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page
    .getByRole("radio", { name: "海外升学 拓宽视野，体验多元" })
    .check();
  await page
    .getByLabel("感兴趣的岗位 / 方向", { exact: true })
    .fill("产品研究实习生");
  await page.getByLabel("兴趣领域", { exact: true }).fill("用户研究");
  await page.getByRole("button", { name: "添加兴趣领域", exact: true }).click();
  await page.getByRole("button", { name: "+ Python", exact: true }).click();
  await page.getByRole("button", { name: "+ 上海", exact: true }).click();
  await page
    .getByLabel("可接受的升学总预算（万元）", { exact: true })
    .fill("40");
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page
    .getByLabel("家人目前更支持的方向", { exact: true })
    .selectOption("work");
  await page
    .getByLabel("他们的期待与顾虑", { exact: true })
    .fill(privateFamilyNote);
  await page.getByRole("slider").fill("100");
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByLabel("实习 / 实践单位", { exact: true }).fill("测试组织");
  await page.getByLabel("担任角色", { exact: true }).fill("研究助理");
  await page.getByLabel("累计实习 / 实践时长（月）", { exact: true }).fill("2");
  await page
    .getByLabel("主要工作与成果", { exact: true })
    .fill("整理公开样例访谈，完成一份需求分析报告。");
  await page.getByLabel("代表项目名称", { exact: true }).fill("测试项目");
  await page
    .getByLabel("你的贡献与成果", { exact: true })
    .fill("通过公开样例分析用户需求，编写课程报告。");
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page
    .getByLabel("联系邮箱", { exact: true })
    .fill("student@example.com");
  await page.getByLabel("联系电话", { exact: true }).fill("+1 202 555 0198");
  await page.getByLabel("目前所在城市", { exact: true }).fill("上海");
  await page
    .getByLabel("预计到岗时间", { exact: true })
    .fill("两周内，每周四天，持续三个月");
  await page
    .getByRole("button", { name: "保存并生成规划", exact: true })
    .click();
  await expect(page).toHaveURL(/#directions$/);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:5173")) return;
    errors.push(`${request.url()}: ${request.failure()?.errorText}`);
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("把未来");
  // Expose the collector only inside this browser test; no application state is changed.
  (page as Page & { collectedErrors?: string[] }).collectedErrors = errors;
});

test.afterEach(async ({ page }) => {
  expect(
    (page as Page & { collectedErrors?: string[] }).collectedErrors ?? [],
  ).toEqual([]);
});

test("示例总览、全部导航与路径说明可用", async ({ page }) => {
  await expect(
    page.getByText("当前为示例档案", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".path-card")).toHaveCount(3);
  await page.screenshot({ path: "/tmp/xiangyuan-desktop.png", fullPage: true });
  await page
    .getByRole("button", { name: "查看路径", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText("为什么值得探索");
  await expect(page.getByRole("dialog")).toContainText("规则适配参考");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const destinations = [
    ["我的档案", "每一面真实的你"],
    ["探索方向", "让每一个选择"],
    ["简历准备", "让你的经历"],
    ["行动计划", "小步向前"],
    ["成长资源", "好资源"],
  ];
  for (const [name, title] of destinations) {
    await navigate(page, name);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
  }
  await expect(page.locator(".wv-resource")).toHaveCount(4);
  await page.locator(".wv-guide summary").first().click();
  await expect(page.locator(".wv-guide").first().locator("ol")).toBeVisible();
});

test("五步档案生成个性规划，简历及规划可导出", async ({ page }) => {
  await enterPersonalProfile(page);
  await expect(page.locator(".analysis-summary")).toContainText("测试同学");
  await expect(page.locator(".demo-notice")).toHaveCount(0);
  await expect(page.locator(".family-preferences")).toContainText("100%");
  const dataCareer = page
    .locator(".career-suggestion")
    .filter({
      has: page.getByRole("heading", { name: "数据分析", exact: true }),
    });
  await expect(dataCareer).toContainText("已有线索");
  await expect(dataCareer).toContainText("Python");
  await page.getByRole("button", { name: "海外升学", exact: true }).click();
  await expect(page.locator(".path-card")).toHaveCount(1);
  await expect(page.locator(".path-card")).toContainText("海外升学");

  const planningDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出我的规划", exact: true }).click();
  const plan = await planningDownload;
  expect(plan.suggestedFilename()).toBe("向远-生涯规划.txt");
  const planText = await readFile((await plan.path())!, "utf8");
  expect(planText).toContain("测试同学");
  expect(planText).toContain("行动计划");
  expect(planText).toContain("不代表就业或录取概率");

  await navigate(page, "简历准备");
  await expect(page.locator(".wv-resume-paper")).toContainText("测试同学");
  await expect(page.locator(".wv-resume-paper")).toContainText(
    "产品研究实习生",
  );
  const resumeDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载文本", exact: true }).click();
  const resume = await resumeDownload;
  const resumeText = await readFile((await resume.path())!, "utf8");
  expect(resumeText).toContain("测试同学");
  expect(resumeText).toContain("student@example.com");
  expect(resumeText).toContain("测试项目");
  expect(resumeText).not.toContain(privateFamilyNote);
  await page.reload();
  await expect(page.locator(".wv-resume-paper")).toContainText("测试同学");
});

test("邮箱和电话无效时给出错误，允许留空后补充", async ({ page }) => {
  await page.getByRole("button", { name: "创建我的档案", exact: true }).click();
  await page.locator(".pe-step").filter({ hasText: "求职信息" }).click();
  await page.getByLabel("联系邮箱", { exact: true }).fill("not-an-email");
  await page.getByLabel("联系电话", { exact: true }).fill("123");
  await page
    .getByRole("button", { name: "保存并生成规划", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveCount(2);
  await expect(page.getByLabel("联系邮箱", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("联系邮箱", { exact: true }).fill("");
  await page.getByLabel("联系电话", { exact: true }).fill("");
  await page
    .getByRole("button", { name: "保存并生成规划", exact: true })
    .click();
  await expect(page).toHaveURL(/#directions$/);
  await expect(page.locator(".analysis-summary")).toContainText("先补充");
  await expect(page.locator(".career-signal")).toHaveText([
    "探索示例",
    "探索示例",
    "探索示例",
  ]);
});

test("从示例档案编辑页创建个人档案会清空示例输入", async ({ page }) => {
  await navigate(page, "我的档案");
  await expect(page.getByLabel("怎么称呼你", { exact: true })).toHaveValue(
    "林同学",
  );
  await expect(page.getByLabel("就读院校", { exact: true })).toHaveValue(
    "示例大学",
  );
  await page.getByRole("button", { name: "创建我的档案", exact: true }).click();
  await expect(page.getByLabel("怎么称呼你", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("就读院校", { exact: true })).toHaveValue("");
  await expect(page.locator(".demo-notice")).toHaveCount(0);
});

test("行动完成状态、刷新持久与筛选一致", async ({ page }) => {
  await navigate(page, "行动计划");
  const firstTask = page.locator(".wv-task").first();
  const title = await firstTask.locator("h4").innerText();
  await firstTask.getByRole("checkbox").click();
  await expect(firstTask.getByRole("checkbox")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.reload();
  await expect(
    page.locator(".wv-task").filter({ hasText: title }).getByRole("checkbox"),
  ).toHaveAttribute("aria-checked", "true");
  await page
    .locator(".wv-filters button")
    .filter({ hasText: "已完成" })
    .click();
  await expect(page.locator(".wv-task")).toHaveCount(1);
  await expect(page.locator(".wv-task")).toContainText(title);
  await page
    .locator(".wv-filters button")
    .filter({ hasText: "未完成" })
    .click();
  await expect(page.locator(".wv-task").filter({ hasText: title })).toHaveCount(
    0,
  );
});

test("隐私面板清除档案和任务记录", async ({ page }) => {
  await enterPersonalProfile(page);
  await navigate(page, "行动计划");
  await page.getByRole("checkbox").first().click();
  await page.getByRole("button", { name: "数据仅存本地", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "不会将档案发送到服务器",
  );
  await page.getByRole("button", { name: "清除我的数据", exact: true }).click();
  await page.getByRole("button", { name: "确认清除", exact: true }).click();
  await expect(page).toHaveURL(/#overview$/);
  await expect(page.locator(".demo-notice")).toBeVisible();
  await page.reload();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("xiangyuan.workspace.v1")!),
  );
  expect(saved.isDemo).toBe(true);
  expect(saved.completed).toEqual([]);
  expect(saved.profile.name).not.toBe("测试同学");
  expect(JSON.stringify(saved)).not.toContain(privateFamilyNote);
});

for (const width of [320, 390])
  test(`手机 ${width}px 导航和所有主要页面无横向溢出`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.waitForFunction(
      () =>
        (document.querySelector(".sidebar")?.getBoundingClientRect().right ??
          1) <= 0,
    );
    const snapshotText = page.locator(".snapshot-progress > div:last-child");
    const snapshotTextWidth = await snapshotText.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    expect(snapshotTextWidth).toBeGreaterThan(140);
    await page.screenshot({
      path:
        width === 390
          ? "/tmp/xiangyuan-mobile.png"
          : "/tmp/xiangyuan-mobile-320.png",
      fullPage: true,
    });
    for (const name of [
      "生涯总览",
      "我的档案",
      "探索方向",
      "简历准备",
      "行动计划",
      "成长资源",
    ]) {
      await navigate(page, name);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        `${name} should fit the mobile viewport`,
      ).toBe(true);
      if (name === "我的档案") {
        for (const stepName of [
          "教育背景",
          "我的意愿",
          "家庭期待",
          "实践经历",
          "求职信息",
        ]) {
          await page.locator(".pe-step").filter({ hasText: stepName }).click();
          expect(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= window.innerWidth + 1,
            ),
            `${stepName} should fit the mobile viewport`,
          ).toBe(true);
        }
        if (width === 390)
          await page.screenshot({
            path: "/tmp/xiangyuan-mobile-profile.png",
            fullPage: true,
          });
      }
    }
  });
