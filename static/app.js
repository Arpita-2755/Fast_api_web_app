/**
 * Focus & Flow — Todo App
 * Interactive UI with filters, search, themes, and smooth UX
 */

const API = '/api/v1';
let todosCache = [];
let currentFilter = 'all';
let currentView = 'grid';

// ─── API ─────────────────────────────────────────────────────────

async function fetchTodos() {
    const res = await fetch(`${API}/`);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    todosCache = Array.isArray(data) ? data : [];
    return todosCache;
}

async function createTodo(payload) {
    const res = await fetch(`${API}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Create failed');
    }
}

async function updateTodo(id, payload) {
    const res = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Update failed');
    }
}

async function deleteTodo(id) {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
}

// ─── DOM helpers ─────────────────────────────────────────────────

function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

// ─── Toast ───────────────────────────────────────────────────────

function toast(message, type = 'success') {
    const container = $('#toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// ─── Modal ───────────────────────────────────────────────────────

function openModal(mode = 'create', todo = null) {
    const backdrop = $('#modal-backdrop');
    const titleEl = $('#modal-title');
    const form = $('#todo-form');
    const idInput = $('#todo-id');
    const titleInput = $('#title');
    const descInput = $('#desc');
    const completeInput = $('#isComplete');
    const submitBtn = $('#submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');

    if (mode === 'edit' && todo) {
        titleEl.textContent = 'Edit Task';
        btnText.textContent = 'Save Changes';
        idInput.value = todo.id;
        titleInput.value = todo.title;
        descInput.value = todo.desc;
        completeInput.checked = !!todo.isComplete;
    } else {
        titleEl.textContent = 'New Task';
        btnText.textContent = 'Create Task';
        form.reset();
        idInput.value = '';
    }
    backdrop.classList.add('visible');
    backdrop.setAttribute('aria-hidden', 'false');
    titleInput.focus();
}

function closeModal() {
    const backdrop = $('#modal-backdrop');
    backdrop.classList.remove('visible');
    backdrop.setAttribute('aria-hidden', 'true');
}

// ─── Render ──────────────────────────────────────────────────────

function filterTodos(todos, filter, search) {
    let out = todos;
    const q = (search || '').toLowerCase();
    if (q) {
        out = out.filter(t =>
            t.title.toLowerCase().includes(q) ||
            (t.desc || '').toLowerCase().includes(q)
        );
    }
    if (filter === 'active') out = out.filter(t => !t.isComplete);
    if (filter === 'completed') out = out.filter(t => t.isComplete);
    return out;
}

function renderCard(todo, index) {
    const completed = todo.isComplete ? ' completed' : '';
    return `
        <article class="todo-card${completed}" data-id="${todo.id}" style="animation-delay: ${index * 0.05}s">
            <div class="todo-header">
                <button class="todo-check" type="button" aria-label="Toggle complete" data-action="toggle">
                    ${todo.isComplete ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>' : ''}
                </button>
                <div class="todo-body">
                    <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
                    <p class="todo-desc">${escapeHtml(todo.desc || '')}</p>
                </div>
            </div>
            <div class="todo-footer">
                ${todo.isComplete ? '<span class="todo-badge">Completed</span>' : '<span></span>'}
                <div class="todo-actions">
                    <button type="button" data-action="edit">Edit</button>
                    <button type="button" class="btn-delete" data-action="delete">Delete</button>
                </div>
            </div>
        </article>
    `;
}

function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

function updateCounts() {
    const all = todosCache.length;
    const active = todosCache.filter(t => !t.isComplete).length;
    const completed = todosCache.filter(t => t.isComplete).length;
    $('#count-all').textContent = all;
    $('#count-active').textContent = active;
    $('#count-completed').textContent = completed;
}

async function render() {
    const listEl = $('#todo-list');
    const emptyEl = $('#empty-state');
    const skeletonEl = $('#loading-skeleton');
    const searchVal = $('#search-input')?.value || '';

    skeletonEl?.classList.remove('hidden');
    listEl.innerHTML = '';

    try {
        await fetchTodos();
    } catch {
        toast('Could not load tasks', 'error');
        skeletonEl?.classList.add('hidden');
        return;
    }

    skeletonEl?.classList.add('hidden');
    updateCounts();

    const filtered = filterTodos(todosCache, currentFilter, searchVal);
    const view = currentView === 'list' ? 'list-view' : 'grid-view';
    listEl.className = `todo-list ${view}`;

    if (filtered.length === 0) {
        listEl.style.display = 'none';
        emptyEl?.removeAttribute('hidden');
    } else {
        listEl.style.display = 'grid';
        emptyEl?.setAttribute('hidden', '');
        filtered.forEach((t, i) => listEl.insertAdjacentHTML('beforeend', renderCard(t, i)));
    }

    // Delegated events
    listEl.querySelectorAll('[data-action="toggle"]').forEach(btn => {
        btn.onclick = async () => {
            const card = btn.closest('.todo-card');
            const id = parseInt(card.dataset.id, 10);
            const todo = todosCache.find(t => t.id === id);
            if (!todo) return;
            try {
                await updateTodo(id, {
                    title: todo.title,
                    desc: todo.desc,
                    isComplete: !todo.isComplete
                });
                toast(todo.isComplete ? 'Task uncompleted' : 'Task completed');
                render();
            } catch {
                toast('Update failed', 'error');
            }
        };
    });

    listEl.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.closest('.todo-card').dataset.id, 10);
            const todo = todosCache.find(t => t.id === id);
            if (todo) openModal('edit', todo);
        };
    });

    listEl.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.onclick = async () => {
            if (!confirm('Delete this task?')) return;
            const id = parseInt(btn.closest('.todo-card').dataset.id, 10);
            try {
                await deleteTodo(id);
                toast('Task deleted', 'warning');
                render();
            } catch {
                toast('Delete failed', 'error');
            }
        };
    });
}

// ─── Theme ───────────────────────────────────────────────────────

function initTheme() {
    const saved = localStorage.getItem('todo-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? '' : 'light');
}

function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', isLight ? '' : 'light');
    localStorage.setItem('todo-theme', next);
}

// ─── Form submit ─────────────────────────────────────────────────

$('#todo-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idInput = $('#todo-id');
    const id = idInput.value ? parseInt(idInput.value, 10) : null;
    const title = $('#title').value.trim();
    const desc = $('#desc').value.trim();
    const isComplete = $('#isComplete').checked;

    if (title.length < 3) {
        toast('Title must be at least 3 characters', 'error');
        return;
    }
    if (desc.length < 3) {
        toast('Description must be at least 3 characters', 'error');
        return;
    }

    const payload = { title, desc, isComplete };

    try {
        if (id) {
            await updateTodo(id, payload);
            toast('Task updated');
        } else {
            await createTodo(payload);
            toast('Task created');
        }
        closeModal();
        render();
    } catch (err) {
        toast(err.message || 'Something went wrong', 'error');
    }
});

// ─── Event bindings ───────────────────────────────────────────────

$('#add-todo-btn')?.addEventListener('click', () => openModal('create'));

$('#modal-close')?.addEventListener('click', closeModal);
$('#cancel-btn')?.addEventListener('click', closeModal);

$('#modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

$('#search-input')?.addEventListener('input', () => render());

$('#theme-toggle')?.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? '' : 'light');
    localStorage.setItem('todo-theme', isLight ? 'dark' : 'light');
});

$$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        $$('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
    });
});

$$('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentView = btn.dataset.view;
        $$('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
    });
});

// ─── Init ────────────────────────────────────────────────────────

initTheme();
render();
