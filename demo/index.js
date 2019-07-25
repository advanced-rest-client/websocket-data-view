import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-toast/paper-toast.js';
import '../websocket-data-view.js';
import { DataGenerator } from './data-generator.js';

document.getElementById('theme').addEventListener('change', (e) => {
  if (e.target.checked) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
});
document.getElementById('styled').addEventListener('change', (e) => {
  if (e.target.checked) {
    document.body.classList.add('styled');
  } else {
    document.body.classList.remove('styled');
  }
});
document.getElementById('narrow').addEventListener('change', (e) => {
  const node = document.querySelector('websocket-data-view');
  if (e.target.checked) {
    node.setAttribute('narrow', '');
  } else {
    node.removeAttribute('narrow');
  }
});
let messages;
document.getElementById('genButton').addEventListener('click', () => {
  let data = DataGenerator.generateData(25);
  const existing = messages;
  if (existing) {
    data = existing.concat(data);
  }
  messages = data;
  document.getElementById('dataView').messages = messages;
  document.getElementById('genToast').opened = true;
});
