import { AnchorHTMLAttributes, useState } from "react";
import { resolveDownloadUrl } from "@/lib/storage";

type SignedFileLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export function SignedFileLink({ href, onClick, children, ...rest }: SignedFileLinkProps) {
  const [pending, setPending] = useState(false);

  return (
    <a
      {...rest}
      href={href}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        setPending(true);
        try {
          const url = await resolveDownloadUrl(href);
          window.open(url, rest.target ?? "_blank", "noopener,noreferrer");
        } finally {
          setPending(false);
        }
      }}
      aria-busy={pending}
    >
      {children}
    </a>
  );
}
