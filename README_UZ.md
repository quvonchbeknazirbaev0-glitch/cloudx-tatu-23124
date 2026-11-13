# CloudX — Talabalar vazifalarini boshqarish tizimi

TATU, KIF fakulteti, 231-24-guruh uchun Cloud Computing mustaqil ish prototipi.

## Hozirgi holat
Frontend va Firebase bilan ishlash uchun dastlabki integratsiya tayyor. Ilova haqiqiy bulut bazasiga ulanishi uchun Firebase loyihasi konfiguratsiyasi talab qilinadi.

## Firebase sozlash
1. https://console.firebase.google.com/ saytiga kiring.
2. Google hisobingiz bilan yangi loyiha yarating: `cloudx-tatu-23124` (agar band bo‘lsa, boshqa nom tanlang).
3. Project Overview ichidan Web (`</>`) ilovasini qo‘shing.
4. Berilgan `firebaseConfig` qiymatlarini `app.js` ichidagi `firebaseConfig` obyektiga kiriting.
5. Authentication → Sign-in method → Email/Password usulini yoqing.
6. Firestore Database → Create database orqali ma’lumotlar bazasini yarating.
7. Firestore Rules bo‘limiga `firestore.rules` faylidagi qoidalarni joylang va Publish bosing.

## GitHub orqali saytni chiqarish
1. GitHub’da yangi repository yarating, masalan `cloudx-tatu-23124`.
2. Ushbu papkadagi fayllarni repository’ga yuklang.
3. Repository → Settings → Pages → Deploy from a branch → `main` va `/ (root)` ni tanlang.
4. Save bosing. GitHub Pages bergan manzilni oching.

## Tekshiruv
- Ro‘yxatdan o‘tish va kirish.
- Yangi vazifa qo‘shish.
- Vazifani bajarilgan deb belgilash.
- Vazifani o‘chirish.
- Chiqib qayta kirganda ma’lumotlar saqlanganini tekshirish.

## Xavfsizlik
Firestore qoidalarini qo‘llamasdan ma’lumotlar bazasini ommaga ochiq qoldirmang. Firebase konfiguratsiyasidagi web API key maxfiy parol emas, ammo xavfsizlik Firestore Rules va autentifikatsiya orqali ta’minlanadi. Hech qachon service account private key yoki parolni GitHub’ga yuklamang.

## Eslatma
Loyiha o‘quv prototipidir. Firebase va GitHub xizmatlarining bepul tariflari, limitlari va mavjudligi vaqt o‘tishi bilan o‘zgarishi mumkin.
