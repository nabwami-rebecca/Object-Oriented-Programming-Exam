"use client"

import { useState } from "react"
import { useGradeManager } from "./grade-manager-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { getLetterGrade } from "../lib/grade-utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

export function CourseManagement() {
  const { addCourse, getAllCourses, getCourse, getCourseStudents, calculateCourseAverage } = useGradeManager()

  const [newCourseCode, setNewCourseCode] = useState("")
  const [newCourseName, setNewCourseName] = useState("")
  const [addError, setAddError] = useState("")
  const [addSuccess, setAddSuccess] = useState("")
  const [viewCourseCode, setViewCourseCode] = useState("")
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseAverage, setCourseAverage] = useState(null)
  const [courseStudents, setCourseStudents] = useState([])

  const handleAddCourse = () => {
    if (!newCourseCode || !newCourseName) {
      setAddError("Course Code and Name are required")
      setAddSuccess("")
      return
    }

    const success = addCourse({
      course_code: newCourseCode,
      course_name: newCourseName,
    })

    if (success) {
      setAddSuccess(`Course ${newCourseName} added successfully`)
      setNewCourseCode("")
      setNewCourseName("")
      setAddError("")
    } else {
      setAddError(`Course with code ${newCourseCode} already exists`)
      setAddSuccess("")
    }
  }

  const handleViewCourse = () => {
    const course = getCourse(viewCourseCode)
    setSelectedCourse(course)

    if (course) {
      const students = getCourseStudents(course.course_code)
      setCourseStudents(students)
      setCourseAverage(calculateCourseAverage(course.course_code))
    } else {
      setCourseStudents([])
      setCourseAverage(null)
    }
  }

  const courses = getAllCourses()

  return (
    <Tabs defaultValue="add">
      <TabsList className="grid w-full grid-cols-2 bg-slate-100">
        <TabsTrigger value="add" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
          Add Course
        </TabsTrigger>
        <TabsTrigger value="view" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
          View Courses
        </TabsTrigger>
      </TabsList>

      <TabsContent value="add">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">Add New Course</CardTitle>
            <CardDescription>Enter the details of the new course</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {addError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{addError}</AlertDescription>
              </Alert>
            )}

            {addSuccess && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{addSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="course-code" className="text-slate-700">
                  Course Code
                </Label>
                <Input
                  id="course-code"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  placeholder="e.g., CS101"
                  className="border-slate-300"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="course-name" className="text-slate-700">
                  Course Name
                </Label>
                <Input
                  id="course-name"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g., Introduction to Computer Science"
                  className="border-slate-300"
                />
              </div>

              <Button onClick={handleAddCourse} className="bg-teal-600 hover:bg-teal-700">
                Add Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="view">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">View Courses</CardTitle>
            <CardDescription>View all courses or search for a specific course</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div className="flex gap-4">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="view-course-code" className="text-slate-700">
                    Course Code
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="view-course-code"
                      value={viewCourseCode}
                      onChange={(e) => setViewCourseCode(e.target.value)}
                      placeholder="e.g., CS101"
                      className="border-slate-300"
                    />
                    <Button onClick={handleViewCourse} className="bg-teal-600 hover:bg-teal-700">
                      View
                    </Button>
                  </div>
                </div>
              </div>

              {selectedCourse && (
                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                  <h3 className="text-lg font-medium mb-2 text-slate-800">Course Details</h3>
                  <p className="text-slate-700">
                    <strong>Code:</strong> {selectedCourse.course_code}
                  </p>
                  <p className="text-slate-700">
                    <strong>Name:</strong> {selectedCourse.course_name}
                  </p>

                  {typeof courseAverage === 'number' && !isNaN(courseAverage) && (
                    <>Average Grade: {courseAverage.toFixed(2)} ({getLetterGrade(courseAverage)})</>
                  )}


                  <h4 className="text-md font-medium mt-4 mb-2 text-slate-800">Enrolled Students</h4>
                  {courseStudents.length > 0 ? (
                    <Table>
                      <TableHeader className="bg-slate-100">
                        <TableRow>
                          <TableHead className="text-slate-700">ID</TableHead>
                          <TableHead className="text-slate-700">Name</TableHead>
                          <TableHead className="text-slate-700">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courseStudents.map((student) => (
                          <TableRow key={student.student_id} className="border-b border-slate-200">
                            <TableCell className="font-medium">{student.student_id}</TableCell>
                            <TableCell>{student.student_name}</TableCell>
                            <TableCell>
                              {student.grades[selectedCourse.course_code] !== undefined ? (
                                <>
                                  {student.grades[selectedCourse.course_code]}(
                                  {getLetterGrade(student.grades[selectedCourse.course_code])})
                                </>
                              ) : (
                                "Not graded"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-slate-500">No students enrolled</p>
                  )}
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium mb-2 text-slate-800">All Courses</h3>
                {courses.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-slate-100">
                      <TableRow>
                        <TableHead className="text-slate-700">Code</TableHead>
                        <TableHead className="text-slate-700">Name</TableHead>
                        <TableHead className="text-slate-700">Students Enrolled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => {
                        const students = getCourseStudents(course.course_code)

                        return (
                          <TableRow key={course.course_code} className="border-b border-slate-200">
                            <TableCell className="font-medium">{course.course_code}</TableCell>
                            <TableCell>{course.course_name}</TableCell>
                            <TableCell>{students.length}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-slate-500">No courses found</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
