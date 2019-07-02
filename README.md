# simple-erp-integration
Drive MachineMetrics with job information from your ERP.

# Getting Started

Clone the repository and run `npm i` in the root directory. See the instructions below for acquiring an API key, configuring your environment and machines for ERP integration, and use the examples at the end of this ReadMe as a starting point. For a full list of supported arguments, see the full API documentation for dispatching jobs in MachineMetrics at the following links:

https://developers.machinemetrics.com/reference#erpjobdispatchstart
https://developers.machinemetrics.com/reference#erpjobdispatchid
https://developers.machinemetrics.com/reference#erpjobdispatchstop

# Writing a Custom ERP Integration

This document details the steps required to implement a custom ERP integration with MachineMetrics using the Job Dispatch APIs documented at [https://developers.machinemetrics.com](https://developers.machinemetrics.com/).

This document is intended for software developers that have a deep understanding of a particular ERP system that they would like to integrate with MachineMetrics. The Job Dispatch APIs are available as HTTPS endpoints using JSON as the payload to transfer information.

## The Flow

The purpose of the Job Dispatch APIs are to allow systems outside of MachineMetrics to start and stop jobs within MachineMetrics. This approach allows ERP systems to push job information into MachineMetrics and indicate when jobs are run, while providing a way to leverage the data MachineMetrics collects from the machines and operators to make data gathering easier and more accurate.

All communication between the integration and MachineMetrics is out-bound. MachineMetrics does not communicate directly with the integration software. The integration sends messages to the MachineMetrics Cloud indicating that some action was taken. The integration is driven by 3 primary actions: Start Job, Job is Stopping, Stop Job.

### Start a Job

When a labor activity is started via the ERP/MES, the integration software must send a message to the MachineMetrics Cloud. Information that is passed along relates to the name of the job or workorder, name of the part, the name of the operation, name of the lot, the expected setup duration, the production standards (cycle time), the type of labor activity (production or setup), and a labor activity identifier which is used in later steps. Additionally, the Resource ID of the machine that the job is being started on is also passed along.

When MachineMetrics receives this message, it looks up any existing jobs based on the name/part/operation/lot provided, updates any information that may have changed, creates a new job if none exist, and starts the job (creates a job run) for that job on the target machine.

### Job is Stopping (optional)

When a labor activity is stopped via the ERP/MES, a message can be sent to MachineMetrics before the user is presented with a screen to stop the job. This message includes the labor activity identifier which was sent when the job was first started.

When received, MachineMetrics looks up the information for the run associated with that labor activity identifier, determines the number of parts produced and the number of parts rejected and returns them. This information can be used to populate fields on the screen presented to the user for confirmation before stopping the job in the ERP/MES. At this point, no changes are made in MachineMetrics about the job. This endpoint is only designed for integration to get the total number of parts produced and rejected in the job run.

### Stop Job

After the operator has verified the completed and rejected parts fields and marked the labor activity as stopped, the integration must send a final message to the MachineMetrics Cloud indicating that the job is stopped.

When MachineMetrics receives this message, it looks up the job run based on the provided labor activity identifier and sets the end date based on the information provided by the API call.

## Limitations

When a machine is configured for Automatic Start in MachineMetrics, jobs cannot also be started using the tablet interface. Since all communication between the ERP integration and MachineMetrics is driven by the integration software, MachineMetrics cannot tell the integration software that a job was started in MachineMetrics. To avoid issues with data synchronization, starting and stopping jobs is limited to just being available through the integration when Automatic Start is set to `Start job based on MES` on a given machine.

There are cases where some machines in a facility cannot be started or stopped via the ERP/MES. Some examples of these machines would be those that run multiple parts simultaneously. MachineMetrics is limited to running just one job at a time on a piece of equipment. Because of this, you should leave the `Automatic Start` set to `Disabled` for these machines so operators can start and stop jobs via the tablet interface and the integration is not used.

## Configuring MachineMetrics for ERP Integration

Before you get started, contact customer support to enable ERP on your company in MachineMetrics. Additionally, a sandbox environment can be configured for testing purposes. With ERP enabled on your company in MachineMetrics, a new field is made available on the machine configuration form called `ERP Machine ID`. It is often the case that the name of the machine in MachineMetrics is different than the Resource ID of the machine in your ERP. To allow MachineMetrics to find a machine that a job is being started on in the MES, enter the Resource ID of the machine into the `ERP Machine ID` field on the machine form in MachineMetrics.

Additionally, a new option is made available in the `Automatic Start` dropdown menu called `Start job based on MES`. This option must be selected on any machines that you want the integration to start/stop jobs in MachineMetrics when those jobs are started/stopped in the MES.

## Authentication

A token is required to authorize your requests to the MachineMetrics APIs. To get an API Key, go to [app.machinemetrics.com/account/api-keys](http://app.machinemetrics.com/account/api-keys). The “erp” scope is required for this API endpoint, so be sure to select that scope when creating your key. The key will only be presented to you once so make sure you copy it and store it in a safe place. Also, the key acts like a password. While it’s limited in what it can do, anyone who has access to the API key will be able to start and stop jobs in MachineMetrics on your behalf.

## Example

The following example can be found on Github at https://github.com/machinemetrics/simple-erp-integration. Since every ERP integration will be different and will require a deep understanding of the ERP being integrated, this example is a simple command-line application that allows you to start and stop jobs in MachineMetrics using the Job Dispatch API endpoints. This works as a starting point to provide an understanding of how the API endpoints work and what arguments should be passed.

```
> node index.js --api-key API_KEY --action start --erpJobOperationRunId 8 --erpMachineId TEST --jobName job1 --partName part1 --cycletime 5000
< Job Started Successfully

> node index.js --api-key API_KEY --action info --erpJobOperationRunId 8
< Started: 2019-07-02T21:18:11.000Z
< Ended: 2019-07-02T21:24:27.000Z
< Total Parts: 0
< Good Parts: 0
< Scrap Parts: 0
< Non-Conforming Parts: 0

> node index.js --api-key API_KEY --action stop --erpJobOperationRunId 8
< Job Stopped Successfully
```
