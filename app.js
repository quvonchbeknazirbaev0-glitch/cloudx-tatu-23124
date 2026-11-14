import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

/*
  1) Firebase Console’da loyiha yarating.
  2) Web App qo‘shib, firebaseConfig qiymatlarini quyidagi obyektga kiriting.
  3) Authentication > Sign-in method bo‘limida Email/Password’ni yoqing.
  4) Firestore Database yarating va firestore.rules faylidagi qoidalarni joylang.
*/
const firebaseConfig = {
  apiKey: "AIzaSyDrgLiVwhwBm_JMkz1q_8_kXSvtfeWWDDw",
  authDomain: "cloudx-tatu.firebaseapp.com",
  projectId: "cloudx-tatu",
  storageBucket: "cloudx-tatu.firebasestorage.app",
  messagingSenderId: "877252017460",
  appId: "1:877252017460:web:30b54a6f4e88963ef67961"
};

const configReady = Object.values(firebaseConfig).every(v => v && !v.startsWith("BU_YERGA"));
const $ = id => document.getElementById(id);
const authView = $("authView"), appView = $("appView");
let auth, db, currentUser, unsubscribeTasks = null, mode = "login", currentFilter = "all", tasks = [];

function message(id, text, isError=true) {
  const el = $(id); el.textContent = text; el.style.color = isError ? "#b45309" : "#16804b";
}
function setMode(next) {
  mode = next;
  $("loginTab").classList.toggle("active", mode === "login");
  $("registerTab").classList.toggle("active", mode === "register");
  $("authSubmit").textContent = mode === "login" ? "Kirish" : "Hisob yaratish";
  $("password").autocomplete = mode === "login" ? "current-password" : "new-password";
  message("authMessage", "");
}
$("loginTab").addEventListener("click", () => setMode("login"));
$("registerTab").addEventListener("click", () => setMode("register"));

$("authForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!configReady) return message("authMessage", "Avval app.js fayliga Firebase konfiguratsiyasini kiriting.");
  const email = $("email").value.trim(), password = $("password").value;
  $("authSubmit").disabled = true;
  try {
    if (mode === "register") await createUserWithEmailAndPassword(auth, email, password);
    else await signInWithEmailAndPassword(auth, email, password);
  } catch (err) { message("authMessage", friendlyError(err)); }
  finally { $("authSubmit").disabled = false; }
});

$("logoutBtn").addEventListener("click", () => signOut(auth));
$("taskForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentUser) return;
  const title = $("taskTitle").value.trim();
  if (!title) return;
  try {
    await addDoc(collection(db, "tasks"), {
      uid: currentUser.uid, title, dueDate: $("taskDate").value || "",
      priority: $("taskPriority").value, done: false, createdAt: serverTimestamp()
    });
    $("taskForm").reset(); message("taskMessage", "Vazifa bulutga saqlandi.", false);
  } catch (err) { message("taskMessage", friendlyError(err)); }
});

document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
  currentFilter = btn.dataset.filter;
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === btn));
  renderTasks();
}));

function startTasks(user) {
  if (unsubscribeTasks) unsubscribeTasks();
  const q = query(collection(db, "tasks"), where("uid", "==", user.uid), orderBy("createdAt", "desc"));
  unsubscribeTasks = onSnapshot(q, snap => {
    tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTasks();
  }, err => message("taskMessage", "Vazifalarni yuklashda xatolik: " + err.message));
}
function renderTasks() {
  $("totalCount").textContent = tasks.length;
  $("activeCount").textContent = tasks.filter(t => !t.done).length;
  $("doneCount").textContent = tasks.filter(t => t.done).length;
  const shown = tasks.filter(t => currentFilter === "all" || (currentFilter === "done" ? t.done : !t.done));
  const list = $("taskList"); list.innerHTML = "";
  if (!shown.length) {
    list.innerHTML = '<div class="empty">Bu bo‘limda hozircha vazifa yo‘q.</div>'; return;
  }
  for (const task of shown) {
    const item = document.createElement("article");
    item.className = "task" + (task.done ? " done" : "");
    const check = document.createElement("input"); check.type = "checkbox"; check.className = "check"; check.checked = !!task.done;
    check.setAttribute("aria-label", "Bajarilgan deb belgilash");
    check.addEventListener("change", () => updateDoc(doc(db, "tasks", task.id), { done: check.checked }));
    const main = document.createElement("div"); main.className = "task-main";
    const title = document.createElement("div"); title.className = "task-title"; title.textContent = task.title;
    const meta = document.createElement("div"); meta.className = "task-meta"; meta.textContent = task.dueDate ? "Muddat: " + task.dueDate : "Muddat belgilanmagan";
    main.append(title, meta);
    const priority = document.createElement("span"); priority.className = "priority" + (task.priority === "high" ? " high" : ""); priority.textContent = task.priority === "high" ? "Muhim" : "Oddiy";
    const edit = document.createElement("button");
edit.className = "delete";
edit.textContent = "Tahrirlash";

edit.addEventListener("click", async () => {
  const newTitle = prompt("Vazifa nomi:", task.title);
  if (newTitle === null || !newTitle.trim()) return;

  const newDate = prompt("Muddat (YYYY-MM-DD):", task.dueDate || "");
  if (newDate === null) return;

  const newPriority = prompt("Muhimlik: normal yoki high", task.priority || "normal");
  if (newPriority === null) return;

  if (!["normal", "high"].includes(newPriority)) {
    alert("Muhimlik qiymati noto‘g‘ri!");
    return;
  }

  try {
    await updateDoc(doc(db, "tasks", task.id), {
      title: newTitle.trim(),
      dueDate: newDate.trim(),
      priority: newPriority
    });
    alert("Vazifa yangilandi!");
  } catch (err) {
    alert("Xatolik: " + err.message);
  }
});

const del = document.createElement("button");
del.className = "delete";
del.textContent = "O‘chirish";
del.addEventListener("click", async () => {
  if (confirm("Ushbu vazifa o‘chirilsinmi?")) {
    await deleteDoc(doc(db, "tasks", task.id));
  }
});

item.append(check, main, priority, edit, del);
list.append(item);
  }
}
function friendlyError(err) {
  const map = {
    "auth/email-already-in-use": "Bu elektron pochta bilan hisob mavjud.",
    "auth/invalid-email": "Elektron pochta manzili noto‘g‘ri.",
    "auth/weak-password": "Parol kamida 6 ta belgidan iborat bo‘lsin.",
    "auth/invalid-credential": "Email yoki parol noto‘g‘ri.",
    "auth/network-request-failed": "Internet aloqasini tekshiring."
  };
  return map[err.code] || err.message || "Noma’lum xatolik yuz berdi.";
}

if (!configReady) {
  message("authMessage", "Ilovani ishga tushirish uchun Firebase konfiguratsiyasi kiritilishi kerak.");
} else {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app); db = getFirestore(app);
  onAuthStateChanged(auth, user => {
    currentUser = user;
    authView.classList.toggle("hidden", !!user);
    appView.classList.toggle("hidden", !user);
    $("logoutBtn").classList.toggle("hidden", !user);
    if (user) startTasks(user);
    else { if (unsubscribeTasks) unsubscribeTasks(); tasks = []; }
  });
}
