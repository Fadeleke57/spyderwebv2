import { useUser } from "@/context/UserContext";
import withAuth from "@/hoc/withAuth";
import LoadingPage from "@/components/utility/LoadingPage";
import { DataDrawer } from "@/components/terminal/DataDrawer";
import { ArticleChart } from "@/components/terminal/ArticleChart";

function Terminal() {
  const { user } = useUser();

  if (!user) {
    return <LoadingPage />;
  }

  return (
    <main className="flex min-h-screen flex-col items-start justify-between p-24">
      <div className="p-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Welcome, {user.full_name.split(" ")[0]}
          </h1>
        </div>
        <DataDrawer/>
      </div>
    </main>
  );
}

export default withAuth(Terminal);
