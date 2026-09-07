// ------------------------------------------------------------------
// Blog.jsx - The Zealc.ollection Journal
// ------------------------------------------------------------------
// Editorial blog with topic filtering, staggered card animations and
// Cloudinary placeholder spaces. Upload images to Cloudinary, paste
// the URLs into the POSTS array below, and the placeholders disappear.
// ------------------------------------------------------------------

import { useState, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock } from "lucide-react";

import SEO from "../components/SEO";
import AnimatedSection from "../components/AnimatedSection";
import { imgSrc, imgHero } from "../lib/imageOpt";

// ------------------------------------------------------------------
// BLOG IMAGE PASTE POINTS - upload to Cloudinary, paste the URL
// between the quotes of each field. Dimensions are in brackets.
//   1. Main Journal hero background  -> BLOG_HERO_IMAGE_URL  (2560 x 1440)
//      (optional video instead:       -> BLOG_HERO_VIDEO_URL  2560 x 1440 mp4)
//   2. Each story hero background    -> heroImage below        (2560 x 1440)
//   3. Each story body / card image  -> image below            (1200 x 900)
// ------------------------------------------------------------------
const BLOG_HERO_IMAGE_URL = ""; // CLOUDINARY: banners/blog-hero.jpg (2560 x 1440)
const BLOG_HERO_VIDEO_URL = ""; // CLOUDINARY (optional): banners/blog-hero.mp4 (2560 x 1440)

