type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  bg?: "default" | "alt"; // alt uses Neutral Light per refinement plan
  id?: string;
};
export default function Section({ title, subtitle, children, bg = "default", id }: Props) {
  return (
    <section id={id} className={`${bg === "alt" ? "bg-brand-light/60" : "bg-white"} py-12 md:py-16`}>
      <div className="w-full max-w-6xl px-4 mx-auto md:px-6">
        {(title || subtitle) && (
          <header className="mb-6">
            {title && <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm md:text-base opacity-80">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
