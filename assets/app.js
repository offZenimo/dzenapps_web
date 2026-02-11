const THEME_KEY="dzenapps_theme";
const LOCALE_KEY="dzenapps_locale";
const REGION_KEY="dzenapps_region";
const SUPPORTED=["ru","en","be"];
const SUPPORTED_REGIONS=["global","es","de"];

function normalizeLocale(input){
  if(!input) return null;
  const raw=String(input).trim();
  if(!raw) return null;
  const base=raw.toLowerCase().split("-")[0];
  return SUPPORTED.includes(base)?base:null;
}
function normalizeRegion(input){
  if(!input) return null;
  const v=String(input).trim().toLowerCase();
  return SUPPORTED_REGIONS.includes(v)?v:null;
}
function getStoredTheme(){
  const t=localStorage.getItem(THEME_KEY);
  return (t==="light"||t==="dark")?t:null;
}
function t(key, vars={}){
  const dict=I18N[window.__locale]||I18N.en;
  const raw=(dict[key] ?? I18N.en[key] ?? key);
  return raw.replace(/\{(\w+)\}/g,(_,k)=>(vars[k] ?? `{${k}}`));
}
function setTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  const btn=document.querySelector("[data-action='toggle-theme']");
  if(btn){
    btn.querySelector("[data-theme-label]").textContent = (theme==="dark") ? t("ui.dark") : t("ui.light");
  }
}
function toast(message, sub=""){
  const el=document.querySelector("#toast");
  if(!el) return;
  el.querySelector("[data-toast-text]").textContent=message;
  el.querySelector("[data-toast-sub]").textContent=sub||"";
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>el.classList.remove("show"),2200);
}
function applyTranslations(){
  const page=document.body?.dataset?.page||"home";
  document.title = t(`title.${page}`, {year:new Date().getFullYear()});
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key=el.getAttribute("data-i18n");
    el.textContent = t(key, {year:new Date().getFullYear(), date:new Date().toISOString().slice(0,10)});
  });
  const theme=document.documentElement.getAttribute("data-theme")||"dark";
  const themeBtn=document.querySelector("[data-action='toggle-theme']");
  if(themeBtn){
    themeBtn.querySelector("[data-theme-label]").textContent = (theme==="dark") ? t("ui.dark") : t("ui.light");
  }
}
function updateToggleStates(){
  document.querySelectorAll("[data-lang]").forEach(btn=>{
    btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang")===window.__locale));
  });
  document.querySelectorAll("[data-region]").forEach(btn=>{
    btn.setAttribute("aria-pressed", String(btn.getAttribute("data-region")===window.__region));
  });
}
function wireReveal(){
  const items=document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){
    items.forEach(el=>el.classList.add("is-visible"));
    return;
  }
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, {threshold:0.12});
  items.forEach(el=>io.observe(el));
}
function wireSocialButtons(){
  const socialLinks={
    global:{default:{x:"",linkedin:"",instagram:"",tiktok:""},ru:{x:"",linkedin:"",instagram:"",tiktok:""},en:{x:"",linkedin:"",instagram:"",tiktok:""},be:{x:"",linkedin:"",instagram:"",tiktok:""}},
    es:{default:{x:"",linkedin:"",instagram:"",tiktok:""},en:{x:"",linkedin:"",instagram:"",tiktok:""}},
    de:{default:{x:"",linkedin:"",instagram:"",tiktok:""},en:{x:"",linkedin:"",instagram:"",tiktok:""}}
  };
  const bucket=socialLinks[window.__region]||socialLinks.global;
  const links=bucket[window.__locale]||bucket.default;

  document.querySelectorAll("[data-social]").forEach(el=>{
    const key=el.getAttribute("data-social");
    const url=links[key]||"";
    const clone=el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);

    if(url){
      clone.removeAttribute("disabled");
      clone.addEventListener("click", ()=>window.open(url,"_blank","noopener,noreferrer"));
    }else{
      clone.setAttribute("disabled","true");
      clone.title=t("ui.soon");
      clone.addEventListener("click", ()=>toast(t("toast.soon")));
    }
  });
}
function mailto(subjectKey=""){
  toast(t("toast.mail"));
  const subject = subjectKey ? t(subjectKey) : "Hello DzenApps";
  const body = encodeURIComponent("Hi DzenApps,\n\n");
  window.location.href = `mailto:dzenapps@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
}
function setLocale(locale){
  const norm=normalizeLocale(locale) || "en";
  window.__locale=norm;
  localStorage.setItem(LOCALE_KEY,norm);
  document.documentElement.setAttribute("lang", norm);
  updateToggleStates();
  applyTranslations();
  wireSocialButtons();
}
function setRegion(region){
  const norm=normalizeRegion(region) || "global";
  window.__region=norm;
  localStorage.setItem(REGION_KEY,norm);
  updateToggleStates();
  applyTranslations();
  wireSocialButtons();
}
function init(){
  window.__locale = normalizeLocale(localStorage.getItem(LOCALE_KEY)) || normalizeLocale(navigator.language) || "en";
  window.__region = normalizeRegion(localStorage.getItem(REGION_KEY)) || "global";
  setTheme(getStoredTheme() || "dark");
  setLocale(window.__locale);
  setRegion(window.__region);

  document.querySelectorAll("[data-lang]").forEach(btn=>{
    btn.addEventListener("click", ()=>setLocale(btn.getAttribute("data-lang")));
  });
  document.querySelectorAll("[data-region]").forEach(btn=>{
    btn.addEventListener("click", ()=>setRegion(btn.getAttribute("data-region")));
  });
  const themeBtn=document.querySelector("[data-action='toggle-theme']");
  if(themeBtn){
    themeBtn.addEventListener("click", ()=>{
      const current=document.documentElement.getAttribute("data-theme")||"dark";
      setTheme(current==="dark"?"light":"dark");
      applyTranslations();
    });
  }
  document.querySelectorAll("[data-action='email']").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const subject=btn.getAttribute("data-mail-subject-i18n")||"";
      mailto(subject);
    });
  });

  const current=document.body?.dataset?.page;
  if(current){
    const link=document.querySelector(`[data-nav='${current}']`);
    if(link) link.setAttribute("aria-current","page");
  }
  wireReveal();
  wireSocialButtons();
  applyTranslations();
}
document.addEventListener("DOMContentLoaded", init);
