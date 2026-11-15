CREATE TABLE "ayahs" (
	"id" serial PRIMARY KEY NOT NULL,
	"surah_id" integer NOT NULL,
	"number" integer NOT NULL,
	"arabic" text NOT NULL,
	"arabic_plain" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commentaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"ayah_id" integer NOT NULL,
	"order" integer NOT NULL,
	"title" varchar(300) NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ayah_id" integer NOT NULL,
	"text" varchar(1000) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" integer NOT NULL,
	"ayah_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_ayah_id_pk" PRIMARY KEY("user_id","ayah_id")
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ayah_id" integer NOT NULL,
	"text" varchar(2000) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "surahs" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(60) NOT NULL,
	"ayah_count" integer NOT NULL,
	"about" text
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"ayah_id" integer NOT NULL,
	"lang" varchar(2) NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password_hash" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "words" (
	"id" serial PRIMARY KEY NOT NULL,
	"ayah_id" integer NOT NULL,
	"order" integer NOT NULL,
	"arabic" varchar(100) NOT NULL,
	"latin" varchar(100) NOT NULL,
	"mean_az" varchar(200),
	"mean_en" varchar(200),
	"mean_ru" varchar(200),
	"mean_tr" varchar(200)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "ayahs_surah_number" ON "ayahs" USING btree ("surah_id","number");--> statement-breakpoint
CREATE INDEX "commentaries_ayah" ON "commentaries" USING btree ("ayah_id","order");--> statement-breakpoint
CREATE INDEX "comments_ayah" ON "comments" USING btree ("ayah_id","created_at");--> statement-breakpoint
CREATE INDEX "notes_user" ON "notes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "translations_ayah_lang" ON "translations" USING btree ("ayah_id","lang");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "words_ayah" ON "words" USING btree ("ayah_id");