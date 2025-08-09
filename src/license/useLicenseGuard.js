import { useEffect } from "react";
import { requireLicenseGuard, verifyLicenseIntegrity } from "./index";

export function useLicenseGuard() {
  useEffect(() => {
    requireLicenseGuard();
    verifyLicenseIntegrity();
  }, []);
}