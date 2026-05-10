import mongoose from "mongoose";

const communityVisitSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },
    visitorKey: {
      type: String,
      required: true,
      index: true,
    },
    visitedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

communityVisitSchema.index({ community: 1, visitorKey: 1 }, { unique: true });

const CommunityVisit = mongoose.model("CommunityVisit", communityVisitSchema);
export default CommunityVisit;
