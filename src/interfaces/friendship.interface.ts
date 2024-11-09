import { Document, ObjectId, Types } from "mongoose";
import { SoftDeleteInterface } from "./soft-delete.interface";
import { PopulatedUserInterface } from "./user.interface";

export interface FriendshipInterface {
  requester: ObjectId;
  receiver: ObjectId;
  status: "requested" | "accepted" | "rejected";
}

export interface FriendshipDocumentInterface
  extends Document,
    FriendshipInterface,
    SoftDeleteInterface {}

export interface FriendshipWithIdInterface extends FriendshipInterface {
  _id: Types.ObjectId;
}

export interface PopulatedFriendshipInterface {
  _id: ObjectId;
  requester: PopulatedUserInterface;
  receiver: PopulatedUserInterface;
  status: "requested" | "accepted" | "rejected";
}
