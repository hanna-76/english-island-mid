/* ============================================================
 * data.js —— 中档题库：5 个主题 × 20 词 = 100 词
 * 主题：动物、水果、颜色、食物、交通工具
 *
 * 数据结构说明：
 *   THEMES 是一个数组，每个元素是一个主题对象。
 *   主题对象包含：
 *     id    —— 主题唯一标识（英文，用于存储和逻辑判断）
 *     name  —— 主题中文名（显示在界面上）
 *     icon  —— 主题图标（emoji，显示在主题卡片上）
 *     words —— 该主题下的单词数组
 *
 *   每个单词对象包含：
 *     en    —— 英文单词（用于发音和拼写）
 *     zh    —— 中文释义（显示在题目提示中）
 *     emoji —— 单词对应的图标（作为图片选项显示）
 * ============================================================ */

const THEMES = [
  {
    id: "animals",
    name: "动物",
    icon: "🐾",
    words: [
      { en: "cat",    zh: "猫",   emoji: "🐱" },
      { en: "dog",    zh: "狗",   emoji: "🐶" },
      { en: "duck",   zh: "鸭子", emoji: "🦆" },
      { en: "rabbit", zh: "兔子", emoji: "🐰" },
      { en: "fish",   zh: "鱼",   emoji: "🐟" },
      { en: "bird",   zh: "鸟",   emoji: "🐦" },
      { en: "bear",   zh: "熊",   emoji: "🐻" },
      { en: "panda",  zh: "熊猫", emoji: "🐼" },
      { en: "monkey", zh: "猴子", emoji: "🐵" },
      { en: "elephant", zh: "大象", emoji: "🐘" },
      { en: "horse",  zh: "马",   emoji: "🐴" },
      { en: "cow",    zh: "牛",   emoji: "🐮" },
      { en: "pig",    zh: "猪",   emoji: "🐷" },
      { en: "sheep",  zh: "羊",   emoji: "🐑" },
      { en: "chicken", zh: "鸡",  emoji: "🐔" },
      { en: "tiger",  zh: "老虎", emoji: "🐯" },
      { en: "lion",   zh: "狮子", emoji: "🦁" },
      { en: "zebra",  zh: "斑马", emoji: "🦓" },
      { en: "giraffe", zh: "长颈鹿", emoji: "🦒" },
      { en: "snake",  zh: "蛇",   emoji: "🐍" }
    ]
  },
  {
    id: "fruits",
    name: "水果",
    icon: "🍎",
    words: [
      { en: "apple",  zh: "苹果", emoji: "🍎" },
      { en: "banana", zh: "香蕉", emoji: "🍌" },
      { en: "orange", zh: "橙子", emoji: "🍊" },
      { en: "grape",  zh: "葡萄", emoji: "🍇" },
      { en: "watermelon", zh: "西瓜", emoji: "🍉" },
      { en: "strawberry", zh: "草莓", emoji: "🍓" },
      { en: "peach",  zh: "桃子", emoji: "🍑" },
      { en: "pear",   zh: "梨",   emoji: "🍐" },
      { en: "lemon",  zh: "柠檬", emoji: "🍋" },
      { en: "cherry", zh: "樱桃", emoji: "🍒" },
      { en: "mango",  zh: "芒果", emoji: "🥭" },
      { en: "pineapple", zh: "菠萝", emoji: "🍍" },
      { en: "coconut", zh: "椰子", emoji: "🥥" },
      { en: "kiwi",   zh: "猕猴桃", emoji: "🥝" },
      { en: "tomato", zh: "西红柿", emoji: "🍅" },
      { en: "blueberry", zh: "蓝莓", emoji: "🫐" },
      { en: "plum",   zh: "李子", emoji: "🍑" },
      { en: "apricot", zh: "杏",  emoji: "🍑" },
      { en: "fig",    zh: "无花果", emoji: "🍇" },
      { en: "melon",  zh: "甜瓜", emoji: "🍈" }
    ]
  },
  {
    id: "colors",
    name: "颜色",
    icon: "🎨",
    words: [
      { en: "red",    zh: "红色", emoji: "🔴" },
      { en: "blue",   zh: "蓝色", emoji: "🔵" },
      { en: "yellow", zh: "黄色", emoji: "🟡" },
      { en: "green",  zh: "绿色", emoji: "🟢" },
      { en: "purple", zh: "紫色", emoji: "🟣" },
      { en: "orange", zh: "橙色", emoji: "🟠" },
      { en: "pink",   zh: "粉色", emoji: "🌸" },
      { en: "black",  zh: "黑色", emoji: "⚫" },
      { en: "white",  zh: "白色", emoji: "⚪" },
      { en: "brown",  zh: "棕色", emoji: "🟤" },
      { en: "gold",   zh: "金色", emoji: "🟡" },
      { en: "silver", zh: "银色", emoji: "⚪" },
      { en: "gray",   zh: "灰色", emoji: "🌫️" },
      { en: "cream",  zh: "米色", emoji: "🍦" },
      { en: "olive",  zh: "橄榄绿", emoji: "🫒" },
      { en: "navy",   zh: "藏青色", emoji: "🔵" },
      { en: "teal",   zh: "青绿色", emoji: "🟢" },
      { en: "coral",  zh: "珊瑚色", emoji: "🟠" },
      { en: "maroon", zh: "栗色", emoji: "🔴" },
      { en: "indigo", zh: "靛蓝色", emoji: "🟣" }
    ]
  },
  {
    id: "food",
    name: "食物",
    icon: "🍔",
    words: [
      { en: "bread",  zh: "面包", emoji: "🍞" },
      { en: "milk",   zh: "牛奶", emoji: "🥛" },
      { en: "egg",    zh: "鸡蛋", emoji: "🥚" },
      { en: "cake",   zh: "蛋糕", emoji: "🍰" },
      { en: "rice",   zh: "米饭", emoji: "🍚" },
      { en: "noodle", zh: "面条", emoji: "🍜" },
      { en: "candy",  zh: "糖果", emoji: "🍬" },
      { en: "icecream", zh: "冰淇淋", emoji: "🍦" },
      { en: "cheese", zh: "奶酪", emoji: "🧀" },
      { en: "juice",  zh: "果汁", emoji: "🧃" },
      { en: "cookie", zh: "饼干", emoji: "🍪" },
      { en: "pizza",  zh: "披萨", emoji: "🍕" },
      { en: "hamburger", zh: "汉堡", emoji: "🍔" },
      { en: "hotdog", zh: "热狗", emoji: "🌭" },
      { en: "fries",  zh: "薯条", emoji: "🍟" },
      { en: "soup",   zh: "汤",   emoji: "🍲" },
      { en: "salad",  zh: "沙拉", emoji: "🥗" },
      { en: "sandwich", zh: "三明治", emoji: "🥪" },
      { en: "donut",  zh: "甜甜圈", emoji: "🍩" },
      { en: "popcorn", zh: "爆米花", emoji: "🍿" }
    ]
  },
  {
    id: "vehicles",
    name: "交通工具",
    icon: "🚗",
    words: [
      { en: "car",     zh: "汽车", emoji: "🚗" },
      { en: "bus",     zh: "公交车", emoji: "🚌" },
      { en: "bike",    zh: "自行车", emoji: "🚲" },
      { en: "train",   zh: "火车", emoji: "🚆" },
      { en: "plane",   zh: "飞机", emoji: "✈️" },
      { en: "ship",    zh: "轮船", emoji: "🚢" },
      { en: "taxi",    zh: "出租车", emoji: "🚕" },
      { en: "truck",   zh: "卡车", emoji: "🚚" },
      { en: "motorcycle", zh: "摩托车", emoji: "🏍️" },
      { en: "subway",  zh: "地铁", emoji: "🚇" },
      { en: "boat",    zh: "小船", emoji: "⛵" },
      { en: "rocket",  zh: "火箭", emoji: "🚀" },
      { en: "ambulance", zh: "救护车", emoji: "🚑" },
      { en: "police",  zh: "警车", emoji: "🚓" },
      { en: "fireengine", zh: "消防车", emoji: "🚒" },
      { en: "helicopter", zh: "直升机", emoji: "🚁" },
      { en: "scooter", zh: "滑板车", emoji: "🛴" },
      { en: "tractor", zh: "拖拉机", emoji: "🚜" },
      { en: "van",     zh: "面包车", emoji: "🚐" },
      { en: "tram",    zh: "电车", emoji: "🚋" }
    ]
  }
];

