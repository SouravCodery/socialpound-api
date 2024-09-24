import { MarkNotificationAsReadInterface } from "./../../interfaces/notification.interface";
import { FilterQuery } from "mongoose";

import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";
import { logger } from "../../logger/index.logger";

import Notification from "../../models/notification.model";
import {
  NotificationInterface,
  NotificationJobInterface,
} from "../../interfaces/notification.interface";
import { notificationQueue } from "../../mq/bull-mq/index.bull-mq";

export const addNotificationsToQueue = async ({
  jobs,
}: {
  jobs: NotificationJobInterface[];
}) => {
  try {
    await notificationQueue.addBulk(jobs);

    return new HttpResponse({
      status: 202,
      message: "Notification addition request added to the queue",
    });
  } catch (error) {
    logger.error(
      "[Service: addNotificationsToQueue] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "[Service: addNotificationsToQueue] - Something went wrong",
    });
  }
};

export const addMarkNotificationAsReadToQueue = async ({
  notificationId,
  recipient,
}: {
  notificationId: string;
  recipient: string;
}) => {
  try {
    const addBulkResult = await notificationQueue.add("notification-read", {
      notificationId,
      recipient,
    });

    return new HttpResponse({
      status: 202,
      message: "Notification addition request added to the queue",
    });
  } catch (error) {
    logger.error(
      "[Service: addMarkNotificationAsReadToQueue] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message:
        "[Service: addMarkNotificationAsReadToQueue] - Something went wrong",
    });
  }
};

export const createNotifications = async ({
  notifications,
}: {
  notifications: NotificationInterface[];
}) => {
  try {
    const createdNotifications = await Notification.insertMany(notifications, {
      ordered: false,
    });

    return new HttpResponse({
      status: 201,
      message: "Notifications created successfully",
      data: createdNotifications,
    });
  } catch (error) {
    logger.error(
      "[Service: createNotifications] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "[Service: createNotifications] - Something went wrong",
    });
  }
};

export const getNotificationsByUser = async ({
  recipient,
  cursor,
  limit = 20,
}: {
  recipient: string;
  cursor?: string;
  limit?: number;
}) => {
  try {
    const query: FilterQuery<NotificationInterface> = {
      recipient,
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const notifications = await Notification.find(query)
      .limit(limit)
      .sort({ _id: -1 })

      .populate({
        path: "sender",
        select: "username email fullName profilePicture",
        match: { isDeleted: false },
      })
      .populate({
        path: "post",
        select: "content",
        match: { isDeleted: false },
      })
      .populate({
        path: "comment",
        select: "text",
        match: { isDeleted: false },
      })
      .select("sender type post comment read createdAt")
      .lean();

    const nextCursor =
      notifications.length >= limit
        ? notifications[notifications.length - 1]._id.toString()
        : null;

    return new HttpResponse({
      status: 200,
      message: "Notifications fetched successfully",
      data: {
        notifications,
        nextCursor,
      },
    });
  } catch (error) {
    logger.error(
      "[Service: getNotificationsByUser] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "[Service: getNotificationsByUser] - Something went wrong",
    });
  }
};

export const markNotificationsAsRead = async ({
  jobs,
}: {
  jobs: MarkNotificationAsReadInterface[];
}) => {
  try {
    const notificationIds = jobs.map((job) => job.notificationId);
    const notifications = await Notification.find({
      _id: { $in: notificationIds },
    })
      .select("recipient")
      .lean();

    const notificationRecipientMap = new Map(
      jobs.map((job) => [job.notificationId, job.recipient])
    );

    const notificationIdsToMarkAsRead = notifications
      .filter(
        (notification) =>
          notification.recipient.toString() ===
          notificationRecipientMap.get(notification._id.toString())
      )
      .map((notification) => notification._id);

    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIdsToMarkAsRead },
        read: false,
      },
      { $set: { read: true } }
    );

    return new HttpResponse({
      status: 200,
      message: `${result.modifiedCount} notifications marked as read`,
    });
  } catch (error) {
    logger.error(
      "[Service: markNotificationsAsRead] - Something went wrong",
      error
    );

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "[Service: markNotificationsAsRead] - Something went wrong",
    });
  }
};