const POSTS = [
  {
    slug: "caring-for-leather-through-the-seasons",
    heroImage: "https://res.cloudinary.com/z0afpk9x/image/upload/v1788299056/Blog_topic_bg_1.png", // CLOUDINARY STORY HERO #2: blog/heroes/hero-leather-care.jpg (2560 x 1440)
    topic: "care",
    date: "Jul 2026",
    readTime: "5 min read",
    title: "Caring for Leather Through the Seasons",
    excerpt:
      "Full-grain leather deepens with age when treated well. Our concierge shares the rituals that keep each bag heirloom-ready.",
    image: "https://res.cloudinary.com/z0afpk9x/image/upload/v1788275412/Blog_topic_card_1.png", // CLOUDINARY STORY IMAGE #2: blog/leather-care.jpg (1200 x 900)
    color: "text-gold-dark",
  },
  {
    slug: "the-anatomy-of-a-timepiece",
    heroImage: "https://res.cloudinary.com/z0afpk9x/image/upload/v1788298724/Blog_topic_bg_2.png", // CLOUDINARY STORY HERO #3: blog/heroes/hero-timepiece.jpg (2560 x 1440)
    topic: "heritage",
    date: "Jun 2026",
    readTime: "8 min read",
    title: "The Anatomy of a Timepiece",
    excerpt:
      "From mainspring to caseback, a tour of the hundreds of components our master watchmakers assemble by hand.",
    image: "https://res.cloudinary.com/z0afpk9x/image/upload/v1788276826/Blog_topic_card_2.png", // CLOUDINARY STORY IMAGE #3: blog/timepiece-anatomy.jpg (1200 x 900)
    color: "text-gold-dark",
  },
  {
    slug: "dressing-for-the-evening",
    heroImage: "https://res.cloudinary.com/z0afpk9x/image/upload/v1788299737/Blog_Topic_3_bg.png", // CLOUDINARY STORY HERO #4: blog/heroes/hero-evening.jpg (2560 x 1440)
    topic: "style",
    date: "Jun 2026",
    readTime: "4 min read",
    title: "Dressing for the Evening",
    excerpt:
      "Understated silhouettes for formal nights. Why the quietest piece in the room often says the most.",
    image: "https://res.cloudinary.com/z0afpk9x/image/upload/v1788299228/Blog_Topic_3_card.png", // CLOUDINARY STORY IMAGE #4: blog/evening-style.jpg (1200 x 900)
    color: "text-gold-dark",
  },
  {
    slug: "storing-watches-properly",
    heroImage: "", // CLOUDINARY STORY HERO #5: blog/heroes/hero-watch-storage.jpg (2560 x 1440)
    topic: "care",
    date: "May 2026",
    readTime: "4 min read",
    title: "Storing Watches Properly",
    excerpt:
      "Humidity, magnetism and winding. The three silent enemies of a fine watch, and the simple habits that defeat them.",
    image: "", // CLOUDINARY STORY IMAGE #5: blog/watch-storage.jpg (1200 x 900)
    color: "text-gold-dark",
  },
  {
    slug: "the-art-of-layering-accessories",
    heroImage: "", // CLOUDINARY STORY HERO #6: blog/heroes/hero-layering.jpg (2560 x 1440)
    topic: "style",
    date: "May 2026",
    readTime: "3 min read",
    title: "The Art of Layering Accessories",
    excerpt:
      "A cufflink, a signet ring, a pocket square. How to wear several pieces at once without ever looking crowded.",
    image: "", // CLOUDINARY STORY IMAGE #6: blog/layering.jpg (1200 x 900)
    color: "text-gold-dark",
  },
  {
    slug: "choosing-your-first-luxury-watch",
    heroImage: "", // CLOUDINARY STORY HERO #7: blog/heroes/hero-first-watch.jpg (2560 x 1440)
    topic: "watches",
    date: "Apr 2026",
    readTime: "7 min read",
    title: "Choosing Your First Luxury Watch",
    excerpt:
      "Movement, case size, dial and strap. The quiet questions that separate a watch you wear every day from one that simply decorates the shelf.",
    image: "", // CLOUDINARY STORY IMAGE #7: blog/first-watch.jpg (1200 x 900)
    color: "text-gold-dark",
  },
  {
    slug: "automatic-vs-quartz-decoded",
    heroImage: "", // CLOUDINARY STORY HERO #8: blog/heroes/hero-movements.jpg (2560 x 1440)
    topic: "watches",
    date: "Apr 2026",
    readTime: "5 min read",
    title: "Automatic or Quartz? Decoded",
    excerpt:
      "The difference lives in the heartbeat. We break down both movements so you can choose with confidence.",
    image: "", // CLOUDINARY STORY IMAGE #8: blog/movements.jpg (1200 x 900)
    color: "text-gold-dark",
  },
  {
    slug: "the-handbag-that-holds-its-shape",
    heroImage: "", // CLOUDINARY STORY HERO #9: blog/heroes/hero-handbag.jpg (2560 x 1440)
    topic: "style",
    date: "Mar 2026",
    readTime: "4 min read",
    title: "The Handbag That Holds Its Shape",
    excerpt:
      "Structure, hardware and stitching under tension. Why the silhouette of a good bag outlasts every passing trend.",
    image: "", // CLOUDINARY STORY IMAGE #9: blog/handbag-structure.jpg (1200 x 900)
    color: "text-gold-dark",
  },
];

const TOPICS = [
  { label: "All Stories", value: "" },
  { label: "Heritage", value: "heritage" },
  { label: "Watches", value: "watches" },
  { label: "Style Journal", value: "style" },
  { label: "Care & Craft", value: "care" },
];

// ------------------------------------------------------------------
// FULL ARTICLE CONTENT
// The editorial body for every story. The user only uploads the
// images - the words are already written and will display as soon
// as each slug is opened.
// ------------------------------------------------------------------

