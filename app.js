// ================= ================= =================
// 1. روابط الـ CSV المربوطة بالجوجل شيت الخاص بك
// ================= ================= =================
const PRODUCTS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRygX-f8ueWgs5-hPD-XD8g-z5uCkTYKjqDMU_w1znt7Z8IoWbLIwZOWdhtfmv38Hu06jR6uCeWi33E/pub?gid=1509334531&single=true&output=csv";
const PACKAGES_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRygX-f8ueWgs5-hPD-XD8g-z5uCkTYKjqDMU_w1znt7Z8IoWbLIwZOWdhtfmv38Hu06jR6uCeWi33E/pub?gid=631786991&single=true&output=csv";

// ================= ================= =================
// 2. قاموس الترجمات لواجهة المستخدم
// ================= ================= =================
const uiTranslations = {
    EN: { title: "Our Products", packages: "Special Packages", buy: "Add to Order", stock: "In Stock", outStock: "Out of Stock", loading: "Loading products..." },
    AR: { title: "منتجاتنا", packages: "العروض الخاصة", buy: "أضف للطلب", stock: "متوفر", outStock: "غير متوفر", loading: "جاري تحميل المنتجات..." },
    PL: { title: "Nasze Produkty", packages: "Pakiety Specjalne", buy: "Dodaj do zamówienia", stock: "W magazynie", outStock: "Brak w magazynie", loading: "Ładowanie..." },
    RU: { title: "Наши Товары", packages: "Специальные Наборы", buy: "В заказ", stock: "В наличии", outStock: "Нет в наличии", loading: "Загрузка..." },
    CS: { title: "Naše Produkty", packages: "Speciální Balíčky", buy: "Přidat do objednávky", stock: "Skladem", outStock: "Vyprodáno", loading: "Načítání..." },
    DE: { title: "Unsere Produkte", packages: "Sonderpakete", buy: "Zur Bestellung hinzufügen", stock: "Auf Lager", outStock: "Nicht auf Lager", loading: "Laden..." },
    IT: { title: "I Nostri Prodotti", packages: "Pacchetti Speciali", buy: "Aggiungi all'ordine", stock: "Disponibile", outStock: "Esaurito", loading: "Caricamento..." }
};

let currentLang = localStorage.getItem('anjum_pharmacy_lang') || null;

window.addEventListener('DOMContentLoaded', () => {
    if (currentLang) {
        applyLanguage(currentLang);
    } else {
        document.getElementById('language-modal').classList.remove('hidden');
    }
});

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('anjum_pharmacy_lang', lang);
    applyLanguage(lang);
}

function showLanguageSelector() {
    document.getElementById('language-modal').classList.remove('hidden');
}

function applyLanguage(lang) {
    document.getElementById('language-modal').classList.add('hidden');
    document.getElementById('main-nav').classList.remove('hidden');
    document.getElementById('main-content').classList.remove('hidden');

    if (document.getElementById('current-lang-code')) {
        document.getElementById('current-lang-code').innerText = lang;
    }

    if (lang === 'AR') {
        document.documentElement.dir = "rtl";
        document.documentElement.lang = "ar";
    } else {
        document.documentElement.dir = "ltr";
        document.documentElement.lang = lang.toLowerCase();
    }

    const texts = uiTranslations[lang] || uiTranslations.EN;
    document.getElementById('products-title').innerText = texts.title;
    document.getElementById('packages-title').innerText = texts.packages;

    fetchData();
}

function fetchData() {
    if (PRODUCTS_SHEET_URL) {
        Papa.parse(PRODUCTS_SHEET_URL, {
            download: true,
            header: true,
            complete: function(results) {
                renderItems(results.data, 'products-container', false);
            }
        });
    }

    if (PACKAGES_SHEET_URL) {
        Papa.parse(PACKAGES_SHEET_URL, {
            download: true,
            header: true,
            complete: function(results) {
                renderItems(results.data, 'packages-container', true);
            }
        });
    }
}

function renderItems(data, containerId, isPackage) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const texts = uiTranslations[currentLang] || uiTranslations.EN;

    data.forEach(item => {
        if (!item.ID && !item.Price && !item.Name_EN) return;

        const name = item[`Name_${currentLang}`] || item.Name_EN || "Product";
        const desc = item[`Desc_${currentLang}`] || item.Desc_EN || "";
        const image = item.Image_URL || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80";
        const price = item.Price || "0";
        const isAvailable = item.In_Stock ? (item.In_Stock.toLowerCase() === 'true' || item.In_Stock === '1' || item.In_Stock.toLowerCase() === 'yes') : true;

        const cardHTML = `
            <div class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
                <div>
                    <div class="relative overflow-hidden bg-slate-50 h-52">
                        <img src="${image}" alt="${name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        ${isPackage ? `<span class="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-bold tracking-wider px-3 py-1 rounded-full shadow-lg uppercase">PACKAGE</span>` : ''}
                    </div>
                    <div class="p-5">
                        <h3 class="text-lg font-bold text-slate-800 mb-2 leading-snug">${name}</h3>
                        <p class="text-slate-500 text-sm line-clamp-2 leading-relaxed">${desc}</p>
                    </div>
                </div>

                <div class="p-5 pt-0 mt-auto">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <span class="text-2xl font-extrabold text-slate-900">${price}</span>
                            <span class="text-xs font-semibold text-slate-400">EGP</span>
                        </div>
                        <span class="text-xs font-semibold px-3 py-1 rounded-full ${isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-rose-50 text-rose-700 border border-rose-200/50'}">
                            ${isAvailable ? texts.stock : texts.outStock}
                        </span>
                    </div>
                    <button ${!isAvailable ? 'disabled' : ''} class="w-full bg-slate-900 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-sm hover:shadow-md disabled:opacity-40 disabled:hover:bg-slate-900 disabled:cursor-not-allowed">
                        ${texts.buy}
                    </button>
                </div>
            </div>
        `;

        container.innerHTML += cardHTML;
    });
}
