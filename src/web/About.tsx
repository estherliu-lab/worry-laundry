import { useEffect, useState } from "react";
import { cleanLine, type Language } from "../game/content";
import "./about.css";

const BASE = import.meta.env.BASE_URL;
const ASSETS = `${BASE}assets/`;
const GAME_URL = "https://estherliu-lab.github.io/worry-laundry/";

export function About() {
  const [language, setLanguage] = useState<Language>(() => {
    try { const saved = localStorage.getItem("worry-laundry-language"); if (saved === "zh" || saved === "en") return saved; } catch {}
    return navigator.language.startsWith("zh") ? "zh" : "en";
  });
  const t = (zh: string, en: string) => cleanLine(language === "zh" ? zh : en);
  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = t("烦恼洗衣店 · 烦恼也可以送洗", "Worry Laundry · Drop off a heavy day");
    try { localStorage.setItem("worry-laundry-language", language); } catch {}
  }, [language]);
  const gameLink = BASE;
  return <main className={`about-page about-${language}`}>
    <header className="about-header">
      <a className="about-wordmark" href={gameLink}>{t("烦恼洗衣店", "Worry Laundry")}</a>
      <nav className="about-language" aria-label={t("选择语言", "Choose language")}>
        <button aria-pressed={language === "zh"} lang="zh-CN" onClick={() => setLanguage("zh")}>中文</button>
        <button aria-pressed={language === "en"} lang="en" onClick={() => setLanguage("en")}>English</button>
      </nav>
    </header>

    <section className="about-entry" aria-label={t("开始体验", "Come and play")}>
      <a className="about-qr" href={GAME_URL} aria-label={t("打开手机试玩链接", "Open the mobile game")}><img src={ASSETS + "intro/play-qr.png"} alt={t("手机扫码进入烦恼洗衣店", "Scan to play Worry Laundry on your phone")} width="112" height="112" /></a>
      <div className="about-entry-copy"><strong>{t("手机扫一扫，小店就在手心里", "A tiny shop in the palm of your hand")}</strong><p>{t("微信扫一扫，也可以用手机相机", "Scan with WeChat or your phone camera")}</p><a className="about-plain-link" href={GAME_URL}>{t("手机和电脑都能直接玩", "Play on your phone or computer")}</a></div>
      <a className="about-button" href={gameLink}>{t("推门进去玩", "Come on in")}<span aria-hidden="true">↗</span></a>
    </section>

    <section className="about-hero">
      <div className="about-hero-copy"><p className="about-kicker">{t("今日营业 · 只洗烦恼", "OPEN TODAY · FOR HEAVY DAYS")}</p><h1>{t("烦恼也会打结", "A heavy day") }<br /><span>{t("不如洗一洗", "could use a little wash")}</span></h1><p className="about-lead">{t("有点累，想太多，心里下小雨", "Feeling tired, overthinking, a little rainy inside") }<br />{t("都可以拎来，不用解释", "Bring it all along no explanations needed")}</p><p className="about-welcome">{t("这家小店不收钱，只收一小团烦恼", "This little shop accepts worries instead of coins")}</p></div>
      <figure className="about-hero-art"><img src={ASSETS + "laundry/home-hero.png"} alt={t("坐在软毛巾上休息的灰色小毛团", "A sleepy little fluff resting on soft towels")} width="460" height="460" /><figcaption>{t("小毛团已经在等你了", "Your little fluff is waiting for you")}</figcaption></figure>
    </section>

    <section className="about-ritual" aria-label={t("在小店里做什么", "A little laundry ritual")}>
      <article><span className="about-step">01</span><h2>{t("搓搓今天的皱巴巴", "Smooth out the day")}</h2><p>{t("轻轻搓一搓，灰扑扑的小毛团就会慢慢松软", "A gentle rub helps your tangled little fluff soften")}</p></article>
      <article><span className="about-step">02</span><h2>{t("让念头啵地飘走", "Pop a thought or two")}</h2><p>{t("还没做完、想太多、来不及，让它们变成泡泡", "Not done yet, what if, running late let them float away")}</p></article>
      <article><span className="about-step">03</span><h2>{t("领回一只暖乎乎", "Take a warm friend home")}</h2><p>{t("转一转，晾一晾，小猫、小兔或小鸭等着被你领回家", "A little spin and a soft landing a cat, bunny or duck is ready to come home")}</p></article>
    </section>

    <section className="about-peek">
      <div className="about-section-copy"><p className="about-kicker">{t("往小店里看一眼", "A PEEK INSIDE")}</p><h2>{t("没有输赢，只有变松软", "No scores just a softer day")}</h2><p>{t("不用赶时间，也不用表现得很好", "No rushing and no need to do it perfectly") }<br />{t("摸摸小毛团，给自己一分钟的小休息", "Pat a little fluff and take a tiny one minute break")}</p><p className="about-ticket-note">{t("走的时候，还能带上一张洗衣小票", "Take a keepsake laundry ticket when you go")}</p><a className="about-text-link" href={gameLink}>{t("我也想洗掉一点烦恼", "I could use a little wash too")} <span aria-hidden="true">↗</span></a></div>
      <div className="about-screens"><figure><img src={ASSETS + `intro/home-${language}.jpg`} alt={t("烦恼洗衣店首页截图", "Worry Laundry home screen")} loading="lazy" width="375" height="812" /><figcaption>{t("今天，也辛苦了", "You did enough today")}</figcaption></figure><figure><img src={ASSETS + `intro/bubbles-${language}.jpg`} alt={t("戳破念头泡泡的游戏截图", "Popping thought bubbles in the game")} loading="lazy" width="375" height="812" /><figcaption>{t("每个念头，都可以轻轻放走", "One little tap to let a thought go")}</figcaption></figure></div>
    </section>

    <section className="about-goodbye"><img src={ASSETS + "laundry/home-clothesline.png"} alt="" width="116" height="65" /><h2>{t("洗不掉所有烦恼也没关系", "You do not have to wash it all away")}</h2><p>{t("能轻一点点，就已经很好了", "A little lighter is already lovely")}</p><a className="about-button" href={gameLink}>{t("给自己一点松软", "Find a little softness")}<span aria-hidden="true">↗</span></a></section>

    <footer className="about-footer">
      <p>{t("© 2026 estherliu-lab · 烦恼洗衣店", "© 2026 estherliu-lab · Worry Laundry")}</p>
      <p>{t("欢迎免费游玩与分享游戏链接，转载、改编或商业使用游戏内容，请先联系开发者获得许可", "Enjoy the game for free and share its link please contact the developer before republishing, adapting or using its content commercially")}</p>
      <p>{t("第三方字体等资源遵循各自授权", "Third party fonts and other resources retain their own licenses")}</p>
      <p>{t("玩法反馈、使用授权或版权疑问，都可以联系开发者", "For feedback, permissions or copyright questions, contact the developer")}</p>
      <a href="https://github.com/estherliu-lab/worry-laundry" target="_blank" rel="noreferrer">GitHub</a><span className="about-footer-divider" aria-hidden="true">·</span><span>WeChat: Canaan-77</span>
    </footer>
  </main>;
}
