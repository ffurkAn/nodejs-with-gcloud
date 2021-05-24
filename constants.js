const DAILY_STATISTICS = `dailyStatistics`;
const NUMBER_OF_USERS = `numberOfUsers`;

// QUERY CONSTANTS
const TABLE_NAME = `codeway-312008.codeway_dataset.log`;

const QUERY_DAILY_ACTIVE_USERS = `SELECT STRING(DATE(TIMESTAMP_MILLIS(event_time))) as eventDate, user_id as userId
    FROM ${TABLE_NAME}
    WHERE DATE(_PARTITIONTIME) = @partitionTime
    group by eventDate, userId
    order by 1;`;

const QUERY_DAILY_AVERAGE_DURATIONS = `select 
dateStr,
FORMAT_TIMESTAMP('%M:%S', TIMESTAMP_SECONDS(cast (avgDuration  as INT64))) as avgDuration
from (select STRING(eventDate) as dateStr, AVG(TIMESTAMP_DIFF(endTime , starttime , SECOND)) as avgDuration
        from (  SELECT session_id, DATE(TIMESTAMP_MILLIS(event_time)) as eventDate, MIN(TIMESTAMP_MILLIS(event_time)) as starttime, MAX(TIMESTAMP_MILLIS(event_time)) as endTime
                FROM ${TABLE_NAME} 
                WHERE DATE(_PARTITIONTIME) = @partitionTime
                AND session_id IN (
                SELECT distinct session_id
                FROM ${TABLE_NAME} 
                WHERE DATE(_PARTITIONTIME) = @partitionTime
        )   
                group by session_id, eventDate
        )
        group by dateStr
)
order by dateStr `;

const QUERY_TOTAL_USERS = `select count(distinct user_id) as userCount
FROM ${TABLE_NAME} 
WHERE DATE(_PARTITIONTIME) = @partitionTime`;

// PATH CONSTANTS
const ROOT = `/`;
const PUBLISH = `/publish`;
const STATISTICS = `/statistics`;
const TIME_SEPARATOR = `T`;
const US = `US`;

const TOPIC_NAME = 'projects/codeway-312008/topics/codeway-topic';
const MAX_MESSAGES_AT_ONCE = 10; // publish 10 message at once
const MAX_WAIT_TIME_IN_SECONDS = 10;

module.exports = {
    QUERY_DAILY_ACTIVE_USERS: QUERY_DAILY_ACTIVE_USERS,
    QUERY_DAILY_AVERAGE_DURATIONS: QUERY_DAILY_AVERAGE_DURATIONS,
    QUERY_TOTAL_USERS: QUERY_TOTAL_USERS,
    DAILY_STATISTICS: DAILY_STATISTICS,
    NUMBER_OF_USERS: NUMBER_OF_USERS,
    ROOT: ROOT,
    PUBLISH: PUBLISH,
    STATISTICS: STATISTICS,
    TIME_SEPARATOR: TIME_SEPARATOR,
    US: US,
    TOPIC_NAME: TOPIC_NAME,
    MAX_MESSAGES_AT_ONCE: MAX_MESSAGES_AT_ONCE,
    MAX_WAIT_TIME_IN_SECONDS: MAX_WAIT_TIME_IN_SECONDS
}