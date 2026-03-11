// OPC Board logic
const STORAGE_KEY = 'opc-board-v1';
const API_URL = 'http://localhost:4000/api/tasks';
const useApi = true; // toggle to false to fall back to localStorage only

const pageType = document.body.dataset.page || 'tasks';
const backlogEl = document.getElementById('backlog');
const searchInput = document.getElementById('search');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const ideaForm = document.getElementById('idea-form');

function showModal({ reset = true } = {}) {
    if (!modal || !ideaForm) return;
    if (reset) {
        editingId = null;
        ideaForm.reset();
    }
    modal.classList.remove('hidden');
}

function renderDue(dueDate) {
    if (!dueDate) return '';
    const now = new Date();
    const due = new Date(dueDate + 'T23:59:59');
    const diffDays = Math.floor((due - now) / (1000 * 60 * 60 * 24));
    let cls = 'border border-white/15 text-white/80';
    if (diffDays < 0) {
        cls = 'bg-red-500/20 border border-red-400/40 text-red-200';
    } else if (diffDays <= 2) {
        cls = 'bg-amber-400/20 border border-amber-300/50 text-amber-100';
    }
    return `<span class="pill ${cls}">Due: ${dueDate}</span>`;
}

// Compact row for Publish column to show more content without tall cards
function createPublishRow(task) {
    const row = document.createElement('div');
    row.className = 'glass rounded-xl px-3 py-2 border border-white/10 text-xs text-white/80 flex flex-col gap-2';
    row.draggable = pageType === 'tasks';
    row.dataset.id = task.id;
    row.innerHTML = `
        <div class="flex items-start justify-between gap-2">
            <div>
                <p class="text-white font-semibold text-sm break-words">${task.title}</p>
                <p class="text-white/60 text-[11px] mt-0.5 break-words">${task.desc || ''}</p>
            </div>
            <div class="flex items-center gap-1 text-[10px]">
                ${renderMark(task.mark)}
                ${renderDue(task.dueDate)}
                <span class="pill ${statusClass(task.status)}">${statusLabel(task.status)}</span>
            </div>
        </div>
        <div class="flex flex-wrap gap-2 text-[10px]">
            ${task.tags.map(t => `<span class="pill bg-white/5 text-white/70 border border-white/15 px-2 py-0.5 text-[10px]">${t}</span>`).join('')}
            <span class="pill bg-white/5 text-white/80 border border-white/10">${task.priority}</span>
            ${task.releaseTime ? `<span class="pill bg-white/5 text-white/60 border border-white/10">Release: ${task.releaseTime}</span>` : ''}
            ${task.dependency ? `<span class="pill bg-white/5 text-white/60 border border-white/10">依赖: ${task.dependency}</span>` : ''}
        </div>
        <div class="flex items-center flex-wrap gap-2 text-[10px] text-white/70">
            <button class="pill text-[10px] bg-white/5 border border-white/15 hover:border-cyan-400/60 btn-edit" data-id="${task.id}">编辑</button>
            <button class="pill text-[10px] bg-white/5 border border-white/15 hover:border-pink-400/60 btn-delete" data-id="${task.id}">删除</button>
            <button class="pill text-[10px] bg-white/5 border border-white/15 hover-border-amber-300/60 btn-mark" data-id="${task.id}">${markLabel(task.mark)}</button>
            <button class="pill text-[10px] bg-white/5 border border-white/15 hover-border-pink-300/60 btn-convert-idea" data-id="${task.id}">转为灵感</button>
        </div>
    `;
    if (row.draggable) {
        row.addEventListener('dragstart', handleDragStart);
        row.addEventListener('dragend', handleDragEnd);
    }
    row.addEventListener('dblclick', () => {
        const targetTask = tasks.find(t => t.id === task.id);
        if (!targetTask) return;
        editingId = targetTask.id;
        populateForm(targetTask);
        showModal({ reset: false });
    });
    return row;
}

function hideModal() {
    if (!modal || !ideaForm) return;
    ideaForm.reset();
    editingId = null;
    modal.classList.add('hidden');
}
function getAddButtons() {
    return [
        document.getElementById('add-idea-btn'),
        document.getElementById('add-idea-btn-2'),
        document.getElementById('mobile-add'),
    ].filter(Boolean);
}

const columns = {
    todo: document.getElementById('col-todo'),
    dev: document.getElementById('col-dev'),
    done: document.getElementById('col-done'),
    publish: document.getElementById('col-publish'),
};

