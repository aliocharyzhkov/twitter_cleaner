// Saves options to chrome.storage
const saveOptions = () => {
  const loggingEnabled = document.getElementById('enable-logging').checked;
  const shouldHideTrending = document.getElementById('hide-trending').checked;

  chrome.storage.sync.set({ loggingEnabled, shouldHideTrending }, () => {
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
  chrome.storage.sync.get({ loggingEnabled: true, shouldHideTrending: true }, (items) => {
    document.getElementById('enable-logging').checked = items.loggingEnabled;
    document.getElementById('hide-trending').checked = items.shouldHideTrending;
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