const ARTICLE_BLOCKS = {
  "caring-for-leather-through-the-seasons": {
    paragraphs: [
      "Full-grain leather is a living material in the most practical sense. It drinks in oils, it responds to humidity, and it records every day of its life in a developing patina. The bags and small leather goods we make are engineered to age beautifully, but like anything that ages well, they reward attention paid in small, regular doses rather than dramatic interventions.",
      "In the rainy season, keep the leather dry before storing it. If a bag comes home damp, let it breathe in open air for an evening rather than tucking it away while still cool and moist. Once a month, work a small amount of leather conditioner through the surface with a soft cloth, always in circles, never soaking the material. The leather should look nourished, never glossy with surplus.",
      "Heat is leather's quiet enemy. A bag left on a car seat in midday sun will stiffen, crack and lose its shape far faster than one used daily and stored in shade. When a bag is not being worn, give it structure: fill it gently with tissue or a soft pouch so the silhouette holds, and keep it in its dust bag in a temperate, dry cupboard.",
    ],
  },
  "the-anatomy-of-a-timepiece": {
    paragraphs: [
      "Open the caseback of a fine mechanical watch and you will find a small city. Dozens of wheels, levers, springs and jewels, each with a single job, all cooperating to divide time into perfectly equal slices. Understanding this city is the best way to understand why a mechanical watch costs what it costs, and why it lasts as long as it does.",
      "At the heart lies the mainspring, a coiled ribbon of steel that stores the energy of your winding or the motion of the rotor. That energy travels through the gear train, stepping down through the centre wheel, third wheel and fourth wheel, each turning faster than the last, until it reaches the escapement. The escapement is the watch's conscience: it releases the energy in tiny, disciplined ticks, and the balance wheel swings back and forth to regulate them, typically at 28,800 beats per hour.",
      "Above the movement, the dial is a landscape of craft in miniature. Hour markers are applied, not printed. Hands are cut, filled with luminous material where needed, and set at heights measured in fractions of a millimetre so they never touch. The sapphire crystal that covers it all is nearly as hard as diamond, and the case beneath is machined, brushed and polished in stages that a master finisher signs off one by one.",
      "When we speak of hundreds of components assembled by hand, we mean that a single watch may spend days on a maker's bench. No part is disposable; every screw is finished, every jewel seated with intent. That is why a well-made watch, serviced at reasonable intervals, will outlive the person who first wound it.",
    ],
  },
  "dressing-for-the-evening": {
    paragraphs: [
      "Evening dress is where quiet luxury feels most at home, because evenings are precisely the occasions where everyone else tends to perform. The person who arrives composed, in a palette of ink, charcoal, ivory or deep champagne, often commands the room without having attempted to. The discipline of the evening outfit is subtraction, not addition.",
      "Begin with the silhouette. A jacket with a clean shoulder line, trousers that fall straight to the shoe, a shirt with a collar that stands without a tie. When the shapes are right, the outfit needs almost nothing else. Fabric does the persuading: wool with a fine handle, cotton with body, silk that moves rather than gleams.",
      "Then one considered piece. A watch with a dark dial and a strap that matches the shoe. Cufflinks in the same metal as a signet ring, worn on the same hand. A pocket square folded flat, not fluffed. The rule is that accessories should appear to belong to each other, as if they were selected long ago and simply reached for.",
      "Finally, the test that separates a good evening outfit from a great one: would you be comfortable wearing it at a dinner that runs three hours long? Quiet luxury is never a costume. It is clothing that lets you forget what you are wearing and remember only the people you are with.",
    ],
  },
  "storing-watches-properly": {
    paragraphs: [
      "A fine watch spends more of its life in storage than on a wrist, and the hours it spends there quietly determine how long it performs at its best. Three silent enemies operate in every drawer and cabinet: humidity, magnetism, and neglect. Defeating them is cheaper and simpler than most people assume.",
      "Humidity attacks from the inside and the outside. Moist air condenses on cool steel, and over time it can reach the movement itself, where it corrodes pivots and blurs lubricants. Keep watches in a room that stays between 40 and 60 percent humidity, away from bathrooms and windowsills. A small silica packet in the watch box costs almost nothing and lasts for months.",
      "Magnetism is the enemy people never suspect. Modern life is full of it: speakers, handbags with magnetic clasps, laptops, phone chargers. A magnetised watch does not break; it simply runs fast, sometimes by minutes a day. If your watch suddenly begins racing, a thirty-second demagnetising visit at any good watchmaker usually cures it entirely.",
      "And neglect is the slowest enemy. A mechanical watch that is never worn dries out its oils in place; an automatic that never winds starves its lubrication. If a watch will rest for more than a season, have it serviced before storage rather than after. Stored properly, a Zealc.ollection timepiece is ready to resume its work the day you reach for it again, ten years later, without complaint.",
    ],
  },
  "the-art-of-layering-accessories": {
    paragraphs: [
      "Layering is the difference between a man who appears finished and a man who merely appears dressed. Done well, it is invisible as effort: a cufflink glinting as a sleeve moves, a ring catching lamplight across a table, a scent arriving a moment before the person. Done badly, it reads as costume. The distance between the two is governed by a handful of rules that have survived every fashion cycle.",
      "The first rule is metal discipline. Choose one metal family for a given outfit, gold or silver-toned, and let every visible piece belong to it. The watch case, the cufflinks, the ring, the belt buckle: when they agree, the eye reads them as a single considered decision made long ago. When they disagree, the eye counts them as separate attempts.",
      "The second rule is placement. One statement per limb, per hand, per visible span of chest. A signet ring on the right hand, a watch on the left wrist, cufflinks at the cuff: the pieces occupy distinct territories and never compete. A pocket square lives in the breast pocket of the jacket, not also on the lapel as a pin, not also as a brooch at the collar.",
      "The third rule is restraint in scale. Fine, low-profile pieces layer gracefully; large ones dominate. When each piece is modest on its own, their sum feels rich rather than heavy. This is the quiet-luxury principle in miniature: several small certainties instead of one loud one, and the resulting impression lasts precisely because nothing in it is trying.",
    ],
  },
  "choosing-your-first-luxury-watch": {
    paragraphs: [
      "The first luxury watch is the one that teaches you what the next one will teach you, so it deserves to be chosen slowly. Four questions separate a watch that lives on your wrist for a decade from one that decorates a shelf: movement, case size, dial, and strap. Answer them honestly and the field narrows quickly.",
      "Movement first. An automatic movement winds itself from the motion of your wrist and carries the romance of visible mechanics through a caseback; a quartz movement trades none of the accuracy and asks for almost nothing in return. For a first watch worn daily, there is no wrong answer, but know which temperament you are buying: the machine that needs you, or the one that simply performs.",
      "Case size is where most first buyers stumble. The instinct is to go larger than the wrist suggests. Measure your wrist and choose a case one size smaller than the largest you find appealing; you will wear it every day, and slightly understated sizes age far better in memory than oversized ones. Forty millimetres and below suits most wrists; forty-four and above is a statement that demands a wardrobe to match.",
      "Dial and strap decide the watch's daily vocabulary. A dark dial on a steel bracelet is the most versatile sentence a watch can speak, crossing from office to evening without comment. A leather strap dresses it toward dinners and daylight; a two-tone dial or gold accents lean formal. Buy for the life you actually lead, and the shelf will take care of itself, because the watch will rarely be on it.",
    ],
  },
  "automatic-vs-quartz-decoded": {
    paragraphs: [
      "Every serious conversation about buying a watch eventually comes down to this pair of words, and the honest answer is that both are excellent technologies that serve different temperaments. The difference lives in the heartbeat, and once you understand the heartbeat, the choice stops being a puzzle.",
      "A quartz movement keeps time with a sliver of crystal that vibrates 32,768 times a second when electricity passes through it. That vibration is counted into perfect seconds. The result is accuracy that mechanical movements can only admire, thinness that flatters smaller wrists, and a battery that asks to be replaced every few years for a few shillings. Quartz is the answer to the question, what time is it, with zero ceremony.",
      "An automatic movement keeps time with a coiled spring and a swinging rotor. Your wrist moves a weighted rotor, the rotor winds the mainspring, and the spring's patient release of energy drives the gear train through the escapement's heartbeat. It is less accurate by minutes per month, thicker, and entirely mechanical, which means it will run for generations with servicing instead of replacement. Automatic is the answer to a different question: what does it mean to wear a small machine that only lives because you move.",
      "Our guidance is practical. If the watch will be your single, daily instrument, quartz's silence and precision are a virtue. If the watch is a companion, an object of ritual, the thing you pick up and wind with some small intention, automatic is the one that rewards the habit. Zealc.ollection offers both, because the right watch is the one that fits the way you actually live, not the way catalogues say you should.",
    ],
  },
  "the-handbag-that-holds-its-shape": {
    paragraphs: [
      "Bags lose their shape long before their leather shows age, and the difference between a bag that holds its silhouette for a decade and one that sags in a season is decided at the design stage, in choices that cost more to make but almost nothing to live with. Structure, hardware, and stitching under tension are the three engineering decisions that matter.",
      "Structure begins with the leather itself. Full-grain hides carry their own body; they stand upright when cut, hold a fold when creased, and recover from pressure instead of remembering it. Base boards and gussets cut from firm material give the bag a floor, so that it sets down like a piece of furniture rather than collapsing like cloth. A good bag should be able to stand on its own when empty; that is not vanity, that is engineering.",
      "Hardware is load-bearing in ways people rarely notice. The strap anchor points of a heavily loaded bag carry real kilograms, day after day. Rivets, bartack stitching, and solid metal loops distribute that load; glued-on or thin-plated fittings concentrate it, and leather tears where load concentrates. This is why our fittings are machined and seated, not merely decorative.",
      "And stitching under tension is the silent guarantee. Every stress line, the strap junction, the handle base, the base corners, is sewn with reinforced thread and double runs. A bag's silhouette survives if its seams do, and its seams survive if they were asked to hold more than they ever actually will. That margin is the entire difference between a bag you replace and a bag that becomes a family object.",
    ],
  },
};


