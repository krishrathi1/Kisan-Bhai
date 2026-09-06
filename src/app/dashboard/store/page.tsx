"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StoreRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/shop");
  }, [router]);

  return null;
}
