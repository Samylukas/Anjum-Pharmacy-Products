// ================= ================= =================
// 1. ضع رابط الـ CSV الخاص بـ Products و Packages هنا
// ================= ================= =================
const PRODUCTS_SHEET_URL = "رابط_الـ_CSV_الخاص_بصفحة_Products_هنا";
const PACKAGES_SHEET_URL = "رابط_الـ_CSV_الخاص_بصفحة_Packages_هنا";

// ================= ================= =================
// 2. قاموس الترجمات لواجهة المستخدم (UI Texts)
// ================= ================= =================
const uiTranslations = {
    EN: { title: "Our Products", packages: "Special Packages", buy: "Add to Cart", stock: "In Stock", outStock: "Out of Stock", loading: "Loading products..." },
    AR: { title: "منتجاتنا", packages: "العروض الخاصة", buy: "أضف للسلة", stock: "متوفر", outStock: "غير متوفر", loading: "جاري تحميل المنتجات..." },
    PL: { title: "Nasze Produkty", packages: "Pakiety Specjalne", buy: "Dodaj do koszyka", stock: "W magazynie", outStock: "Brak w magazynie", loading: "Ładowanie produktów..." },
    RU: { title: "Наши Товары", packages: "Специальные Наборы", buy: "В корзину", stock: "В наличии", outStock: "Нет в наличии", loading: "Загрузка товаров..." },
    CS: { title: "Naše Produkty", packages: "Speciální Balíčky", buy: "Přidat do košíku", stock: "Skladem", outStock: "Vyprodáno", loading: "Načítání produktů..." },
    DE: { title: "Unsere Produkte", packages: "Sonderpakete", buy: "In den Warenkorb", stock: "Auf Lager", outStock: "Nicht auf Lager", loading: "Produkte werden geladen..." },
    IT: { title: "I Nostri Prodotti", packages: "Pacchetti Speciali", buy: "Aggiungi al Carrello", stock: "Disponibile", outStock: "Esaurito", loading: "Caricamento prodotti..." }
};

let currentLang = localStorage.getItem('anjum_pharmacy_lang') || null;

// ================= ================= =================
// 3. تهيئة الصفحة عند التحميل
// ================= ================= =================
window.addEventListener('DOMContentLoaded', () => {
    if (currentLang) {
        applyLanguage(currentLang);
    } else {
        document.getElementById('language-modal').classList.remove('hidden');
    }
});

// تحديد اللغة وإخفاء نافذة الاختيار
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('anjum_pharmacy_lang', lang);
    applyLanguage(lang);
}

// إظهار نافذة التغيير عند الضغط على زر الكوكب 🌐
function showLanguageSelector() {
    document.getElementById('language-modal').classList.remove('hidden');
}

// تطبيق إعدادات اللغة والجلب
function applyLanguage(lang) {
    document.getElementById('language-modal').classList.add('hidden');
    document.getElementById('main-nav').classList.remove('hidden');
    document.getElementById('main-content').classList.remove('hidden');

    // ضبط اتجاه النص (من اليمين لليار للعربية، ومن اليسار لليمين للباقي)
    if (lang === 'AR') {
        document.documentElement.dir = "rtl";
        document.documentElement.lang = "ar";
    } else {
        document.documentElement.dir = "ltr";
        document.documentElement.lang = lang.toLowerCase();
    }

    // تحديث النصوص الثابتة بالصفحة
    const texts = uiTranslations[lang] || uiTranslations.EN;
    document.getElementById('products-title').innerText = texts.title;
    document.getElementById('packages-title').innerText = texts.packages;
    
    const loadingEl = document.getElementById('loading-text');
    if (loadingEl) loadingEl.innerText = texts.loading;

    // جلب البيانات من الجوجل شيت
    fetchData();
}

// ================= ================= =================
// 4. قراءة الشيت وجلب البيانات (PapaParse)
// ================= ================= =================
function fetchData() {
    // جلب المنتجات
    if (PRODUCTS_SHEET_URL && !PRODUCTS_SHEET_URL.includes("رابط_الـ_CSV")) {
        Papa.parse(PRODUCTS_SHEET_URL, {
            download: true,
            header: true,
            complete: function(results) {
                renderItems(results.data, 'products-container', false);
            }
        });
    }

    // جلب العروض
    if (PACKAGES_SHEET_URL && !PACKAGES_SHEET_URL.includes("رابط_الـ_CSV")) {
        Papa.parse(PACKAGES_SHEET_URL, {
            download: true,
            header: true,
            complete: function(results) {
                renderItems(results.data, 'packages-container', true);
            }
        });
    }
}

// ================= ================= =================
// 5. رسم الكروت (Products & Packages)
// ================= ================= =================
function renderItems(data, containerId, isPackage) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // تفريغ شاشة التحميل

    const texts = uiTranslations[currentLang] || uiTranslations.EN;

    data.forEach(item => {
        // تجنب الصفوف الفارغة في الشيت
        if (!item.ID && !item.Price) return;

        const name = item[`Name_${currentLang}`] || item.Name_EN || "Product Name";
        const desc = item[`Desc_${currentLang}`] || item.Desc_EN || "";
        const image = item.Image_URL || "https://via.placeholder.com/300x200?text=Anjum+Pharmacy";
        const price = item.Price || "0";
        const isAvailable = item.In_Stock ? (item.In_Stock.toLowerCase() === 'true' || item.In_Stock === '1' || item.In_Stock.toLowerCase() === 'yes') : true;

        const badgeColor = isPackage ? 'bg-amber-500' : 'bg-green-600';
        const cardBorder = isPackage ? 'border-2 border-amber-300' : '';

        const cardHTML = `
            <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${cardBorder}">
                <div>
                    <div class="relative">
                        <img src="${image}" alt="${name}" class="w-full h-48 object-cover">
                        ${isPackage ? `<span class="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">PACKAGE</span>` : ''}
                    </div>
                    <div class="p-5">
                        <h3 class="text-xl font-bold text-gray-800 mb-2">${name}</h3>
                        <p class="text-gray-600 text-sm mb-4 line-clamp-3">${desc}</p>
                    </div>
                </div>

                <div class="p-5 pt-0 mt-auto">
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-2xl font-extrabold text-green-700">${price} <small class="text-xs font-normal">EGP</small></span>
                        <span class="text-xs px-2.5 py-1 rounded-full font-medium ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${isAvailable ? texts.stock : texts.outStock}
                        </span>
                    </div>
                    <button ${!isAvailable ? 'disabled' : ''} class="w-full ${badgeColor} text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        🛒 ${texts.buy}
                    </button>
                </div>
            </div>
        `;

        container.innerHTML += cardHTML;
    });
}