const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();
  const topicFilter = searchParams.get("topic") || "";

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const filteredPosts = useMemo(
    () => (topicFilter ? POSTS.filter((p) => p.topic === topicFilter) : POSTS),
    [topicFilter]
  );

  // Article view: /blog/:slug opens one story with its full editorial body.
  const articlePost = useMemo(
    () => (slug ? POSTS.find((p) => p.slug === slug) : null),
    [slug]
  );

  const articleBlocks = articlePost ? ARTICLE_BLOCKS[articlePost.slug] : null;

  const relatedPosts = useMemo(() => {
    if (!articlePost) return [];
    return POSTS.filter(
      (p) => p.slug !== articlePost.slug && p.topic === articlePost.topic
    ).slice(0, 3);
  }, [articlePost]);

  const setTopic = (value) => {
    if (value) {
      setSearchParams({ topic: value });
    } else {
      setSearchParams({});
    }
  };

  // If a slug is present, render the single article view instead of the grid.
  if (articlePost && articleBlocks) {
    return <ArticleView post={articlePost} blocks={articleBlocks} related={relatedPosts} />;
  }

  return (
    <motion.div {...pageTransition}>
      <SEO
        title="The Journal"
        description="Stories from the Zealc.ollection world - heritage, watches, craft, care and style."
      />

      {/* Hero banner - tall, cinematic, matching the Men / Ladies edit heroes */}
      <section className="editorial-hero relative bg-onyx text-ivory overflow-hidden min-h-[88vh] lg:min-h-[92vh] flex items-center">
        {BLOG_HERO_IMAGE_URL && (
          <img
            src={imgHero(BLOG_HERO_IMAGE_URL)}
            alt=""
            aria-hidden="true"
            className="editorial-hero__media absolute inset-0 w-full h-full object-cover object-top"
            style={{ objectFit: "cover" }}
          />
        )}
        {BLOG_HERO_VIDEO_URL && (
          <video
            src={BLOG_HERO_VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            className="editorial-hero__media absolute inset-0 w-full h-full object-cover"
            style={{ objectFit: "cover" }}
          />
        )}
        {/* Dark scrim so text stays crisp over any media */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_60%)]" />
        {/* Placeholder label - shows until you paste BLOG_HERO_IMAGE_URL. Do not style over it. */}
        {!BLOG_HERO_IMAGE_URL && !BLOG_HERO_VIDEO_URL && (
          <div className="absolute inset-x-0 bottom-24 md:bottom-28 z-10 flex justify-center">
            <span className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-ivory/25">
              Paste main hero background here - 2560 x 1440 px landscape
            </span>
          </div>
        )}
        {/* Clean image-only hero: no headline, label or description.
            The background image is the entire statement. */}

        {/* Gold hairline at the base, like the edit heroes */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      </section>

      {/* Topic filter */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {TOPICS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTopic(t.value)}
              className={`text-[12px] tracking-[0.2em] uppercase font-semibold pb-2 border-b-2 transition-colors duration-300 ${
                topicFilter === t.value
                  ? "border-gold-dark text-gold-dark"
                  : "border-transparent text-onyx/45 hover:text-onyx"
              }`}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] tracking-[0.2em] uppercase text-onyx/40">
            {filteredPosts.length} stories
          </span>
        </div>
      </section>

      {/* Posts grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pb-20 md:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={topicFilter}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.08 * index,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative bg-ivory border border-mist"
              >
                <Link to={`/blog/${post.slug}`} aria-label={`Read: ${post.title}`} className="absolute inset-0 z-10" />
                <div className="relative aspect-[4/3] bg-onyx overflow-hidden">
                  {post.image ? (
                    <img
                      src={imgSrc(post.image, 800)}
                      alt={post.title}
                      loading="lazy"
                      className="blog-topic-image absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    // Editorial placeholder - a typographic "opening page"
                    // that looks deliberate rather than empty. Once an
                    // image is pasted into the post's image field this
                    // fades away.
                    <>
                      <div
                        className={`absolute inset-0 transition-colors duration-500 ${
                          hoveredIndex === index ? "bg-onyx" : "bg-[#0e0d0b]"
                        }`}
                      />
                      <div
                        className="absolute inset-0 opacity-40"
                        style={{
                          background:
                            "radial-gradient(ellipse at 70% 30%, rgba(212,175,55,0.10), transparent 55%)",
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                          className={`font-display text-[52px] md:text-[62px] leading-none tracking-tight transition-colors duration-500 ${
                            hoveredIndex === index ? "text-gold" : "text-ivory/90"
                          }`}
                        >
                          {post.title.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                        </span>
                        <div className="mt-4 h-px w-10 bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
                      </div>
                    </>
                  )}
                  <span className="absolute top-4 left-4 bg-ivory/95 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase font-semibold text-onyx">
                    {post.topic}
                  </span>
                </div>

                <div className="p-7">
                  <div className="flex items-center gap-4 text-[10px] tracking-[0.18em] uppercase text-onyx/45 mb-4">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={12} />
                      {post.date}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl mb-3 leading-snug group-hover:text-gold-dark transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="text-onyx/60 text-sm leading-relaxed mb-6 font-body">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-semibold text-gold-dark">
                    Read the story
                    <ArrowUpRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Article CTA */}
        <AnimatedSection className="mt-24 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[11px] tracking-[0.3em] uppercase text-onyx/45 mb-5"
          >
            More stories are written each month
          </motion.p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2.5 btn-gold group"
          >
            Explore the Collection
            <ArrowUpRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </AnimatedSection>
      </section>
    </motion.div>
  );
}

