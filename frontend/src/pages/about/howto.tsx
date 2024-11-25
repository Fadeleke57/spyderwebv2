import PublicLayout from "@/app/PublicLayout";
import React, { ReactElement } from "react";

function Howto() {
  return (
    <div className="p-6 lg:px-10 py-0 lg:py-24 flex min-h-screen flex-col space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
        Walkthrough
      </h1>
      <div className="relative pb-[64.67065868263472%] w-full h-1/2">
        <iframe
          src="https://www.loom.com/embed/c273486dc97946bf98dc5dc464dea95d?sid=af7a4d8c-8428-4717-a42c-b16abcd42436"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full rounded-2xl"
        ></iframe>
      </div>
    </div>
  );
}

Howto.getLayout = (page: ReactElement) => {
  return <PublicLayout>{page}</PublicLayout>;
};

export default Howto;
