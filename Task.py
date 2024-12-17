class Task:

    def __init__(self, title, id):
        self.title = title
        self.status = "[incomplete]"
        self.id = id
    
    def __init__(self, id, status, title):
        self.id = id
        self.setStatus(status)
        self.title = title

    def getTitle(self):
        return self.title

    def getStatus(self):
        return self.status

    def setStatus(self, status):
        self.status = status

    def getId(self):
        return str(self.id)

    def toString(self):
        return "/"+ self.getId() + "/" + self.getStatus() + "/" + self.getTitle() + "|"
    
    def toText(self):
        return "ID: "+ self.getId() + " " + self.getStatus() + " " + self.getTitle()
