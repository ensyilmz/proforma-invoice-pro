import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.body.style.display = "block";

});

function generateInvoiceNo() {
  const year = new Date().getFullYear();

  let lastNo = Number(localStorage.getItem("lastProformaNo") || 0);

  lastNo++;

  localStorage.setItem("lastProformaNo", lastNo);

  return `PRF-${year}-${String(lastNo).padStart(3, "0")}`;
}

const DEFAULT_STATE = () => ({
  currency: "₺",
  logo: "",
  invoiceNo: generateInvoiceNo(),
  invoiceDate: new Date().toISOString().slice(0, 10),
  validDate: "",
  sellerInfo: "",
  buyerInfo: "",
  selectedProduct: 0,

  showVat: true,
  showDiscount: false,
  showExpense: false,
  showAdvance: false,
  showBank: false,
  showWebsite: true,
  showNotes: true,
  showSignature: false,

  vatRate: 20,
  discountAmount: 0,
  discountType: "amount",
  expenseName: "Ek Gider",
  expenseAmount: 0,
  advanceAmount: 0,

  bankName: "",
  accountName: "",
  branchName: "",
  swiftCode: "",
  accountNo: "",
  ibanTry: "",
  ibanUsd: "",
  ibanEur: "",

  websiteArea: "www.orneksite.com\nwww.orneksite.com",
  notesText:
    "Örnek Bilglendirme Alanı.",
  preparedBy: "",
  zoom: 1,

  products: [
    {
      name: "Örnek Ürün",
      brand: "-",
      origin: "TR",
      qty: 1,
      price: 120000,
      desc: "Örnek Açıklama",
      image: "",
    },
  ],
});

let state = DEFAULT_STATE();

let activeHistoryId = null;

