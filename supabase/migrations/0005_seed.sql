-- ============================================================
-- 0005_seed.sql  (idempotent content seed)
-- Populates the CMS with Great Rainbow Academy's real content
-- and links the media already uploaded to storage.
-- ============================================================

-- ---- Site settings --------------------------------------------
insert into public.site_settings (id, school_name, tagline, motto, logo_url,
  email, phones, address, whatsapp, social_links, seo_title, seo_description, og_image_url, primary_color)
values (
  1,
  'Great Rainbow Academy',
  'The Citadel of Learning',
  'Discipline and Commitment',
  (select public_url from public.media_assets where path = 'branding/logo.png'),
  'debbieasare8@gmail.com',
  array['+233 24 315 9198','+233 24 359 8786','+233 55 191 0779','+233 24 972 2727'],
  'Olebu-Capito, Accra, Ghana',
  '+233 24 315 9198',
  '{"facebook":"","instagram":"","tiktok":"","youtube":""}'::jsonb,
  'Great Rainbow Academy | The Citadel of Learning in Accra, Ghana',
  'Great Rainbow Academy provides quality and affordable education from Nursery to JHS in Olebu-Capito, Accra. We nurture academic excellence, discipline, creativity and character.',
  (select public_url from public.media_assets where path = 'gallery/img-1.jpeg'),
  '#6d28d9'
)
on conflict (id) do update set
  school_name = excluded.school_name,
  tagline = excluded.tagline,
  motto = excluded.motto,
  logo_url = excluded.logo_url,
  email = excluded.email,
  phones = excluded.phones,
  address = excluded.address,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  og_image_url = excluded.og_image_url;

-- ---- Pages (with SEO) -----------------------------------------
insert into public.pages (slug, title, seo_title, seo_description, sort_order) values
  ('home','Home','Great Rainbow Academy | The Citadel of Learning','Quality, affordable education from Nursery to JHS in Accra, Ghana. Where excellence meets discipline and commitment.',0),
  ('about','About Us','About Great Rainbow Academy | Our Story, Vision & Mission','Founded in 2009 in Olebu-Capito, Accra, Great Rainbow Academy is committed to raising disciplined and excellent learners.',1),
  ('departments','Departments','Departments | Nursery, KG, Primary & JHS','Explore our Nursery, Kindergarten, Primary and Junior High School departments.',2),
  ('academics','Academics','Academics & Subjects | Great Rainbow Academy','A rich curriculum spanning English, Mathematics, Science, ICT and more.',3),
  ('activities','Activities & Events','Activities & Events | Great Rainbow Academy','Indoor and outdoor activities that build well-rounded, confident learners.',4),
  ('admissions','Admissions','Admissions | Enroll at Great Rainbow Academy','Simple admissions: pick a form, submit documents, assessment and enroll.',5),
  ('staff','Our Staff','Our Staff & Leadership | Great Rainbow Academy','Meet the dedicated team behind Great Rainbow Academy.',6),
  ('gallery','Gallery','Gallery | Great Rainbow Academy','Photos and videos of school life, graduation, sports and cultural events.',7),
  ('events','Events','Upcoming Events | Great Rainbow Academy','Stay up to date with happenings at Great Rainbow Academy.',8),
  ('contact','Contact Us','Contact Great Rainbow Academy | Olebu-Capito, Accra','Reach us by phone or email, or send a message. We would love to hear from you.',9)
on conflict (slug) do update set
  title = excluded.title, seo_title = excluded.seo_title, seo_description = excluded.seo_description;

