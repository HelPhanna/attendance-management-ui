type FooterProps = {
  year?: number;
  company?: string;
  links?: { label: string; href: string }[];
};

export default function Footer({
  year = 2026,
  company = "SETEC Institute",
  links = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Support", href: "#" },
  ],
}: FooterProps) {
  return (
    <footer className="w-full border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <p className="text-[11px] text-slate-500">
          (c) {year} {company}. All rights reserved.
        </p>

        <nav className="flex items-center gap-5">
          {links.map((linkItem) => (
            <a
              key={linkItem.label}
              href={linkItem.href}
              className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline"
            >
              {linkItem.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
