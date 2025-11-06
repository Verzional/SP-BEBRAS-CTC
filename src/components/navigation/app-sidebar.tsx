"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  House,
  ScanLine,
  Timer,
  Trophy,
  Gavel,
  SignpostBig,
  Calendar,
  School,
  UsersRound,
  CircleUserRound,
  BadgeQuestionMark,
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
      title: "Master",
      url: "#",
      icon: Trophy,
      items: [
        {
          title: "Cleanup Manager",
          url: "/master",
        },
        {
          title: "Leaderboard",
          url: "/master/leaderboard",
        },
        {
          title: "Create Account",
          url: "/master/create",
        },
      ],
    },
    {
      title: "Judge",
      url: "#",
      icon: Gavel,
      items: [
        {
          title: "Final Scoring",
          url: "/judge/scoring",
        },
        {
          title: "Team Scores",
          url: "/judge/scores",
        },
      ],
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
      title: "Rounds",
      url: "#",
      icon: Calendar,
      items: [
        {
          title: "Round List",
          url: "/admin/rounds",
        },
        {
          title: "Create Round",
          url: "/admin/rounds/create",
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
