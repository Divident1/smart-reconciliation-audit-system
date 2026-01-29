module.exports = {
    exactMatch: {
        fields: ['transactionId', 'amount'],
        enabled: true
    },
    partialMatch: {
        fields: ['referenceNumber'],
        variance: 0.02, // 2%
        enabled: true
    },
    duplicateCheck: {
        fields: ['transactionId'],
        enabled: true
    }
};
