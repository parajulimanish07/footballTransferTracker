Building an AI-Powered Football Transfer Intelligence Platform
How I combined Next.js, Python, classical machine learning, source reliability, entity resolution and grounded RAG to make sense of football transfer rumours
Football transfer windows are chaotic. One journalist reports that a club is interested in a player. Another says talks have started. A few hours later, ten websites publish versions of the same story. 
Then social media turns:
"Club X is monitoring Player Y" into "Player Y is basically signed."
As a football fan and an AI student, I thought this was an interesting problem to work on. Instead of building another website that simply collects football headlines, I wanted to build something that could answer a more useful question:
What is actually being reported, who reported it, and how far has the transfer progressed?
That idea became TransferTracker, an AI-powered football transfer intelligence platform

## What does the application actually do?

At a high level, the system does this:

```text
Trusted football news sources
        ↓
Collect transfer reports
        ↓
Check if they are actually about transfers
        ↓
Identify the player and clubs involved
        ↓
Classify the stage of the transfer
        ↓
Detect duplicate reports
        ↓
Score the reliability of the source
        ↓
Store the information
        ↓
Let users browse the news or ask the AI questions
```

For example, these three headlines may look similar:

> “Arsenal are interested in Player X.”

> “Arsenal have submitted an opening bid for Player X.”

> “Arsenal officially announce Player X.”

But they represent completely different stages of a transfer.

My system tries to recognise that difference and classify them as something like:

```text
INTEREST
    ↓
BID_SUBMITTED
    ↓
OFFICIAL
```

That became one of the main ideas behind the project.

**[Screenshot suggestion: Add your main dashboard here showing transfer cards, club logos, reliability and status badges.]**

---

## Turning football news into something a machine can understand

One of the first problems I had was simple:

A machine-learning model cannot understand a sentence in the same way we do.

For example:

> “Liverpool have submitted an opening bid for the player.”

To us, the phrase **“submitted an opening bid”** immediately tells us something important.

To a traditional machine-learning model, however, the sentence first needs to be converted into numbers.

That is where **TF-IDF** comes in.

### TF-IDF, in simple English

TF-IDF stands for **Term Frequency–Inverse Document Frequency**.

The name sounds complicated, but the idea is actually quite simple.

It tries to answer:

> Which words or phrases are important in this article?

Words such as:

```text
the
and
club
football
```

appear everywhere, so they are not very useful.

But words and phrases such as:

```text
bid
medical
personal terms
agreement reached
officially announced
```

tell us much more about the stage of a transfer.

TF-IDF converts these words into numerical values that a machine-learning model can work with.

I also use **n-grams**, which basically means looking at groups of words instead of only individual words.

For example:

```text
"bid"
```

is useful.

But:

```text
"bid rejected"
```

is much more informative.

---

## Classifying the transfer stage with machine learning

Once the text has been converted into numbers, I can give those numbers to a classifier.

The main model I experimented with is a **Linear Support Vector Machine**, or **Linear SVM**.

In simple terms, imagine putting transfer reports into different boxes:

```text
INTEREST
BID_SUBMITTED
NEGOTIATIONS
ADVANCED_TALKS
AGREEMENT_REACHED
OFFICIAL
```

The model learns the kinds of words and phrases commonly found inside each box.

For example:

```text
"monitoring"
"interested in"
"considering a move"

→ probably INTEREST
```

while:

```text
"formal offer"
"opening bid"
"proposal submitted"

→ probably BID_SUBMITTED
```

I also trained **Logistic Regression** as a comparison model.

One thing I learned while building this project was that you don't always need a huge AI model.

For a focused classification problem like this, a lightweight machine-learning model can be fast, cheap and easy to explain.

---

## One of the biggest problems: mixing players and clubs

This was probably one of the most interesting bugs I encountered.

Football gossip articles often contain several rumours in the same article.

Imagine an article saying:

> “Tottenham have approached Player A. Meanwhile, Atletico Madrid are considering a move for Player B.”

If I analyse the entire paragraph together, the system sees:

```text
Tottenham
Player A
Atletico Madrid
Player B
```

and now it has to figure out who belongs to whom.

Early versions of the system occasionally connected the wrong player with the wrong club.

