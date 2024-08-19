import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ConfigForm from "./ConfigForm";

type FormValues = {
  query: string;
};

type SideBarProps = {
  setQuery: (query: string) => void;
};

const SideBar = ({ setQuery }: SideBarProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        query: z.string().min(1, "Please provide a valid search term."),
      })
    ),
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    setQuery(data.query);
  };

  return (
    <div className="flex h-full justify-center px-6 py-6">
      <ConfigForm setQuery={setQuery} />
    </div>
  );
};

export default SideBar;
