// 1. Define the data (Must match the keys in main.ts)
const REMINDERS = {
  eyes: {
    title: 'Look away!',
    body: 'Look at something 20 feet away for roughly 20 seconds.',
    color: '#2ecc71'
  },
  standing: {
    title: 'Stand up!',
    body: 'Walk or stand for at least 8-10 minutes.',
    color: '#3c5ee7'
  }
};

// Get reminder type from query param
const params = new URLSearchParams(window.location.search);
const type = params.get('type') as keyof typeof REMINDERS;

// 3. Update the UI
const data = REMINDERS[type];

const titleEl = document.getElementById('title');
const msgEl = document.getElementById('message');

if (titleEl && msgEl) {
  titleEl.innerText = data.title;
  titleEl.style.color = data.color;
  msgEl.innerText = data.body;
}

document.getElementById('dismiss').addEventListener('click', () => {window.hh.dismiss();})

console.log(`Rendered reminder: ${type}`);
