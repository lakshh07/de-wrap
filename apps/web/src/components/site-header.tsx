import { UserButton, useUser } from "@clerk/nextjs";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { getGreeting } from "@/lib/utils";

export function SiteHeader() {
  const { user } = useUser();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">
          {getGreeting()}, {user?.fullName}
        </h1>
        <div className="ml-auto relative flex items-center gap-2">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
