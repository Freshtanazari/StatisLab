from abc import ABC, abstractmethod

class StatisticalTest(ABC): # passing abc so python treats it as an abstract class 


    @abstractmethod 
    def checkAssumptions(self) -> dict:
        pass
    
    @abstractmethod 
    def nullHypothesis(self) -> str:
        pass
    
    @abstractmethod
    def alternativeHypothesis(self) -> str:
        pass

    @abstractmethod 
    def run(self) -> dict: # returns a dictionary
        pass

    @abstractmethod 
    def effect_size(self) -> dict: 
        pass

