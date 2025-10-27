"use client";

import * as React from "react";
import {
  School,
  UserRound,
  UsersRound,
  CircleUserRound,
  BadgeQuestionMark,
  BadgeCheck,
  ScanLine,
} from "lucide-react";

import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Schools",
      url: "/admin",
      icon: School,
      items: [
        {
          title: "School List",
          url: "/admin/schools",
        },
        {
          title: "Create School",
          url: "/admin/schools/create",
        },
      ],
    },
    {
      title: "Members",
      url: "#",
      icon: UserRound,
      items: [
        {
          title: "Member List",
          url: "/admin/members",
        },
        {
          title: "Create Member",
          url: "/admin/members/create",
        },
      ],
    },
    {
      title: "Teams",
      url: "#",
      icon: UsersRound,
      items: [
        {
          title: "Team List",
          url: "/admin/teams",
        },
        {
          title: "Create Team",
          url: "/admin/teams/create",
        },
      ],
    },
    {
      title: "Accounts",
      url: "#",
      icon: CircleUserRound,
      items: [
        {
          title: "Account List",
          url: "/admin/accounts",
        },
        {
          title: "Create Account",
          url: "/admin/accounts/create",
        },
      ],
    },
    {
      title: "Questions",
      url: "#",
      icon: BadgeQuestionMark,
      items: [
        {
          title: "Question List",
          url: "/admin/questions",
        },
        {
          title: "Create Question",
          url: "/admin/questions/create",
        },
      ],
    },
    {
      title: "Answers",
      url: "#",
      icon: BadgeCheck,
      items: [
        {
          title: "Answer List",
          url: "/admin/answers",
        },
        {
          title: "Create Answer",
          url: "/admin/answers/create",
        },
      ],
    },
    {
      title: "Scan",
      url: "/admin/scan",
      icon: ScanLine,
      isCollapsible: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
