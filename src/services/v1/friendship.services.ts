import Friendship from "../../models/friendship.model";
import User from "../../models/user.model";

import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";
import { PopulatedFriendshipInterface } from "../../interfaces/friendship.interface";

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

    //todo: send notification to receiver
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

export const getFriendsList = async ({ userId }: { userId: string }) => {
  try {
    const friends = (await Friendship.find({
      $or: [
        { requester: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    })
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
      data: friendList,
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
}: {
  userId: string;
}) => {
  try {
    const pendingRequests = await Friendship.find({
      receiver: userId,
      status: "requested",
    })
      .populate({
        path: "requester",
        select: "username email fullName profilePicture",
        match: { isDeleted: false },
      })
      .lean();

    return new HttpResponse({
      status: 200,
      message: "Pending friend requests fetched successfully",
      data: pendingRequests.filter((request) => request.requester),
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
