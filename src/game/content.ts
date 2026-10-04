export type Language = "zh" | "en";
export type Pair = readonly [string, string];
// Sentence punctuation is trimmed per authored line including exported ticket lines
export function cleanLine(value: string): string {
  return value.split("\n").map(line => line.replace(/[\p{P}\s]+$/u, "")).join("\n");
}
export const companions = {
  cat: { name: ["奶油小猫", "Creamy Cat"] as Pair, line: ["今天就到这里，也很好", "Enough for today is enough"] as Pair },
  bunny: { name: ["松松小兔", "Mellow Bunny"] as Pair, line: ["慢一点，也会到达", "Your own pace will get you there"] as Pair },
  duck: { name: ["躺躺小鸭", "Daydream Duck"] as Pair, line: ["偶尔什么都不做，也可以", "Doing nothing can be lovely too"] as Pair },
};
export const worries = [
  { label: ["工作太累", "Work wore me out"] as Pair, detail: ["今天的电量，用完了", "My battery is empty today"] as Pair, buddy: "cat" as const },
  { label: ["想得太多", "Too many thoughts"] as Pair, detail: ["脑袋里，有好多小剧场", "My mind has too many tabs open"] as Pair, buddy: "bunny" as const },
  { label: ["心里下雨", "A rainy kind of day"] as Pair, detail: ["说不上来，就是有点闷", "I cannot explain it I just feel grey"] as Pair, buddy: "duck" as const },
  { label: ["想歇一会", "I need a little rest"] as Pair, detail: ["不用有理由，也可以来", "No reason needed you are welcome here"] as Pair, buddy: "cat" as const },
];
type Thought = { word: Pair; reply: Pair };
const thought = (zh: string, en: string, zhReply: string, enReply: string): Thought => ({ word: [zh, en], reply: [zhReply, enReply] });
export const thoughts: Thought[][] = [
  [
    thought("还没做完", "Not done yet", "没做完的，明天再说", "Tomorrow can hold the unfinished bits"),
    thought("又要开会", "Another meeting", "先给自己开个休息会", "Time for a tiny meeting with rest"),
    thought("快来不及", "Running late", "先呼吸，再往前走", "Breathe first then take the next step"),
    thought("不能出错", "No mistakes", "你不是一台机器", "You are a person with a heartbeat"),
    thought("消息好多", "So many pings", "这会儿，先听听自己的心", "For a moment listen to yourself"),
    thought("再加个班", "Stay late again", "今天的电量，可以用完", "It is okay to have an empty battery"),
    thought("我得更快", "Go faster", "不用每一步都跑着走", "Every step does not have to be a sprint"),
    thought("别人好强", "They do more", "你的努力，也有自己的光", "Your effort has its own little glow"),
    thought("周一好远", "Monday again", "今天，先过好这一小会", "Just be here for this little moment"),
    thought("下班也累", "Still tired", "累了，就让肩膀落下来", "Let those tired shoulders drop"),
    thought("还要证明", "Prove myself", "你不用一直证明自己", "You do not have to prove yourself all day"),
    thought("今天够吗", "Was it enough", "够了，今天真的辛苦了", "It was enough you did a lot today"),
  ],
  [
    thought("万一呢", "What if", "还没发生的，先交给风", "Let the breeze hold the what ifs"),
    thought("再想一下", "Think again", "让脑袋休个小假", "Give your mind a tiny holiday"),
    thought("他怎么想", "What they think", "别人的脑袋，不归你打扫", "Other minds are not yours to tidy"),
    thought("说错了吗", "Did I say it wrong", "一句话，不是你的全部", "One sentence is not the whole of you"),
    thought("必须完美", "Be perfect", "不用满分，也值得喜欢", "You deserve kindness without full marks"),
    thought("如果当时", "If only", "那时的你，已经尽力了", "The you back then did what they could"),
    thought("还要确认", "Check again", "现在，可以先相信自己", "For now give yourself a little trust"),
    thought("未来好远", "The future", "先照顾这一刻的自己", "Care for the you who is here right now"),
    thought("睡不着啦", "Wide awake", "不用急着让脑袋安静", "Your mind can settle in its own time"),
    thought("想太多了", "Too many tabs", "慢慢关掉，一页就好", "Close just one little tab for now"),
    thought("会后悔吗", "Will I regret it", "每个选择，都能慢慢长大", "You can grow gently with any choice"),
    thought("还没答案", "No answer yet", "没有答案，也可以先休息", "Rest is allowed before the answers"),
  ],
  [
    thought("有点委屈", "Feeling small", "委屈也值得被抱一抱", "Your tender feelings deserve a hug"),
    thought("没人懂我", "No one gets it", "小毛团在这里，陪你一会", "Our little fluff is here with you"),
    thought("怎么又哭", "Tears again", "眼泪，是心里的小雨", "Tears are a little rain for your heart"),
    thought("开心好难", "Hard to smile", "今天，不用勉强开心", "You do not have to force a smile today"),
    thought("不想说话", "No words today", "那就一起安静一会", "Let us be quiet together for a while"),
    thought("心里好闷", "Feeling grey", "给心开一扇小窗", "Open one tiny window for your heart"),
    thought("是不是我", "Is it me", "你值得被温柔对待", "You deserve to be treated gently"),
    thought("又想起了", "Old memories", "想起也没关系，轻轻放下", "Remember softly then set it down"),
    thought("好像落单", "Left out", "这块软毛巾，给你留了位置", "There is a place for you on this towel"),
    thought("雨下不停", "Endless rain", "雨会停，先给自己撑把伞", "For now give yourself a little shelter"),
    thought("抱抱好吗", "Need a hug", "抱抱你，慢慢来", "A gentle hug take all the time you need"),
    thought("会好吗", "Will it pass", "先让今天，变轻一点点", "Let today become just a little lighter"),
  ],
  [
    thought("休息有罪", "Rest feels wrong", "休息不用申请", "Rest does not need permission"),
    thought("应该勤快", "Stay busy", "你不是一张待办清单", "You are more than a to do list"),
    thought("还没资格", "Not earned it", "休息是需要，不是奖励", "Rest is a need you do not have to earn"),
    thought("浪费时间", "Wasting time", "发会呆，也是在充电", "Daydreaming is a little recharge"),
    thought("再撑一下", "Push through", "可以先靠在软毛巾上", "You can lean on this soft towel first"),
    thought("怕落后了", "Falling behind", "你的节奏，可以慢一点", "Your own rhythm can be a little slower"),
    thought("停不下来", "Cannot stop", "先停一口深呼吸那么久", "Pause for the length of one deep breath"),
    thought("必须有用", "Be useful", "光是存在，就已经很好", "Simply being here is already lovely"),
    thought("躺着不行", "No lying down", "小鸭说，躺躺也挺好的", "Our duck says lounging is lovely"),
    thought("还有好多", "So much left", "世界可以等你一小会", "The world can wait for you a moment"),
    thought("明天再歇", "Rest tomorrow", "今天的你，也值得被照顾", "The you of today deserves care too"),
    thought("就歇一下", "Just one break", "好呀，这一会都属于你", "Yes this little moment is all yours"),
  ],
];
