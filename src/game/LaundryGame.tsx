import { useEffect, useRef, useState, type PointerEvent, type ComponentType, type ReactNode, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeftIcon, Cross2Icon, DownloadIcon, SpeakerLoudIcon, SpeakerOffIcon, HeartIcon, CheckIcon } from "@radix-ui/react-icons";
import { companions, worries, thoughts, cleanLine, type Language } from "./content";
export type ScrollProps = { className?: string; children: ReactNode };
export type SheetProps = { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; snap?: number; children: ReactNode };

type Stage = "home" | "choose" | "scrub" | "bubbles" | "spin" | "dry" | "result";
type Buddy = "cat" | "bunny" | "duck";
type Saved = { buddy: Buddy; worry: string; worryId?: number; softness: number; date: string; dateISO?: string; kg: string };
const A = `${import.meta.env.BASE_URL}assets/laundry/`;
const STORAGE = "worry-laundry-shelf-v1";
const points = [[23, 12], [73, 25], [24, 57], [72, 68]];
function readShelf(): Saved[] {
  try { const v = JSON.parse(localStorage.getItem(STORAGE) || "[]"); return Array.isArray(v) ? v.filter(x => x && ["cat", "bunny", "duck"].includes(x.buddy)) : []; } catch { return []; }
}

export function LaundryGame({ Scroll, Sheet, beforeNavigate = () => {}, web = false }: { Scroll: ComponentType<ScrollProps>; Sheet: ComponentType<SheetProps>; beforeNavigate?: () => void; web?: boolean }) {
  const [language, setLanguage] = useState<Language>(() => { try { const saved = localStorage.getItem("worry-laundry-language"); if (saved === "zh" || saved === "en") return saved; } catch {} return navigator.language.startsWith("zh") ? "zh" : "en"; });
  const t = (zh: string, en: string) => cleanLine(language === "zh" ? zh : en);
  const localized = (pair: readonly [string, string]) => t(pair[0], pair[1]);
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<Stage>("home");
  const [choice, setChoice] = useState(0);
  const [shelf, setShelf] = useState<Saved[]>(readShelf);
  const [album, setAlbum] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [spin, setSpin] = useState(0);
  const [pets, setPets] = useState(0);
  const [stroke, setStroke] = useState(0);
  const [homePets, setHomePets] = useState(0);
  const [popped, setPopped] = useState<number[]>([]);
  const [foam, setFoam] = useState<{ id: number; x: number; y: number }[]>([]);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [result, setResult] = useState<Saved | null>(null);
  const [saving, setSaving] = useState(false);
  const [ticket, setTicket] = useState<{ url: string; filename: string } | null>(null);
  const progressRef = useRef(0), spinRef = useRef(0);
  const gesture = useRef<{ id: number; x: number; y: number; angle: number } | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completed = useRef(false);
  const buddy = result?.buddy ?? worries[choice].buddy;
  const friend = { name: localized(companions[buddy].name), line: localized(companions[buddy].line) };
  const words = thoughts[choice];
  const worryLabel = (record: Saved) => localized(worries[record.worryId ?? Math.max(0, worries.findIndex(w => w.label[0] === record.worry))].label);
  const recordDate = (record: Saved) => record.dateISO ? new Date(record.dateISO).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric" }) : cleanLine(record.date);
  const petImage = A + `companion-${buddy}.png`;
  const playing = ["scrub", "bubbles", "spin", "dry"].includes(stage);
  useEffect(() => { document.documentElement.lang = language === "zh" ? "zh-CN" : "en"; document.title = t("烦恼洗衣店 · 让心情松软一点", "Worry Laundry · A little softer today"); try { localStorage.setItem("worry-laundry-language", language); } catch {} }, [language]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); audio.current?.close().catch(() => {}); }, []);
  useEffect(() => { gesture.current = null; completed.current = false; setMessage(""); }, [stage]);
  useEffect(() => () => { if (ticket) URL.revokeObjectURL(ticket.url); }, [ticket]);
  function chime(kind: "pop" | "rub" | "finish" = "pop") {
    if (muted) return;
    try {
      const ctx = audio.current ?? new AudioContext(); audio.current = ctx;
      if (ctx.state === "suspended") void ctx.resume();
      const notes = kind === "finish" ? [523.25, 659.25, 783.99] : [kind === "rub" ? 230 + Math.random() * 90 : 520 + Math.random() * 450];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain(), t = ctx.currentTime + i * .14;
        osc.type = "sine"; osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(freq * (kind === "pop" ? .65 : 1), t + .18);
        gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(.055, t + .014); gain.gain.exponentialRampToValueAtTime(.001, t + .24);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + .25);
      });
    } catch { /* Optional audio does not block play. */ }
  }
  function notify(text: string) { setToast(text); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 2600); }
  function go(value: Stage) { beforeNavigate(); setStage(value); }
  function start() { setChoice(0); setResult(null); go("choose"); }
  function wash() {
    progressRef.current = 0; spinRef.current = 0;
    setProgress(0); setSpin(0); setStroke(0); setPets(0); setFoam([]); setPopped([]); setResult(null); go("scrub"); chime();
  }
  function scrub(amount: number, x = 50, y = 50) {
    if (progressRef.current >= 100) return;
    progressRef.current = Math.min(100, progressRef.current + amount); setProgress(progressRef.current); setStroke(v => v + 1);
    setFoam(v => [...v.slice(-8), { id: performance.now(), x, y }]);
    if (Math.floor(progressRef.current) % 10 < 3) chime("rub");
    if (progressRef.current >= 100) { setMessage("scrubDone"); chime("finish"); }
  }
  function turn(delta: number) {
    if (spinRef.current >= 1080) return;
    const total = spinRef.current + Math.abs(delta);
    spinRef.current = total >= 1077 ? 1080 : total; setSpin(spinRef.current);
    if (spinRef.current >= 1080 && !completed.current) { completed.current = true; setMessage("spinDone"); chime("finish"); }
  }
  function down(e: PointerEvent<HTMLDivElement>) {
    if (!["scrub", "spin"].includes(stage) || e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId); const b = e.currentTarget.getBoundingClientRect();
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, angle: Math.atan2(e.clientY - b.top - b.height / 2, e.clientX - b.left - b.width / 2) };
  }
  function move(e: PointerEvent<HTMLDivElement>) {
    const g = gesture.current; if (!g || g.id !== e.pointerId) return; e.preventDefault(); const b = e.currentTarget.getBoundingClientRect();
    if (stage === "scrub") {
      const d = Math.min(55, Math.hypot(e.clientX - g.x, e.clientY - g.y));
      if (d > 2) scrub(d / 18, (e.clientX - b.left) / b.width * 100, (e.clientY - b.top) / b.height * 100);
    } else if (stage === "spin") {
      const r = Math.hypot(e.clientX - b.left - b.width / 2, e.clientY - b.top - b.height / 2);
      const angle = Math.atan2(e.clientY - b.top - b.height / 2, e.clientX - b.left - b.width / 2);
      let d = angle - g.angle; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
      if (r > 35) turn(Math.min(30, Math.abs(d * 180 / Math.PI))); g.angle = angle;
    }
    g.x = e.clientX; g.y = e.clientY;
  }
  function up(e: PointerEvent<HTMLDivElement>) { if (gesture.current?.id === e.pointerId) gesture.current = null; }
  function pop(id: number) { if (popped.includes(id)) return; setPopped(v => v.includes(id) ? v : [...v, id]); setMessage(`thought-${id}`); chime(); }
  function finish() {
    if (result) { go("result"); return; }
    const record: Saved = { buddy: worries[choice].buddy, worry: worries[choice].label[0], worryId: choice, dateISO: new Date().toISOString(), softness: Math.min(100, 92 + pets * 2), date: new Date().toLocaleDateString("zh-CN", { timeZone: "America/Los_Angeles", month: "long", day: "numeric" }), kg: (2 + Math.random() * 2).toFixed(1) };
    const all = [...shelf, record].slice(-60); setResult(record); setShelf(all);
    try { localStorage.setItem(STORAGE, JSON.stringify(all)); } catch { notify("storage"); }
    go("result"); chime("finish");
  }
  async function saveTicket() {
    if (!result || saving) return; setSaving(true);
    try {
      await document.fonts.ready;
      const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
      const [pet, towel, logo, paper] = await Promise.all([load(petImage), load(A + "towels.png"), load(A + "clothesline.png"), load(A + "paper.png")]);
      const c = document.createElement("canvas"); c.width = 900; c.height = 1280; const ctx = c.getContext("2d"); if (!ctx) throw new Error("canvas");
      ctx.fillStyle = "#fdfbf5"; ctx.fillRect(0, 0, 900, 1280); ctx.fillStyle = ctx.createPattern(paper, "repeat")!; ctx.fillRect(0, 0, 900, 1280);
      const write = (value: string, y: number, size: number, color = "#425b43") => { ctx.fillStyle = color; ctx.font = `${size}px LaundryHand`; const line = cleanLine(value); while (ctx.measureText(line).width > 720 && size > 16) { size -= 1; ctx.font = `${size}px LaundryHand`; } ctx.fillText(line, 450, y); };
      ctx.textAlign = "center"; write(t("烦恼洗衣店", "Worry Laundry"), 132, 54); ctx.drawImage(logo, 327, 160, 246, 92);
      ctx.drawImage(towel, 205, 560, 490, 245); ctx.drawImage(pet, 242, 289, 416, 416);
      write(t(`${friend.name}，领回家`, `${friend.name} is coming home`), 828, 44);
      write(friend.line, 891, 29, "#73766a"); ctx.strokeStyle = "#c5ccb8"; ctx.setLineDash([6, 10]); ctx.beginPath(); ctx.moveTo(120, 942); ctx.lineTo(780, 942); ctx.stroke();
      write(t(`${recordDate(result)} · 送洗：${worryLabel(result)}`, `${recordDate(result)} · Washed ${worryLabel(result)}`), 1006, 28, "#73766a");
      write(t(`洗掉了 ${result.kg} 公斤内耗`, `Washed away ${result.kg} kg of worry`), 1066, 32);
      write(t(`${result.softness}% 的松软 · 费用：一个深呼吸`, `${result.softness}% softness · Cost one deep breath`), 1125, 26);
      write(t("把这份松软，送给同样辛苦的人", "Share a little softness with someone who needs it"), 1208, 23, "#7c8271");
      const blob = await new Promise<Blob>((resolve, reject) => c.toBlob(v => v ? resolve(v) : reject(new Error("export")), "image/png"));
      beforeNavigate();
      setTicket({ url: URL.createObjectURL(blob), filename: `${language === "zh" ? "烦恼洗衣店" : "Worry-Laundry"}-${friend.name.replaceAll(" ", "-")}.png` });
    } catch { notify("saveError"); } finally { setSaving(false); }
  }
  function back() { const map: Record<Stage, Stage> = { home: "home", choose: "home", scrub: "choose", bubbles: "scrub", spin: "bubbles", dry: "spin", result: "home" }; go(map[stage]); }
  const phase = stage === "scrub" ? 1 : stage === "bubbles" ? 2 : 3;
  const percent = stage === "scrub" ? progress : stage === "bubbles" ? popped.length / 12 * 100 : Math.min(100, spin / 1080 * 100);
  const done = stage === "scrub" ? progress >= 100 : stage === "bubbles" ? popped.length >= 12 : spin >= 1080;
  const heading = stage === "scrub" ? t('先把烦恼搓松', 'Rub a little worry away') : stage === "bubbles" ? t('让它们，啵地飘走', 'Let your thoughts float away') : stage === "spin" ? t('转转，甩掉最后一点', 'Spin the last worries away') : t('洗好啦，暖乎乎的', 'Fresh and warm and fluffy');
  const feedback = (message === "scrubDone" ? t("毛团松开了，心也松了一点", "The fluff is softer and so are you") : message === "spinDone" ? t("最后一点烦恼，也甩掉啦", "The last little worry spun away") : message.startsWith("thought-") ? localized(words[Number(message.slice(8))].reply) : "") || (stage === "dry" ? pets === 0 ? t('它正在等一个摸摸。', 'Your buddy is waiting for a gentle pat') : [t('呼噜呼噜，谢谢你。', 'Purr purr thank you'), t('好喜欢这条软毛巾。', 'This towel feels like a little hug'), t('再摸一下，烦恼又少一点。', 'One more pat and a little less worry')][(pets - 1) % 3] : stage === "scrub" ? progress === 0 ? t('轻轻来，它有一点怕痒。', 'Go gently our little fluff is ticklish') : progress < 50 ? t('毛团：嘿嘿，有点痒。', 'Hehe that tickles') : t('嗯，心里开始变轻了。', 'A little lighter already') : stage === "bubbles" ? t('不用把每一个念头，都留下。', 'You do not have to keep every thought') : t('顺时针、逆时针，都可以。', 'Either direction feels good'));
  return <>
    <Scroll key={stage} className={`laundry-app stage-${stage} lang-${language} ${web ? "web-game" : ""}`} >
      <main className={`laundry-page ${stage === "home" ? "home-page" : "inner-page"}`} data-stage={stage}>
        <nav className="language-switch" aria-label={t("选择语言", "Choose language")}><button lang="zh-CN" aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>中文</button><span aria-hidden="true">/</span><button lang="en" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button></nav>
        {stage !== "home" && <header className="game-toolbar"><button className="icon-button" onClick={back} aria-label={t('返回上一步', 'Go back')}><ArrowLeftIcon /></button><span>{t('烦恼洗衣店', 'Worry Laundry')}</span><button className="icon-button" aria-label={muted ? t('开启声音', 'Turn sound on') : t('关闭声音', 'Turn sound off')} aria-pressed={!muted} onClick={() => setMuted(v => !v)}>{muted ? <SpeakerOffIcon /> : <SpeakerLoudIcon />}</button></header>}
        <AnimatePresence mode="wait"><motion.div key={stage} className="page-state" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -5 }} transition={{ duration: .23 }}>
          {stage === "home" && <section className="home-content">
            <div className="home-brand"><h1>{language === "zh" ? <img className="handwritten-title" src={A + "handwritten-title.png"} alt={t('烦恼洗衣店', 'Worry Laundry')} /> : <span className="english-title">Worry Laundry</span>}</h1><img className="clothesline" src={A + "home-clothesline.png"} alt={t('晾着一件薄荷绿格纹小衣服', 'A little sage gingham shirt on a clothesline')} /></div>
            <button className="home-creature character-scene" aria-label={t('轻轻摸摸小毛团', 'Give the little fluff a gentle pat')} onClick={() => { setHomePets(v => v + 1); chime(); }}><motion.img key={homePets} className="home-illustration" src={A + "home-hero.png"} alt={t('坐在薄荷绿毛巾上、困困的灰色小毛团', 'A sleepy grey fluff resting on a sage towel')} animate={reduced ? {} : homePets > 0 ? { rotate: [0, -3, 3, 0], scale: [1, 1.025, 1] } : { y: [0, -2, 0] }} transition={homePets > 0 ? { duration: .6 } : { duration: 4, repeat: Infinity }} /></button>
            <p className="home-caption" aria-live="polite">{homePets === 0 ? t('今天，也辛苦了。', 'You did enough today') : [t('嗯？你也想歇一会吗。', 'Could you use a little rest too'), t('谢谢你，已经没那么皱了。', 'Thanks I feel a little less tangled'), t('摸摸。今天已经很努力了。', 'A little pat for all you did today')][(homePets - 1) % 3]}</p>
            <div className="home-action"><button className="primary" onClick={start}>{t('洗掉一点烦恼', 'Wash a worry away')}</button><p className="quiet">{t('大约一分钟', 'A tiny one minute break')}</p>{shelf.length > 0 && <button className="text-button shelf-link" onClick={() => setAlbum(true)}>{t("看看我的小伙伴", "Meet my buddies")} · {new Set(shelf.map(s => s.buddy)).size}/3</button>}</div>
          </section>}
          {stage === "choose" && <section className="choose-content">
            <div className="section-heading"><p className="eyebrow">{t('欢迎光临', 'COME ON IN')}</p><h1>{t('今天，想洗掉什么？', 'What feels heavy today')}</h1><p>{t('不用说清楚，选一团就好。', 'No explaining needed just pick a little cloud')}</p></div>
            <div className="choice-creature character-scene"><img className="scene-towels" src={A + "towels.png"} alt="" /><img className="scene-character" src={A + "worry.png"} alt={t('等着被照顾的小毛团', 'A little fluff waiting for some care')} /></div>
            <div className="worry-options" role="group" aria-label={t('选择今天的烦恼', 'Choose a worry for today')}>{worries.map((w, i) => <button key={i} className={`worry-option ${choice === i ? "selected" : ""}`} aria-pressed={choice === i} onClick={() => { setChoice(i); chime(); }}><span><strong>{localized(w.label)}</strong><small>{localized(w.detail)}</small></span><span className="choice-check" aria-hidden="true">{choice === i && <CheckIcon />}</span></button>)}</div>
            <button className="primary" onClick={wash}>{t('就洗这一团', 'Let us wash this one')}</button><p className="quiet">{t('这里没有输赢，慢慢玩就好。', 'No scores to chase take your time')}</p>
          </section>}
          {playing && <section className="play-content">
            <div className="section-heading"><p className="eyebrow">{stage === "dry" ? t('准备领回', 'READY FOR A HUG') : t(`第 ${phase} 步 / 3`, `STEP ${phase} OF 3`)}</p><h1>{heading}</h1><p>{stage === "scrub" ? t('按住小毛团，来回轻轻搓。', 'Hold the fluff and gently rub side to side') : stage === "bubbles" ? t('点破泡泡，让脑袋也透透气。', 'Pop the bubbles and give your mind some air') : stage === "spin" ? t('按住毛团，绕着它转三圈。', 'Hold and move around the fluff three times') : t('摸摸它，再带它回家。', 'Give your buddy a pat and take it home')}</p></div>
            {stage === "bubbles" ? <div className="bubble-field" data-testid="bubble-field" data-scroll-drag="ignore"><img className="bubble-pet" src={A + "worry.png"} alt={t('越来越轻松的小毛团', 'A little fluff feeling lighter')} />{words.map((thought, id) => Math.floor(id / 4) === Math.min(2, Math.floor(popped.length / 4)) && <motion.button key={id} className={`worry-bubble bubble-kind-${id % 4} ${popped.includes(id) ? "popped" : ""}`} style={{ left: `${points[id % 4][0]}%`, top: `${points[id % 4][1]}%`, "--float-duration": `${3 + id % 4 * .7}s`, "--float-delay": `${-id * .4}s` } as CSSProperties} aria-label={t(`戳破${thought.word[0]}泡泡`, `Pop ${thought.word[1]}`)} disabled={popped.includes(id)} onClick={() => pop(id)} initial={{ opacity: 0, scale: .6 }} animate={popped.includes(id) ? { opacity: 0, scale: 1.45 } : { opacity: 1, scale: 1 }} transition={{ duration: .3 }}><div className="bubble-inside"><img src={A + "bubble.png"} alt="" /><span>{localized(thought.word)}</span></div></motion.button>)}</div> : <div className={`wash-scene character-scene ${stage === "dry" ? "dry-scene" : ""}`} role="button" tabIndex={0} aria-label={stage === "scrub" ? t('来回搓洗小毛团，或按空格键搓一搓', 'Rub the fluff or press space for a gentle rub') : stage === "spin" ? t('绕着小毛团转圈，或按空格键转一转', 'Circle the fluff or press space for a little spin') : t('摸摸洗好的小伙伴', 'Pat your freshly washed buddy')} data-scroll-drag="ignore" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={e => { if (!["Space", "Enter", "ArrowLeft", "ArrowRight"].includes(e.code)) return; e.preventDefault(); if (stage === "scrub") scrub(6); else if (stage === "spin") turn(90); else { setPets(v => v + 1); chime(); } }} onClick={() => { if (stage === "dry") { setPets(v => v + 1); chime(); } }}>
              <img className="scene-towels" src={A + "towels.png"} alt="" />
              {stage === "dry" ? <motion.img key={`pet-${pets}`} className="scene-character clean-pet" src={petImage} alt={friend.name} animate={reduced ? {} : { scale: [1, 1.06, 1], rotate: [0, -3, 3, 0] }} transition={{ duration: .6 }} /> : <motion.img className="scene-character washing-pet" src={A + "worry.png"} alt={t('正在变松软的小毛团', 'A little fluff becoming softer')} animate={{ rotate: stage === "spin" ? reduced ? 0 : spin : reduced ? 0 : stroke % 2 === 0 ? -3 : 3, scale: stage === "spin" ? .82 : 1 + Math.sin(stroke) * .025, filter: stage === "scrub" ? `brightness(${1 + progress / 130}) saturate(${1 - progress / 350})` : "brightness(1.6)" }} transition={{ duration: .13 }} />}
              {stage === "scrub" && foam.map((f, i) => <motion.img key={f.id} className="foam-bubble" src={A + "bubble.png"} alt="" style={{ left: `${Math.max(12, Math.min(85, f.x))}%`, top: `${Math.max(15, Math.min(75, f.y))}%`, width: 30 + i * 3 }} initial={{ opacity: .8, scale: .6 }} animate={{ opacity: 0, y: -65, scale: 1.2 }} transition={{ duration: 1.4 }} />)}
              {stage === "dry" && pets > 0 && <motion.span key={pets} className="pet-heart" initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -65 }} transition={{ duration: 1.2 }}><HeartIcon /></motion.span>}
            </div>}
            <div className="play-feedback" aria-live="polite"><p>{feedback}</p></div>
            {stage !== "dry" && <div className="wash-meter"><div className="meter-track" role="progressbar" aria-label={t('这一步的进度', 'Progress for this step')} aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div><span>{stage === "bubbles" ? t(`${popped.length} / 12 个念头，放走了`, `${popped.length} of 12 thoughts let go`) : stage === "scrub" ? t(`已经松开 ${Math.round(progress)}% 的烦恼`, `${Math.round(progress)}% less tangled`) : t(`${Math.min(3, Math.floor(spin / 360))} / 3 圈 · 心情也跟着松开`, `${Math.min(3, Math.floor(spin / 360))} of 3 turns feeling lighter`)}</span></div>}
            <div className="play-actions">{stage === "dry" ? <><button className="primary" onClick={finish}>{t('领回我的小伙伴', 'Take my buddy home')}</button><p className="quiet">{t('已经干净了，不用变得完美。', 'All fresh no need to be perfect')}</p></> : done ? <button className="primary" onClick={() => { go(stage === "scrub" ? "bubbles" : stage === "bubbles" ? "spin" : "dry"); chime(); }}>{stage === "scrub" ? t('去放走小泡泡', 'Let the bubbles go') : stage === "bubbles" ? t('最后，再甩甩干', 'One last little spin') : t('看看洗出了什么', 'Meet your fluffy surprise')}</button> : <><p className="gesture-hint">{stage === "scrub" ? t('左右搓搓 · 像摸摸一样', 'Rub side to side like a gentle pat') : stage === "bubbles" ? t('每个泡泡，点一下就好', 'One little tap for each bubble') : t('手指绕圈 · 慢慢转也可以', 'Trace a circle as slowly as you like')}</p>{stage !== "bubbles" && <button className="text-button assist" onClick={() => stage === "scrub" ? scrub(8) : turn(120)}>{stage === "scrub" ? t('也可以点这里，轻轻搓一下', 'Or tap here for a gentle rub') : t('也可以点这里，转一转', 'Or tap here for a little spin')}</button>}</>}</div>
          </section>}
          {stage === "result" && result && <section className="result-content">
            <div className="section-heading"><p className="eyebrow">{t('取件成功', 'ALL FRESH')}</p><h1>{t(`${friend.name}，领回家`, `${friend.name} is coming home`)}</h1><p>{friend.line}</p></div>
            <button className="result-creature character-scene" aria-label={t('摸摸我的新小伙伴', 'Pat my new fluffy buddy')} onClick={() => { setPets(v => v + 1); chime(); }}><img className="scene-towels" src={A + "towels.png"} alt="" /><motion.img key={pets} className="scene-character" src={petImage} alt={friend.name} animate={reduced ? {} : { y: [0, -6, 0], rotate: [0, -3, 3, 0] }} transition={{ duration: .55 }} /></button>
            <div className="laundry-ticket"><div className="ticket-heading"><span>{t('今日洗衣小票', 'YOUR LAUNDRY TICKET')}</span><span>{recordDate(result)}</span></div><div className="ticket-row"><span>{t('送洗', 'Washed')}</span><strong>{worryLabel(result)}</strong></div><div className="ticket-row"><span>{t('取回', 'Found')}</span><strong>{friend.name}</strong></div><p className="ticket-line">{t("洗掉了", "Washed away")} <strong>{result.kg}</strong> {t("公斤内耗", "kg of worry")}</p><p className="ticket-small">{t(`${result.softness}% 的松软 · 费用：一个深呼吸`, `${result.softness}% softness · Cost one deep breath`)}</p></div>
            <button className="primary save-button" onClick={() => void saveTicket()} disabled={saving}><DownloadIcon />{saving ? t('正在装好这份松软…', 'Wrapping up your softness') : t('保存我的洗衣小票', 'Save my laundry ticket')}</button><div className="result-links"><button className="text-button" onClick={start}>{t('再洗一小团', 'Wash another worry')}</button><span>·</span><button className="text-button" onClick={() => setAlbum(true)}>{t('我的小伙伴', 'My buddies')}</button></div>
          </section>}
        </motion.div></AnimatePresence>
      </main>
    </Scroll>
    <Sheet open={album} onOpenChange={setAlbum} title={t('我的松软小伙伴', 'My fluffy little buddies')} description={t('每一次照顾自己，都值得留个纪念。', 'Every bit of self care deserves a keepsake')} snap={0.54}><div className="buddy-shelf">{(Object.keys(companions) as Buddy[]).map(b => { const unlocked = shelf.some(s => s.buddy === b); return <div className={`shelf-buddy ${unlocked ? "" : "locked"}`} key={b}><img src={A + `companion-${b}.png`} alt={unlocked ? localized(companions[b].name) : t('还未领回的小伙伴', 'A buddy you have not met yet')} /><strong>{unlocked ? localized(companions[b].name) : t('还在晾晒', 'Still drying')}</strong><small>{unlocked ? t('已经领回家', 'Home with you') : t('换一团烦恼试试', 'Try another worry')}</small></div>; })}</div><p className="shelf-note">{t(`已经给自己 ${shelf.length} 次温柔的休息`, `${shelf.length} gentle ${shelf.length === 1 ? "break" : "breaks"} just for you`)}</p><button className="shelf-done" onClick={() => setAlbum(false)}>{t('好好收着', 'Keep them close')}</button></Sheet>
    <Sheet open={!!ticket} onOpenChange={open => { if (!open) setTicket(null); }} title={t("我的洗衣小票", "My laundry ticket")} description={t("把这份松软，送给同样辛苦的人", "Share a little softness with someone who needs it")} snap={0.88}>
      {ticket && <div className="ticket-preview"><img src={ticket.url} alt={t("已生成的洗衣小票", "Your finished laundry ticket")} /><a className="primary ticket-download" href={ticket.url} download={ticket.filename}>{t("下载洗衣小票", "Download my ticket")}</a><p>{t("手机也可以长按图片保存", "On your phone you can also hold the image to save")}</p></div>}
    </Sheet>
    <AnimatePresence>{toast && <motion.div className="laundry-toast" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><span>{toast === "saved" ? t("小票已生成，可以把这份松软送给朋友", "Your ticket is ready to share a little softness") : toast === "storage" ? t("小伙伴已领回，暂时无法保存到本机", "Your buddy is here but this browser could not save it") : t("小票暂时没保存成功，请再试一次", "Your ticket could not be saved please try again")}</span><button aria-label={t('关闭提示', 'Close message')} onClick={() => setToast("")}><Cross2Icon /></button></motion.div>}</AnimatePresence>
  </>;
}
