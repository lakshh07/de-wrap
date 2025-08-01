import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "./ui/sidebar";

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-2 hidden h-svh lg:flex pb-2"
      {...props}
    >
      <SidebarHeader className="px-3 py-4">
        <h3 className="text-xl font-semibold">All Investments</h3>
      </SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarFooter className="text-right px-3">
        <span className="text-xs text-muted-foreground">
          &copy; 2025 DeWrap. All rights reserved.
        </span>
      </SidebarFooter>
    </Sidebar>
  );
}
