CREATE TABLE public.users (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	name text NOT NULL, -- TODO: type
	email text NOT NULL, -- TODO: type
	status text DEFAULT 'OK' NOT NULL, -- TODO: enum
	meta json NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL, -- TODO: procedure: https://stackoverflow.com/a/9556527
	is_deleted bool DEFAULT false NOT NULL,
	CONSTRAINT users_pk PRIMARY KEY (id),
	CONSTRAINT users_unique UNIQUE (email)
);