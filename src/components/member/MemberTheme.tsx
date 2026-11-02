import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type MemberTheme = "light" | "dark";

const MemberThemeContext = createContext<{
  theme: MemberTheme;
  toggleTheme: () => void;
}>({ theme: "light", toggleTheme: () => {} });

function storedTheme(): MemberTheme {
  try {
    return localStorage.getItem("ju.member.theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function MemberThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<MemberTheme>(storedTheme);

  useEffect(() => {
    localStorage.setItem("ju.member.theme", theme);
  }, [theme]);

  return (
    <MemberThemeContext.Provider
      value={{
        theme,
        toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </MemberThemeContext.Provider>
  );
}

export function useMemberTheme() {
  return useContext(MemberThemeContext);
}
