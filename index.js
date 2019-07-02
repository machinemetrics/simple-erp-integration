const argv = require('yargs').argv;

const JobDispatch = require('./JobDispatch');

const API_KEY = argv['api-key'];
const ACTION = argv.action || '';
const API_URI_OVERRIDE = argv.apiOverride;

const jobDispatch = new JobDispatch(API_KEY, API_URI_OVERRIDE);

async function process () {
  switch(ACTION.toLowerCase()) {
    case 'start':
      const startResult = await jobDispatch.start({
        erpJobOperationRunId: argv.erpJobOperationRunId,
        erpMachineId: argv.erpMachineId,
        jobName: argv.jobName,
        operationName: argv.operationName,
        lotName: argv.lotName,
        partName: argv.partName,
        startInSetup: argv.startInSetup,
        startAt: argv.startAt,
        dueAt: argv.dueAt,
        jobOperationDescription: argv.jobOperationDescription,
        partValue: argv.partValue,
        quantityRequired: argv.quantityRequired,
        expectedSetupTime: argv.expectedSetupTime,
        idealPartTime: argv.idealPartTime,
        expectedPartTime: argv.expectedPartTime,
      });

      return 'Job Started Successfully';
    case 'info':
      const infoResult = await jobDispatch.info({
        erpJobOperationRunId: argv.erpJobOperationRunId,
      });

      return `
Started: ${infoResult.startAt}
Ended: ${infoResult.endAt}
Total Parts: ${infoResult.metrics.totalParts}
Good Parts: ${infoResult.metrics.goodParts}
Scrap Parts: ${infoResult.metrics.scrapParts}
Non-Conforming Parts: ${infoResult.metrics.nonconformParts}
      `;
    case 'stop':
      const endResult = await jobDispatch.stop({
        erpJobOperationRunId: argv.erpJobOperationRunId,
        endAt: argv.endAt,
      });

      return 'Job Stopped Successfully';
    default:
      return `Example uses:
node index.js --action start --api-key API_KEY --erpJobOperationRunId ID --erpMachineId MACHINE_ID --jobName JOB_NAME --expectedPartTime EXPECTED_PART_TIME --startAt START_AT
node index.js --action info --api-key API_KEY --erpJobOperationRunId ID
node index.js --action stop --api-key API_KEY --erpJobOperationRunId ID --endAt END_AT
      `;
  }
}

(async () => {
  try {
    const result = await process();
    console.log(result);
  } catch (e) {
    console.error(e.response ? e.response.body : e.message);
  }
})();
