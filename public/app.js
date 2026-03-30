/* ============================================================
   app.js  –  Unified single-page logic: Board + Ideas + Analytics
   ============================================================ */
(function () {
  'use strict';

  const LS_KEY = 'solohelm-v1';
  const API = '/api/tasks';
  let tasks = [];
  let editingId = null;
  let currentView = 'kanban'; // kanban | list | timeline
  let activeTab = 'ideas';    // board | ideas | analytics
  let selectedCardIdx = -1;
  let analyticsLoaded = false;
  let chartInstances = {};
  let currentLang = 'zh';

  /* ---------- i18n Dictionary ---------- */
  const i18n = {
    zh: {
      // Nav & Tabs
      'nav.board': '看板', 'nav.ideas': '灵感', 'nav.analytics': '分析',
      'nav.toggle_theme': '切换主题',
      'nav.new_task': '新建任务', 'nav.new_idea': '新建灵感',
      // Settings menu
      'settings.export_json': '导出 JSON', 'settings.export_csv': '导出 CSV',
      'settings.import_json': '导入 JSON', 'settings.shortcuts': '快捷键 (?)',
      // Board metrics
      'metric.in_progress': '进行中', 'metric.done': '已完成',
      'metric.ideas_pool': '灵感池', 'metric.published': '已发布',
      // Board summary
      'summary.today': '今日:', 'summary.risk': '风险/阻塞:', 'summary.active': '活跃:',
      // View toggle
      'view.kanban': '看板', 'view.list': '列表', 'view.timeline': '时间线',
      // Kanban columns
      'col.todo': '待办', 'col.dev': '进行中', 'col.done': '开发完成', 'col.publish': '已发布',
      // List headers
      'list.type': '类型', 'list.title': '标题', 'list.desc': '描述',
      'list.tags': '标签', 'list.priority': '优先级', 'list.release': '发布时间',
      'list.status': '状态', 'list.actions': '操作',
      // Ideas tab
      'metric.ideas_total': '灵感总数', 'metric.in_dev': '开发中',
      'ideas.search_placeholder': '按标题或标签搜索灵感… (按 / 聚焦)',
      // Analytics tab
      'metric.total_tasks': '总任务数', 'metric.avg_cycle': '平均周期 (天)',
      'metric.this_week': '本周',
      'chart.status_dist': '状态分布', 'chart.priority_breakdown': '优先级分布',
      'chart.weekly_velocity': '每周速率', 'chart.burndown': '燃尽图',
      'chart.tasks': '任务', 'chart.completed': '已完成',
      'chart.created_cum': '创建 (累计)', 'chart.completed_cum': '完成 (累计)',
      // Modal
      'modal.new_task': '新建任务', 'modal.edit_task': '编辑任务', 'modal.new_idea': '新建灵感',
      'modal.title': '标题 *', 'modal.title_placeholder': '任务标题',
      'modal.desc': '描述', 'modal.desc_placeholder': '描述任务…',
      'modal.voice': '语音输入',
      'modal.tags': '标签', 'modal.tags_hint': '(逗号分隔)',
      'modal.tags_placeholder': '例如 ui, bug, auth',
      'modal.priority': '优先级',
      'modal.p1': 'P1 - 高', 'modal.p2': 'P2 - 中', 'modal.p3': 'P3 - 低',
      'modal.type': '类型',
      'modal.feature': '功能', 'modal.bug': '缺陷', 'modal.idea': '灵感',
      'modal.status': '状态',
      'modal.backlog': '待定', 'modal.todo': '待办', 'modal.dev': '开发',
      'modal.done': '完成', 'modal.publish': '发布',
      'modal.dependency': '依赖', 'modal.dep_placeholder': '可选',
      'modal.release_time': '发布时间',
      'modal.recurrence': '重复', 'modal.none': '无',
      'modal.daily': '每日', 'modal.weekly': '每周', 'modal.monthly': '每月',
      'modal.subtasks': '子任务 / 清单',
      'modal.subtask_placeholder': '添加子任务…',
      'modal.cancel': '取消', 'modal.close': '关闭', 'modal.save': '保存',
      // Detail panel
      'detail.title': '任务详情',
      'detail.description': '描述', 'detail.status': '状态', 'detail.priority': '优先级',
      'detail.type': '类型', 'detail.tags': '标签', 'detail.dependency': '依赖',
      'detail.release': '发布时间', 'detail.marker': '标记',
      'detail.created': '创建时间', 'detail.updated': '更新时间',
      'detail.recurrence': '重复', 'detail.subtasks': '子任务',
      'detail.none': '(无)', 'detail.not_set': '(未设置)',
      // History panel
      'history.title': '历史', 'history.recent': '近期活动',
      'history.loading': '加载中…', 'history.empty': '暂无历史记录。',
      'history.no_activity': '暂无活动。', 'history.load_error': '加载历史失败。',
      'history.created': '创建', 'history.updated': '更新',
      'history.deleted': '删除', 'history.migrated': '从 JSON 迁移',
      'history.field.status': '状态', 'history.field.title': '标题',
      'history.field.desc': '描述', 'history.field.priority': '优先级',
      'history.field.type': '类型', 'history.field.tags': '标签',
      'history.field.risk': '风险', 'history.field.marker': '标记',
      'history.field.dependency': '依赖', 'history.field.release': '发布时间',
      'history.field.subtasks': '子任务',
      // Keyboard shortcuts
      'shortcut.title': '键盘快捷键',
      'shortcut.new': '新建任务 / 灵感', 'shortcut.search': '聚焦搜索',
      'shortcut.close': '关闭弹窗 / 面板', 'shortcut.help': '显示帮助',
      'shortcut.undo': '撤销操作',
      'shortcut.board': '切换到看板', 'shortcut.ideas': '切换到灵感',
      'shortcut.analytics': '切换到分析',
      // Card actions
      'card.edit': '编辑', 'card.del': '删除', 'card.to_todo': '转待办', 'card.to_idea': '转灵感',
      'card.idea': '灵感', 'card.release': '发布:', 'card.dep': '依赖:',
      // Empty states
      'empty.todo': '暂无待办任务', 'empty.todo_hint': '按 N 或点击新建任务来添加',
      'empty.dev': '暂无开发任务', 'empty.dev_hint': '拖拽任务到此处开始工作',
      'empty.done': '暂无已完成', 'empty.done_hint': '完成的任务会出现在这里',
      'empty.publish': '暂无已发布', 'empty.publish_hint': '发布吧！',
      'empty.list': '暂无任务', 'empty.list_hint': '创建你的第一个任务开始使用',
      'empty.ideas_search': '没有匹配的灵感', 'empty.ideas_search_hint': '试试其他搜索词',
      'empty.ideas': '暂无灵感', 'empty.ideas_hint': '点击新建灵感按钮捕捉你的第一个想法',
      'empty.timeline': '没有设置发布日期的任务', 'empty.timeline_hint': '给任务设置发布日期即可在时间线上查看',
      // Toast messages
      'toast.deleted': '任务已删除', 'toast.status_changed': '状态已变更', 'toast.undo': '撤销',
      'toast.status_undone': '状态变更已撤销', 'toast.restored': '任务已恢复',
      'toast.delete_failed': '删除失败 — 任务已恢复',
      'toast.clone': '重复任务已克隆: "{title}"',
      'toast.exported_json': '已导出为 JSON', 'toast.exported_csv': '已导出为 CSV',
      'toast.imported': '已导入 {imported}/{total} 个任务',
      'toast.import_error': '导入错误: {msg}',
      'toast.save_error': '保存失败: {msg}', 'toast.update_error': '更新失败: {msg}',
      'toast.delete_error': '删除失败: {msg}', 'toast.clone_error': '克隆失败: {msg}',
      'toast.offline': '离线模式 — 使用本地数据',
      // Theme
      'theme.to_light': '切换到亮色模式', 'theme.to_dark': '切换到暗色模式',
      // Validation
      'validation.title_required': '请输入标题',
      'validation.title_max': '标题最多 {n} 个字符',
      'validation.desc_max': '描述最多 {n} 个字符',
      'validation.invalid_priority': '无效的优先级',
      'validation.invalid_type': '无效的类型',
      'validation.invalid_status': '无效的状态',
      'validation.max_tags': '最多 {n} 个标签',
      'validation.dep_max': '依赖最多 {n} 个字符',
      // Confirm
      'confirm.delete': '确认删除此任务？',
      // Voice
      'voice.not_supported': '不支持语音输入', 'voice.not_supported_alert': '此浏览器不支持语音输入。',
      // Marker
      'marker.in_progress': '进行中', 'marker.blocked': '已阻塞', 'marker.mark': '标记',
    },
    en: {
      // Nav & Tabs
      'nav.board': 'Board', 'nav.ideas': 'Ideas', 'nav.analytics': 'Analytics',
      'nav.toggle_theme': 'Toggle theme',
      'nav.new_task': 'New Task', 'nav.new_idea': 'New Idea',
      // Settings menu
      'settings.export_json': 'Export JSON', 'settings.export_csv': 'Export CSV',
      'settings.import_json': 'Import JSON', 'settings.shortcuts': 'Shortcuts (?)',
      // Board metrics
      'metric.in_progress': 'In Progress', 'metric.done': 'Done',
      'metric.ideas_pool': 'Ideas Pool', 'metric.published': 'Published',
      // Board summary
      'summary.today': 'Today:', 'summary.risk': 'Risk/Blocked:', 'summary.active': 'Active:',
      // View toggle
      'view.kanban': 'Kanban', 'view.list': 'List', 'view.timeline': 'Timeline',
      // Kanban columns
      'col.todo': 'Todo', 'col.dev': 'In Progress', 'col.done': 'Dev Done', 'col.publish': 'Published',
      // List headers
      'list.type': 'Type', 'list.title': 'Title', 'list.desc': 'Description',
      'list.tags': 'Tags', 'list.priority': 'Priority', 'list.release': 'Release',
      'list.status': 'Status', 'list.actions': 'Actions',
      // Ideas tab
      'metric.ideas_total': 'Ideas Total', 'metric.in_dev': 'In Dev',
      'ideas.search_placeholder': 'Search ideas by title or tag... (press / to focus)',
      // Analytics tab
      'metric.total_tasks': 'Total Tasks', 'metric.avg_cycle': 'Avg Cycle (days)',
      'metric.this_week': 'This Week',
      'chart.status_dist': 'Status Distribution', 'chart.priority_breakdown': 'Priority Breakdown',
      'chart.weekly_velocity': 'Weekly Velocity', 'chart.burndown': 'Burndown',
      'chart.tasks': 'Tasks', 'chart.completed': 'Completed',
      'chart.created_cum': 'Created (cumulative)', 'chart.completed_cum': 'Completed (cumulative)',
      // Modal
      'modal.new_task': 'New Task', 'modal.edit_task': 'Edit Task', 'modal.new_idea': 'New Idea',
      'modal.title': 'Title *', 'modal.title_placeholder': 'Task title',
      'modal.desc': 'Description', 'modal.desc_placeholder': 'Describe the task...',
      'modal.voice': 'Voice input',
      'modal.tags': 'Tags', 'modal.tags_hint': '(comma separated)',
      'modal.tags_placeholder': 'e.g. ui, bug, auth',
      'modal.priority': 'Priority',
      'modal.p1': 'P1 - High', 'modal.p2': 'P2 - Medium', 'modal.p3': 'P3 - Low',
      'modal.type': 'Type',
      'modal.feature': 'Feature', 'modal.bug': 'Bug', 'modal.idea': 'Idea',
      'modal.status': 'Status',
      'modal.backlog': 'Backlog', 'modal.todo': 'Todo', 'modal.dev': 'Dev',
      'modal.done': 'Done', 'modal.publish': 'Publish',
      'modal.dependency': 'Dependency', 'modal.dep_placeholder': 'Optional',
      'modal.release_time': 'Release Time',
      'modal.recurrence': 'Recurrence', 'modal.none': 'None',
      'modal.daily': 'Daily', 'modal.weekly': 'Weekly', 'modal.monthly': 'Monthly',
      'modal.subtasks': 'Subtasks / Checklist',
      'modal.subtask_placeholder': 'Add subtask...',
      'modal.cancel': 'Cancel', 'modal.close': 'Close', 'modal.save': 'Save',
      // Detail panel
      'detail.title': 'Task Details',
      'detail.description': 'Description', 'detail.status': 'Status', 'detail.priority': 'Priority',
      'detail.type': 'Type', 'detail.tags': 'Tags', 'detail.dependency': 'Dependency',
      'detail.release': 'Release', 'detail.marker': 'Marker',
      'detail.created': 'Created', 'detail.updated': 'Updated',
      'detail.recurrence': 'Recurrence', 'detail.subtasks': 'Subtasks',
      'detail.none': '(none)', 'detail.not_set': '(not set)',
      // History panel
      'history.title': 'History', 'history.recent': 'Recent Activity',
      'history.loading': 'Loading...', 'history.empty': 'No history yet.',
      'history.no_activity': 'No activity yet.', 'history.load_error': 'Failed to load history.',
      'history.created': 'Created', 'history.updated': 'Updated',
      'history.deleted': 'Deleted', 'history.migrated': 'Migrated from JSON',
      'history.field.status': 'Status', 'history.field.title': 'Title',
      'history.field.desc': 'Description', 'history.field.priority': 'Priority',
      'history.field.type': 'Type', 'history.field.tags': 'Tags',
      'history.field.risk': 'Risk', 'history.field.marker': 'Marker',
      'history.field.dependency': 'Dependency', 'history.field.release': 'Release',
      'history.field.subtasks': 'Subtasks',
      // Keyboard shortcuts
      'shortcut.title': 'Keyboard Shortcuts',
      'shortcut.new': 'New task / idea', 'shortcut.search': 'Focus search',
      'shortcut.close': 'Close modal / panel', 'shortcut.help': 'Show this help',
      'shortcut.undo': 'Undo last action',
      'shortcut.board': 'Switch to Board', 'shortcut.ideas': 'Switch to Ideas',
      'shortcut.analytics': 'Switch to Analytics',
      // Card actions
      'card.edit': 'Edit', 'card.del': 'Del', 'card.to_todo': 'To Todo', 'card.to_idea': 'To Idea',
      'card.idea': 'Idea', 'card.release': 'Release:', 'card.dep': 'Dep:',
      // Empty states
      'empty.todo': 'No tasks in Todo', 'empty.todo_hint': 'Press N or click New Task to add one',
      'empty.dev': 'No tasks in Dev', 'empty.dev_hint': 'Drag tasks here to start working',
      'empty.done': 'Nothing done yet', 'empty.done_hint': 'Complete tasks will appear here',
      'empty.publish': 'Nothing published', 'empty.publish_hint': 'Ship it!',
      'empty.list': 'No tasks yet', 'empty.list_hint': 'Create your first task to get started',
      'empty.ideas_search': 'No ideas match your search', 'empty.ideas_search_hint': 'Try a different search term',
      'empty.ideas': 'No ideas yet', 'empty.ideas_hint': 'Capture your first idea with the New Idea button',
      'empty.timeline': 'No tasks with release dates', 'empty.timeline_hint': 'Set release dates on tasks to see them on the timeline',
      // Toast messages
      'toast.deleted': 'Task deleted', 'toast.status_changed': 'Status changed', 'toast.undo': 'Undo',
      'toast.status_undone': 'Status change undone', 'toast.restored': 'Task restored',
      'toast.delete_failed': 'Delete failed — task restored',
      'toast.clone': 'Recurring task cloned: "{title}"',
      'toast.exported_json': 'Exported as JSON', 'toast.exported_csv': 'Exported as CSV',
      'toast.imported': 'Imported {imported}/{total} tasks',
      'toast.import_error': 'Import error: {msg}',
      'toast.save_error': 'Failed to save: {msg}', 'toast.update_error': 'Failed to update: {msg}',
      'toast.delete_error': 'Failed to delete: {msg}', 'toast.clone_error': 'Failed to clone: {msg}',
      'toast.offline': 'Offline mode — using local data',
      // Theme
      'theme.to_light': 'Switch to light mode', 'theme.to_dark': 'Switch to dark mode',
      // Validation
      'validation.title_required': 'Title is required',
      'validation.title_max': 'Title max {n} chars',
      'validation.desc_max': 'Description max {n} chars',
      'validation.invalid_priority': 'Invalid priority',
      'validation.invalid_type': 'Invalid type',
      'validation.invalid_status': 'Invalid status',
      'validation.max_tags': 'Max {n} tags',
      'validation.dep_max': 'Dependency max {n} chars',
      // Confirm
      'confirm.delete': 'Delete this task?',
      // Voice
      'voice.not_supported': 'Voice not supported', 'voice.not_supported_alert': 'Voice input not supported in this browser.',
      // Marker
      'marker.in_progress': 'In Progress', 'marker.blocked': 'Blocked', 'marker.mark': 'Mark',
    }
  };

  /* ---------- i18n Functions ---------- */
  function t(key, params) {
    let str = (i18n[currentLang] && i18n[currentLang][key]) || i18n.en[key] || key;
    if (params) Object.keys(params).forEach(k => { str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]); });
    return str;
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  }

  function initLang() {
    currentLang = localStorage.getItem('solohelm-lang') || 'zh';
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    applyI18n();
    updateLangButton();
  }

  function toggleLang() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('solohelm-lang', currentLang);
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    applyI18n();
    updateLangButton();
    updateNewBtnLabel();
    updateThemeIcon();
    render();
    if (activeTab === 'analytics') { analyticsLoaded = false; loadAnalytics(); }
  }

  function updateLangButton() {
    const btn = document.getElementById('lang-toggle');
    if (!btn) return;
    btn.innerHTML = `<i class="fa-solid fa-globe"></i> ${currentLang === 'zh' ? '中' : 'EN'}`;
  }

  function updateNewBtnLabel() {
    const label = document.getElementById('btn-new-label');
    if (!label) return;
    if (activeTab === 'board') label.textContent = t('nav.new_task');
    else if (activeTab === 'ideas') label.textContent = t('nav.new_idea');
  }

  /* ---------- Validation Constants ---------- */
  const VALID_PRIORITIES = ['P1', 'P2', 'P3'];
  const VALID_TYPES = ['feature', 'bug', 'idea'];
  const VALID_STATUSES = ['backlog', 'todo', 'dev', 'done', 'publish'];
  const LIMITS = { title: 200, desc: 2000, tags: 20, tagItem: 50, dependency: 200 };

  /* ---------- Undo Buffer ---------- */
  let undoBuffer = null; // { type, data, timer }

  function pushUndo(type, data, undoFn) {
    if (undoBuffer) clearTimeout(undoBuffer.timer);
    const timer = setTimeout(() => { undoBuffer = null; }, 5500);
    undoBuffer = { type, data, undoFn, timer };
    showUndoToast(type);
  }

  function performUndo() {
    if (!undoBuffer) return;
    clearTimeout(undoBuffer.timer);
    const fn = undoBuffer.undoFn;
    undoBuffer = null;
    fn();
  }

  function showUndoToast(type) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    // Remove previous undo toasts
    container.querySelectorAll('.toast-undo').forEach(el => dismissToast(el));
    const label = type === 'delete' ? t('toast.deleted') : t('toast.status_changed');
    const el = document.createElement('div');
    el.className = 'toast toast-undo';
    el.setAttribute('role', 'status');
    el.innerHTML = `<span class="toast-icon"><i class="fa-solid fa-rotate-left"></i></span><span class="toast-msg">${esc(label)}</span><button class="toast-undo-btn" type="button">${t('toast.undo')}</button><button class="toast-close" type="button" aria-label="Dismiss">&times;</button>`;
    el.querySelector('.toast-undo-btn').onclick = () => { performUndo(); dismissToast(el); };
    el.querySelector('.toast-close').onclick = () => dismissToast(el);
    container.appendChild(el);
    const timer = setTimeout(() => dismissToast(el), 5000);
    el._timer = timer;
  }

  /* ---------- Toast / Snackbar ---------- */
  function toast(msg, type = 'error', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { error: '<i class="fa-solid fa-triangle-exclamation"></i>', warn: '<i class="fa-solid fa-triangle-exclamation"></i>', success: '<i class="fa-solid fa-circle-check"></i>', info: '<i class="fa-solid fa-circle-info"></i>' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = `<span class="toast-icon">${icons[type] || ''}</span><span class="toast-msg">${esc(msg)}</span><button class="toast-close" type="button" aria-label="Dismiss">&times;</button>`;
    el.querySelector('.toast-close').onclick = () => dismissToast(el);
    container.appendChild(el);
    const timer = setTimeout(() => dismissToast(el), duration);
    el._timer = timer;
  }

  function dismissToast(el) {
    if (!el || el._dismissed) return;
    el._dismissed = true;
    clearTimeout(el._timer);
    el.classList.add('toast-out');
    el.addEventListener('animationend', () => el.remove());
  }

  /* ---------- Theme Toggle ---------- */
  function initTheme() {
    const saved = localStorage.getItem('solohelm-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    // Default is light (no data-theme attribute = light)
    updateThemeIcon();
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', next);
    }
    localStorage.setItem('solohelm-theme', next);
    updateThemeIcon();
    // Re-render analytics charts if visible (colors change)
    if (activeTab === 'analytics') { analyticsLoaded = false; loadAnalytics(); }
  }

  function updateThemeIcon() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    btn.title = isDark ? t('theme.to_light') : t('theme.to_dark');
  }

  /* ---------- Tab Switching ---------- */
  const validTabs = ['ideas', 'board', 'analytics'];

  function switchTab(tab) {
    if (activeTab === tab) return;
    activeTab = tab;

    // Update URL hash
    if (location.hash !== `#${tab}`) history.replaceState(null, '', `#${tab}`);

    // Update tab buttons
    document.querySelectorAll('.main-tab').forEach(tb => {
      tb.classList.toggle('active', tb.dataset.tab === tab);
    });

    // Update tab content panels
    document.querySelectorAll('.tab-content').forEach(p => {
      p.classList.toggle('active', p.id === `tab-${tab}`);
    });

    // Update New button label & visibility
    const newBtn = document.getElementById('btn-new');
    const newLabel = document.getElementById('btn-new-label');
    if (tab === 'board') {
      newLabel.textContent = t('nav.new_task');
      newBtn.style.display = '';
    } else if (tab === 'ideas') {
      newLabel.textContent = t('nav.new_idea');
      newBtn.style.display = '';
    } else {
      newBtn.style.display = 'none';
    }

    // Render the active tab
    render();

    // Load analytics on first switch
    if (tab === 'analytics' && !analyticsLoaded) {
      loadAnalytics();
    }
  }

  function getActivePage() {
    if (activeTab === 'board') return 'tasks';
    if (activeTab === 'ideas') return 'ideas';
    return 'analytics';
  }

  /* ---------- Data Layer ---------- */
  async function loadFromAPI() {
    const res = await fetch(API);
    if (!res.ok) throw new Error('API error');
    return res.json();
  }

  function loadFromLS() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; }
  }

  function saveToLS() {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  }

  async function apiCreate(task) {
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error (${res.status})`);
      }
      return res.json();
    } catch (e) {
      toast(t('toast.save_error', { msg: e.message }), 'error');
      return null;
    }
  }

  async function apiUpdate(id, data) {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error (${res.status})`);
      }
      return res.json();
    } catch (e) {
      toast(t('toast.update_error', { msg: e.message }), 'error');
      return null;
    }
  }

  async function apiDelete(id) {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error (${res.status})`);
      }
      return true;
    } catch (e) {
      toast(t('toast.delete_error', { msg: e.message }), 'error');
      return false;
    }
  }

  async function apiClone(id) {
    try {
      const res = await fetch(`${API}/${id}/clone`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Clone failed');
      return res.json();
    } catch (e) {
      toast(t('toast.clone_error', { msg: e.message }), 'error');
      return null;
    }
  }

  /* ---------- Seed Demo Data ---------- */
  function seedIfEmpty() {
    if (tasks.length > 0) return;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const seeds = [
      { id: uuid(), title: 'Design landing page', desc: 'Create mockup in Figma', tags: ['design', 'ui'], priority: 'P1', type: 'feature', status: 'todo', dependency: '', releaseTime: '', risk: false, marker: '', subtasks: [{id: uuid(), text: 'Wireframe', done: true}, {id: uuid(), text: 'Color palette', done: false}], recurrence: null, createdAt: now, updatedAt: now, lastMoved: today },
      { id: uuid(), title: 'Fix login timeout', desc: 'Users report session expires too soon', tags: ['auth', 'bug'], priority: 'P1', type: 'bug', status: 'dev', dependency: '', releaseTime: '', risk: true, marker: 'blocked', subtasks: [], recurrence: null, createdAt: now, updatedAt: now, lastMoved: today },
      { id: uuid(), title: 'Add dark mode', desc: 'Support system preference detection', tags: ['ui', 'theme'], priority: 'P2', type: 'feature', status: 'done', dependency: '', releaseTime: '2024-06-01', risk: false, marker: '', subtasks: [], recurrence: null, createdAt: now, updatedAt: now, lastMoved: today },
      { id: uuid(), title: 'Deploy v2.0', desc: 'Push to production', tags: ['ops'], priority: 'P1', type: 'feature', status: 'publish', dependency: '', releaseTime: '2024-06-15', risk: false, marker: '', subtasks: [], recurrence: null, createdAt: now, updatedAt: now, lastMoved: today },
      { id: uuid(), title: 'Explore WebSocket notifications', desc: 'Real-time updates for collaborative boards', tags: ['idea', 'real-time'], priority: 'P3', type: 'idea', status: 'backlog', dependency: '', releaseTime: '', risk: false, marker: '', subtasks: [], recurrence: null, createdAt: now, updatedAt: now, lastMoved: today },
      { id: uuid(), title: 'Mobile gesture support', desc: 'Swipe to change status on mobile', tags: ['mobile', 'ux'], priority: 'P2', type: 'idea', status: 'backlog', dependency: '', releaseTime: '', risk: false, marker: '', subtasks: [], recurrence: null, createdAt: now, updatedAt: now, lastMoved: today },
    ];
    tasks = seeds;
    saveToLS();
    seeds.forEach(t => apiCreate(t));
  }

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  /* ---------- Custom Confirm Dialog ---------- */
  function customConfirm(message) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'confirm-overlay';
      overlay.innerHTML = `<div class="confirm-dialog"><p>${esc(message)}</p><div class="confirm-actions"><button type="button" class="btn btn-outline confirm-cancel">${t('modal.cancel')}</button><button type="button" class="btn btn-danger confirm-ok">${t('card.del')}</button></div></div>`;
      const close = (result) => { overlay.remove(); resolve(result); };
      overlay.querySelector('.confirm-cancel').onclick = () => close(false);
      overlay.querySelector('.confirm-ok').onclick = () => close(true);
      overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
      document.body.appendChild(overlay);
      overlay.querySelector('.confirm-ok').focus();
    });
  }

  /* ---------- Frontend Validation ---------- */
  function validateTaskData(data) {
    const errors = [];
    if (!data.title || !data.title.trim()) errors.push({ field: 'title', msg: t('validation.title_required') });
    else if (data.title.length > LIMITS.title) errors.push({ field: 'title', msg: t('validation.title_max', { n: LIMITS.title }) });
    if (data.desc && data.desc.length > LIMITS.desc) errors.push({ field: 'desc', msg: t('validation.desc_max', { n: LIMITS.desc }) });
    if (!VALID_PRIORITIES.includes(data.priority)) errors.push({ field: 'priority', msg: t('validation.invalid_priority') });
    if (!VALID_TYPES.includes(data.type)) errors.push({ field: 'type', msg: t('validation.invalid_type') });
    if (!VALID_STATUSES.includes(data.status)) errors.push({ field: 'status', msg: t('validation.invalid_status') });
    if (data.tags && data.tags.length > LIMITS.tags) errors.push({ field: 'tags', msg: t('validation.max_tags', { n: LIMITS.tags }) });
    if (data.dependency && data.dependency.length > LIMITS.dependency) errors.push({ field: 'dependency', msg: t('validation.dep_max', { n: LIMITS.dependency }) });
    return errors;
  }

  function showFieldErrors(errors) {
    clearFieldErrors();
    const fieldMap = { title: 'f-title', desc: 'f-desc', tags: 'f-tags', priority: 'f-priority', type: 'f-type', status: 'f-status', dependency: 'f-dep' };
    let firstInput = null;
    for (const err of errors) {
      const input = document.getElementById(fieldMap[err.field]);
      if (!input) continue;
      input.classList.add('field-error');
      const msgEl = document.createElement('div');
      msgEl.className = 'field-error-msg';
      msgEl.textContent = err.msg;
      input.parentElement.appendChild(msgEl);
      if (!firstInput) firstInput = input;
    }
    if (firstInput) firstInput.focus();
  }

  function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
    document.querySelectorAll('.field-error-msg').forEach(el => el.remove());
  }

  /* ---------- Modal ---------- */
  const overlay = () => document.getElementById('modal-overlay');
  const form = () => document.getElementById('task-form');
  let modalSubtasks = [];

  let formDirty = false;

  function showModal(task) {
    editingId = task ? task.id : null;
    formDirty = false;
    const f = form();
    const page = getActivePage();
    f.title.value = task ? task.title : '';
    f.desc.value = task ? task.desc : '';
    f.tags.value = task ? (task.tags || []).join(', ') : '';
    f.priority.value = task ? task.priority : 'P3';
    f.type.value = task ? task.type : (page === 'ideas' ? 'idea' : 'feature');
    f.status.value = task ? task.status : (page === 'ideas' ? 'backlog' : 'todo');
    f.dependency.value = task ? (task.dependency || '') : '';
    f.releaseTime.value = task ? (task.releaseTime || '') : '';
    document.getElementById('modal-heading').textContent = editingId
      ? t('modal.edit_task')
      : (page === 'ideas' ? t('modal.new_idea') : t('modal.new_task'));

    // Subtasks
    modalSubtasks = task && task.subtasks ? task.subtasks.map(s => ({...s})) : [];
    renderModalSubtasks();

    // Recurrence
    const rec = task && task.recurrence ? task.recurrence : null;
    const recSel = document.getElementById('f-recurrence');
    if (recSel) recSel.value = rec ? rec.freq : 'none';

    clearFieldErrors();
    overlay().classList.add('open');
  }

  function hideModal() {
    if (formDirty) {
      const msg = currentLang === 'zh' ? '有未保存的更改，确定关闭？' : 'Unsaved changes. Close anyway?';
      customConfirm(msg).then(ok => { if (ok) doHideModal(); });
      return;
    }
    doHideModal();
  }

  function doHideModal() {
    overlay().classList.remove('open');
    editingId = null;
    modalSubtasks = [];
    formDirty = false;
    clearFieldErrors();
    form().reset();
  }

  function renderModalSubtasks() {
    const list = document.getElementById('subtask-list');
    if (!list) return;
    list.innerHTML = modalSubtasks.map((s, i) => `
      <div class="subtask-item">
        <input type="checkbox" ${s.done ? 'checked' : ''} data-sub-idx="${i}">
        <span class="subtask-text ${s.done ? 'done' : ''}">${esc(s.text)}</span>
        <button type="button" class="subtask-del" data-sub-del="${i}">&times;</button>
      </div>
    `).join('');
    list.querySelectorAll('[data-sub-idx]').forEach(cb => {
      cb.onchange = () => { modalSubtasks[+cb.dataset.subIdx].done = cb.checked; renderModalSubtasks(); };
    });
    list.querySelectorAll('[data-sub-del]').forEach(btn => {
      btn.onclick = () => { modalSubtasks.splice(+btn.dataset.subDel, 1); renderModalSubtasks(); };
    });
  }

  function addSubtaskFromInput() {
    const inp = document.getElementById('subtask-input');
    if (!inp) return;
    const text = inp.value.trim();
    if (!text) return;
    modalSubtasks.push({ id: uuid(), text, done: false });
    inp.value = '';
    renderModalSubtasks();
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const f = form();
    const data = {
      title: f.title.value.trim(),
      desc: f.desc.value.trim(),
      tags: f.tags.value.split(',').map(t => t.trim()).filter(Boolean),
      priority: f.priority.value,
      type: f.type.value,
      status: f.status.value,
      dependency: f.dependency.value.trim(),
      releaseTime: f.releaseTime.value.trim(),
      subtasks: modalSubtasks,
    };

    // Recurrence
    const recSel = document.getElementById('f-recurrence');
    if (recSel && recSel.value !== 'none') {
      data.recurrence = { freq: recSel.value };
    } else {
      data.recurrence = null;
    }

    const errors = validateTaskData(data);
    if (errors.length > 0) {
      showFieldErrors(errors);
      toast(errors[0].msg, 'warn');
      return;
    }
    clearFieldErrors();

    const saveBtn = form().querySelector('button[type="submit"]');
    const origText = saveBtn ? saveBtn.textContent : '';
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = currentLang === 'zh' ? '保存中…' : 'Saving…'; }

    try {
      if (editingId) {
        await updateTask(editingId, data);
      } else {
        await addTask(data);
      }
      formDirty = false;
      doHideModal();
      render();
    } catch (err) {
      toast(err.message || 'Save failed', 'error');
    } finally {
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = origText; }
    }
  }

  async function addTask(data) {
    const now = new Date().toISOString();
    const task = { ...data, id: uuid(), risk: false, marker: '', createdAt: now, updatedAt: now, lastMoved: todayStr() };
    const remote = await apiCreate(task);
    tasks.push(remote || task);
    saveToLS();
  }

  async function updateTask(id, data) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    const old = tasks[idx];
    const statusChanged = data.status && data.status !== old.status;
    const updated = { ...old, ...data, updatedAt: new Date().toISOString(), lastMoved: statusChanged ? todayStr() : old.lastMoved };
    tasks[idx] = updated;
    saveToLS();
    await apiUpdate(id, data);
  }

  async function updateTaskStatus(id, newStatus) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    const old = tasks[idx];
    const oldStatus = old.status;
    if (oldStatus === newStatus) return;

    // Save for undo
    const snapshot = { ...old };
    await updateTask(id, { status: newStatus });

    // Check recurrence: if task moves to done/publish and has recurrence, clone it
    if ((newStatus === 'done' || newStatus === 'publish') && old.recurrence) {
      const cloned = await apiClone(id);
      if (cloned) {
        tasks.push(cloned);
        saveToLS();
        toast(t('toast.clone', { title: cloned.title }), 'info', 3000);
      }
    }

    render();

    pushUndo('status', { id, oldStatus }, async () => {
      await updateTask(id, { status: oldStatus });
      render();
      toast(t('toast.status_undone'), 'success', 2000);
    });
  }

  /* ---------- Optimistic Delete with Rollback + Undo ---------- */
  async function deleteTask(id) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    const snapshot = { ...tasks[idx] };
    const snapshotIdx = idx;

    tasks.splice(idx, 1);
    saveToLS();
    render();

    const ok = await apiDelete(id);
    if (!ok) {
      tasks.splice(snapshotIdx, 0, snapshot);
      saveToLS();
      render();
      toast(t('toast.delete_failed'), 'error');
      return;
    }

    pushUndo('delete', snapshot, async () => {
      const restored = await apiCreate(snapshot);
      tasks.push(restored || snapshot);
      saveToLS();
      render();
      toast(t('toast.restored'), 'success', 2000);
    });
  }

  /* ---------- Marker ---------- */
  const MARKERS = ['', 'inprogress', 'blocked'];
  function cycleMarker(id) {
    const tk = tasks.find(tk => tk.id === id);
    if (!tk) return;
    const idx = MARKERS.indexOf(tk.marker || '');
    tk.marker = MARKERS[(idx + 1) % MARKERS.length];
    tk.risk = tk.marker === 'blocked';
    saveToLS();
    apiUpdate(id, { risk: tk.risk, marker: tk.marker });
    render();
  }

  function markerIcon(task) {
    const m = task.marker || '';
    if (m === 'inprogress') return `<span title="${t('marker.in_progress')}" style="color:var(--dev)">&#9654;</span>`;
    if (m === 'blocked') return `<span title="${t('marker.blocked')}" style="color:var(--danger)">&#9888;</span>`;
    return `<span title="${t('marker.mark')}" style="opacity:.35">&#9679;</span>`;
  }

  /* ---------- Card HTML ---------- */
  function createCardHTML(task, opts = {}) {
    const tagsHTML = (task.tags || []).map(tg => `<span class="card-tag">${esc(tg)}</span>`).join('');
    const markerHTML = opts.showMarker !== false
      ? `<span class="card-marker" data-marker="${task.id}">${markerIcon(task)}</span>` : '';
    const actionsHTML = [];
    if (opts.showEdit !== false) actionsHTML.push(`<button type="button" class="btn btn-sm btn-outline" data-edit="${task.id}">${t('card.edit')}</button>`);
    if (opts.showDelete !== false) actionsHTML.push(`<button type="button" class="btn btn-sm btn-danger" data-delete="${task.id}">${t('card.del')}</button>`);
    if (opts.showToTodo) actionsHTML.push(`<button type="button" class="btn btn-sm btn-primary" data-totodo="${task.id}">${t('card.to_todo')}</button>`);
    if (opts.showToIdea) actionsHTML.push(`<button type="button" class="btn btn-sm btn-outline" data-toidea="${task.id}">${t('card.to_idea')}</button>`);
    actionsHTML.push(`<button type="button" class="btn btn-sm btn-ghost" data-history="${task.id}" title="History"><i class="fa-solid fa-clock-rotate-left"></i></button>`);

    const metaParts = [];
    if (task.releaseTime) metaParts.push(`${t('card.release')} ${esc(task.releaseTime)}`);
    if (task.dependency) metaParts.push(`${t('card.dep')} ${esc(task.dependency)}`);
    if (task.recurrence) metaParts.push(`<i class="fa-solid fa-repeat" style="font-size:.6rem"></i> ${esc(task.recurrence.freq)}`);
    const metaHTML = metaParts.length ? `<div class="card-meta">${metaParts.join(' | ')}</div>` : '';

    // Subtask progress bar
    const subs = task.subtasks || [];
    let subtaskHTML = '';
    if (subs.length > 0) {
      const doneCount = subs.filter(s => s.done).length;
      const pct = Math.round((doneCount / subs.length) * 100);
      subtaskHTML = `<div class="card-subtask-bar"><div class="card-subtask-track"><div class="card-subtask-fill" style="width:${pct}%"></div></div><span class="card-subtask-label">${doneCount}/${subs.length}</span></div>`;
    }

    return `
      <div class="card" draggable="${opts.draggable !== false ? 'true' : 'false'}" data-id="${task.id}">
        ${markerHTML}
        <div class="card-top">
          <span class="card-title" data-detail="${task.id}">${esc(task.title)}</span>
          <span class="card-badge badge-${task.priority}">${task.priority}</span>
          <span class="card-badge badge-${task.type}">${task.type}</span>
        </div>
        ${task.desc ? `<div class="card-desc">${esc(task.desc)}</div>` : ''}
        ${tagsHTML ? `<div class="card-tags">${tagsHTML}</div>` : ''}
        ${metaHTML}
        ${subtaskHTML}
        <div class="card-actions">${actionsHTML.join('')}</div>
      </div>`;
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ---------- Empty State HTML ---------- */
  function emptyStateHTML(icon, text, hint) {
    return `<div class="empty-state"><div class="empty-icon">${icon}</div><div class="empty-text">${text}</div>${hint ? `<div class="empty-hint">${hint}</div>` : ''}</div>`;
  }

  /* ---------- Render: Tasks Page ---------- */
  function renderTasksPage() {
    const nonBacklog = tasks.filter(t => t.status !== 'backlog');
    const todoList = tasks.filter(t => t.status === 'todo');
    const devList = tasks.filter(t => t.status === 'dev');
    const doneList = tasks.filter(t => t.status === 'done');
    const publishList = tasks.filter(t => t.status === 'publish');
    const backlogList = tasks.filter(t => t.status === 'backlog');
    const today = todayStr();

    setText('metric-inprogress', todoList.length + devList.length);
    setText('metric-done', doneList.length);
    setText('metric-backlog', backlogList.length);
    setText('metric-publish', publishList.length);

    const todayDone = tasks.filter(t => (t.status === 'done' || t.status === 'publish') && t.lastMoved === today).length;
    const riskCount = tasks.filter(t => t.risk).length;
    const activeCount = todoList.length + devList.length;
    setText('summary-today', todayDone);
    setText('summary-risk', riskCount);
    setText('summary-active', activeCount);

    const kanbanEl = document.getElementById('kanban-view');
    const listEl = document.getElementById('list-view');
    const timelineEl = document.getElementById('timeline-view');

    if (currentView === 'kanban') {
      kanbanEl && kanbanEl.classList.remove('hidden');
      listEl && listEl.classList.add('hidden');
      timelineEl && timelineEl.classList.add('hidden');
      renderKanban('col-todo', todoList, t('empty.todo'), t('empty.todo_hint'));
      renderKanban('col-dev', devList, t('empty.dev'), t('empty.dev_hint'));
      renderKanban('col-done', doneList, t('empty.done'), t('empty.done_hint'));
      renderKanban('col-publish', publishList, t('empty.publish'), t('empty.publish_hint'));
      setText('count-todo', todoList.length);
      setText('count-dev', devList.length);
      setText('count-done', doneList.length);
      setText('count-publish', publishList.length);
    } else if (currentView === 'list') {
      kanbanEl && kanbanEl.classList.add('hidden');
      listEl && listEl.classList.remove('hidden');
      timelineEl && timelineEl.classList.add('hidden');
      renderListView(nonBacklog);
    } else if (currentView === 'timeline') {
      kanbanEl && kanbanEl.classList.add('hidden');
      listEl && listEl.classList.add('hidden');
      timelineEl && timelineEl.classList.remove('hidden');
      renderTimeline();
    }

    wireActions();
    if (currentView === 'kanban') wireDragDrop();
  }

  function renderKanban(containerId, list, emptyText, emptyHint) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (list.length === 0) {
      el.innerHTML = emptyStateHTML('<i class="fa-solid fa-inbox"></i>', emptyText || t('empty.list'), emptyHint);
    } else {
      el.innerHTML = list.map(tk => createCardHTML(tk, { showToIdea: true, showMarker: true })).join('');
    }
  }

  function renderListView(list) {
    const tbody = document.getElementById('list-tbody');
    if (!tbody) return;
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8">${emptyStateHTML('<i class="fa-solid fa-list-check"></i>', t('empty.list'), t('empty.list_hint'))}</td></tr>`;
      return;
    }
    tbody.innerHTML = list.map(tk => {
      const tagsHTML = (tk.tags || []).map(tg => `<span class="card-tag">${esc(tg)}</span>`).join(' ');
      return `<tr>
        <td><span class="status-dot ${tk.status}"></span><span class="card-badge badge-${tk.type}" style="margin-right:.3rem">${tk.type}</span></td>
        <td class="td-title" data-detail="${tk.id}">${esc(tk.title)}</td>
        <td class="td-desc">${esc(tk.desc)}</td>
        <td>${tagsHTML}</td>
        <td><span class="card-badge badge-${tk.priority}">${tk.priority}</span></td>
        <td>${tk.releaseTime || '-'}</td>
        <td>${tk.status}</td>
        <td class="td-actions">
          <button type="button" class="btn btn-sm btn-outline" data-edit="${tk.id}">${t('card.edit')}</button>
          <button type="button" class="btn btn-sm btn-danger" data-delete="${tk.id}">${t('card.del')}</button>
          <button type="button" class="btn btn-sm btn-outline" data-toidea="${tk.id}">${t('card.idea')}</button>
          <button type="button" class="btn btn-sm btn-ghost" data-history="${tk.id}" title="History"><i class="fa-solid fa-clock-rotate-left"></i></button>
          <span style="cursor:pointer" data-marker="${tk.id}">${markerIcon(tk)}</span>
        </td>
      </tr>`;
    }).join('');
    wireActions();
  }

  /* ---------- Render: Ideas Page ---------- */
  function renderIdeasPage() {
    const backlog = tasks.filter(t => t.status === 'backlog');
    const devCount = tasks.filter(t => t.status === 'dev').length;

    setText('metric-idea-total', backlog.length);
    setText('metric-idea-dev', devCount);

    const query = (document.getElementById('search-input') || {}).value || '';
    const filtered = backlog.filter(t => {
      if (!query) return true;
      const q = query.toLowerCase();
      return t.title.toLowerCase().includes(q) || (t.tags || []).some(tg => tg.toLowerCase().includes(q));
    });

    const grid = document.getElementById('backlog-grid');
    if (!grid) return;
    if (filtered.length === 0) {
      grid.innerHTML = emptyStateHTML(
        '<i class="fa-solid fa-lightbulb"></i>',
        query ? t('empty.ideas_search') : t('empty.ideas'),
        query ? t('empty.ideas_search_hint') : t('empty.ideas_hint')
      );
    } else {
      grid.innerHTML = filtered.map(tk => createCardHTML(tk, { draggable: false, showToTodo: true, showMarker: false })).join('');
    }
    wireActions();
  }

  /* ---------- Timeline View ---------- */
  function renderTimeline() {
    const container = document.getElementById('timeline-content');
    if (!container) return;

    const withDate = tasks.filter(tk => tk.releaseTime && tk.status !== 'backlog');
    if (withDate.length === 0) {
      container.innerHTML = emptyStateHTML('<i class="fa-solid fa-calendar-days"></i>', t('empty.timeline'), t('empty.timeline_hint'));
      return;
    }

    // Calculate date range
    const dates = withDate.map(t => new Date(t.releaseTime));
    const today = new Date(todayStr());
    const minDate = new Date(Math.min(today, ...dates));
    const maxDate = new Date(Math.max(today, ...dates));
    minDate.setDate(minDate.getDate() - 3);
    maxDate.setDate(maxDate.getDate() + 7);
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

    // Header
    let headerHTML = '<div class="timeline-header">';
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(minDate);
      d.setDate(d.getDate() + i);
      const ds = d.toISOString().slice(0, 10);
      const isToday = ds === todayStr();
      const label = d.getDate() === 1 || i === 0 ? `${d.getMonth() + 1}/${d.getDate()}` : d.getDate();
      headerHTML += `<div class="timeline-day${isToday ? ' today' : ''}">${label}</div>`;
    }
    headerHTML += '</div>';

    // Rows
    let rowsHTML = '<div class="timeline-rows">';
    for (const t of withDate) {
      const taskDate = new Date(t.releaseTime);
      const dayOffset = Math.ceil((taskDate - minDate) / (1000 * 60 * 60 * 24));
      const leftPct = ((dayOffset / totalDays) * 100).toFixed(2);
      const widthPct = Math.max(3, (3 / totalDays) * 100).toFixed(2);
      rowsHTML += `<div class="timeline-row"><div class="timeline-bar status-${t.status}" style="left:${leftPct}%;width:${widthPct}%" data-detail="${t.id}" title="${esc(t.title)} (${t.releaseTime})">${esc(t.title)}</div></div>`;
    }
    rowsHTML += '</div>';

    container.innerHTML = headerHTML + rowsHTML;
    // Wire detail clicks
    container.querySelectorAll('[data-detail]').forEach(el => {
      el.onclick = () => showDetail(el.dataset.detail);
    });
  }

  /* ---------- Analytics ---------- */
  async function loadAnalytics() {
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error();
      const data = await res.json();
      renderAnalyticsMetrics(data);
      renderAnalyticsCharts(data);
      analyticsLoaded = true;
    } catch {
      setText('an-total', 'Error');
    }
  }

  function renderAnalyticsMetrics(data) {
    setText('an-total', data.totalTasks);
    setText('an-cycle', data.avgCycleTime);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekKey = weekStart.toISOString().slice(0, 10);
    setText('an-velocity', data.weeklyVelocity[weekKey] || 0);
  }

  function renderAnalyticsCharts(data) {
    const tc = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#8896ab';

    // Destroy previous charts
    Object.values(chartInstances).forEach(c => c.destroy());
    chartInstances = {};

    // Status Distribution (Doughnut)
    chartInstances.status = new Chart(document.getElementById('chart-status'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(data.statusDist),
        datasets: [{
          data: Object.values(data.statusDist),
          backgroundColor: ['#b39ddb', '#f28cb2', '#4ecdc4', '#6bcb77', '#f0c54a'],
          borderWidth: 2,
          borderColor: '#fff',
        }]
      },
      options: {
        plugins: { legend: { position: 'bottom', labels: { color: tc, font: { size: 11 } } } },
        responsive: true,
      }
    });

    // Priority (Bar)
    chartInstances.priority = new Chart(document.getElementById('chart-priority'), {
      type: 'bar',
      data: {
        labels: Object.keys(data.priorityDist),
        datasets: [{
          label: t('chart.tasks'),
          data: Object.values(data.priorityDist),
          backgroundColor: ['#f06868', '#f0c54a', '#b0bec5'],
          borderRadius: 6,
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: tc, stepSize: 1 } },
          x: { ticks: { color: tc } },
        },
        responsive: true,
      }
    });

    // Weekly Velocity (Line)
    const velKeys = Object.keys(data.weeklyVelocity).sort();
    chartInstances.velocity = new Chart(document.getElementById('chart-velocity'), {
      type: 'line',
      data: {
        labels: velKeys.map(k => k.slice(5)),
        datasets: [{
          label: t('chart.completed'),
          data: velKeys.map(k => data.weeklyVelocity[k]),
          borderColor: '#4ecdc4',
          backgroundColor: 'rgba(78,205,196,.12)',
          fill: true,
          tension: .3,
          pointRadius: 4,
          pointStyle: 'triangle',
        }]
      },
      options: {
        plugins: { legend: { labels: { color: tc, usePointStyle: true } } },
        scales: {
          y: { beginAtZero: true, ticks: { color: tc, stepSize: 1 } },
          x: { ticks: { color: tc } },
        },
        responsive: true,
      }
    });

    // Burndown (Line)
    const burnKeys = Object.keys(data.burndown).sort();
    let cumCreated = 0, cumCompleted = 0;
    const createdData = [], completedData = [];
    for (const k of burnKeys) {
      cumCreated += data.burndown[k].created;
      cumCompleted += data.burndown[k].completed;
      createdData.push(cumCreated);
      completedData.push(cumCompleted);
    }
    chartInstances.burndown = new Chart(document.getElementById('chart-burndown'), {
      type: 'line',
      data: {
        labels: burnKeys.map(k => k.slice(5)),
        datasets: [
          { label: t('chart.created_cum'), data: createdData, borderColor: '#f28cb2', tension: .3, pointRadius: 3, pointStyle: 'circle' },
          { label: t('chart.completed_cum'), data: completedData, borderColor: '#6bcb77', tension: .3, pointRadius: 3, borderDash: [6, 3], pointStyle: 'rectRot' },
        ]
      },
      options: {
        plugins: { legend: { labels: { color: tc, usePointStyle: true } } },
        scales: {
          y: { beginAtZero: true, ticks: { color: tc } },
          x: { ticks: { color: tc } },
        },
        responsive: true,
      }
    });
  }

  /* ---------- Card Detail Side Panel ---------- */
  function showDetail(taskId) {
    const panel = document.getElementById('detail-panel');
    const body = document.getElementById('detail-body');
    const title = document.getElementById('detail-title');
    const backdrop = document.getElementById('panel-backdrop');
    if (!panel || !body) return;

    const tk = tasks.find(x => x.id === taskId);
    if (!tk) return;

    title.textContent = tk.title;

    let html = '';
    html += fieldHTML(t('detail.description'), tk.desc || t('detail.none'));
    html += fieldHTML(t('detail.status'), tk.status);
    html += fieldHTML(t('detail.priority'), tk.priority);
    html += fieldHTML(t('detail.type'), tk.type);
    html += fieldHTML(t('detail.tags'), (tk.tags || []).join(', ') || t('detail.none'));
    html += fieldHTML(t('detail.dependency'), tk.dependency || t('detail.none'));
    html += fieldHTML(t('detail.release'), tk.releaseTime || t('detail.not_set'));
    html += fieldHTML(t('detail.marker'), tk.marker || t('detail.none'));
    html += fieldHTML(t('detail.created'), new Date(tk.createdAt).toLocaleString(currentLang === 'zh' ? 'zh-CN' : 'en'));
    html += fieldHTML(t('detail.updated'), new Date(tk.updatedAt).toLocaleString(currentLang === 'zh' ? 'zh-CN' : 'en'));

    if (tk.recurrence) {
      html += fieldHTML(t('detail.recurrence'), tk.recurrence.freq);
    }

    // Subtasks
    const subs = tk.subtasks || [];
    if (subs.length > 0) {
      const doneCount = subs.filter(s => s.done).length;
      html += `<div class="detail-field"><div class="detail-label">${t('detail.subtasks')} (${doneCount}/${subs.length})</div><div class="detail-subtasks">`;
      html += subs.map(s => `<div class="subtask-item"><input type="checkbox" ${s.done ? 'checked' : ''} disabled><span class="subtask-text ${s.done ? 'done' : ''}">${esc(s.text)}</span></div>`).join('');
      html += '</div></div>';
    }

    body.innerHTML = html;
    panel.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  }

  function fieldHTML(label, value) {
    const noneValues = [t('detail.none'), t('detail.not_set'), '(none)', '(not set)', '(无)', '(未设置)'];
    const isEmpty = !value || noneValues.includes(value);
    return `<div class="detail-field"><div class="detail-label">${label}</div><div class="detail-value${isEmpty ? ' empty' : ''}">${esc(value)}</div></div>`;
  }

  function hideDetail() {
    const panel = document.getElementById('detail-panel');
    const backdrop = document.getElementById('panel-backdrop');
    if (panel) panel.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }

  /* ---------- Search with Debounce ---------- */
  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function bindSearch() {
    const inp = document.getElementById('search-input');
    if (!inp) return;
    inp.addEventListener('input', debounce(() => render(), 300));
  }

  /* ---------- History Panel ---------- */
  async function showHistory(taskId) {
    const panel = document.getElementById('history-panel');
    const content = document.getElementById('history-content');
    const htitle = document.getElementById('history-title');
    if (!panel || !content) return;

    const task = tasks.find(tk => tk.id === taskId);
    htitle.textContent = task ? `${t('history.title')}: ${task.title}` : t('history.title');
    content.innerHTML = `<div style="text-align:center;padding:1rem;color:var(--text-muted)">${t('history.loading')}</div>`;
    panel.classList.add('open');
    const backdrop = document.getElementById('panel-backdrop');
    if (backdrop) backdrop.classList.add('open');

    try {
      const res = await fetch(`${API}/${taskId}/history`);
      if (!res.ok) throw new Error();
      const history = await res.json();
      if (history.length === 0) {
        content.innerHTML = `<div style="text-align:center;padding:1rem;color:var(--text-muted)">${t('history.empty')}</div>`;
        return;
      }
      content.innerHTML = history.map(h => {
        const time = new Date(h.timestamp).toLocaleString(currentLang === 'zh' ? 'zh-CN' : 'en');
        const actionLabel = formatAction(h.action);
        const detail = formatDetail(h);
        return `<div class="history-item"><div class="history-time">${time}</div><div class="history-action">${actionLabel}</div>${detail ? `<div class="history-detail">${detail}</div>` : ''}</div>`;
      }).join('');
    } catch {
      content.innerHTML = `<div style="text-align:center;padding:1rem;color:var(--text-muted)">${t('history.load_error')}</div>`;
    }
  }

  async function showGlobalHistory() {
    const panel = document.getElementById('history-panel');
    const content = document.getElementById('history-content');
    const htitle = document.getElementById('history-title');
    if (!panel || !content) return;

    htitle.textContent = t('history.recent');
    content.innerHTML = `<div style="text-align:center;padding:1rem;color:var(--text-muted)">${t('history.loading')}</div>`;
    panel.classList.add('open');
    const backdrop = document.getElementById('panel-backdrop');
    if (backdrop) backdrop.classList.add('open');

    try {
      const res = await fetch('/api/history?limit=50');
      if (!res.ok) throw new Error();
      const history = await res.json();
      if (history.length === 0) {
        content.innerHTML = `<div style="text-align:center;padding:1rem;color:var(--text-muted)">${t('history.no_activity')}</div>`;
        return;
      }
      content.innerHTML = history.map(h => {
        const time = new Date(h.timestamp).toLocaleString(currentLang === 'zh' ? 'zh-CN' : 'en');
        const actionLabel = formatAction(h.action);
        const taskName = h.taskTitle || h.taskId.slice(0, 8);
        const detail = formatDetail(h);
        return `<div class="history-item"><div class="history-time">${time}</div><div class="history-action"><strong>${esc(taskName)}</strong> ${actionLabel}</div>${detail ? `<div class="history-detail">${detail}</div>` : ''}</div>`;
      }).join('');
    } catch {
      content.innerHTML = `<div style="text-align:center;padding:1rem;color:var(--text-muted)">${t('history.load_error')}</div>`;
    }
  }

  function hideHistory() {
    const panel = document.getElementById('history-panel');
    const backdrop = document.getElementById('panel-backdrop');
    if (panel) panel.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  }

  function formatAction(action) {
    return { created: t('history.created'), updated: t('history.updated'), deleted: t('history.deleted'), migrated: t('history.migrated') }[action] || action;
  }

  function formatDetail(h) {
    if (h.field && h.action === 'updated') {
      const fieldLabel = { status: t('history.field.status'), title: t('history.field.title'), desc: t('history.field.desc'), priority: t('history.field.priority'), type: t('history.field.type'), tags: t('history.field.tags'), risk: t('history.field.risk'), marker: t('history.field.marker'), dependency: t('history.field.dependency'), releaseTime: t('history.field.release'), subtasks: t('history.field.subtasks') };
      const label = fieldLabel[h.field] || h.field;
      return `<span class="history-field">${esc(label)}</span>: <span class="history-old">${esc(String(h.oldValue))}</span> \u2192 <span class="history-new">${esc(String(h.newValue))}</span>`;
    }
    if (h.snapshot && h.action === 'deleted') {
      try { return `Deleted: "${esc(JSON.parse(h.snapshot).title)}"`; } catch { return ''; }
    }
    return '';
  }

  /* ---------- Data Export / Import ---------- */
  function exportJSON() {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `solohelm-${todayStr()}.json`);
    toast(t('toast.exported_json'), 'success', 2000);
  }

  function exportCSV() {
    const headers = ['id', 'title', 'desc', 'tags', 'priority', 'type', 'status', 'dependency', 'releaseTime', 'risk', 'marker', 'createdAt', 'updatedAt', 'lastMoved'];
    const rows = tasks.map(tk => headers.map(h => {
      let val = tk[h];
      if (Array.isArray(val)) val = val.join(';');
      if (typeof val === 'boolean') val = val ? '1' : '0';
      val = String(val || '');
      return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    downloadBlob(new Blob([csv], { type: 'text/csv' }), `solohelm-${todayStr()}.csv`);
    toast(t('toast.exported_csv'), 'success', 2000);
  }

  function downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const items = JSON.parse(text);
        if (!Array.isArray(items)) throw new Error('File must contain an array');
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(items),
        });
        if (!res.ok) throw new Error('Import failed');
        const result = await res.json();
        toast(t('toast.imported', { imported: result.imported, total: result.total }), 'success', 3000);
        tasks = await loadFromAPI();
        saveToLS();
        render();
      } catch (e) {
        toast(t('toast.import_error', { msg: e.message }), 'error');
      }
    };
    input.click();
  }

  /* ---------- Settings Dropdown ---------- */
  function bindSettingsMenu() {
    const btn = document.getElementById('btn-settings');
    const menu = document.getElementById('settings-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });
    document.addEventListener('click', () => menu.classList.remove('open'));

    const actions = {
      'export-json': exportJSON,
      'export-csv': exportCSV,
      'import-json': importJSON,
      'show-shortcuts': () => {
        const el = document.getElementById('shortcuts-overlay');
        if (el) el.classList.add('open');
      },
    };
    menu.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        menu.classList.remove('open');
        const fn = actions[btn.dataset.action];
        if (fn) fn();
      });
    });
  }

  /* ---------- Wire Actions ---------- */
  function wireActions() {
    document.querySelectorAll('[data-edit]').forEach(btn => {
      btn.onclick = () => { const tk = tasks.find(x => x.id === btn.dataset.edit); if (tk) showModal(tk); };
    });
    document.querySelectorAll('[data-delete]').forEach(btn => {
      btn.onclick = () => { customConfirm(t('confirm.delete')).then(ok => { if (ok) deleteTask(btn.dataset.delete); }); };
    });
    document.querySelectorAll('[data-totodo]').forEach(btn => {
      btn.onclick = () => updateTaskStatus(btn.dataset.totodo, 'todo');
    });
    document.querySelectorAll('[data-toidea]').forEach(btn => {
      btn.onclick = async () => { await updateTask(btn.dataset.toidea, { status: 'backlog', type: 'idea' }); render(); };
    });
    document.querySelectorAll('[data-marker]').forEach(el => {
      el.onclick = () => cycleMarker(el.dataset.marker);
    });
    document.querySelectorAll('[data-history]').forEach(btn => {
      btn.onclick = () => showHistory(btn.dataset.history);
    });
    document.querySelectorAll('[data-detail]').forEach(el => {
      el.onclick = () => showDetail(el.dataset.detail);
    });
  }

  /* ---------- Drag & Drop ---------- */
  function wireDragDrop() {
    const cols = document.querySelectorAll('.kanban-col');
    cols.forEach(col => {
      col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drag-over'); });
      col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
      col.addEventListener('drop', async e => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        const newStatus = col.dataset.status;
        if (!id || !newStatus) return;
        await updateTaskStatus(id, newStatus);
      });
    });
    document.querySelectorAll('.card[draggable="true"]').forEach(card => {
      card.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', card.dataset.id); card.classList.add('dragging'); });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
    });
  }

  /* ---------- View Toggle ---------- */
  function bindViewToggle() {
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentView = btn.dataset.view;
        document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
    });
  }

  /* ---------- Tab Switching Binding ---------- */
  function bindTabs() {
    document.querySelectorAll('.main-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
  }

  /* ---------- Keyboard Shortcuts ---------- */
  function bindKeyboard() {
    document.addEventListener('keydown', e => {
      // Ignore when typing in inputs
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;

      const modal = overlay();
      const modalOpen = modal && modal.classList.contains('open');
      const shortcutsEl = document.getElementById('shortcuts-overlay');
      const shortcutsOpen = shortcutsEl && shortcutsEl.classList.contains('open');

      if (e.key === 'Escape') {
        if (shortcutsOpen) { shortcutsEl.classList.remove('open'); e.preventDefault(); return; }
        if (modalOpen) { hideModal(); e.preventDefault(); return; }
        hideHistory();
        hideDetail();
        return;
      }

      if (modalOpen || shortcutsOpen) return;

      switch (e.key.toLowerCase()) {
        case 'n':
          if (activeTab !== 'analytics') {
            e.preventDefault();
            showModal(null);
          }
          break;
        case '/':
          e.preventDefault();
          if (activeTab !== 'ideas') switchTab('ideas');
          setTimeout(() => {
            const searchInp = document.getElementById('search-input');
            if (searchInp) searchInp.focus();
          }, 50);
          break;
        case '?':
          e.preventDefault();
          if (shortcutsEl) shortcutsEl.classList.add('open');
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); performUndo(); }
          break;
        case '1':
          e.preventDefault();
          switchTab('ideas');
          break;
        case '2':
          e.preventDefault();
          switchTab('board');
          break;
        case '3':
          e.preventDefault();
          switchTab('analytics');
          break;
      }
    });
  }

  /* ---------- Voice Input ---------- */
  function bindVoice() {
    const btn = document.getElementById('voice-btn');
    if (!btn) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      btn.title = t('voice.not_supported');
      btn.style.opacity = '.35';
      btn.onclick = () => alert(t('voice.not_supported_alert'));
      return;
    }
    let recognition = null;
    let recording = false;
    btn.addEventListener('click', () => {
      if (recording) { recognition.stop(); return; }
      recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = e => {
        const transcript = e.results[0][0].transcript;
        const descField = form().desc;
        descField.value = (descField.value ? descField.value + ' ' : '') + simplifyTranscript(transcript);
      };
      recognition.onend = () => { recording = false; btn.classList.remove('recording'); };
      recognition.onerror = () => { recording = false; btn.classList.remove('recording'); };
      recognition.start();
      recording = true;
      btn.classList.add('recording');
    });
  }

  function simplifyTranscript(text) {
    return text.replace(/[。，、；：！？\s]+$/g, '').trim();
  }

  /* ---------- Utility ---------- */
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ---------- Render Entry ---------- */
  function render() {
    if (activeTab === 'board') renderTasksPage();
    else if (activeTab === 'ideas') renderIdeasPage();
    // Analytics renders via loadAnalytics() on tab switch
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initLang();

    // Load data
    try {
      tasks = await loadFromAPI();
      saveToLS();
    } catch {
      tasks = loadFromLS();
      toast(t('toast.offline'), 'warn');
    }
    seedIfEmpty();

    // Bind tabs
    bindTabs();

    // URL hash routing
    const hashTab = location.hash.replace('#', '');
    if (validTabs.includes(hashTab) && hashTab !== activeTab) {
      activeTab = hashTab;
      document.querySelectorAll('.main-tab').forEach(tb => tb.classList.toggle('active', tb.dataset.tab === hashTab));
      document.querySelectorAll('.tab-content').forEach(p => p.classList.toggle('active', p.id === `tab-${hashTab}`));
    }
    window.addEventListener('hashchange', () => {
      const h = location.hash.replace('#', '');
      if (validTabs.includes(h)) switchTab(h);
    });

    // Bind modal
    document.getElementById('btn-new').addEventListener('click', () => showModal(null));
    document.getElementById('modal-close').addEventListener('click', hideModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    overlay().addEventListener('click', e => { if (e.target === overlay()) hideModal(); });
    form().addEventListener('submit', handleFormSubmit);
    form().addEventListener('input', () => { formDirty = true; });
    form().addEventListener('change', () => { formDirty = true; });

    // Subtask add button
    const subAddBtn = document.getElementById('subtask-add-btn');
    if (subAddBtn) subAddBtn.addEventListener('click', addSubtaskFromInput);
    const subInput = document.getElementById('subtask-input');
    if (subInput) subInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSubtaskFromInput(); } });

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Language toggle
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.addEventListener('click', toggleLang);

    // History panel
    const historyClose = document.getElementById('history-close');
    if (historyClose) historyClose.addEventListener('click', hideHistory);
    const globalHistBtn = document.getElementById('btn-global-history');
    if (globalHistBtn) globalHistBtn.addEventListener('click', showGlobalHistory);

    // Detail panel
    const detailClose = document.getElementById('detail-close');
    if (detailClose) detailClose.addEventListener('click', hideDetail);

    // Panel backdrop click-to-close
    const panelBackdrop = document.getElementById('panel-backdrop');
    if (panelBackdrop) panelBackdrop.addEventListener('click', () => { hideDetail(); hideHistory(); });

    // Shortcuts overlay
    const shortcutsOverlay = document.getElementById('shortcuts-overlay');
    if (shortcutsOverlay) shortcutsOverlay.addEventListener('click', e => { if (e.target === shortcutsOverlay) shortcutsOverlay.classList.remove('open'); });

    // Settings menu
    bindSettingsMenu();

    // Board-specific
    bindViewToggle();

    // Ideas-specific
    bindSearch();
    bindVoice();

    // Keyboard shortcuts (all tabs)
    bindKeyboard();

    render();

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  });
})();
