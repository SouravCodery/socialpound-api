export interface CallFriendParamInterface {
  data: {
    friendId: string;
    offer: RTCSessionDescriptionInit;
  };
}

export interface EventAcknowledgementCallbackParam {
  message: string;
  isSuccessful: boolean;
}
