// types/EkycTypes.ts
export interface LogResult {
    logOcr?: string;
    logLivNessCardFront?: string;
    logLiveNessCardRear?: string;
    logCompare?: string;
    logLiveNessFace?: string;
    logMaskFace?: string;
  }
  
  export interface EkycBridge {
    startEkycFull(): Promise<string>;
    startEkycOcr(): Promise<string>;
    startEkycFace(): Promise<string>;
  }