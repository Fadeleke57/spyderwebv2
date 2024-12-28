import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "../../components/profile/profile-form";
import { AccountForm } from "@/components/account/account-form";
import withAuth from "@/hoc/withAuth";
import { useUser } from "@/context/UserContext";
import { useIsMobile } from "@/hooks/use-mobile";
import Head from "next/head";
import {useRouter } from "next/router";
import { useFetchUserById } from "@/hooks/user";

function SettingsTabs() {
  const { user } = useUser();

  const {
    data: settingsUser,
    refetch,
    isLoading,
  } = useFetchUserById(user?.id || "");
  const isMobile = useIsMobile();
  const { tab } = useRouter().query;
  const router = useRouter();
  const page = tab ? (tab as string) : "profile";

  const handleTabSwitch = (tab: string) => {
    router.push(
      {
        pathname: "/settings",
        query: { tab },
      },
      undefined,
      { shallow: true }
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="px-6 lg:px-0 py-6 py-14 max-w-[950px] mx-auto">
      <Head>
        <title>{`settings - ${tab ?? ""}`}</title>
        <meta name="description" content={"Learn more about spydr"} />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={"about - spydr"} />
        <meta property="og:description" content={"Learn more about spydr"} />
        <meta
          property="og:url"
          content={`${
            typeof window !== "undefined" ? window.location.href : ""
          }`}
        />
      </Head>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      </div>{" "}
      <Separator className="my-6 opacity-50 md:block lg:block" />
      <Tabs
        onValueChange={handleTabSwitch}
        defaultValue={page}
        orientation="vertical"
        className="md:flex md:flex-row md:items-start lg:flex lg:flex-row lg:items-start"
      >
        <TabsList vertical={!isMobile}>
          <TabsTrigger vertical={!isMobile} value="profile">
            Profile
          </TabsTrigger>
          <TabsTrigger vertical={!isMobile} value="account">
            Account
          </TabsTrigger>
        </TabsList>
        <div className="flex-1">
          <TabsContent vertical={!isMobile} value="profile">
            <ProfileForm refetch={refetch} user={settingsUser} />
          </TabsContent>
          <TabsContent vertical={!isMobile} value="account">
            <AccountForm user={settingsUser} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default withAuth(SettingsTabs);
