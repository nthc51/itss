import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const endpoints = [
  {
    method: "GET",
    path: "/api/data",
    description: "Retrieve all data records",
    parameters: [
      { name: "limit", type: "number", description: "Maximum number of records to return" },
      { name: "offset", type: "number", description: "Number of records to skip" },
      { name: "search", type: "string", description: "Search term to filter records" },
    ],
    response: {
      type: "array",
      example: `[
  {
    "id": "1",
    "title": "Sample Record",
    "description": "Description here",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]`,
    },
  },
  {
    method: "POST",
    path: "/api/data",
    description: "Create a new data record",
    parameters: [
      { name: "title", type: "string", description: "Record title (required)" },
      { name: "description", type: "string", description: "Record description" },
      { name: "status", type: "string", description: "Record status (active, inactive, pending)" },
    ],
    response: {
      type: "object",
      example: `{
  "id": "123",
  "title": "New Record",
  "description": "Description here",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}`,
    },
  },
  {
    method: "GET",
    path: "/api/data/:id",
    description: "Retrieve a specific data record by ID",
    parameters: [{ name: "id", type: "string", description: "Record ID (path parameter)" }],
    response: {
      type: "object",
      example: `{
  "id": "123",
  "title": "Sample Record",
  "description": "Description here",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}`,
    },
  },
  {
    method: "PUT",
    path: "/api/data/:id",
    description: "Update an existing data record",
    parameters: [
      { name: "id", type: "string", description: "Record ID (path parameter)" },
      { name: "title", type: "string", description: "Updated record title" },
      { name: "description", type: "string", description: "Updated record description" },
      { name: "status", type: "string", description: "Updated record status" },
    ],
    response: {
      type: "object",
      example: `{
  "id": "123",
  "title": "Updated Record",
  "description": "Updated description",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T12:45:00Z"
}`,
    },
  },
  {
    method: "DELETE",
    path: "/api/data/:id",
    description: "Delete a data record",
    parameters: [{ name: "id", type: "string", description: "Record ID (path parameter)" }],
    response: {
      type: "object",
      example: `{
  "message": "Record deleted successfully"
}`,
    },
  },
  {
    method: "GET",
    path: "/api/stats",
    description: "Get system statistics and status",
    parameters: [],
    response: {
      type: "object",
      example: `{
  "totalRecords": 1247,
  "activeConnections": 23,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "status": "online"
}`,
    },
  },
]

const getMethodColor = (method: string) => {
  switch (method) {
    case "GET":
      return "bg-green-100 text-green-800"
    case "POST":
      return "bg-blue-100 text-blue-800"
    case "PUT":
      return "bg-yellow-100 text-yellow-800"
    case "DELETE":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">API Documentation</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Complete API reference for the ITSS backend</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* API Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API Overview</CardTitle>
            <CardDescription>Base URL and authentication information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Base URL</h4>
              <code className="bg-muted px-2 py-1 rounded text-sm">http://localhost:3000/api</code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Content Type</h4>
              <code className="bg-muted px-2 py-1 rounded text-sm">application/json</code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Authentication</h4>
              <p className="text-sm text-muted-foreground">
                Currently no authentication required. Add your authentication method here.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-6">
          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                  <code className="text-lg font-mono">{endpoint.path}</code>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Parameters */}
                {endpoint.parameters.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Parameters</h4>
                    <div className="space-y-2">
                      {endpoint.parameters.map((param, paramIndex) => (
                        <div key={paramIndex} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono">{param.name}</code>
                            <Badge variant="outline" className="text-xs">
                              {param.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response */}
                <div>
                  <h4 className="font-semibold mb-3">Response</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">200 OK</Badge>
                      <span className="text-sm text-muted-foreground">Returns {endpoint.response.type}</span>
                    </div>
                    <pre className="text-sm overflow-x-auto">
                      <code>{endpoint.response.example}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Error Responses */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Error Responses</CardTitle>
            <CardDescription>Common error responses and their meanings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive">400</Badge>
                <span className="font-semibold">Bad Request</span>
              </div>
              <p className="text-sm text-muted-foreground">The request was invalid or cannot be served.</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive">404</Badge>
                <span className="font-semibold">Not Found</span>
              </div>
              <p className="text-sm text-muted-foreground">The requested resource could not be found.</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive">500</Badge>
                <span className="font-semibold">Internal Server Error</span>
              </div>
              <p className="text-sm text-muted-foreground">An error occurred on the server.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
