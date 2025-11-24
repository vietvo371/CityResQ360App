// eKYC Types
export type EkycStatus = 'pending' | 'verified' | 'rejected' | 'failed';
export type EkycVerifyType = 'face' | 'fingerprint' | 'voice';
export type EkycVerifyMethod = 'auto' | 'manual';
export type IdCardType = 'cmnd' | 'cccd' | 'passport' | 'cccd_chip';
export type Gender = 'male' | 'female' | 'other';

export interface EkycVerificationResult {
  matched: boolean;
  confidence: number;
  errors?: string[];
}

export interface EkycLivenessResult {
  passed: boolean;
  score: number;
  errors?: string[];
}

export interface EkycData {
  // Status
  ekyc_status?: EkycStatus;
  ekyc_verified_at?: string;
  ekyc_score?: number;
  ekyc_session_id?: string;
  ekyc_transaction_id?: string;
  ekyc_verify_type?: EkycVerifyType;
  ekyc_verify_method?: EkycVerifyMethod;
  
  // ID Card Info
  id_card_type?: IdCardType;
  id_card_number?: string;
  id_card_name?: string;
  id_card_dob?: string;
  id_card_gender?: Gender;
  id_card_nationality?: string;
  id_card_ethnicity?: string;
  id_card_religion?: string;
  id_card_place_of_origin?: string;
  id_card_place_of_residence?: string;
  id_card_personal_identification?: string;
  id_card_issuing_authority?: string;
  id_card_issue_date?: string;
  id_card_expiry_date?: string;

  // Document Images
  id_card_front_url?: string;
  id_card_back_url?: string;
  selfie_url?: string;
  selfie_with_id_url?: string;
  video_url?: string;

  // Verification Scores
  face_matching_score?: number;
  face_matching_result?: boolean;
  liveness_score?: number;
  liveness_result?: boolean;
  mask_detection?: boolean;
  address_verification?: boolean;
  
  // Verification Results
  ocr_result?: EkycVerificationResult;
  face_result?: EkycVerificationResult;
  liveness_result_details?: EkycLivenessResult;
}

export interface EkycVerifyRequest {
  id_card_type: IdCardType;
  id_card_number: string;
  id_card_front_image: string; // base64
  id_card_back_image: string; // base64
  selfie_image: string; // base64
  selfie_with_id_image?: string; // base64
  verify_type?: EkycVerifyType;
  verify_method?: EkycVerifyMethod;
  callback_url?: string;
}

export interface EkycVerifyResponse {
  session_id: string;
  transaction_id: string;
  status: EkycStatus;
  score: number;
  verify_type: EkycVerifyType;
  verify_method: EkycVerifyMethod;
  ocr_result: EkycVerificationResult;
  face_result: EkycVerificationResult;
  liveness_result: EkycLivenessResult;
  data: {
    id_card: {
      type: IdCardType;
      number: string;
      name: string;
      dob: string;
      gender: Gender;
      nationality: string;
      ethnicity: string;
      religion: string;
      place_of_origin: string;
      place_of_residence: string;
      personal_identification: string;
      issuing_authority: string;
      issue_date: string;
      expiry_date: string;
    };
    face_matching: {
      score: number;
      result: boolean;
    };
    liveness: {
      score: number;
      result: boolean;
      mask_detected: boolean;
    };
  };
  errors?: string[];
}
