document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <div id="theme-switcher" class="theme-switcher">
    <label class="color-scheme">
    Theme:
    <select id="theme-selector">
    <option value="default">System Default</option>
    <option value="light">Light Mode</option>
    <option value="dark">Dark Mode</option>
    <option value="dark-pink">Dark Pink Mode</option>
    <option value="tiktok">TikTok Mode</option>
    </select>
    </label>
    </div>`
);

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

const savedTheme = localStorage.getItem('theme') || 'default';

applyTheme(savedTheme);

const themeSelector = document.getElementById('theme-selector');

themeSelector.value = savedTheme;
themeSelector.addEventListener('change', function() {
    const selectedTheme = this.value;
    applyTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
});