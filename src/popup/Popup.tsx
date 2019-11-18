import * as React from "react";

import Button from "../components/Button";
import WorkflowID from "../components/WorkflowID";
import "./Popup.scss";

import { Error } from "../interfaces/Error";
import { HoldJob } from "../interfaces/HoldJob";
import { Jobs } from "../interfaces/Jobs";

interface State {
  apiToken: string;
  errors: Error[];
  holdJob: HoldJob;
  workflowID: string;
  workflowStatus: string;
  workflowJobs: Jobs[];
  pullReqInfo: any; // TODO
}

export default class Popup extends React.Component<{}, State> {
  public static getMessagesFromError(errors: Error[]) {
    return errors.map(e => e.message);
  }

  public fetchWorkflowTimer: any;
  public fetchWorkflowIDTimer: any;

  constructor(props) {
    super(props);

    this.state = {
      apiToken: "",
      errors: [],
      holdJob: undefined,
      pullReqInfo: {},
      workflowID: "",
      workflowJobs: [],
      workflowStatus: "LOADING"
    };

    this.addListener = this.addListener.bind(this);
    this.getApiToken = this.getApiToken.bind(this);
    this.getPullReqInfo = this.getPullReqInfo.bind(this);

    this.fetchWorkflow = this.fetchWorkflow.bind(this);
    this.fetchWorkflowID = this.fetchWorkflowID.bind(this);

    this.approveWorkflow = this.approveWorkflow.bind(this);
    this.cancelWorkflow = this.cancelWorkflow.bind(this);
    this.rerunWorkflow = this.rerunWorkflow.bind(this);

    Popup.getMessagesFromError = Popup.getMessagesFromError.bind(this);
  }

  public addListener() {
    chrome.runtime.onMessage.addListener(request => {
      // tslint:disable-next-line:no-console
      console.log("Popup.tsx request", request);

      if (request.method === "sendPullReqInfoToPopup") {
        this.setState({
          pullReqInfo: request.data.pullReqInfo
        });
      }

      if (request.method === "sendResponseOfFetchWorkflowToPopup") {
        if (request.data.errors.length === 0) {
          const holdJob = request.data.data.workflow.jobs.find(job => {
            return job.type === "APPROVAL";
          });

          this.setState({
            holdJob,
            workflowJobs: request.data.data.workflow.jobs,
            workflowStatus: request.data.data.workflow.status
          });
        } else {
          this.setState({
            errors: request.data.errors
          });
        }
      }

      return true;
    });
  }

  public getApiToken() {
    chrome.storage.local.get(null, configs => {
      this.setState({ apiToken: configs.apiToken });
    });
  }

  public getPullReqInfo() {
    chrome.runtime.sendMessage({ method: "getPullReqInfo" });
  }

  public fetchWorkflow() {
    const { apiToken, workflowID } = this.state;

    if (!(apiToken && workflowID)) {
      throw new Error("[fetchWorkflow]: Parameter Error");
    }

    chrome.runtime.sendMessage({
      apiToken,
      workflowID,
      method: "fetchWorkflow"
    });
  }

  public fetchWorkflowID() {
    const {
      pullReqInfo: { branchName, organizationName, projectName }
    } = this.state;

    if (!(branchName && organizationName && projectName)) {
      throw new Error("[fetchWorkflowID]: Parameter Error");
    }

    fetch("https://circleci.com/query-api", {
      body: `["^ ","~:type","~:get-branch-workflow-ids","~:params",["^ ","~:organization/vcs-type","~:github","~:organization/name","${organizationName}","~:project/name","${projectName}","~:branch/name","${branchName}","~:opts",["^ ","~:offset",0,"~:limit",1]]]`,
      credentials: "include",
      headers: {
        accept: "application/transit+json",
        "accept-language": "en-US,en;q=0.9,ja;q=0.8",
        "content-type": "application/transit+json; charset=UTF-8",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
      },
      method: "POST",
      mode: "cors"
    })
      .then(res => res.json())
      .then(data => {
        this.setState({
          workflowID: data[4][0]
        });
      });
  }

  public approveWorkflow(apiToken, buildId: string) {
    chrome.runtime.sendMessage({
      apiToken,
      buildId,
      method: "approveWorkflow"
    });
  }

  public cancelWorkflow(apiToken, workflowID: string) {
    chrome.runtime.sendMessage({
      apiToken,
      workflowID,
      method: "cancelWorkflow"
    });
  }

  public rerunWorkflow(apiToken, workflowID: string) {
    chrome.runtime.sendMessage({
      apiToken,
      workflowID,
      method: "rerunWorkflow"
    });
  }

  public componentDidMount() {
    this.addListener();
    this.getApiToken();
    this.getPullReqInfo();

    setTimeout(() => this.fetchWorkflowID(), 500);
    setTimeout(() => this.fetchWorkflow(), 1000);

    this.fetchWorkflowIDTimer = setInterval(() => this.fetchWorkflowID(), 1000);
    this.fetchWorkflowTimer = setInterval(() => this.fetchWorkflow(), 1000);
  }

  public componentWillUnmount() {
    this.fetchWorkflowTimer = null;
    this.fetchWorkflowIDTimer = null;
  }

  public render() {
    const {
      apiToken,
      holdJob,
      workflowID,
      workflowJobs,
      workflowStatus,
      errors
    } = this.state;

    if (!apiToken) {
      return (
        <div className="popupContainer">
          <div className="popupItem">
            <p>Please set api token</p>
            <p>from Options page</p>
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
    const successJobSize = workflowJobs.filter(
      element => element.status === "SUCCESS"
    ).length;

    return (
      <div className="popupContainer">
        <div className="popupItem">
          <WorkflowID workflowID={workflowID} />
        </div>
        <div className="popupItem">
          <div className="workflowStatus">
            <p>
              {workflowStatus}{" "}
              {workflowJobs.length > 0 && (
                <small>{`(${successJobSize}/${totalJobSize})`}</small>
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
