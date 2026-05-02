import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

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

select.addEventListener('change', () => {
  const selectedYear = select.value;

  let filteredProjects;

  if (selectedYear === 'all') {
    filteredProjects = projects;
  } else {
    filteredProjects = projects.filter(p => p.year == selectedYear);
  }

  renderProjects(filteredProjects, container, 'h2');
  renderPieChart(filteredProjects);
});

let query = '';
let selectedYear = null;

function getFilteredProjects() {
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}
function updateVisibleProjects() {
  let searchedProjects = getFilteredProjects();

  let filteredProjects = selectedYear
    ? searchedProjects.filter((project) => project.year === selectedYear)
    : searchedProjects;

  renderProjects(filteredProjects, container, 'h2');
  renderPieChart(searchedProjects);
}

function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('li').remove();
  
  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', data[i].label === selectedYear ? 'selected' : '')
      .on('click', () => {
        let year = data[i].label;
        selectedYear = selectedYear === year ? null : year;
        updateVisibleProjects();
      });
});

data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`)
    .attr('class', d.label === selectedYear ? 'legend-item selected' : 'legend-item')
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});
}

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  updateVisibleProjects();
});

updateVisibleProjects();


//let colors = d3.scaleOrdinal(["#e15759","#76b7b2","#af7aa1","#edc949"]);