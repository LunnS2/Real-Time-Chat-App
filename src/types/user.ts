import { Id } from "../../convex/_generated/dataModel";

export type User = {
  _id: Id<"users">;
  name?: string;
  email: string;
  image: string;
  tokenIdentifier: string;
  isOnline: boolean;
  _creationTime: number;
};