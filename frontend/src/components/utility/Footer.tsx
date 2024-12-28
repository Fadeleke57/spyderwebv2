import Link from "next/link";
import HyperText from "@/components/magicui/hyper-text";

function Footer() {
  return (
    <footer className="static bottom-0 w-full flex flex-col px-6 lg:px-10">
      <div className="flex justify-between items-center py-4 px-2 pb-14">
        <div className="inline-flex gap-4 items-center">
          <small className="text-sm font-medium leading-none">
            &copy; Spydr
          </small>
          <Link
            href="/about/terms-of-service"
            className="inline p-0 decoration-none hover:text-slate-700"
          >
            <small className="text-sm font-medium leading-none">
              Terms <span className="hidden lg:inline">of Service</span>
            </small>
          </Link>
          <Link
            href="/about/privacy-policy"
            className="inline p-0 decoration-none hover:text-slate-700"
          >
            <small className="text-sm font-medium leading-none">
              Privacy <span className="hidden lg:inline">Policy</span>
            </small>
          </Link>
        </div>
        <div>
          <small className="hidden lg:inline text-sm font-medium leading-none text-slate-500 dark:text-foreground italic">
            The new way to news.
          </small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
