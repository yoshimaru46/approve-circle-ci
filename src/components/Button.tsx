import * as React from "react";

import Button from "@bit/semantic-org.semantic-ui-react.button";

export interface Props {
  workflowStatus: string;
  onApprove: () => void;
  onRerun: () => void;
  onCancel: () => void;
}

const WorkFlowButton = ({
  workflowStatus,
  onApprove,
  onRerun,
  onCancel
}: Props) => {
  if (workflowStatus === "ON_HOLD") {
    return (
      <Button color="green" size="tiny" onClick={onApprove}>
        Approve
      </Button>
    );
  }

  if (
    workflowStatus === "CANCELED" ||
    workflowStatus === "FAILED" ||
    workflowStatus === "SUCCESS"
  ) {
    return (
      <Button color="blue" size="tiny" onClick={onRerun}>
        Rerun
      </Button>
    );
  }

  if (workflowStatus === "RUNNING" || workflowStatus === "FAILING") {
    return (
      <Button color="orange" size="tiny" onClick={onCancel}>
        Cancel
      </Button>
    );
  }

  return (
    // @ts-ignore
    <Button loading={true} size="tiny">
      Loading
    </Button>
  );
};
export default WorkFlowButton;
