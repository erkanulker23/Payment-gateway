
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const items = [
    {
      href: "/",
      label: "Dashboard",
    },
    {
      href: "/providers",
      label: "Payment Providers",
    },
    {
      href: "/checkout",
      label: "Checkout",
    },
  ];

  return (
    <div className="border-r bg-background min-w-[250px]">
      <nav className="space-y-2 p-4">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <span className={cn(
              "flex w-full cursor-pointer items-center rounded-md p-2 hover:bg-accent text-sm font-medium",
              window.location.pathname === item.href && "bg-accent"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
