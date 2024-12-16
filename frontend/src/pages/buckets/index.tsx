import React, { useEffect, useState } from "react";
import Image from "next/image";
import { File, MoreHorizontal, PlusCircle, Search } from "lucide-react";
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
import { useDeleteBucket, useFetchBucketsForUser } from "@/hooks/buckets";
import Link from "next/link";
import { format } from "date-fns";
import { formatText } from "@/lib/utils";
import { useRouter } from "next/router";
import withAuth from "@/hoc/withAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { NewBucketModal } from "@/components/buckets/NewBucketModal";
import Head from "next/head";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bucket } from "@/types/bucket";

function Index() {
  const { user, Logout } = useFetchUser();
  const [cursors, setCursors] = useState<{
    prev: number | null;
    next: number | null;
  }>({
    prev: null,
    next: null,
  });

  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = useFetchBucketsForUser();
  const { mutateAsync: deleteBucket } = useDeleteBucket();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();

  const router = useRouter();

  const handleLogout = async () => {
    await Logout();
    window.location.href = "/";
  };

  const handleDeleteBucket = async (id: string | undefined) => {
    if (!id) return;
    await deleteBucket(id);
  };

  const tabs = [
    { label: "All", value: "all", filter: () => true },
    {
      label: "Private",
      value: "private",
      filter: (bucket: Bucket) => bucket.visibility === "Private",
    },
    {
      label: "Public",
      value: "public",
      filter: (bucket: Bucket) => bucket.visibility === "Public",
    },
  ];

  useEffect(() => {
    if (data) {
      const pageData = data.pages.find((page) => page.page === currentPage);
      if (pageData) {
        setCursors({
          prev: pageData.prevCursor,
          next: pageData.nextCursor,
        });
      }
      setBuckets(pageData?.items || []);
    }
  }, [data, currentPage]);

  const handleNextPage = () => {
    if (cursors.next) {
      setCurrentPage(currentPage + 1);
      fetchNextPage();
    }
  };

  const handlePreviousPage = () => {
    if (cursors.prev) {
      setCurrentPage(currentPage - 1);
      fetchPreviousPage();
    }
  };

  return (
    <div className="flex lg:min-h-screen justify-center flex-col bg-muted/40">
      <Head>
        <title>{"all buckets"}</title>
        <meta name="description" content={"Welcome to spydr"} />
        <meta property="og:title" content={user?.full_name} />
        <meta property="og:description" content={"Welcome to spydr"} />
        <meta
          property="og:url"
          content={`${
            typeof window !== "undefined" ? window.location.href : ""
          }`}
        />
      </Head>
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
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                {user?.id ? (
                  <Image
                    src={`https://robohash.org/${user.id}?size=300x300`}
                    width={36}
                    height={36}
                    alt="Avatar"
                    className="rounded-full"
                  />
                ) : (
                  <Skeleton className="w-[36px] h-[36px]" />
                )}
              </Button>
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
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all" className="">
            <div className="flex items-center">
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
                <NewBucketModal>
                  <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="whitespace-nowrap hidden lg:block">
                      Create Bucket
                    </span>
                  </Button>
                </NewBucketModal>
              </div>
            </div>
            {tabs.map((tab) => (
              <TabsContent
                value={tab.value}
                key={tab.value}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Buckets</CardTitle>
                    <CardDescription>
                      Manage your buckets and view their data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          {!isMobile && (
                            <>
                              <TableHead>Likes</TableHead>
                              <TableHead>Iterations</TableHead>
                              <TableHead>Created at</TableHead>
                            </>
                          )}
                          <TableHead>
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {buckets.filter(tab.filter).map((bucket, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Link
                                href={`/buckets/bucket/${bucket?.bucketId}`}
                                className="font-medium hover:underline cursor-pointer hover:text-blue-500"
                              >
                                {formatText(bucket?.name || "", 30)}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {bucket?.visibility === "Private" ? "private" : "public"}
                              </Badge>
                            </TableCell>
                            {!isMobile && (
                              <>
                                <TableCell>{bucket?.likes?.length}</TableCell>
                                <TableCell>
                                  {bucket?.iterations?.length}
                                </TableCell>
                                <TableCell>
                                  {bucket?.created &&
                                    format(
                                      new Date(bucket?.created || ""),
                                      "MMM dd, yyyy hh:mm a"
                                    )}
                                </TableCell>
                              </>
                            )}

                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/buckets/bucket/${bucket?.bucketId}`)}>Edit</DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteBucket(bucket?.bucketId)
                                    }
                                    className="text-destructive hover:text-destructive cursor-pointer"
                                  >
                                    Delete
                                  </DropdownMenuItem>
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
                        <strong>
                          {isFetching ? "..." : (currentPage - 1) * 5 + 1}
                        </strong>{" "}
                        to{" "}
                        <strong>
                          {isFetching
                            ? "..."
                            : Math.min(
                                currentPage * 5,
                                data?.pages[0]?.total || 0
                              )}{" "}
                        </strong>{" "}
                        of{" "}
                        <strong>
                          {isFetching ? "..." : data?.pages[0]?.total || 0}
                        </strong>{" "}
                        buckets
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={!cursors.prev || isFetchingPreviousPage}
                        >
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleNextPage}
                          disabled={!cursors.next || isFetchingNextPage}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Index);
