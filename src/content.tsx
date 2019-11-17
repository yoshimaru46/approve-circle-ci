function getPullReqInfo() {
  const branchName = document.querySelector(
    "#partial-discussion-header > div.TableObject.gh-header-meta > " +
      "div.TableObject-item.TableObject-item--primary > " +
      "span.commit-ref.css-truncate.user-select-contain.expandable.head-ref > a > span"
  ).textContent;

  return {
    branchName,
    organizationName: window.location.href.split("/")[3],
    projectName: window.location.href.split("/")[4]
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "getPullReqInfoFromContent") {
    sendResponse({ pullReqInfo: getPullReqInfo() });
  }
  return true;
});
