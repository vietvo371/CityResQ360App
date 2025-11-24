import { useState, useCallback } from 'react';
import { ekycService } from '../services/EkycService';
import type { EkycVerifyRequest, EkycVerifyResponse } from '../types/ekyc';
import { useAuth } from '../contexts/AuthContext';

interface UseEkycResult {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: (tokenId: string, tokenKey: string, accessToken: string) => Promise<void>;
  captureIdCardFront: () => Promise<string>;
  captureIdCardBack: () => Promise<string>;
  captureSelfie: () => Promise<string>;
  performLiveness: () => Promise<{video: string; images: string[]}>;
  verifyEkyc: (data: EkycVerifyRequest) => Promise<EkycVerifyResponse>;
}

export function useEkyc(): UseEkycResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const initialize = useCallback(async (
    tokenId: string,
    tokenKey: string,
    accessToken: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await ekycService.initialize({
        tokenId,
        tokenKey,
        accessToken,
      });

      if (!result.status) {
        throw new Error(result.message || 'Failed to initialize VNPT eKYC SDK');
      }

      setIsInitialized(true);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize VNPT eKYC SDK');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const captureIdCardFront = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await ekycService.captureIdCard('front');
      if (!result.status) {
        throw new Error(result.message || 'Failed to capture front ID card');
      }

      return result.image;
    } catch (err: any) {
      setError(err.message || 'Failed to capture front ID card');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const captureIdCardBack = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await ekycService.captureIdCard('back');
      if (!result.status) {
        throw new Error(result.message || 'Failed to capture back ID card');
      }

      return result.image;
    } catch (err: any) {
      setError(err.message || 'Failed to capture back ID card');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const captureSelfie = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await ekycService.captureFace();
      if (!result.status) {
        throw new Error(result.message || 'Failed to capture selfie');
      }

      return result.image;
    } catch (err: any) {
      setError(err.message || 'Failed to capture selfie');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const performLiveness = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await ekycService.performLivenessDetection();
      if (!result.status) {
        throw new Error(result.message || 'Failed to perform liveness detection');
      }

      return {
        video: result.video,
        images: result.images,
      };
    } catch (err: any) {
      setError(err.message || 'Failed to perform liveness detection');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEkyc = useCallback(async (data: EkycVerifyRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await ekycService.verifyEkyc(data);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to verify eKYC');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    initialize,
    captureIdCardFront,
    captureIdCardBack,
    captureSelfie,
    performLiveness,
    verifyEkyc,
  };
}
