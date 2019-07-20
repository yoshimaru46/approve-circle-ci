import * as React from 'react';

import Button from '../components/Button';
import WorkflowID from '../components/WorkflowID';
import './Popup.scss';

interface Error {
  extensions: any;
  locations: any;
  message: string;
  path: string[];
}

interface HoldJob {
  id: string;
  name: string;
  type: string;
}

interface Jobs {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface State {
  apiToken: string;
  errors: Error[];
  holdJob: HoldJob;
  workflowID: string;
  workflowStatus: string;
  workflowJobs: Jobs[];
}

export default class Popup extends React.Component<{}, State> {
  public static getMessagesFromError(errors: Error[]) {
    return errors.map(e => e.message);
  }
  public timer: any;

  constructor(props) {
    super(props);

    this.state = {
      apiToken: '',
      errors: [],
      holdJob: undefined,
      workflowID: '',
      workflowJobs: [],
      workflowStatus: 'LOADING',
    };

    this.addListener = this.addListener.bind(this);
    this.getApiToken = this.getApiToken.bind(this);

    this.fetchWorkflow = this.fetchWorkflow.bind(this);
    this.approveWorkflow = this.approveWorkflow.bind(this);
    this.cancelWorkflow = this.cancelWorkflow.bind(this);
    this.rerunWorkflow = this.rerunWorkflow.bind(this);

    Popup.getMessagesFromError = Popup.getMessagesFromError.bind(this);
  }

  public addListener() {
    chrome.runtime.onMessage.addListener(request => {
      // tslint:disable-next-line:no-console
      console.log('Popup.tsx request', request);

      if (request.method === 'sendWorkflowIDToPopup') {
        this.setState({
          workflowID: request.data.workflowID || '',
        });
      }

      if (request.method === 'sendResponseOfFetchWorkflowToPopup') {
        if (request.data.errors.length === 0) {
          const holdJob = request.data.data.workflow.jobs.find(job => {
            return job.type === 'APPROVAL';
          });

          this.setState({
            holdJob,
            workflowJobs: request.data.data.workflow.jobs,
            workflowStatus: request.data.data.workflow.status,
          });
        } else {
          this.setState({
            errors: request.data.errors,
          });
        }
      }

      return true;
    });
  }

  public getApiToken() {
    chrome.runtime.sendMessage({ method: 'getApiToken' }, res => {
      this.setState({
        apiToken: res.data.apiToken,
      });
    });
  }

  public fetchWorkflow() {
    const { apiToken, workflowID } = this.state;

    if (apiToken === '' || workflowID === '') {
      return;
    }

    chrome.runtime.sendMessage(
      { apiToken, workflowID, method: 'fetchWorkflow' },
      res => {
        // tslint:disable-next-line:no-console
        console.log(res);
      },
    );
  }

  public approveWorkflow(apiToken, buildId: string) {
    chrome.runtime.sendMessage(
      { apiToken, buildId, method: 'approveWorkflow' },
      res => {
        // tslint:disable-next-line:no-console
        console.log(res);
      },
    );
  }

  public cancelWorkflow(apiToken, workflowID: string) {
    chrome.runtime.sendMessage(
      { apiToken, workflowID, method: 'cancelWorkflow' },
      res => {
        // tslint:disable-next-line:no-console
        console.log(res);
      },
    );
  }

  public rerunWorkflow(apiToken, workflowID: string) {
    chrome.runtime.sendMessage(
      { apiToken, workflowID, method: 'rerunWorkflow' },
      res => {
        // tslint:disable-next-line:no-console
        console.log(res);
      },
    );
  }

  public componentDidMount() {
    chrome.runtime.sendMessage({ method: 'popupMounted' });
    this.addListener();
    this.getApiToken();

    this.timer = setInterval(() => this.fetchWorkflow(), 500);
  }

  public componentWillUnmount() {
    this.timer = null;
  }

  public render() {
    const {
      apiToken,
      holdJob,
      workflowID,
      workflowJobs,
      workflowStatus,
      errors,
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

    if (errors.length > 0) {
      return (
        <div className="popupContainer">
          <div className="popupItem">
            <p>Errors:</p>
            {Popup.getMessagesFromError(errors)}
          </div>
        </div>
      );
    }

    const onApprove = () => this.approveWorkflow(apiToken, holdJob.id);
    const onRerun = () => this.rerunWorkflow(apiToken, workflowID);
    const onCancel = () => this.cancelWorkflow(apiToken, workflowID);

    const totalJobSize = workflowJobs.length;
    const successJobSize = workflowJobs.filter(element => (element.status === 'SUCCESS')).length;

    return (
      <div className="popupContainer">
        <div className="popupItem">
          <WorkflowID workflowID={workflowID} />
        </div>
        <div className="popupItem">
          <div className="workflowStatus">
            <p>
              {workflowStatus}
              {' '}
              {workflowJobs.length > 0 && (
                  <small>
                    {`(${successJobSize}/${totalJobSize})`}
                  </small>
                )}
            </p>
          </div>
        </div>
        <div className="popupItem">
          <Button
            workflowStatus={workflowStatus}
            onApprove={onApprove}
            onRerun={onRerun}
            onCancel={onCancel}
          />
        </div>
      </div>
    );
  }
}
