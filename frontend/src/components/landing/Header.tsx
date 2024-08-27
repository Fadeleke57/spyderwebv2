import Particles from "@/components/magicui/particles";
function Header() {
  return (
    <div className="relative">
      <p className="text-sm text-muted-foreground mb-4">The new way to news.</p>
      <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-5xl mb-2 lg:mb-4">
        Welcome to <span className="bg-blue-400">Spydr Web.</span>{" "}
      </h1>
      <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-5xl">
        Ready to <span className="bg-blue-400">Explore?</span>
      </h1>
      <Particles
        className="absolute inset-0 -z-2"
        quantity={100}
        ease={80}
        color={"dark"}
        refresh
        vx={0.5}
        vy={0.5}
      />
    </div>
  );
}

export default Header