-- ---- Home page sections ---------------------------------------
insert into public.page_sections (page_slug, section_key, heading, subheading, body, media_id, data, sort_order) values
  ('home','hero','Welcome to Great Rainbow Academy',
    'Where Excellence Meets Discipline and Commitment',
    'At Great Rainbow Academy, we are committed to providing quality and affordable education that nurtures academic excellence, discipline, creativity, and character development.',
    (select id from public.media_assets where path='gallery/img-3.jpeg'),
    '{"primary_cta":{"label":"Apply for Admission","href":"/admissions"},"secondary_cta":{"label":"Explore Programs","href":"/departments"}}'::jsonb, 0),
  ('home','welcome','Quality and Affordable Education for Future Leaders',
    'The Citadel of Learning',
    'We believe education goes beyond academics. We focus on character, discipline, creativity, and total child development so every learner is given the opportunity to shine.',
    (select id from public.media_assets where path='gallery/img-7.jpeg'),
    '{}'::jsonb, 1),
  ('home','proprietress','Message from the Proprietress',
    'Mrs. Deborah Asare',
    'Welcome to Great Rainbow Academy. As an educationist, my passion is to nurture children to become disciplined, knowledgeable, confident, and responsible future leaders. At Great Rainbow Academy, every child matters and every learner is given the opportunity to shine. We believe education goes beyond academics. We focus on character, discipline, creativity, and total child development. Thank you for choosing Great Rainbow Academy.',
    (select id from public.media_assets where path='leadership/headmistress_or_principal.jpeg'),
    jsonb_build_object('video_url',(select public_url from public.media_assets where path='leadership/headmistress_or_principal-vid.mp4')), 2),
  ('home','cta','Ready to Join the Rainbow Family?',
    'Admissions are open',
    'Give your child a foundation built on discipline, excellence and care. Begin the simple admission process today.',
    null,
    '{"primary_cta":{"label":"Start Admission","href":"/admissions"}}'::jsonb, 3)
on conflict (page_slug, section_key) do update set
  heading = excluded.heading, subheading = excluded.subheading, body = excluded.body,
  media_id = excluded.media_id, data = excluded.data;

-- ---- About page sections --------------------------------------
insert into public.page_sections (page_slug, section_key, heading, subheading, body, media_id, data, sort_order) values
  ('about','story','Our Story','Established 5th January, 2009',
    'Great Rainbow Academy was established on 5th January, 2009 at Olebu-Capito, Accra, Ghana. The school was founded by Mr. Emmanuel Kwabena Asare, a Businessman, and Madam Deborah Asare, an Educationist. The school started with only three children and later increased to twenty pupils within the same month. From the beginning, Madam Deborah Asare served as the first teacher with passion and dedication. Today, Great Rainbow Academy continues to grow and remains committed to raising disciplined and excellent learners.',
    (select id from public.media_assets where path='gallery/img-10.jpeg'), '{}'::jsonb, 0),
  ('about','vision','Our Vision',null,
    'To become one of the leading educational institutions recognised for academic excellence, discipline, creativity, and character development.',
    null, '{"icon":"Eye"}'::jsonb, 1),
  ('about','mission','Our Mission',null,
    'To provide quality and affordable education that equips learners with knowledge, discipline, commitment, and skills needed for future success.',
    null, '{"icon":"Target"}'::jsonb, 2)
on conflict (page_slug, section_key) do update set
  heading = excluded.heading, subheading = excluded.subheading, body = excluded.body, media_id = excluded.media_id, data = excluded.data;

-- ---- Admissions sections (requirements + process) -------------
insert into public.page_sections (page_slug, section_key, heading, subheading, body, data, sort_order) values
  ('admissions','intro','Admissions','Join the Rainbow Family',
   'We welcome new learners all year round. Our admission process is simple and friendly. Below are the requirements and the steps to enroll your child.',
   '{}'::jsonb, 0),
  ('admissions','requirements','Admission Requirements',null,null,
   '{"items":["Birth Certificate","Passport Pictures","Previous School Report (if applicable)"]}'::jsonb, 1),
  ('admissions','process','Admission Process',null,null,
   '{"steps":[{"title":"Pick admission form","desc":"Collect an admission form at the school office or start online."},{"title":"Submit documents","desc":"Provide the required documents for your child."},{"title":"Assessment / Interview","desc":"A short assessment helps us place your child correctly."},{"title":"Enroll successfully","desc":"Complete enrolment and welcome to the family."}]}'::jsonb, 2)
on conflict (page_slug, section_key) do update set
  heading = excluded.heading, subheading = excluded.subheading, body = excluded.body, data = excluded.data;

