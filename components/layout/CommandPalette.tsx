"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Moon, Search, Sun } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { getDashboardNav } from "@/components/layout/dashboard-nav";
import { useCommandPaletteStore } from "@/lib/command-palette-store";
import { useTheme } from "@/hooks/useTheme";
import { useSessionStore } from "@/lib/store";

/**
 * Cmd/Ctrl+K palette for jumping between dashboard sections. Mounted once
 * in the dashboard layout; opens from anywhere in the dashboard tree.
 */
export function CommandPalette() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const clearSession = useSessionStore((s) => s.clearSession);
  const { theme, toggleTheme } = useTheme();
  const open = useCommandPaletteStore((s) => s.open);
  const setOpen = useCommandPaletteStore((s) => s.setOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!useCommandPaletteStore.getState().open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  if (!user) return null;

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command palette" description="Jump to a dashboard section">
      <CommandInput placeholder="Search dashboard sections…" />
      <CommandList>
        <CommandEmpty>No matching section.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {getDashboardNav(user.role).map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)}>
              <item.icon aria-hidden="true" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/")}>
            <Search aria-hidden="true" />
            Go to homepage
          </CommandItem>
          <CommandItem
            onSelect={() => {
              toggleTheme();
              setOpen(false);
            }}
          >
            {theme === "dark" ? (
              <Sun aria-hidden="true" />
            ) : (
              <Moon aria-hidden="true" />
            )}
            Toggle {theme === "dark" ? "light" : "dark"} mode
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              clearSession();
              router.replace("/login");
            }}
          >
            <LogOut aria-hidden="true" />
            Log out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
