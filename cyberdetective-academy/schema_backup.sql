--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_team_member_count(); Type: FUNCTION; Schema: public; Owner: cyberdetective
--

CREATE FUNCTION public.update_team_member_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE teams SET current_members = current_members + 1 WHERE id = NEW.team_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE teams SET current_members = current_members - 1 WHERE id = OLD.team_id;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_team_member_count() OWNER TO cyberdetective;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: cyberdetective
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO cyberdetective;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(100),
    email character varying(255),
    is_super_admin boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admins OWNER TO cyberdetective;

--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.admins_id_seq OWNER TO cyberdetective;

--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: badges; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.badges (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon_url character varying(255),
    criteria json NOT NULL,
    points_required integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.badges OWNER TO cyberdetective;

--
-- Name: badges_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.badges_id_seq OWNER TO cyberdetective;

--
-- Name: badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.badges_id_seq OWNED BY public.badges.id;


--
-- Name: exercise_attempts; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.exercise_attempts (
    id integer NOT NULL,
    user_id integer,
    exercise_id integer,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    is_correct boolean DEFAULT false,
    points_earned integer DEFAULT 0,
    time_taken integer,
    hints_used integer DEFAULT 0,
    answer_submitted text
);


ALTER TABLE public.exercise_attempts OWNER TO cyberdetective;

--
-- Name: exercise_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.exercise_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exercise_attempts_id_seq OWNER TO cyberdetective;

--
-- Name: exercise_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.exercise_attempts_id_seq OWNED BY public.exercise_attempts.id;


--
-- Name: exercises; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.exercises (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    difficulty integer NOT NULL,
    points integer NOT NULL,
    category character varying(50),
    type character varying(50),
    problem_data json NOT NULL,
    solution_data json NOT NULL,
    hints json,
    time_limit integer,
    order_index integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT exercises_difficulty_check CHECK (((difficulty >= 1) AND (difficulty <= 5)))
);


ALTER TABLE public.exercises OWNER TO cyberdetective;

--
-- Name: exercises_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.exercises_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exercises_id_seq OWNER TO cyberdetective;

--
-- Name: exercises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.exercises_id_seq OWNED BY public.exercises.id;


--
-- Name: game_reset_tokens; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.game_reset_tokens (
    id integer NOT NULL,
    token character varying(255) NOT NULL,
    admin_id integer,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.game_reset_tokens OWNER TO cyberdetective;

--
-- Name: game_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.game_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.game_reset_tokens_id_seq OWNER TO cyberdetective;

--
-- Name: game_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.game_reset_tokens_id_seq OWNED BY public.game_reset_tokens.id;


--
-- Name: game_state; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.game_state (
    id integer NOT NULL,
    reset_count integer DEFAULT 0,
    last_reset_at timestamp without time zone,
    last_reset_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    teams_enabled boolean DEFAULT true
);


ALTER TABLE public.game_state OWNER TO cyberdetective;

--
-- Name: COLUMN game_state.teams_enabled; Type: COMMENT; Schema: public; Owner: cyberdetective
--

COMMENT ON COLUMN public.game_state.teams_enabled IS 'Controla si la funcionalidad de equipos está habilitada en el juego';


--
-- Name: game_state_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.game_state_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.game_state_id_seq OWNER TO cyberdetective;

--
-- Name: game_state_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.game_state_id_seq OWNED BY public.game_state.id;


--
-- Name: leaderboard; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.leaderboard (
    id integer NOT NULL,
    user_id integer,
    total_points integer DEFAULT 0,
    exercises_completed integer DEFAULT 0,
    average_time integer,
    rank integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leaderboard OWNER TO cyberdetective;

--
-- Name: leaderboard_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.leaderboard_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.leaderboard_id_seq OWNER TO cyberdetective;

--
-- Name: leaderboard_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.leaderboard_id_seq OWNED BY public.leaderboard.id;


--
-- Name: team_exercise_attempts; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.team_exercise_attempts (
    id integer NOT NULL,
    team_id integer,
    exercise_id integer,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    is_correct boolean DEFAULT false,
    points_earned integer DEFAULT 0,
    time_taken integer,
    contributions json
);


ALTER TABLE public.team_exercise_attempts OWNER TO cyberdetective;

--
-- Name: team_exercise_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.team_exercise_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.team_exercise_attempts_id_seq OWNER TO cyberdetective;

--
-- Name: team_exercise_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.team_exercise_attempts_id_seq OWNED BY public.team_exercise_attempts.id;


--
-- Name: team_invitations; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.team_invitations (
    id integer NOT NULL,
    team_id integer,
    invited_by_id integer,
    invited_user_id integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    responded_at timestamp without time zone,
    expires_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '7 days'::interval)
);


ALTER TABLE public.team_invitations OWNER TO cyberdetective;

--
-- Name: team_invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.team_invitations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.team_invitations_id_seq OWNER TO cyberdetective;

--
-- Name: team_invitations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.team_invitations_id_seq OWNED BY public.team_invitations.id;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    team_id integer,
    user_id integer,
    role character varying(20) DEFAULT 'member'::character varying NOT NULL,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.team_members OWNER TO cyberdetective;

--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.team_members_id_seq OWNER TO cyberdetective;

--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    leader_id integer,
    max_members integer DEFAULT 5,
    current_members integer DEFAULT 1,
    total_points integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.teams OWNER TO cyberdetective;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teams_id_seq OWNER TO cyberdetective;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.user_badges (
    id integer NOT NULL,
    user_id integer,
    badge_id integer,
    earned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_badges OWNER TO cyberdetective;

--
-- Name: user_badges_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.user_badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_badges_id_seq OWNER TO cyberdetective;

--
-- Name: user_badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.user_badges_id_seq OWNED BY public.user_badges.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: cyberdetective
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100),
    avatar_url character varying(255),
    total_points integer DEFAULT 0,
    level integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO cyberdetective;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: cyberdetective
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO cyberdetective;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cyberdetective
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: badges id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.badges ALTER COLUMN id SET DEFAULT nextval('public.badges_id_seq'::regclass);


--
-- Name: exercise_attempts id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.exercise_attempts ALTER COLUMN id SET DEFAULT nextval('public.exercise_attempts_id_seq'::regclass);


--
-- Name: exercises id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.exercises ALTER COLUMN id SET DEFAULT nextval('public.exercises_id_seq'::regclass);


--
-- Name: game_reset_tokens id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.game_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.game_reset_tokens_id_seq'::regclass);


--
-- Name: game_state id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.game_state ALTER COLUMN id SET DEFAULT nextval('public.game_state_id_seq'::regclass);


--
-- Name: leaderboard id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.leaderboard ALTER COLUMN id SET DEFAULT nextval('public.leaderboard_id_seq'::regclass);


--
-- Name: team_exercise_attempts id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_exercise_attempts ALTER COLUMN id SET DEFAULT nextval('public.team_exercise_attempts_id_seq'::regclass);


--
-- Name: team_invitations id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_invitations ALTER COLUMN id SET DEFAULT nextval('public.team_invitations_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: user_badges id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.user_badges ALTER COLUMN id SET DEFAULT nextval('public.user_badges_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: exercise_attempts exercise_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.exercise_attempts
    ADD CONSTRAINT exercise_attempts_pkey PRIMARY KEY (id);


--
-- Name: exercise_attempts exercise_attempts_user_id_exercise_id_key; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.exercise_attempts
    ADD CONSTRAINT exercise_attempts_user_id_exercise_id_key UNIQUE (user_id, exercise_id);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (id);


--
-- Name: game_reset_tokens game_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.game_reset_tokens
    ADD CONSTRAINT game_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: game_reset_tokens game_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.game_reset_tokens
    ADD CONSTRAINT game_reset_tokens_token_key UNIQUE (token);


--
-- Name: game_state game_state_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.game_state
    ADD CONSTRAINT game_state_pkey PRIMARY KEY (id);


--
-- Name: leaderboard leaderboard_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.leaderboard
    ADD CONSTRAINT leaderboard_pkey PRIMARY KEY (id);


--
-- Name: leaderboard leaderboard_user_id_key; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.leaderboard
    ADD CONSTRAINT leaderboard_user_id_key UNIQUE (user_id);


--
-- Name: team_exercise_attempts team_exercise_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_exercise_attempts
    ADD CONSTRAINT team_exercise_attempts_pkey PRIMARY KEY (id);


--
-- Name: team_exercise_attempts team_exercise_attempts_team_id_exercise_id_key; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_exercise_attempts
    ADD CONSTRAINT team_exercise_attempts_team_id_exercise_id_key UNIQUE (team_id, exercise_id);


--
-- Name: team_invitations team_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_pkey PRIMARY KEY (id);


--
-- Name: team_invitations team_invitations_team_id_invited_user_id_key; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_team_id_invited_user_id_key UNIQUE (team_id, invited_user_id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_team_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_user_id_key UNIQUE (team_id, user_id);


--
-- Name: teams teams_name_key; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_name_key UNIQUE (name);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_user_id_badge_id_key; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_admins_username; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_admins_username ON public.admins USING btree (username);


--
-- Name: idx_exercise_attempts_exercise; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_exercise_attempts_exercise ON public.exercise_attempts USING btree (exercise_id);


--
-- Name: idx_exercise_attempts_user; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_exercise_attempts_user ON public.exercise_attempts USING btree (user_id);


--
-- Name: idx_game_reset_tokens_expires; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_game_reset_tokens_expires ON public.game_reset_tokens USING btree (expires_at);


--
-- Name: idx_game_reset_tokens_token; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_game_reset_tokens_token ON public.game_reset_tokens USING btree (token);


--
-- Name: idx_leaderboard_points; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_leaderboard_points ON public.leaderboard USING btree (total_points DESC);


--
-- Name: idx_leaderboard_rank; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_leaderboard_rank ON public.leaderboard USING btree (rank);


--
-- Name: idx_team_exercise_team; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_team_exercise_team ON public.team_exercise_attempts USING btree (team_id);


--
-- Name: idx_team_invitations_status; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_team_invitations_status ON public.team_invitations USING btree (status);


--
-- Name: idx_team_invitations_team; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_team_invitations_team ON public.team_invitations USING btree (team_id);


--
-- Name: idx_team_invitations_user; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_team_invitations_user ON public.team_invitations USING btree (invited_user_id);


--
-- Name: idx_team_members_team; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_team_members_team ON public.team_members USING btree (team_id);


--
-- Name: idx_team_members_user; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_team_members_user ON public.team_members USING btree (user_id);


--
-- Name: idx_teams_active; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_teams_active ON public.teams USING btree (is_active);


--
-- Name: idx_teams_leader; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_teams_leader ON public.teams USING btree (leader_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: cyberdetective
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: leaderboard update_leaderboard_updated_at; Type: TRIGGER; Schema: public; Owner: cyberdetective
--

CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON public.leaderboard FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: team_members update_team_members_count; Type: TRIGGER; Schema: public; Owner: cyberdetective
--

CREATE TRIGGER update_team_members_count AFTER INSERT OR DELETE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_team_member_count();


--
-- Name: teams update_teams_updated_at; Type: TRIGGER; Schema: public; Owner: cyberdetective
--

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: cyberdetective
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: exercise_attempts exercise_attempts_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.exercise_attempts
    ADD CONSTRAINT exercise_attempts_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;


--
-- Name: exercise_attempts exercise_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.exercise_attempts
    ADD CONSTRAINT exercise_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: game_reset_tokens game_reset_tokens_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.game_reset_tokens
    ADD CONSTRAINT game_reset_tokens_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE CASCADE;


--
-- Name: game_state game_state_last_reset_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.game_state
    ADD CONSTRAINT game_state_last_reset_by_fkey FOREIGN KEY (last_reset_by) REFERENCES public.admins(id);


--
-- Name: leaderboard leaderboard_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.leaderboard
    ADD CONSTRAINT leaderboard_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_exercise_attempts team_exercise_attempts_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_exercise_attempts
    ADD CONSTRAINT team_exercise_attempts_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;


--
-- Name: team_exercise_attempts team_exercise_attempts_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_exercise_attempts
    ADD CONSTRAINT team_exercise_attempts_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_invitations team_invitations_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_invited_by_fkey FOREIGN KEY (invited_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_invitations team_invitations_invited_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_invited_user_id_fkey FOREIGN KEY (invited_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: team_invitations team_invitations_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teams teams_leader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_badges user_badges_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE;


--
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cyberdetective
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

