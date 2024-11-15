export const SocketConstants = {
  EVENTS: {
    CONNECTION: "connection",
    DISCONNECT: "disconnect",

    CALL_FRIEND: "call-friend",
    CALL_FAILED: "call-failed",
    CALL_ANSWER: "call-answer",

    INCOMING_CALL: "incoming-call",
    INCOMING_ANSWER: "incoming-answer",

    ERROR: "error",
  },
} as const;