const STORAGE_KEY = "proforma_invoice_state";
function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return;

  try {
    state = {
      ...DEFAULT_STATE(),
      ...JSON.parse(saved),
    };
  } catch (err) {
    console.error(err);
  }
}

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function money(v) {
  return `${state.currency}${Number(v || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function esc(v) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nl2br(v) {
  return esc(v).replace(/\n/g, "<br>");
}

function readImage(file, cb) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.readAsDataURL(file);
}

function websiteList() {
  return state.websiteArea.split("\n").map((x) => x.trim()).filter(Boolean);
}

function hasBankInfo() {
  return Boolean(
    state.bankName ||
      state.accountName ||
      state.branchName ||
      state.swiftCode ||
      state.accountNo ||
      state.ibanTry ||
      state.ibanUsd ||
      state.ibanEur
  );
}

function getTotals() {
  const subtotal = state.products.reduce(
    (sum, p) => sum + Number(p.qty || 0) * Number(p.price || 0),
    0
  );

const discountValue = Number(state.discountAmount || 0);

const discount = state.showDiscount
  ? state.discountType === "percent"
    ? subtotal * (discountValue / 100)
    : discountValue
  : 0;
  const vatBase = Math.max(subtotal - discount, 0);
  const vat = state.showVat ? vatBase * (Number(state.vatRate || 0) / 100) : 0;
  const expense = state.showExpense ? Number(state.expenseAmount || 0) : 0;
  const advance = state.showAdvance ? Number(state.advanceAmount || 0) : 0;

  return {
    subtotal,
    discount,
    vat,
    expense,
    advance,
    grandTotal: vatBase + vat + expense - advance,
  };
}

function initDefaults() {
  $("#invoiceNo").value = state.invoiceNo;
  $("#invoiceDate").value = state.invoiceDate;
  $("#validDate").value = state.validDate;
  $("#currency").value =
    state.currency === "$" ? "$ USD" : state.currency === "€" ? "€ EUR" : "₺ TRY";

  [
    "showVat",
    "showDiscount",
    "showExpense",
    "showAdvance",
    "showBank",
    "showWebsite",
    "showNotes",
    "showSignature",
  ].forEach((id) => ($("#" + id).checked = state[id]));

  $("#vatRate").value = state.vatRate;
  $("#discountType").value = state.discountType;
  $("#discountAmount").value = state.discountAmount;
  $("#expenseName").value = state.expenseName;
  $("#expenseAmount").value = state.expenseAmount;
  $("#advanceAmount").value = state.advanceAmount;

  $("#bankName").value = state.bankName;
  $("#accountName").value = state.accountName;
  $("#branchName").value = state.branchName;
  $("#swiftCode").value = state.swiftCode;
  $("#accountNo").value = state.accountNo;
  $("#ibanTry").value = state.ibanTry;
  $("#ibanUsd").value = state.ibanUsd;
  $("#ibanEur").value = state.ibanEur;

  $("#websiteArea").value = state.websiteArea;
  $("#notesText").value = state.notesText;
  $("#preparedBy").value = state.preparedBy;

  $("#logoMiniPreview").innerHTML = state.logo
    ? `<img src="${state.logo}" alt="">`
    : "Logo önizleme";
}

function bindTabs() {
  $$(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".tab-btn").forEach((b) => b.classList.remove("active"));
      $$(".tab-content").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      $("#" + btn.dataset.tab).classList.add("active");
    });
  });
}

function bindInputs() {
  const fields = [
    "invoiceNo",
    "invoiceDate",
    "validDate",
    "sellerInfo",
    "buyerInfo",
    "vatRate",
    "discountAmount",
    "expenseName",
    "expenseAmount",
    "advanceAmount",
    "bankName",
    "accountName",
    "branchName",
    "swiftCode",
    "accountNo",
    "ibanTry",
    "ibanUsd",
    "ibanEur",
    "websiteArea",
    "notesText",
    "preparedBy",
  ];

  fields.forEach((id) => {
    $("#" + id).addEventListener("input", (e) => {
      state[id] =
        e.target.type === "number" ? Number(e.target.value || 0) : e.target.value;
      render();
    });
  });
  
  $("#discountType").addEventListener("change", (e) => {
  state.discountType = e.target.value;
  render();
});

  $("#currency").addEventListener("change", (e) => {
    const v = e.target.value;
    state.currency = v.includes("$") ? "$" : v.includes("€") ? "€" : "₺";
    render();
  });

  [
    "showVat",
    "showDiscount",
    "showExpense",
    "showAdvance",
    "showBank",
    "showWebsite",
    "showNotes",
    "showSignature",
  ].forEach((id) => {
    $("#" + id).addEventListener("change", (e) => {
      state[id] = e.target.checked;
      renderOptionalFields();
      render();
    });
  });

  $("#logoInput").addEventListener("change", (e) => {
    readImage(e.target.files[0], (src) => {
      state.logo = src;
      $("#logoInput").value = "";
      render();
    });
  });
}

function renderOptionalFields() {
  const map = {
    vat: state.showVat,
    discount: state.showDiscount,
    expense: state.showExpense,
    advance: state.showAdvance,
    bank: state.showBank,
    website: state.showWebsite,
    notes: state.showNotes,
    signature: state.showSignature,
  };

  Object.entries(map).forEach(([key, active]) => {
    const el = document.querySelector(`[data-optional="${key}"]`);
    if (el) el.classList.toggle("active", active);
  });
}

function bindProducts() {
  $("#addProductBtn").addEventListener("click", () => {
    state.products.push({
      name: "Yeni Ürün",
      brand: "-",
      origin: "TR",
      qty: 1,
      price: 0,
      desc: "",
      image: "",
    });
    state.selectedProduct = state.products.length - 1;
    render();
  });

  $("#duplicateProductBtn").addEventListener("click", () => {
    const p = state.products[state.selectedProduct];
    state.products.splice(state.selectedProduct + 1, 0, {
      ...p,
      name: `${p.name || "Ürün"} Kopya`,
    });
    state.selectedProduct++;
    render();
  });

  $("#deleteProductBtn").addEventListener("click", () => {
    if (state.products.length === 1) return alert("En az 1 ürün kalmalı.");
    state.products.splice(state.selectedProduct, 1);
    state.selectedProduct = Math.max(0, state.selectedProduct - 1);
    render();
  });

  const map = {
    productName: "name",
    productBrand: "brand",
    productOrigin: "origin",
    productQty: "qty",
    productPrice: "price",
    productDesc: "desc",
  };

  Object.entries(map).forEach(([id, key]) => {
    $("#" + id).addEventListener("input", (e) => {
      state.products[state.selectedProduct][key] =
        e.target.type === "number" ? Number(e.target.value || 0) : e.target.value;
      render();
    });
  });

  $("#productImage").addEventListener("change", (e) => {
    readImage(e.target.files[0], (src) => {
      state.products[state.selectedProduct].image = src;
      $("#productImage").value = "";
      render();
    });
  });
}

function renderProductList() {
  $("#productList").innerHTML = state.products
    .map((p, index) => {
      const total = Number(p.qty || 0) * Number(p.price || 0);

      return `
        <div class="product-list-item ${
          index === state.selectedProduct ? "active" : ""
        }" data-index="${index}">
          <div class="product-list-thumb">
            ${p.image ? `<img src="${p.image}" alt="">` : "IMG"}
          </div>
          <div class="product-list-info">
            <strong>${esc(p.name || "Ürün adı")}</strong>
            <small>${Number(p.qty || 0)} adet · ${money(total)}</small>
          </div>
          <button type="button">Düzenle</button>
        </div>
      `;
    })
    .join("");

  $$(".product-list-item").forEach((item) => {
    item.addEventListener("click", () => {
      state.selectedProduct = Number(item.dataset.index);
      render();
    });
  });
}

function renderProductEditor() {
  const p = state.products[state.selectedProduct];

  $("#productName").value = p.name || "";
  $("#productBrand").value = p.brand || "";
  $("#productOrigin").value = p.origin || "";
  $("#productQty").value = p.qty || 0;
  $("#productPrice").value = p.price || 0;
  $("#productDesc").value = p.desc || "";

  $("#imagePreview").innerHTML = p.image
    ? `<img src="${p.image}" alt="">`
    : "Görsel önizleme";

  $("#logoMiniPreview").innerHTML = state.logo
    ? `<img src="${state.logo}" alt="">`
    : "Logo önizleme";
}

function productHeadHtml() {
  return `
    <div class="product-table-head">
      <span>Görsel</span>
      <span>Ürün Bilgisi</span>
      <span>Marka</span>
      <span>Menşei</span>
      <span>Miktar</span>
      <span>Birim Fiyat</span>
      <span>Toplam</span>
    </div>
  `;
}

function productRowHtml(p) {
  const total = Number(p.qty || 0) * Number(p.price || 0);

  return `
    <div class="invoice-product-row">
      <div class="invoice-product-image">
        ${p.image ? `<img src="${p.image}" alt="">` : "IMG"}
      </div>
      <div>
        <strong>${esc(p.name || "-")}</strong>
        <small>${esc(p.desc || "")}</small>
      </div>
      <span>${esc(p.brand || "-")}</span>
      <span>${esc(p.origin || "-")}</span>
      <span>${Number(p.qty || 0)}</span>
      <span>${money(p.price || 0)}</span>
      <strong>${money(total)}</strong>
    </div>
  `;
}

function makeFirstPage() {
  const page = $("#firstPageTemplate")
    .content.cloneNode(true)
    .querySelector(".a4-page");

  page.querySelector(".logoPreview").innerHTML = state.logo
    ? `<img src="${state.logo}" alt="">`
    : "LOGO";

  page.querySelector(".invoiceInfoPreview").innerHTML = `
    <div>PROFORMA NO</div>
    <strong>${esc(state.invoiceNo || "-")}</strong>
    <div>TARİH</div>
    <strong>${esc(state.invoiceDate || "-")}</strong>
    ${
      state.validDate
        ? `<div>GEÇERLİLİK</div><strong>${esc(state.validDate)}</strong>`
        : ""
    }
  `;

  page.querySelector(".sellerPreview").innerHTML = `
    <strong>Satıcı Bilgileri</strong><br>
    ${nl2br(state.sellerInfo || "Satıcı bilgileri")}
  `;

  page.querySelector(".buyerPreview").innerHTML = `
    <strong>Alıcı Bilgileri</strong><br>
    ${nl2br(state.buyerInfo || "Alıcı bilgileri")}
  `;

  page.querySelector(".productsPreview").innerHTML = productHeadHtml();
  hideSummaryBlocks(page);
  return page;
}

function makeContinuationPage() {
  const page = $("#continuationPageTemplate")
    .content.cloneNode(true)
    .querySelector(".a4-page");

  page.querySelector(".productsPreview").innerHTML = productHeadHtml();
  hideSummaryBlocks(page);
  return page;
}

function pageOverflows(page) {
  return page.scrollHeight > page.clientHeight + 2;
}

function addProductSmart(page, product) {
  const container = page.querySelector(".productsPreview");
  const html = productRowHtml(product);
  container.insertAdjacentHTML("beforeend", html);

  if (pageOverflows(page)) {
    container.lastElementChild.remove();
    return false;
  }

  return true;
}

function hideSummaryBlocks(page) {
  page.querySelector(".websitePreview").style.display = "none";
  page.querySelector(".bankPreview").style.display = "none";
  page.querySelector(".bottom-area").style.display = "none";
  page.querySelector(".signaturePreview").style.display = "none";
}

function createWebsiteBlock() {
  if (!state.showWebsite || !websiteList().length) return null;

  const el = document.createElement("div");
  el.className = "website-preview";
  el.style.display = "flex";
  el.innerHTML = websiteList().map((x) => `<span>${esc(x)}</span>`).join("");
  return el;
}

function createBankBlock() {
  if (!state.showBank || !hasBankInfo()) return null;

  const fields = [
    ["Banka", state.bankName],
    ["Hesap Adı", state.accountName],
    ["Şube", state.branchName],
    ["Swift", state.swiftCode],
    ["Hesap No", state.accountNo],
    ["IBAN (₺)", state.ibanTry],
    ["IBAN ($)", state.ibanUsd],
    ["IBAN (€)", state.ibanEur],
  ].filter((x) => x[1]);

  const el = document.createElement("div");
  el.className = "bank-preview";
  el.style.display = "block";
  el.innerHTML = `
    <h4>Banka Bilgileri</h4>
    <div class="bank-grid">
      ${fields
        .map(([k, v]) => `<div><strong>${esc(k)}:</strong> ${esc(v)}</div>`)
        .join("")}
    </div>
  `;
  return el;
}

function createBottomBlock() {
  const el = document.createElement("div");
  el.className = "bottom-area";
  el.style.display = "grid";

  const t = getTotals();

  el.innerHTML = `
    <div class="notes-preview" style="${state.showNotes ? "" : "display:none"}">
      <strong>Genel Bilgilendirme</strong><br>
      ${nl2br(state.notesText || "")}
    </div>

    <div class="totals-preview">
      <div class="total-line">
        <span>Ürün Ara Toplamı</span>
        <strong>${money(t.subtotal)}</strong>
      </div>

      ${
        state.showDiscount
          ? `<div class="total-line"><span>${
  state.discountType === "percent"
    ? `İskonto (%${state.discountAmount})`
    : "İskonto"
}</span><strong>-${money(
              t.discount
            )}</strong></div>`
          : ""
      }

      ${
        state.showVat
          ? `<div class="total-line"><span>KDV (%${Number(
              state.vatRate || 0
            )})</span><strong>${money(t.vat)}</strong></div>`
          : ""
      }

      ${
        state.showExpense || state.showAdvance
          ? `<div class="total-divider"></div>`
          : ""
      }

      ${
        state.showExpense
          ? `<div class="total-line"><span>${esc(
              state.expenseName || "Ek Gider"
            )}</span><strong>${money(t.expense)}</strong></div>`
          : ""
      }

      ${
        state.showAdvance
          ? `<div class="total-line"><span>Kaparo</span><strong>-${money(
              t.advance
            )}</strong></div>`
          : ""
      }

      <div class="total-line grand-total">
        <span>Genel Toplam</span>
        <strong>${money(t.grandTotal)}</strong>
      </div>
    </div>
  `;

  return el;
}

function createSignatureBlock() {
  if (!state.showSignature) return null;

  const el = document.createElement("div");
  el.className = "signature-preview";
  el.style.display = "flex";
  el.innerHTML = `
    <div class="signature-box">
      <strong>${esc(state.preparedBy || "Teklifi Hazırlayan")}</strong>
      <div class="signature-line">İmza</div>
    </div>
  `;
  return el;
}

function addBlockSmart(pages, block, wrapper) {
  if (!block) return;

  let page = pages[pages.length - 1];

  page.insertBefore(block, page.querySelector(".footer"));

  if (pageOverflows(page)) {
    block.remove();

    page = makeContinuationPage();

    pages.push(page);
    wrapper.appendChild(page);

    page.insertBefore(block, page.querySelector(".footer"));
  }
}

function renderPages() {
  const wrapper = $("#pdfPages");
  wrapper.innerHTML = "";

  const pages = [];
  let page = makeFirstPage();

  pages.push(page);
  wrapper.appendChild(page);

  state.products.forEach((product) => {
    if (!addProductSmart(page, product)) {
      page = makeContinuationPage();
      pages.push(page);
      wrapper.appendChild(page);
      addProductSmart(page, product);
    }
  });

  addBlockSmart(pages, createWebsiteBlock(), wrapper);
  addBlockSmart(pages, createBankBlock(), wrapper);
  addBlockSmart(pages, createBottomBlock(), wrapper);
  addBlockSmart(pages, createSignatureBlock(), wrapper);

  pages.forEach((p, i) => {
    p.querySelector(".pageNumber").innerText = `Sayfa ${i + 1} / ${pages.length}`;
  });

  applyZoom();
}

function applyZoom() {
  $$(".a4-page").forEach((page) => {
    page.style.transform = `scale(${state.zoom})`;
  });
}

function bindZoom() {
  $("#zoomPreviewBtn").addEventListener("click", () => {
    const steps = [0.85, 1, 1.12];
    state.zoom = steps[(steps.indexOf(state.zoom) + 1) % steps.length];
    applyZoom();
    $("#zoomPreviewBtn").innerText = `%${Math.round(state.zoom * 100)}`;
  });
}

function bindPdf() {
  [$("#downloadPdfBtn"), $("#downloadPdfBtnTop")].forEach((button) => {
    button.addEventListener("click", async () => {
      document.body.classList.add("pdf-export-mode");

      const oldGap = $("#pdfPages").style.gap;
      $("#pdfPages").style.gap = "0";

      $$(".a4-page").forEach((page) => {
        page.style.transform = "none";
      });

      try {
        await html2pdf()
          .set({
            margin: 0,
            filename: `${state.invoiceNo || "proforma-invoice"}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              backgroundColor: "#ffffff",
              scrollX: 0,
              scrollY: 0,
            },
            jsPDF: {
              unit: "mm",
              format: "a4",
              orientation: "portrait",
            },
          })
          .from($("#pdfPages"))
          .save();
      } finally {
        document.body.classList.remove("pdf-export-mode");
        $("#pdfPages").style.gap = oldGap;
        applyZoom();
      }
    });
  });
}

