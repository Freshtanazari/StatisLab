# StatisLab Learning Playbook (Beginner Friendly)

This file is your step-by-step learning map for finishing this project and understanding *why* each piece matters.

Goal: Learn while building, not just copy code.

---

## How to use this file

1. Read one step.
2. Apply only that step.
3. Run the app.
4. Test one endpoint.
5. Move to the next step.

Think of it like building with blocks: one block at a time.

---

## Step 1: Think about architecture (project design)

### Kid version
Your app is a kitchen.
- API routes = waiter (takes orders)
- Services = chef (does work)
- Models = recipe cards (shape of data)
- Store/Repository = fridge (where data is kept)

If the waiter also cooks and manages fridge and billing, chaos happens.

### Current project mapping
- `app/api/routes.py` -> waiter
- `app/services/preprocessor.py` -> chef
- `app/models/Dataset.py` -> recipe card
- `app/storage/DatasetStore.py` -> fridge (currently memory fridge)

### What to improve
Use a repository interface so routes/services do not care if storage is memory or MySQL.

### Example design
```python
# app/storage/base.py
from abc import ABC, abstractmethod
from app.models.Dataset import Dataset

class DatasetRepository(ABC):
    @abstractmethod
    def add_dataset(self, session_id: str, dataset: Dataset) -> None:
        ...

    @abstractmethod
    def get_dataset(self, session_id: str) -> Dataset:
        ...
```

Then make two implementations:
- `InMemoryDatasetRepository`
- `MySQLDatasetRepository`

Now switching storage is easy.

---

## Step 2: Design API endpoints

### Kid version
Endpoints are doors to your house.
Each door should have one clear purpose.

### Good endpoint rules
1. Use nouns, not verbs in path when possible.
2. Use HTTP method to express action.
3. Request and response must have clear schema.
4. Return proper status codes.

### In your project (better style)
- `POST /datasets/upload`
- `GET /datasets/{session_id}/summary`
- `POST /datasets/{session_id}/preprocess`
- `GET /datasets/{session_id}/audit.xlsx`
- `POST /datasets/{session_id}/tests`

### Request model example
```python
from pydantic import BaseModel, Field
from typing import Any, Dict

class PreprocessActionRequest(BaseModel):
    action: str = Field(..., examples=["dropCol", "changeDtype"])
    params: Dict[str, Any] = Field(default_factory=dict)
```

### Response model example
```python
class ApiError(BaseModel):
    code: str
    message: str

class PreprocessActionResponse(BaseModel):
    message: str
```

### Why this helps
Frontend gets predictable JSON every time.

---

## Step 3: Create data models

### Kid version
A model is a labeled box.
It says what can go inside and what cannot.

### Model layers you should have
1. **Domain model** (internal object): `Dataset`
2. **API model** (request/response): Pydantic classes
3. **DB model** (tables): SQLAlchemy models

### Suggested DB tables for this project
1. `sessions`
- `id` (PK)
- `created_at`

2. `datasets`
- `session_id` (FK)
- `schema_json`
- `original_file_path` (or blob id)
- `current_file_path` (or blob id)

3. `audit_logs`
- `id`
- `session_id`
- `timestamp`
- `details`

4. `analysis_results`
- `id`
- `session_id`
- `analysis_type`
- `result_json`

### Important practical point
For large CSV data, do not always store all rows in MySQL.
Store file in object storage (or disk for now), and keep metadata in MySQL.

---

## Step 4: Write clean and readable code

### Kid version
Clean code is like clean room:
- things have names
- things are in right place
- easy to find toys

### Rules to apply immediately
1. Use `PascalCase` for classes, `snake_case` for methods/variables.
2. Keep route functions thin, move logic to services.
3. Never use `print` in API code; use logging.
4. Keep functions short and single purpose.
5. Use type hints everywhere.

### Real examples from your current code
1. Class name `preprocessor` should be `Preprocessor`.
2. Typo mismatch in dataset model:
- one place uses `df_original`
- other places still use `df_orginal`

This causes runtime bugs.

### Logging example
```python
import logging
logger = logging.getLogger(__name__)

logger.info("Preprocess action started", extra={"session_id": session_id, "action": action})
```

---

## Step 5: Handle edge cases and errors correctly

### Kid version
Before crossing the road, check both sides.
Before changing data, check inputs.

### In this project, always validate
1. session id exists
2. action name is allowed
3. required params are present
4. column exists
5. dtype conversion is valid
6. file is valid CSV

### Use FastAPI errors, not generic dict errors
```python
from fastapi import HTTPException

if session_not_found:
    raise HTTPException(status_code=404, detail="Session not found")

if invalid_action:
    raise HTTPException(status_code=400, detail="Invalid preprocess action")
```

### Error contract (frontend friendly)
```json
{
  "code": "SESSION_NOT_FOUND",
  "message": "Session not found"
}
```

### Suggested status code map
- `400` bad request input
- `404` missing session/resource
- `409` conflict (duplicate operation)
- `422` schema validation error
- `500` unexpected server error

---

## Step 6: One-day shipping plan (practical)

If your deadline is tomorrow, do this order:

1. Freeze features now.
2. Fix correctness bugs first.
3. Make responses consistent.
4. Add minimal persistence.
5. Run smoke tests with frontend.

### Priority checklist

#### P0 (must do)
1. Fix `df_original` vs `df_orginal` bug in `Dataset` model.
2. Replace `return {"error": str(e)}` with `HTTPException` in routes.
3. Ensure endpoint names are unique functions (avoid repeated `run_action` names).
4. Add basic persistent storage for sessions + audit logs.

#### P1 (should do)
1. Add request/response Pydantic models for each major endpoint.
2. Add logging with session id in all actions.
3. Add tests for upload, preprocess, and one statistical test.

#### P2 (nice to have)
1. Full MySQL row-level dataset persistence.
2. Better auth/security.

---

## Step 7: API design template you can copy

```python
@router.post("/datasets/{session_id}/preprocess", response_model=PreprocessActionResponse)
def preprocess_dataset(session_id: str, req: PreprocessActionRequest):
    # 1) Validate input
    # 2) Fetch session/dataset
    # 3) Execute service action
    # 4) Persist changes
    # 5) Return typed response
    ...
```

---

## Step 8: Service design template you can copy

```python
class PreprocessorService:
    def __init__(self, repo: DatasetRepository):
        self.repo = repo

    def run_action(self, session_id: str, action: str, params: dict) -> str:
        dataset = self.repo.get_dataset(session_id)
        # validate + execute action
        # write audit log
        self.repo.save_dataset(session_id, dataset)
        return "Action completed"
```

---

## Step 9: What success looks like

You are done when:
1. Frontend can upload CSV and get session id.
2. Frontend can call preprocess action reliably.
3. Audit download works.
4. Restart backend and previous session metadata still exists (if persistence enabled).
5. Errors are predictable for frontend.

---

## Step 10: Learning reflection prompts

After each coding session, answer:
1. Did I keep route thin and logic in service?
2. Did I validate all dangerous inputs?
3. Did I return proper status code?
4. Did I avoid hidden side effects?
5. Can frontend trust my response shape?

If all five are yes, your backend is becoming production-style.

---

## Quick words of encouragement

For a first end-to-end project, your structure is already good enough to evolve.
You already separated routes/services/models/storage, which many beginners do not do.
Now you just need consistency, error discipline, and persistence.
