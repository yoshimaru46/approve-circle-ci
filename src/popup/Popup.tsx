import * as React from 'react';
import './Popup.scss';

// tslint:disable-next-line:interface-name
interface State {
  apiToken: string;
  holdJob: {
    id: string,
    name: string,
    type: string,
  };
  workflowID: string;
  workflowStatus: string;
}

export default class Popup extends React.Component<{}, State> {
  constructor(props) {
    super(props);

    this.state = {
      apiToken: '',
      holdJob: undefined,
      workflowID: '',
      workflowStatus: 'LOADING',
    };

    this.addListener = this.addListener.bind(this);
    this.getApiToken = this.getApiToken.bind(this);
    this.fetchWorkflow = this.fetchWorkflow.bind(this);
    this.approveWorkflow = this.approveWorkflow.bind(this);
    this.cancelWorkflow = this.cancelWorkflow.bind(this);
    this.rerunWorkflow = this.rerunWorkflow.bind(this);
  }

  public addListener() {
    chrome.runtime.onMessage.addListener((request) => {
      // tslint:disable-next-line:no-console
      console.log('Popup.tsx request', request);

      if (request.method === 'sendWorkflowIDToPopup') {
        this.setState({
          workflowID: request.data.workflowID,
        });
      }

      if (request.method === 'sendResponseOfFetchWorkflowToPopup') {
        const holdJob = request.data.data.workflow.jobs.find((job) => {
          return job.type === 'APPROVAL';
        });

        this.setState({
          holdJob,
          workflowStatus: request.data.data.workflow.status,
        });
      }

      return true;
    });
  }

  public getApiToken() {
    chrome.runtime.sendMessage({ method: 'getApiToken' }, (res) => {
      this.setState({
        apiToken: res.data.apiToken,
      });
    });
  }

  public fetchWorkflow(apiToken, workflowID) {
    chrome.runtime.sendMessage({ apiToken, workflowID, method: 'fetchWorkflow' }, (res) => {
      // tslint:disable-next-line:no-console
      console.log(res);
    });
  }

  public approveWorkflow(apiToken, buildId: string) {
    chrome.runtime.sendMessage({ apiToken, buildId, method: 'approveWorkflow' }, (res) => {
      // tslint:disable-next-line:no-console
      console.log(res);
    });
  }

  public cancelWorkflow(apiToken, workflowID: string) {
    chrome.runtime.sendMessage({ apiToken, workflowID, method: 'cancelWorkflow' }, (res) => {
      // tslint:disable-next-line:no-console
      console.log(res);
    });
  }

  public rerunWorkflow(apiToken, workflowID: string) {
    chrome.runtime.sendMessage({ apiToken, workflowID, method: 'rerunWorkflow' }, (res) => {
      // tslint:disable-next-line:no-console
      console.log(res);
    });
  }

  public componentDidMount() {
    chrome.runtime.sendMessage({ method: 'popupMounted' });
    this.addListener();
    this.getApiToken();
  }

  public render() {
    const {
      apiToken,
      holdJob,
      workflowID,
      workflowStatus,
    } = this.state;

    if (workflowID === '') {
      return (
        <div className="popupContainer">
          <div className="popupItem">
            <p>Can not find WorkflowID</p>
          </div>
        </div>
      );
    }

    if (apiToken === '') {
      return (
        <div className="popupContainer">
          <div className="popupItem">
            <p>Please set api token from option page</p>
          </div>
        </div>
      );
    }

    if (holdJob === undefined || workflowStatus === 'LOADING') {
      this.fetchWorkflow(apiToken, workflowID);

      return (
        <div className="popupContainer">
          <div className="popupItem">
            <p>LOADING...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="popupContainer">
        <div className="popupItem">
          <div className="workflowID">
            <p>Workflow ID:
              <a
                href={`https://circleci.com/workflow-run/${workflowID}`}
                target="_blank"
              >
                {workflowID.slice(0, 5)}...
              </a>
            </p>
          </div>
        </div>
        <div className="popupItem">
          <div className="workflowStatus">
            {workflowStatus}
          </div>
        </div>
        <div className="popupItem">
          {workflowStatus === 'ON_HOLD' && (
            <button
              onClick={() => this.approveWorkflow(apiToken, holdJob.id)}
            >
              Approve
            </button>
          )}
          {
            (
              workflowStatus === 'CANCELED' ||
              workflowStatus === 'SUCCESS'
            ) && (
              <button
                onClick={() => this.rerunWorkflow(apiToken, workflowID)}
              >
                Rerun
              </button>
            )}
          {workflowStatus === 'RUNNING' && (
            <button
              onClick={() => this.cancelWorkflow(apiToken, workflowID)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }
}