function bindClearForm() {
  $("#clearFormBtn").addEventListener("click", () => {
    if (!confirm("Tüm proforma bilgileri temizlensin mi?")) return;

    state = DEFAULT_STATE();
    initDefaults();
    render();
    $("#zoomPreviewBtn").innerText = "Yakınlaştır";
  });
}

function render() {
  renderProductList();
  renderProductEditor();
  renderOptionalFields();
  renderPages();
  saveState();
}

/* ==================================
   HESAPLAMA ARAÇLARI
================================== */

const calcDisplay = () => document.getElementById("calcDisplay");

function calcAdd(value){
    calcDisplay().value += value;
}

function calcClear(){
    calcDisplay().value = "";
}

function calcResult(){
    try{
        calcDisplay().value = eval(calcDisplay().value);
    }catch{
        calcDisplay().value = "Hata";
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const panel = document.getElementById("calculatorPanel");
    const toggle = document.getElementById("calculatorToggle");
    const closeBtn = document.getElementById("calcClose");

    /* PANEL AÇ / KAPA */

    toggle?.addEventListener("click", () => {
        panel?.classList.add("active");
    });

    closeBtn?.addEventListener("click", () => {
        panel?.classList.remove("active");
    });

    /* TABLAR */

    const tabs = document.querySelectorAll(".tool-tab");
    const pages = document.querySelectorAll(".tool-page");

    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            tabs.forEach(t => t.classList.remove("active"));
            pages.forEach(p => p.classList.remove("active"));

            tab.classList.add("active");

            const type = tab.dataset.tab;

            if(type === "kdv"){
                document.getElementById("kdvPage")?.classList.add("active");
            }

            if(type === "discount"){
                document.getElementById("discountPage")?.classList.add("active");
            }

            if(type === "currency"){
                document.getElementById("currencyPage")?.classList.add("active");
            }

            if(type === "calc"){
                document.getElementById("calcPage")?.classList.add("active");
            }

        });

    });

    /* KDV */

    document.getElementById("kdvBtn")?.addEventListener("click", () => {

        const amount =
            Number(document.getElementById("kdvAmount").value || 0);

        const rate =
            Number(document.getElementById("kdvRate").value || 0);

        const vat = amount * (rate / 100);

        document.getElementById("kdvResult").innerHTML =
            `KDV: ${vat.toLocaleString("tr-TR")}<br>
             Toplam: ${(amount + vat).toLocaleString("tr-TR")}`;

    });

    /* İSKONTO */

    document.getElementById("discountBtn")?.addEventListener("click", () => {

        const amount =
            Number(document.getElementById("discountBase").value || 0);

        const rate =
            Number(document.getElementById("discountRate").value || 0);

        const discount = amount * (rate / 100);

        document.getElementById("discountResult").innerHTML =
            `İskonto: ${discount.toLocaleString("tr-TR")}<br>
             Kalan: ${(amount - discount).toLocaleString("tr-TR")}`;

    });

    /* KUR */

    document.getElementById("currencyBtn")?.addEventListener("click", () => {

        const amount =
            Number(document.getElementById("currencyAmount").value || 0);

        const rate =
            Number(document.getElementById("currencyRate").value || 0);

        const result = amount * rate;

        document.getElementById("currencyResult").innerHTML =
            result.toLocaleString("tr-TR");

    });

});

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initDefaults();
  bindTabs();
  bindInputs();
  bindProducts();
  bindZoom();
  bindPdf();
  bindClearForm();
  render();
});

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

