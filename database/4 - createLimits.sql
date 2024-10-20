CREATE TABLE public.limits (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	requests int4 DEFAULT 10000 NOT NULL,
	days int2 DEFAULT 30 NOT NULL,
	key_id uuid NOT NULL,
	status text DEFAULT 'OK' NOT NULL, -- TODO: enum
	meta json NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL, -- TODO: procedure: https://stackoverflow.com/a/9556527
	is_deleted bool DEFAULT false NOT NULL,
	CONSTRAINT limits_pk PRIMARY KEY (id),
	CONSTRAINT limits_unique UNIQUE (key_id)
);

ALTER TABLE public.limits ADD CONSTRAINT limits_keys_fk FOREIGN KEY (key_id) REFERENCES public.keys(id);