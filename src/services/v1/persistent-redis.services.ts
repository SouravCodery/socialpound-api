import { persistentRedisClient } from "../../config/redis-persistent.config";
import { logger } from "../../logger/index.logger";

export const incrementLikeOrCommentCountInBulk = async ({
  entityType,
  ids,
  countType,
  incrementBy = 1,
}: {
  entityType: "Post" | "Comment";
  ids: string[];
  countType: "likesCount" | "commentsCount";
  incrementBy?: number;
}) => {
  try {
    const multi = persistentRedisClient.multi();

    ids.forEach((id) => {
      const hashKey = `${entityType}:${id}:counter`;
      multi.hIncrBy(hashKey, countType, incrementBy);
    });

    const incrementResult = await multi.exec();
    return incrementResult;
  } catch (error) {
    logger.error(
      "[Service: incrementLikeOrCommentCountInBulk] - Something went wrong",
      error
    );
  }
};

export const getLikeAndCommentsCountInBulk = async ({
  entityType,
  ids,
}: {
  entityType: "Post" | "Comment";
  ids: string[];
}) => {
  try {
    const multi = persistentRedisClient.multi();

    ids.forEach((id) => {
      const hashKey = `${entityType}:${id}:counter`;
      multi.hGetAll(hashKey);
    });

    let counters = await multi.exec();
    return counters;
  } catch (error) {
    logger.error(
      "[Service: getLikeAndCommentsCountInBulk] - Something went wrong",
      error
    );

    return [];
  }
};
