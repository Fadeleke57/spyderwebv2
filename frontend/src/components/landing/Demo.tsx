import TerminalDemo from "./TerminalDemo";

export default function Demo() {
  return (
    <div className="relative lg:mt-20 flex flex-col gap-10 lg:gap-0 lg:flex-row rounded-xl lg:bg-muted lg:p-10 ">
      <div className="text-center px-10 pt-0 lg:px-0 lg:pt-0 lg:text-left ">
        <h2 className="scroll-m-20 lg:border-b border-stone-500 lg:pb-2 lg:pr-10 text-3xl lg:text-3xl font-semibold tracking-tight first:mt-0 ">
          An all-in-one research tool for understanding the full context of your
          news.
        </h2>
      </div>
      <TerminalDemo />
    </div>
  );
}
