(function() {
  'use strict';

  const state = {
    projects: [],
    events: [],
    selectedProjectId: null,
    selectedEventId: null
  };

  const loginShell = document.getElementById('login-shell');
  const dashboardShell = document.getElementById('dashboard-shell');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const loginMessage = document.getElementById('login-message');

  const projectList = document.getElementById('project-list');
  const projectForm = document.getElementById('project-form');
  const projectMessage = document.getElementById('project-message');
  const newProjectBtn = document.getElementById('new-project-btn');
  const deleteProjectBtn = document.getElementById('delete-project-btn');
  const uploadProjectImageBtn = document.getElementById('upload-project-image-btn');
  const projectImageInput = document.getElementById('project-image-file');
  const projectPreview = document.getElementById('project-image-preview');

  const eventList = document.getElementById('event-list');
  const eventForm = document.getElementById('event-form');
  const eventMessage = document.getElementById('event-message');
  const newEventBtn = document.getElementById('new-event-btn');
  const deleteEventBtn = document.getElementById('delete-event-btn');
  const uploadEventImageBtn = document.getElementById('upload-event-image-btn');
  const eventImageInput = document.getElementById('event-image-file');
  const eventPreview = document.getElementById('event-image-preview');

  function setMessage(node, message, isError = false) {
    node.textContent = message;
    node.style.color = isError ? '#fca5a5' : 'var(--text-secondary)';
  }

  function parseTags(input) {
    return input
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  function toTagString(tags) {
    return Array.isArray(tags) ? tags.join(', ') : '';
  }

  function byNewest(a, b) {
    return String(b.date || '').localeCompare(String(a.date || ''));
  }

  async function requestJSON(url, options = {}) {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {})
      },
      ...options
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || 'Request failed.');
    }
    return payload;
  }

  function emptyProject() {
    return {
      id: '',
      title: '',
      intent: '',
      status: 'research',
      tags: [],
      date: '',
      featured: false,
      image: '',
      repo: '',
      demo: ''
    };
  }

  function emptyEvent() {
    return {
      id: '',
      title: '',
      description: '',
      date: '',
      dateDisplay: '',
      type: 'project',
      tags: [],
      image: '',
      link: ''
    };
  }

  function selectedProject() {
    return state.projects.find(project => project.id === state.selectedProjectId) || emptyProject();
  }

  function selectedEvent() {
    return state.events.find(event => event.id === state.selectedEventId) || emptyEvent();
  }

  function populateProjectForm(project) {
    projectForm.elements.id.value = project.id || '';
    projectForm.elements.title.value = project.title || '';
    projectForm.elements.intent.value = project.intent || '';
    projectForm.elements.status.value = project.status || 'research';
    projectForm.elements.tags.value = toTagString(project.tags);
    projectForm.elements.date.value = project.date || '';
    projectForm.elements.featured.checked = Boolean(project.featured);
    projectForm.elements.image.value = project.image || '';
    projectForm.elements.repo.value = project.repo || '';
    projectForm.elements.demo.value = project.demo || '';
    updatePreview(projectPreview, project.image);
  }

  function populateEventForm(event) {
    eventForm.elements.id.value = event.id || '';
    eventForm.elements.title.value = event.title || '';
    eventForm.elements.description.value = event.description || '';
    eventForm.elements.date.value = event.date || '';
    eventForm.elements.dateDisplay.value = event.dateDisplay || '';
    eventForm.elements.type.value = event.type || 'project';
    eventForm.elements.tags.value = toTagString(event.tags);
    eventForm.elements.image.value = event.image || '';
    eventForm.elements.link.value = event.link || '';
    updatePreview(eventPreview, event.image);
  }

  function renderProjectList() {
    const items = [...state.projects].sort(byNewest);
    projectList.innerHTML = items.map(project => `
      <button class="admin-list-item ${project.id === state.selectedProjectId ? 'is-active' : ''}" type="button" data-project-id="${project.id}">
        <span class="admin-list-item-title">${project.title || project.id}</span>
        <span class="admin-list-item-meta">${project.date || 'No date'} · ${project.status || 'research'}</span>
      </button>
    `).join('');

    projectList.querySelectorAll('[data-project-id]').forEach(button => {
      button.addEventListener('click', () => {
        state.selectedProjectId = button.dataset.projectId;
        renderProjectList();
        populateProjectForm(selectedProject());
        setMessage(projectMessage, '');
      });
    });
  }

  function renderEventList() {
    const items = [...state.events].sort(byNewest);
    eventList.innerHTML = items.map(event => `
      <button class="admin-list-item ${event.id === state.selectedEventId ? 'is-active' : ''}" type="button" data-event-id="${event.id}">
        <span class="admin-list-item-title">${event.title || event.id}</span>
        <span class="admin-list-item-meta">${event.date || 'No date'} · ${event.type || 'project'}</span>
      </button>
    `).join('');

    eventList.querySelectorAll('[data-event-id]').forEach(button => {
      button.addEventListener('click', () => {
        state.selectedEventId = button.dataset.eventId;
        renderEventList();
        populateEventForm(selectedEvent());
        setMessage(eventMessage, '');
      });
    });
  }

  function updatePreview(node, imagePath) {
    if (imagePath) {
      node.src = imagePath;
      node.classList.remove('hidden');
    } else {
      node.removeAttribute('src');
      node.classList.add('hidden');
    }
  }

  async function refreshData() {
    const [projectsPayload, eventsPayload] = await Promise.all([
      requestJSON('/api/admin/projects'),
      requestJSON('/api/admin/events')
    ]);

    state.projects = projectsPayload.projects || [];
    state.events = eventsPayload.events || [];

    if (!state.selectedProjectId && state.projects[0]) {
      state.selectedProjectId = state.projects[0].id;
    }

    if (!state.selectedEventId && state.events[0]) {
      state.selectedEventId = state.events[0].id;
    }

    if (state.selectedProjectId && !state.projects.some(project => project.id === state.selectedProjectId)) {
      state.selectedProjectId = state.projects[0] ? state.projects[0].id : null;
    }

    if (state.selectedEventId && !state.events.some(event => event.id === state.selectedEventId)) {
      state.selectedEventId = state.events[0] ? state.events[0].id : null;
    }

    renderProjectList();
    renderEventList();
    populateProjectForm(selectedProject());
    populateEventForm(selectedEvent());
  }

  function showDashboard() {
    loginShell.classList.add('hidden');
    dashboardShell.classList.remove('hidden');
  }

  function showLogin() {
    dashboardShell.classList.add('hidden');
    loginShell.classList.remove('hidden');
  }

  async function boot() {
    try {
      const sessionPayload = await requestJSON('/api/auth/session', { method: 'GET' });
      if (!sessionPayload.authenticated) {
        showLogin();
        return;
      }

      showDashboard();
      await refreshData();
    } catch (error) {
      showLogin();
      setMessage(loginMessage, error.message, true);
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(loginMessage, '');

    try {
      await requestJSON('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: loginForm.elements.username.value.trim(),
          password: loginForm.elements.password.value
        })
      });

      loginForm.reset();
      showDashboard();
      await refreshData();
    } catch (error) {
      setMessage(loginMessage, error.message, true);
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      await requestJSON('/api/auth/logout', { method: 'POST' });
    } finally {
      showLogin();
    }
  });

  newProjectBtn.addEventListener('click', () => {
    state.selectedProjectId = null;
    renderProjectList();
    populateProjectForm(emptyProject());
    setMessage(projectMessage, 'Creating a new project draft.');
  });

  newEventBtn.addEventListener('click', () => {
    state.selectedEventId = null;
    renderEventList();
    populateEventForm(emptyEvent());
    setMessage(eventMessage, 'Creating a new event draft.');
  });

  projectForm.elements.image.addEventListener('input', () => {
    updatePreview(projectPreview, projectForm.elements.image.value.trim());
  });

  eventForm.elements.image.addEventListener('input', () => {
    updatePreview(eventPreview, eventForm.elements.image.value.trim());
  });

  projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(projectMessage, '');

    const payload = {
      id: projectForm.elements.id.value.trim(),
      title: projectForm.elements.title.value.trim(),
      intent: projectForm.elements.intent.value.trim(),
      status: projectForm.elements.status.value,
      tags: parseTags(projectForm.elements.tags.value),
      date: projectForm.elements.date.value.trim(),
      featured: projectForm.elements.featured.checked,
      image: projectForm.elements.image.value.trim(),
      repo: projectForm.elements.repo.value.trim(),
      demo: projectForm.elements.demo.value.trim()
    };

    try {
      const result = await requestJSON('/api/admin/projects', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      state.selectedProjectId = result.project.id;
      await refreshData();
      setMessage(projectMessage, 'Project saved.');
    } catch (error) {
      setMessage(projectMessage, error.message, true);
    }
  });

  eventForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(eventMessage, '');

    const payload = {
      id: eventForm.elements.id.value.trim(),
      title: eventForm.elements.title.value.trim(),
      description: eventForm.elements.description.value.trim(),
      date: eventForm.elements.date.value,
      dateDisplay: eventForm.elements.dateDisplay.value.trim(),
      type: eventForm.elements.type.value,
      tags: parseTags(eventForm.elements.tags.value),
      image: eventForm.elements.image.value.trim(),
      link: eventForm.elements.link.value.trim()
    };

    try {
      const result = await requestJSON('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      state.selectedEventId = result.event.id;
      await refreshData();
      setMessage(eventMessage, 'Event saved.');
    } catch (error) {
      setMessage(eventMessage, error.message, true);
    }
  });

  deleteProjectBtn.addEventListener('click', async () => {
    if (!state.selectedProjectId) {
      setMessage(projectMessage, 'Select a saved project before deleting.', true);
      return;
    }

    if (!window.confirm('Delete this project?')) {
      return;
    }

    try {
      await requestJSON(`/api/admin/projects/${encodeURIComponent(state.selectedProjectId)}`, {
        method: 'DELETE'
      });
      state.selectedProjectId = null;
      await refreshData();
      setMessage(projectMessage, 'Project deleted.');
    } catch (error) {
      setMessage(projectMessage, error.message, true);
    }
  });

  deleteEventBtn.addEventListener('click', async () => {
    if (!state.selectedEventId) {
      setMessage(eventMessage, 'Select a saved event before deleting.', true);
      return;
    }

    if (!window.confirm('Delete this event?')) {
      return;
    }

    try {
      await requestJSON(`/api/admin/events/${encodeURIComponent(state.selectedEventId)}`, {
        method: 'DELETE'
      });
      state.selectedEventId = null;
      await refreshData();
      setMessage(eventMessage, 'Event deleted.');
    } catch (error) {
      setMessage(eventMessage, error.message, true);
    }
  });

  uploadProjectImageBtn.addEventListener('click', async () => {
    const file = projectImageInput.files[0];
    if (!file) {
      setMessage(projectMessage, 'Choose an image file first.', true);
      return;
    }

    const formData = new FormData();
    formData.append('collection', 'projects');
    formData.append('file', file);

    try {
      const result = await requestJSON('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      projectForm.elements.image.value = result.path;
      updatePreview(projectPreview, result.path);
      projectImageInput.value = '';
      setMessage(projectMessage, 'Project image uploaded.');
    } catch (error) {
      setMessage(projectMessage, error.message, true);
    }
  });

  uploadEventImageBtn.addEventListener('click', async () => {
    const file = eventImageInput.files[0];
    if (!file) {
      setMessage(eventMessage, 'Choose an image file first.', true);
      return;
    }

    const formData = new FormData();
    formData.append('collection', 'events');
    formData.append('file', file);

    try {
      const result = await requestJSON('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      eventForm.elements.image.value = result.path;
      updatePreview(eventPreview, result.path);
      eventImageInput.value = '';
      setMessage(eventMessage, 'Event image uploaded.');
    } catch (error) {
      setMessage(eventMessage, error.message, true);
    }
  });

  boot();
})();
