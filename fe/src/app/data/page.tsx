"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

interface DataRecord {
  id: string
  title: string
  description: string
  status: "active" | "inactive" | "pending"
  createdAt: string
  updatedAt: string
}

export default function DataManagement() {
  const [records, setRecords] = useState<DataRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Replace with actual API call
        // const response = await fetch('/api/data')
        // const data = await response.json()

        // Mock data
        const mockData: DataRecord[] = [
          {
            id: "1",
            title: "Sample Record 1",
            description: "This is a sample data record for demonstration",
            status: "active",
            createdAt: "2024-01-15T10:30:00Z",
            updatedAt: "2024-01-15T10:30:00Z",
          },
          {
            id: "2",
            title: "Sample Record 2",
            description: "Another sample record with different status",
            status: "pending",
            createdAt: "2024-01-14T15:45:00Z",
            updatedAt: "2024-01-14T15:45:00Z",
          },
          {
            id: "3",
            title: "Sample Record 3",
            description: "Inactive record for testing purposes",
            status: "inactive",
            createdAt: "2024-01-13T09:15:00Z",
            updatedAt: "2024-01-13T09:15:00Z",
          },
        ]

        setRecords(mockData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredRecords = records.filter(
    (record) =>
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateRecord = async (formData: FormData) => {
    // Replace with actual API call
    const newRecord: DataRecord = {
      id: Date.now().toString(),
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setRecords((prev) => [newRecord, ...prev])
    setIsCreateDialogOpen(false)
  }

  const handleDeleteRecord = async (id: string) => {
    // Replace with actual API call
    setRecords((prev) => prev.filter((record) => record.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Data Management</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your application data and records</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form action={handleCreateRecord}>
                    <DialogHeader>
                      <DialogTitle>Create New Record</DialogTitle>
                      <DialogDescription>Add a new data record to your system.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" placeholder="Enter record title" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Enter record description" rows={3} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Record</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Records ({filteredRecords.length})</CardTitle>
            <CardDescription>All data records in your system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No records found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.description}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Record Dialog */}
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedRecord?.title}</DialogTitle>
              <DialogDescription>Record Details</DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="grid gap-4 py-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRecord.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedRecord.status)}>{selectedRecord.status}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedRecord.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedRecord.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
