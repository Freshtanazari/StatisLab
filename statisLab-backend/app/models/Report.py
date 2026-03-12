class Report:
  
    def __init__(self):
        self.analyses = list()

    def addAnalysis(self, analysisResult):
        self.analyses.append(analysisResult)

    def removeAnalysis(self, index):
        if not (0 <= index < len(self.analyses)):
            raise IndexError("The index doesnt exist")
        self.analyses.pop(index)

    def returnAnalysis(self, index):
        if not (0 <= index < len(self.analyses)):
            raise IndexError("The index doesnt exist")
        return self.analyses[index]
    
    def returnAllAnalysis(self):
        return self.analyses
    
    def insertAnalysis(self, index, analysisResult):
        if not (0 <= index <= len(self.analyses)):
            raise IndexError("The index doesnt exist")
        self.analyses.insert(index, analysisResult)
    
