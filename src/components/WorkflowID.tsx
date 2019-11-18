import * as React from "react";

import Loader from "@bit/semantic-org.semantic-ui-react.loader";
import Label from "@bit/semantic-org.semantic-ui-react.label";

export interface Props {
  workflowID: string;
}

const WorkflowID = ({ workflowID }: Props) => {
  const renderWorkflowID = id => {
    if (id) {
      return (
        <Label horizontal={true} color="grey">
          <a
            href={`https://circleci.com/workflow-run/${workflowID}`}
            target="_blank"
          >
            {workflowID.slice(0, 10)}...
          </a>
        </Label>
      );
    }

    return <Loader active inline size="tiny" style={{ marginLeft: "32px" }} />;
  };

  return (
    <>
      <Label horizontal>Workflow ID</Label>
      {` `}
      {renderWorkflowID(workflowID)}
    </>
  );
};

export default WorkflowID;
