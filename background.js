// A global variable.
const extOptions = { loggingEnabled: true };

// Asynchronously retrieve data from storage.sync, then cache it.
chrome.storage.sync.get().then((items) => {
  // Copy the data retrieved from storage into extSettings.
  Object.assign(extOptions, items);
});

// Watch for changes to the user's options & apply them
chrome.storage.onChanged.addListener((changes, area) => {
  console.log('\n\n', 'on change has fired', changes, area, '\n\n');
  if (area === 'sync' && changes.loggingEnabled) {
    const loggingEnabled = Boolean(changes.loggingEnabled.newValue);
    console.log(`The logging has been turned ${loggingEnabled ? 'on' : 'off'}`);
    extOptions.loggingEnabled = loggingEnabled;
  }
});
