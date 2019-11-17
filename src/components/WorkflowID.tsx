import * as React from "react";

export interface Props {
  workflowID: string;
}

const WorkflowID = ({ workflowID }: Props) => {
  const renderWorkflowID = id => {
    if (id) {
      return (
        <a
          href={`https://circleci.com/workflow-run/${workflowID}`}
          target="_blank"
        >
          {workflowID.slice(0, 5)}...
        </a>
      );
    }
    return <span>...</span>;
  };

  return (
    <div className="workflowID">
      <p>
        Workflow ID:
        {` `}
        {renderWorkflowID(workflowID)}
      </p>
    </div>
  );
};

export default WorkflowID;
