import * as React from 'react';

export interface Props {
  workflowStatus: string;
  onApprove: () => void;
  onRerun: () => void;
  onCancel: () => void;
}

const Button = ({ workflowStatus, onApprove, onRerun, onCancel }: Props) => {
  if (workflowStatus === 'ON_HOLD') {
    return (
      <button className={'button approve'} onClick={onApprove}>
        Approve
      </button>
    );
  }

  if (
    workflowStatus === 'CANCELED' ||
    workflowStatus === 'FAILED' ||
    workflowStatus === 'SUCCESS'
  ) {
    return (
      <button className="button rerun" onClick={onRerun}>
        Rerun
      </button>
    );
  }

  if (workflowStatus === 'RUNNING') {
    return (
      <button className="button cancel" onClick={onCancel}>
        Cancel
      </button>
    );
  }

  return <button disabled={true}>...</button>;
};
export default Button;
