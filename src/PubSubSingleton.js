const {PubSub} = require('@google-cloud/pubsub');

class PubSubSingleton {
    constructor() {
        throw new Error('Use PubSubSingleton.getInstance()');
    }

    static getInstance() {
        if (!PubSubSingleton.instance) {
            PubSubSingleton.instance = new PubSub();
        }
        return PubSubSingleton.instance;
    }
}

module.exports = PubSubSingleton;