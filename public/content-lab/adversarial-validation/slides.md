# Adversarial Validation

## Image Constraints
- Aspect ratio: 4:5
- Dimensions: 1080×1350 px
- Format: PNG per slide — or export directly as PDF from Gemini if supported
- Safe zone: ≥108 px from all edges (10%)
- **Output instruction for Gemini:** Generate all slides and export as a single downloadable PDF. If direct PDF export is unavailable, output individual PNGs named slide-01.png, slide-02.png, etc.

## Global Style
- Palette: Dark background (#0f1117), white primary text, accent in electric blue (#4A90E2), warning red (#E25C4A) for the "danger" AUC zone
- Typography mood: Clean, technical, monospace accents for code/numbers
- Background: Dark slate with subtle grid or noise texture
- Tone: Sharp, practitioner-to-practitioner
- Font size guidance: Headlines 48 px, body 32 px, captions/labels 22 px
- Recurring visual element: Minimal horizontal rule separating headline from body; AUC meter graphic reused on slides 3 and 4

---

## Slide 1 — Cover

**Headline:** Your classical ML model scored 95% in k-fold CV.

**Body:** No leaks. No shortcuts. Then production hit 60%.

What went wrong?

---

## Slide 2 — The Assumption That Breaks

**Headline:** K-fold assumes train and test come from the same world.

**Body:**
- **Time shift:** Train on Jan–Mar. Deploy in April.
- **Source shift:** Train on iOS. Test set is Android.

K-fold only shuffles within train. It never sees this gap.

**Visual:** Two blocks — "Train" and "Test/Production" — with a visible gap between them.

---

## Slide 3 — The Hard Way

**Headline:** 100+ features. Traditional drift detection won't save you.

**Body:**
- **KS-test:** One per feature. That's 100+ individual runs.
- **PSI:** Per-feature stability index. Threshold is arbitrary.
- **PCA:** Can't tell you which features matter to your model.

None of these tell you if the drift affects your predictions.

**Visual:** Fragmented checklist of 100 rows, red X marks — conveying tedium and incompleteness.

---

## Slide 4 — Adversarial Validation

**Headline:** Train a model to separate your train set from your test set.

**Body:**
1. Label train rows → **0**, test rows → **1**
2. Combine. Train a binary classifier (LightGBM / XGBoost).
3. Read the AUC.

- **AUC ≈ 0.5** → distributions match. CV is trustworthy.
- **AUC > 0.7** → severe shift. Your CV is lying.

**Visual:** AUC gauge — needle at 0.5 (green, "safe") vs. 0.8 (red, "danger").

---

## Slide 5 — What You Do With the Result

**Headline:** A high AUC doesn't just flag the problem — it hands you the fix.

**Body:**
- **Drifting features:** Check feature importance. The top-ranked variable is your culprit. Drop it.
- **Better validation:** Isolate train rows scored closest to 1. They mirror your test set. Use them as your validation fold.

One run. All features. Interaction-aware.

**Visual:** Left: feature importance bar chart, one bar highlighted red. Right: top-scoring train rows highlighted as "validation set."

---

## Slide 6 — Automate It in Production

**Headline:** Set a cron job. Let the AUC tell you when data has shifted.

**Body:** After every pipeline run, retrain the adversarial classifier on fresh production data.

AUC > 0.7 → alert fires before your next model run.

No thresholds to tune. No per-feature checks. Your model stops walking into a world it hasn't seen.

**Visual:** Flowchart — cron trigger → adversarial classifier → AUC check → "deploy" / "alert".
