"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { getLetterGrade, isPassing, calculateGPA } from "../lib/grade-utils"

const GradeManagerContext = createContext(undefined)
const API_BASE_URL = "http://127.0.0.1:8000"

export function GradeManagerProvider({ children }) {
  const [students, setStudents] = useState({})
  const [courses, setCourses] = useState({})
  const [enrollments, setEnrollments] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const studentsResponse = await fetch(`${API_BASE_URL}/students/`)
        const studentsData = await studentsResponse.json()
        
        const studentsObj = {}
        const studentsArray = Array.isArray(studentsData) ? studentsData : [studentsData]
        
        studentsArray.forEach(student => {
          studentsObj[student.student_id] = {
            ...student,
            grades: {} 
          }
        })
        setStudents(studentsObj)
        
        // Fetch all courses
        const coursesResponse = await fetch(`${API_BASE_URL}/courses/`)
        const coursesData = await coursesResponse.json()
        
        // Convert array to object with course_code as key
        const coursesObj = {}
        const enrollmentsObj = {}
        
        // Ensure coursesData is an array
        const coursesArray = Array.isArray(coursesData) ? coursesData : [coursesData]
        
        coursesArray.forEach(course => {
          coursesObj[course.course_code] = course
          enrollmentsObj[course.course_code] = []
        })
        setCourses(coursesObj)
        setEnrollments(enrollmentsObj)

        for (const studentId of Object.keys(studentsObj)) {
          try {
            const gradesResponse = await fetch(`${API_BASE_URL}/grades/student/${studentId}`)
            const gradesData = await gradesResponse.json()
            
            const gradesArray = Array.isArray(gradesData) ? gradesData : []
            
            gradesArray.forEach(grade => {
              if (grade.course_code && !enrollmentsObj[grade.course_code]?.includes(studentId)) {
                enrollmentsObj[grade.course_code] = [
                  ...(enrollmentsObj[grade.course_code] || []),
                  studentId
                ]
              }
              s
              if (grade.course_code && grade.grade !== undefined) {
                studentsObj[studentId].grades[grade.course_code] = grade.grade
              }
            })
          } catch (error) {
            console.error(`Error fetching grades for student ${studentId}:`, error)
          }
        }
        
        setEnrollments(enrollmentsObj)
        setStudents(studentsObj)
      } catch (error) {
        console.error("Failed to load data from API:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const addStudent = async (student) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: student.student_id,
          student_name: student.student_name
        }),
      })
      
      if (!response.ok) {
        return false
      }
      
      const newStudent = await response.json()
      
      setStudents(prev => ({
        ...prev,
        [newStudent.student_id]: {
          ...newStudent,
          grades: {}
        }
      }))
      
      return true
    } catch (error) {
      console.error("Failed to add student:", error)
      return false
    }
  }

  const addCourse = async (course) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_code: course.course_code,
          course_name: course.course_name
        }),
      })
      
      if (!response.ok) {
        return false
      }
      
      const newCourse = await response.json()
      
      setCourses(prev => ({
        ...prev,
        [newCourse.course_code]: newCourse
      }))
      
      setEnrollments(prev => ({
        ...prev,
        [newCourse.course_code]: []
      }))
      
      return true
    } catch (error) {
      console.error("Failed to add course:", error)
      return false
    }
  }

  const getStudent = (studentId) => {
    // First check if we already have this student in state
    return students[studentId] || null;
  }

  const getCourse = (courseCode) => {
    // First check if we already have this course in state
    return courses[courseCode] || null;  
  }

  const getAllStudents = () => {
    return Object.values(students)
  }

  const getAllCourses = () => {
    return Object.values(courses)
  }

  const registerStudentForCourse = async (studentId, courseCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grades/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          course_code: courseCode
        }),
      })
      
      if (!response.ok) {
        return false
      }
      
      // Update local state
      setEnrollments(prev => ({
        ...prev,
        [courseCode]: [...(prev[courseCode] || []), studentId],
      }))
      
      return true
    } catch (error) {
      console.error("Failed to register student for course:", error)
      return false
    }
  }

  const assignGrade = async (studentId, courseCode, grade) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grades/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          course_code: courseCode,
          grade: grade
        }),
      })
      
      if (!response.ok) {
        return false
      }
      
      // Update local state
      setStudents(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          grades: {
            ...prev[studentId].grades,
            [courseCode]: grade,
          },
        },
      }))
      
      return true
    } catch (error) {
      console.error("Failed to assign grade:", error)
      return false
    }
  }

  const getStudentGrades = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grades/student/${studentId}`)
      if (!response.ok) {
        return null
      }
      
      const grades = await response.json()
      
      // Format grades as an object with course_code as key and grade as value
      const formattedGrades = {}
      
      // Ensure grades is an array
      const gradesArray = Array.isArray(grades) ? grades : []
      
      gradesArray.forEach(grade => {
        if (grade.course_code && grade.grade !== undefined) {
          formattedGrades[grade.course_code] = grade.grade
        }
      })
      
      // Update student grades in local state
      setStudents(prev => {
        if (!prev[studentId]) return prev;
        
        return {
          ...prev,
          [studentId]: {
            ...prev[studentId],
            grades: formattedGrades
          }
        }
      })
      
      return formattedGrades
    } catch (error) {
      console.error(`Failed to get grades for student ${studentId}:`, error)
      return null
    }
  }

  const getCourseStudents = (courseCode) => {
    // Use the cached data from state
    const studentIds = enrollments[courseCode] || [];
    return studentIds.map(id => students[id]).filter(Boolean);
  }

  const calculateCourseAverage = async (courseCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grades/course/${courseCode}`)
      if (!response.ok) {
        return null
      }
      
      const courseGrades = await response.json()
      
      // Ensure courseGrades is an array
      const gradesArray = Array.isArray(courseGrades) ? courseGrades : []
      
      if (gradesArray.length === 0) {
        return null
      }
      
      const grades = gradesArray.map(item => item.grade).filter(grade => grade !== undefined)
      
      if (grades.length === 0) {
        return null
      }
      
      return Number((grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toFixed(2))
    } catch (error) {
      console.error(`Failed to calculate average for course ${courseCode}:`, error)
      return null
    }
  }

  const generateStudentTranscript = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/transcript/${studentId}`)
      if (!response.ok) {
        return null
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Failed to generate transcript for student ${studentId}:`, error)
      return null
    }
  }

  const generateCourseSummary = async (courseCode) => {
    try {
      const course = getCourse(courseCode)
      if (!course) {
        return null
      }
      
      const response = await fetch(`${API_BASE_URL}/grades/course/${courseCode}`)
      if (!response.ok) {
        return null
      }
      
      const courseGrades = await response.json()
      
      // Ensure courseGrades is an array
      const gradesArray = Array.isArray(courseGrades) ? courseGrades : []
      
      if (gradesArray.length === 0) {
        return {
          course_code: courseCode,
          course_name: course.course_name,
          total_students: 0,
          graded_students: 0,
          average_grade: 0,
          highest_grade: 0,
          lowest_grade: 0,
          pass_rate: 0,
          grade_distribution: {},
        }
      }
      
      const grades = gradesArray.map(item => item.grade).filter(grade => grade !== undefined)
      
      if (grades.length === 0) {
        return {
          course_code: courseCode,
          course_name: course.course_name,
          total_students: gradesArray.length,
          graded_students: 0,
          average_grade: 0,
          highest_grade: 0,
          lowest_grade: 0,
          pass_rate: 0,
          grade_distribution: {},
        }
      }
      
      const gradeDistribution = {
        A: 0,
        "B+": 0,
        "B-": 0,
        "C+": 0,
        "C-": 0,
        E: 0,
        F: 0,
      }
      
      let passingCount = 0
      
      for (const grade of grades) {
        const letterGrade = getLetterGrade(grade)
        gradeDistribution[letterGrade] = (gradeDistribution[letterGrade] || 0) + 1
        
        if (isPassing(grade)) {
          passingCount++
        }
      }
      
      return {
        course_code: courseCode,
        course_name: course.course_name,
        total_students: gradesArray.length,
        graded_students: grades.length,
        average_grade: Number((grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toFixed(2)),
        highest_grade: Math.max(...grades),
        lowest_grade: Math.min(...grades),
        pass_rate: Number(((passingCount / grades.length) * 100).toFixed(2)),
        grade_distribution: gradeDistribution,
      }
    } catch (error) {
      console.error(`Failed to generate summary for course ${courseCode}:`, error)
      return null
    }
  }

  const value = {
    students,
    courses,
    enrollments,
    loading,
    addStudent,
    addCourse,
    getStudent,
    getCourse,
    getAllStudents,
    getAllCourses,
    registerStudentForCourse,
    assignGrade,
    getStudentGrades,
    getCourseStudents,
    calculateCourseAverage,
    generateStudentTranscript,
    generateCourseSummary,
  }

  return <GradeManagerContext.Provider value={value}>{children}</GradeManagerContext.Provider>
}

export function useGradeManager() {
  const context = useContext(GradeManagerContext)
  if (context === undefined) {
    throw new Error("useGradeManager must be used within a GradeManagerProvider")
  }
  return context
}