const listSection = document.getElementById('list-section');
const kanbanSection = document.getElementById('kanban-section');
const listBody = document.getElementById('list-body');
const toggleKanban = document.getElementById('toggle-kanban');
const toggleList = document.getElementById('toggle-list');
let viewMode = 'kanban';

const counters = {
    todo: document.getElementById('count-todo'),
    dev: document.getElementById('count-dev'),
    done: document.getElementById('count-done'),
    publish: document.getElementById('count-publish'),
};

const metrics = {
    inprogress: document.getElementById('metric-inprogress'),
    done: document.getElementById('metric-done'),
    ideas: document.getElementById('metric-ideas'),
    publish: document.getElementById('metric-publish'),
    today: document.getElementById('metric-today'),
    risk: document.getElementById('metric-risk'),
    active: document.getElementById('metric-active'),
    ideaTotal: document.getElementById('idea-metric-total'),
    ideaDev: document.getElementById('idea-metric-dev'),
};

let tasks = [];
let editingId = null;

async function load() {
    if (useApi) {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('api load failed');
            tasks = await res.json();
            return;
        } catch (e) {
            console.warn('API load failed, fallback to localStorage', e);
        }
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) tasks = JSON.parse(raw);
    } catch (e) {
        console.warn('load failed', e);
    }
}

async function updateTask(id, data) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx < 0) return;
    const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        dependency: data.dependency !== undefined ? data.dependency?.trim() : undefined,
        dueDate: data.dueDate !== undefined ? data.dueDate?.trim() : undefined,
        releaseTime: data.releaseTime !== undefined ? data.releaseTime?.trim() : undefined,
        mark: data.mark !== undefined ? data.mark : undefined,
    };
    if (useApi) {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).catch(() => null);
        if (res && res.ok) {
            const updated = await res.json();
            tasks[idx] = updated;
            render();
            return;
        }
    }
    const updated = {
        ...tasks[idx],
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dependency: data.dependency?.trim() || '',
        dueDate: data.dueDate?.trim() || '',
        releaseTime: data.releaseTime?.trim() || '',
        mark: data.mark || tasks[idx].mark || '',
        updatedAt: new Date().toISOString(),
    };
    tasks[idx] = updated;
    save();
    render();
}

function populateForm(task) {
    ideaForm.elements['title'].value = task.title;
    ideaForm.elements['desc'].value = task.desc;
    ideaForm.elements['tags'].value = task.tags.join(', ');
    ideaForm.elements['priority'].value = task.priority;
    ideaForm.elements['type'].value = task.type;
    ideaForm.elements['status'].value = task.status;
    ideaForm.elements['dependency'].value = task.dependency || '';
    if (ideaForm.elements['dueDate']) {
        ideaForm.elements['dueDate'].value = task.dueDate || '';
    }
    if (ideaForm.elements['releaseTime']) {
        ideaForm.elements['releaseTime'].value = task.releaseTime || '';
    }
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function todayStr() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}

