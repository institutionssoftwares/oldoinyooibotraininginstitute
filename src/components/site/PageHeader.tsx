import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-navy text-navy-foreground">
      <div className="container-page py-14">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed opacity-85 sm:text-base">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-6 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </section>
  );
}
