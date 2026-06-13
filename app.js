const STORAGE_KEY = "todo.tasks.v1";
let tasks = load();
let filter = "all";

const el = {
  input: document.getElementById("new-task"),
  add: document.getElementById("add"),
  list: document.getElementById("list"),
  empty: document.getElementById("empty"),
  count: document.getElementById("count"),
  clear: document.getElementById("clear"),
  date: document.getElementById("date"),
};

el.date.textContent = new Date().toLocaleDateString("ja-JP", {
  year: "numeric", month: "long", day: "numeric", weekday: "short",
});

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(text) {
  text = text.trim();
  if (!text) return;
  tasks.unshift({ id: Date.now() + Math.random(), text, done: false });
  save();
  render();
}
function toggle(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; save(); render(); }
}
function remove(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}
function edit(id, text) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  text = text.trim();
  if (text) { t.text = text; save(); }
  render();
}
function clearDone() {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
}

function visible() {
  if (filter === "active") return tasks.filter(t => !t.done);
  if (filter === "done") return tasks.filter(t => t.done);
  return tasks;
}

function render() {
  el.list.innerHTML = "";
  const items = visible();
  el.empty.hidden = items.length > 0;

  for (const t of items) {
    const li = document.createElement("li");
    li.className = "item" + (t.done ? " done" : "");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "check";
    check.checked = t.done;
    check.addEventListener("change", () => toggle(t.id));

    const span = document.createElement("span");
    span.className = "text";
    span.textContent = t.text;
    span.title = "クリックで編集";
    span.addEventListener("click", () => startEdit(li, span, t));

    const del = document.createElement("button");
    del.className = "del";
    del.innerHTML = "&times;";
    del.title = "削除";
    del.addEventListener("click", () => remove(t.id));

    li.append(check, span, del);
    el.list.appendChild(li);
  }

  const remaining = tasks.filter(t => !t.done).length;
  el.count.textContent = `未完了 ${remaining} 件 / 全 ${tasks.length} 件`;
  el.clear.disabled = !tasks.some(t => t.done);
}

function startEdit(li, span, t) {
  const input = document.createElement("input");
  input.className = "edit-input";
  input.value = t.text;
  li.replaceChild(input, span);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  const commit = () => edit(t.id, input.value);
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") { input.removeEventListener("blur", commit); render(); }
  });
}

el.add.addEventListener("click", () => { addTask(el.input.value); el.input.value = ""; el.input.focus(); });
el.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { addTask(el.input.value); el.input.value = ""; }
});
el.clear.addEventListener("click", clearDone);

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === btn));
    render();
  });
});

// --- メモ欄（自由に書いて置いておける場所・自動保存） ---
const MEMO_KEY = "todo.memo.v1";
const memo = document.getElementById("memo");
const memoStatus = document.getElementById("memo-status");
memo.value = localStorage.getItem(MEMO_KEY) || "";

let memoTimer;
memo.addEventListener("input", () => {
  memoStatus.textContent = "入力中...";
  clearTimeout(memoTimer);
  memoTimer = setTimeout(() => {
    localStorage.setItem(MEMO_KEY, memo.value);
    memoStatus.textContent = "保存しました";
    setTimeout(() => { memoStatus.textContent = "自動保存"; }, 1500);
  }, 400);
});

render();
