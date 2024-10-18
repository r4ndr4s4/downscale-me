CREATE TABLE public.keys (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NOT NULL,
	status text DEFAULT 'OK' NOT NULL, -- TODO: enum
	meta json NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL, -- TODO: procedure: https://stackoverflow.com/a/9556527
	is_deleted bool DEFAULT false NOT NULL,
	CONSTRAINT keys_pk PRIMARY KEY (id)
);

ALTER TABLE public.keys ADD CONSTRAINT keys_users_fk FOREIGN KEY (user_id) REFERENCES public.users(id);