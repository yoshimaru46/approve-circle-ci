import * as React from "react";

import Label from "@bit/semantic-org.semantic-ui-react.label";
import Loader from "@bit/semantic-org.semantic-ui-react.loader";

export interface Props {
  workflowStatus: string;
}

const WorkflowStatus = ({ workflowStatus }: Props) => {
  const renderWorkflowStatus = status => {
    if (status === "LOADING") {
      // @ts-ignore
      return (
        <Loader
          active={true}
          inline={true}
          size="tiny"
          style={{ marginLeft: "24px" }}
        />
      );
    }

    let color = "";
    switch (status) {
      case "ON_HOLD":
        color = "grey";
        break;
      case "CANCELED":
        color = "orange";
        break;
      case "FAILD":
        color = "red";
        break;
      case "RUNNING":
        color = "blue";
        break;
      case "SUCCESS":
        color = "green";
        break;
      default:
    }

    return (
      // @ts-ignore
      <Label horizontal={true} color={color}>
        {status}
      </Label>
    );
  };

  return (
    <>
      <Label horizontal={true}>Workflow Status</Label>
      {` `}
      {renderWorkflowStatus(workflowStatus)}
    </>
  );
};

export default WorkflowStatus;
