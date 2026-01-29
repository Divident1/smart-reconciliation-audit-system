# API Documentation - Smart Reconciliation System

## Authentication

### Login
- **URL**: `/api/users/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "admin",
    "password": "password"
  }
  ```
- **Success Response**: `200 OK` with JWT Token.

---

## File Upload & Processing

### Upload Transaction File
- **URL**: `/api/upload`
- **Method**: `POST`
- **Auth**: Required (Bearer Token)
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: CSV or XLSX file.
  - `mapping`: (Optional) JSON string mapping headers to fields.
    ```json
    {
      "transactionId": "Txn ID",
      "amount": "Value",
      "referenceNumber": "Ref No",
      "date": "Date"
    }
    ```
- **Success Response**: `201 Created` with `jobId`.

### Get Upload Jobs
- **URL**: `/api/upload`
- **Method**: `GET`
- **Success Response**: List of recent upload jobs.

---

## Reconciliation

### Get Reconciliation Results
- **URL**: `/api/reconciliation`
- **Method**: `GET`
- **Query Params**:
  - `jobId`: Filter by specific upload.
  - `page`: Pagination (default 1).
  - `limit`: Records per page (default 20).
- **Success Response**: Paginated results with match status.

### Update/Correct Record
- **URL**: `/api/reconciliation/record/:id`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "amount": 1500.00,
    "referenceNumber": "REF123",
    "notes": "Corrected manual mismatch"
  }
  ```
- **Success Response**: Updated record and re-calculated match status.

---

## Dashboard

### Get Summary Stats
- **URL**: `/api/dashboard/stats`
- **Method**: `GET`
- **Query Params**:
  - `startDate`, `endDate`: Filter by date.
  - `status`: Filter by match status.
  - `userId`: Filter by uploader.
- **Success Response**: Summary counts and accuracy percentage.

---

## Audit Logs

### Get Global Audit Logs
- **URL**: `/api/audit`
- **Method**: `GET`
- **Success Response**: List of latest 100 system changes.

### Get Record Audit History
- **URL**: `/api/audit/:recordId`
- **Method**: `GET`
- **Success Response**: Timeline of changes for a specific record.
