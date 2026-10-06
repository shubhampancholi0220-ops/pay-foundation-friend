CREATE TABLE public.access_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash text NOT NULL UNIQUE CHECK (length(key_hash) = 64),
  claimed_device_hash text CHECK (claimed_device_hash IS NULL OR length(claimed_device_hash) = 64),
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT access_keys_claim_fields_match CHECK (
    (claimed_device_hash IS NULL AND claimed_at IS NULL)
    OR (claimed_device_hash IS NOT NULL AND claimed_at IS NOT NULL)
  )
);
GRANT ALL ON public.access_keys TO service_role;
ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;