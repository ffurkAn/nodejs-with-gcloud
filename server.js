const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const Constants = require('./constants');
const _ = require('underscore');
const BigQuerySingleton = require('./src/BigQuerySingleton');
const PubSubSingleton = require('./src/PubSubSingleton');
require('dotenv').config({ path: `./conf/.env.${process.env.NODE_ENV}` })

// parse application/json
app.use(bodyParser.json({limit: '10mb'}))

/**
 * https://stackoverflow.com/questions/18758772/how-do-i-validate-a-date-in-this-format-yyyy-mm-dd-using-jquery/18759013
 * @param dateString
 * @returns {boolean}
 */
function isValidDate(dateString) {
    let regEx = /^\d{4}-\d{2}-\d{2}$/;
    // Invalid format
    if(!dateString.match(regEx)) {
        return false;
    }
    let d = new Date(dateString);
    let dNum = d.getTime();

    // NaN value, Invalid date
    if(!dNum && dNum !== 0) {
        return false;
    }
    return d.toISOString().slice(0,10) === dateString;
}

async function publishBatchedMessages(messageArr) {
    const batchPublisher = PubSubSingleton.getInstance().topic(Constants.TOPIC_NAME, {
        batching: {
            maxMessages: Constants.MAX_MESSAGES_AT_ONCE,
            maxMilliseconds: Constants.MAX_WAIT_TIME_IN_SECONDS * 1000,
        },
    });

    messageArr.forEach((item) => {
        (async () => {
            const messageId = await batchPublisher.publish(Buffer.from(JSON.stringify(item)));
            console.info(`Message ${messageId} published.`);
        })();
    });
}

async function getDailyAverageDurations(partitionParam) {
    const dailyAverageDurationsOptions = {
        query: Constants.QUERY_DAILY_AVERAGE_DURATIONS,
        // Location must match that of the dataset(s) referenced in the query.
        location: Constants.US,
        params: {partitionTime: partitionParam}, // sysdate
    };

    // Run the query
    console.info(`Fetching daily average durations in ${partitionParam}`)
    const [result] = await BigQuerySingleton.getInstance().query(dailyAverageDurationsOptions);
    return result;
}

async function getDailyActiveUsers(partitionParam) {
    const dailyActiveUsersOptions = {
        query: Constants.QUERY_DAILY_ACTIVE_USERS,
        // Location must match that of the dataset(s) referenced in the query.
        location: Constants.US,
        params: {partitionTime: partitionParam}, // sysdate
    };

    // Run the query
    console.info(`Fetching daily active durations in ${partitionParam}`)
    const [result] = await BigQuerySingleton.getInstance().query(dailyActiveUsersOptions);
    return result;
}

async function getTotalUsers(partitionParam) {
    const dailyActiveUsersOptions = {
        query: Constants.QUERY_TOTAL_USERS,
        // Location must match that of the dataset(s) referenced in the query.
        location: Constants.US,
        params: {partitionTime: partitionParam}, // sysdate
    };

    // Run the query
    console.info(`Fetching number of users in ${partitionParam}`)
    const [[result]] = await BigQuerySingleton.getInstance().query(dailyActiveUsersOptions);
    return result;
}

async function queryStatistics(partitionParam) {

    if(_.isUndefined(partitionParam) ||  _.isNull(partitionParam) || _.isEmpty(partitionParam)){
        partitionParam = new Date().toISOString().split(Constants.TIME_SEPARATOR)[0];
        console.info('Partition date has been set as today -> ' + partitionParam);
    }else if(!isValidDate(partitionParam)){
        throw new Error("Date parameter is not valid. Expected format is: yyyy-mm-dd.");
    }

    let result = {};
    // daily avg durations
    let dailyAverageDurations = await getDailyAverageDurations(partitionParam);

    let dailyActiveUsers = await getDailyActiveUsers(partitionParam);

    dailyAverageDurations.forEach(dateEntry => {

        dateEntry.userIdList = [];

        let filteredUsers = _.filter(dailyActiveUsers, (entry) => {
            return entry.eventDate === dateEntry.dateStr;
        });

        let userIdList = _.map(filteredUsers, (entry) => {
            return entry.userId
        });
        dateEntry.userIdList.push(userIdList);
    });
    result[Constants.DAILY_STATISTICS] = dailyAverageDurations;

    let totalUsers = await getTotalUsers(partitionParam);
    result[Constants.NUMBER_OF_USERS] = totalUsers.userCount;
    return result;
}


app.get(Constants.ROOT, (req, res) => {
    res.send('Hello from App Engine!');
});

app.post(Constants.PUBLISH, (req, res) => {
    publishBatchedMessages(req.body).catch(console.error);
    res.send('Message send request has been handled! Messages will be published.');
});

app.get(Constants.STATISTICS, (req, res) => {

    (async () => {
        let partitionDate = req.query.partitionDate;
        try{
            res.send(await queryStatistics(partitionDate).then());
        }catch (e){
            res.status(400);
            console.error(e.message + ' Given date is: [' + partitionDate + ']');
            res.send(e.message);
        }
    })();
})

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT;
const ENV = process.env.APP_ENV;
app.listen(PORT, () => {
    console.info(`Server listening on port ${PORT}. Env:${ENV}`);
});