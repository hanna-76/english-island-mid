/* ============================================================
 * app.js —— 中档版主应用控制器
 *
 * 职责：
 *   1. 管理页面切换（首页/玩法选择/主题选择/游戏/结算）
 *   2. 协调各游戏模块（听音找图/配对/拼词）
 *   3. 处理结算逻辑（记录成绩、解锁主题、错题本入口）
 *   4. 绑定全局按钮（静音、退出）
 *
 * 页面流程：
 *   首页 → 选择玩法 → 选择主题 → 游戏进行 → 结算 → 重玩/回首页
 * ============================================================ */

const App = {

  /* ----------------------------------------------------------
   * taskType
   * 当前选中的玩法类型，由 pickTask() 设置。
   * 可选值：
   *   "listening" —— 听音找图（3~5岁也可用）
   *   "match"     —— 词图配对（6~8岁）
   *   "spell"     —— 拼单词（6~8岁）
   * 默认值 "listening"，确保用户不选玩法也能开始。
   * ---------------------------------------------------------- */
  taskType: "listening",

  /* ----------------------------------------------------------
   * init()
   * 应用初始化入口，在页面 DOM 加载完成后被调用。
   * 做三件事：
   *   1. 初始化音频管理器（读取静音状态、加载英语发音人）
   *   2. 绑定右上角静音按钮的点击事件
   *   3. 显示首页
   * 参数：无
   * 返回：无
   * ---------------------------------------------------------- */
  init() {
    AudioManager.init();
    const btnMute = document.getElementById("btnMute");
    btnMute.onclick = () => {
      AudioManager.toggleMute();
      btnMute.textContent = AudioManager.muted ? "🔇" : "🔊";
    };
    this.showHome();
  },

  /* ----------------------------------------------------------
   * showScreen(id)
   * 切换当前显示的屏幕（页面）。
   * 原理：所有屏幕都在同一个 HTML 里，用 class="active" 控制显示。
   *       先移除所有屏幕的 active 类，再给目标屏幕加上。
   * 参数：
   *   id —— 目标屏幕的 DOM id，如 "screenHome"、"screenGame"
   * 返回：无
   * ---------------------------------------------------------- */
  showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  },

  /* ----------------------------------------------------------
   * showHome()
   * 显示首页。首页包含游戏标题、开始按钮、档次说明。
   * 参数：无
   * 返回：无
   * ---------------------------------------------------------- */
  showHome() { this.showScreen("screenHome"); },

  /* ----------------------------------------------------------
   * showTaskSelect()
   * 显示玩法选择页面。用户可以选择听音找图、词图配对、拼单词。
   * 参数：无
   * 返回：无
   * ---------------------------------------------------------- */
  showTaskSelect() {
    this.showScreen("screenTask");
  },

  /* ----------------------------------------------------------
   * pickTask(task)
   * 用户点击某个玩法卡片时调用。
   * 记录当前玩法类型，然后跳转到主题选择页面。
   * 参数：
   *   task —— 玩法标识字符串，"listening" / "match" / "spell"
   * 返回：无
   * ---------------------------------------------------------- */
  pickTask(task) {
    this.taskType = task;
    this.showThemeSelect();
  },

  /* ----------------------------------------------------------
   * showThemeSelect()
   * 显示主题选择页面，动态生成所有主题卡片。
   * 逻辑：
   *   1. 从 localStorage 读取已解锁的主题列表
   *   2. 遍历 THEMES 数组，为每个主题创建一个按钮卡片
   *   3. 未解锁的主题显示 🔒 图标且不可点击
   *   4. 已解锁的主题显示单词数量，点击后开始游戏
   * 参数：无
   * 返回：无
   * 依赖：Store.load()、THEMES（来自 data.js）
   * ---------------------------------------------------------- */
  showThemeSelect() {
    this.showScreen("screenTheme");
    const wrap = document.getElementById("themeGrid");
    wrap.innerHTML = "";
    const unlocked = Store.load().unlockedThemes || [THEMES[0].id];
    THEMES.forEach(t => {
      const locked = !unlocked.includes(t.id);
      const btn = document.createElement("button");
      btn.className = "theme-card" + (locked ? " locked" : "");
      btn.innerHTML = `
        <span class="emoji">${t.icon}</span>
        <span>${t.name}</span>
        ${locked ? "<small>🔒 通关解锁</small>" : `<small>${t.words.length} 词</small>`}
      `;
      if (!locked) btn.onclick = () => this.startGame(t);
      wrap.appendChild(btn);
    });
  },

  /* ----------------------------------------------------------
   * startGame(theme)
   * 根据当前选中的玩法类型，启动对应的游戏模块。
   * 每个游戏模块都接收一个 finish 回调，游戏结束时调用。
   * 参数：
   *   theme —— 主题对象（来自 THEMES 数组），包含 id/name/icon/words
   * 返回：无
   * 依赖：GameListening、GameMatch、GameSpell（各自的游戏模块）
   * ---------------------------------------------------------- */
  startGame(theme) {
    const finish = (c, t) => this.showResult(theme, c, t);
    if (this.taskType === "listening") GameListening.start(theme, "normal", finish);
    else if (this.taskType === "match") GameMatch.start(theme, finish);
    else if (this.taskType === "spell") GameSpell.start(theme, finish);
    this.showScreen("screenGame");
  },

  /* ----------------------------------------------------------
   * showProgress(cur, total)
   * 更新游戏页面顶部的进度条宽度。
   * 参数：
   *   cur   —— 当前题号（从1开始）
   *   total —— 本轮总题数
   * 返回：无
   * 说明：进度条宽度 = 当前题数 / 总题数 × 100%
   * ---------------------------------------------------------- */
  showProgress(cur, total) {
    document.getElementById("progressBar").style.width = (cur / total * 100) + "%";
  },

  /* ----------------------------------------------------------
   * showResult(theme, correct, total)
   * 游戏结束后显示结算页面。
   * 做以下几件事：
   *   1. 调用 Store.recordRound() 把本轮成绩写入 localStorage
   *   2. 如果正确率 ≥60%，解锁下一个主题
   *   3. 计算星星数量（≥80%得3星，≥60%得2星，否则1星）
   *   4. 显示得分、正确率、历史正确率
   *   5. 如果有错题，显示错题本复习入口
   * 参数：
   *   theme   —— 本轮游戏的主题对象
   *   correct —— 答对题数
   *   total   —— 本轮总题数
   * 返回：无
   * 依赖：Store（storage.js）
   * ---------------------------------------------------------- */
  showResult(theme, correct, total) {
    Store.recordRound(theme.id, this.taskType, correct, total);
    // 通关 60% 解锁下一个主题
    const accuracy = total > 0 ? correct / total : 0;
    if (accuracy >= 0.6) {
      const idx = THEMES.findIndex(t => t.id === theme.id);
      if (idx >= 0 && idx + 1 < THEMES.length) Store.unlockTheme(THEMES[idx + 1].id);
    }

    const acc = Math.round(correct / total * 100);
    let stars = acc >= 80 ? 3 : acc >= 60 ? 2 : 1;
    let starStr = "";
    for (let i = 0; i < 3; i++) starStr += i < stars ? "⭐" : "☆";

    this.showScreen("screenResult");
    document.getElementById("resultText").innerHTML = `
      <div class="stars">${starStr}</div>
      <p class="result-score">${correct} / ${total} 正确</p>
      <p class="result-acc">正确率 ${acc}% · 历史正确率 ${Store.getAccuracy}%</p>
    `;

    // 错题复习入口：如果错题本非空，显示复习按钮
    const wrongBox = document.getElementById("wrongReviewBox");
    const wrong = Store.getWrongWords();
    if (wrong.length > 0) {
      wrongBox.style.display = "block";
      wrongBox.textContent = `📕 错题本：${wrong.length} 个词（点我复习）`;
      wrongBox.onclick = () => this.reviewWrong();
    } else {
      wrongBox.style.display = "none";
    }
  },

  /* ----------------------------------------------------------
   * reviewWrong()
   * 进入错题复习模式。
   * 逻辑：
   *   1. 从 localStorage 读取所有错词
   *   2. 把错词列表包装成一个"虚拟主题"对象
   *   3. 用听音找图的简单模式（2张图）来复习错词
   *   4. 复习结束后同样走结算流程
   * 参数：无
   * 返回：无
   * 说明：复习模式下答对的词会被自动移出错题本（在 game-listening.js 中处理）
   * ---------------------------------------------------------- */
  reviewWrong() {
    const wrong = Store.getWrongWords();
    if (wrong.length === 0) return;
    const fakeTheme = { id: "review", name: "错题复习", icon: "📕", words: wrong };
    GameListening.start(fakeTheme, "easy", (c, t) => this.showResult(fakeTheme, c, t));
    this.showScreen("screenGame");
  },

  /* ----------------------------------------------------------
   * confirmExit()
   * 用户点击游戏页面的退出按钮时调用。
   * 弹出确认对话框，防止误触丢失进度。
   * 参数：无
   * 返回：无
   * 说明：用户点"确定"则返回首页，点"取消"则留在当前游戏页面
   * ---------------------------------------------------------- */
  confirmExit() {
    if (confirm("要退出这一关吗？未保存的进度会丢失哦~")) this.showHome();
  }
};

/* ----------------------------------------------------------
 * 页面加载完成事件
 * 当浏览器把 HTML 全部解析完、DOM 树构建好之后，
 * 自动调用 App.init() 启动应用。
 * 这样确保所有 getElementById 都能找到对应的元素。
 * ---------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", () => App.init());
