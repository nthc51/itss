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
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

// Pantry item interface matches backend
interface PantryItem {
  id: string
  name: string
  quantity: string
  category: string
  expirationDate: string
  location: string
}

export default function DataManagement() {
  const [items, setItems] = useState<PantryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<PantryItem | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { token } = useAuth()
  const { toast } = useToast()

  // Fetch pantry items from backend
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/pantry-items`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        if (!res.ok) throw new Error("Failed to fetch pantry items")
        const data = await res.json()
        setItems(
          Array.isArray(data)
            ? data.map((item: any) => ({
                id: item._id || item.id,
                name: item.name,
                quantity: item.quantity,
                category: item.category,
                expirationDate: item.expirationDate,
                location: item.location,
              }))
            : []
        )
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch pantry items.",
          variant: "destructive",
        })
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    if (token) fetchData()
  }, [token, toast])

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateItem = async (formData: FormData) => {
    try {
      const newItem = {
        name: formData.get("name") as string,
        quantity: formData.get("quantity") as string,
        category: formData.get("category") as string,
        expirationDate: formData.get("expirationDate") as string,
        location: formData.get("location") as string,
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/pantry-items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newItem),
        }
      )
      if (!res.ok) throw new Error("Failed to add item")
      const created = await res.json()
      setItems((prev) => [
        {
          id: created._id || created.id,
          ...newItem,
        },
        ...prev,
      ])
      setIsCreateDialogOpen(false)
      toast({ title: "Success", description: "Item added successfully!" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/pantry-items/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (!res.ok) throw new Error("Failed to delete item")
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast({ title: "Success", description: "Item deleted successfully!" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Pantry Items</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your pantry/fridge items</p>
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
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form action={handleCreateItem}>
                    <DialogHeader>
                      <DialogTitle>Add New Pantry Item</DialogTitle>
                      <DialogDescription>Add a new item to your pantry or fridge.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="Enter item name" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" name="quantity" placeholder="e.g., 2" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" name="category" placeholder="e.g., Dairy" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="expirationDate">Expiration Date</Label>
                        <Input id="expirationDate" name="expirationDate" type="date" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" placeholder="e.g., Main Fridge" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Item</Button>
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
            <CardTitle>Items ({filteredItems.length})</CardTitle>
            <CardDescription>All pantry/fridge items</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No items found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        {item.expirationDate
                          ? new Date(item.expirationDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
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

        {/* View Item Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedItem?.name}</DialogTitle>
              <DialogDescription>Item Details</DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="grid gap-4 py-4">
                <div>
                  <Label className="text-sm font-medium">Quantity</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedItem.quantity}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedItem.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Expiration Date</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedItem.expirationDate
                      ? new Date(selectedItem.expirationDate).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedItem.location}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
