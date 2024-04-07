export function createObserver(node, callback) {
  // Options for the observer (which mutations to observe)
  const config = { childList: true, subtree: true };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(node, config);
}

export function isPornSpam(text) {
  if (!text) {
    return false;
  }
  const plainText = text.replace(/[^a-zA-Z0-9 ]/g, '');
  return (
    /in (my |the )?bio/i.test(plainText) ||
    /(Content warning Nudity)|pussy|nudes/i.test(plainText) ||
    // If Halfwidth and Fullwidth Forms char set is used it's almost cenrainly porn spam.
    /[\u{ff01}-\u{ff5e}]/gu.test(text) ||
    // Same for Enclosed Alphanumeric Supplement char set
    /[\u{1f100}-\u{1f1ff}]/gu.test(text)
  );
}
