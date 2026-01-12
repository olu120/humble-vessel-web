import Container from "@/components/Container";
import clsx from "clsx";

type Props = {
  id?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  bg?: "base" | "alt";
  className?: string;
  containerSize?: "normal" | "wide" | "full";
};

export default function Section({
  id,
  title,
  subtitle,
  children,
  bg = "base",
  className = "",
  containerSize = "normal",
}: Props) {
  return (
    <section
      id={id}
      className={clsx(bg === "alt" && "bg-brand-light/30", className)}
    >
      <Container size={containerSize} className="py-10 sm:py-12 md:py-14">
        {title && (
          <header className="mb-6 md:mb-8">
            <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm md:text-base opacity-80">
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
