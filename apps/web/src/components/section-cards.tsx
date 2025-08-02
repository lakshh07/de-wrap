import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { User } from "@prisma/client";
import Link from "next/link";

export function SectionCards({ user }: { user: User }) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader className="items-center justify-center">
          <CardDescription>Your Balance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${Number(user?.totalBalance ?? 0)}
          </CardTitle>
          <CardAction className="flex flex-col items-end gap-2">
            <Link href="/invoices/new">
              <Button variant={"outline"}>
                <Plus /> Create Invoice
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
