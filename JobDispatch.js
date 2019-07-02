const request = require('request-promise');

class JobDispatch {
  constructor(apiKey, apiHost = 'https://api.machinemetrics.com') {
    this.apiKey = apiKey;
    this.apiHost = apiHost;
  }

  async start(params) {
    return await request({
      uri: `${this.apiHost}/erp/jobdispatch/start`,
      method: 'POST',
      body: params,
      json: true,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
  }

  async info(params) {
    const result = await request({
      url: `${this.apiHost}/erp/jobdispatch/${params.erpJobOperationRunId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    return JSON.parse(result);
  }

  async stop(params) {
    return await request({
      url: `${this.apiHost}/erp/jobdispatch/stop`,
      method: 'POST',
      body: params,
      json: true,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
  }
}

module.exports = JobDispatch;