-- ---- Departments ----------------------------------------------
insert into public.departments (name, slug, tagline, description, icon, color, sort_order) values
  ('Nursery','nursery','Early years foundation','Building strong foundations for early childhood learning in a safe and nurturing environment.','Baby','#ef4444',0),
  ('Kindergarten','kindergarten','Play, learn, grow','Encouraging creativity, literacy, and confidence through guided play and discovery.','Blocks','#f97316',1),
  ('Primary','primary','Academic excellence','Developing academic excellence and strong character across the primary years.','BookOpen','#22c55e',2),
  ('Junior High School','jhs','Ready for the future','Preparing students academically and socially for higher education and life beyond school.','GraduationCap','#3b82f6',3)
on conflict (slug) do update set
  tagline = excluded.tagline, description = excluded.description, icon = excluded.icon, color = excluded.color;

-- ---- Subjects -------------------------------------------------
insert into public.subjects (name, icon, sort_order) values
  ('English Language','BookText',0),('Mathematics','Calculator',1),('Science','FlaskConical',2),
  ('ICT','Laptop',3),('Social Studies','Globe2',4),('Creative Arts','Palette',5),
  ('Ghanaian Language','Languages',6),('French','Languages',7)
on conflict do nothing;

-- ---- Activities -----------------------------------------------
insert into public.activities (title, kind, icon, sort_order) values
  ('Quiz Competitions','indoor','Brain',0),('Scrabble','indoor','SpellCheck',1),
  ('Ludo','indoor','Dices',2),('Oware','indoor','CircleDot',3),
  ('Football','outdoor','Goal',4),('Athletics','outdoor','Medal',5),
  ('Cultural Day','outdoor','Drama',6),('Dancing Competitions','outdoor','Music',7)
on conflict do nothing;

-- ---- Core values ----------------------------------------------
insert into public.core_values (title, description, icon, sort_order) values
  ('Discipline','We instill order, focus and self-control in every learner.','ShieldCheck',0),
  ('Commitment','We are dedicated to each child''s growth and success.','HeartHandshake',1),
  ('Excellence','We pursue the highest standards in all we do.','Award',2),
  ('Integrity','We act with honesty and strong moral principles.','Scale',3),
  ('Respect','We honour one another and our community.','Handshake',4),
  ('Creativity','We nurture imagination and original thinking.','Sparkles',5)
on conflict do nothing;

-- ---- Staff / leadership ---------------------------------------
insert into public.staff_members (full_name, position, department, bio, photo_id, is_leadership, sort_order) values
  ('Mrs. Deborah Asare','Proprietress & Founder','Leadership',
    'An educationist whose passion is to nurture children to become disciplined, knowledgeable, confident and responsible future leaders. She served as the school''s first teacher and continues to lead with dedication.',
    (select id from public.media_assets where path='leadership/headmistress_or_principal.jpeg'), true, 0),
  ('Mr. Emmanuel Kwabena Asare','Co-Founder','Leadership',
    'A businessman who co-founded Great Rainbow Academy in 2009 with a vision for quality, affordable education in the community.',
    null, true, 1)
on conflict do nothing;

-- ---- Testimonials ---------------------------------------------
insert into public.testimonials (author, role, quote, rating, sort_order) values
  ('Mrs. Akua Mensah','Parent','My children are thriving here. The discipline and care are second to none.',5,0),
  ('Mr. Kofi Boateng','Parent','Great Rainbow Academy gave my daughter the confidence and foundation she needed.',5,1),
  ('Ama, Old Student','Alumna','I will always be grateful for the values and knowledge I gained at this school.',5,2)
on conflict do nothing;

-- ---- Site stats -----------------------------------------------
insert into public.site_stats (label, value, icon, sort_order) values
  ('Year Established','2009','CalendarDays',0),
  ('Departments','4','Layers',1),
  ('Subjects Offered','8','BookOpen',2),
  ('Years of Excellence','15+','Award',3)
on conflict do nothing;

