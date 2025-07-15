"use client";
import NavigationBar from "@/components/NavigationBar";
import { usePathname } from "next/navigation";

export default function NavWrapper() {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  return <NavigationBar />;
} 