"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  House,
  ScanLine,
  Timer,
  SignpostBig,
  School,
  UsersRound,
  UserRound,
  CircleUserRound,
  BadgeQuestionMark,
  BadgeCheck,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Home",
      url: "/admin",
      icon: House,
      isCollapsible: false,
    },
    {
      title: "Scan",
      url: "/admin/scan",
      icon: ScanLine,
      isCollapsible: false,
    },
    {
      title: "Contest",
      url: "/admin/contest",
      icon: Timer,
      isCollapsible: false,
    },
    {
      title: "Posts",
      url: "#",
      icon: SignpostBig,
      items: [
        {
          title: "Post List",
          url: "/admin/posts",
        },
        {
          title: "Create Post",
          url: "/admin/posts/create",
        },
      ],
    },
    {
      title: "Schools",
      url: "#",
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
          title: "Create Answer",
          url: "/admin/answers/create",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const user = session?.user
    ? {
        name: session.user.name || session.user.username || "User",
        username: session.user.username || "",
        avatar: "/Beaver.webp",
      }
    : {
        name: "Guest",
        username: session?.user?.username || "",
        avatar: "/Beaver.webp",
      };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