// ------------------------------------------------------------------
// ARTICLE VIEW - the full story page opened from each card
// ------------------------------------------------------------------

function ArticleView({ post, blocks, related }) {
  const topicLabel =
    TOPICS.find((t) => t.value === post.topic)?.label || post.topic;

  return (
    <motion.div {...pageTransition}>
      <SEO
        title={`${post.title} | The Journal`}
        description={post.excerpt}
      />

      {/* Article hero - the story's own image fills the full-screen backdrop */}
      <section className="article-hero relative bg-onyx text-ivory overflow-hidden min-h-[78vh] lg:min-h-[86vh] flex items-end">
        {/* Story image doubles as the hero backdrop: paste post.image and the
            same photo appears on the card AND behind the title. heroImage
            takes priority if you upload a dedicated wide banner. */}
        {(post.heroImage || post.image) ? (
          <img
            src={post.heroImage || post.image}
            alt={post.title}
            className="article-hero__media absolute inset-0 w-full h-full object-cover"
            style={{ objectFit: "cover" }}
          />
        ) : (
          // Editorial backdrop before the hero image is uploaded.
          // Paste the Cloudinary URL into post.image and this fades away.
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-onyx/85 to-onyx" />
            <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(212,175,55,0.10), transparent 55%)" }} />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/85" />
        <div className="absolute bottom-10 md:bottom-14 left-4 sm:left-8 lg:left-16 z-10 w-full max-w-[1440px]">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.06] max-w-4xl text-ivory"
          >
            {post.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center gap-4 mt-6 text-[11px] tracking-[0.18em] uppercase text-ivory/65"
          >
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} />
              {post.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} />
              {post.readTime}
            </span>
          </motion.div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      {/* Article body */}
      <section className="max-w-[780px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-10"
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-semibold text-gold-dark hover:text-onyx transition-colors"
          >
            <ArrowLeft size={14} />
            Back to all stories
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="font-display text-xl md:text-2xl leading-relaxed text-onyx/85 mb-10"
        >
          {post.excerpt}
        </motion.p>

        {post.image ? (
          <motion.img
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            src={imgSrc(post.image, 1200)}
            alt={`${post.title} - detail`}
            className="w-full aspect-[4/3] object-cover my-10"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="w-full aspect-[4/3] bg-onyx relative overflow-hidden my-10"
          >
            <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(212,175,55,0.10), transparent 55%)" }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-6xl md:text-7xl text-ivory/90">
                {post.title.split(" ").slice(0, 2).map((w) => w[0]).join("")}
              </span>
              <div className="mt-4 h-px w-12 bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
              <span className="mt-4 text-[9px] tracking-[0.3em] uppercase text-ivory/30">
                Story image - {post.slug}.jpg (1200 x 900)
              </span>
            </div>
          </motion.div>
        )}

        {blocks.paragraphs.map((para, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.05 * index }}
            className="text-[15px] md:text-base leading-[1.9] text-onyx/75 font-body mb-6"
          >
            {para}
          </motion.p>
        ))}
      </section>

      {/* Related stories */}
      {related.length > 0 && (
        <section className="bg-mist/50 border-t border-mist">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 md:py-20">
            <AnimatedSection>
              <p className="eyebrow mb-8">Keep Reading</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/blog/${r.slug}`}
                    className="group bg-ivory border border-mist hover:border-gold/40 transition-colors duration-300"
                  >
                    <div className="relative aspect-[4/3] bg-onyx overflow-hidden">
                      {r.image ? (
                        <img
                          src={imgSrc(r.image, 640)}
                          alt={r.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(212,175,55,0.10), transparent 55%)" }} />
                          <span className="font-display text-5xl text-ivory/90">
                            {r.title.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                          </span>
                          <div className="mt-3 h-px w-8 bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
                        </div>
                      )}
                      <span className="absolute top-4 left-4 bg-ivory px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase font-semibold text-onyx">
                        {r.topic}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-lg mb-2 group-hover:text-gold-dark transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-onyx/55 text-sm font-body line-clamp-2">
                        {r.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}
    </motion.div>
  );
}