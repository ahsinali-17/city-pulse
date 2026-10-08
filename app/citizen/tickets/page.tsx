import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema/tickets";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Ticket, Plus, MapPin, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CitizenTicketsListPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all tickets reported by this citizen
  const userTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.reporterId, session.user.id))
    .orderBy(desc(tickets.createdAt));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Ticket className="size-6 text-blue-600" /> My Submissions
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track the status of your reported municipal hazards.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-md">
          <Link href="/citizen/new" className="flex items-center gap-2">
            <Plus className="size-4" />
            Report New Hazard
          </Link>
        </Button>
      </div>

      {userTickets.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="p-4 bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
              <Ticket className="size-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No tickets found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                You haven&apos;t submitted any hazard reports yet. When you do, they will appear here.
              </p>
            </div>
            <Button variant="outline" className="mt-2 text-xs">
              <Link href="/citizen/new">Submit your first report</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTickets.map((ticket) => {
            // Determine styles based on status
            const isResolved = ticket.status === "RESOLVED" || ticket.status === "COMPLETED";
            const isDispatched = ticket.status === "DISPATCHED" || ticket.status === "IN_PROGRESS" || ticket.status === "EN_ROUTE" || ticket.status === "ON_SITE";
            
            return (
              <Card key={ticket.id} className="flex flex-col border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow group overflow-hidden">
                {ticket.imageUrl && (
                  <div className="h-32 w-full overflow-hidden relative">
                    <img 
                      src={ticket.imageUrl} 
                      alt={ticket.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 to-transparent" />
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-2 left-2 text-[10px] font-mono shadow-sm bg-white/90 dark:bg-slate-900/90"
                    >
                      ID: {ticket.id}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-bold line-clamp-1 leading-snug">
                      {ticket.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-[11px] flex items-center gap-1.5 pt-1">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{ticket.address}</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4 pt-2 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`font-mono text-[10px] px-1.5 py-0 ${
                        isResolved
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : isDispatched
                          ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300"
                          : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      ● {ticket.status.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-500 font-normal">
                      {ticket.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-[10px] text-muted-foreground gap-1.5">
                    <Activity className="size-3 shrink-0" />
                    <span>Reported on {new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="p-0 border-t border-slate-100 dark:border-slate-800/60">
                  <Button variant="ghost" className="w-full rounded-none rounded-b-xl h-10 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 justify-between px-4">
                    <Link href={`/citizen/tickets/${ticket.id}`}>
                      View Details & Tracker
                      <ArrowRight className="size-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
