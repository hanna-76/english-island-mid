/* ============================================================
 * game-spell.js —— 拼单词游戏模块
 *
 * 适用年龄：6~8 岁
 * 游戏规则：
 *   1. 屏幕显示一个 emoji 图片和中文释义
 *   2. 下方有一排打乱顺序的字母按钮（正确字母 + 2 个干扰字母）
 *   3. 儿童按正确顺序点击字母，字母会依次填入上方的空格槽
 *   4. 填完所有空格后自动判断：
 *      - 拼对：空格变绿，播放 "spell great!"，1.2 秒后下一题
 *      - 拼错：空格变红，播放 "try again!"，1.2 秒后重置本题重拼
 *   5. 每轮 10 题，只选长度 3~6 的单词（适合 6~8 岁拼写难度）
 *
 * 交互细节：
 *   - 已点击的字母按钮会变灰禁用，不可重复选
 *   - 可以点击"听发音"按钮重播单词发音
 *   - 拼错后本题重置，字母按钮恢复可点
 * ============================================================ */

const GameSpell = {

  /* ----------------------------------------------------------
   * 游戏状态变量
   * ---------------------------------------------------------- */
  questions: [],   // 本轮题目数组（单词对象）
  index: 0,        // 当前题号
  correct: 0,      // 答对题数
  theme: null,     // 当前主题对象
  onFinish: null,  // 结束回调 (correct, total)
  pickedCount: 0,  // 当前题已填入的字母数
  currentWord: null, // 当前题的单词对象
  slotEls: null,   // 当前题的空格槽 DOM 元素集合

  /* ----------------------------------------------------------
   * start(theme, onFinish)
   * 开始一轮拼词游戏。
   * 初始化逻辑：
   *   1. 保存主题和结束回调
   *   2. 重置题号和答对数
   *   3. 从主题词表中筛选长度 3~6 的单词（太短太简单，太长太难）
   *   4. 从筛选结果中随机抽取 10 个作为题目
   *   5. 渲染第一题
   * 参数：
   *   theme    —— 主题对象
   *   onFinish —— 结束回调 (correct, total)
   * 返回：无
   * ---------------------------------------------------------- */
  start(theme, onFinish) {
    this.theme = theme;
    this.onFinish = onFinish;
    this.index = 0;
    this.correct = 0;
    // 只选长度 3~6 的单词，适合 6~8 岁儿童拼写
    const pool = theme.words.filter(w => w.en.length >= 3 && w.en.length <= 6);
    this.questions = sample(pool, Math.min(10, pool.length));
    this.renderQuestion();
  },

  /* ----------------------------------------------------------
   * renderQuestion()
   * 渲染一道拼词题的完整界面。
   * 界面包含：
   *   1. emoji 大图（提示单词含义）
   *   2. 中文释义文字
   *   3. "听发音"重播按钮
   *   4. 空格槽（数量 = 单词长度，每个槽显示一个下划线）
   *   5. 字母按钮区（正确字母 + 2 个干扰字母，打乱顺序）
   *
   * 同时自动播放单词发音。
   *
   * 参数：无
   * 返回：无
   * 依赖：App.showProgress()、AudioManager.speak()、sample()、shuffle()
   * ---------------------------------------------------------- */
  renderQuestion() {
    const q = this.questions[this.index];
    const total = this.questions.length;
    App.showProgress(this.index + 1, total);

    // 渲染界面骨架
    const stage = document.getElementById("stage");
    stage.innerHTML = `
      <div class="spell-box">
        <div class="spell-emoji">${renderWordImage(q)}</div>
        <p class="q-cn">拼出这个单词：${q.zh}</p>
        <button class="btn-replay" id="btnReplay">🔊 听发音</button>
        <div class="spell-slots" id="slots"></div>
        <div class="spell-letters" id="letters"></div>
      </div>
    `;

    // 自动播放发音
    AudioManager.speak(q.en);
    // 重播按钮
    document.getElementById("btnReplay").onclick = () => AudioManager.speak(q.en);

    // 创建空格槽：数量等于单词字母数
    const slots = document.getElementById("slots");
    for (let i = 0; i < q.en.length; i++) {
      const s = document.createElement("div");
      s.className = "slot";
      slots.appendChild(s);
    }

    // 生成字母按钮：正确字母 + 2 个随机干扰字母，然后打乱顺序
    const correctLetters = q.en.split("");
    const extras = sample("abcdefghijklmnopqrstuvwxyz".split(""), 2);
    const letters = shuffle([...correctLetters, ...extras]);

    const lettersBox = document.getElementById("letters");
    // 重置本题的状态变量
    this.pickedCount = 0;
    this.currentWord = q;
    this.slotEls = slots.querySelectorAll(".slot");

    // 渲染每个字母按钮
    letters.forEach(letter => {
      const btn = document.createElement("button");
      btn.className = "letter-btn";
      btn.textContent = letter;
      btn.onclick = () => this.pickLetter(btn, letter);
      lettersBox.appendChild(btn);
    });
  },

  /* ----------------------------------------------------------
   * pickLetter(btn, letter)
   * 儿童点击一个字母按钮时调用。
   * 处理逻辑：
   *   1. 找到下一个空的空格槽（按 pickedCount 索引）
   *   2. 如果没有空格槽了或按钮已禁用，直接返回
   *   3. 把字母填入空格槽
   *   4. 禁用该字母按钮（变灰，不可重复点）
   *   5. 已填字母数 +1
   *   6. 如果已经填满所有空格：
   *      - 收集所有槽里的字母拼成字符串
   *      - 与正确答案比较
   *      - 拼对：计分、变绿、鼓励、移出错题本、1.2秒后下一题
   *      - 拼错：变红、提示、记入错题本、1.2秒后重置本题
   *
   * 参数：
   *   btn    —— 被点击的字母按钮 DOM 元素
   *   letter —— 该按钮上的字母字符串
   * 返回：无
   * ---------------------------------------------------------- */
  pickLetter(btn, letter) {
    // 找到下一个要填的空格槽
    const slot = this.slotEls[this.pickedCount];
    if (!slot || btn.disabled) return;

    // 填入字母，禁用按钮
    slot.textContent = letter;
    btn.disabled = true;
    this.pickedCount++;

    // 检查是否已经填满所有空格
    if (this.pickedCount >= this.currentWord.en.length) {
      const answer = this.currentWord.en;
      // 收集所有槽里的字母拼成字符串
      const typed = [...this.slotEls].map(s => s.textContent).join("");

      if (typed === answer) {
        // ===== 拼对 =====
        this.correct++;
        this.slotEls.forEach(s => s.classList.add("right"));
        AudioManager.speak(answer + "! spell great!");
        // 如果该词之前在错题本里，答对后移除
        if (Store.removeWrong) Store.removeWrong(answer);
        setTimeout(() => this.next(), 1200);
      } else {
        // ===== 拼错 =====
        this.slotEls.forEach(s => s.classList.add("wrong"));
        AudioManager.speak("try again!");
        // 记入错题本
        if (Store.recordWrong) Store.recordWrong(this.currentWord);
        // 1.2 秒后重置本题，让儿童重新拼
        setTimeout(() => {
          this.renderQuestion();
        }, 1200);
      }
    }
  },

  /* ----------------------------------------------------------
   * next()
   * 进入下一题，或全部做完后触发结束回调。
   * 参数：无
   * 返回：无
   * ---------------------------------------------------------- */
  next() {
    this.index++;
    if (this.index >= this.questions.length) {
      if (this.onFinish) this.onFinish(this.correct, this.questions.length);
    } else {
      this.renderQuestion();
    }
  }
};
