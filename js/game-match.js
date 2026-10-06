/* ============================================================
 * game-match.js —— 词图配对游戏模块
 *
 * 适用年龄：6~8 岁
 * 游戏规则：
 *   1. 屏幕左侧显示 5 张 emoji 图片
 *   2. 屏幕右侧显示 5 个打乱顺序的英文单词
 *   3. 儿童先点一张图，再点一个单词，系统判断是否配对
 *   4. 配对成功：两个卡片变绿、禁用，播放单词发音
 *   5. 配对失败：两个卡片变红、抖动，0.6 秒后恢复可点
 *   6. 5 对全部配对完成后，进入下一组（共 5 组）
 *   7. 全部组完成后结算
 *
 * 计分方式：每成功配对一对得 1 分，满分 = 组数 × 每组对数
 * ============================================================ */

const GameMatch = {

  /* ----------------------------------------------------------
   * 游戏状态变量
   * ---------------------------------------------------------- */
  questions: [],    // 本轮的题目数组（每组是一个单词对象，共5个）
  index: 0,         // 当前组号（从 0 开始）
  correct: 0,       // 累计成功配对数
  theme: null,      // 当前主题对象
  onFinish: null,   // 结束回调 (correct, total)
  pickedImg: null,  // 当前选中的图片卡片 { btn, word }，未选中时为 null
  pickedWord: null, // 当前选中的单词卡片 { btn, word }，未选中时为 null
  totalRounds: 5,   // 总组数（固定5组）
  matchedInRound: 0, // 当前组已配对成功的数量（用于进度条显示）

  /* ----------------------------------------------------------
   * start(theme, onFinish)
   * 开始一轮词图配对游戏。
   * 初始化逻辑：
   *   1. 保存主题和结束回调
   *   2. 重置组号和配对成功数
   *   3. 从主题词表中随机抽取 5 个单词作为一组题目
   *      （注意：这里的 questions 是"一组"的 5 个词，
   *        每做完一组就重新抽 5 个，共做 5 组）
   *   4. 渲染第一组
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
    this.matchedInRound = 0;
    // 抽取 5 个单词作为当前组的配对内容
    this.questions = sample(theme.words, Math.min(5, theme.words.length));
    this.renderRound();
  },

  /* ----------------------------------------------------------
   * renderRound()
   * 渲染一组配对题的界面。
   * 界面布局：
   *   - 顶部：提示文字 "把图片和单词连起来！"
   *   - 左侧列 (imgCol)：5 张 emoji 图片按钮（顺序固定）
   *   - 右侧列 (wordCol)：5 个英文单词按钮（顺序打乱）
   *
   * 交互逻辑：
   *   - 每张图和每个单词都可以独立点击
   *   - 点击后记录选中状态，等两边都选中后自动调用 checkPair() 判断
   *
   * 参数：无
   * 返回：无
   * 依赖：App.showProgress()、shuffle()
   * ---------------------------------------------------------- */
  renderRound() {
    const pairWords = this.questions;
    // 重置当前选中状态
    this.pickedImg = null;
    this.pickedWord = null;

    // 更新进度条（总进度 = 之前组的配对数 + 当前组已配对数 / 总配对数）
    const totalPairs = this.totalRounds * this.questions.length;
    const donePairs = this.index * this.questions.length + this.matchedInRound;
    App.showProgress(donePairs, totalPairs);

    // 渲染界面骨架
    const stage = document.getElementById("stage");
    stage.innerHTML = `
      <p class="q-cn">把图片和单词连起来！</p>
      <div class="match-board">
        <div class="match-col" id="imgCol"></div>
        <div class="match-col" id="wordCol"></div>
      </div>
    `;

    const imgCol = document.getElementById("imgCol");
    const wordCol = document.getElementById("wordCol");

    // 左侧：渲染图片列（顺序不打乱，保持原始顺序）
    pairWords.forEach((w) => {
      const imgBtn = document.createElement("button");
      imgBtn.className = "match-img";
      imgBtn.dataset.en = w.en;
      imgBtn.innerHTML = renderWordImage(w, "small");
      imgBtn.onclick = () => this.pickImg(imgBtn, w);
      imgCol.appendChild(imgBtn);
    });

    // 右侧：渲染单词列（用 shuffle 打乱顺序，增加难度）
    shuffle(pairWords).forEach(w => {
      const wBtn = document.createElement("button");
      wBtn.className = "match-word";
      wBtn.dataset.en = w.en;
      wBtn.textContent = w.en;
      wBtn.onclick = () => this.pickWord(wBtn, w);
      wordCol.appendChild(wBtn);
    });
  },

  /* ----------------------------------------------------------
   * pickImg(btn, word)
   * 儿童点击左侧图片时调用。
   * 处理：
   *   1. 清除其他图片的选中状态（同一时间只能选一张图）
   *   2. 给当前点击的图片添加 "selected" 高亮类
   *   3. 记录选中的图片和对应单词
   *   4. 调用 checkPair() 检查是否两边都已选中
   * 参数：
   *   btn  —— 被点击的图片按钮 DOM 元素
   *   word —— 该图片对应的单词对象
   * 返回：无
   * ---------------------------------------------------------- */
  pickImg(btn, word) {
    document.querySelectorAll(".match-img").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    this.pickedImg = { btn, word };
    this.checkPair();
  },

  /* ----------------------------------------------------------
   * pickWord(btn, word)
   * 儿童点击右侧单词时调用。逻辑与 pickImg 对称。
   * 参数：
   *   btn  —— 被点击的单词按钮 DOM 元素
   *   word —— 该单词对应的单词对象
   * 返回：无
   * ---------------------------------------------------------- */
  pickWord(btn, word) {
    document.querySelectorAll(".match-word").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    this.pickedWord = { btn, word };
    this.checkPair();
  },

  /* ----------------------------------------------------------
   * checkPair()
   * 检查当前选中的图片和单词是否配对成功。
   * 只有当 pickedImg 和 pickedWord 都不为 null 时才判断。
   *
   * 配对成功处理：
   *   1. 配对成功数 +1
   *   2. 两个卡片都添加 "matched" 类（变绿、半透明）
   *   3. 播放单词发音作为正反馈
   *   4. 禁用两个按钮（不可再点）
   *   5. 清空选中状态
   *   6. 检查是否还有未配对的卡片：
   *      - 如果全部配对完，0.8 秒后进入下一组或结算
   *      - 否则等待儿童继续配对
   *
   * 配对失败处理：
   *   1. 两个卡片都添加 "wrong" 类（变红）
   *   2. 播放 "try again!" 提示
   *   3. 0.6 秒后清除错误和选中状态，恢复可点
   *   4. 清空选中状态
   *
   * 参数：无
   * 返回：无
   * ---------------------------------------------------------- */
  checkPair() {
    // 只有两边都选中了才判断
    if (!this.pickedImg || !this.pickedWord) return;

    if (this.pickedImg.word.en === this.pickedWord.word.en) {
      // ===== 配对成功 =====
      this.correct++;
      this.matchedInRound++;
      this.pickedImg.btn.classList.add("matched");
      this.pickedWord.btn.classList.add("matched");
      AudioManager.speak(this.pickedImg.word.en);
      // 禁用已配对的卡片
      this.pickedImg.btn.disabled = true;
      this.pickedWord.btn.disabled = true;
      // 清空选中状态
      this.pickedImg = null;
      this.pickedWord = null;

      // 更新进度条
      const totalPairs = this.totalRounds * this.questions.length;
      const donePairs = this.index * this.questions.length + this.matchedInRound;
      App.showProgress(donePairs, totalPairs);

      // 检查这一组是否全部配对完成
      const remaining = document.querySelectorAll(".match-img:not(.matched)");
      if (remaining.length === 0) {
        // 全部配对完，0.8 秒后进入下一组或结算
        setTimeout(() => {
          this.index++;
          this.matchedInRound = 0;
          if (this.index >= this.totalRounds) {
            // 全部组做完，触发结束回调（总题数 = 组数 × 每组对数）
            if (this.onFinish) this.onFinish(this.correct, this.totalRounds * this.questions.length);
          } else {
            // 还有下一组，重新抽取 5 个词并渲染
            this.questions = sample(this.theme.words, Math.min(5, this.theme.words.length));
            this.renderRound();
          }
        }, 800);
      }
    } else {
      // ===== 配对失败 =====
      this.pickedImg.btn.classList.add("wrong");
      this.pickedWord.btn.classList.add("wrong");
      AudioManager.speak("try again!");
      // 保存引用，因为下面要清空选中状态
      const img = this.pickedImg, w = this.pickedWord;
      // 0.6 秒后恢复：清除错误和选中高亮
      setTimeout(() => {
        img.btn.classList.remove("wrong", "selected");
        w.btn.classList.remove("wrong", "selected");
      }, 600);
      // 立即清空选中状态，允许儿童重新选择
      this.pickedImg = null;
      this.pickedWord = null;
    }
  }
};
