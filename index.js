const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs').promises;

try {
  const baseDirectory = core.getInput('base-directory');
  let rubricFileName = 'rubric.json';
  let testResultFile = 'testresult.json';
  //Parse rubric file and add test results
  updateTestResultsInRubricFile(baseDirectory, testResultFile, rubricFileName);
} catch (error) {
  core.setFailed(error.message);
}

async function updateTestResultsInRubricFile(baseDirectory, testResultFile, rubricFileName) {
  //Read Rubric File

  let sourceData = await fs.readFile(baseDirectory + '/' + testResultFile);
  let sourceJson = JSON.parse(sourceData);

  //Read Test Result file
  let destinationData = await fs.readFile(baseDirectory + '/' + rubricFileName);
  let destinationJson = JSON.parse(destinationData);
  let currentTime = Date.now();
  destinationJson.created = currentTime;
  sourceJson.results[0].suites.forEach(suite => {
    suite.tests.forEach(element => {
      var nodeItem = element.title.split(":").pop(); 
      destinationJson.items[nodeItem].learner_prompt = element.fullTitle;
      destinationJson.items[nodeItem].graded_assertion = element.pass;
      destinationJson.items[nodeItem].err = element.err;
      destinationJson.items[nodeItem].Status = element.state;
    })
  })

  let destinationFileName = baseDirectory + '/feedbackreport_' + currentTime + '.json';

  //write to destination file
  await fs.writeFile(destinationFileName, JSON.stringify(destinationJson, null, 5));

  //Read the updated destination file
  destinationData = await fs.readFile(baseDirectory + destinationFileName);
  core.setOutput("result", "Success");
}

const findItemById = (id, items) => {
  const key = Object.keys(items).find(item => items[item].id === id)
  return items[key]
}
