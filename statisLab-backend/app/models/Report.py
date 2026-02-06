class Report:
  
    def __init__(self, sessionID):
        self.sessionID = sessionID
        analyses = [];
        # the first element will be the session id
        analyses.append(["sessionID", sessionID])
    
    def addAnalysis(self, analysisResult):
        self.anallyses.append(analysisResult)

    def getReport(self):
        return {
            "session_id": self.sessionId, 
            "analyses": self.analyses
        }
