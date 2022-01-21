const process = require('process');
const cp = require('child_process');
const path = require('path');

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  try {
  process.env['INPUT_OUTPUTFOLDER'] = './';
  process.env['INPUT_RUBRICFILE'] = './rubric.json';
  process.env['INPUT_TESTRESULTFILE'] = './testresult.json';
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
  } catch (error) {
    console.log(error.message);
    console.log("error", error.stdout.toString());
}
})