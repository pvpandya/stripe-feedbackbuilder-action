const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs').promises;

(async () => {
  try {
    const rubricfile = core.getInput('rubricfile', { required: true });
    const testresultfile = core.getInput('testresultfile', { required: true });
    const outputfolder = core.getInput('outputfolder', { required: true });
    core.setOutput('success', 'false');
    if (!rubricfile) {
      core.error('rubricfile was not set');
    }
    let { passtestitems, failedtestitems } = await updateTestResultsInrubricfile(testresultfile, rubricfile, outputfolder);
    core.setOutput('success', 'true');
    core.setOutput('passtestitems', passtestitems);
    core.setOutput('failedtestitems', failedtestitems);
  } catch (error) {
    core.setFailed(error.message);
  }
})();

async function updateTestResultsInrubricfile(testresultfile, rubricfile, outputfolder) {
  //Read Rubric File
  let passtestitems = '';
  let failedtestitems = '';
  let sourceData = await fs.readFile(testresultfile);
  let sourceJson = JSON.parse(sourceData);

  //Read Test Result file
  let destinationData = await fs.readFile(rubricfile);
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
      if (element.pass) {
        passtestitems += '- [x]' + nodeItem + ' - ' + element.fullTitle + '\n';
      } else {
        failedtestitems += '- ' + nodeItem + ' - ' + element.fullTitle + '\n';
      }
    })
  })

  let destinationFileName = outputfolder + '/feedbackReport_' + currentTime + '.json';

  //write to destination file
  await fs.writeFile(destinationFileName, JSON.stringify(destinationJson, null, 5));
  return { passtestitems, failedtestitems }
}

const findItemById = (id, items) => {
  const key = Object.keys(items).find(item => items[item].id === id)
  return items[key]
}
