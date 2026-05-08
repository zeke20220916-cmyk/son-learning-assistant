const STORAGE_KEY = "sonLearningAssistant.v1";
const todayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
const subjectNames = {
  math: "数学",
  chinese: "语文",
  english: "英语",
  reading: "阅读",
  go: "围棋",
  piano: "钢琴",
  habit: "习惯",
  other: "其他"
};
const categoryNames = {
  learning: "学习任务",
  life: "生活习惯"
};
const titleTypeNames = {
  achievement: "正向称号",
  hidden: "隐藏称号",
  warning: "提醒称号"
};
const conditionNames = {
  first_any_completed: "第一次完成任意任务",
  perfect_day: "当天全部任务完成",
  streak_perfect: "连续满环天数达到",
  daily_completed_count: "当天完成任务数达到",
  daily_points: "当天任务积分达到",
  all_life_completed: "当天生活习惯全部完成",
  life_streak: "连续完成全部生活习惯天数达到",
  same_task_completed_streak: "同一个任务连续完成次数达到",
  same_task_missed_streak: "同一个任务连续未完成次数达到",
  two_days_all_missed: "连续两天全部未完成"
};

const defaultLevelTitles = [
  [0, "学习新兵"],
  [50, "小小行动派"],
  [100, "任务小能手"],
  [200, "专注小学士"],
  [350, "自律小达人"],
  [500, "学习骑士"],
  [800, "知识探险家"],
  [1200, "时间管理师"],
  [1800, "超级学习家"],
  [2500, "自律大师"]
];

const defaultState = {
  view: "child",
  selectedDate: todayKey(),
  points: 0,
  streak: 0,
  lastPerfectDate: "",
  titles: [],
  pointLogs: [],
  rewardClaims: [],
  awardedRuleBonuses: [],
  levelTitles: defaultLevelTitles.map(([points, name]) => ({ id: crypto.randomUUID(), points, name })),
  pointRules: {
    perfectDayBonus: 10,
    streak3Bonus: 20,
    streak7Bonus: 50,
    lifePerfectBonus: 5
  },
  titleRules: [
    {
      id: crypto.randomUUID(),
      name: "起步之星",
      type: "achievement",
      condition: "first_any_completed",
      threshold: 1,
      description: "第一次完成任意任务。",
      active: true,
      temporaryDays: 0
    },
    {
      id: crypto.randomUUID(),
      name: "今日全胜",
      type: "achievement",
      condition: "perfect_day",
      threshold: 1,
      description: "完成当天全部任务。",
      active: true,
      temporaryDays: 0
    },
    {
      id: crypto.randomUUID(),
      name: "生活小管家",
      type: "achievement",
      condition: "all_life_completed",
      threshold: 1,
      description: "当天生活习惯全部完成。",
      active: true,
      temporaryDays: 0
    },
    {
      id: crypto.randomUUID(),
      name: "三日连胜",
      type: "achievement",
      condition: "streak_perfect",
      threshold: 3,
      description: "连续 3 天完成全部任务。",
      active: true,
      temporaryDays: 0
    },
    {
      id: crypto.randomUUID(),
      name: "一周满环",
      type: "achievement",
      condition: "streak_perfect",
      threshold: 7,
      description: "连续 7 天完成全部任务。",
      active: true,
      temporaryDays: 0
    },
    {
      id: crypto.randomUUID(),
      name: "习惯守护者",
      type: "hidden",
      condition: "life_streak",
      threshold: 5,
      description: "隐藏称号：连续完成全部生活习惯。",
      active: true,
      temporaryDays: 0
    },
    {
      id: crypto.randomUUID(),
      name: "高效小火箭",
      type: "achievement",
      condition: "daily_completed_count",
      threshold: 5,
      description: "单日完成 5 个任务。",
      active: true,
      temporaryDays: 0
    },
    {
      id: crypto.randomUUID(),
      name: "积分冲刺王",
      type: "achievement",
      condition: "daily_points",
      threshold: 50,
      description: "单日任务积分达到 50 分。",
      active: true,
      temporaryDays: 0
    },
    {
      id: crypto.randomUUID(),
      name: "拖沓王",
      type: "warning",
      condition: "two_days_all_missed",
      threshold: 1,
      description: "连续两天所有任务都未完成，重新点亮一天就会翻篇。",
      active: true,
      temporaryDays: 3
    },
    {
      id: crypto.randomUUID(),
      name: "任务躲猫猫大师",
      type: "warning",
      condition: "same_task_missed_streak",
      threshold: 3,
      description: "同一个任务连续几次未完成。",
      active: true,
      temporaryDays: 3
    },
    {
      id: crypto.randomUUID(),
      name: "稳定输出",
      type: "hidden",
      condition: "same_task_completed_streak",
      threshold: 3,
      description: "隐藏称号：同一个任务连续完成。",
      active: true,
      temporaryDays: 0
    }
  ],
  tasks: [
    {
      id: crypto.randomUUID(),
      category: "learning",
      type: "recurring",
      title: "阅读 20 分钟",
      subject: "reading",
      detail: "选择一本喜欢的书，安静阅读 20 分钟。\n读完后回想今天最有意思的一段内容。",
      points: 10,
      difficulty: "normal",
      repeatType: "daily",
      weekdays: [],
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      category: "learning",
      type: "recurring",
      title: "数学口算 20 题",
      subject: "math",
      detail: "完成 20 道口算题。\n检查一遍，把错题圈出来，明天优先复习。",
      points: 10,
      difficulty: "normal",
      repeatType: "weekly",
      weekdays: [1, 2, 3, 4, 5],
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      category: "learning",
      type: "recurring",
      title: "英语听读 15 分钟",
      subject: "english",
      detail: "听课文录音 1 遍，跟读 2 遍。\n把不会读的单词标出来，最后自己完整读一遍。",
      points: 10,
      difficulty: "normal",
      repeatType: "weekly",
      weekdays: [1, 3, 5],
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      category: "life",
      type: "recurring",
      title: "整理书桌",
      subject: "habit",
      detail: "把今天用过的书、本子和文具放回固定位置。\n桌面只保留明天要用的学习用品。",
      points: 5,
      difficulty: "easy",
      repeatType: "daily",
      weekdays: [],
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      category: "life",
      type: "recurring",
      title: "睡前准备",
      subject: "habit",
      detail: "检查明天要带的书本和作业。\n把书包整理好，水杯放在容易看到的位置。",
      points: 5,
      difficulty: "easy",
      repeatType: "daily",
      weekdays: [],
      active: true,
      createdAt: new Date().toISOString()
    }
  ],
  daily: {},
  rewards: [
    { id: crypto.randomUUID(), title: "选择晚饭后游戏 15 分钟", cost: 30, active: true },
    { id: crypto.randomUUID(), title: "周末看一集动画", cost: 50, active: true },
    { id: crypto.randomUUID(), title: "买一本喜欢的书", cost: 80, active: true },
    { id: crypto.randomUUID(), title: "一次亲子外出活动", cost: 150, active: true }
  ],
  form: null,
  toast: ""
};

