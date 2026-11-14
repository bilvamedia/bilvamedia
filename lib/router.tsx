import { useEffect, useState, type AnchorHTMLAttributes, type CSSProperties, type ReactNode } from "react";

export type Route = { path: string; params: URLSearchParams };

const POP = "takeok:route";

function read(): Route {
  return { path: window.location.pathname || "/", params: new URLSearchParams(window.location.search) };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener("popstate", onChange);
    window.addEventListener(POP, onChange);
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener(POP, onChange);
    };
  }, []);
  return route;
}

export function navigate(to: string): void {
  const next = to.startsWith("/") ? to : `/${to}`;
  if (window.location.pathname + window.location.search !== next) {
    window.history.pushState({}, "", next);
    window.dispatchEvent(new Event(POP));
  }
  window.scrollTo({ top: 0 });
}

export function Link({
  to,
  className,
  style,
  children,
  onNavigate,
  ...rest
}: {
  to: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onNavigate?: () => void;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const href = to.startsWith("/") ? to : `/${to}`;
  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        navigate(href);
        onNavigate?.();
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
