import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { StudentManagement } from "./components/student-management"
import { CourseManagement } from "./components/course-management"
import { GradeManagement } from "./components/grade-management"
import { Reports } from "./components/reports"
import { DataManagement } from "./components/data-management"
import { Analytics } from "./components/analytics"
import { GradeManagerProvider } from "./components/grade-manager-context"

function App() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">Grade Management System</h1>
          <p className="mt-2 text-slate-600">Comprehensive academic record management for instructors</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <GradeManagerProvider>
            <Tabs defaultValue="students" className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-slate-100">
                <TabsTrigger
                  value="students"
                  className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                >
                  Students
                </TabsTrigger>
                <TabsTrigger value="courses" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Courses
                </TabsTrigger>
                <TabsTrigger value="grades" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Grades
                </TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Reports
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="data" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="mt-6">
                <StudentManagement />
              </TabsContent>

              <TabsContent value="courses" className="mt-6">
                <CourseManagement />
              </TabsContent>

              <TabsContent value="grades" className="mt-6">
                <GradeManagement />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <Reports />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <Analytics />
              </TabsContent>

              <TabsContent value="data" className="mt-6">
                <DataManagement />
              </TabsContent>
            </Tabs>
          </GradeManagerProvider>
        </div>
      </div>
    </main>
  )
}

export default App
