chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // tslint:disable-next-line:no-console
  console.log('background.ts request', request);

  if (request.method === 'popupMounted') {
    const queryInfo = {
      active: true,
      windowId: chrome.windows.WINDOW_ID_CURRENT,
    };

    chrome.tabs.query(queryInfo, (result) => {
      const currentTab = result.shift();
      const message = { method: 'getWorkflowID' };
      chrome.tabs.sendMessage(currentTab.id, message, (res) => {
        chrome.runtime.sendMessage({
          data: { workflowID: res.workflowID },
          method: 'sendWorkflowIDToPopup',
        });
      });
    });
  }

  chrome.storage.local.get(null, (configs) => {
    if (request.method === 'getApiToken') {
      sendResponse({ data: { apiToken: configs.apiToken || '' } });
    }
  });

  if (request.method === 'fetchWorkflow') {
    fetch('https://api.circleci.com/graphql-unstable', {
      body: JSON.stringify({
        query: `
        query {
          workflow(id: "${request.workflowID}") {
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
      .then((data) => {
        chrome.runtime.sendMessage({
          data: { data: data.data, errors: data.errors || [] },
          method: 'sendResponseOfFetchWorkflowToPopup',
        });
      });
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

  if (request.method === 'cancelWorkflow') {
    fetch('https://api.circleci.com/graphql-unstable', {
      body: JSON.stringify({
        query: `
        mutation {
          cancelWorkflow(id: "${request.workflowID}")
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

  if (request.method === 'rerunWorkflow') {
    fetch('https://api.circleci.com/graphql-unstable', {
      body: JSON.stringify({
        query: `
        mutation {
          rerunWorkflow(id: "${request.workflowID}")
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
