# Helfy SRE Test Assignment

This is a complete full-stack application with authentication, database integration, and monitoring capabilities, implemented as part of the Junior SRE Developer test assignment.

## Overview

The project consists of a distributed system running entirely on Docker, featuring:
*   **Simple Development**: A Node.js backend with a lightweight HTML frontend.
*   **DevOps Implementation**: Full Dockerization using Docker Compose.
*   **Monitoring & Logging**: User activity logs (Log4js) and real-time database change monitoring using TiDB CDC and Apache Kafka.

## Technology Stack

*   **Frontend**: Basic HTML/JS (Single Page Application logic).
*   **Backend**: Node.js with Express.js.
*   **Database**: TiDB (Distributed SQL Database).
*   **Message Queue**: Apache Kafka + Zookeeper (Confluent Platform).
*   **Data Capture**: TiDB CDC (Change Data Capture).
*   **Containerization**: Docker & Docker Compose.
*   **Logging**: `log4js` for application logs, Custom Consumer for CDC logs.

## Architecture

1.  **Client**: A web interface running on Nginx (Port 80) that speaks to the Backend API.
2.  **Server**: Node.js API (Port 3000) that manages Users in TiDB and logs activities.
3.  **TiDB Cluster**: PD, TiKV, and TiDB services simulating a production environment.
4.  **Kafka Ecosystem**: Receives real-time database change events from TiDB via CDC.
5.  **Consumer**: A dedicated Node.js service that listens to Kafka and prints database changes to the console.

## Prerequisites

*   Docker
*   Docker Compose

## Setup and Running

The entire project is runnable with a **single command**:

```bash
docker-compose up --build -d
```

### Accessing the Application

1.  Open your browser and navigate to: [http://localhost](http://localhost)
2.  **Login Credentials** (Created automatically on startup):
    *   Username: `admin`
    *   Password: `admin123`
3.  You can also register new users via the "Quick Register" button.

## Verification

### 1. User Activity Logs
Check the backend server logs to see JSON formatted login events:
```bash
docker logs -f <project_name>-server-1
```
*Output Example:*
```json
{"timestamp":"2024-01-01T12:00:00.000Z","userId":1,"action":"LOGIN","ip":"::ffff:172.xx.xx.xx"}
```

### 2. Real-time Database Monitoring (CDC)
The system automatically sets up a Change Data Capture task that streams DB updates to Kafka.
To see real-time updates (e.g., when a user logs in and their token updates):

1.  Open a terminal and tail the consumer logs:
    ```bash
    docker logs -f <project_name>-consumer-1
    ```
2.  Perform a login or register action in the browser.
3.  Watch the consumer terminal for `UPDATE` or `INSERT` events.

## Project Structure

*   `/server` - Node.js Backend API and DB logic.
*   `/client` - Frontend HTML/CSS/JS.
*   `/consumer` - Kafka Consumer service for SRE monitoring.
*   `docker-compose.yml` - Orchestration of all 8 services.
*   `cdc-task.sh` - Automation script for initializing the monitoring pipeline.

## Implementation Details for Review

*   **Database Initialization**: The backend server handles table creation and seeding the admin user upon successful connection to TiDB, ensuring robustness against race conditions.
*   **CDC Configuration**: A sidecar container (`cdc-init`) runs on startup to configure the TiDB Changefeed to Kafka automatically.
*   **Resiliency**: Services invoke retry mechanisms to handle the asynchronous startup nature of the heavy TiDB/Kafka infrastructure.

---
**Good Luck!**
