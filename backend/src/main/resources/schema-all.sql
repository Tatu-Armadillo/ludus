drop schema if exists checkin cascade;

create schema checkin;

-- create table checkin.audit (
--     id bigserial primary key,
--     create_at timestamp not null,
--     type_action varchar(255) not null
-- );

create table checkin.permission (
    id bigserial primary key,
    description varchar(255)
);

create table checkin.users (
    id bigserial primary key,
    account_non_expired boolean not null,
    account_non_locked boolean not null,
    credentials_non_expired boolean not null,
    enabled boolean not null,
    password varchar(255) not null unique,
    user_name varchar(255) not null unique
);

create table checkin.user_permission (
    id_permission bigint not null,
    id_user bigint not null,
    primary key(id_permission, id_user)
);

create table checkin.student (
    id bigserial primary key,
    name varchar(255) not null,
    contact varchar(11) not null,
    cpf varchar(11) unique,
    email varchar(255),
    is_active boolean not null,
    is_deleted boolean not null default false,
    enrollment_date date not null,
    date_birth date
);

create table checkin.dancing_class (
    id bigserial primary key,
    level varchar(255) not null, -- BEGINNER, INTERMEDIARY, ADVANCED
    status varchar(255) not null, -- IN_PROGRESS, COMPLETED, CANCELED
    day_week varchar(255) not null,
    start_schedule time not null,
    end_schedule time not null,
    start_date date not null,
    end_date date not null,
    is_deleted boolean not null default false,
    is_archived boolean not null default false,
    beat bigint not null
);

create table checkin.beat(
    id bigserial primary key,
    name varchar(255) unique not null,
    is_deleted boolean not null default false
);

create table checkin.dancing_class_student (
    id_student bigint not null,
    id_dancing_class bigint not null,
    role varchar(20) not null default 'CONDUCTED',
    primary key(id_dancing_class, id_student)
);

create table checkin.lesson (
    id bigserial primary key,
    day date not null,
    start_schedule  time not null,
    end_schedule time not null,
    is_deleted boolean not null default false,
    dancing_class bigint not null
);

create table checkin.student_attendance (
    id bigserial primary key,
    student_id bigint not null,
    class_id bigint not null,
    attendance_date date not null,
    status varchar(50) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint uq_student_attendance_student_class_date unique (student_id, class_id, attendance_date)
);

create table checkin.attendance_request (
    id bigserial primary key,
    class_id bigint not null,
    student_id bigint not null,
    token_hash varchar(128) not null unique,
    date date not null,
    status varchar(20) not null,
    responded_at timestamp,
    expires_at timestamp not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint uq_attendance_request_class_student_date unique (class_id, student_id, date)
);

create table checkin.participation (
    id bigserial primary key,
    confirmed boolean not null,
    is_deleted boolean not null default false,
    lesson bigint not null,
    student bigint not null
);

create table checkin.event (
    id bigserial primary key,
    name varchar(255) not null,
    event_date date not null,
    event_time time not null,
    has_max_participants boolean not null default true,
    max_participants int not null default 0,
    status varchar(50) not null default 'IN_PROGRESS',
    is_deleted boolean not null default false,
    is_archived boolean not null default false
);

create table checkin.event_participant (
    id bigserial primary key,
    id_event bigint not null,
    id_student bigint,
    external_participant_name varchar(255),
    amount_paid numeric(10,2)
);

alter table checkin.user_permission add constraint fk_permission_user_permission foreign key (id_permission) references checkin.permission;
alter table checkin.user_permission add constraint fk_user_user_permission foreign key (id_user) references checkin.users;
alter table checkin.dancing_class add constraint fk_beat_dancing_class foreign key (beat) references checkin.beat;
alter table checkin.dancing_class_student add constraint fk_dancing_class_student_student foreign key (id_student) references checkin.student;
alter table checkin.dancing_class_student add constraint fk_dancing_class_student_dancing foreign key (id_dancing_class) references checkin.dancing_class;
alter table checkin.lesson add constraint fk_dancing_class_lesson foreign key (dancing_class) references checkin.dancing_class;
alter table checkin.participation add constraint fk_lesson_participation foreign key (lesson) references checkin.lesson;
alter table checkin.participation add constraint fk_student_participation foreign key (student) references checkin.student;
alter table checkin.student_attendance add constraint fk_student_attendance_student foreign key (student_id) references checkin.student;
alter table checkin.student_attendance add constraint fk_student_attendance_class foreign key (class_id) references checkin.dancing_class;
alter table checkin.attendance_request add constraint fk_attendance_request_class foreign key (class_id) references checkin.dancing_class;
alter table checkin.attendance_request add constraint fk_attendance_request_student foreign key (student_id) references checkin.student;
alter table checkin.event_participant add constraint fk_event_participant_event foreign key (id_event) references checkin.event;
alter table checkin.event_participant add constraint fk_event_participant_student foreign key (id_student) references checkin.student;

INSERT INTO checkin.users (user_name, password, account_non_expired, account_non_locked, credentials_non_expired, enabled) 
VALUES ('adm', '$2a$10$PqsrFKSSRev9lL0BMAE.IOvDB4r6plBA7c45UDzz4v0Wu1Es9XMs.', true, true, true, true);

INSERT INTO checkin.beat (name, is_deleted) VALUES
('SERTANEJO', false), ('FORRÓ', false), ('BACHATA', false), ('BOLERO', false), ('SAMBA DE GAFIEIRA', false), ('ZOUK', false);
