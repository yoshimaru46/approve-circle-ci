import * as React from 'react';
import { render } from 'react-dom';
import ApproveButton from './circle-ci/ApproveButton'

function getWorkflowId() {
  const partialPullMerging = document.querySelector('#partial-pull-merging');

  if (partialPullMerging == null) {
    return;
  }

  const statusActions = partialPullMerging.getElementsByClassName('status-actions');

  let workflowUrl = '';

  Array.from(statusActions).forEach(a => {
    if (
      a.getAttribute('href')
      && a.getAttribute('href').match(/workflow-run.+?\?/)
    ) {

      workflowUrl = new URL(a.getAttribute('href')).pathname;

      const button = document.createElement('span');
      button.id = 'circle-ci-approve-button';

      a.parentNode.appendChild(button);
    }
  });

  return workflowUrl.split('/')[2];
}

function main() {
  const workflowId = getWorkflowId();

  if (workflowId === undefined) {
    return;
  }

  render(
    <ApproveButton workflowId={workflowId}/>,
    document.getElementById('circle-ci-approve-button'),
  );
}

chrome.runtime.onMessage.addListener(
  (request) => {
    if (request.message === 'changeUrl') {
      // TODO: wait DOM element
      setTimeout(main, 1500);
    }
  });

main();
