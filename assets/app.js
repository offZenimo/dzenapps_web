/* DzenApps site core */
const THEME_KEY = "dzenapps_theme";
const LOCALE_KEY = "dzenapps_locale";

const SUPPORTED = ["ru","en","be"];

function normalizeLocale(input){
  if(!input) return null;
  const raw = String(input).trim();
  if(!raw) return null;
  // accept ru, en, be or en-US etc; choose base if supported
  const base = raw.toLowerCase().split("-")[0];
  if(SUPPORTED.includes(base)) return base;
  return null;
}

function getStoredTheme(){
  const t = localStorage.getItem(THEME_KEY);
  return (t === "light" || t === "dark") ? t : null;
}
function setTheme(theme){
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  const btn = document.querySelector("[data-action='toggle-theme']");
  if(btn){
    const isDark = theme === "dark";
    btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    btn.setAttribute("data-theme", theme);
    btn.querySelector("[data-theme-label]").textContent = isDark ? t("ui.dark") : t("ui.light");
  }
}

function detectLocale(){
  const stored = normalizeLocale(localStorage.getItem(LOCALE_KEY));
  if(stored) return stored;
  const nav = normalizeLocale(navigator.language);
  if(nav) return nav;
  return "en";
}

let CURRENT_LOCALE = "en";
function setLocale(locale){
  const norm = normalizeLocale(locale) || "en";
  CURRENT_LOCALE = norm;
  localStorage.setItem(LOCALE_KEY, norm);
  document.documentElement.setAttribute("lang", norm);
  updateLangButtons();
  applyTranslations();
}

function t(key, vars={}){
  const dict = I18N[CURRENT_LOCALE] || I18N.en;
  const raw = dict[key] ?? I18N.en[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (_,k)=> (vars[k] ?? `{${k}}`));
}

function updateLangButtons(){
  document.querySelectorAll("[data-lang]").forEach(btn=>{
    const isActive = btn.getAttribute("data-lang") === CURRENT_LOCALE;
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

function applyTranslations(){
  // page title
  const page = document.body?.dataset?.page || "home";
  const titleKey = `title.${page}`;
  if(I18N[CURRENT_LOCALE]?.[titleKey] || I18N.en[titleKey]){
    document.title = t(titleKey);
  }else if(page === "home"){
    document.title = t("title.home");
  }

  // text nodes
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key, { year: new Date().getFullYear() });
  });

  // aria labels
  document.querySelectorAll("[data-i18n-aria]").forEach(el=>{
    const key = el.getAttribute("data-i18n-aria");
    el.setAttribute("aria-label", t(key));
  });

  // theme button label update
  const theme = document.documentElement.getAttribute("data-theme") || "dark";
  const themeBtn = document.querySelector("[data-action='toggle-theme']");
  if(themeBtn){
    themeBtn.querySelector("[data-theme-label]").textContent = (theme === "dark") ? t("ui.dark") : t("ui.light");
  }
}

function wireSocialButtons(){
  // placeholder structure for future per-locale social links
  const socialLinks = {
    default: { x: "", linkedin: "", instagram: "", tiktok: "" },
    ru: { x: "", linkedin: "", instagram: "", tiktok: "" },
    en: { x: "", linkedin: "", instagram: "", tiktok: "" },
    be: { x: "", linkedin: "", instagram: "", tiktok: "" },
  };
  const links = socialLinks[CURRENT_LOCALE] || socialLinks.default;

  document.querySelectorAll("[data-social]").forEach(el=>{
    const key = el.getAttribute("data-social");
    const url = links[key] || "";
    if(url){
      el.removeAttribute("disabled");
      el.classList.remove("is-disabled");
      el.addEventListener("click", ()=> window.open(url, "_blank", "noopener,noreferrer"));
      el.title = "";
    }else{
      el.setAttribute("disabled","true");
      el.title = t("ui.soon");
    }
  });
}

function init(){
  CURRENT_LOCALE = detectLocale();

  // Theme: default dark
  const stored = getStoredTheme();
  setTheme(stored || "dark");

  // Locale
  setLocale(CURRENT_LOCALE);

  // Wire buttons
  document.querySelectorAll("[data-lang]").forEach(btn=>{
    btn.addEventListener("click", ()=> setLocale(btn.getAttribute("data-lang")));
  });

  const themeBtn = document.querySelector("[data-action='toggle-theme']");
  if(themeBtn){
    themeBtn.addEventListener("click", ()=>{
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark");
      // re-apply to update label in the current locale
      applyTranslations();
    });
  }

  // mail buttons
  document.querySelectorAll("[data-action='email']").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      window.location.href = "mailto:dzenapps@gmail.com";
    });
  });

  wireSocialButtons();
  // re-wire when locale changes
  const _setLocale = setLocale;
  setLocale = function(locale){
    _setLocale(locale);
    wireSocialButtons();
  };

  // mark current nav link
  const current = document.body?.dataset?.page;
  if(current){
    const link = document.querySelector(`[data-nav='${current}']`);
    if(link) link.setAttribute("aria-current","page");
  }
}

document.addEventListener("DOMContentLoaded", init);
