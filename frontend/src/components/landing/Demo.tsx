import TerminalDemo from "./TerminalDemo";

export default function Demo() {
  return (
    <div className="relative mt-8 flex flex-row">
      <div className="text-left">
        <h2 className="scroll-m-20 border-b pb-2 pr-3 text-3xl font-semibold tracking-tight first:mt-0 text-left">
          An all-in-one research tool for understanding the full context of your
          news.
        </h2>
      </div>
      <TerminalDemo />
    </div>
  );
}
