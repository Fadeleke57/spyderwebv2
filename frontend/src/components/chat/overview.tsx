import { motion } from "framer-motion";
import Charlotte from "./Charlotte";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-2 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center items-center">
          <Charlotte width={20} height={20} />
        </p>
        <h1 className="text-3xl font-semibold">
          Talk to your <span className="text-violet-400">second brain</span>
        </h1>
      </div>
    </motion.div>
  );
};
