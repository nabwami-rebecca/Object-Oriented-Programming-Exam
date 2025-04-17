"use client"

import { useState } from "react"
import { useGradeManager } from "./grade-manager-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { getLetterGrade } from "../lib/grade-utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

export function GradeManagement() {
  const {
    getStudent,
    getCourse,
    getAllStudents,
    getAllCourses,
    getCourseStudents,
    assignGrade,
    calculateCourseAverage,
  } = useGradeManager()

  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [selectedCourseCode, setSelectedCourseCode] = useState("")
  const [gradeValue, setGradeValue] = useState("")
  const [assignError, setAssignError] = useState("")
  const [assignSuccess, setAssignSuccess] = useState("")
  const [viewStudentId, setViewStudentId] = useState("")
  const [studentGrades, setStudentGrades] = useState(null)
  const [viewCourseCode, setViewCourseCode] = useState("")
  const [courseAverage, setCourseAverage] = useState(null)

  const students = getAllStudents()
  const courses = getAllCourses()

  const handleAssignGrade = () => {
    if (!selectedStudentId || !selectedCourseCode || !gradeValue) {
      setAssignError("Student, Course, and Grade are required")
      setAssignSuccess("")
      return
    }

    const numericGrade = Number.parseFloat(gradeValue)
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      setAssignError("Grade must be a number between 0 and 100")
      setAssignSuccess("")
      return
    }

    const success = assignGrade(selectedStudentId, selectedCourseCode, numericGrade)

    if (success) {
      setAssignSuccess(`Grade ${numericGrade} (${getLetterGrade(numericGrade)}) assigned successfully`)
      setAssignError("")
      setGradeValue("")
    } else {
      setAssignError("Failed to assign grade. The student may not be registered for this course.")
      setAssignSuccess("")
    }
  }

  const handleViewStudentGrades = () => {
    const student = getStudent(viewStudentId)
    if (student) {
      const gradesWithCourseNames = Object.entries(student.grades).map(([courseCode, grade]) => {
        const course = getCourse(courseCode)
        return {
          courseCode,
          courseName: course?.course_name || "Unknown Course",
          grade,
          letterGrade: getLetterGrade(grade),
        }
      })

      setStudentGrades({
        student,
        grades: gradesWithCourseNames,
      })
    } else {
      setStudentGrades(null)
    }
  }

  const handleCalculateCourseAverage = () => {
    const average = calculateCourseAverage(viewCourseCode)
    setCourseAverage(average)
  }

  return (
    <Tabs defaultValue="assign">
      <TabsList className="grid w-full grid-cols-3 bg-slate-100">
        <TabsTrigger value="assign" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
          Assign Grade
        </TabsTrigger>
        <TabsTrigger value="view" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
          View Student Grades
        </TabsTrigger>
        <TabsTrigger value="average" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
          Calculate Course Average
        </TabsTrigger>
      </TabsList>

      <TabsContent value="assign">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">Assign Grade</CardTitle>
            <CardDescription>Assign a grade to a student for a specific course</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {assignError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{assignError}</AlertDescription>
              </Alert>
            )}

            {assignSuccess && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{assignSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="assign-student" className="text-slate-700">
                  Student
                </Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.student_id} value={student.student_id}>
                        {student.student_id}: {student.student_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assign-course" className="text-slate-700">
                  Course
                </Label>
                <Select value={selectedCourseCode} onValueChange={setSelectedCourseCode}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.course_code} value={course.course_code}>
                        {course.course_code}: {course.course_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="grade-value" className="text-slate-700">
                  Grade (0-100)
                </Label>
                <Input
                  id="grade-value"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  placeholder="e.g., 85.5"
                  className="border-slate-300"
                />
              </div>

              <Button onClick={handleAssignGrade} className="bg-teal-600 hover:bg-teal-700">
                Assign Grade
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="view">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">View Student Grades</CardTitle>
            <CardDescription>View all grades for a specific student</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div className="flex gap-4">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="view-student-grades" className="text-slate-700">
                    Student
                  </Label>
                  <Select value={viewStudentId} onValueChange={setViewStudentId}>
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.student_id} value={student.student_id}>
                          {student.student_id}: {student.student_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="mt-8 bg-teal-600 hover:bg-teal-700" onClick={handleViewStudentGrades}>
                  View Grades
                </Button>
              </div>

              {studentGrades && (
                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                  <h3 className="text-lg font-medium mb-2 text-slate-800">
                    Grades for {studentGrades.student.student_name} ({studentGrades.student.student_id})
                  </h3>

                  {studentGrades.grades.length > 0 ? (
                    <Table>
                      <TableHeader className="bg-slate-100">
                        <TableRow>
                          <TableHead className="text-slate-700">Course Code</TableHead>
                          <TableHead className="text-slate-700">Course Name</TableHead>
                          <TableHead className="text-slate-700">Grade</TableHead>
                          <TableHead className="text-slate-700">Letter Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentGrades.grades.map((grade) => (
                          <TableRow key={grade.courseCode} className="border-b border-slate-200">
                            <TableCell className="font-medium">{grade.courseCode}</TableCell>
                            <TableCell>{grade.courseName}</TableCell>
                            <TableCell>{grade.grade.toFixed(1)}</TableCell>
                            <TableCell className="font-medium">{grade.letterGrade}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-slate-500">No grades recorded for this student</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="average">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">Calculate Course Average</CardTitle>
            <CardDescription>Calculate the average grade for a specific course</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div className="flex gap-4">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="view-course-average" className="text-slate-700">
                    Course
                  </Label>
                  <Select value={viewCourseCode} onValueChange={setViewCourseCode}>
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.course_code} value={course.course_code}>
                          {course.course_code}: {course.course_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="mt-8 bg-teal-600 hover:bg-teal-700" onClick={handleCalculateCourseAverage}>
                  Calculate
                </Button>
              </div>

              {courseAverage !== null && (
                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                  <h3 className="text-lg font-medium mb-2 text-slate-800">
                    Course Average: {courseAverage.toFixed(2)} ({getLetterGrade(courseAverage)})
                  </h3>

                  <div className="mt-4">
                    <h4 className="text-md font-medium mb-2 text-slate-800">Student Grades</h4>
                    {viewCourseCode && (
                      <Table>
                        <TableHeader className="bg-slate-100">
                          <TableRow>
                            <TableHead className="text-slate-700">Student ID</TableHead>
                            <TableHead className="text-slate-700">Student Name</TableHead>
                            <TableHead className="text-slate-700">Grade</TableHead>
                            <TableHead className="text-slate-700">Letter Grade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getCourseStudents(viewCourseCode)
                            .map((student) => {
                              const grade = student.grades[viewCourseCode]
                              if (grade === undefined) return null

                              return (
                                <TableRow key={student.student_id} className="border-b border-slate-200">
                                  <TableCell className="font-medium">{student.student_id}</TableCell>
                                  <TableCell>{student.student_name}</TableCell>
                                  <TableCell>{grade.toFixed(1)}</TableCell>
                                  <TableCell className="font-medium">{getLetterGrade(grade)}</TableCell>
                                </TableRow>
                              )
                            })
                            .filter(Boolean)}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
