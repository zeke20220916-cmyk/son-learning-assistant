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
  habit: "习惯",
  other: "其他"
};

const levelTitles = [
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
  tasks: [
    {
      id: crypto.randomUUID(),
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
  if (!raw) return structuredClone(defaultState);
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(raw), view: "child", toast: "" };
  } catch {
    return structuredClone(defaultState);
  }
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
      templateId: task.id,
      title: task.title,
      subject: task.subject,
      detail: task.detail,
      points: Number(task.points) || 0,
      difficulty: task.difficulty,
      status: "pending",
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
  return levelTitles.reduce((current, item) => (points >= item[0] ? item : current), levelTitles[0])[1];
}

function addPointLog(points, reason, sourceId) {
  state.points += points;
  state.pointLogs.unshift({
    id: crypto.randomUUID(),
    points,
    reason,
    sourceId,
    createdAt: new Date().toISOString()
  });
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
  const perfect = tasks.length > 0 && completed.length === tasks.length;

  if (completed.length > 0) earnTitle("起步之星", "achievement", "第一次完成学习任务。");
  if (perfect) {
    earnTitle("今日全胜", "achievement", "第一次完成当天全部任务。");
    earnTitle("小小坚持家", "hidden", "隐藏称号：完成一次完整学习日。");
    if (state.lastPerfectDate !== date) {
      addPointLog(10, "今日全部任务完成奖励", `perfect-${date}`);
      state.lastPerfectDate = date;
      state.streak += 1;
    }
  }

  if (state.streak >= 3) earnTitle("三日连胜", "achievement", "连续 3 天完成全部任务。");
  if (state.streak >= 7) earnTitle("一周满环", "achievement", "连续 7 天完成全部任务。");
  if (completed.length >= 5) earnTitle("高效小火箭", "achievement", "单日完成 5 个任务。");
  if (completed.reduce((sum, task) => sum + task.points, 0) >= 50) {
    earnTitle("积分冲刺王", "achievement", "单日任务积分达到 50 分。");
  }

  const allIncomplete = tasks.length > 0 && notCompleted.length === tasks.length;
  const yesterday = shiftDate(date, -1);
  const yesterdayTasks = state.daily[yesterday] || [];
  const yesterdayIncomplete =
    yesterdayTasks.length > 0 && yesterdayTasks.every((task) => task.status === "not_completed");
  if (allIncomplete && yesterdayIncomplete) {
    earnTitle("拖沓王", "warning", "连续两天所有任务都未完成，重新点亮一天就会翻篇。", 3);
  }

  state.tasks.forEach((template) => {
    const recent = [-2, -1, 0]
      .map((offset) => state.daily[shiftDate(date, offset)] || [])
      .map((items) => items.find((item) => item.templateId === template.id))
      .filter(Boolean);
    if (recent.length >= 3 && recent.every((item) => item.status === "not_completed")) {
      earnTitle("任务躲猫猫大师", "warning", `连续几次没有完成「${template.title}」。`, 3);
    }
    if (recent.length >= 3 && recent.every((item) => item.status === "completed")) {
      earnTitle("稳定输出", "hidden", `隐藏称号：连续完成「${template.title}」。`);
    }
  });
}

function shiftDate(date, offset) {
  const current = new Date(`${date}T12:00:00`);
  current.setDate(current.getDate() + offset);
  return current.toISOString().slice(0, 10);
}

function updateTaskStatus(taskId, status) {
  const tasks = currentTasks();
  const task = tasks.find((item) => item.id === taskId);
  if (!task || task.status === status) return;
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

function submitTask(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const type = form.get("type");
  const task = {
    id: form.get("id") || crypto.randomUUID(),
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
  const subject = document.querySelector("[name='subject']")?.value || "other";
  const minutes = subject === "reading" ? 20 : subject === "math" ? 15 : 18;
  const subjectText = subjectNames[subject] || "学习";
  const detail = [
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

function showToast(message) {
  setState({ toast: message });
}

function render() {
  document.querySelector("#app").innerHTML = `
    <main class="app-shell">
      ${renderTopbar()}
      ${state.view === "child" ? renderChild() : renderParent()}
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
      </nav>
    </header>
  `;
}

function renderChild() {
  const tasks = currentTasks();
  const completed = tasks.filter((task) => task.status === "completed").length;
  const taskPercent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const dailyPoints = tasks.filter((task) => task.status === "completed").reduce((sum, task) => sum + task.points, 0);
  const coreDone = tasks.some((task) => ["math", "reading", "english"].includes(task.subject) && task.status === "completed");
  return `
    <section class="layout">
      <div>
        <div class="metric-grid">
          ${metric("总积分", state.points)}
          ${metric("今日完成", `${completed}/${tasks.length}`)}
          ${metric("连续满环", `${state.streak} 天`)}
          ${metric("等级", getLevelTitle(state.points))}
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
  return `
    <article class="task-card ${task.status}">
      <div class="task-head">
        <div>
          <h3>${escapeHtml(task.title)}</h3>
          <div class="badge-row">
            <span class="badge">${subjectNames[task.subject] || "其他"}</span>
            <span class="badge gold">+${task.points} 分</span>
            <span class="badge ${task.status === "completed" ? "good" : task.status === "not_completed" ? "warn" : ""}">${statusText(task.status)}</span>
          </div>
        </div>
      </div>
      <div class="task-detail">${escapeHtml(task.detail)}</div>
      <div class="actions">
        <button class="btn primary" data-status="${task.id}:completed">完成</button>
        <button class="btn danger" data-status="${task.id}:not_completed">未完成</button>
      </div>
    </article>
  `;
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

function renderParent() {
  return `
    <section class="parent-grid">
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
    </section>
  `;
}

function renderTaskForm() {
  const task = state.form || {
    id: "",
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
          <label>任务类型</label>
          <select name="type" data-form-type>
            <option value="recurring" ${task.type === "recurring" ? "selected" : ""}>周期循环</option>
            <option value="one_time" ${task.type === "one_time" ? "selected" : ""}>临时任务</option>
          </select>
        </div>
        <div class="field">
          <label>科目</label>
          <select name="subject">
            ${Object.entries(subjectNames).map(([key, value]) => `<option value="${key}" ${task.subject === key ? "selected" : ""}>${value}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="field">
        <label>任务名称</label>
        <input name="title" value="${escapeAttr(task.title)}" placeholder="例如：英语 Unit 3 听读 15 分钟" />
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
  document.querySelectorAll("[data-claim]").forEach((button) => {
    button.addEventListener("click", () => claimReward(button.dataset.claim));
  });
  document.querySelector("[data-task-form]")?.addEventListener("submit", submitTask);
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
  document.querySelector("[data-cancel-form]")?.addEventListener("click", () => setState({ form: null }));
  updateFormVisibility();
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
