export const SocketConstants = {
  EVENTS: {
    CONNECTION: "connection",
    DISCONNECT: "disconnect",

    CALL_FRIEND: "call-friend",
    CALL_FAILED: "call-failed",
    INCOMING_CALL: "incoming-call",

    ERROR: "error",
  },
} as const;