let state = loadState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return normalizeState(structuredClone(defaultState));
  try {
    return normalizeState({ ...structuredClone(defaultState), ...JSON.parse(raw), view: "child", toast: "" });
  } catch {
    return normalizeState(structuredClone(defaultState));
  }
}

function normalizeState(nextState) {
  nextState.pointRules = {
    ...structuredClone(defaultState.pointRules),
    ...(nextState.pointRules || {})
  };
  nextState.titleRules = (nextState.titleRules?.length ? nextState.titleRules : defaultState.titleRules).map((rule) => ({
    id: rule.id || crypto.randomUUID(),
    name: rule.name || "新称号",
    type: rule.type || "achievement",
    condition: rule.condition || "perfect_day",
    threshold: Number(rule.threshold) || 1,
    description: rule.description || "",
    active: rule.active !== false,
    temporaryDays: Number(rule.temporaryDays) || 0
  }));
  nextState.rewards = (nextState.rewards || []).map((reward) => ({
    ...reward,
    active: reward.active !== false
  }));
  nextState.awardedRuleBonuses = nextState.awardedRuleBonuses || [];
  nextState.levelTitles = (nextState.levelTitles?.length
    ? nextState.levelTitles
    : defaultLevelTitles.map(([points, name]) => ({ id: crypto.randomUUID(), points, name }))
  )
    .map((item) => ({
      id: item.id || crypto.randomUUID(),
      points: Number(item.points) || 0,
      name: item.name || "等级称号"
    }))
    .sort((a, b) => a.points - b.points);
  nextState.tasks = (nextState.tasks || []).map((task) => ({
    ...task,
    category: task.category || "learning"
  }));
  Object.keys(nextState.daily || {}).forEach((date) => {
    nextState.daily[date] = nextState.daily[date].map((task) => ({
      ...task,
      category:
        task.category ||
        nextState.tasks.find((template) => template.id === task.templateId)?.category ||
        "learning",
      record: task.record || {},
      timerStartedAt: task.timerStartedAt || "",
      timerSeconds: Number(task.timerSeconds) || 0
    }));
  });
  return nextState;
}

function saveState() {
  const clean = { ...state, toast: "" };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
}

function setState(next) {
  state = { ...state, ...next };
  saveState();
  render();
}

