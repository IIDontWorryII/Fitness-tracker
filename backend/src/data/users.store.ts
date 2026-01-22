import mongoose, { Schema } from "mongoose";

export interface UserDocument {
  email: string;
  name: string;

  // optional: user might be OIDC-only or passkey-only
  passwordHash?: string;

  // OIDC providers
  oidc?: {
    google?: {
      sub: string;
      emailVerified?: boolean;
    };
  };

  oauth?: {
    github?: {
      id: number;
    };
  };

  // Passkeys (WebAuthn)
  passkeys?: Array<{
    credentialId: string; // base64url
    publicKey: string; // base64url or PEM-like encoding
    counter: number;
    transports?: string[];
    createdAt: Date;
    lastUsedAt?: Date;
  }>;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String },

    passwordHash: { type: String, required: false },

    oidc: {
      type: {
        google: {
          sub: { type: String, required: false, index: true },
          emailVerified: { type: Boolean, required: false },
        },
      },
      required: false,
      default: undefined,
    },

    oauth: {
      type: {
        github: {
          id: { type: Number, required: false, index: true },
          login: { type: String, required: false },
        },
      },
      required: false,
      default: undefined,
    },

    passkeys: [
      {
        credentialId: { type: String, required: true },
        publicKey: { type: String, required: true },
        counter: { type: Number, required: true, default: 0 },
        transports: [{ type: String }],
        createdAt: { type: Date, required: true, default: () => new Date() },
        lastUsedAt: { type: Date, required: false },
      },
    ],
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
