import mongoose, { Schema, model, models, type Document } from 'mongoose';
import type { UserType, LearningProfile } from '@/types';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  image?: string;
  userType: UserType;           // élève (RAG curriculum) ou étudiant (open bar)
  learningProfile: LearningProfile;
  legalAcceptance?: {
    version: string;
    acceptedAt: Date;
    termsAccepted: boolean;
    privacyAcknowledged: boolean;
    externalAiConsent: boolean;
    ageOrGuardianConfirmed: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CustomSubjectSchema = new Schema(
  {
    id:    { type: String },
    label: { type: String },
    emoji: { type: String },
    color: { type: String },
  },
  { _id: false }
);

const LearningProfileSchema = new Schema<LearningProfile>(
  {
    weakSubjects:   { type: [String], default: [] },
    studiedTopics:  { type: [String], default: [] },
    totalSessions:  { type: Number, default: 0 },
    lastActiveAt:   { type: Date },
    onboardingDone: { type: Boolean, default: false },
    schoolLevel:    { type: String },
    studentField:   { type: String },
    customSubjects: { type: [CustomSubjectSchema], default: [] },
  },
  { _id: false }
);

const LegalAcceptanceSchema = new Schema(
  {
    version: { type: String, required: true },
    acceptedAt: { type: Date, required: true },
    termsAccepted: { type: Boolean, required: true },
    privacyAcknowledged: { type: Boolean, required: true },
    externalAiConsent: { type: Boolean, required: true },
    ageOrGuardianConfirmed: { type: Boolean, required: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name:            { type: String, required: true, trim: true, maxlength: 80 },
    email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:    { type: String, required: true },
    image:           { type: String },
    userType:        { type: String, enum: ['eleve', 'etudiant'], default: 'eleve' },
    learningProfile: { type: LearningProfileSchema, default: () => ({}) },
    legalAcceptance: { type: LegalAcceptanceSchema },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Prevent model re-compilation in Next.js hot reload
export const User = models.User ?? model<IUser>('User', UserSchema);
