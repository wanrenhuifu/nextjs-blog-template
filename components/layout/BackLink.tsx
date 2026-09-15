import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
}

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="group focus-ring mb-8 inline-flex items-center gap-2.5 rounded-full border border-borderline bg-card py-1.5 pl-1.5 pr-4 text-sm text-muted shadow-sm transition-all duration-300 hover:border-primary/30 hover:bg-hover hover:text-title hover:shadow-md motion-safe:hover:-translate-y-px"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-hover text-body transition-colors duration-300 group-hover:bg-primary/15 group-hover:text-primary-strong">
        <ArrowLeft
          strokeWidth={1.5}
          className="h-3.5 w-3.5 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-x-px"
        />
      </span>
      {children}
    </Link>
  );
}
