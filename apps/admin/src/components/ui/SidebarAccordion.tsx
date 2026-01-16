import clsx from "clsx";

interface Item {
  id: string;
  label: string;
  href?: string;
  children?: { id: string; label: string; href: string }[];
}

interface SidebarAccordionProps {
  items: Item[];
  activeId?: string;
}

export function SidebarAccordion({ items, activeId }: SidebarAccordionProps) {
  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => {
        const isActiveParent =
          item.id === activeId || item.children?.some((c) => c.id === activeId);
        return (
          <details
            key={item.id}
            className={clsx(
              "overflow-hidden rounded-xl border border-slate-200 bg-white",
              isActiveParent && "border-indigo-400 shadow-sm",
            )}
            open={isActiveParent}
            onToggle={(e) => {
              if ((e.target as HTMLDetailsElement).open) {
                document
                  .querySelectorAll<HTMLDetailsElement>("nav details")
                  .forEach((node) => {
                    if (node !== e.target) node.removeAttribute("open");
                  });
              }
            }}
          >
            <summary
              className={clsx(
                "cursor-pointer list-none px-4 py-2 text-sm font-semibold text-slate-800",
                isActiveParent && "bg-indigo-50 text-indigo-700",
              )}
            >
              {item.href ? (
                <a className="block w-full" href={item.href}>
                  {item.label}
                </a>
              ) : (
                item.label
              )}
            </summary>
            {item.children && (
              <div className="flex flex-col border-t border-slate-100 bg-slate-50">
                {item.children.map((child) => {
                  const isActive = child.id === activeId;
                  return (
                    <a
                      key={child.id}
                      href={child.href}
                      className={clsx(
                        "px-4 py-2 text-sm text-slate-700 hover:bg-white",
                        isActive && "bg-white font-semibold text-indigo-700",
                      )}
                    >
                      {child.label}
                    </a>
                  );
                })}
              </div>
            )}
          </details>
        );
      })}
    </nav>
  );
}