/* ------------------------------------------------------------
 * getThemesByLevel()
 * 作用：返回当前档次可用的全部主题列表。
 * 参数：无（中档固定返回 THEMES 全部5个主题）。
 * 返回：主题对象数组。
 * 说明：低档/高档版本中此函数会根据 level 参数过滤主题，
 *       中档因为只有5个主题，直接全部返回即可。
 * ------------------------------------------------------------ */
function getThemesByLevel() { return THEMES; }

/* ------------------------------------------------------------
 * sample(arr, n)
 * 作用：从数组 arr 中随机抽取 n 个不重复的元素。
 * 参数：
 *   arr —— 源数组（不会被修改，函数内部会复制一份）
 *   n   —— 要抽取的元素个数
 * 返回：包含 n 个随机元素的新数组（如果源数组不足 n 个，则返回全部）。
 * 算法：
 *   1. 复制源数组到 copy，避免修改原数据
 *   2. 循环 n 次，每次随机生成一个索引
 *   3. 把该索引对应的元素从 copy 中移除并加入结果
 *   4. 这样保证每次抽到的元素都不重复
 * 使用场景：
 *   - 从主题词表中抽10道题
 *   - 生成干扰项选项
 * ------------------------------------------------------------ */
function sample(arr, n) {
  const copy = arr.slice();
  const result = [];
  while (result.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

/* ------------------------------------------------------------
 * shuffle(arr)
 * 作用：打乱数组中元素的顺序（Fisher-Yates 洗牌算法）。
 * 参数：
 *   arr —— 要打乱的数组（不会被修改，函数内部会复制一份）
 * 返回：元素顺序被随机打乱的新数组。
 * 算法（Fisher-Yates）：
 *   1. 从数组最后一个元素开始向前遍历
 *   2. 对每个位置 i，随机生成一个 0~i 之间的索引 j
 *   3. 交换位置 i 和位置 j 的元素
 *   4. 这样每个元素出现在每个位置的概率相等
 * 使用场景：
 *   - 打乱题目顺序
 *   - 打乱选项顺序
 *   - 打乱配对游戏中的单词列
 * ------------------------------------------------------------ */
function shuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
