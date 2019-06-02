import * as React from 'react';

interface Props {
  workflowId: string;
}

interface State {
  apiToken: string;
  workflowStatus: string;
  holdJob: any;
}

export default class ApproveButton extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      apiToken: '',
      holdJob: undefined,
      workflowStatus: 'LOADING',
    };

    this.getApiToken = this.getApiToken.bind(this);
    this.fetchHoldJob = this.fetchHoldJob.bind(this);
    this.approveWorkflow = this.approveWorkflow.bind(this);
  }

  public getApiToken() {
    chrome.runtime.sendMessage({ method: 'getApiToken' }, (res) => {
      this.setState({
        // @ts-ignore
        apiToken: res.data,
      });
    });
  }

  public fetchHoldJob() {
    const {
      apiToken,
    } = this.state;

    const {
      workflowId,
    } = this.props;

    if (workflowId === '') {
      return;
    }

    chrome.runtime.sendMessage({ apiToken, workflowId, method: 'fetchWorkflow' }, (res) => {
      const holdJob = res.data.workflow.jobs.find((job) => {
        return job.type === 'APPROVAL';
      });

      this.setState({
        holdJob,
        workflowStatus: res.data.workflow.status,
      });
    });
  }

  public approveWorkflow(buildId: string) {
    const {
      apiToken,
    } = this.state;

    chrome.runtime.sendMessage({ apiToken, buildId, method: 'approveWorkflow' }, (res) => {
      // tslint:disable-next-line:no-console
      console.log(res);
    });
  }

  public componentDidMount() {
    this.getApiToken();
    setTimeout(
      this.fetchHoldJob, 100,
    );

  }

  public render() {
    const {
      workflowId,
    } = this.props;

    const {
      workflowStatus,
      holdJob,
    } = this.state;

    if (!(workflowId && holdJob && workflowStatus === 'ON_HOLD')) {
      return null;
    }

    // console.log('workflow id', workflowId);
    // console.log('holdJob id', holdJob.id);

    return (
      <button
        className="btn btn-sm ml-3"
        onClick={() => this.approveWorkflow(holdJob.id)}
      >
        <svg className="octicon octicon-check mx-auto d-block text-green" viewBox="0 0 12 16" version="1.1" width="12"
             height="16" aria-hidden="true">
          <path fillRule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path>
        </svg>
      </button>
    );
  }
}
