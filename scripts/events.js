/**
 * Events Page — Fetches from JSON, renders timeline, with filtering + sorting
 */

(function() {
  'use strict';

  const timeline = document.getElementById('timeline');
  let eventsData = [];
  let activeType = 'all';
  let activeTag = 'all';
  let activeSort = 'newest';

  // Type labels for display
  const typeLabels = {
    launch: 'Launch',
    project: 'Project',
    hackathon: 'Competition',
    talk: 'Talk',
    award: 'Award'
  };

  // Fetch and render events
  async function init() {
    try {
      const response = await fetch('/data/events.json');
      const data = await response.json();
      eventsData = data.events;
      renderEvents();
      setupFilters();
    } catch (error) {
      console.error('Failed to load events:', error);
      timeline.innerHTML = '<p class="timeline__empty-text">Failed to load events.</p>';
    }
  }

  function createEventHTML(event) {
    const markerClass = event.type === 'launch' ? 'timeline__marker--launch' : 
                        event.type === 'hackathon' ? 'timeline__marker--hackathon' : '';
    const typeClass = event.type === 'launch' ? 'timeline__type--launch' : 
                      event.type === 'hackathon' ? 'timeline__type--hackathon' : '';
    
    const tagsHTML = event.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    const imageHTML = event.image ? `<img src="${event.image}" alt="${event.title}" class="timeline__image" />` : '';
    const linkHTML = event.link ? `<a href="${event.link}" class="timeline__link" target="_blank" rel="noopener">View →</a>` : '';

    return `
      <article class="timeline__item fade-in visible" data-type="${event.type}" data-tags="${event.tags.join(',')}" data-date="${event.date}">
        <div class="timeline__marker ${markerClass}"></div>
        <div class="timeline__content">
          ${imageHTML}
          <time class="timeline__date mono" datetime="${event.date}">${event.dateDisplay}</time>
          <h3 class="timeline__title">${event.title}</h3>
          <p class="timeline__description">${event.description}</p>
          <div class="timeline__meta">
            <span class="timeline__type ${typeClass}">${typeLabels[event.type] || event.type}</span>
            ${tagsHTML}
          </div>
          ${linkHTML}
        </div>
      </article>
    `;
  }

  function renderEvents() {
    // Filter events
    const filtered = eventsData.filter(event => {
      const matchesType = activeType === 'all' || event.type === activeType;
      const matchesTag = activeTag === 'all' || event.tags.includes(activeTag);
      return matchesType && matchesTag;
    });

    // Sort events
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return activeSort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Render
    if (sorted.length === 0) {
      timeline.innerHTML = '<div class="timeline__empty"><p class="timeline__empty-text">No events match the current filters.</p></div>';
    } else {
      timeline.innerHTML = sorted.map(createEventHTML).join('');
    }
  }

  function setupFilters() {
    // Type filter
    document.querySelectorAll('.filter-btn[data-filter-type="type"]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeType = btn.dataset.filter;
        document.querySelectorAll('.filter-btn[data-filter-type="type"]').forEach(b => b.classList.remove('filter-btn--active'));
        btn.classList.add('filter-btn--active');
        renderEvents();
      });
    });

    // Tag filter
    document.querySelectorAll('.filter-btn[data-filter-type="tag"]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTag = btn.dataset.filter;
        document.querySelectorAll('.filter-btn[data-filter-type="tag"]').forEach(b => b.classList.remove('filter-btn--active'));
        btn.classList.add('filter-btn--active');
        renderEvents();
      });
    });

    // Sort
    document.querySelectorAll('.filter-btn[data-filter-type="sort"]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeSort = btn.dataset.sort;
        document.querySelectorAll('.filter-btn[data-filter-type="sort"]').forEach(b => b.classList.remove('filter-btn--active'));
        btn.classList.add('filter-btn--active');
        renderEvents();
      });
    });
  }

  // Initialize
  init();

})();
