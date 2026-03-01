from ..models.Dataset import Dataset
from typing import Dict

class DatasetStore:

    def __init__(self):
        # create the store if doesnt exist and will store a string as a key and dataset object as value
        self.store: Dict[str, Dataset] = {}

    def addDataset(self, sessionID: str, datasetObj: Dataset):
        # Add the dataset with its sessionID, if sessionId exist overwrite it
        self.store[sessionID] = datasetObj

    def getDataset(self, sessionID: str):
        # check if the SessionID exists
        if sessionID not in self.store:
            # KeyError raised when accessing non-existent instance
            raise KeyError(f"Dataset not found for sessionID {sessionID}")
        # else return the dataset
        return self.store[sessionID]

    def deleteDataset(self, sessionID: str):
        # delete or return None if the key already doesnt exist
        self.store.pop(sessionID, None)

    def resetDataset(self, sessionID: str):
        # find the dataset
        dataset_obj = self.getDataset(sessionID)
        # reset it to the original version
        dataset_obj.reset()

    def listSessionIDs(self):
        # return all stored session IDs
        return list(self.store.keys())