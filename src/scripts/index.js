import { createObserver, isPornSpam } from './utils.js';

let discoverMoreNode;
const extOptions = { loggingEnabled: true, shouldHideTrending: true, shouldHidePorn: false };

function log(message) {
  if (extOptions.loggingEnabled) {
    console.log('\n\n', message, '\n\n');
  }
}

function hideTrendingItems(trendingSectionNode) {
  if (!trendingSectionNode) {
    log('Warning: "Trending" section not detected');
    return;
  }
  let curChildren = trendingSectionNode.children;
  let realChildren = null;
  while (curChildren && !realChildren) {
    if (curChildren.length > 2) {
      realChildren = curChildren;
    } else {
      curChildren = curChildren[0].children;
    }
  }
  if (!realChildren) {
    log('Warning: "Trending" section not detected');
    return;
  }
  log('Making sure "Trending" section is hidden...');
  Array.from(realChildren).forEach((child, index) => {
    if ((extOptions.shouldHideTrending && index > 0) || index > 3) {
      if (child.style.getPropertyValue('display') !== 'none') {
        child.style.cssText = 'display: none';
        log(
          `"Trending" section block No. ${index + 1}` +
            (child.textContent ? ` containing the following text "${child.textContent}"` : '') +
            ` has been hidden.`
        );
      }
    }
  });
}

function createObserveSidebarCallback(sidebarNode) {
  return function (mutationList, observer) {
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        hideTrendingItems(sidebarNode.querySelector('[aria-label="Trending"]'));
      }
    }
  };
}

/**
 * Hides all siblings of the discoverMoreNode node to the right.
 */
function hideDiscoverMoreTweets() {
  let nextNode = discoverMoreNode.nextSibling;
  // We're using this var to prevent infinite loops.
  let iterationCount = 0;
  while (nextNode && iterationCount < 100) {
    nextNode.style.cssText = 'display: none;';
    nextNode = nextNode.nextSibling;
    iterationCount += 1;
  }
  log(`
      "Discover more" section has been hidden!
      Total of ${iterationCount}, tweets have been hidden.
    `);
}

