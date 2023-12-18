export declare const useSilentLogin: () => () => Promise<void>;
export declare const useInvokeLogin: () => (
  government?: boolean,
) => Promise<void>;
export declare const refresh: () => Promise<void>;
export declare const useSignOut: () => () => Promise<void>;
