export const setValueToOnlyReadProp = (obj: Object, prop: string, value: any) => {
  Object.defineProperty(obj, prop, {
    value,
    configurable: true,
    writable: true,
  });
};
