import { persistentRedisClient } from "../../config/redis-persistent.config";
import { logger } from "../../logger/index.logger";

export const incrementLikeOrCommentCount = async ({
  entity,
  id,
  countType,
}: {
  entity: "Post" | "Comment";
  id: string;
  countType: "likesCount" | "commentsCount";
}) => {
  try {
    const hashKey = `${entity}:${id}:counter`;
    const result = await persistentRedisClient.hIncrBy(hashKey, countType, 1);

    return result;
  } catch (error) {
    logger.error("[Service: incrementCount] - Something went wrong", error);
  }
};

export const getLikesCommentCount = async ({
  entity,
  id,
}: {
  entity: "Post" | "Comment";
  id: string;
}) => {
  try {
    const hashKey = `${entity}:${id}:counter`;
    const result = await persistentRedisClient.hGetAll(hashKey);

    return {
      likesCount: Number(result.likesCount ?? 0),
      commentsCount: Number(result.commentsCount ?? 0),
    };
  } catch (error) {
    logger.error("[Service: getCount] - Something went wrong", error);
  }
};