function createCard(task) {
    const card = document.createElement('div');
    card.className = 'glass card-hover rounded-2xl p-4 border border-white/10 text-sm text-white/80';
    card.draggable = pageType === 'tasks' && task.status !== 'backlog';
    card.dataset.id = task.id;
    card.innerHTML = `
        <div class="flex items-start justify-between gap-2">
            <div>
                <p class="text-white font-semibold break-words">${task.title}</p>
                <p class="text-white/60 text-xs mt-1 break-words">${task.desc || ''}</p>
            </div>
            <div class="flex items-center gap-2">
                ${renderMark(task.mark)}
                <span class="pill ${statusClass(task.status)}">${statusLabel(task.status)}</span>
            </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-3 text-[11px]">
            ${task.tags.map(t => `<span class="pill bg-white/5 text-white/70 border border-white/15 px-2 py-0.5 text-[10px]">${t}</span>`).join('')}
            <span class="pill bg-white/5 text-white/80 border border-white/10">${task.priority}</span>
            <span class="pill bg-white/5 text-white/60 border border-white/10">${task.type}</span>
            ${task.risk ? '<span class="pill status-todo">Risk</span>' : ''}
            ${task.dependency ? `<span class="pill bg-white/5 text-white/60 border border-white/10">依赖: ${task.dependency}</span>` : ''}
            ${task.releaseTime ? `<span class="pill bg-white/5 text-white/60 border border-white/10">Release: ${task.releaseTime}</span>` : ''}
            ${renderDue(task.dueDate)}
        </div>
        ${(pageType === 'ideas' && task.status === 'backlog') || pageType === 'tasks' ? `
        <div class="flex items-center gap-2 mt-3 text-[11px] text-white/70">
            ${pageType === 'ideas' && task.status === 'backlog' ? `<button class="pill text-[11px] bg-white/5 border border-white/15 hover:border-amber-300/60 btn-convert" data-id="${task.id}">转为 Todo</button>` : ''}
            ${pageType === 'tasks' ? `<button class="pill text-[11px] bg-white/5 border border-white/15 hover:border-pink-300/60 btn-convert-idea" data-id="${task.id}">转为灵感</button>` : ''}
            ${pageType === 'tasks' ? `<button class="pill text-[11px] bg-white/5 border border-white/15 hover:border-amber-300/60 btn-mark" data-id="${task.id}">${markLabel(task.mark)}</button>` : ''}
            <button class="pill text-[11px] bg-white/5 border border-white/15 hover:border-cyan-400/60 btn-edit" data-id="${task.id}">编辑</button>
            <button class="pill text-[11px] bg-white/5 border border-white/15 hover:border-pink-400/60 btn-delete" data-id="${task.id}">删除</button>
        </div>` : ''}
    `;

    if (card.draggable) {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    }
    // 双击卡片进入编辑
    card.addEventListener('dblclick', () => {
        const task = tasks.find(t => t.id === card.dataset.id);
        if (!task) return;
        editingId = task.id;
        populateForm(task);
        showModal({ reset: false });
    });
    return card;
}

function statusClass(status) {
    return {
        backlog: 'status-publish',
        todo: 'status-todo',
        dev: 'status-dev',
        done: 'status-done',
        publish: 'status-publish',
    }[status] || 'status-todo';
}

function statusLabel(status) {
    return {
        backlog: 'Backlog',
        todo: 'Todo',
        dev: 'Dev',
        done: 'Done',
        publish: 'Publish',
    }[status] || status;
}

function renderMark(mark) {
    if (!mark) return '';
    if (mark === 'progress') return `<span class="pill bg-emerald-400/15 border border-emerald-300/40 text-emerald-100"><i class="fa fa-circle-notch"></i> 进行中</span>`;
    if (mark === 'block') return `<span class="pill bg-rose-500/15 border border-rose-400/40 text-rose-100"><i class="fa fa-exclamation-triangle"></i> 阻塞</span>`;
    return '';
}

function markLabel(mark) {
    if (!mark) return '标记:空';
    if (mark === 'progress') return '标记:进行中';
    if (mark === 'block') return '标记:阻塞';
    return '标记';
}

