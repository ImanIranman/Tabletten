if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

document.getElementById('reminderForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const time = document.getElementById('time').value;
  const days = Array.from(document.querySelectorAll('#days input:checked')).map(cb => parseInt(cb.value));
  const editIndex = document.getElementById('editIndex').value;

  if (!name || !time || days.length === 0) {
    alert("Bitte alle Felder ausfüllen.");
    return;
  }

  const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');

  if (editIndex !== '') {
    // Bearbeiten
    reminders[parseInt(editIndex)] = { name, time, days };
  } else {
    // Neu hinzufügen
    reminders.push({ name, time, days });
  }

  localStorage.setItem('reminders', JSON.stringify(reminders));

  document.getElementById('reminderForm').reset();
  document.getElementById('editIndex').value = '';
  renderReminders();
  requestNotificationPermission();
});

function renderReminders() {
  const list = document.getElementById('reminderList');
  list.innerHTML = '';
  const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');

  reminders.forEach((reminder, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${reminder.name}</strong><br>
      Zeit: ${reminder.time}<br>
      Tage: ${reminder.days.map(d => ['So','Mo','Di','Mi','Do','Fr','Sa'][d]).join(', ')}<br>
      <button class="editBtn" data-index="${index}">Bearbeiten</button>
      <button class="deleteBtn" data-index="${index}">Löschen</button>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'));
      if (confirm("Erinnerung wirklich löschen?")) {
        deleteReminder(index);
      }
    });
  });

  document.querySelectorAll('.editBtn').forEach(btn => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'));
      editReminder(index);
    });
  });
}

function deleteReminder(index) {
  const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  reminders.splice(index, 1);
  localStorage.setItem('reminders', JSON.stringify(reminders));
  renderReminders();
}

function editReminder(index) {
  const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  const reminder = reminders[index];
  document.getElementById('name').value = reminder.name;
  document.getElementById('time').value = reminder.time;
  document.querySelectorAll('#days input').forEach(cb => {
    cb.checked = reminder.days.includes(parseInt(cb.value));
  });
  document.getElementById('editIndex').value = index;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function requestNotificationPermission() {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
}

function checkReminders() {
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);
  const today = now.getDay();

  const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  reminders.forEach(reminder => {
    if (reminder.time === timeStr && reminder.days.includes(today)) {
      new Notification(`Erinnerung: ${reminder.name}`);
      new Audio('reminder.mp3').play();
    }
  });
}

renderReminders();
setInterval(checkReminders, 60000);
