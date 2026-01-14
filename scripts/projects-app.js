/**
 * Projects Page — Fetches from JSON, renders featured + all projects, with filtering + sorting
 */

(function() {
  'use strict';

  const featuredGrid = document.getElementById('featured-grid');
  const projectGrid = document.getElementById('project-grid');
  let projectsData = [];
  let activeStatus = 'all';
  let activeTag = 'all';
  let activeSort = 'newest';

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

  async function init() {
    // Try multiple paths to ensure we find the JSON file
    const paths = [
      '../data/projects.json', // Standard relative path
      'data/projects.json',    // Root relative (if cached/root)
      '/data/projects.json',   // Absolute fallback
      'https://nirvaankohli.com/data/projects.json' // Hardcoded Production Fallback
    ];

    let loaded = false;
    let errorMsg = '';

    for (const path of paths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const data = await response.json();
          projectsData = data.projects;
          loaded = true;
          break; // Exit loop on success
        }
      } catch (err) {
        errorMsg = err.message;
        console.warn(`Failed to fetch from ${path}:`, err);
      }
    }

    if (loaded) {
      renderFeatured();
      renderProjects();
      setupFilters();
    } else {
      console.error('All fetch attempts failed.');
      if (projectGrid) {
        projectGrid.innerHTML = `
          <div style="text-align: center; color: var(--text-secondary);">
            <p>Unable to load projects.</p>
            <p class="mono" style="font-size: 0.8em; margin-top: 8px;">Error: ${errorMsg || 'File not found'}</p>
          </div>
        `;
      }
    }
  }

  function createProjectHTML(project, isFeatured = false) {
    const tagsHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    // Fix image path - ensure it is relative for subpages
    let imagePath = project.image;
    if (imagePath && !imagePath.startsWith('/') && !imagePath.startsWith('http') && !imagePath.startsWith('..')) {
      imagePath = '../' + imagePath;
    }
    
    const imageHTML = imagePath ? 
      `<img src="${imagePath}" alt="${project.title}" class="card__image" loading="lazy" onload="this.classList.add('loaded')" />` : 
      '<div class="card__image-placeholder"></div>';
    
    const repoLink = project.repo ? 
      `<a href="${project.repo}" class="card__link-btn" target="_blank" rel="noopener">Repo →</a>` : '';
    const demoLink = project.demo ? 
      `<a href="${project.demo}" class="card__link-btn" target="_blank" rel="noopener">Demo →</a>` : '';

    const cardClass = isFeatured ? 'card card--featured' : 'card';

    return `
      <article class="${cardClass} fade-in visible" data-status="${project.status}" data-tags="${project.tags.join(',')}" data-repo="${project.repo || ''}" data-demo="${project.demo || ''}" data-date="${project.date}">
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

  function renderFeatured() {
    if (!featuredGrid) return;
    
    const featured = projectsData.filter(p => p.featured);
    if (featured.length === 0) {
      featuredGrid.parentElement.style.display = 'none';
      return;
    }
    
    featuredGrid.innerHTML = featured.map(p => createProjectHTML(p, true)).join('');
    setupCardClicks(featuredGrid);
  }

  function renderProjects() {
    if (!projectGrid) return;

    // Filter
    let filtered = projectsData.filter(project => {
      const matchesStatus = activeStatus === 'all' || project.status === activeStatus;
      const matchesTag = activeTag === 'all' || project.tags.includes(activeTag);
      return matchesStatus && matchesTag;
    });

    // Sort
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date + '-01');
      const dateB = new Date(b.date + '-01');
      return activeSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    if (filtered.length === 0) {
      projectGrid.innerHTML = '<p>No projects match the current filters.</p>';
    } else {
      projectGrid.innerHTML = filtered.map(p => createProjectHTML(p)).join('');
      setupCardClicks(projectGrid);
    }
  }

  function setupCardClicks(container) {
    container.querySelectorAll('.card').forEach(card => {
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

    // Sort
    document.querySelectorAll('.filter-btn[data-filter-type="sort"]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSort = btn.dataset.sort;
        document.querySelectorAll('.filter-btn[data-filter-type="sort"]').forEach(b => b.classList.remove('filter-btn--active'));
        btn.classList.add('filter-btn--active');
        renderProjects();
      });
    });
  }

  init();

})();
