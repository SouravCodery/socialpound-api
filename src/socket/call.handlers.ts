import { Server, Socket } from "socket.io";

import { SocketConstants } from "../constants/socket.constants";
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

  const callFriend = (data: { friendId: string }) => {
    const { friendId } = data;
    const { userId, user } = socket.data;
    const { username } = user;

    const friendSocketId = onlineUsers.get(friendId);

    if (!friendSocketId) {
      socket.emit(SocketConstants.EVENTS.CALL_FAILED, {
        message: "Friend is not online",
      });
      return;
    }

    io.to(friendSocketId).emit(SocketConstants.EVENTS.INCOMING_CALL, {
      message: `${username.split("@")[0]} is calling!`,
    });
  };

  socket.on(SocketConstants.EVENTS.CALL_FRIEND, callFriend);

  socket.on(SocketConstants.EVENTS.DISCONNECT, () => {
    logger.info(`A user disconnected: ${socket.id}`);

    const { userId } = socket.data;
    onlineUsers.delete(userId);
  });
};
