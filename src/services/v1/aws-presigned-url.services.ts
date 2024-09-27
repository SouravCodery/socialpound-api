import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";

import { logger } from "../../logger/index.logger";
import { Config } from "../../config/config";
import { Constants } from "../../constants/constants";

const client = new S3Client({ region: Config.AWS_REGION });

export const getPresignedUrl = async ({
  user,
  size,
  type,
}: {
  user: string;
  size: number;
  type: string;
}) => {
  try {
    const fileExtension = type.split("/")[1];
    const key = `${Config.AWS_PRESIGNED_URL_PREFIX}/${
      Config.NODE_ENV
    }/v1/user/${user}/post/images/${Date.now()}.${fileExtension}`;
    //todo: replace Date.now() with uuid

    const command = new PutObjectCommand({
      Bucket: Config.AWS_BUCKET_NAME,
      Key: key,
      ContentType: type,
      // ContentLength: size,
    });

    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn: Constants.DURATION.ONE_MINUTE,
    });

    return new HttpResponse({
      status: 200,
      message: "Presigned url generated successfully",

      data: { presignedUrl, key },
    });
  } catch (error) {
    logger.error("[Service: getPresignedUrl] - Something went wrong", error);

    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError({
      status: 500,
      message: "Something went wrong in generating signed url",
    });
  }
};
