# cloudsine_technical

This repository contains a web application developed for Cloudsine's technical assessment. The application integrates with the VirusTotal API to allow users to securely upload files and scan them for malware or viruses.

## Requirements
- docker

## Getting started

### Clone repository
```shell
git clone https://github.com/leesean5150/cloudsine_technical.git
```
```shell
git submodule update --init --recursive
```
to initialise and pull the webtest submodule for the test files

### Populate .env file
```shell
cp .env.sample .env
```
open .env file and fill in the required information

### Start up docker containers

```shell
docker compose up
```

## Web Architecture
![Web architecture overview](public/web_architecture.jpg)
- Nginx service (NGINX) - this should be the only thing exposed on the actual server
- React frontend (UI)
- FastAPI backend (BACKEND)
- PostgreSQL database (DB)

![Files schema](public/files_schema.jpg)
- uuid: unique identifier acting as the primary key
- filename: name of the uploaded file
- date_created: data and time when the files analysis is saved
- analysis: the analysis data returned from VirusTotal api

## Setup Process
1) Setup development docker environment
    - Docker compose used to ochestrate running of multiple containers that depend on one another (nginx depends on backend, backend depends on db)
    - Optimisation was done by using a smaller docker image like python-slim for the backend
    - For development, a possible consideration could have been to setup a devcontainer, allowing for easy collaborative work as well as automatic installation of linting and formatting tools which would have reduced a lot of inconvenience during development.

2) Develop business logic in the backend
    - Fastapi was chosen for quick development.
    - Used pydantic settings for modularity and easy maintainence.
    - Used asynchronous methods for endpoints to allow concurrent users and non-blocking tasks.

3) Developed client facing features and integrated api calls
    - React was chosen for its modularity and flexibility.
    - Setup custom query hooks for api calls and configuration files for modularity and easy maintainence

4) Setup EC2 instance and deployed web application
    - Created a production docker compose file, combining both the ui and nginx services into a multi-stage docker build. This optimisation choice reduces the docker footprint and allows for serving the ui static files without the overhead of mounting volumes.
    - Launched a EC2 instance before setting up server by installing docker, cloning the github repository and running the containers using compose.deploy.yml configurations.
    - For actual deployment, the possible considerations could have been implemented:
        - Pushing images to docker hub so that server only needs to pull these images rather than cloning a github repository.
        - Rerouting EC2 instance public ip address to an actual domain name using Route 53
        - SSL certificate for domain name using tools like Let's Encrypt.
        - Using Elastic Container Service to run multiple EC2 instances for horizontal scaling and adding Elastic Load Balancing for a more resilient architecture that is able to withstand high traffic flows.

## Challenges and Solutions
1) Working with the VIrusTotal api was challenging because it was an external api I had not used before, and required me to reason out the thought process of the developers. An example of this would be how uploading and getting the data from the file analysis was 2 separate endpoints which was a bit counter-intuitive to me because I expected to receive the data during the response of the upload file post endpoint rather than needing to make a separte get request with the file id. In retrospect, the decoupling of these two endpoints might have been implemented because for added flexibility, since developers are not forced to only scan the file from the upload endpoint but can choose to use other endpoints on their uploaded file. The solution I came up with was combining both the upload and get requests in the scan endpoint, since the use case was only to upload files to get the results, allowing me to only call one endpoint to get satisfy the use case. This required me to use polling, since the get endpoint will return a response with the status queued if the document has not been fully processed yet. This however consumes the api call quota on VirusTotal api's end, which occasionally results in a failed api call due to the limitations of the free tier. A more complex but feasible solution would have been to set up a websocket that polled for the file data asynchronously, and sending a notification to the user when the file has been processed, which would have both improved user experience and reduce points of failure.

2) Implementing the github actions CI/CD pipeline required quite abit of tinkering because even though I had went through onlines resources to try and implement it before, setting it up with a deployment environment in mind required a more complex workflow, like checking each individual service as well as double checking the backend endpoints were functional. There was not really a solution for this other than going through a lot of trial and error to properly set up everything.

## Use Cases
1) Upload a file to VirusTotal api for scanning and return the analysis data of said file
2) Save the anaylsis data of uploaded file to database
3) View the saved file analysis in a table
4) Delete a saved file analysis

