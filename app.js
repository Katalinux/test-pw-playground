// ---------- Cookie banner ----------
const cookieBanner = document.getElementById('cookie-banner');
const cookieAccept = document.getElementById('cookie-accept');

if (!localStorage.getItem('cookiesAccepted')) {
  cookieBanner.hidden = false;
}
cookieAccept.addEventListener('click', () => {
  localStorage.setItem('cookiesAccepted', 'true');
  cookieBanner.hidden = true;
});

// ---------- Form validation ----------
const form = document.getElementById('demo-form');
const formSuccess = document.getElementById('form-success');

function setError(fieldId, message) {
  const el = document.querySelector(`[data-testid="error-${fieldId}"]`);
  if (el) el.textContent = message;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  const name = document.getElementById('full-name');
  if (name.value.trim().length < 2) {
    setError('name', 'Name must be at least 2 characters.');
    valid = false;
  } else {
    setError('name', '');
  }

  const email = document.getElementById('email');
  if (!email.checkValidity()) {
    setError('email', 'Enter a valid email address.');
    valid = false;
  } else {
    setError('email', '');
  }

  const password = document.getElementById('password');
  if (password.value.length < 6) {
    setError('password', 'Password must be at least 6 characters.');
    valid = false;
  } else {
    setError('password', '');
  }

  const terms = document.getElementById('terms');
  if (!terms.checked) {
    setError('terms', 'You must accept the terms.');
    valid = false;
  } else {
    setError('terms', '');
  }

  formSuccess.hidden = true;
  if (valid) {
    formSuccess.hidden = false;
    form.reset();
  }
});

const avatarInput = document.getElementById('avatar');
const fileNameEl = document.getElementById('file-name');
avatarInput.addEventListener('change', () => {
  fileNameEl.textContent = avatarInput.files[0]?.name ?? '';
});

// ---------- Modal ----------
const modal = document.getElementById('demo-modal');
document.getElementById('open-modal').addEventListener('click', () => modal.showModal());
document.getElementById('close-modal').addEventListener('click', () => modal.close());

// ---------- Tabs ----------
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => {
      p.classList.remove('active');
      p.hidden = true;
    });
    btn.classList.add('active');
    const panel = document.getElementById(btn.dataset.tab);
    panel.classList.add('active');
    panel.hidden = false;
  });
});

// ---------- Accordion ----------
document.querySelectorAll('.accordion-header').forEach((header) => {
  header.addEventListener('click', () => {
    const body = header.nextElementSibling;
    body.hidden = !body.hidden;
  });
});

// ---------- Dropdown ----------
const dropdownToggle = document.getElementById('dropdown-toggle');
const dropdownMenu = document.getElementById('dropdown-menu');
dropdownToggle.addEventListener('click', () => {
  dropdownMenu.hidden = !dropdownMenu.hidden;
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) dropdownMenu.hidden = true;
});

// ---------- Drag and drop ----------
const dragList = document.getElementById('drag-list');
let draggedItem = null;

dragList.querySelectorAll('li').forEach((item) => {
  item.addEventListener('dragstart', () => {
    draggedItem = item;
    item.classList.add('dragging');
  });
  item.addEventListener('dragend', () => {
    item.classList.remove('dragging');
    draggedItem = null;
  });
});

