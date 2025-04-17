from typing import Dict
class Course:
    """Represents a course entity in the grade management system."""

    def __init__(self, course_code: str, course_name: str):
        self._course_code = course_code
        self._course_name = course_name

    @property
    def course_code(self) -> str:
        """Getting the course code."""
        return self._course_code

    @property
    def course_name(self) -> str:
        """Getting the course name."""
        return self._course_name

    def __str__(self) -> str:
        """String representation of the Course."""
        return f"{self._course_code}: {self._course_name}"

    def to_dict(self) -> Dict:
        """Converting Course object to dictionary for JSON serialization."""
        return {
            "course_code": self._course_code,
            "course_name": self._course_name
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Course':
        """Creating a Course object from a dictionary."""
        return cls(data["course_code"], data["course_name"])