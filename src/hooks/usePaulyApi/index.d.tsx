import { loadingStateEnum } from "@constants";

declare const usePaulyApi: () => string | loadingStateEnum.failed | loadingStateEnum.loading;
export = usePaulyApi;