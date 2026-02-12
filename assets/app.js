const THEME_KEY="dzenapps_theme";
const LOCALE_KEY="dzenapps_locale";
const SUPPORTED=["ru","en","be"];

const SOCIAL_PREF_PREFIX="dzenapps_social_pref_";
/**
 * Put your real links here later.
 * For IG/TT/YT we show a small language chooser (English/Español/Deutsch).
 */
var assetBase = (document.body && document.body.dataset && document.body.dataset.assets) ? document.body.dataset.assets : "./";


function renderSocialLocaleButton(btn, locale, label){
  if(locale === "en"){
    btn.innerHTML = `<span class="flags">
      <img class="flag" alt="GB" src="${assetBase}assets/flags/gb.svg">
      <img class="flag" alt="US" src="${assetBase}assets/flags/us.svg">
    </span><span class="label">${label}</span>`;
  } else {
    btn.innerHTML = `<img class="flag" alt="" src="${assetBase}assets/flags/${locale}.svg"><span class="label">${label}</span>`;
  }
}

const SOCIAL_LINKS = {
  x: "",              // direct
  linkedin: "",       // direct
  instagram: { en:"", es:"", de:"" },
  tiktok:    { en:"", es:"", de:"" },
  youtube:   { en:"", es:"", de:"" }
};

function normalizeLocale(input){
  if(!input) return null;
  const raw=String(input).trim();
  if(!raw) return null;
  const base=raw.toLowerCase().split("-")[0];
  return SUPPORTED.includes(base)?base:null;
}
function t(key, vars={}){
  const dict=I18N[window.__locale]||I18N.en;
  var raw = (dict && Object.prototype.hasOwnProperty.call(dict, key)) ? dict[key] : ((I18N.en && Object.prototype.hasOwnProperty.call(I18N.en, key)) ? I18N.en[key] : key);
  return raw.replace(/\{(\w+)\}/g, function(_, k){ return (vars && Object.prototype.hasOwnProperty.call(vars, k) && vars[k] != null) ? vars[k] : ("{" + k + "}"); });
}
function setTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}
function toast(message){
  const el=document.querySelector("#toast");
  if(!el) return;
  el.querySelector("[data-toast-text]").textContent=message;
  el.querySelector("[data-toast-sub]").textContent="";
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>el.classList.remove("show"),2200);
}
function applyTranslations(){
  var page = (document.body && document.body.dataset && document.body.dataset.page) ? document.body.dataset.page : "home";
  const year = new Date().getFullYear();
  const date = new Date().toISOString().slice(0,10);

  var __titleNode = document.querySelector("[data-page-title-i18n]");
  var customTitleKey = __titleNode ? __titleNode.getAttribute("data-page-title-i18n") : null;
  if(customTitleKey){
    document.title = t(customTitleKey, {year, date});
  }else{
    document.title = t(`title.${page}`, {year, date});
  }

  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key=el.getAttribute("data-i18n");
    el.textContent = t(key, {year, date});
  });
}

function updateLangTrigger(){
  const el=document.querySelector(".lang-trigger-label");
  if(!el) return;
  const map={ru:"RU",en:"EN",be:"BE"};
  el.textContent = map[window.__locale] || String(window.__locale||"EN").toUpperCase();
}
function closeLangMenu(){
  const wrap=document.querySelector(".lang-pop");
  const btn=document.querySelector("[data-action='lang-menu']");
  if(wrap) wrap.classList.remove("open");
  if(btn) btn.setAttribute("aria-expanded","false");
}
function toggleLangMenu(){
  const wrap=document.querySelector(".lang-pop");
  const btn=document.querySelector("[data-action='lang-menu']");
  if(!wrap || !btn) return;
  const next = !wrap.classList.contains("open");
  wrap.classList.toggle("open", next);
  btn.setAttribute("aria-expanded", String(next));
}

