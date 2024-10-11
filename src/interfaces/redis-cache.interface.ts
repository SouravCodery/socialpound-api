export interface APICacheKeyParamsInterface {
  url: string;
  params: object;
  query: object;
  authenticatedUserId: number | null;

  value: Object;
  ttl?: "ONE_MINUTE" | "FIVE_MINUTES" | "ONE_HOUR" | "ONE_DAY";
}
