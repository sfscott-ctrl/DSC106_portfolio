import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const container = document.querySelector('.projects');
const select = document.querySelector('#year-filter');

// Get unique years
const years = [...new Set(projects.map(p => p.year))].sort();

// Add years to dropdown
for (let year of years) {
  const option = document.createElement('option');
  option.value = year;
  option.textContent = year;
  select.appendChild(option);
}

// Initial render
renderProjects(projects, container, 'h2');

// Filter on change
select.addEventListener('change', () => {
  const selectedYear = select.value;

  let filteredProjects;

  if (selectedYear === 'all') {
    filteredProjects = projects;
  } else {
    filteredProjects = projects.filter(p => p.year == selectedYear);
  }

  renderProjects(filteredProjects, container, 'h2');
});