function observeRoot(mutationList, observer) {
  for (const mutation of mutationList) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        /**
         * Hide garbage tweets.
         */
        const testIdAttr = node.attributes.getNamedItem('data-testId');
        if (testIdAttr && testIdAttr.value === 'cellInnerDiv') {
          // Hide Promotional tweets.
          if (node.innerText && node.innerText.includes('Promoted')) {
            node.style.cssText = 'display: none;';

            log(`Promoted tweet has been hidden: ${node.innerText}`);
          }

          // Hide Ad tweets.
          if (node.querySelector('[data-testId="placementTracking"]')) {
            node.style.cssText = 'display: none;';

            log(`Ad tweet has been hidden: ${node.innerText}`);
          }

          // Hide "Discover more" node.
          if (
            node.innerText &&
            (node.innerText.trim().startsWith('Discover more') ||
              node.innerText.trim().startsWith('More Tweets'))
          ) {
            node.style.cssText = 'display: none;';
            discoverMoreNode = node;
          }

          // Hide "Discover more" tweets.
          //
          // If the "Discover more" node has already been added,
          // some related tweets might have been added as well.
          // So we need to call hideDiscoverMoreTweets() right away.
          // However, other tweets might be loaded asynchronously,
          // to hide them, we're going to call hideDiscoverMoreTweets()
          // after every new tweet.
          //
          // Note that since mutaion.addedNotes contains at most one node,
          // calling  hideDiscoverMoreTweets() in a loop is not a problem.
          //
          // Also, note that we don't reset the discoverMoreNode variable
          // to null or undefined. Once it's set, its value can only change
          // to another node. Therefore, we need to check that the node
          // is still connected to the DOM.
          if (discoverMoreNode && discoverMoreNode.isConnected) {
            hideDiscoverMoreTweets();
          }

          // Hide empty nodes
          if (node.innerText && node.innerText.trim() === '') {
            node.style.cssText = 'display: none;';
            log(`An empty block has been hidden: ${node.innerText}`);
          }

          // Hide "Who to follow" heading node
          if (node.innerText && node.innerText.includes('Who to follow')) {
            node.style.cssText = 'display: none;';
            log(`The "Who to follow" heading has been hidden: ${node.innerText}`);
          }

          // Hide "Who to follow" tweet
          if (
            false ===
              /\/(verified_followers|followers_you_follow|followers|following)$/.test(
                window.location.pathname
              ) &&
            node.innerText &&
            node.innerText.includes('Follow') &&
            node.querySelector('[aria-label^="Follow @"]')
          ) {
            node.style.cssText = 'display: none;';
            log(`The "Who to follow" tweet has been hidden: ${node.innerText}`);
          }

          // Hide porn spam bots
          if (extOptions.shouldHidePorn && isPornSpam(node.innerText)) {
            node.style.cssText = 'display: none;';
            log(`The pron spam bot tweet has been hidden: ${node.innerText}`);
          }

          // Hide "See more" link
          if (
            node.innerText &&
            node.innerText.includes('Show more') &&
            node.querySelector('a[href^="/i/connect_people"]')
          ) {
            node.style.cssText = 'display: none;';
            log(`The "See more" link has been hidden: ${node.innerText}`);
          }

          // Hide "Subscribe" CTA
          if (
            node.innerText &&
            ((node.innerText.includes('Subscribe') &&
              node.querySelector('a[href^="/i/premium_sign_up"]')) ||
              (node.innerText.includes('X Pro') &&
                node.querySelector('a[href="https://pro.x.com/"]')))
          ) {
            node.style.cssText = 'display: none;';
            log(`The "Subscribe" CTA has been hidden: ${node.innerText}`);
          }
        }

        /**
         * Hide "Trending" section.
         */

        // 1. When it has been added on the first page load.
        const sidebarOnPageLoad = node.parentElement;
        if (
          sidebarOnPageLoad &&
          sidebarOnPageLoad.attributes.getNamedItem('data-testId') &&
          sidebarOnPageLoad.attributes.getNamedItem('data-testId').value === 'sidebarColumn'
        ) {
          // Note, since the sidebar is added only once on the initial load,
          // it's safe to create an observer here. Otherwise we would need a flag var
          // to make sure that the observer is created only once.
          createObserver(sidebarOnPageLoad, createObserveSidebarCallback(sidebarOnPageLoad));

          log('The Sidebar column has been added on page load.');
        }

        // 2. When it has been added on location change.
        const sidebarOnLocationChange =
          node.children && node.children[0] && node.children[0].children[1];
        if (
          sidebarOnLocationChange &&
          sidebarOnLocationChange.attributes.getNamedItem('data-testId') &&
          sidebarOnLocationChange.attributes.getNamedItem('data-testId').value === 'sidebarColumn'
        ) {
          // Handle the case when the whole "Trending" section is added synchronously.
          hideTrendingItems(sidebarOnLocationChange.querySelector('[aria-label="Trending"]'));

          createObserver(
            sidebarOnLocationChange,
            createObserveSidebarCallback(sidebarOnLocationChange)
          );

          log('The Sidebar column has been added on location change');
        }

        // Hide aside blocks that load asynchronously.
        if (node.nodeName === 'ASIDE') {
          node.style.cssText = 'display: none;';
          log('<aside> element has been hidden');
        }
      });
    }
  }
}

// Asynchronously retrieve data from storage.sync, then cache it.
chrome.storage.sync.get().then((options) => {
  Object.assign(extOptions, options);

  const rootNode = document.getElementById('react-root');
  createObserver(rootNode, observeRoot);

  // Prevent the "Trending" section from reappearing on window resize events.
  addEventListener('resize', () => {
    setTimeout(() => hideTrendingItems(document.querySelector('[aria-label="Trending"]')), 0);
  });
});

// Watch for changes to the user's options & apply them
chrome.storage.onChanged.addListener((changes, area) => {
  // console.log('\n\n', 'on change has fired', changes, area, '\n\n');

  if (area === 'sync' && changes.loggingEnabled) {
    const loggingEnabled = Boolean(changes.loggingEnabled.newValue);
    console.log(`'Enable logging' option is ${loggingEnabled ? 'on' : 'off'}`);
    extOptions.loggingEnabled = loggingEnabled;
  }

  if (area === 'sync' && changes.shouldHideTrending) {
    const shouldHideTrending = Boolean(changes.shouldHideTrending.newValue);
    console.log(`'Hide "Trending" section' option if ${shouldHideTrending ? 'on' : 'off'}.`);
    extOptions.shouldHideTrending = shouldHideTrending;
  }

  if (area === 'sync' && changes.shouldHidePorn) {
    const shouldHidePorn = Boolean(changes.shouldHidePorn.newValue);
    console.log(`'Hide pron spam bots' option is ${shouldHidePorn ? 'on' : 'off'}.`);
    extOptions.shouldHidePorn = shouldHidePorn;
  }
});
