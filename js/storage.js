/* ============================================================
 * storage.js —— 本地存储管理器（localStorage 封装）
 *
 * 作用：把游戏数据持久化到浏览器的 localStorage 中，
 *       关闭页面后重新打开，数据仍然存在。
 *
 * 存储的数据结构：
 *   {
 *     bestScore:      { "animals_listen": 8, ... },  // 各主题各玩法的最高分
 *     unlockedThemes: ["animals", "fruits", ...],     // 已解锁的主题 id 列表
 *     wrongWords:     [ {en, zh, emoji}, ... ],       // 错题本（答错的单词）
 *     totalRounds:    10,                              // 累计完成的游戏轮数
 *     totalCorrect:   75,                              // 累计答对题数
 *     totalAnswered:  100                              // 累计答题总数
 *   }
 *
 * 注意：
 *   - 所有方法都做了 try-catch，localStorage 不可用时静默失败
 *   - 数据以 JSON 字符串形式存储，读取时解析回对象
 * ============================================================ */

const Store = {

  /* ----------------------------------------------------------
   * KEY
   * localStorage 中存储数据的键名。
   * 加版本号 v1 是为了以后数据结构变更时可以区分旧数据。
   * ---------------------------------------------------------- */
  KEY: "english_island_data_v1",

  /* ----------------------------------------------------------
   * load()
   * 从 localStorage 读取全部游戏数据。
   * 处理逻辑：
   *   1. 尝试读取并解析 JSON 字符串
   *   2. 如果读取失败（数据损坏或不存在），返回默认的空数据结构
   *   3. 默认解锁第一个主题（animals），确保用户一开始就能玩
   * 参数：无
   * 返回：游戏数据对象（结构见文件头注释）
   * ---------------------------------------------------------- */
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* 忽略损坏数据，返回默认值 */ }
    return {
      bestScore: {},               // 各主题各玩法的最高分，key 格式 "主题id_玩法"
      unlockedThemes: ["animals"], // 已解锁主题 id 列表，默认解锁动物主题
      wrongWords: [],              // 错题本，存储答错的单词对象
      totalRounds: 0,              // 累计完成轮数
      totalCorrect: 0,             // 累计答对题数
      totalAnswered: 0             // 累计答题总数
    };
  },

  /* ----------------------------------------------------------
   * save(data)
   * 把游戏数据对象保存到 localStorage。
   * 参数：
   *   data —— 完整的游戏数据对象（结构见文件头注释）
   * 返回：无
   * 说明：数据会被序列化为 JSON 字符串后存储。
   *       如果 localStorage 已满或不可用，静默失败不报错。
   * ---------------------------------------------------------- */
  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) { /* 存储空间不足时静默失败 */ }
  },

  /* ----------------------------------------------------------
   * recordRound(themeId, taskType, correct, total)
   * 记录一轮游戏的结果。
   * 做以下更新：
   *   1. 更新该主题该玩法的最高分（只升不降）
   *   2. 累计完成轮数 +1
   *   3. 累计答对题数 += correct
   *   4. 累计答题总数 += total
   *   5. 保存到 localStorage
   * 参数：
   *   themeId  —— 主题 id，如 "animals"
   *   taskType —— 玩法类型，如 "listening"、"match"、"spell"
   *   correct  —— 本轮答对题数
   *   total    —— 本轮总题数
   * 返回：更新后的完整数据对象
   * ---------------------------------------------------------- */
  recordRound(themeId, taskType, correct, total) {
    const data = this.load();
    const key = themeId + "_" + taskType;
    // 最高分只升不降：如果之前没有记录，或本次成绩更高，则更新
    if (!data.bestScore[key] || correct > data.bestScore[key]) {
      data.bestScore[key] = correct;
    }
    data.totalRounds += 1;
    data.totalCorrect += correct;
    data.totalAnswered += total;
    this.save(data);
    return data;
  },

  /* ----------------------------------------------------------
   * recordWrong(wordObj)
   * 把一个答错的单词加入错题本。
   * 去重逻辑：如果该单词已经在错题本里，就不重复添加。
   * 参数：
   *   wordObj —— 单词对象，格式 { en: "cat", zh: "猫", emoji: "🐱" }
   * 返回：无
   * ---------------------------------------------------------- */
  recordWrong(wordObj) {
    const data = this.load();
    // 同一单词不重复记录：用 en 字段判断是否已存在
    if (!data.wrongWords.find(w => w.en === wordObj.en)) {
      data.wrongWords.push(wordObj);
      this.save(data);
    }
  },

  /* ----------------------------------------------------------
   * removeWrong(wordEn)
   * 把一个单词从错题本中移除（表示已经掌握）。
   * 参数：
   *   wordEn —— 单词的英文，如 "cat"
   * 返回：无
   * 说明：在听音找图游戏中答对后会自动调用此方法。
   * ---------------------------------------------------------- */
  removeWrong(wordEn) {
    const data = this.load();
    // 用 filter 过滤掉指定英文的单词
    data.wrongWords = data.wrongWords.filter(w => w.en !== wordEn);
    this.save(data);
  },

  /* ----------------------------------------------------------
   * unlockTheme(themeId)
   * 解锁一个主题。如果该主题已经解锁，则不重复添加。
   * 参数：
   *   themeId —— 要解锁的主题 id，如 "fruits"
   * 返回：无
   * 触发条件：在 app.js 的 showResult() 中，正确率 ≥60% 时解锁下一个主题
   * ---------------------------------------------------------- */
  unlockTheme(themeId) {
    const data = this.load();
    if (!data.unlockedThemes.includes(themeId)) {
      data.unlockedThemes.push(themeId);
      this.save(data);
    }
  },

  /* ----------------------------------------------------------
   * getWrongWords()
   * 获取错题本中的全部单词。
   * 参数：无
   * 返回：错词对象数组，如 [ {en:"cat",zh:"猫",emoji:"🐱"}, ... ]
   * ---------------------------------------------------------- */
  getWrongWords() {
    return this.load().wrongWords;
  },

  /* ----------------------------------------------------------
   * getAccuracy()
   * 计算历史整体正确率。
   * 公式：正确率 = 累计答对题数 / 累计答题总数 × 100%，四舍五入取整。
   * 参数：无
   * 返回：正确率百分比整数，如 75 表示 75%。如果从未答过题，返回 0。
   * ---------------------------------------------------------- */
  getAccuracy() {
    const data = this.load();
    if (data.totalAnswered === 0) return 0;
    return Math.round((data.totalCorrect / data.totalAnswered) * 100);
  }
};
