/**
 * Projects Page — Fetches from JSON, renders cards, with filtering + click handling
 */

(function() {
  'use strict';

  const projectGrid = document.getElementById('project-grid');
  let projectsData = [];
  let activeStatus = 'all';
  let activeTag = 'all';

  // Status labels for display
  const statusLabels = {
    research: 'Research',
    wip: 'In Progress',
    shipped: 'Shipped'
  };

  const statusClasses = {
    research: 'status--research',
    wip: 'status--wip',
    shipped: 'status--shipped'
  };

  // Fetch and render projects
  async function init() {
    try {
      const response = await fetch('/data/projects.json');
      const data = await response.json();
      projectsData = data.projects;
      renderProjects();
      setupFilters();
    } catch (error) {
      console.error('Failed to load projects:', error);
      projectGrid.innerHTML = '<p>Failed to load projects.</p>';
    }
  }

  function createProjectHTML(project) {
    const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    const imageHTML = project.image ? 
      `<img src="${project.image}" alt="${project.title}" class="card__image" />` : 
      '<div class="card__image-placeholder"></div>';
    
    const repoLink = project.repo ? 
      `<a href="${project.repo}" class="card__link-btn" target="_blank" rel="noopener">Repo →</a>` : '';
    const demoLink = project.demo ? 
      `<a href="${project.demo}" class="card__link-btn" target="_blank" rel="noopener">Demo →</a>` : '';

    return `
      <article class="card fade-in visible" data-status="${project.status}" data-tags="${project.tags.join(',')}" data-repo="${project.repo || ''}" data-demo="${project.demo || ''}">
        ${imageHTML}
        <div class="card__content">
          <h3 class="card__title">${project.title}</h3>
          <p class="card__intent">${project.intent}</p>
          <div class="card__meta">
            <span class="status ${statusClasses[project.status] || ''}">${statusLabels[project.status] || project.status}</span>
            <time class="card__date mono">${project.date}</time>
          </div>
          <div class="tags mt-4">
            ${tagsHTML}
          </div>
          <div class="card__links">
            ${repoLink}
            ${demoLink}
          </div>
        </div>
      </article>
    `;
  }

  function renderProjects() {
    // Filter projects
    const filtered = projectsData.filter(project => {
      const matchesStatus = activeStatus === 'all' || project.status === activeStatus;
      const matchesTag = activeTag === 'all' || project.tags.includes(activeTag);
      return matchesStatus && matchesTag;
    });

    // Render
    if (filtered.length === 0) {
      projectGrid.innerHTML = '<p>No projects match the current filters.</p>';
    } else {
      projectGrid.innerHTML = filtered.map(createProjectHTML).join('');
      setupCardClicks();
    }
  }

  function setupCardClicks() {
    document.querySelectorAll('.card[data-status]').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card__link-btn')) return;
        
        const demo = card.dataset.demo;
        const repo = card.dataset.repo;
        const url = demo && demo.length > 0 ? demo : repo;
        
        if (url) {
          window.open(url, '_blank', 'noopener');
        }
      });
    });
  }

  function setupFilters() {
    // Status filter
    document.querySelectorAll('.filter-btn[data-filter-type="status"]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeStatus = btn.dataset.filter;
        document.querySelectorAll('.filter-btn[data-filter-type="status"]').forEach(b => b.classList.remove('filter-btn--active'));
        btn.classList.add('filter-btn--active');
        renderProjects();
      });
    });

    // Tag filter
    document.querySelectorAll('.filter-btn[data-filter-type="tag"]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTag = btn.dataset.filter;
        document.querySelectorAll('.filter-btn[data-filter-type="tag"]').forEach(b => b.classList.remove('filter-btn--active'));
        btn.classList.add('filter-btn--active');
        renderProjects();
      });
    });
  }

  // Initialize
  init();

})();
