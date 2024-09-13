import React from "react";
import ConfigForm from "./ConfigForm";
import { ConfigFormValues } from "@/types/article";

type SideBarProps = {
  setConfig: (query: ConfigFormValues) => void;
};

const SideBar = ({ setConfig }: SideBarProps) => {

  return (
    <div className="flex h-full justify-center px-6 py-6">
      <ConfigForm setConfig={setConfig} />
    </div>
  );
};

export default SideBar;
