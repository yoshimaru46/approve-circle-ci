chrome.tabs.onUpdated.addListener(
  (tabId, changeInfo) => {
    const regexp = new RegExp('^https:\/\/github.com\/[a-z0-9-_]*\/[a-z0-9-_]*\/pull\/[0-9]*$');

    if (changeInfo.url && regexp.test(changeInfo.url)) {
      chrome.tabs.sendMessage(tabId, {
        message: 'changeUrl',
      });
    }
  },
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.storage.local.get(null, (configs) => {
    if (request.method === 'getApiToken') {
      sendResponse({ data: configs.apiToken });
    }
  });

  if (request.method === 'fetchWorkflow') {
    fetch('https://api.circleci.com/graphql-unstable', {
      body: JSON.stringify({
        query: `
        query {
          workflow(id: "${request.workflowId}") {
            status
            jobs {
              id
              name
              type
            }
          }
        }
      `,
      }),
      headers: {
        Accept: 'application/json',
        Authorization: request.apiToken,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      mode: 'cors',
    })
      .then(res => res.json())
      .then(data => sendResponse({ data: data.data }));
  }

  if (request.method === 'approveWorkflow') {
    fetch('https://api.circleci.com/graphql-unstable', {
      body: JSON.stringify({
        query: `
        mutation {
          approveJob(id: "${request.buildId}")
        }
      `,
      }),
      headers: {
        Accept: 'application/json',
        Authorization: request.apiToken,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      mode: 'cors',
    })
      .then(res => res.json())
      .then(data => sendResponse({ data: data.data }));
  }
  return true;
});
