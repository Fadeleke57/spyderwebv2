import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { File, MoreHorizontal, PlusCircle } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteBucket, useFetchUserBuckets } from "@/hooks/buckets";
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
import { ComboBoxResponsive } from "@/components/utility/ResponsiveComobox";
import DeleteModal from "@/components/utility/DeleteModal";
import { useUser } from "@/context/UserContext";
import { toast } from "@/components/ui/use-toast";
import UserBucketSearch from "@/components/buckets/UserBucketSearch";
import SpydrAI from "@/components/utility/Assistant";

function Index() {
  const { user, logout } = useUser();
  const [cursors, setCursors] = useState<{
    prev: number | null;
    next: number | null;
  }>({
    prev: null,
    next: null,
  });
  const router = useRouter();
  const { tab } = router.query;
  const criteria = tab ? (tab as string) : "all";
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    refetch,
  } = useFetchUserBuckets(criteria);
  const { mutateAsync: deleteBucket, isPending, isError } = useDeleteBucket();

  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [bucketId, setBucketId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    logout();
    router.push("/explore");
  };

  const handleDeleteBucket = useCallback(async () => {
    if (!bucketId) return;

    try {
      await deleteBucket(bucketId);
      setOpen(false);
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error deleting bucket",
        description: "Failed to delete bucket",
        variant: "destructive",
      });
    }
  }, [bucketId, deleteBucket]);

  const tabs = [
    { label: "All", value: "all", filter: () => true },
    {
      label: "Private",
      value: "private",
      filter: () => true,
    },
    {
      label: "Public",
      value: "public",
      filter: () => true,
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

  const handleTabSwitch = (tab: string) => {
    router.push(
      {
        pathname: "/buckets",
        query: { tab },
      },
      undefined,
      { shallow: true }
    );
  };

  useEffect(() => {
    if (criteria) {
      setCurrentPage(1);
      refetch();
    }
  }, [criteria, refetch]);

  const handleOpenDeleteModal = (id: string) => {
    setBucketId(id);
    setOpen(true);
  };

  return (
    <div className="flex lg:min-h-screen justify-center flex-col max-w-[960px] mx-auto">
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
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="relative ml-auto flex-1 md:grow-0">
            <UserBucketSearch />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full dark:bg-muted dark:hover:text-foreground dark:border"
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
                onClick={() => {
                  router.push("/settings");
                }}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-500 hover:text-red-600 dark:hover:text-red-500"
                onClick={handleLogout}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue={criteria} onValueChange={handleTabSwitch}>
            <div className="flex items-center">
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 dark:hover:bg-muted dark:hover:text-foreground"
                >
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
              <TabsContent value={tab.value} key={tab.value}>
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
                                href={`/bucket/${bucket?.bucketId}`}
                                className="font-medium hover:underline cursor-pointer hover:text-blue-500"
                              >
                                {formatText(bucket?.name || "", 30)}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {bucket?.visibility === "Private"
                                  ? "private"
                                  : "public"}
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
                              <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      router.push(
                                        `/bucket/${bucket?.bucketId}`
                                      )
                                    }
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleOpenDeleteModal(bucket?.bucketId)
                                    }
                                    className="text-red-400 hover:text-destructive cursor-pointer"
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
                          {isFetching ? "..." : (currentPage - 1) * 10 + 1}
                        </strong>{" "}
                        to{" "}
                        <strong>
                          {isFetching
                            ? "..."
                            : Math.min(
                                currentPage * 10,

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
      {bucketId && open && (
        <DeleteModal
          itemType="bucket"
          onDelete={handleDeleteBucket}
          isPending={isPending}
          open={open}
          setOpen={setOpen}
        ></DeleteModal>
      )}
      <SpydrAI />
    </div>
  );
}

export default withAuth(Index);
