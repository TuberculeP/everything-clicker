-- Useful if needs to recreate a db

create table words
(
    id         text      default gen_random_uuid() not null
        constraint words_pk
            primary key,
    word       varchar                             not null,
    count      integer   default 0                 not null,
    created_at timestamp default now()             not null,
    updated_at timestamp default now()             not null
);

create table top_words
(
    id         text      default gen_random_uuid() not null
        constraint words_pk
            primary key,
    word       varchar                             not null,
    count      integer   default 0                 not null
);

CREATE OR REPLACE FUNCTION update_top_words() RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM top_words;
    INSERT INTO top_words (id, word, count)
    SELECT id, word, count
    FROM words
    ORDER BY count DESC
    LIMIT 10;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_top_words
AFTER INSERT OR UPDATE OR DELETE ON words
FOR EACH STATEMENT
EXECUTE FUNCTION update_top_words();

CREATE OR REPLACE FUNCTION notify_top_words_update() RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('top_words_update', '');
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_top_words_update
AFTER INSERT OR UPDATE OR DELETE ON top_words
FOR EACH STATEMENT
EXECUTE FUNCTION notify_top_words_update();