const clockToggle = document.getElementById("clockToggle");
const clockPanel = document.getElementById("clockPanel");
const clockTime = document.getElementById("clockTime");
const clockDate = document.getElementById("clockDate");
const clockDay = document.getElementById("clockDay");

function updateClock() {
  const now = new Date();

  clockTime.innerText = now.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  clockDate.innerText = now.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  clockDay.innerText = now.toLocaleDateString("tr-TR", {
    weekday: "long",
  });
}

clockToggle?.addEventListener("click", () => {
  clockPanel.classList.toggle("active");
  updateClock();
});

updateClock();
setInterval(updateClock, 1000);

const saveProformaBtn = document.getElementById("saveProformaBtn");

if (saveProformaBtn) {

  saveProformaBtn.addEventListener("click", async () => {

    try {

      const user = auth.currentUser;

      if (!user) {
        alert("Oturum bulunamadı");
        return;
      }

      const totals = getTotals();

      await addDoc(
        collection(db, "users", user.uid, "proformas"),
        {
          invoiceNo: state.invoiceNo,
          total: totals.grandTotal,
          currency: state.currency,
          createdAt: serverTimestamp(),
          data: state
        }
      );

      showToast("✓ Teklif başarıyla kaydedildi");

      state.invoiceNo = generateInvoiceNo();

const invoiceInput = document.getElementById("invoiceNo");
if (invoiceInput) {
  invoiceInput.value = state.invoiceNo;
}

    } catch (error) {

      console.error(error);
      alert("Kayıt sırasında hata oluştu");

    }

  });

}

