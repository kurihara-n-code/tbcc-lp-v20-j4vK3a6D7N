"use strict";
(() => {
  const form = document.getElementById("request-form");
  const purposes = Array.from(form.querySelectorAll('[name="request-purpose"]'));
  const experience = document.getElementById("experience-fields");
  const date = document.getElementById("experience-date");
  const email = form.elements.email;
  const confirm = form.elements["email-confirm"];
  const status = document.getElementById("form-status");
  const dialog = document.getElementById("completion-dialog");
  const submit = form.querySelector('[type="submit"]');
  function syncPurpose() {
    const enabled = purposes.some(input => input.checked && input.value === "個別説明会希望");
    experience.hidden = !enabled;
    experience.querySelectorAll("input,select").forEach(input => input.disabled = !enabled);
    date.required = enabled;
  }
  purposes.forEach(input => input.addEventListener("change", syncPurpose));
  syncPurpose();
  document.querySelectorAll("a[data-purpose]").forEach(link => {
    link.addEventListener("click", () => {
      const target = purposes.find(input => input.value === link.dataset.purpose);
      if (target) target.checked = true;
      syncPurpose();
    });
  });
  function emailValidity() {
    confirm.setCustomValidity(confirm.value && email.value !== confirm.value ? "メールアドレスが一致しません。" : "");
  }
  [email, confirm].forEach(input => input.addEventListener("input", emailValidity));
  const postal = form.elements["postal-code"];
  postal.addEventListener("input", () => {postal.value = postal.value.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 65248)).replace(/\D/g,"").slice(0,7);});
  const lookup = document.getElementById("postal-address-button");
  lookup.addEventListener("click", async () => {
    if (!/^\d{7}$/.test(postal.value)) {postal.setCustomValidity("郵便番号は7桁の数字で入力してください。");postal.reportValidity();postal.setCustomValidity("");return;}
    lookup.disabled = true;
    lookup.textContent = "検索中…";
    status.classList.remove("error");
    try {
      const response = await fetch("https://zipcloud.ibsnet.co.jp/api/search?zipcode=" + encodeURIComponent(postal.value));
      if (!response.ok) throw new Error();
      const result = await response.json();
      const place = result.results && result.results[0];
      if (!place) throw new Error();
      form.elements.address.value = place.address1 + place.address2 + place.address3;
      form.elements.address.focus();
      status.textContent = "住所を入力しました。続けて番地・建物名をご入力ください。";
    } catch (_) {
      status.textContent = "住所を取得できませんでした。ご住所を直接ご入力ください。";
      status.classList.add("error");
    } finally { lookup.disabled = false; lookup.textContent = "住所入力"; }
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    emailValidity();
    if (!form.reportValidity()) return;
    status.classList.remove("error");
    if (location.protocol === "file:" || location.hostname.endsWith("github.io")) {
      status.textContent = "プレビューでは送信できません。本番ページからお申し込みください。";
      return;
    }
    submit.disabled = true;
    status.textContent = "送信しています…";
    try {
      const response = await fetch(form.action, {method:"POST",body:new FormData(form),headers:{Accept:"application/json"}});
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "送信できませんでした。時間をおいてお試しください。");
      const purpose = purposes.find(input => input.checked).value;
      form.reset();syncPurpose();emailValidity();
      status.textContent = result.message || "送信が完了しました。";
      dialog.showModal();
      document.getElementById("close-dialog").focus();
      if (typeof window.gtag === "function") window.gtag("event","generate_lead",{form_id:"request-form",form_purpose:purpose});
    } catch(error) {
      status.textContent = error instanceof SyntaxError ? "送信できませんでした。時間をおいて再度お試しいただくか、お電話でお問い合わせください。" : error.message;
      status.classList.add("error");
    } finally {submit.disabled=false;}
  });
  document.getElementById("close-dialog").addEventListener("click", () => {dialog.close();submit.focus();});
  dialog.addEventListener("click",event => {if(event.target === dialog && (event.clientX < dialog.getBoundingClientRect().left || event.clientX > dialog.getBoundingClientRect().right || event.clientY < dialog.getBoundingClientRect().top || event.clientY > dialog.getBoundingClientRect().bottom)) dialog.close();});
  const toc = Array.from(document.querySelectorAll(".desktop-toc a[href]")).filter(a => a.hash !== "#top");
  let ticking=false;
  function updateToc(){
    let current=toc[0];
    toc.forEach(link=>{const section=document.querySelector(link.hash);if(section && section.getBoundingClientRect().top <= innerHeight*.32) current=link;});
    toc.forEach(link=>{const active=link===current;link.classList.toggle("active",active);if(active)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");});
    const contact=document.getElementById("contact").getBoundingClientRect();
    const heroButton=document.querySelector(".hero-action .button")?.getBoundingClientRect(); document.querySelector(".mobile-fixed").classList.toggle("at-form",(contact.top<innerHeight*.75&&contact.bottom>70)||(!!heroButton&&heroButton.top>=0&&heroButton.bottom<innerHeight));
    ticking=false;
  }
  addEventListener("scroll",()=>{if(!ticking){requestAnimationFrame(updateToc);ticking=true;}},{passive:true});
  addEventListener("resize",updateToc);updateToc();
  // Native disclosures keep all content accessible with touch and keyboard.
  document.querySelectorAll("details").forEach(detail=>detail.addEventListener("toggle",()=>{
    if(detail.open && detail.classList.contains("course-detail")){
      document.querySelectorAll(".course-detail").forEach(other=>{if(other!==detail)other.open=false;});
    }
  }));
})();