So instead of analysing an entire article as one block, I started splitting it into smaller **sentences and transfer claims**.

The pipeline became:

```text
Article
   ↓
Sentence / clause splitting
   ↓
Transfer claim 1
Transfer claim 2
Transfer claim 3
   ↓
Entity extraction
```

This reduced the chance of one transfer story contaminating another.

That is also where **entity resolution** became important.

---

## What is entity resolution?

Entity resolution simply means:

> Figuring out which real player or club a piece of text is talking about.

Football club names are a perfect example.

These all mean the same thing:

```text
Tottenham
Tottenham Hotspur
Spurs
```

And:

```text
Man City
Manchester City
Manchester City FC
```

should all point to the same club.

Originally, I used more hard-coded mappings.

But there was an obvious problem.

Players transfer.

A dictionary that says:

```text
Player X → Club A
```

will eventually become wrong.

So I later introduced a **Dynamic Football Entity Catalogue** that stores canonical clubs, player relationships and aliases for the leagues supported by the project.

The system now follows a priority like:

```text
Evidence directly from the article
        ↓
Local football entity catalogue
        ↓
Reviewed aliases
        ↓
Legacy fallback
        ↓
Unknown
```

The most important rule is that **explicit article evidence always has priority**.

**[Screenshot suggestion: Show a club/player card or admin/debug view where the player, current club and destination club are clearly resolved.]**

---

## Not every article is an independent confirmation

Another problem with transfer news is duplication.

One journalist publishes a report.

Then:

```text
Website A repeats it
Website B repeats it
An aggregator reposts it
Several social accounts quote it
```

Suddenly it looks like five sources have confirmed the story.

But they may all be repeating **one original report**.

To reduce this problem, I use a combination of:

* URL checks
* Text similarity
* Source provenance
* TF-IDF
* Cosine similarity

**Cosine similarity** is basically a mathematical way of asking:

> How similar are these two pieces of text?

If two articles are extremely similar, the system can group them instead of treating them as completely independent evidence.

That became especially important for the reliability system.

---

## Reliability score is different from model confidence

This was an important distinction for me.

Imagine the machine-learning model says:

```text
Prediction:
BID_SUBMITTED

Model confidence:
95%
```

That does **not** mean:

> “There is a 95% chance the bid actually happened.”

It means:

> “The model is very confident that this article is claiming a bid was submitted.”

The article itself could still come from an unreliable source.

So I created a separate **reliability score**.

It considers things such as:

* Is the source an official club?
* Is it a trusted publisher?
* Is the journalist approved?
* Is this the original report or a repost?
* Are there independent confirmations?
* Is the report recent?
* Are trusted sources contradicting it?

So you could theoretically have:

```text
Classification confidence: HIGH
Reliability: LOW
```

which means:

> “I understand exactly what this article is claiming, but I don't necessarily trust where it came from.”

I think this became one of the most useful design decisions in the project.

---

## Then came the AI assistant

Once the reports were being cleaned, classified and stored, I wanted users to be able to ask questions naturally.

For example:

> “What is the latest on Arsenal's interest in Player X?”

This is where I used **RAG**, or **Retrieval-Augmented Generation**.

Again, complicated name. Simple idea.

Instead of asking an AI model the question directly, the system first searches its own transfer reports.

The process looks like this:

```text
User question
        ↓
Understand the player and club
        ↓
Search relevant stored reports
        ↓
Rank the best evidence
        ↓
Remove duplicate evidence
        ↓
Give the evidence to the language model
        ↓
Generate an answer
        ↓
Validate the answer and citations
```

The way I like to think about it is:

> **The retrieval system is the researcher. The LLM is the writer.**

The language model does not decide which journalist is reliable.

My backend does that.

The language model also shouldn't decide whether a transfer is official unless there is evidence supporting it.

---

## Hybrid search

The search system doesn't depend on one method either.

I combine:

```text
40% semantic similarity
25% keyword / entity matching
20% reliability
15% recency
```

Semantic search helps when two sentences mean the same thing but use different words.

For example:

```text
"Spurs are looking for a striker"
```

and:

```text
"Tottenham are pursuing a new centre-forward"
```

have similar meanings even though the exact wording is different.

