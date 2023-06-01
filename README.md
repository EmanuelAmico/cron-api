# Cron API

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![License](https://img.shields.io/badge/license-ISC-blue)

> Cron API allows to manage cron jobs programmatically, ensuring secure and efficient execution of periodic tasks. It exposes a set of RESTful endpoints for listing, creating, updating, and deleting jobs. 

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contact](#contact)
- [License](#license)

## Prerequisites

- Docker
- Node.js
- NPM

## Installation

1. Clone the repository:

    ```bash
    git clone git@gitlab.com:plataforma-5/cron-api.git
    cd cron-api
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Build the Docker image:

    ```bash
    docker-compose build local
    ```

## Usage

1. Start the API server:

    ```bash
    docker-compose up local
    ```

    The API will be accessible at `https://localhost:8000`.

2. Use the provided API endpoints to interact with the service (more details in the [API Endpoints](#api-endpoints) section).

## API Endpoints

The Cron API provides the following endpoints:

1. `GET /jobs`: List all running jobs.
2. `GET /jobs/{jobName}`: Get a specific job by its name.
3. `GET /jobs/search?{queryParameters}`: Search for similar jobs using specific query parameters.
4. `POST /jobs`: Create a new cron or timer job.
5. `PUT /jobs/{jobName}`: Edit a running job by its name.
6. `DELETE /jobs/{jobName}`: Remove a running job by its name.

For more details on the request and response schema and updated endpoints, please refer to the provided `Swagger documentation`.

## Contact

You can report issues and give feedback at our [GitLab page](https://gitlab.com/plataforma-5/cron-api/issues).

## License

This project is licensed under the ISC License. See the LICENSE file for more details.

---

Made with 🫶🏽 by [Plataforma5](https://www.plataforma5.la/).


