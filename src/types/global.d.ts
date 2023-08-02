export {};

declare global {
  type PickRequired<Type, Key extends keyof Type> = {
    [Property in Key]-?: Type[Property];
  };

  type PickOptional<Type, Key extends keyof Type> = {
    [Property in Key]?: Type[Property];
  };
}
