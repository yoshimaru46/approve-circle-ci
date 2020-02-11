function getPullReqInfo() {
  const branchNameElement = document.querySelector('div.file-navigation > details.branch-select-menu > summary');
  const branchNameElementTitle = branchNameElement.getAttribute('title');
  
  const branchName = branchNameElementTitle.indexOf(' ') === -1 ? 
        branchNameElementTitle : branchNameElement.querySelector('span.css-truncate-target').textContent;

  return {
    branchName,
    organizationName: window.location.pathname.split("/")[1],
    projectName: window.location.pathname.split("/")[2]
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "getPullReqInfoFromContent") {
    sendResponse({ pullReqInfo: getPullReqInfo() });
  }
  return true;
});
