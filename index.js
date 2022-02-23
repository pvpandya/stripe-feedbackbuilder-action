const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs').promises;

(async () => {
  try {
    const rubricfile = core.getInput('rubricfile', { required: true });
    const testresultfile = core.getInput('testresultfile', { required: true });
    const outputfolder = core.getInput('outputfolder', { required: true });
    const currentdetails = core.getInput('currentlearnerchallengestatusdetails', { required: true });
    if (!rubricfile) {
      core.error('rubricfile was not set');
    }
    if (!currentdetails) {
      core.error('currentdetails was not set');
    }
    let { passtestitems, failedtestitems, learnerNextSection, updatedLearnerDetailsJson } = await updateTestResultsInrubricfile(testresultfile, rubricfile, currentdetails, outputfolder);
    core.setOutput('passtestitems', passtestitems);
    core.setOutput('failedtestitems', failedtestitems);
    core.setOutput('learnerchallengestatus', learnerNextSection);
    core.setOutput('learnerchallengestatusdetails', updatedLearnerDetailsJson);
  } catch (error) {
    core.setFailed(error.message);
  }
})();

async function updateTestResultsInrubricfile(testresultfile, rubricfile, currentdetails, outputfolder) {
  //Read Rubric File
  let passtestitems = '';
  let passList = [];
  let failedtestitems = '';
  let failList = [];
  
  let learnerchallengestatusdetails = 'learnerchallengestatusdetails';
  let sourceData = await fs.readFile(testresultfile);
  let sourceJson = JSON.parse(sourceData);

  //Read Test Result file
  let destinationData = await fs.readFile(rubricfile);
  let destinationJson = JSON.parse(destinationData);
  //Read the learnerdetails
  let learnerDetailsData = await fs.readFile(currentdetails);
  let learnerDetailsJson = JSON.parse(learnerDetailsData);
  let learnerCurrentSection = learnerDetailsJson.currentSection;
  let learnerNextSection = learnerCurrentSection;
  let sourceSection = [];
  let currentTime = Date.now();
  destinationJson.created = currentTime;
  sourceJson.results.forEach(fileresult => {
    sourceSection.push(fileresult.fullFile.split("/").pop());
    fileresult.suites.forEach(suite => {
      suite.tests.forEach(element => {
        var nodeItem = element.title.split(":").pop(); 
        var rubricItem = destinationJson.items[nodeItem];
        if (typeof rubricItem !== "undefined") {
          rubricItem.learner_prompt = element.fullTitle;
          rubricItem.graded_assertion = element.pass;
          rubricItem.err = element.err;
          rubricItem.Status = element.state;
        }
        if (element.pass) {
          passList.push({"id" : nodeItem, "rowId": rubricItem.rowId, "name": element.fullTitle});
        } else {
          failList.push({"id" : nodeItem, "rowId": rubricItem.rowId, "name": element.fullTitle});
        }
      })
    })
  })
  
  passList.sort(SortByRowId);
  failList.sort(SortByRowId);
  passList.forEach(item => {
    passtestitems += '- ' + item.id + ' - ' + item.name.split(":").shift() + '\n';
  })

  failList.forEach(item => {
    failedtestitems += '- ' + item.id + ' - ' + item.name.split(":").shift() + '\n';
  })

  if (failedtestitems === ""){
    failedtestitems = 'None';
    learnerNextSection = getNextSection(learnerCurrentSection, destinationJson);
  }

  if (passtestitems === ""){
    passtestitems = 'None';
  }
  let updatedLearnerDetailsJson = JSON.stringify(updateLearnerDetailsFile(learnerDetailsJson, sourceSection, sourceJson, learnerNextSection, destinationJson));
  let destinationFileName = outputfolder + '/feedbackReport_' + currentTime + '.json';
  //write to destination file
  await fs.writeFile(destinationFileName, JSON.stringify(destinationJson, null, 5));
  return { passtestitems, failedtestitems, learnerNextSection, updatedLearnerDetailsJson }
}

//get next section

const getNextSection =(currentSection, destinationJson) => {
  let nextSection = currentSection;
  let curIndex = destinationJson.sequences.findIndex(i => i === currentSection);
  if (destinationJson.sequences.length-1 >= curIndex+1) {
    nextSection = destinationJson.sequences[curIndex+1];
  }
  return nextSection;
}

//Update Learner Details JSON
const updateLearnerDetailsFile = (learnerDetailsJson, sourceSection, sourceJson, learnerNextSection, destinationJson) => {
  let sectionStats = learnerDetailsJson.sectionStats;
  let newSectionStats = {};
  newSectionStats.sectionName = sourceSection;
  for (var key in sourceJson.stats) {
    if (sourceJson.stats.hasOwnProperty(key)) {
      newSectionStats[key] = sourceJson.stats[key];
    }
}
  sectionStats.unshift(newSectionStats);
  learnerDetailsJson.sectionStats = sectionStats;
  learnerDetailsJson.currentSection = learnerNextSection;
  const currentTime = new Date();
  learnerDetailsJson.lastUpdatedDate = currentTime.toISOString();
  return learnerDetailsJson;
}

//sort by ascending id
const SortByRowId = (x,y) => {
  return x.rowId - y.rowId; 
}
const findItemById = (id, items) => {
  const key = Object.keys(items).find(item => items[item].id === id)
  return items[key]
}