const historyToggle = document.getElementById("historyToggle");
const historyPanel = document.getElementById("historyPanel");
const closeHistoryPanel = document.getElementById("closeHistoryPanel");

if (historyToggle && historyPanel) {

historyToggle.addEventListener("click", async () => {
  historyPanel.classList.add("open");
  await loadHistory();
});

  closeHistoryPanel?.addEventListener("click", () => {
    
    historyPanel.classList.remove("open");
  });

}

async function loadHistory() {

  if (!auth.currentUser) return;

  const historyList = document.getElementById("historyList");

  try {

    const q = query(
      collection(
        db,
        "users",
        auth.currentUser.uid,
        "proformas"
      ),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const historyCount = document.getElementById("historyCount");

if(historyCount){
  historyCount.textContent = `(${snapshot.size})`;
}

    if (snapshot.empty) {
      historyList.innerHTML = "Henüz kayıt yok.";
      return;
    }

    let html = "";

    snapshot.forEach(doc => {

      const item = doc.data();
      const customerName =
  item.data?.buyerInfo?.split("\n")[0]?.trim() ||
  "Müşteri belirtilmedi";

html += `
  <div class="history-item ${activeHistoryId === doc.id ? "active-history" : ""}">
          <div class="history-title">
            ${item.data?.invoiceNo || "Proforma"}
          </div>

          <div class="history-date">
  ${item.data?.invoiceDate || "-"}
</div>
<div class="history-customer">
  ${customerName}
</div>

          <div class="history-price">
            ${item.currency || "₺"}${Number(item.total || 0).toLocaleString("tr-TR")}
          </div>

          <div class="history-actions">
            <button class="history-open" data-id="${doc.id}">
              Aç
            </button>

            <button class="history-delete" data-id="${doc.id}">
              Sil
            </button>
          </div>
        </div>
      `;
    });

    historyList.innerHTML = html;

    const historySearchInput = document.getElementById("historySearchInput");

if (historySearchInput) {
  historySearchInput.addEventListener("input", () => {
    const searchValue = historySearchInput.value.toLowerCase().trim();

    document.querySelectorAll(".history-item").forEach((item) => {
      const text = item.innerText.toLowerCase();
      item.style.display = text.includes(searchValue) ? "block" : "none";
    });
  });
}

    document.querySelectorAll(".history-open").forEach((btn) => {
  btn.addEventListener("click", () => {
    openHistoryItem(btn.dataset.id);
  });
});

document.querySelectorAll(".history-delete").forEach((btn) => {
  btn.addEventListener("click", async () => {

    if (!confirm("Bu teklifi silmek istiyor musun?")) return;

const card = btn.closest(".history-item");
card?.classList.add("deleting");

    try {
      await deleteDoc(
        doc(
          db,
          "users",
          auth.currentUser.uid,
          "proformas",
          btn.dataset.id
        )
      );

      showToast("🗑 Teklif silindi");
      await loadHistory();

    } catch (err) {
      console.error(err);
      showToast("Silme başarısız");
    }

  });
});


  } catch (err) {
    console.error(err);
    historyList.innerHTML = "Kayıtlar yüklenemedi.";
  }
}
async function openHistoryItem(id) {
  if (!auth.currentUser) return;

  const ref = doc(
    db,
    "users",
    auth.currentUser.uid,
    "proformas",
    id
  );

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Kayıt bulunamadı");
    return;
  }

  const saved = snap.data();

  state = {
    ...DEFAULT_STATE(),
    ...saved.data
  };

  initDefaults();
  render();
activeHistoryId = id;
  historyPanel.classList.remove("open");
}

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}