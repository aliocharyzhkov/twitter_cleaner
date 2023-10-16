// Saves options to chrome.storage
const saveOptions = () => {
  const loggingEnabled = document.getElementById('enable-logging').checked;

  chrome.storage.sync.set({ loggingEnabled: loggingEnabled }, () => {
    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(() => {
      status.textContent = '';
    }, 750);
  });
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get({ loggingEnabled: true }, (items) => {
    document.getElementById('enable-logging').checked = items.loggingEnabled;
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
