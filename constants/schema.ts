export const ProvideStatus = {
    REQUESTED: "requested",
    PROVIDED: "provided",
    FINALIZED: "finalized"
  } as const;

export type ProvideStatus = typeof ProvideStatus[keyof typeof ProvideStatus];