That is where **embeddings** help.

An embedding is simply a numerical representation of the meaning of some text.

The system can compare those representations and find related reports.

---

## What if the AI doesn't have enough evidence?

One of my main rules was:

> If the system doesn't know, it should say it doesn't know.

For example, if a user asks:

> “Has Player X officially signed for Liverpool?”

and the database contains no official evidence, I don't want the AI making up a transfer fee, contract length or announcement date.

Instead, it can return something like:

> “There are currently no verified reports confirming that transfer.”

I also use structured output validation so the AI response has to fit the format expected by the application.

RAG doesn't make hallucinations impossible, but retrieval, validation and strict backend rules make unsupported answers much easier to catch.

**[Screenshot suggestion: Show your AI assistant answering a transfer question with the supporting articles underneath.]**

---

## A few things went wrong along the way

This project definitely didn't work perfectly on the first attempt.

A few problems actually changed the architecture quite a lot.

### 1. External news providers failed

Sometimes an API or RSS source was slow or unavailable.

Originally, that could affect the entire feed.

I changed the ingestion system so providers fail independently using `Promise.allSettled()` and timeouts.

---

### 2. Different transfer rumours got mixed together

Processing large paragraphs caused player and club relationships to cross over.

That led to the sentence/clause-level extraction system.

---

### 3. Hard-coded player data became fragile

A static player-to-club mapping eventually becomes outdated.

That led to the Dynamic Football Entity Catalogue.

---

### 4. An AI answer can sound correct even when it isn't

This was probably the biggest lesson.

Large language models are excellent at generating convincing language.

But **convincing is not the same as verified**.

That is why I moved more responsibility into deterministic backend logic, source validation and retrieval.

---

## What I learned

The biggest lesson from building TransferTracker was that an AI project doesn't need AI everywhere.

Different problems need different tools.

Sometimes the right solution is:

```text
Regex
```

Sometimes:

```text
TF-IDF + SVM
```

Sometimes:

```text
Embeddings
```

And sometimes:

```text
LLM + RAG
```

The interesting part is deciding **where each one belongs**.

The final system became something like:

```text
Football news sources
        ↓
Source validation
        ↓
Transfer relevance
        ↓
Claim extraction
        ↓
Entity resolution
        ↓
TF-IDF + ML classification
        ↓
Duplicate / provenance detection
        ↓
Reliability scoring
        ↓
Storage
        ↓
Embeddings + hybrid search
        ↓
Grounded RAG
        ↓
User
```

And that is probably the part of the project I am happiest with.

Not that it uses the most AI possible, but that each AI/ML technique has a specific job.

---

## What's next?

The portfolio version of TransferTracker is now stable enough for me to stop adding features and actually share it.

There are still plenty of things I could explore in the future:

* A larger labelled dataset for the ML classifier
* Stronger entity-resolution evaluation
* More leagues and trusted sources
* Production vector-database deployment
* Live social integrations
* Mobile support
* Better transfer-saga timelines
* Browser push notifications

But one thing I've also learned from this project is that you can keep adding features forever.

At some point, you have to ship.

---

## Final thoughts

TransferTracker started as a football transfer news project.

It ended up becoming a project involving:

* Natural Language Processing
* Classical machine learning
* Information retrieval
* RAG
* Entity resolution
* Source reliability
* Data engineering
* AI security
* Full-stack development

And because I'm genuinely interested in football, it made learning all of those areas much more enjoyable.

The current project has **148 automated unit tests passing** across 17 test suites (0 TypeScript errors, 100% clean Next.js 15 production build).

**GitHub:** `[add your repository link]`

Thanks for reading.

---

### For the Medium version, I'd use only these 5 visuals

1. **Main dashboard screenshot** — immediately after “What does the application actually do?”
2. **Simple architecture diagram** — after the high-level pipeline.
3. **Transfer card screenshot** — around the SVM/classification section.
4. **RAG assistant + sources screenshot** — around the RAG section.
5. **Terminal screenshot showing tests/build passing** — near the ending.

And keep code to only **2–3 tiny snippets**. The article should feel like a story about how you solved the problem, rather than documentation for the repository.

Your opening plus this continuation should land around the right size for a readable Medium post.
