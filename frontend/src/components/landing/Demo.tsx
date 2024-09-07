import TerminalDemo from "./TerminalDemo";

export default function Demo() {
  return (
    <div className="relative mt-20 flex sm:flex-col lg:flex-row rounded-xl bg-muted p-10 ">
      <div className="text-left">
        <h2 className="scroll-m-20 border-b border-stone-500 pb-2 pr-10 text-3xl font-semibold tracking-tight first:mt-0 text-left">
          An all-in-one research tool for understanding the full context of your
          news.
        </h2>
      </div>
      <TerminalDemo />
    </div>
  );
}
