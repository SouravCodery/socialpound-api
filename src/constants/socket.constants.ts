export const SocketConstants = {
  EVENTS: {
    CONNECTION: "connection",
    DISCONNECT: "disconnect",

    CALL_FRIEND: "call-friend",
    CALL_FAILED: "call-failed",
    CALL_ANSWER: "call-answer",

    INCOMING_CALL: "incoming-call",
    INCOMING_ANSWER: "incoming-answer",

    NEW_ICE_CANDIDATE_SENT: "new-ice-candidate-sent",
    NEW_ICE_CANDIDATE_RECEIVED: "new-ice-candidate-received",

    ERROR: "error",
  },
} as const;
