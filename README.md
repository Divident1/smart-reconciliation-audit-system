# Smart Reconciliation & Audit System

A full-stack MERN application for uploading transaction data, reconciling it against system records, and maintaining an audit trail.

## Features

- **Dashboard**: Real-time overview of reconciliation status.
- **File Upload**: Support for CSV and Excel files with async processing.
- **Reconciliation Engine**:
  - Exact Match: Transaction ID + Amount match.
  - Partial Match: Reference Number match + Amount variance (±2%).
  - Duplicate Detection: Duplicate Transaction IDs.
- **Audit Trail**: Tracks manual corrections with immutable logs.
- **Role-Based Access**:
  - **Admin**: Full Access.
  - **Analyst**: Upload, Reconcile, Correct.
  - **Viewer**: Read-only.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS (via variables), Recharts, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB.
- **Processing**: Multer, CSV-Parser, XLSX.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)

### Installation

1. **Clone the repository** (if applicable)
2. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   ```
3. **Install Frontend Dependencies**:
   ```bash
   cd client
   npm install
   ```

### Running the Application

1. **Start MongoDB**: Ensure your MongoDB instance is running.
2. **Start Backend**:
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:5000`.
3. **Start Frontend**:
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`.

### Demo Credentials
- Once registered, you can use the credentials:
- **Username**: `admin`
- **Password**: `123456` (Note: You may need to register first via Postman or implementing registration, but for demo, the Login page has a hint).

## Architecture & System Design

The system follows a decoupled MERN architecture with a focus on asynchronous scalability.

- **Non-Blocking Processing**: The backend uses an asynchronous worker pattern for file processing. When a file is uploaded, the API responds immediately with a `jobId`, while the `fileProcessor` handles parsing and reconciliation in the background. This ensures the UI remains responsive even for 50,000+ records.
- **Configurable Reconciliation**: Matching logic is moved to `server/config/matchingRules.js`. This allows developers to adjust variance thresholds or mandatory match fields without altering the core engine.
- **Data Integrity**: 
  - **Idempotency**: Prevents processing the same file twice within 24 hours to avoid data pollution.
  - **Auditability**: Every manual change triggers an immutable entry in the `AuditLog` collection, capturing the state "before" and "after".

## Trade-offs & Assumptions

1. **In-Memory Parsing vs. Streaming**: For CSVs, we use `csv-parser` which streams data, minimizing memory footprint. For Excel, we use `xlsx` which loads the sheet into memory; for extremely large files (>100MB), a streaming XLSX parser would be a better alternative.
2. **Reconciliation Context**: The system assumes that "System Records" are any records that belong to *other* upload jobs. This allows for cross-file reconciliation.
3. **Partial Match Logic**: We implemented a ±2% amount variance check on Reference Numbers. This threshold is configurable in `matchingRules.js`.

## API Documentation

Detailed documentation is available in [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md).

## Sample Data

Sample files for testing both "System" state and "Upload" state are located in the [/samples](./samples) directory.
