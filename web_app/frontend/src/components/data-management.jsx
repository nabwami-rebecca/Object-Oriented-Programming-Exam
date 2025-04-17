"use client"

import { useState } from "react"
import { useGradeManager } from "./grade-manager-context"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Textarea } from "./ui/textarea"
import { AlertCircle, CheckCircle2, Download, Upload } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

export function DataManagement() {
  const { saveData, loadData } = useGradeManager()
  const [jsonData, setJsonData] = useState("")
  const [loadError, setLoadError] = useState("")
  const [loadSuccess, setLoadSuccess] = useState("")

  const handleSaveData = () => {
    const data = saveData()
    setJsonData(data)
  }

  const handleLoadData = () => {
    if (!jsonData.trim()) {
      setLoadError("Please enter JSON data to load")
      setLoadSuccess("")
      return
    }

    try {
      const success = loadData(jsonData)
      if (success) {
        setLoadSuccess("Data loaded successfully")
        setLoadError("")
      } else {
        setLoadError("Failed to load data. Invalid format.")
        setLoadSuccess("")
      }
    } catch (error) {
      setLoadError("Failed to parse JSON data")
      setLoadSuccess("")
    }
  }

  const handleDownloadData = () => {
    const data = saveData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "grade_data.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Tabs defaultValue="save">
      <TabsList className="grid w-full grid-cols-2 bg-slate-100">
        <TabsTrigger value="save" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
          Save Data
        </TabsTrigger>
        <TabsTrigger value="load" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
          Load Data
        </TabsTrigger>
      </TabsList>

      <TabsContent value="save">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">Save Data</CardTitle>
            <CardDescription>Save the current system data to JSON</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <Button onClick={handleSaveData} className="w-full bg-teal-600 hover:bg-teal-700">
                Generate JSON Data
              </Button>

              {jsonData && (
                <>
                  <Textarea
                    value={jsonData}
                    readOnly
                    className="min-h-[300px] font-mono text-sm border-slate-300 bg-slate-50"
                  />

                  <Button
                    onClick={handleDownloadData}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
                  >
                    <Download className="w-4 h-4" />
                    Download JSON File
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="load">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">Load Data</CardTitle>
            <CardDescription>Load system data from JSON</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loadError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loadError}</AlertDescription>
              </Alert>
            )}

            {loadSuccess && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{loadSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <Textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder="Paste your JSON data here..."
                className="min-h-[300px] font-mono text-sm border-slate-300"
              />

              <Button onClick={handleLoadData} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
                <Upload className="w-4 w-4" />
                Load Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
