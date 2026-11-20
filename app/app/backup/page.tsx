import type { Metadata } from "next";
import { BackupScreen } from "@/components/backup-screen";

export const metadata: Metadata = { title: "Backup" };

export default function Page() {
  return <BackupScreen />;
}
