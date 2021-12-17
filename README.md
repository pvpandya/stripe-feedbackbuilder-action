# `@pvpandya/stripe-feedbackbuilder-action`

> FeedbackBuilder: Structured logger, parser, and string builder built on rubricca to provide human-written feedback at machine-readable speeds

## Usage

<p align="center">
  <a href="https://github.com/actions/checkout"><img alt="GitHub Actions status" src="https://github.com/actions/checkout/workflows/test-local/badge.svg"></a>
</p>

# FeedbackBuilder v0.1.0-beta

This action builds the structured feedback report for the learner based on rubric and test result json file.

# Usage

<!-- start usage -->
```yaml
- uses: pvpandya/stripe-feedbackbuilder-action@v0.1.0-beta
  with:
    # The location of the rubric file that will be used to generate the output.
    # Default: 'rubric.json'
    rubricfile: ''

    # The location of the test result file in mochawesome report in json format that will be used to generate the output.
    # Default: 'stripetestresult.json'
    testresultfile: ''

    # The location of the final output file.
    # Default: '.'
    outputfolder: ''
```
<!-- end usage -->
# Action generates following Outputs
```yaml
    # The String containg marked up list of tests that passed.
    # Default: 'rubric.json'
    passtestitems: ''

    # The String containg marked up list of tests that did not passed.
    failedtestitems: ''
```
# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
