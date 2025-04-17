from typing import Dict, List, Optional
from student import Student
from course import Course
import json
import os

class GradeManager:
    """
    Central manager for handling student and course data,
    and orchestrating grade operations.
    """

    def __init__(self):
        """Initialize the GradeManager with empty collections."""
        self._students: Dict[str, Student] = {}  ##mapping student_id to Student
        self._courses: Dict[str, Course] = {}    ##mapping course_code to Course
        self._enrollments: Dict[str, List[str]] = {}  ##mapping course_code to list of student_ids

    def add_student(self, student: Student) -> bool:
        """
        Adds a student to the system.
        """
        if student.student_id in self._students:
            return False

        self._students[student.student_id] = student
        return True

    def add_course(self, course: Course) -> bool:
        """
        Adds a course to the system.
        """
        if course.course_code in self._courses:
            return False

        self._courses[course.course_code] = course
        self._enrollments[course.course_code] = []
        return True

    def get_student(self, student_id: str) -> Optional[Student]:
        """Gets a student by their ID."""
        return self._students.get(student_id)

    def get_course(self, course_code: str) -> Optional[Course]:
        """Gets a course by its code."""
        return self._courses.get(course_code)

    def register_student_for_course(self, student_id: str, course_code: str) -> bool:
        """
        Registers a student for a specific course.
        """
        if (student_id not in self._students or
            course_code not in self._courses or
            student_id in self._enrollments.get(course_code, [])):
            return False

        self._enrollments[course_code].append(student_id)
        return True

    def assign_grade(self, student_id: str, course_code: str, grade: float) -> bool:
        """
        Assigns a grade to a student for a specific course.
        """
        if (student_id not in self._students or
            course_code not in self._courses or
            student_id not in self._enrollments.get(course_code, [])):
            return False

        student = self._students[student_id]
        student.add_grade(course_code, grade)
        return True

    def get_student_grades(self, student_id: str) -> Optional[Dict[str, float]]:
        """
        Gets all grades for a specific student.
        """
        student = self._students.get(student_id)
        return student.get_all_grades() if student else None

    def calculate_course_average(self, course_code: str) -> Optional[float]:
        """
        Calculates the average grade for a specific course.
        """
        if course_code not in self._courses:
            return None

        grades = []
        for student_id in self._enrollments.get(course_code, []):
            student = self._students[student_id]
            grade = student.get_grade(course_code)
            if grade is not None:
                grades.append(grade)

        return sum(grades) / len(grades) if grades else None

    def get_all_students(self) -> List[Student]:
        """Gets all students in the system."""
        return list(self._students.values())

    def get_all_courses(self) -> List[Course]:
        """Gets all courses in the system."""
        return list(self._courses.values())

    def get_course_students(self, course_code: str) -> List[Student]:
        """Gets all students enrolled in a specific course."""
        if course_code not in self._courses:
            return []

        student_ids = self._enrollments.get(course_code, [])
        return [self._students[sid] for sid in student_ids if sid in self._students]

    def save_to_json(self, filename: str) -> bool:
        """
        Saves the system data to a JSON file.
        """
        try:
            data = {
                "students": {sid: student.to_dict() for sid, student in self._students.items()},
                "courses": {code: course.to_dict() for code, course in self._courses.items()},
                "enrollments": self._enrollments
            }

            with open(filename, 'w') as f:
                json.dump(data, f, indent=4)
            return True
        except Exception as e:
            print(f"Error saving data: {e}")
            return False

    @classmethod
    def load_from_json(cls, filename: str) -> Optional['GradeManager']:
        """
        Loads system data from a JSON file.
        """
        if not os.path.exists(filename):
            return None

        try:
            with open(filename, 'r') as f:
                data = json.load(f)

            manager = cls()

            for course_data in data["courses"].values():
                course = Course.from_dict(course_data)
                manager._courses[course.course_code] = course

            for student_data in data["students"].values():
                student = Student.from_dict(student_data)
                manager._students[student.student_id] = student

            manager._enrollments = data["enrollments"]
            return manager
        except Exception as e:
            print(f"Error loading data: {e}")
            return None

    def generate_student_transcript(self, student_id: str) -> Optional[Dict]:
        """
        Generates a complete transcript for a specific student.
        """
        student = self.get_student(student_id)
        if not student:
            return None

        return student.get_transcript(self)

    def print_student_transcript(self, student_id: str) -> bool:
        """
        Prints a formatted transcript for a specific student.
        """
        transcript = self.generate_student_transcript(student_id)
        if not transcript:
            return False

        print("\n" + "="*60)
        print(f"TRANSCRIPT FOR: {transcript['student_name']} (ID: {transcript['student_id']})")
        print("="*60)
        print(f"GPA: {transcript['gpa']:.2f}")
        print(f"Courses Taken: {transcript['total_courses']}")
        print(f"Courses Passed: {transcript['passed_courses']}")
        print("-"*60)
        print(f"{'COURSE CODE':<12} {'COURSE NAME':<30} {'GRADE':<8} {'STATUS':<6}")
        print("-"*60)

        for course in transcript['courses']:
            print(f"{course['course_code']:<12} {course['course_name']:<30} "
                  f"{course['letter_grade']:<8} {course['status']:<6}")

        print("="*60)
        return True
    
class GradeCategory:
    """Utility class for categorizing numeric grades into letter grades."""

    @staticmethod
    def get_letter_grade(numeric_grade: float) -> str:
        """
        Convert a numeric grade to a letter grade based on predefined ranges.

        Args:
            numeric_grade: The numeric grade value

        Returns:
            The corresponding letter grade
        """
        if numeric_grade >= 80:
            return "A"
        elif numeric_grade >= 75:
            return "B+"
        elif numeric_grade >= 70:
            return "B-"
        elif numeric_grade >= 60:
            return "C+"
        elif numeric_grade >= 50:
            return "C-"
        elif numeric_grade >= 40:
            return "E"
        else:
            return "F"

    @staticmethod
    def is_passing(numeric_grade: float) -> bool:
        """
        Determine if a grade is a passing grade (40 or above).

        Args:
            numeric_grade: The numeric grade value

        Returns:
            True if the grade is passing, False otherwise
        """
        return numeric_grade >= 40