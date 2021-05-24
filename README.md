# gcloud-with-nodejs

## Run with Docker-Compose
If you have docker-compose installed, run the following `docker-compose up`

## Run with Docker
1. To create the image, run the following `docker build . -t codeway-app`
2. To run the image, run the following `docker run -p 3000:3000 codeway-app`

## Install & Test & Deploy

### 1. Install

- Install [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm#installation).

- Install Node.js and npm (Node Package Manager)

        - To install the latest version of Node.js, run the following: `nvm install stable`
        - To install Express Server, run the following: `npm install --save express`
    
- Install an editor. There are several editors that you can use to develop Node.js apps:
    
        - [Visual Studio Code](https://code.visualstudio.com/) by Microsoft
        - [IntelliJ IDEA and/or Webstorm](https://www.jetbrains.com/idea/) by JetBrains

- Install the Cloud SDK. The Cloud SDK is a set of tools for Google Cloud. It contains gcloud, gsutil, and bq, which you can use to access Compute Engine, Cloud Storage, BigQuery, and other products and services from the command line. For details [click](https://cloud.google.com/sdk/docs/install)

- Install the Cloud Client Libraries for Node.js. Pub/Sub and BigQuery are used in this case.

        - To install Google Pub/Sub, run the following: `npm install --save @google-cloud/pubsub`
        - To install Google BigQuery, run the following: `npm install --save @google-cloud/bigquery`

- Other Dependencies:

        - `npm i --save body-parser`
        - `npm i --save dotenv`
        - `npm i --save underscore`

*If you are going to use this project as boilerplate, just run `npm install`.*

### 2. Test
After `npm install`, run `npm test`. Local server will be published under `http://localhost:3000`.

### 3. Deploy to Cloud

In order to deploy your files to your cloud project, run `gcloud app deploy ` inside your projec root directory. After deployment, you can open running application by running `gcloud app browse`. 

## API
### Publishing Messages
**Endpoint:** https://codeway-312008.appspot.com/publish

**Method:** POST

**Input Schema:**
```
[
    {
      "name": "type",
      "type": "string"
    },
    {
      "name": "app_id",
      "type": "string"
    },
    {
      "name": "session_id",
      "type": "string"
    },
    {
      "name": "event_name",
      "type": "string"
    },
    {
      "name": "event_time",
      "type": "long"
    },
    {
      "name": "page",
      "type": "string"
    },
    {
      "name": "country",
      "type": "string"
    },
    {
      "name": "region",
      "type": "string"
    },
    {
      "name": "city",
      "type": "string"
    },
    {
      "name": "user_id",
      "type": "string"
    }
]
```

**Request Body Example:**
```
[
  {
    "type": "event",
    "app_id": "com.codeway.test",
    "session_id": "HEpi9NZ289",
    "event_name": "purchase",
    "event_time": 1598168070143,
    "page": "paywall",
    "country": "TR",
    "region": "Marmara",
    "city": "Istanbul",
    "user_id": "36DoicuIPn"
  },
  {
    "type": "event",
    "app_id": "com.codeway.test",
    "session_id": "MQm8BYMbo3",
    "event_name": "about",
    "event_time": 1598371926818,
    "page": "settings",
    "country": "TR",
    "region": "Marmara",
    "city": "Istanbul",
    "user_id": "DMXlGh5yPG"
  }
]
```

### Query Statistics
**Endpoint:** https://codeway-312008.appspot.com/statistics?partitionDate=2021-05-01

**Method:** GET

*Note: `partitionDate` is optional. If not setted properly, current date is used.*

**Response Example:**

```
{
    "dailyStatistics": [
        {
            "dateStr": "2020-08-23",
            "avgDuration": "05:20",
            "userIdList": [
                [
                    "gGSNIrIrUK",
                    "qdwvqOLXlB",
                    "8XvucFJHTT",
                    "EHFUC9J72A",
                    "DMXlGh5yPG",
                    "9t0lrnYLQr",
                    "HrRocv2FSu",
                    "iO4LG9qF5E",
                    "36DoicuIPn",
                    "aNhvcS92PQ",
                    "asdasdads"
                ]
            ]
        },
        {
            "dateStr": "2020-08-24",
            "avgDuration": "05:49",
            "userIdList": [
                [
                    "9t0lrnYLQr",
                    "DMXlGh5yPG",
                    "EHFUC9J72A",
                    "gGSNIrIrUK",
                    "8XvucFJHTT",
                    "qdwvqOLXlB",
                    "aNhvcS92PQ",
                    "36DoicuIPn",
                    "HrRocv2FSu",
                    "iO4LG9qF5E"
                ]
            ]
        },
        {
            "dateStr": "2020-08-25",
            "avgDuration": "05:32",
            "userIdList": [
                [
                    "HrRocv2FSu",
                    "DMXlGh5yPG",
                    "36DoicuIPn",
                    "8XvucFJHTT",
                    "qdwvqOLXlB",
                    "gGSNIrIrUK",
                    "EHFUC9J72A",
                    "9t0lrnYLQr",
                    "iO4LG9qF5E",
                    "aNhvcS92PQ"
                ]
            ]
        }
    ],
    "numberOfUsers": 11
}
```

## Google Cloud

### BigQuery

**Table Name:** `codeway-312008:codeway_dataset.log`

**Table Schema:**

![table_schema](https://user-images.githubusercontent.com/2103017/116713847-d7e66800-a9dd-11eb-9bef-eddbf0fe4b4f.png)

### Table Specifications

#### Partitioning 
In terms of generic usage, data is **partitioned daily** by BigQuery. This setting is not effective for this case. In addition, when writing query, partition date(in `yyyy-hh-mm`format) must be specified in where clause.

#### Clustering
Clustering is used in order to make data organized automatically. `user_id, session_id, event_time` fields are used to colocate data.

### Pub/Sub
Pub/Sub batch messaging is used to handle messages for its subscribers with parameters below:
```
    batching: {
            maxMessages: maxMessages, // 10
            maxMilliseconds: maxWaitTime * 1000, // 10
        }
``` 

### DataFlow
DataFlow job is created for fetching messages from Pub/Sub and writing to BigQuery `log` table.

## How to maintain multiple environment?
**Environment Variables:** We may want to hide urls, paths, credentials etc. Environment variables are external and they are excellent for decoupling application configurations. These variables can be changed for different environments and these changes are independent from code changes. 

In our case, we have test and prod environments. See how they are different from each other.

`dotenv` package is used to load environment variables to `process.env`.

*conf/.env.test:*
```
APP_ENV=Test
HOST=localhost
PORT=3000
```

*conf/.env.prod:*
```
APP_ENV=Production
HOST=codeway-312008.appspot.com
PORT=443
```

Above configurations are loaded by the commands below:

*package.json:*
```
"scripts": {
    "test": "NODE_ENV=test GOOGLE_APPLICATION_CREDENTIALS=</path/to/GCP-credentials.json> node server.js",
    "start": "NODE_ENV=prod node server.js"
  }
```

`</path/to/GCP-credentials.json>` is a key, which generated and downloaded from GCP, for autenticate our local environment to Google Cloud Platform services and it must be loaded to environment. 

`.env` files are loaded dynamically `require('dotenv').config({ path: './conf/.env.${process.env.NODE_ENV}'})`.

*Note: `.env` files must be added .gitignore since it has some secret informations. However, sample .env file can be added to give hints about configurations.*

## Microservice Architecture
If we want to move our application from monolithic to microservice architecture, there are several concerns we may have to think seriously.

**API Gateway:** We may have multiple services. Our clients bussiness flows need to access couple of them in a single transaction. Some of the services might use different protocols of communication, which will make client implementation harder. To solve that, API Gateway can be used. API Gateway is a design pattern in order to hide service details in our architecture. Client send a single request so that it simplifies client codes and implementations.

**Service Discovery:** In monolithic applications, network locations of the different services are static and they can be stored in application configuration files. However, in microservice architecture or cloud-based applications the IP addresses of the different services are dynamically assigned and change often. 

Service Discovery pattern provides a solution for this problem. It uses a Service Registry where information for all available service endpoints is stored and it routes incoming request to required service. Netflix's Eureka and Apache Zookeper are the most known examples.

**Caching:** Sometimes querying database or service may be redundant. If we want to maximize performance we can buffer some datas or configurations to improve speed and reduce backend load. We can use caching mechanism in 2 ways.
1. Embed cahce in service: Application receives the request and checks if the same request was already executed.
2. Standalone cache server: Application uses cache client to connect to Cache Server

**Container-as-a-Service:** Managing and orchestrating hundreds of services might be challenging. Containerizing services such as Docker provides benefits to help us:
- Environment consistency 
- Faster deployment: Starts and stops in less than a second, as they do not require any operating system boot
- Isolation: Same resources are isolated from each other
- Portability: A container wraps up an application with everything it needs to run, like configuration files and dependencies. This enables you to easily and reliably run applications on different environments, such as your local desktop, physical servers, virtual servers, testing, staging, production environments, and public or private clouds
- Scalability: Use as you need. Scale-out and scale-in independently. Kubernetes, Docker Swarm, and Amazon ECS are the orchestration engines  to handle scalibility.

## todos
- [x] duration format MM:SS
- [x] make partition time as parametric
- [x] multiple env files to cover different configurations for different environments