-- ---- FAQs -----------------------------------------------------
insert into public.faqs (question, answer, category, sort_order) values
  ('What age can my child start?','We welcome children from Nursery age. Contact us and we will guide you on the right department for your child.','Admissions',0),
  ('What documents are required for admission?','A Birth Certificate, Passport Pictures, and a Previous School Report (if applicable).','Admissions',1),
  ('Do you offer affordable fees?','Yes. We are committed to providing quality and affordable education for the community.','Fees',2),
  ('What levels do you offer?','We offer Nursery, Kindergarten, Primary and Junior High School (JHS).','General',3)
on conflict do nothing;

-- ---- Gallery: one album seeded with all gallery media ---------
insert into public.gallery_albums (title, slug, description, cover_id, sort_order)
values ('School Life','school-life','A glimpse into life at Great Rainbow Academy: classrooms, activities, sports and celebrations.',
  (select id from public.media_assets where path='gallery/img-5.jpeg'), 0)
on conflict (slug) do update set description = excluded.description;

insert into public.gallery_items (album_id, media_id, sort_order)
select (select id from public.gallery_albums where slug='school-life'),
       m.id,
       row_number() over (order by m.path)
from public.media_assets m
where m.folder = 'gallery'
  and not exists (
    select 1 from public.gallery_items gi
    where gi.media_id = m.id
      and gi.album_id = (select id from public.gallery_albums where slug='school-life')
  );

-- ---- Events ---------------------------------------------------
insert into public.events (title, slug, summary, body, category, location, start_at, end_at, cover_id, is_featured, status) values
  ('BECE Candidates Congratulations','bece-congratulations',
    'Congratulations to our BECE candidates on their hard work and excellent results.',
    'We celebrate our Junior High School graduates for their dedication and outstanding performance in the Basic Education Certificate Examination. We are proud of every one of you and wish you the very best in the next chapter.',
    'Achievement','Great Rainbow Academy', now() - interval '5 days', now() - interval '5 days',
    (select id from public.media_assets where path='events/bece-congrats-flyer.jpeg'), true, 'published'),
  ('Cultural Day Celebration','cultural-day',
    'A colourful celebration of our rich Ghanaian heritage with dance, drumming and food.',
    'Join us as our learners showcase the beauty of our culture through traditional dance, drumming, drama and a display of local dishes. A day of pride, joy and learning for the whole community.',
    'Culture','School Grounds', now() + interval '21 days', now() + interval '21 days',
    (select id from public.media_assets where path='gallery/img-20.jpeg'), true, 'published'),
  ('Inter-Class Sports Festival','sports-festival',
    'Athletics, football and fun games as our houses compete for the trophy.',
    'Our annual sports festival brings energy and teamwork to the fore. Come cheer on the learners in athletics, football and a variety of fun games.',
    'Sports','School Field', now() + interval '40 days', now() + interval '40 days',
    (select id from public.media_assets where path='gallery/img-30.jpeg'), false, 'published')
on conflict (slug) do update set summary = excluded.summary, body = excluded.body, start_at = excluded.start_at;

-- ---- Academic year + term (so SMS has a default context) ------
insert into public.academic_years (name, start_date, end_date, is_current)
select '2024/2025','2024-09-10','2025-07-25',true
where not exists (select 1 from public.academic_years where name='2024/2025');

insert into public.terms (academic_year_id, name, start_date, end_date, is_current)
select (select id from public.academic_years where name='2024/2025'),'Third Term','2025-04-22','2025-07-25',true
where not exists (select 1 from public.terms where name='Third Term');

-- ---- School classes -------------------------------------------
insert into public.school_classes (name, level, capacity, academic_year_id)
select v.name, v.level, 40, (select id from public.academic_years where name='2024/2025')
from (values
  ('Nursery 1','Nursery'),('Nursery 2','Nursery'),
  ('KG 1','KG'),('KG 2','KG'),
  ('Basic 1','Primary'),('Basic 2','Primary'),('Basic 3','Primary'),
  ('Basic 4','Primary'),('Basic 5','Primary'),('Basic 6','Primary'),
  ('JHS 1','JHS'),('JHS 2','JHS'),('JHS 3','JHS')
) as v(name, level)
where not exists (select 1 from public.school_classes c where c.name = v.name);
