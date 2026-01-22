// 1. Define the data (Must match the keys in main.ts)
const REMINDERS = {
  water: {
    title: 'Drink break!',
    body: 'Have a sip of water.',
    color: '#3498db'
  },
  eyes: {
    title: 'Look away!',
    body: 'Look at something 20 feet away for roughly 20 seconds.',
    color: '#2ecc71'
  },
  stand: {
    title: 'Stand up!',
    body: 'Use your legs for at least 8-10 minutes.',
    color: '#e74c3c'
  }
};

// Get reminder type from query param
const params = new URLSearchParams(window.location.search);
const type = params.get('type') as keyof typeof REMINDERS || 'water';

// 3. Update the UI
const data = REMINDERS[type];

const titleEl = document.getElementById('title');
const msgEl = document.getElementById('message');

if (titleEl && msgEl) {
  titleEl.innerText = data.title;
  titleEl.style.color = data.color;
  msgEl.innerText = data.body;
}

console.log(`Rendered reminder: ${type}`);