function render() {
    if (pageType === 'ideas') {
        const query = (searchInput?.value || '').toLowerCase().trim();
        const backlogItems = tasks.filter(t => t.status === 'backlog');
        if (backlogEl) backlogEl.innerHTML = '';
        backlogItems
            .filter(t => !query || t.title.toLowerCase().includes(query) || t.tags.some(tag => tag.toLowerCase().includes(query)))
            .forEach(task => backlogEl?.appendChild(createCard(task)));
        // idea metrics
        if (metrics.ideaTotal) metrics.ideaTotal.textContent = backlogItems.length;
        if (metrics.ideaDev) metrics.ideaDev.textContent = tasks.filter(t => t.status === 'dev').length;
        wireBacklogActions();
        return;
    }

    // tasks page
    if (viewMode === 'kanban') {
        Object.keys(columns).forEach(status => {
            const col = columns[status];
            if (!col) return;
            col.innerHTML = '';
            const items = tasks.filter(t => t.status === status);
            items.forEach(task => {
                const node = status === 'publish' ? createPublishRow(task) : createCard(task);
                col.appendChild(node);
            });
            if (counters[status]) counters[status].textContent = items.length;
        });
        wireTaskActions();
    } else if (viewMode === 'list') {
        if (listBody) listBody.innerHTML = '';
        tasks.forEach(task => {
            const row = document.createElement('div');
            row.className = 'grid grid-cols-4 md:grid-cols-5 items-center px-4 py-3 text-sm text-white/80 hover:bg-white/5';
            row.dataset.id = task.id;
            row.innerHTML = `
                <div class="flex items-start gap-2">
                    <span class="pill bg-white/5 border border-white/10 text-white/70">${task.type}</span>
                    <div>
                        <p class="font-semibold text-white break-words">${task.title}</p>
                        <p class="text-xs text-white/50 break-words">${task.desc || ''}</p>
                    </div>
                </div>
                <div class="hidden md:block text-xs text-white/60 break-words">${task.desc || ''}</div>
                <div class="flex flex-wrap gap-2 text-xs">
                    ${task.tags.map(t => `<span class="pill bg-white/5 border border-white/15 text-white/70 px-2 py-0.5 text-[10px]">${t}</span>`).join('')}
                    <span class="pill bg-white/5 border border-white/10 text-white/80">${task.priority}</span>
                    ${task.releaseTime ? `<span class="pill bg-white/5 border border-white/10 text-white/70">Release: ${task.releaseTime}</span>` : ''}
                    ${renderDue(task.dueDate)}
                </div>
                <div class="text-right flex items-center justify-end gap-2 flex-wrap text-[10px]">
                    <span class="pill ${statusClass(task.status)}">${statusLabel(task.status)}</span>
                    ${renderMark(task.mark)}
                    ${pageType === 'tasks' ? `<button class="pill text-[10px] bg-white/5 border border-white/15 hover:border-amber-300/60 btn-mark" data-id="${task.id}">${markLabel(task.mark)}</button>` : ''}
                    ${pageType === 'tasks' ? `<button class="pill text-[10px] bg-white/5 border border-white/15 hover:border-pink-300/60 btn-convert-idea" data-id="${task.id}">转为灵感</button>` : ''}
                    <button class="pill text-[10px] bg-white/5 border border-white/15 hover-border-cyan-400/60 btn-edit" data-id="${task.id}">编辑</button>
                    <button class="pill text-[10px] bg-white/5 border border-white/15 hover-border-pink-400/60 btn-delete" data-id="${task.id}">删除</button>
                </div>
            `;
            listBody?.appendChild(row);
            // 双击列表行进入编辑
            row.addEventListener('dblclick', () => {
                const targetTask = tasks.find(t => t.id === task.id);
                if (!targetTask) return;
                editingId = targetTask.id;
                populateForm(targetTask);
                showModal({ reset: false });
            });
        });
        wireTaskActions();
    }

    if (metrics.ideas) metrics.ideas.textContent = tasks.filter(t => t.status === 'backlog').length;
    if (metrics.done) metrics.done.textContent = tasks.filter(t => t.status === 'done').length;
    if (metrics.publish) metrics.publish.textContent = tasks.filter(t => t.status === 'publish').length;
    if (metrics.inprogress) metrics.inprogress.textContent = tasks.filter(t => ['todo', 'dev'].includes(t.status)).length;
    if (metrics.active) metrics.active.textContent = metrics.inprogress?.textContent;
    if (metrics.risk) metrics.risk.textContent = tasks.filter(t => t.mark === 'block' || t.risk).length;
    const today = todayStr();
    if (metrics.today) metrics.today.textContent = tasks.filter(t => ['done', 'publish'].includes(t.status) && t.lastMoved === today).length;
}

function wireBacklogActions() {
    if (!backlogEl) return;
    backlogEl.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            editingId = id;
            populateForm(task);
            showModal({ reset: false });
        });
    });
    backlogEl.querySelectorAll('.btn-convert').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            task.status = 'todo';
            task.updatedAt = new Date().toISOString();
            task.lastMoved = todayStr();
            save();
            render();
        });
    });
    backlogEl.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            tasks = tasks.filter(t => t.id !== id);
            save();
            render();
        });
    });
}

function wireTaskActions() {
    // Handle edit/delete/convert in Kanban cards and list rows
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            editingId = id;
            populateForm(task);
            showModal({ reset: false });
        };
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            tasks = tasks.filter(t => t.id !== id);
            save();
            render();
        };
    });
    document.querySelectorAll('.btn-convert').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            task.status = 'todo';
            task.updatedAt = new Date().toISOString();
            task.lastMoved = todayStr();
            save();
            render();
        };
    });
    document.querySelectorAll('.btn-convert-idea').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            task.status = 'backlog';
            task.type = 'idea';
            task.updatedAt = new Date().toISOString();
            task.lastMoved = '';
            save();
            render();
        };
    });
    document.querySelectorAll('.btn-mark').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            // cycle: '' -> progress -> block -> ''
            const next = !task.mark ? 'progress' : task.mark === 'progress' ? 'block' : '';
            task.mark = next;
            task.updatedAt = new Date().toISOString();
            save();
            render();
        };
    });
}

