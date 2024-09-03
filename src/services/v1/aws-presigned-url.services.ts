import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { HttpError } from "../../classes/http-error.class";
import { HttpResponse } from "../../classes/http-response.class";

import { logger } from "../../logger/index.logger";
import { Config } from "../../config/config";

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
    const key = `${user}/post/images/${Date.now()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: Config.AWS_BUCKET_NAME,
      Key: key,
      ContentType: type,
      // ContentLength: size,
    });

    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn: 60,
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

    throw new HttpError(500, "Something went wrong in generating signed url");
  }
};
