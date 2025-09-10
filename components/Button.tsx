type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" };
export default function Button({ variant="primary", className="", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium transition";
  const styles = {
    primary: "bg-brand-blue text-white hover:opacity-95",
    secondary: "border border-brand-green text-brand-green hover:bg-brand-green hover:text-white",
    ghost: "text-brand-blue hover:underline",
  }[variant];
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
