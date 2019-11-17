chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // tslint:disable-next-line:no-console
  console.log("background.ts request", request);

  if (request.method === "getPullReqInfo") {
    const queryInfo = {
      active: true,
      windowId: chrome.windows.WINDOW_ID_CURRENT
    };

    chrome.tabs.query(queryInfo, result => {
      const currentTab = result.shift();
      chrome.tabs.sendMessage(
        currentTab.id,
        { method: "getPullReqInfoFromContent" },
        res => {
          chrome.runtime.sendMessage({
            data: { pullReqInfo: res && res.pullReqInfo },
            method: "sendPullReqInfoToPopup"
          });
        }
      );
    });
  }

  if (request.method === "fetchWorkflow") {
    fetch("https://api.circleci.com/graphql-unstable", {
      body: JSON.stringify({
        query: `
        query {
          workflow(id: "${request.workflowID}") {
            status
            jobs {
              id
              name
              type
              status
            }
          }
        }
      `
      }),
      headers: {
        Accept: "application/json",
        Authorization: request.apiToken,
        "Content-Type": "application/json"
      },
      method: "POST",
      mode: "cors"
    })
      .then(res => res.json())
      .then(data => {
        chrome.runtime.sendMessage({
          data: { data: data.data, errors: data.errors || [] },
          method: "sendResponseOfFetchWorkflowToPopup"
        });
      });
  }

  if (request.method === "approveWorkflow") {
    fetch("https://api.circleci.com/graphql-unstable", {
      body: JSON.stringify({
        query: `
        mutation {
          approveJob(id: "${request.buildId}")
        }
      `
      }),
      headers: {
        Accept: "application/json",
        Authorization: request.apiToken,
        "Content-Type": "application/json"
      },
      method: "POST",
      mode: "cors"
    })
      .then(res => res.json())
      .then(data => sendResponse({ data: data.data }));
  }

  if (request.method === "cancelWorkflow") {
    fetch("https://api.circleci.com/graphql-unstable", {
      body: JSON.stringify({
        query: `
        mutation {
          cancelWorkflow(id: "${request.workflowID}")
        }
      `
      }),
      headers: {
        Accept: "application/json",
        Authorization: request.apiToken,
        "Content-Type": "application/json"
      },
      method: "POST",
      mode: "cors"
    })
      .then(res => res.json())
      .then(data => sendResponse({ data: data.data }));
  }

  if (request.method === "rerunWorkflow") {
    fetch("https://api.circleci.com/graphql-unstable", {
      body: JSON.stringify({
        query: `
        mutation {
          rerunWorkflow(id: "${request.workflowID}")
        }
      `
      }),
      headers: {
        Accept: "application/json",
        Authorization: request.apiToken,
        "Content-Type": "application/json"
      },
      method: "POST",
      mode: "cors"
    })
      .then(res => res.json())
      .then(data => sendResponse({ data: data.data }));
  }

  return true;
});
