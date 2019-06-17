function getWorkflowID() {
  const partialPullMerging = document.querySelector('#partial-pull-merging');

  if (partialPullMerging == null) {
    return '';
  }

  const statusActions = partialPullMerging.getElementsByClassName('status-actions');

  let workflowUrl = '';

  Array.from(statusActions).forEach(a => {
    if (
      a.getAttribute('href')
      && a.getAttribute('href').match(/workflow-run.+?\?/)
    ) {

      workflowUrl = new URL(a.getAttribute('href')).pathname;
    }
  });

  return workflowUrl.split('/')[2];
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === 'getWorkflowID') {
    sendResponse({ workflowID: getWorkflowID() });
  }
  return true;
});
