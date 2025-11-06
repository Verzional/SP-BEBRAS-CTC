import PusherServer from "pusher";
import PusherClient from "pusher-js";

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    wsHost: process.env.NEXT_PUBLIC_SOKETI_HOST!,
    wsPort: parseInt(process.env.NEXT_PUBLIC_SOKETI_PORT!, 10),
    wssPort: parseInt(process.env.NEXT_PUBLIC_SOKETI_PORT!, 10),
    forceTLS: process.env.NEXT_PUBLIC_SOKETI_TLS === "true",
    disableStats: true,
    enabledTransports: ["ws", "wss"],
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  host: process.env.SOKETI_HOST!,
  port: process.env.SOKETI_PORT!,
  useTLS: process.env.SOKETI_TLS === "true",
});

// export const pusherClient = new PusherClient(
//   process.env.NEXT_PUBLIC_PUSHER_KEY!,
//   {
//     cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
//     forceTLS: true,
//   }
// );

// export const pusherServer = new PusherServer({
//   appId: process.env.PUSHER_APP_ID!,
//   key: process.env.PUSHER_KEY!,
//   secret: process.env.PUSHER_SECRET!,
//   cluster: process.env.PUSHER_CLUSTER!,
//   useTLS: true,
// });