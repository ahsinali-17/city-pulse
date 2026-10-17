import { getCachedHomeStats } from "@/lib/db/cache";
import { HomePage } from "@/components/home/home-page";

export default async function Home() {
  const stats = await getCachedHomeStats();
  return <HomePage stats={stats} />;
}

