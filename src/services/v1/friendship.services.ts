import { FilterQuery } from "mongoose";

import { Config } from "../../config/config";
import Friendship from "../../models/friendship.model";
import User from "../../models/user.model";
import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";
import {
  FriendshipInterface,
  PopulatedFriendshipInterface,
} from "../../interfaces/friendship.interface";

import { logger } from "../../logger/index.logger";

export const sendFriendRequest = async ({
  requesterId,
  receiverId,
}: {
  requesterId: string;
  receiverId: string;
}) => {
  try {
    const existingFriendship = await Friendship.findOne({
      status: { $in: ["requested", "accepted"] },
      $or: [
        { requester: requesterId, receiver: receiverId },
        { requester: receiverId, receiver: requesterId },
      ],
    });

    if (existingFriendship) {
      throw new HttpError({
        status: 400,
        message: "Friend request already exists or you are already friends.",
      });
    }

    const newFriendship = new Friendship({
      requester: requesterId,
      receiver: receiverId,
    });
    await newFriendship.save();

    return new HttpResponse({
      status: 201,
      message: "Friend request sent successfully",
    });
  } catch (error) {
    logger.error("[Service: sendFriendRequest] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "[Service: sendFriendRequest] - Something went wrong",
    });
  }
};

export const respondToFriendRequest = async ({
  requesterId,
  receiverId,
  status,
}: {
  requesterId: string;
  receiverId: string;
  status: "accepted" | "rejected";
}) => {
  try {
    const friendship = await Friendship.findOneAndUpdate(
      { requester: requesterId, receiver: receiverId, status: "requested" },
      { $set: { status } },
      { new: true }
    );

    if (!friendship) {
      throw new HttpError({
        status: 404,
        message: "Friend request not found",
      });
    }

    if (status === "accepted") {
      await User.updateMany(
        {
          _id: { $in: [requesterId, receiverId] },
        },
        { $inc: { friendsCount: 1 } }
      );
    }

    return new HttpResponse({
      status: 200,
      message: `Friend request ${status}`,
    });
  } catch (error) {
    logger.error(
      "[Service: respondToFriendRequest] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "[Service: respondToFriendRequest] - Something went wrong",
    });
  }
};

export const getFriendsList = async ({
  userId,
  cursor,
  limit = Config.PAGINATION_LIMIT,
}: {
  userId: string;
  cursor?: string;
  limit?: number;
}) => {
  try {
    const query: FilterQuery<FriendshipInterface> = {
      $or: [
        { requester: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const friends = (await Friendship.find(query)
      .limit(limit)
      .sort({ _id: -1 })
      .populate({
        path: "requester",
        select: "username email fullName profilePicture",
        match: { isDeleted: false },
      })
      .populate({
        path: "receiver",
        select: "username email fullName profilePicture",
        match: { isDeleted: false },
      })
      .lean()) as PopulatedFriendshipInterface[];

    const nextCursor =
      friends.length >= limit
        ? friends[friends.length - 1]._id.toString()
        : null;

    const friendList = friends
      .filter((friend) => friend.receiver && friend.requester)
      .map((friend) => {
        const isRequester = friend.requester._id.toString() === userId;
        const friendData = isRequester ? friend.receiver : friend.requester;

        return {
          id: friendData._id,
          email: friendData.email,
          username: friendData.username,
          fullName: friendData.fullName,
          profilePicture: friendData.profilePicture,
        };
      });

    return new HttpResponse({
      status: 200,
      message: "Friends list fetched successfully",
      data: {
        friends: friendList,
        nextCursor,
      },
    });
  } catch (error) {
    logger.error("[Service: getFriendsList] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "[Service: getFriendsList] - Something went wrong",
    });
  }
};

export const getPendingFriendRequests = async ({
  userId,
  cursor,
  limit = Config.PAGINATION_LIMIT,
}: {
  userId: string;
  cursor?: string;
  limit?: number;
}) => {
  try {
    const query: FilterQuery<FriendshipInterface> = {
      receiver: userId,
      status: "requested",
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const pendingRequests = await Friendship.find(query)
      .limit(limit)
      .sort({ _id: -1 })
      .populate({
        path: "requester",
        select: "username email fullName profilePicture",
        match: { isDeleted: false },
      })
      .lean();

    const nextCursor =
      pendingRequests.length >= limit
        ? pendingRequests[pendingRequests.length - 1]._id.toString()
        : null;

    return new HttpResponse({
      status: 200,
      message: "Pending friend requests fetched successfully",
      data: {
        requests: pendingRequests.filter((request) => request.requester),
        nextCursor,
      },
    });
  } catch (error) {
    logger.error(
      "[Service: getPendingFriendRequests] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "[Service: getPendingFriendRequests] - Something went wrong",
    });
  }
};

export const friendshipStatus = async ({
  userId,
  otherUser,
}: {
  userId: string;
  otherUser: string;
}) => {
  try {
    const friendship = await Friendship.findOne({
      status: { $in: ["requested", "accepted"] },
      $or: [
        { requester: userId, receiver: otherUser },
        { requester: otherUser, receiver: userId },
      ],
    }).lean();

    return new HttpResponse({
      status: 200,
      message: "Friendship status fetched successfully",
      data: { friendship },
    });
  } catch (error) {
    logger.error("[Service: friendshipStatus] - Something went wrong", error);

    throw new HttpError({
      status: 500,
      message: "[Service: friendshipStatus] - Something went wrong",
    });
  }
};

export const cancelFriendRequest = async ({
  userId,
  receiverId,
}: {
  userId: string;
  receiverId: string;
}) => {
  try {
    const friendship = await Friendship.findOneAndDelete({
      requester: userId,
      receiver: receiverId,
      status: "requested",
    });

    if (!friendship) {
      throw new HttpError({
        status: 404,
        message: "Friend request not found or already canceled",
      });
    }

    return new HttpResponse({
      status: 200,
      message: "Friend request canceled successfully",
    });
  } catch (error) {
    logger.error(
      "[Service: cancelFriendRequest] - Something went wrong",
      error
    );

    throw new HttpError({
      status: 500,
      message: "[Service: cancelFriendRequest] - Something went wrong",
    });
  }
};

export const unfriend = async ({
  userId,
  friendUserId,
}: {
  userId: string;
  friendUserId: string;
}) => {
  try {
    const friendship = await Friendship.findOneAndDelete({
      $or: [
        { requester: userId, receiver: friendUserId, status: "accepted" },
        { requester: friendUserId, receiver: userId, status: "accepted" },
      ],
    });

    if (!friendship) {
      throw new HttpError({
        status: 404,
        message: "Friendship not found or already unfriended",
      });
    }

    await User.updateMany(
      {
        _id: { $in: [userId, friendUserId] },
      },
      { $inc: { friendsCount: -1 } }
    );

    return new HttpResponse({
      status: 200,
      message: "Unfriended successfully",
    });
  } catch (error) {
    logger.error("[Service: unfriend] - Something went wrong", error);

    throw new HttpError({
      status: 500,
      message: "[Service: unfriend] - Something went wrong",
    });
  }
};
