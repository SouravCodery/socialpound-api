import { MarkNotificationAsReadInterface } from "./../../interfaces/notification.interface";
import { FilterQuery } from "mongoose";

import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";
import { logger } from "../../logger/index.logger";

import Notification from "../../models/notification.model";
import {
  NotificationInterface,
  NotificationJobInterface,
  NotificationWithIdInterface,
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

    throw new HttpError(
      500,
      "[Service: addNotificationsToQueue] - Something went wrong"
    );
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
    console.log({ addBulkResult });

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

    throw new HttpError(
      500,
      "[Service: addMarkNotificationAsReadToQueue] - Something went wrong"
    );
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

    throw new HttpError(
      500,
      "[Service: createNotifications] - Something went wrong"
    );
  }
};
