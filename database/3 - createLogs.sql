CREATE TABLE public.logs (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	image text NOT NULL,
	key_id uuid NOT NULL,
	width int4 NULL,
	height int4 NULL,
	rotate int2 NULL,
	format text NULL, -- TODO: enum
	quality int2 NULL,
	flip bool DEFAULT false NOT NULL,
	flop bool DEFAULT false NOT NULL,
	greyscale bool DEFAULT false NOT NULL,
	blur bool DEFAULT false NOT NULL,
	request text NOT NULL,
	response text NOT NULL,
	status text NOT NULL, -- TODO: enum
	meta json NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL, -- TODO: procedure: https://stackoverflow.com/a/9556527
	is_deleted bool DEFAULT false NOT NULL,
	CONSTRAINT logs_pk PRIMARY KEY (id)
);

ALTER TABLE public.logs ADD CONSTRAINT logs_keys_fk FOREIGN KEY (key_id) REFERENCES public.keys(id);