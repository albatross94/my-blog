import { initTheme } from './theme.js';
import { initRouter } from './router.js';

document.getElementById('year').textContent = new Date().getFullYear();
initTheme();
initRouter();