dragList.addEventListener('dragover', (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(dragList, e.clientY);
  if (!draggedItem) return;
  if (afterElement == null) {
    dragList.appendChild(draggedItem);
  } else {
    dragList.insertBefore(draggedItem, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const items = [...container.querySelectorAll('li:not(.dragging)')];
  return items.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

// ---------- Slider ----------
const volume = document.getElementById('volume');
const volumeValue = document.getElementById('volume-value');
volume.addEventListener('input', () => {
  volumeValue.textContent = volume.value;
});

// ---------- Sortable, paginated table ----------
const tableData = [
  { name: 'Alice', score: 92 },
  { name: 'Bob', score: 78 },
  { name: 'Carla', score: 85 },
  { name: 'Dan', score: 64 },
  { name: 'Eve', score: 99 },
  { name: 'Frank', score: 71 },
  { name: 'Grace', score: 88 },
];
const PAGE_SIZE = 3;
let currentPage = 1;
let sortKey = null;
let sortAsc = true;

function renderTable() {
  let rows = [...tableData];
  if (sortKey) {
    rows.sort((a, b) => {
      const cmp = a[sortKey] > b[sortKey] ? 1 : a[sortKey] < b[sortKey] ? -1 : 0;
      return sortAsc ? cmp : -cmp;
    });
  }
  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  const tbody = document.querySelector('[data-testid="table-body"]');
  tbody.innerHTML = '';
  pageRows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.name}</td><td>${row.score}</td>`;
    tbody.appendChild(tr);
  });

  document.getElementById('page-indicator').textContent = `Page ${currentPage} of ${totalPages}`;
}

document.querySelectorAll('th[data-sort]').forEach((th) => {
  th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (sortKey === key) {
      sortAsc = !sortAsc;
    } else {
      sortKey = key;
      sortAsc = true;
    }
    renderTable();
  });
});

document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage -= 1;
    renderTable();
  }
});
document.getElementById('next-page').addEventListener('click', () => {
  currentPage += 1;
  renderTable();
});

renderTable();

// ---------- Delayed content ----------
document.getElementById('load-delayed').addEventListener('click', () => {
  const spinner = document.getElementById('spinner');
  const content = document.getElementById('delayed-content');
  content.hidden = true;
  spinner.hidden = false;
  setTimeout(() => {
    spinner.hidden = true;
    content.hidden = false;
  }, 1500);
});

// ---------- Load more list ----------
const loadMoreList = document.getElementById('load-more-list');
let loadMoreCount = 0;
function loadMoreItems() {
  for (let i = 0; i < 3; i += 1) {
    loadMoreCount += 1;
    const li = document.createElement('li');
    li.textContent = `List item ${loadMoreCount}`;
    li.dataset.testid = `load-more-item-${loadMoreCount}`;
    loadMoreList.appendChild(li);
  }
}
document.getElementById('load-more-btn').addEventListener('click', loadMoreItems);
loadMoreItems();

// ---------- Auth simulation ----------
const loginBlock = document.getElementById('login-block');
const loggedInBlock = document.getElementById('logged-in-block');
const sessionStatus = document.getElementById('session-status');
const welcomeName = document.getElementById('welcome-name');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

function applySessionState() {
  const user = localStorage.getItem('fakeUser');
  if (user) {
    loginBlock.hidden = true;
    loggedInBlock.hidden = false;
    welcomeName.textContent = user;
    sessionStatus.textContent = `Logged in as ${user}`;
  } else {
    loginBlock.hidden = false;
    loggedInBlock.hidden = true;
    sessionStatus.textContent = 'Logged out';
  }
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  if (!username || !password) {
    loginError.hidden = false;
    return;
  }
  loginError.hidden = true;
  localStorage.setItem('fakeUser', username);
  applySessionState();
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('fakeUser');
  applySessionState();
});

applySessionState();

// ---------- API testing ----------
const fetchPostsBtn = document.getElementById('fetch-posts');
const apiLoading = document.getElementById('api-loading');
const apiError = document.getElementById('api-error');
const apiResults = document.getElementById('api-results');

fetchPostsBtn.addEventListener('click', async () => {
  apiResults.innerHTML = '';
  apiError.hidden = true;
  apiLoading.hidden = false;
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    if (!res.ok) throw new Error('Network response was not ok');
    const posts = await res.json();
    posts.forEach((post) => {
      const li = document.createElement('li');
      li.textContent = post.title;
      li.dataset.testid = `post-${post.id}`;
      apiResults.appendChild(li);
    });
  } catch (err) {
    apiError.hidden = false;
  } finally {
    apiLoading.hidden = true;
  }
});