function updateLangStates(){
  document.querySelectorAll("[data-lang]").forEach(btn=>{
    btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang")===window.__locale));
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
function mailto(subjectKey=""){
  const subject = subjectKey ? t(subjectKey) : "Hello DzenApps";
  const body = encodeURIComponent("Hi DzenApps,\n\n");
  window.location.href = `mailto:dzenapps@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
}

function openDrawer(){
  const d=document.querySelector("#drawer");
  if(!d) return;
  d.classList.add("is-open");
  d.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
}
function closeDrawer(){
  const d=document.querySelector("#drawer");
  if(!d) return;
  d.classList.remove("is-open");
  d.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
}

function openSocialChooser(network){
  const modal=document.querySelector("#socialModal");
  if(!modal) return;

  modal.setAttribute("data-network", network);
  modal.classList.add("show");

  // Title
  const titleEl=modal.querySelector("[data-social-title]");
  if(titleEl){
    const nameKey = `social.${network}`;
    titleEl.textContent = `${t("social.choose")} — ${t(nameKey)}`;
  }
  const noteEl=modal.querySelector("[data-social-note]");
  if(noteEl) noteEl.textContent = t("social.note");

  // Buttons
  modal.querySelectorAll("[data-social-locale]").forEach(btn=>{
    const locale = btn.getAttribute("data-social-locale");
    
    const label = t(`social.${locale}`);
    btn.innerHTML = `<img class="flag" alt="" src="${assetBase}assets/flags/${locale}.svg"><span class="label">${label}</span>`;
    btn.onclick = ()=>{
      localStorage.setItem(SOCIAL_PREF_PREFIX + network, locale);
      const links = SOCIAL_LINKS[network] || {};
      const url = links[locale] || "";
      if(url){
        window.open(url,"_blank","noopener,noreferrer");
      }else{
        toast(t("toast.soon"));
      }
      closeSocialChooser();
    };
  });

  // Close
  modal.querySelectorAll("[data-action='close-social']").forEach(btn=>{
    btn.onclick = closeSocialChooser;
  });
}
function closeSocialChooser(){
  const modal=document.querySelector("#socialModal");
  if(!modal) return;
  modal.classList.remove("show");
  modal.removeAttribute("data-network");
}

function handleSocialClick(network){
  const value = SOCIAL_LINKS[network];
  if(typeof value === "string"){
    if(value){
      window.open(value,"_blank","noopener,noreferrer");
    }else{
      toast(t("toast.soon"));
    }
    return;
  }
  // chooser
  openSocialChooser(network);
}

function setLocale(locale){
  const norm=normalizeLocale(locale) || "en";
  window.__locale=norm;
  localStorage.setItem(LOCALE_KEY,norm);
  document.documentElement.setAttribute("lang", norm);
  updateLangStates();
  updateLangTrigger();
  applyTranslations();
  closeLangMenu();
}

function wireProductFilters(){
  const bar=document.querySelector("[data-product-filters]");
  if(!bar) return;
  const cards=[...document.querySelectorAll("[data-product-card]")];
  const setActive=(key)=>{
    bar.querySelectorAll("button[data-filter]").forEach(b=>{
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter")===key));
    });
    cards.forEach(c=>{
      const cat=c.getAttribute("data-category")||"";
      const show = (key==="all") || (cat===key);
      c.style.display = show ? "" : "none";
    });
  };
  bar.querySelectorAll("button[data-filter]").forEach(btn=>{
    btn.addEventListener("click", ()=>setActive(btn.getAttribute("data-filter")));
  });
  setActive("all");
}

function init(){
  window.__locale = normalizeLocale(localStorage.getItem(LOCALE_KEY)) || normalizeLocale(navigator.language) || "en";
  const themeStored = localStorage.getItem(THEME_KEY);
  const theme = (themeStored==="light"||themeStored==="dark") ? themeStored : "dark";
  setTheme(theme);
  setLocale(window.__locale);

  // theme toggle
  document.querySelectorAll("[data-action='toggle-theme']").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const current=document.documentElement.getAttribute("data-theme")||"dark";
      setTheme(current==="dark"?"light":"dark");
    });
  });

  // language toggle
  document.querySelectorAll("[data-lang]").forEach(btn=>{
    btn.addEventListener("click", ()=>setLocale(btn.getAttribute("data-lang")));
  });

  // xs language menu
  const langMenuBtn=document.querySelector("[data-action='lang-menu']");
  if(langMenuBtn){
    langMenuBtn.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); toggleLangMenu(); });
  }
  document.addEventListener("click", (e)=>{
    const wrap=document.querySelector(".lang-pop");
    if(!wrap) return;
    if(wrap.classList.contains("open") && !e.target.closest(".lang-pop")) closeLangMenu();
  });

  // email
  document.querySelectorAll("[data-action='email']").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const subject=btn.getAttribute("data-mail-subject-i18n")||"";
      mailto(subject);
    });
  });

  // current nav
  var current = (document.body && document.body.dataset) ? document.body.dataset.page : null;
  if(current){
    const link=document.querySelector(`[data-nav='${current}']`);
    if(link) link.setAttribute("aria-current","page");
  }

  // drawer
  document.querySelectorAll("[data-action='open-menu']").forEach(btn=>btn.addEventListener("click", openDrawer));
  document.querySelectorAll("[data-action='close-menu']").forEach(btn=>btn.addEventListener("click", closeDrawer));
  document.addEventListener("keydown", (e)=>{
    if(e.key==="Escape"){
      closeDrawer();
      closeSocialChooser();
    }
  });

  // socials
  document.querySelectorAll("[data-social]").forEach(btn=>{
    const network=btn.getAttribute("data-social");
    btn.addEventListener("click", ()=>handleSocialClick(network));
  });

  // close modal overlay
  const overlay = document.querySelector("#socialModal .modal-overlay");
  if(overlay) overlay.addEventListener("click", closeSocialChooser);

  wireProductFilters();
  wireReveal();
  applyTranslations();
}
document.addEventListener("DOMContentLoaded", init);

/* v0.3.3: ensure EN flags (safety) */
document.addEventListener("DOMContentLoaded", ()=>{
  const modal=document.getElementById("socialModal");
  if(!modal) return;
  modal.addEventListener("transitionend", ()=>{
    // no-op
  });
});

/* v0.3.4: modal EN flags fallback */
function forceEnFlags(){
  const btn = document.querySelector('#socialModal [data-social-locale="en"]');
  if(!btn) return;
  const label = btn.textContent && btn.textContent.trim() ? btn.textContent.trim() : "English";
  renderSocialLocaleButton(btn, "en", label);
}
document.addEventListener("click", (e)=>{
  const b = e.target.closest && e.target.closest("[data-social]");
  if(b){ setTimeout(forceEnFlags, 0); }
});
