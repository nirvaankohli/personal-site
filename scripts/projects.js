/**
 * Projects Page — Status + Tag Filter Logic + Card Click
 */

(function() {
  'use strict';

  const statusButtons = document.querySelectorAll('.filter-btn[data-filter-type="status"]');
  const tagButtons = document.querySelectorAll('.filter-btn[data-filter-type="tag"]');
  const projectCards = document.querySelectorAll('.card[data-status]');

  let activeStatus = 'all';
  let activeTag = 'all';

  function filterCards() {
    projectCards.forEach(card => {
      const cardStatus = card.dataset.status;
      const cardTags = card.dataset.tags ? card.dataset.tags.split(',') : [];
      
      const matchesStatus = activeStatus === 'all' || cardStatus === activeStatus;
      const matchesTag = activeTag === 'all' || cardTags.includes(activeTag);
      
      if (matchesStatus && matchesTag) {
        card.style.display = '';
        card.removeAttribute('data-hidden');
      } else {
        card.style.display = 'none';
        card.setAttribute('data-hidden', 'true');
      }
    });
  }

  // Status filter
  statusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeStatus = btn.dataset.filter;
      statusButtons.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      filterCards();
    });
  });

  // Tag filter
  tagButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTag = btn.dataset.filter;
      tagButtons.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      filterCards();
    });
  });

  // Card click — go to demo if available, otherwise repo
  projectCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on a link button
      if (e.target.closest('.card__link-btn')) return;
      
      const demo = card.dataset.demo;
      const repo = card.dataset.repo;
      const url = demo && demo.length > 0 ? demo : repo;
      
      if (url) {
        window.open(url, '_blank', 'noopener');
      }
    });
  });

})();
