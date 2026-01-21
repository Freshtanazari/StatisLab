from models.Dataset import Dataset
from typing import Dict
class DatasetStore:

    def __init__(self):
        # create the store if doesnt exist and will store a string as a key and dataset object as value
        self.store : Dict[str: Dataset] = {};

    def addDataset(self,sessionID: str, DatasetObj : Dataset):
        # Add the dataset with its sessionID, if sessionId exist overwrite it
        self.store[sessionID] = DatasetObj

    def getDataset(self, sessionID: str):
        #check if the SessionID exists
        if(sessionID not in self.store):
            # keyError raised when accessing non-existent instance
            raise KeyError("Dataset not found for the sessionID" + {sessionID})
        # else return the dataset
        return self.store[sessionID]
    
    def deleteDataset(self, sessionID : str):
        # delete or return None if the key already doesnt exists
        self.store.pop([sessionID], None)

    def resetDataset(self, sessionID : str):
        # find the dataset
        DatasetObj = self.store.getDataset(sessionID)
        # reset it to the original version
        DatasetObj.reset();
        
    def listSessionIDs(self):
        return list(self.store.keys())
    
        

