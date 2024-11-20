export interface EventAcknowledgementCallbackParam {
  message: string;
  isSuccessful: boolean;
  roomId?: string;
}
