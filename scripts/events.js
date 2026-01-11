/**
 * Events Page — Type + Tag Filter Logic
 */

(function() {
  'use strict';

  const typeButtons = document.querySelectorAll('.filter-btn[data-filter-type="type"]');
  const tagButtons = document.querySelectorAll('.filter-btn[data-filter-type="tag"]');
  const timelineItems = document.querySelectorAll('.timeline__item[data-type]');

  let activeType = 'all';
  let activeTag = 'all';

  function filterItems() {
    timelineItems.forEach(item => {
      const itemType = item.dataset.type;
      const itemTags = item.dataset.tags ? item.dataset.tags.split(',') : [];
      
      const matchesType = activeType === 'all' || itemType === activeType;
      const matchesTag = activeTag === 'all' || itemTags.includes(activeTag);
      
      if (matchesType && matchesTag) {
        item.style.display = '';
        item.removeAttribute('data-hidden');
      } else {
        item.style.display = 'none';
        item.setAttribute('data-hidden', 'true');
      }
    });
  }

  // Type filter
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeType = btn.dataset.filter;
      typeButtons.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      filterItems();
    });
  });

  // Tag filter
  tagButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTag = btn.dataset.filter;
      tagButtons.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      filterItems();
    });
  });

})();
