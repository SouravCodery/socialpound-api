import { Server, Socket } from "socket.io";

import { checkFriendshipStatus } from "./../services/v1/friendship.services";
import { SocketConstants } from "../constants/socket.constants";
import { EventAcknowledgementCallbackParam } from "./../interfaces/socket.interface";
import { logger } from "../logger/winston.logger";

const onlineUsers = new Map<string, string>();

export const callHandlers = ({
  io,
  socket,
}: {
  io: Server;
  socket: Socket;
}) => {
  onlineUsers.set(socket.data.userId, socket.id);

  const callFriend = async (
    data: {
      friendId: string;
      offer: RTCSessionDescriptionInit;
    },
    eventAcknowledgementCallback: (
      response: EventAcknowledgementCallbackParam
    ) => void
  ) => {
    try {
      const { friendId } = data;
      const { userId, user } = socket.data;
      const { username } = user;

      const friendshipStatusResponse = await checkFriendshipStatus({
        userId,
        otherUser: friendId,
      });

      const isFriend =
        friendshipStatusResponse.getResponse().data?.status === "accepted";

      if (!isFriend) {
        eventAcknowledgementCallback({
          isSuccessful: false,
          message: "You can only call your friends",
        });

        return;
      }

      const friendSocketId = onlineUsers.get(friendId);

      if (!friendSocketId) {
        eventAcknowledgementCallback({
          isSuccessful: false,
          message: "Friend is not online",
        });

        return;
      }

      const roomId = `${userId}-${friendId}-${Date.now()}`;
      socket.join(roomId);

      socket.to(friendSocketId).emit(SocketConstants.EVENTS.INCOMING_CALL, {
        message: `${username.split("@")[0]} is calling!`,
        offer: data.offer,
        callingUserId: userId,
        roomId,
        user,
      });

      eventAcknowledgementCallback({
        isSuccessful: true,
        message: "Call initiated",
        roomId,
      });
    } catch (error) {
      logger.error(
        "[Socket Handler: callFriend] - Something went wrong",
        error
      );

      eventAcknowledgementCallback({
        isSuccessful: false,
        message: "Call failed, Please try again!",
      });
    }
  };

  const callAnswer = async (
    data: {
      friendId: string;
      answer: RTCSessionDescriptionInit;
      roomId: string;
    },
    eventAcknowledgementCallback: (
      response: EventAcknowledgementCallbackParam
    ) => void
  ) => {
    try {
      const { friendId, roomId } = data;
      const { userId, user } = socket.data;
      const { username } = user;

      const friendshipStatusResponse = await checkFriendshipStatus({
        userId,
        otherUser: friendId,
      });

      const isFriend =
        friendshipStatusResponse.getResponse().data?.status === "accepted";

      if (!isFriend) {
        eventAcknowledgementCallback({
          isSuccessful: false,
          message: "You can only call your friends",
        });

        return;
      }

      const friendSocketId = onlineUsers.get(friendId);

      if (!friendSocketId) {
        eventAcknowledgementCallback({
          isSuccessful: false,
          message: "Friend is not online",
        });

        return;
      }

      const room = io.sockets.adapter.rooms.get(roomId);

      if ((room?.has(friendSocketId) && room.size === 1) === false) {
        eventAcknowledgementCallback({
          isSuccessful: false,
          message: "Friend is not online",
        });

        return;
      }

      socket.join(roomId);
      socket.to(roomId).emit(SocketConstants.EVENTS.INCOMING_ANSWER, {
        message: `${username.split("@")[0]} has answered the call!`,
        answer: data.answer,
        roomId,
      });
    } catch (error) {
      logger.error(
        "[Socket Handler: callAnswer] - Something went wrong",
        error
      );

      eventAcknowledgementCallback({
        isSuccessful: false,
        message: "Call failed, Please try again!",
      });
    }
  };

  const newIceCandidateSent = async (data: {
    candidate: RTCIceCandidate;
    roomId: string;
  }) => {
    try {
      const { candidate, roomId } = data;

      socket
        .to(roomId)
        .emit(SocketConstants.EVENTS.NEW_ICE_CANDIDATE_RECEIVED, {
          candidate,
        });
    } catch (error) {
      logger.error(
        "[Socket Handler: newIceCandidateSent] - Something went wrong",
        error
      );
    }
  };

  const callRejected = async (data: { friendId: string; roomId: string }) => {
    try {
      const { roomId } = data;
      const { user } = socket.data;
      const { username } = user;

      socket.to(roomId).emit(SocketConstants.EVENTS.CALL_REJECTED, {
        message: `${username.split("@")[0]} has rejected your call.`,
        roomId,
      });
    } catch (error) {
      logger.error(
        "[Socket Handler: callRejected] - Something went wrong",
        error
      );
    }
  };

  const callEnded = async (data: { roomId: string }) => {
    try {
      const { roomId } = data;

      socket.to(roomId).emit(SocketConstants.EVENTS.CALL_ENDED);
      io.socketsLeave(roomId);
    } catch (error) {
      logger.error("[Socket Handler: callEnded] - Something went wrong", error);
    }
  };

  const callUnanswered = async (data: { friendId: string; roomId: string }) => {
    try {
      const { roomId } = data;
      const { user } = socket.data;
      const { username } = user;

      socket.to(roomId).emit(SocketConstants.EVENTS.CALL_UNANSWERED, {
        message: `${username.split("@")[0]} did not answer the call.`,
        roomId,
      });

      io.socketsLeave(roomId);
    } catch (error) {
      logger.error(
        "[Socket Handler: callUnanswered] - Something went wrong",
        error
      );
    }
  };

  const callBusy = async (data: { friendId: string; roomId: string }) => {
    try {
      const { roomId } = data;
      const { user } = socket.data;
      const { username } = user;

      socket.to(roomId).emit(SocketConstants.EVENTS.CALL_BUSY, {
        message: `${username.split("@")[0]} is busy.`,
        roomId,
      });

      io.socketsLeave(roomId);
    } catch (error) {
      logger.error("[Socket Handler: callBusy] - Something went wrong", error);
    }
  };

  const disconnect = () => {
    try {
      logger.info(`A user disconnected: ${socket.id}`);

      const { userId } = socket.data;
      onlineUsers.delete(userId);
    } catch (error) {
      logger.error(
        "[Socket Handler: disconnect] - Something went wrong",
        error
      );
    }
  };

  socket.on(SocketConstants.EVENTS.CALL_FRIEND, callFriend);
  socket.on(SocketConstants.EVENTS.CALL_ANSWER, callAnswer);
  socket.on(SocketConstants.EVENTS.NEW_ICE_CANDIDATE_SENT, newIceCandidateSent);
  socket.on(SocketConstants.EVENTS.CALL_REJECTED, callRejected);
  socket.on(SocketConstants.EVENTS.CALL_ENDED, callEnded);
  socket.on(SocketConstants.EVENTS.CALL_UNANSWERED, callUnanswered);
  socket.on(SocketConstants.EVENTS.CALL_BUSY, callBusy);
  socket.on(SocketConstants.EVENTS.DISCONNECT, disconnect);
};