async function addTask(data) {
    const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    if (useApi) {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).catch(() => null);
        if (res && res.ok) {
            const created = await res.json();
            tasks.unshift(created);
            render();
            return;
        }
    }
    const now = new Date().toISOString();
    tasks.unshift({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title: data.title,
        desc: data.desc || '',
        tags: payload.tags,
        priority: data.priority || 'P2',
        type: data.type || 'idea',
        status: data.status || 'backlog',
        dependency: data.dependency?.trim() || '',
        dueDate: data.dueDate?.trim() || '',
        releaseTime: data.releaseTime?.trim() || '',
        mark: '',
        risk: false,
        createdAt: now,
        updatedAt: now,
        lastMoved: data.status === 'done' || data.status === 'publish' ? todayStr() : '',
    });
    save();
    render();
}

document.addEventListener('DOMContentLoaded', () => {
    ideaForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(ideaForm);
        const title = formData.get('title')?.toString().trim();
        if (!title) return;
        const payload = {
            title,
            desc: formData.get('desc')?.toString().trim(),
            tags: formData.get('tags')?.toString(),
            priority: formData.get('priority')?.toString(),
            type: formData.get('type')?.toString(),
            status: formData.get('status')?.toString(),
            dependency: formData.get('dependency')?.toString(),
            dueDate: formData.get('dueDate')?.toString(),
            releaseTime: formData.get('releaseTime')?.toString(),
        };
        if (editingId) {
            updateTask(editingId, payload);
        } else {
            addTask(payload);
        }
        hideModal();
    });

    getAddButtons().forEach(btn => btn.addEventListener('click', () => showModal({ reset: true })));
    if (modal) {
        modalClose?.addEventListener('click', hideModal);
        modalCancel?.addEventListener('click', hideModal);
    }

    // 兜底：事件委托，确保点击新增按钮时能打开弹窗（避免偶发未绑定）
    document.addEventListener('click', (e) => {
        const target = e.target.closest('#add-idea-btn, #add-idea-btn-2, #mobile-add');
        if (target) {
            e.preventDefault();
            showModal({ reset: true });
        }
    });

    searchInput?.addEventListener('input', render);

    // 视图切换
    toggleKanban?.addEventListener('click', () => {
        viewMode = 'kanban';
        kanbanSection?.classList.remove('hidden');
        listSection?.classList.add('hidden');
        render();
    });
    toggleList?.addEventListener('click', () => {
        viewMode = 'list';
        listSection?.classList.remove('hidden');
        kanbanSection?.classList.add('hidden');
        render();
    });

    load();
    seedIfEmpty();
    render();
});

let draggingId = null;

function handleDragStart(e) {
    draggingId = this.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    this.style.opacity = '0.6';
}

function handleDragEnd() {
    this.style.opacity = '1';
    draggingId = null;
    document.querySelectorAll('.kanban-col').forEach(col => col.classList.remove('drag-over'));
}
document.querySelectorAll('.kanban-col').forEach(col => {
    col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', () => {
        col.classList.remove('drag-over');
        if (!draggingId) return;
        const status = col.dataset.status;
        const idx = tasks.findIndex(t => t.id === draggingId);
        if (idx >= 0) {
            tasks[idx].status = status;
            tasks[idx].updatedAt = new Date().toISOString();
            tasks[idx].lastMoved = ['done', 'publish'].includes(status) ? todayStr() : '';
            save();
            render();
        }
    });
});

// Seed demo tasks if empty
function seedIfEmpty() {
    if (tasks.length) return;
    const seed = [
        { title: 'Newsletter v2 Landing', desc: '短版 hero + 订阅组件', tags: 'growth,landing', priority: 'P1', type: 'feature', status: 'todo' },
        { title: '自动化发版脚本', desc: '一键打包+部署', tags: 'devops', priority: 'P2', type: 'feature', status: 'dev' },
        { title: 'AI Idea Pool', desc: '收集 prompt 思路', tags: 'ai,ideas', priority: 'P2', type: 'idea', status: 'backlog' },
        { title: 'Mini Blog 模块', desc: '发布后自动推送', tags: 'content', priority: 'P2', type: 'feature', status: 'publish' },
        { title: '性能优化', desc: '压缩图片、懒加载', tags: 'perf', priority: 'P3', type: 'feature', status: 'done' }
    ];
    seed.forEach(s => addTask({ ...s }));
}
