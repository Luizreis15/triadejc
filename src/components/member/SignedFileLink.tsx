import { AnchorHTMLAttributes, useState } from "react";
import { resolveDownloadUrl } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

type SignedFileLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export function SignedFileLink({ href, onClick, children, ...rest }: SignedFileLinkProps) {
  const [pending, setPending] = useState(false);

  return (
    <a
      {...rest}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        if (pending) return;

        const popup = window.open("about:blank", "_blank");
        setPending(true);

        void resolveDownloadUrl(href)
          .then((url) => {
            if (popup) {
              popup.opener = null;
              popup.location.href = url;
              return;
            }
            window.location.assign(url);
          })
          .catch((error: unknown) => {
            popup?.close();
            const description = error instanceof Error
              ? error.message
              : "Não foi possível abrir este PDF.";
            toast({
              title: "Arquivo indisponível",
              description,
              variant: "destructive",
            });
          })
          .finally(() => {
            setPending(false);
          });
      }}
      aria-busy={pending}
    >
      {children}
    </a>
  );
}
