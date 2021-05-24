const {BigQuery} = require('@google-cloud/bigquery');

class BigQuerySingleton {
    constructor() {
        throw new Error('Use BigQuerySingleton.getInstance()');
    }

    static getInstance() {
        if (!BigQuerySingleton.instance) {
            BigQuerySingleton.instance = new BigQuery();
        }
        return BigQuerySingleton.instance;
    }
}

module.exports = BigQuerySingleton;