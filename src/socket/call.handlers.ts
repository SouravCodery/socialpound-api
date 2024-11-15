import { Server, Socket } from "socket.io";

import { SocketConstants } from "../constants/socket.constants";
import { checkFriendshipStatus } from "./../services/v1/friendship.services";
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

  const callFriend = async (data: {
    friendId: string;
    offer: RTCSessionDescriptionInit;
  }) => {
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
        socket.emit(SocketConstants.EVENTS.CALL_FAILED, {
          message: "You can only call your friends",
        });
        return;
      }

      const friendSocketId = onlineUsers.get(friendId);

      if (!friendSocketId) {
        socket.emit(SocketConstants.EVENTS.CALL_FAILED, {
          message: "Friend is not online",
        });
        return;
      }

      io.to(friendSocketId).emit(SocketConstants.EVENTS.INCOMING_CALL, {
        message: `${username.split("@")[0]} is calling!`,
        offer: data.offer,
      });
    } catch (error) {
      logger.error(
        "[Socket Handler: callFriend] - Something went wrong",
        error
      );

      socket.emit(SocketConstants.EVENTS.CALL_FAILED, {
        message: "Call failed, Please try again!",
      });
    }
  };

  const callAnswer = async (data: {
    friendId: string;
    answer: RTCSessionDescriptionInit;
  }) => {
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
        socket.emit(SocketConstants.EVENTS.CALL_FAILED, {
          message: "You can only call your friends",
        });
        return;
      }

      const friendSocketId = onlineUsers.get(friendId);

      if (!friendSocketId) {
        socket.emit(SocketConstants.EVENTS.CALL_FAILED, {
          message: "Friend is not online",
        });
        return;
      }

      io.to(friendSocketId).emit(SocketConstants.EVENTS.INCOMING_ANSWER, {
        message: `${username.split("@")[0]} is answering!`,
        answer: data.answer,
      });
    } catch (error) {
      logger.error(
        "[Socket Handler: answerCall] - Something went wrong",
        error
      );

      socket.emit(SocketConstants.EVENTS.CALL_FAILED, {
        message: "Call failed, Please try again!",
      });
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
  socket.on(SocketConstants.EVENTS.DISCONNECT, disconnect);
};
