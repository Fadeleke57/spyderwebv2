import React, { useState } from "react";
import Image from "next/image";
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFetchUser } from "@/hooks/user";
import { useFetchBuckets } from "@/hooks/buckets";
import Link from "next/link";
import { format } from "date-fns";
import { formatText } from "@/lib/utils";
import { useRouter } from "next/router";
import withAuth from "@/hoc/withAuth";
import UserAvatar from "@/components/utility/UserAvatar";

function Index() {
  const { user, Logout } = useFetchUser();
  const { buckets, loading, error } = useFetchBuckets();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBuckets = buckets.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(buckets.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleLogout = async () => {
    await Logout();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen w-full justify-center flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <UserAvatar userId={user?.id} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/settings")}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="archived" className="hidden sm:flex">
                  Archived
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Created At
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Likes</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Iterations
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
                <Button
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => router.push("/buckets/create")}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Create Bucket
                  </span>
                </Button>
              </div>
            </div>
            <TabsContent value="all">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Buckets</CardTitle>
                  <CardDescription>
                    Manage your buckets and view their data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="md:min-h-[410px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Likes
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Iterations
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Created at
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentBuckets.map((bucket, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium hover:text-blue-600">
                            <Link href={`/buckets/bucket/${bucket.bucketId}`}>
                              {formatText(bucket.name, 50)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {bucket.private ? "private" : "public"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {bucket.likes.length}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {bucket.iterations.length}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(
                              new Date(bucket.created),
                              "MMM dd, yyyy hh:mm a"
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between items-center w-full">
                    <div className="text-xs text-muted-foreground">
                      Showing <strong>{indexOfFirstItem + 1}</strong> to{" "}
                      <strong>
                        {Math.min(indexOfLastItem, buckets.length)}
                      </strong>{" "}
                      of <strong>{buckets.length}</strong> buckets
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleNextPage}
                        disabled={
                          currentPage ===
                          Math.ceil(buckets.length / itemsPerPage)
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="active" className="min-h-full">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Buckets</CardTitle>
                  <CardDescription>
                    Manage your buckets and view their data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="md:min-h-[410px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Likes
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Iterations
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Created at
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentBuckets.map((bucket, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium hover:text-blue-600">
                            <Link href={`/buckets/bucket/${bucket.bucketId}`}>
                              {formatText(bucket.name, 50)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {bucket.private ? "private" : "public"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {bucket.likes.length}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {bucket.iterations.length}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(
                              new Date(bucket.created),
                              "MMM dd, yyyy hh:mm a"
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between items-center w-full">
                    <div className="text-xs text-muted-foreground">
                      Showing <strong>{indexOfFirstItem + 1}</strong> to{" "}
                      <strong>
                        {Math.min(indexOfLastItem, buckets.length)}
                      </strong>{" "}
                      of <strong>{buckets.length}</strong> buckets
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleNextPage}
                        disabled={
                          currentPage ===
                          Math.ceil(buckets.length / itemsPerPage)
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="draft">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Buckets</CardTitle>
                  <CardDescription>
                    Manage your buckets and view their data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="md:min-h-[410px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Likes
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Iterations
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Created at
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentBuckets.map((bucket, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium hover:text-blue-600">
                            <Link href={`/buckets/bucket/${bucket.bucketId}`}>
                              {formatText(bucket.name, 50)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {bucket.private ? "private" : "public"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {bucket.likes.length}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {bucket.iterations.length}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(
                              new Date(bucket.created),
                              "MMM dd, yyyy hh:mm a"
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between items-center w-full">
                    <div className="text-xs text-muted-foreground">
                      Showing <strong>{indexOfFirstItem + 1}</strong> to{" "}
                      <strong>
                        {Math.min(indexOfLastItem, buckets.length)}
                      </strong>{" "}
                      of <strong>{buckets.length}</strong> buckets
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleNextPage}
                        disabled={
                          currentPage ===
                          Math.ceil(buckets.length / itemsPerPage)
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="archived">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Buckets</CardTitle>
                  <CardDescription>
                    Manage your buckets and view their data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="md:min-h-[410px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Likes
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Iterations
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Created at
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentBuckets.map((bucket, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium hover:text-blue-600">
                            <Link href={`/buckets/bucket/${bucket.bucketId}`}>
                              {formatText(bucket.name, 50)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {bucket.private ? "private" : "public"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {bucket.likes.length}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {bucket.iterations.length}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(
                              new Date(bucket.created),
                              "MMM dd, yyyy hh:mm a"
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between items-center w-full">
                    <div className="text-xs text-muted-foreground">
                      Showing <strong>{indexOfFirstItem + 1}</strong> to{" "}
                      <strong>
                        {Math.min(indexOfLastItem, buckets.length)}
                      </strong>{" "}
                      of <strong>{buckets.length}</strong> buckets
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleNextPage}
                        disabled={
                          currentPage ===
                          Math.ceil(buckets.length / itemsPerPage)
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

export default withAuth(Index);
