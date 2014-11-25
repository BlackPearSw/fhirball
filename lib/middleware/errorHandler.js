module.exports = function (err, req, res, next) {
    //TODO: refactor interactions to use error handler?
    var outcome = {
        resourceType: 'OperationOutcome',
        issue: [
            {
                severity: 'error',
                details: err
            }
        ]
    };

    res.status(500).send(outcome);
};