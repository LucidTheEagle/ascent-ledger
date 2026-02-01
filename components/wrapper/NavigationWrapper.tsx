"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/landing/navigation/Navbar";
import { FloatingNavbar } from "@/components/landing/navigation/FloatingNavbar";

export function NavigationWrapper() {
  const pathname = usePathname();

  const hiddenPaths = [
    "/sign-up", 
    "/login", 
    "/auth/verify-email", 
    "/onboarding",
    "/dashboard",
    "/fog-triage",
    "/vision-canvas",
    "/crisis-triage",
    "/log/new",
    "/log/fog-check"
  ];

  // Check if current path starts with any of the hidden paths
  const shouldHideNav = hiddenPaths.some((path) => pathname.startsWith(path));

  if (shouldHideNav) {
    return null; // Return nothing (Clean Slate)
  }

  return (
    <>
      <Navbar />
      <FloatingNavbar />
    </>
  );
}