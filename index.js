const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs').promises;

try {
  // `base-directory` input defined in action metadata file
  const baseDirectory = core.getInput('base-directory');
  console.log(`Base path:  ${baseDirectory}!`);
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

  sourceJson.results[0].suites[0].tests.forEach(element => {
    console.log('element:' + JSON.stringify(element));
    console.log('element-title:' + element.title);
    let destNode = getNodeByItem('1.2.4',destinationJson.items);
    console.log('dest-Node:' + JSON.stringify(destNode));
    
    if(destinationJson.items.hasOwnProperty(element.title)) {
      destinationJson.items[element.title].learner_prompt = element.fullTitle;
      destinationJson.items[element.title].graded_assertion = element.pass;
      destinationJson.items[element.title].err = element.err;
      destinationJson.items[element.title].Status = element.state;
    }
  })
  console.log('destination after copy -> '+JSON.stringify(destinationJson));

  let destinationFileName = baseDirectory + '/feedbackreport - ' + Date.now() + '.json';
  console.log('destination file name -> '+destinationFileName);
  //write to destination file
  await fs.writeFile(destinationFileName, JSON.stringify(destinationJson));

  //Read the updated destination file
  destinationData = await fs.readFile(baseDirectory + destination);
  console.log('after write: '+destinationData);
  core.setOutput("result", "Successfully Generated the Feedback Report");
}

async function getNodeByItem(id, node){
  var reduce = [].reduce;
  function runner(result, node){
      if(result || !node) return result;
      return node.id === id && node || //is this the proper node?
          runner(null, node.children) || //process this nodes children
          reduce.call(Object(node), runner, result);  //maybe this is some ArrayLike Structure
  }
  return runner(null, node);
}