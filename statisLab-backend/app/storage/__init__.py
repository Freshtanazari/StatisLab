from .datasetStore import DatasetStore

Store = DatasetStore()  # singleton where only one instance of this class is ever
# meant to ever exist for the whole program

# by creating it here i can always get the same instance like a shared resource.