import Link from "next/link";

function Footer() {
  return (
    <footer className="w-full flex flex-col px-6 lg:px-10">
      <div className="flex justify-between items-center py-4 px-2 pb-8">
        <div className="inline-flex gap-3 items-center">
          <small className="text-xs font-medium leading-none border-r-[1px] mt-[2px] dark:text-muted-foreground border-r-muted-foreground pr-2 py-[3px]">
            &copy; Spydr
          </small>
          <Link
            href="/about/terms-of-service"
            className="inline p-0 leading-none decoration-none dark:text-muted-foreground dark:hover:text-foreground hover:text-slate-700 border-r-[1px] border-r-muted-foreground pr-2"
          >
            <small className="text-xs font-medium leading-none">
              Terms <span className="hidden lg:inline">of Service</span>
            </small>
          </Link>
          <Link
            href="/about/privacy-policy"
            className="inline p-0 leading-none decoration-none dark:text-muted-foreground dark:hover:text-foreground hover:text-slate-700 border-r-[1px] border-r-muted-foreground pr-2"
          >
            <small className="text-xs font-medium leading-none">
              Privacy <span className="hidden lg:inline">Policy</span>
            </small>
          </Link>
          <Link
            href="#"
            className="inline p-0 leading-none decoration-none dark:text-muted-foreground dark:hover:text-foreground hover:text-slate-700 pr-2"
          >
            <small className="text-xs font-medium leading-none">Support</small>
          </Link>
        </div>
        <div>
          <small className="hidden lg:inline text-xs font-medium leading-none text-slate-500 dark:text-muted-foreground italic">
            Breaking the Black Box
          </small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
