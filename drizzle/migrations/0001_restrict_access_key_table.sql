REVOKE ALL PRIVILEGES ON TABLE public.access_keys FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.access_keys TO service_role;