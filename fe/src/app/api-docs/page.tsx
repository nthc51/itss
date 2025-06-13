import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Update endpoints to match your backend (JWT-protected, /auth, /shopping-lists, /pantry-items, etc.)
const endpoints = [
	{
		method: "POST",
		path: "/api/auth/register",
		description: "Register a new user",
		parameters: [
			{ name: "username", type: "string", description: "Username (required)" },
			{ name: "email", type: "string", description: "Email (required)" },
			{ name: "password", type: "string", description: "Password (required)" },
			{ name: "fullName", type: "string", description: "Full name (required)" },
		],
		response: {
			type: "object",
			example: `{
  "message": "Registration successful",
  "user": {
    "id": "abc123",
    "username": "johndoe",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "HOMEMAKER"
  },
  "token": "JWT_TOKEN_HERE"
}`,
		},
	},
	{
		method: "POST",
		path: "/api/auth/login",
		description: "Authenticate user and get JWT token",
		parameters: [
			{ name: "email or username", type: "string", description: "Email or username (required)" },
			{ name: "password", type: "string", description: "Password (required)" },
		],
		response: {
			type: "object",
			example: `{
  "message": "Login successful",
  "user": {
    "id": "abc123",
    "username": "johndoe",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "HOMEMAKER"
  },
  "token": "JWT_TOKEN_HERE"
}`,
		},
	},
	{
		method: "GET",
		path: "/api/shopping-lists",
		description: "Get all shopping lists for the authenticated user",
		parameters: [
			{ name: "Authorization", type: "header", description: "Bearer JWT_TOKEN_HERE" },
		],
		response: {
			type: "array",
			example: `[
  {
    "id": "list1",
    "title": "Weekly Groceries",
    "type": "weekly",
    "startDate": "2024-06-01",
    "items": [
      {
        "id": "item1",
        "name": "Milk",
        "quantity": "2",
        "category": "Dairy",
        "completed": false,
        "addedBy": "John Doe"
      }
    ],
    "sharedWithGroup": [],
    "createdBy": "John Doe"
  }
]`,
		},
	},
	{
		method: "POST",
		path: "/api/shopping-lists",
		description: "Create a new shopping list",
		parameters: [
			{ name: "Authorization", type: "header", description: "Bearer JWT_TOKEN_HERE" },
			{ name: "title", type: "string", description: "List title (required)" },
			{ name: "type", type: "string", description: "List type (daily, weekly)" },
			{ name: "startDate", type: "string", description: "Start date (YYYY-MM-DD)" },
		],
		response: {
			type: "object",
			example: `{
  "id": "list1",
  "title": "Weekly Groceries",
  "type": "weekly",
  "startDate": "2024-06-01",
  "items": [],
  "sharedWithGroup": [],
  "createdBy": "John Doe"
}`,
		},
	},
	{
		method: "PUT",
		path: "/api/shopping-lists/:id",
		description: "Update a shopping list (add/remove items, mark complete, etc.)",
		parameters: [
			{ name: "Authorization", type: "header", description: "Bearer JWT_TOKEN_HERE" },
			{ name: "id", type: "string", description: "Shopping list ID (path parameter)" },
			{ name: "items", type: "array", description: "Updated items array" },
		],
		response: {
			type: "object",
			example: `{
  "id": "list1",
  "title": "Weekly Groceries",
  "type": "weekly",
  "startDate": "2024-06-01",
  "items": [ /* ... */ ],
  "sharedWithGroup": [],
  "createdBy": "John Doe"
}`,
		},
	},
	{
		method: "DELETE",
		path: "/api/shopping-lists/:id",
		description: "Delete a shopping list",
		parameters: [
			{ name: "Authorization", type: "header", description: "Bearer JWT_TOKEN_HERE" },
			{ name: "id", type: "string", description: "Shopping list ID (path parameter)" },
		],
		response: {
			type: "object",
			example: `{
  "message": "Shopping list deleted successfully"
}`,
		},
	},
	{
		method: "GET",
		path: "/api/pantry-items",
		description: "Get all pantry/fridge items for the authenticated user",
		parameters: [
			{ name: "Authorization", type: "header", description: "Bearer JWT_TOKEN_HERE" },
		],
		response: {
			type: "array",
			example: `[
  {
    "id": "item1",
    "name": "Milk",
    "quantity": "2",
    "category": "Dairy",
    "expirationDate": "2024-06-15",
    "location": "Main Fridge"
  }
]`,
		},
	},
	{
		method: "POST",
		path: "/api/pantry-items",
		description: "Add a new pantry/fridge item",
		parameters: [
			{ name: "Authorization", type: "header", description: "Bearer JWT_TOKEN_HERE" },
			{ name: "name", type: "string", description: "Item name (required)" },
			{ name: "quantity", type: "string", description: "Quantity (required)" },
			{ name: "category", type: "string", description: "Category" },
			{ name: "expirationDate", type: "string", description: "Expiration date (YYYY-MM-DD)" },
			{ name: "location", type: "string", description: "Storage location" },
		],
		response: {
			type: "object",
			example: `{
  "id": "item1",
  "name": "Milk",
  "quantity": "2",
  "category": "Dairy",
  "expirationDate": "2024-06-15",
  "location": "Main Fridge"
}`,
		},
	},
	{
		method: "PUT",
		path: "/api/pantry-items/:id",
		description: "Update a pantry/fridge item",
		parameters: [
			{ name: "Authorization", type: "header", description: "Bearer JWT_TOKEN_HERE" },
			{ name: "id", type: "string", description: "Item ID (path parameter)" },
		],
		response: {
			type: "object",
			example: `{
  "id": "item1",
  "name": "Milk",
  "quantity": "3",
  "category": "Dairy",
  "expirationDate": "2024-06-18",
  "location": "Main Fridge"
}`,
		},
	},
	{
		method: "DELETE",
		path: "/api/pantry-items/:id",
		description: "Delete a pantry/fridge item",
		parameters: [
			{ name: "Authorization", type: "header", description: "Bearer JWT_TOKEN_HERE" },
			{ name: "id", type: "string", description: "Item ID (path parameter)" },
		],
		response: {
			type: "object",
			example: `{
  "message": "Item deleted successfully"
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
							<code className="bg-muted px-2 py-1 rounded text-sm">http://localhost:3001/api</code>
						</div>
						<div>
							<h4 className="font-semibold mb-2">Content Type</h4>
							<code className="bg-muted px-2 py-1 rounded text-sm">application/json</code>
						</div>
						<div>
							<h4 className="font-semibold mb-2">Authentication</h4>
							<p className="text-sm text-muted-foreground">
								All endpoints (except register/login) require a JWT token in the{" "}
								<code>Authorization</code> header:
								<br />
								<code>Authorization: Bearer JWT_TOKEN_HERE</code>
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
								<Badge variant="destructive">401</Badge>
								<span className="font-semibold">Unauthorized</span>
							</div>
							<p className="text-sm text-muted-foreground">Missing or invalid JWT token.</p>
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
