console.log("IT'S ALIVE!");

function normalizePath(path) {
  return path.replace(/index\.html$/, "").replace(/\/$/, "");
}

let pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "resume/", title: "Resume" },
  { url: "https://github.com/sfscott-ctrl", title: "GitHub" }
];

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"
    : "/DSC106_portfolio/"; 

document.body.insertAdjacentHTML(
  "afterbegin",
  `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  `
);

const select = document.querySelector(".color-scheme select");

if (select) {
  // Load saved preference FIRST
  if ('colorScheme' in localStorage) {
    const saved = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', saved);
    select.value = saved;
  }

  // Then listen for changes
  select.addEventListener('input', function (event) {
    const value = event.target.value;

    document.documentElement.style.setProperty('color-scheme', value);
    localStorage.colorScheme = value;
  });
}

let nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;

  if (!url.startsWith("http")) {
    url = BASE_PATH + url;
  }

  let a = document.createElement("a");
  a.href = url;
  a.textContent = p.title;

  // highlight current page
  if (
    a.host === location.host &&
    normalizePath(a.pathname) === normalizePath(location.pathname)
  ) {
    a.classList.add("current");
  }

  // open external links in new tab
  if (a.host !== location.host) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }

  nav.append(a);
}

// Get the form (if it exists on the page)
const form = document.querySelector("form");

form?.addEventListener("submit", function (event) {
  event.preventDefault(); // stop default behavior

  const data = new FormData(form);

  let url = form.action + "?"; // start with mailto link

  const params = [];

  for (let [name, value] of data) {
    const encodedValue = encodeURIComponent(value);
    params.push(`${name}=${encodedValue}`);
  }

  url += params.join("&");

  // Open email client
  location.href = url;
});

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';

  for (let project of projects) {
    const article = document.createElement('article');

    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <p>${project.description}</p>
    `;

    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);

}