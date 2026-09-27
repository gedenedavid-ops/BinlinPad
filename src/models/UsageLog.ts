import mongoose, { Schema, model, models } from 'mongoose';

export type UsageProvider = 'deepseek' | 'gemini';
export type UsageAction = 'chat' | 'analyze' | 'ocr';

export interface IUsageLog {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  provider: UsageProvider;
  action: UsageAction;
  model: string;
  totalTokens: number;
  promptTokens?: number;
  completionTokens?: number;
  dayKey: string;
  monthKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const UsageLogSchema = new Schema<IUsageLog>(
  {
    userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider:       { type: String, enum: ['deepseek', 'gemini'], required: true },
    action:         { type: String, enum: ['chat', 'analyze', 'ocr'], required: true },
    model:          { type: String, required: true },
    totalTokens:    { type: Number, required: true, default: 0 },
    promptTokens:   { type: Number, default: 0 },
    completionTokens:{ type: Number, default: 0 },
    dayKey:         { type: String, required: true, index: true },
    monthKey:       { type: String, required: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UsageLogSchema.index({ userId: 1, dayKey: 1, action: 1 });
UsageLogSchema.index({ userId: 1, monthKey: 1 });

export const UsageLog = models.UsageLog ?? model<IUsageLog>('UsageLog', UsageLogSchema);
