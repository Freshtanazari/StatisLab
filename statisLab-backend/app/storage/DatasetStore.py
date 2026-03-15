from ..models.Dataset import Dataset
import os
import time
from threading import Lock
from typing import Dict

class DatasetStore:

    def __init__(self):
        # create the store if doesnt exist and will store a string as a key and dataset object as value
        self.store: Dict[str, Dataset] = {}
        self.access_times: Dict[str, float] = {}
        self.lock = Lock()
        self.max_entries = int(os.getenv("DATASET_STORE_MAX_ENTRIES", "100"))
        min_ttl_seconds = 60 * 60 * 5
        configured_ttl_seconds = int(os.getenv("DATASET_STORE_TTL_SECONDS", str(min_ttl_seconds)))
        self.ttl_seconds = max(configured_ttl_seconds, min_ttl_seconds)

    def _evict_expired_locked(self):
        now = time.time()
        expired_session_ids = [
            session_id
            for session_id, last_accessed in self.access_times.items()
            if now - last_accessed > self.ttl_seconds
        ]
        for session_id in expired_session_ids:
            self.store.pop(session_id, None)
            self.access_times.pop(session_id, None)

    def _touch_locked(self, sessionID: str):
        self.access_times[sessionID] = time.time()

    def _evict_if_needed_locked(self):
        while len(self.store) >= self.max_entries and self.access_times:
            oldest_session_id = min(self.access_times, key=self.access_times.get)
            self.store.pop(oldest_session_id, None)
            self.access_times.pop(oldest_session_id, None)

    def addDataset(self, sessionID: str, datasetObj: Dataset):
        # Add the dataset with its sessionID, if sessionId exist overwrite it
        with self.lock:
            self._evict_expired_locked()
            if sessionID not in self.store:
                self._evict_if_needed_locked()
            self.store[sessionID] = datasetObj
            self._touch_locked(sessionID)

    def getDataset(self, sessionID: str):
        # check if the SessionID exists
        with self.lock:
            self._evict_expired_locked()
            if sessionID not in self.store:
                # KeyError raised when accessing non-existent instance
                raise KeyError(f"Dataset not found for sessionID {sessionID}")
            self._touch_locked(sessionID)
            # else return the dataset
            return self.store[sessionID]

    def deleteDataset(self, sessionID: str):
        # delete or return None if the key already doesnt exist
        with self.lock:
            self.store.pop(sessionID, None)
            self.access_times.pop(sessionID, None)

    def resetDataset(self, sessionID: str):
        # find the dataset
        dataset_obj = self.getDataset(sessionID)
        # reset it to the original version
        dataset_obj.reset()

    def listSessionIDs(self):
        # return all stored session IDs
        with self.lock:
            self._evict_expired_locked()
            return list(self.store.keys())