function ensureDaily(date) {
  if (state.daily[date]) return state.daily[date];
  const day = new Date(`${date}T12:00:00`).getDay();
  const list = state.tasks
    .filter((task) => task.active)
    .filter((task) => {
      if (task.type === "one_time") return task.date === date;
      if (task.repeatType === "daily") return true;
      return task.weekdays.includes(day);
    })
    .map((task) => ({
      id: crypto.randomUUID(),
      category: task.category || "learning",
      templateId: task.id,
      title: task.title,
      subject: task.subject,
      detail: task.detail,
      points: Number(task.points) || 0,
      difficulty: task.difficulty,
      status: "pending",
      record: {},
      timerStartedAt: "",
      timerSeconds: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  state.daily[date] = list;
  saveState();
  return list;
}

function currentTasks() {
  return ensureDaily(state.selectedDate);
}

function statusText(status) {
  return status === "completed" ? "已完成" : status === "not_completed" ? "未完成" : "待完成";
}

function getLevelTitle(points) {
  const titles = state.levelTitles?.length
    ? state.levelTitles
    : defaultLevelTitles.map(([threshold, name]) => ({ points: threshold, name }));
  return titles.reduce((current, item) => (points >= item.points ? item : current), titles[0]).name;
}

function addPointLog(points, reason, sourceId) {
  if (!points) return;
  state.points += points;
  state.pointLogs.unshift({
    id: crypto.randomUUID(),
    points,
    reason,
    sourceId,
    createdAt: new Date().toISOString()
  });
}

function awardRulePoints(points, reason, sourceId) {
  if (!points || state.awardedRuleBonuses.includes(sourceId)) return;
  state.awardedRuleBonuses.push(sourceId);
  addPointLog(points, reason, sourceId);
}

function hasTitle(name) {
  return state.titles.some((title) => title.name === name);
}

function earnTitle(name, type, description, days = null) {
  if (hasTitle(name)) return;
  const now = new Date();
  const expiresAt = days ? new Date(now.getTime() + days * 86400000).toISOString() : "";
  state.titles.unshift({
    id: crypto.randomUUID(),
    name,
    type,
    description,
    earnedAt: now.toISOString(),
    expiresAt
  });
  state.toast = `获得称号：${name}`;
}

function checkAchievements(date) {
  const tasks = state.daily[date] || [];
  const completed = tasks.filter((task) => task.status === "completed");
  const notCompleted = tasks.filter((task) => task.status === "not_completed");
  const lifeTasks = tasks.filter((task) => task.category === "life");
  const lifeCompleted = lifeTasks.filter((task) => task.status === "completed");
  const perfect = tasks.length > 0 && completed.length === tasks.length;
  const lifePerfect = lifeTasks.length > 0 && lifeCompleted.length === lifeTasks.length;
  const dailyPoints = completed.reduce((sum, task) => sum + task.points, 0);

  if (perfect) {
    if (state.lastPerfectDate !== date) {
      state.lastPerfectDate = date;
      state.streak += 1;
    }
    awardRulePoints(state.pointRules.perfectDayBonus, "今日全部任务完成奖励", `perfect-${date}`);
  }
  if (lifePerfect) {
    awardRulePoints(state.pointRules.lifePerfectBonus, "生活习惯全部完成奖励", `life-perfect-${date}`);
  }
  if (state.streak >= 3) {
    awardRulePoints(state.pointRules.streak3Bonus, "连续 3 天满环奖励", "streak-3");
  }
  if (state.streak >= 7) {
    awardRulePoints(state.pointRules.streak7Bonus, "连续 7 天满环奖励", "streak-7");
  }

  const allIncomplete = tasks.length > 0 && notCompleted.length === tasks.length;
  const yesterday = shiftDate(date, -1);
  const yesterdayTasks = state.daily[yesterday] || [];
  const yesterdayIncomplete =
    yesterdayTasks.length > 0 && yesterdayTasks.every((task) => task.status === "not_completed");
  const lifeStreak = getCategoryPerfectStreak(date, "life");

  state.titleRules.filter((rule) => rule.active).forEach((rule) => {
    const threshold = Number(rule.threshold) || 1;
    let matched = false;
    let description = rule.description;
    if (rule.condition === "first_any_completed") matched = completed.length > 0;
    if (rule.condition === "perfect_day") matched = perfect;
    if (rule.condition === "streak_perfect") matched = state.streak >= threshold;
    if (rule.condition === "daily_completed_count") matched = completed.length >= threshold;
    if (rule.condition === "daily_points") matched = dailyPoints >= threshold;
    if (rule.condition === "all_life_completed") matched = lifePerfect;
    if (rule.condition === "life_streak") matched = lifeStreak >= threshold;
    if (rule.condition === "two_days_all_missed") matched = allIncomplete && yesterdayIncomplete;
    if (rule.condition === "same_task_completed_streak" || rule.condition === "same_task_missed_streak") {
      const status = rule.condition === "same_task_completed_streak" ? "completed" : "not_completed";
      const template = state.tasks.find((item) => getTaskStatusStreak(item.id, date, status) >= threshold);
      matched = Boolean(template);
      if (template) description = `${rule.description}「${template.title}」`;
    }
    if (matched) earnTitle(rule.name, rule.type, description, Number(rule.temporaryDays) || 0);
  });
}

function getCategoryPerfectStreak(date, category) {
  let streak = 0;
  for (let offset = 0; offset > -60; offset -= 1) {
    const items = state.daily[shiftDate(date, offset)] || [];
    const scoped = items.filter((task) => task.category === category);
    if (!scoped.length || !scoped.every((task) => task.status === "completed")) break;
    streak += 1;
  }
  return streak;
}

function getTaskStatusStreak(templateId, date, status) {
  let streak = 0;
  for (let offset = 0; offset > -60; offset -= 1) {
    const item = (state.daily[shiftDate(date, offset)] || []).find((task) => task.templateId === templateId);
    if (!item || item.status !== status) break;
    streak += 1;
  }
  return streak;
}

function shiftDate(date, offset) {
  const current = new Date(`${date}T12:00:00`);
  current.setDate(current.getDate() + offset);
  return current.toISOString().slice(0, 10);
}

function updateTaskStatus(taskId, status) {
  const tasks = currentTasks();
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;
  if (task.timerStartedAt) {
    task.timerSeconds = getTaskTimerSeconds(task);
    task.timerStartedAt = "";
  }
  if (task.status === status) {
    task.updatedAt = new Date().toISOString();
    saveState();
    render();
    return;
  }
  if (task.status === "completed" && status !== "completed") {
    addPointLog(-task.points, `改为未完成：${task.title}`, task.id);
  }
  if (task.status !== "completed" && status === "completed") {
    addPointLog(task.points, `完成任务：${task.title}`, task.id);
  }
  task.status = status;
  task.updatedAt = new Date().toISOString();
  task.completedAt = status === "completed" ? new Date().toISOString() : "";
  checkAchievements(state.selectedDate);
  saveState();
  render();
}

function submitDailyRecord(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const taskId = form.get("taskId");
  const task = currentTasks().find((item) => item.id === taskId);
  if (!task) return;
  const record = {};
  for (const [key, value] of form.entries()) {
    if (key === "taskId") continue;
    record[key] = String(value).trim();
  }
  task.record = record;
  updateTaskStatus(taskId, "completed");
}

function toggleTaskTimer(taskId) {
  const task = currentTasks().find((item) => item.id === taskId);
  if (!task) return;
  if (task.timerStartedAt) {
    task.timerSeconds = getTaskTimerSeconds(task);
    task.timerStartedAt = "";
  } else {
    task.timerStartedAt = new Date().toISOString();
  }
  task.updatedAt = new Date().toISOString();
  saveState();
  render();
}

function getTaskTimerSeconds(task) {
  const base = Number(task.timerSeconds) || 0;
  if (!task.timerStartedAt) return base;
  return base + Math.max(0, Math.floor((Date.now() - new Date(task.timerStartedAt).getTime()) / 1000));
}

function formatDuration(seconds) {
  const total = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`;
}

function submitTask(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const type = form.get("type");
  const task = {
    id: form.get("id") || crypto.randomUUID(),
    category: form.get("category") || "learning",
    type,
    title: form.get("title").trim(),
    subject: form.get("subject"),
    detail: form.get("detail").trim(),
    points: Number(form.get("points")) || 5,
    difficulty: form.get("difficulty"),
    repeatType: form.get("repeatType"),
    weekdays: [...document.querySelectorAll("[data-weekday].active")].map((btn) => Number(btn.dataset.weekday)),
    date: form.get("date"),
    active: form.get("active") === "on",
    createdAt: form.get("createdAt") || new Date().toISOString()
  };
  if (!task.title || !task.detail) return showToast("任务名称和详细内容都需要填写");
  if (task.type === "recurring" && task.repeatType === "weekly" && task.weekdays.length === 0) {
    return showToast("每周任务至少选择一天");
  }
  const exists = state.tasks.some((item) => item.id === task.id);
  state.tasks = exists ? state.tasks.map((item) => (item.id === task.id ? task : item)) : [task, ...state.tasks];
  state.daily = {};
  setState({ form: null, toast: exists ? "任务已更新" : "任务已添加" });
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  state.daily = {};
  setState({ toast: "任务已删除" });
}

function generateAiDetail() {
  const title = document.querySelector("[name='title']")?.value.trim() || "学习任务";
  const category = document.querySelector("[name='category']")?.value || "learning";
  const subject = document.querySelector("[name='subject']")?.value || "other";
  const minutes = subject === "reading" ? 20 : subject === "math" ? 15 : 18;
  const subjectText = subjectNames[subject] || "学习";
  const detail =
    category === "life"
      ? [
          `目标：养成一个稳定的生活习惯，完成「${title}」。`,
          "步骤：",
          "1. 先把需要整理或准备的东西放到眼前。",
          `2. 按顺序完成「${title}」，不要只做一半。`,
          "3. 完成后自己检查一遍，确认没有遗漏。",
          "4. 确认已经完成后，在今日任务里点击“完成”。"
        ].join("\n")
      : [
    `目标：完成一次 ${minutes} 分钟的${subjectText}练习。`,
    "步骤：",
    `1. 先看清楚今天要完成的内容，准备好课本、练习本和铅笔。`,
    `2. 专注完成「${title}」，中途尽量不离开座位。`,
    "3. 完成后自己检查一遍，把不会的地方标出来。",
    "4. 确认已经完成后，在今日任务里点击“完成”。"
  ].join("\n");
  document.querySelector("[name='detail']").value = detail;
}

function claimReward(id) {
  const reward = state.rewards.find((item) => item.id === id);
  if (!reward || state.points < reward.cost) return;
  addPointLog(-reward.cost, `兑换奖励：${reward.title}`, reward.id);
  state.rewardClaims.unshift({
    id: crypto.randomUUID(),
    rewardId: id,
    title: reward.title,
    cost: reward.cost,
    createdAt: new Date().toISOString()
  });
  setState({ toast: "奖励兑换已记录" });
}

function submitPointRules(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.pointRules = {
    perfectDayBonus: Number(form.get("perfectDayBonus")) || 0,
    streak3Bonus: Number(form.get("streak3Bonus")) || 0,
    streak7Bonus: Number(form.get("streak7Bonus")) || 0,
    lifePerfectBonus: Number(form.get("lifePerfectBonus")) || 0
  };
  setState({ toast: "积分奖励规则已保存" });
}

function submitReward(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const title = form.get("title").trim();
  const cost = Number(form.get("cost")) || 0;
  if (!title || cost <= 0) return showToast("奖励名称和积分都需要填写");
  state.rewards.unshift({ id: crypto.randomUUID(), title, cost, active: true });
  event.currentTarget.reset();
  setState({ toast: "奖励已添加" });
}

function deleteReward(id) {
  state.rewards = state.rewards.filter((reward) => reward.id !== id);
  setState({ toast: "奖励已删除" });
}

function submitTitleRule(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = form.get("name").trim();
  if (!name) return showToast("称号名称需要填写");
  state.titleRules.unshift({
    id: crypto.randomUUID(),
    name,
    type: form.get("type"),
    condition: form.get("condition"),
    threshold: Number(form.get("threshold")) || 1,
    description: form.get("description").trim() || conditionNames[form.get("condition")],
    active: true,
    temporaryDays: Number(form.get("temporaryDays")) || 0
  });
  event.currentTarget.reset();
  setState({ toast: "称号规则已添加" });
}

function deleteTitleRule(id) {
  state.titleRules = state.titleRules.filter((rule) => rule.id !== id);
  setState({ toast: "称号规则已删除" });
}

function toggleTitleRule(id) {
  state.titleRules = state.titleRules.map((rule) =>
    rule.id === id ? { ...rule, active: !rule.active } : rule
  );
  setState({ toast: "称号规则已更新" });
}

function submitLevelTitle(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = form.get("name").trim();
  const points = Number(form.get("points"));
  if (!name || Number.isNaN(points) || points < 0) return showToast("等级称号和积分门槛都需要填写");
  state.levelTitles.push({ id: crypto.randomUUID(), name, points });
  state.levelTitles.sort((a, b) => a.points - b.points);
  event.currentTarget.reset();
  setState({ toast: "积分等级称号已添加" });
}

function deleteLevelTitle(id) {
  if (state.levelTitles.length <= 1) return showToast("至少保留一个等级称号");
  state.levelTitles = state.levelTitles.filter((title) => title.id !== id);
  setState({ toast: "积分等级称号已删除" });
}

function showToast(message) {
  setState({ toast: message });
}

function render() {
  const viewHtml =
    state.view === "child" ? renderChild() : state.view === "parent" ? renderParent() : renderStats();
  document.querySelector("#app").innerHTML = `
    <main class="app-shell">
      ${renderTopbar()}
      ${viewHtml}
      ${state.toast ? `<div class="toast">${state.toast}</div>` : ""}
    </main>
  `;
  bindEvents();
  if (state.toast) {
    setTimeout(() => {
      state.toast = "";
      saveState();
      render();
    }, 2200);
  }
}

function renderTopbar() {
  return `
    <header class="topbar">
      <div class="brand">
        <h1>George的私人小助理</h1>
        <p>${state.selectedDate} · ${weekdays[new Date(`${state.selectedDate}T12:00:00`).getDay()]} · 当前称号：${getLevelTitle(state.points)}</p>
      </div>
      <nav class="tabs" aria-label="视图切换">
        <button class="tab ${state.view === "child" ? "active" : ""}" data-view="child">孩子端</button>
        <button class="tab ${state.view === "parent" ? "active" : ""}" data-view="parent">家长端</button>
        <button class="tab ${state.view === "stats" ? "active" : ""}" data-view="stats">任务统计</button>
      </nav>
    </header>
  `;
}

function renderChild() {
  const tasks = currentTasks();
  const completed = tasks.filter((task) => task.status === "completed").length;
  const learningCount = tasks.filter((task) => task.category !== "life").length;
  const lifeCount = tasks.filter((task) => task.category === "life").length;
  const taskPercent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const dailyPoints = tasks.filter((task) => task.status === "completed").reduce((sum, task) => sum + task.points, 0);
  const coreDone = tasks.some((task) => ["math", "reading", "english"].includes(task.subject) && task.status === "completed");
  return `
    <section class="layout">
      <div>
        <div class="metric-grid">
          ${metric("总积分", state.points)}
          ${metric("今日完成", `${completed}/${tasks.length}`)}
          ${metric("学习任务", learningCount)}
          ${metric("生活习惯", lifeCount)}
          ${metric("连续满环", `${state.streak} 天`)}
        </div>
        <div class="panel">
          <div class="section-title">
            <h2>今日圆环</h2>
            <span class="muted">完成全部任务可额外 +10 分</span>
          </div>
          <div class="rings">
            ${ring("任务环", `${completed}/${tasks.length}`, taskPercent, "#2f8f68")}
            ${ring("积分环", `${dailyPoints}/30`, Math.min(100, Math.round((dailyPoints / 30) * 100)), "#c28724")}
            ${ring("坚持环", coreDone ? "已点亮" : "待点亮", coreDone ? 100 : 0, "#3869b7")}
          </div>
          <div class="section-title">
            <h2>今日任务</h2>
            <input type="date" value="${state.selectedDate}" data-date-picker />
          </div>
          <div class="task-list">
            ${tasks.length ? tasks.map(renderTaskCard).join("") : `<div class="empty">今天还没有任务，家长端可以添加周期任务或临时任务。</div>`}
          </div>
        </div>
      </div>
      <aside class="side-stack">
        ${renderTitlesPanel()}
        ${renderRewardsPanel()}
      </aside>
    </section>
  `;
}

function metric(label, value) {
  return `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`;
}

function ring(label, value, percent, color) {
  return `
    <div class="ring">
      <div class="ring-mark" style="--value:${percent}%;--ring-color:${color}"></div>
      <div><strong>${label}</strong><span>${value}</span></div>
    </div>
  `;
}

function renderTaskCard(task) {
  const timerSeconds = getTaskTimerSeconds(task);
  return `
    <article class="task-card ${task.status}">
      <div class="task-head">
        <div>
          <h3>${escapeHtml(task.title)}</h3>
          <div class="badge-row">
            <span class="badge">${subjectNames[task.subject] || "其他"}</span>
            <span class="badge ${task.category === "life" ? "good" : ""}">${categoryNames[task.category] || "学习任务"}</span>
            <span class="badge gold">+${task.points} 分</span>
            <span class="badge ${task.status === "completed" ? "good" : task.status === "not_completed" ? "warn" : ""}">${statusText(task.status)}</span>
          </div>
        </div>
      </div>
      <div class="task-detail">${escapeHtml(task.detail)}</div>
      <form class="record-form" data-record-form>
        <input type="hidden" name="taskId" value="${task.id}" />
        ${renderRecordFields(task)}
        <div class="timer-row">
          <div>
            <strong data-timer-display="${task.id}" data-started-at="${task.timerStartedAt}" data-base-seconds="${task.timerSeconds || 0}">${formatDuration(timerSeconds)}</strong>
            <span class="muted">${task.timerStartedAt ? "计时中" : "已记录用时"}</span>
          </div>
          <button class="btn ghost" type="button" data-timer="${task.id}">${task.timerStartedAt ? "结束计时" : "开始计时"}</button>
        </div>
        <div class="actions">
          <button class="btn primary" type="submit">完成并保存</button>
          <button class="btn danger" type="button" data-status="${task.id}:not_completed">未完成</button>
        </div>
      </form>
      ${renderSavedRecord(task)}
    </article>
  `;
}

function renderRecordFields(task) {
  const record = task.record || {};
  const field = (name, label, type = "text", placeholder = "") => `
    <div class="field">
      <label>${label}</label>
      <input name="${name}" type="${type}" value="${escapeAttr(record[name] || "")}" placeholder="${escapeAttr(placeholder)}" />
    </div>
  `;
  const select = (name, label, options) => `
    <div class="field">
      <label>${label}</label>
      <select name="${name}">
        ${options.map((option) => `<option value="${escapeAttr(option)}" ${record[name] === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
      </select>
    </div>
  `;
  if (["reading", "chinese", "english"].includes(task.subject)) {
    return `<div class="record-grid">
      ${field("bookName", "书名", "text", "例如：神奇校车")}
      ${field("bookProgress", "本书进度", "number", "0-100")}
    </div>`;
  }
  if (task.subject === "go") {
    return `<div class="record-grid">
      ${field("goLevel", "围棋级别", "text", "例如：18级 / 5级 / 1段")}
      ${select("gameResult", "胜负情况", ["未填写", "胜", "负", "和棋", "练习题"])}
    </div>`;
  }
  if (task.subject === "piano") {
    return `<div class="record-grid">
      ${field("pieceName", "练习曲目", "text", "例如：小星星")}
      ${field("practiceCount", "练习遍数", "number", "例如：5")}
      ${field("pieceProgress", "曲目进度", "number", "0-100")}
    </div>`;
  }
  return `<div class="record-grid">
    ${field("note", "完成记录", "text", "简单写一下完成情况")}
  </div>`;
}

function renderSavedRecord(task) {
  if (task.status !== "completed") return "";
  const entries = Object.entries(task.record || {}).filter(([, value]) => value);
  const duration = getTaskTimerSeconds(task);
  if (!entries.length && !duration) return "";
  return `
    <div class="saved-record">
      <strong>已保存记录</strong>
      <div class="badge-row">
        ${duration ? `<span class="badge good">用时 ${formatDuration(duration)}</span>` : ""}
        ${entries.map(([key, value]) => `<span class="badge">${recordLabel(key)}：${escapeHtml(value)}${recordSuffix(key)}</span>`).join("")}
      </div>
    </div>
  `;
}

function recordLabel(key) {
  return {
    bookName: "书名",
    bookProgress: "进度",
    goLevel: "级别",
    gameResult: "胜负",
    pieceName: "曲目",
    practiceCount: "遍数",
    pieceProgress: "进度",
    note: "记录"
  }[key] || key;
}

function recordSuffix(key) {
  return ["bookProgress", "pieceProgress"].includes(key) ? "%" : "";
}

function renderTitlesPanel() {
  const activeTitles = state.titles.filter((title) => !title.expiresAt || new Date(title.expiresAt) > new Date());
  const hiddenSlots = Math.max(0, 4 - activeTitles.filter((title) => title.type === "hidden").length);
  return `
    <section class="panel">
      <div class="section-title"><h3>称号墙</h3><span class="muted">${activeTitles.length} 个</span></div>
      <div class="title-list">
        <div class="mini-card"><strong>${getLevelTitle(state.points)}</strong><p>积分等级称号，随着总积分自动升级。</p></div>
        ${activeTitles.map((title) => `<div class="mini-card ${title.type === "warning" ? "warning" : ""}"><strong>${escapeHtml(title.name)}</strong><p>${escapeHtml(title.description)}</p></div>`).join("")}
        ${Array.from({ length: hiddenSlots }).map(() => `<div class="mini-card"><strong>？？？</strong><p>隐藏称号，达成后自动揭晓。</p></div>`).join("")}
      </div>
    </section>
  `;
}

function renderRewardsPanel() {
  return `
    <section class="panel">
      <div class="section-title"><h3>奖励中心</h3><span class="muted">${state.points} 分可用</span></div>
      <div class="reward-list">
        ${state.rewards.map((reward) => `
          <div class="mini-card">
            <strong>${escapeHtml(reward.title)}</strong>
            <p>${reward.cost} 分</p>
            <div class="actions" style="margin-top:10px">
              <button class="btn blue" data-claim="${reward.id}" ${state.points < reward.cost ? "disabled" : ""}>兑换</button>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function getStatsData() {
  const rows = Object.entries(state.daily || {})
    .flatMap(([date, tasks]) => tasks.map((task) => ({ ...task, date })))
    .sort((a, b) => `${b.date}${b.updatedAt || ""}`.localeCompare(`${a.date}${a.updatedAt || ""}`));
  const completed = rows.filter((task) => task.status === "completed");
  const missed = rows.filter((task) => task.status === "not_completed");
  const pending = rows.filter((task) => task.status === "pending");
  const totalSeconds = completed.reduce((sum, task) => sum + getTaskTimerSeconds(task), 0);
  const totalPoints = completed.reduce((sum, task) => sum + (Number(task.points) || 0), 0);
  return {
    rows,
    completed,
    missed,
    pending,
    totalSeconds,
    totalPoints,
    completionRate: rows.length ? Math.round((completed.length / rows.length) * 100) : 0
  };
}

function groupStats(rows, keyFn, labelFn) {
  const map = new Map();
  rows.forEach((task) => {
    const key = keyFn(task) || "unknown";
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: labelFn(key, task),
        total: 0,
        completed: 0,
        missed: 0,
        pending: 0,
        points: 0,
        seconds: 0
      });
    }
    const item = map.get(key);
    item.total += 1;
    item.completed += task.status === "completed" ? 1 : 0;
    item.missed += task.status === "not_completed" ? 1 : 0;
    item.pending += task.status === "pending" ? 1 : 0;
    item.points += task.status === "completed" ? Number(task.points) || 0 : 0;
    item.seconds += task.status === "completed" ? getTaskTimerSeconds(task) : 0;
  });
  return [...map.values()].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}

function renderStats() {
  const stats = getStatsData();
  const byCategory = groupStats(stats.rows, (task) => task.category || "learning", (key) => categoryNames[key] || "学习任务");
  const bySubject = groupStats(stats.rows, (task) => task.subject || "other", (key) => subjectNames[key] || "其他");
  const byTask = groupStats(stats.rows, (task) => task.templateId || task.title, (_, task) => task.title);
  const byDate = groupStats(stats.rows, (task) => task.date, (key) => key).slice(0, 14);
  return `
    <section class="stats-stack">
      <div class="metric-grid">
        ${metric("任务总数", stats.rows.length)}
        ${metric("完成率", `${stats.completionRate}%`)}
        ${metric("已完成", stats.completed.length)}
        ${metric("未完成", stats.missed.length)}
        ${metric("累计积分", stats.totalPoints)}
        ${metric("累计用时", formatDuration(stats.totalSeconds))}
      </div>
      <div class="stats-grid">
        ${renderStatsPanel("按大类", byCategory)}
        ${renderStatsPanel("按科目", bySubject)}
      </div>
      <div class="stats-grid">
        ${renderStatsPanel("最近日期", byDate)}
        ${renderStatsPanel("按具体任务", byTask)}
      </div>
      <div class="panel">
        <div class="section-title">
          <h2>任务明细</h2>
          <span class="muted">最近 ${Math.min(stats.rows.length, 40)} 条记录</span>
        </div>
        <div class="stats-table">
          <div class="stats-row stats-head">
            <span>日期</span><span>任务</span><span>分类</span><span>状态</span><span>用时</span><span>积分</span>
          </div>
          ${stats.rows.slice(0, 40).map((task) => `
            <div class="stats-row">
              <span>${task.date}</span>
              <span>${escapeHtml(task.title)}</span>
              <span>${categoryNames[task.category] || "学习任务"} · ${subjectNames[task.subject] || "其他"}</span>
              <span>${statusText(task.status)}</span>
              <span>${task.status === "completed" ? formatDuration(getTaskTimerSeconds(task)) : "-"}</span>
              <span>${task.status === "completed" ? task.points : 0}</span>
            </div>
          `).join("") || `<div class="empty">还没有任务记录。</div>`}
        </div>
      </div>
    </section>
  `;
}

function renderStatsPanel(title, items) {
  return `
    <div class="panel">
      <div class="section-title">
        <h2>${title}</h2>
        <span class="muted">${items.length} 项</span>
      </div>
      <div class="stat-list">
        ${items.map(renderStatItem).join("") || `<div class="empty">暂无数据</div>`}
      </div>
    </div>
  `;
}

function renderStatItem(item) {
  const rate = item.total ? Math.round((item.completed / item.total) * 100) : 0;
  return `
    <div class="stat-item">
      <div class="stat-item-head">
        <strong>${escapeHtml(item.label)}</strong>
        <span>${rate}%</span>
      </div>
      <div class="progress-bar"><span style="width:${rate}%"></span></div>
      <div class="badge-row">
        <span class="badge good">完成 ${item.completed}</span>
        <span class="badge warn">未完成 ${item.missed}</span>
        <span class="badge">待完成 ${item.pending}</span>
        <span class="badge gold">${item.points} 分</span>
        <span class="badge">用时 ${formatDuration(item.seconds)}</span>
      </div>
    </div>
  `;
}

function renderParent() {
  return `
    <section class="parent-stack">
      <div class="parent-grid">
        <div class="panel">
          <div class="section-title">
            <h2>${state.form ? "编辑任务" : "新增任务"}</h2>
            ${state.form ? `<button class="btn ghost" data-cancel-form>取消</button>` : ""}
          </div>
          ${renderTaskForm()}
        </div>
        <div class="panel">
          <div class="section-title">
            <h2>任务设置</h2>
            <span class="muted">周期任务与临时任务</span>
          </div>
          <div class="manage-list">
            ${state.tasks.map(renderManageTask).join("")}
          </div>
        </div>
      </div>
      <div class="parent-grid">
        ${renderPointRulePanel()}
        ${renderRewardManagePanel()}
      </div>
      ${renderTitleRulePanel()}
    </section>
  `;
}

function renderPointRulePanel() {
  return `
    <div class="panel">
      <div class="section-title">
        <h2>积分奖励规则</h2>
        <span class="muted">完成任务积分之外的额外奖励</span>
      </div>
      <form class="form" data-point-rules-form>
        <div class="inline-fields">
          <div class="field">
            <label>当天全部任务完成</label>
            <input name="perfectDayBonus" type="number" min="0" value="${state.pointRules.perfectDayBonus}" />
          </div>
          <div class="field">
            <label>生活习惯全部完成</label>
            <input name="lifePerfectBonus" type="number" min="0" value="${state.pointRules.lifePerfectBonus}" />
          </div>
        </div>
        <div class="inline-fields">
          <div class="field">
            <label>连续 3 天满环</label>
            <input name="streak3Bonus" type="number" min="0" value="${state.pointRules.streak3Bonus}" />
          </div>
          <div class="field">
            <label>连续 7 天满环</label>
            <input name="streak7Bonus" type="number" min="0" value="${state.pointRules.streak7Bonus}" />
          </div>
        </div>
        <div class="actions">
          <button class="btn primary" type="submit">保存积分规则</button>
        </div>
      </form>
    </div>
  `;
}

function renderRewardManagePanel() {
  return `
    <div class="panel">
      <div class="section-title">
        <h2>奖励兑换设置</h2>
        <span class="muted">孩子端奖励中心会同步显示</span>
      </div>
      <form class="form compact-form" data-reward-form>
        <div class="inline-fields">
          <div class="field">
            <label>奖励名称</label>
            <input name="title" placeholder="例如：周末看一集动画" />
          </div>
          <div class="field">
            <label>所需积分</label>
            <input name="cost" type="number" min="1" placeholder="50" />
          </div>
        </div>
        <div class="actions"><button class="btn primary" type="submit">添加奖励</button></div>
      </form>
      <div class="manage-list rule-list">
        ${state.rewards.map((reward) => `
          <div class="mini-card">
            <strong>${escapeHtml(reward.title)}</strong>
            <p>${reward.cost} 分</p>
            <div class="actions" style="margin-top:10px">
              <button class="btn danger" data-delete-reward="${reward.id}">删除</button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderTitleRulePanel() {
  return `
    <div class="panel">
      <div class="section-title">
        <h2>称号勋章规则</h2>
        <span class="muted">学习任务和生活习惯都会参与判定</span>
      </div>
      <form class="form compact-form" data-level-title-form>
        <div class="section-title">
          <h3>积分等级称号</h3>
          <span class="muted">按总积分自动显示</span>
        </div>
        <div class="inline-fields">
          <div class="field">
            <label>称号名称</label>
            <input name="name" placeholder="例如：生活小队长" />
          </div>
          <div class="field">
            <label>积分门槛</label>
            <input name="points" type="number" min="0" placeholder="300" />
          </div>
        </div>
        <div class="actions"><button class="btn primary" type="submit">添加等级称号</button></div>
        <div class="badge-row">
          ${state.levelTitles.map((title) => `
            <span class="badge gold">${title.points} 分 · ${escapeHtml(title.name)} <button class="inline-delete" type="button" data-delete-level-title="${title.id}">×</button></span>
          `).join("")}
        </div>
      </form>
      <form class="form compact-form" data-title-rule-form>
        <div class="inline-fields">
          <div class="field">
            <label>称号名称</label>
            <input name="name" placeholder="例如：清爽小管家" />
          </div>
          <div class="field">
            <label>称号类型</label>
            <select name="type">
              ${Object.entries(titleTypeNames).map(([key, value]) => `<option value="${key}">${value}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="inline-fields">
          <div class="field">
            <label>触发条件</label>
            <select name="condition">
              ${Object.entries(conditionNames).map(([key, value]) => `<option value="${key}">${value}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label>阈值</label>
            <input name="threshold" type="number" min="1" value="1" />
          </div>
        </div>
        <div class="inline-fields">
          <div class="field">
            <label>临时显示天数</label>
            <input name="temporaryDays" type="number" min="0" value="0" />
          </div>
          <div class="field">
            <label>说明</label>
            <input name="description" placeholder="达成后显示给孩子看的说明" />
          </div>
        </div>
        <div class="actions"><button class="btn primary" type="submit">添加称号规则</button></div>
      </form>
      <div class="manage-list rule-list">
        ${state.titleRules.map((rule) => `
          <div class="mini-card ${rule.type === "warning" ? "warning" : ""}">
            <strong>${escapeHtml(rule.name)}</strong>
            <p>${titleTypeNames[rule.type]} · ${conditionNames[rule.condition]} · 阈值 ${rule.threshold}${rule.temporaryDays ? ` · 临时 ${rule.temporaryDays} 天` : ""}</p>
            <p>${escapeHtml(rule.description)}</p>
            <div class="actions" style="margin-top:10px">
              <button class="btn ghost" data-toggle-title-rule="${rule.id}">${rule.active ? "停用" : "启用"}</button>
              <button class="btn danger" data-delete-title-rule="${rule.id}">删除</button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderTaskForm() {
  const task = state.form || {
    id: "",
    category: "learning",
    type: "recurring",
    title: "",
    subject: "math",
    detail: "",
    points: 10,
    difficulty: "normal",
    repeatType: "daily",
    weekdays: [1, 2, 3, 4, 5],
    date: todayKey(),
    active: true,
    createdAt: ""
  };
  return `
    <form class="form" data-task-form>
      <input type="hidden" name="id" value="${task.id}" />
      <input type="hidden" name="createdAt" value="${task.createdAt || ""}" />
      <div class="inline-fields">
        <div class="field">
          <label>任务大类</label>
          <select name="category">
            ${Object.entries(categoryNames).map(([key, value]) => `<option value="${key}" ${task.category === key ? "selected" : ""}>${value}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>任务类型</label>
          <select name="type" data-form-type>
            <option value="recurring" ${task.type === "recurring" ? "selected" : ""}>周期循环</option>
            <option value="one_time" ${task.type === "one_time" ? "selected" : ""}>临时任务</option>
          </select>
        </div>
      </div>
      <div class="inline-fields">
        <div class="field">
          <label>科目</label>
          <select name="subject">
            ${Object.entries(subjectNames).map(([key, value]) => `<option value="${key}" ${task.subject === key ? "selected" : ""}>${value}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>任务名称</label>
          <input name="title" value="${escapeAttr(task.title)}" placeholder="例如：英语 Unit 3 听读 15 分钟" />
        </div>
      </div>
      <div class="inline-fields">
        <div class="field">
          <label>积分</label>
          <input name="points" type="number" min="1" max="100" value="${task.points}" />
        </div>
        <div class="field">
          <label>难度</label>
          <select name="difficulty">
            <option value="easy" ${task.difficulty === "easy" ? "selected" : ""}>简单</option>
            <option value="normal" ${task.difficulty === "normal" ? "selected" : ""}>普通</option>
            <option value="hard" ${task.difficulty === "hard" ? "selected" : ""}>较难</option>
          </select>
        </div>
      </div>
      <div class="field recurring-only">
        <label>循环规则</label>
        <select name="repeatType" data-repeat-type>
          <option value="daily" ${task.repeatType === "daily" ? "selected" : ""}>每天</option>
          <option value="weekly" ${task.repeatType === "weekly" ? "selected" : ""}>每周指定日期</option>
        </select>
      </div>
      <div class="field weekly-only">
        <label>每周日期</label>
        <div class="weekday-picker">
          ${weekdays.map((day, index) => `<button type="button" data-weekday="${index}" class="${task.weekdays?.includes(index) ? "active" : ""}">${day}</button>`).join("")}
        </div>
      </div>
      <div class="field one-time-only">
        <label>任务日期</label>
        <input name="date" type="date" value="${task.date || todayKey()}" />
      </div>
      <div class="field">
        <label>详细内容</label>
        <textarea name="detail" placeholder="写清楚孩子需要做什么、做到什么程度。">${escapeHtml(task.detail)}</textarea>
      </div>
      <div class="actions">
        <button class="btn blue" type="button" data-ai-detail>AI 生成详情</button>
        <button class="btn primary" type="submit">保存任务</button>
        <label class="btn ghost"><input name="active" type="checkbox" ${task.active ? "checked" : ""} /> 启用</label>
      </div>
    </form>
  `;
}

function renderManageTask(task) {
  const rule =
    task.type === "one_time"
      ? `临时 · ${task.date}`
      : task.repeatType === "daily"
        ? "周期 · 每天"
        : `周期 · 每周${task.weekdays.map((day) => weekdays[day]).join("、")}`;
  return `
    <article class="task-card">
      <div class="task-head">
        <div>
          <h3>${escapeHtml(task.title)}</h3>
          <div class="badge-row">
            <span class="badge">${rule}</span>
            <span class="badge ${task.category === "life" ? "good" : ""}">${categoryNames[task.category] || "学习任务"}</span>
            <span class="badge">${subjectNames[task.subject]}</span>
            <span class="badge gold">${task.points} 分</span>
            <span class="badge ${task.active ? "good" : "warn"}">${task.active ? "启用" : "停用"}</span>
          </div>
        </div>
      </div>
      <div class="task-detail">${escapeHtml(task.detail)}</div>
      <div class="actions">
        <button class="btn blue" data-edit="${task.id}">编辑</button>
        <button class="btn danger" data-delete="${task.id}">删除</button>
      </div>
    </article>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setState({ view: button.dataset.view }));
  });
  document.querySelector("[data-date-picker]")?.addEventListener("change", (event) => {
    setState({ selectedDate: event.target.value });
  });
  document.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", () => {
      const [id, status] = button.dataset.status.split(":");
      updateTaskStatus(id, status);
    });
  });
  document.querySelectorAll("[data-record-form]").forEach((form) => {
    form.addEventListener("submit", submitDailyRecord);
  });
  document.querySelectorAll("[data-timer]").forEach((button) => {
    button.addEventListener("click", () => toggleTaskTimer(button.dataset.timer));
  });
  document.querySelectorAll("[data-claim]").forEach((button) => {
    button.addEventListener("click", () => claimReward(button.dataset.claim));
  });
  document.querySelector("[data-task-form]")?.addEventListener("submit", submitTask);
  document.querySelector("[data-point-rules-form]")?.addEventListener("submit", submitPointRules);
  document.querySelector("[data-reward-form]")?.addEventListener("submit", submitReward);
  document.querySelector("[data-title-rule-form]")?.addEventListener("submit", submitTitleRule);
  document.querySelector("[data-level-title-form]")?.addEventListener("submit", submitLevelTitle);
  document.querySelector("[data-ai-detail]")?.addEventListener("click", generateAiDetail);
  document.querySelector("[data-form-type]")?.addEventListener("change", updateFormVisibility);
  document.querySelector("[data-repeat-type]")?.addEventListener("change", updateFormVisibility);
  document.querySelectorAll("[data-weekday]").forEach((button) => {
    button.addEventListener("click", () => button.classList.toggle("active"));
  });
  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = state.tasks.find((item) => item.id === button.dataset.edit);
      setState({ form: structuredClone(task) });
    });
  });
  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteTask(button.dataset.delete));
  });
  document.querySelectorAll("[data-delete-reward]").forEach((button) => {
    button.addEventListener("click", () => deleteReward(button.dataset.deleteReward));
  });
  document.querySelectorAll("[data-delete-title-rule]").forEach((button) => {
    button.addEventListener("click", () => deleteTitleRule(button.dataset.deleteTitleRule));
  });
  document.querySelectorAll("[data-toggle-title-rule]").forEach((button) => {
    button.addEventListener("click", () => toggleTitleRule(button.dataset.toggleTitleRule));
  });
  document.querySelectorAll("[data-delete-level-title]").forEach((button) => {
    button.addEventListener("click", () => deleteLevelTitle(button.dataset.deleteLevelTitle));
  });
  document.querySelector("[data-cancel-form]")?.addEventListener("click", () => setState({ form: null }));
  updateFormVisibility();
  startTimerDisplayLoop();
}

let timerDisplayLoop = null;

function startTimerDisplayLoop() {
  if (timerDisplayLoop) clearInterval(timerDisplayLoop);
  timerDisplayLoop = setInterval(() => {
    document.querySelectorAll("[data-timer-display]").forEach((item) => {
      const startedAt = item.dataset.startedAt;
      const base = Number(item.dataset.baseSeconds) || 0;
      const elapsed = startedAt
        ? base + Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
        : base;
      item.textContent = formatDuration(elapsed);
    });
  }, 1000);
}

function updateFormVisibility() {
  const type = document.querySelector("[data-form-type]")?.value;
  const repeatType = document.querySelector("[data-repeat-type]")?.value;
  document.querySelectorAll(".recurring-only").forEach((item) => {
    item.hidden = type !== "recurring";
  });
  document.querySelectorAll(".weekly-only").forEach((item) => {
    item.hidden = type !== "recurring" || repeatType !== "weekly";
  });
  document.querySelectorAll(".one-time-only").forEach((item) => {
    item.hidden = type !== "one_time";
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value = "") {
  return escapeHtml(value);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

render();
