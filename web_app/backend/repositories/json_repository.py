import os
import json
from typing import Optional
from pathlib import Path
from models.domain_models import GradeManager

class JSONRepository:
    """Repository for storing and retrieving data using JSON files."""
    
    def __init__(self, file_path: str = "data/grade_data.json"):
        """
        Initialize the JSON repository.
        
        Args:
            file_path: Path to the JSON file
        """
        self.file_path = file_path
        
        # Ensure the directory exists
        directory = os.path.dirname(file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)
    
    def save(self, manager: GradeManager) -> bool:
        """
        Save the GradeManager data to a JSON file.
        
        Args:
            manager: GradeManager object to save
            
        Returns:
            True if saved successfully, False otherwise
        """
        try:
            data = manager.to_dict()
            
            with open(self.file_path, 'w') as f:
                json.dump(data, f, indent=4)
            return True
        except Exception as e:
            print(f"Error saving data: {e}")
            return False
    
    def load(self) -> Optional[GradeManager]:
        """
        Load GradeManager data from a JSON file.
        
        Returns:
            GradeManager object or None if loading fails
        """
        if not os.path.exists(self.file_path):
            # Return a new manager if the file doesn't exist
            return GradeManager()
        
        try:
            with open(self.file_path, 'r') as f:
                data = json.load(f)
            
            manager = GradeManager.from_dict(data)
            return manager
        except Exception as e:
            print(f"Error loading data: {e}")
            return None