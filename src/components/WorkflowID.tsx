import * as React from 'react';

export interface Props {
  workflowID: string;
}

const WorkflowID = ({ workflowID }: Props) => (
  <div className="workflowID">
    <p>
      Workflow ID:
      <a
        href={`https://circleci.com/workflow-run/${workflowID}`}
        target="_blank"
      >
        {workflowID.slice(0, 5)}...
      </a>
    </p>
  </div>
);

export default WorkflowID;
