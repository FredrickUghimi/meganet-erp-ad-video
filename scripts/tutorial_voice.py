"""Generates the three Staff Directory tutorial voiceovers (MegaNetTutorialInvite / Change / Deactivate): one edge-tts call
per sentence (en-NG-EzinneNeural, word-level boundaries), leading/trailing silence of each sentence trimmed, sentences
joined with 0.3s gaps, words never sped up. Audio goes to public/voiceover-tutorial-<key>.mp3, word timings and the
caption chunks to src/tutorialTimings.ts.

Same method as scripts/pharmacy_voice.py. edge-tts builds its SSL context from certifi, which ignores SSL_CERT_FILE, so
certifi is pointed at the proxy CA bundle here. Verification stays ON.

Caption chunks: greedy, at most 7 words, must fit 2 lines of the 48px caption (700px of text width, measured with the
Inter ExtraBold font file), and a chunk ends after a comma / full stop / question mark once it has 3+ words.

usage: python3 -I scripts/tutorial_voice.py <scratch-dir>      (needs edge-tts, certifi, Pillow, ffmpeg)"""
import asyncio, json, re, subprocess, sys, pathlib, certifi

CA = "/root/.ccr/ca-bundle.crt"
certifi.where = lambda: CA  # must happen before edge_tts builds its SSL context
import edge_tts  # noqa: E402
from PIL import Image, ImageDraw, ImageFont  # noqa: E402

VOICE = "en-NG-EzinneNeural"
GAP = 0.3
FONT = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
# One list per scene; each scene is one or more sentences, spoken with a 0.3s gap. Approved narration (project owner).
TUTORIALS = {
    "invite": [
        ["Add a new staff member in Mega-Net EHR Cloud.", "You need the Org Admin role."],
        ["You will open Staff Directory, fill in a short form, and save."],
        ["Other roles do not see Staff Directory in the menu."],
        ["Open the menu, and choose Staff Directory."],
        ["The list shows everyone in your organization, with their role, facility, and status.", "Use the filter box to find someone."],
        ["Below the list is the Add or Edit Staff form.", "Fields marked with an asterisk are required.", "Type the first name, the last name, and the email address."],
        ["Each email address can belong to only one account."],
        ["Now choose a role.", "The roles are Org Admin, Physician, Nurse, Front Desk, Billing Clerk, Lab Technician, Pharmacist, and Inventory Manager."],
        ["Then choose a facility from your organization's list."],
        ["There is no password field.", "You never choose or see a password."],
        ["Choose Save."],
        ["A message confirms the invite, and the new person appears in the list."],
        ["The form keeps their details.", "To add someone else, choose Clear first."],
        ["If something is wrong, Save tells you what to fix.", "For example, a missing or invalid email address.", "An email that another account already uses is refused."],
        ["To recap: open Staff Directory, fill in the form, and choose Save."],
        ["That is how you add a staff member.", "Questions? Message Mega-Net Software on WhatsApp."],
    ],
    "change": [
        ["Change a staff member's role or facility in Mega-Net EHR Cloud.", "You need the Org Admin role."],
        ["You will find the person, change the form, and save."],
        ["Open the menu, and choose Staff Directory."],
        ["Type part of the person's name or email in the filter box."],
        ["Choose the row of a person whose status is Active.", "Their details load into the form below."],
        ["The form shows their first name, last name, email, role, and facility."],
        ["Change the role, the facility, or both.", "The facility is the site they are assigned to."],
        ["Choose Save."],
        ["A message confirms the update, and the row shows the new role and facility."],
        ["Saving also saves the name and email exactly as they appear in the form.", "So check them before you save."],
        ["To start over without saving, choose Clear."],
        ["You cannot change your own record on this screen.", "It tells you so if you try."],
        ["To recap: find the person, change the role or facility, and choose Save."],
        ["That is how you change a role or a facility.", "Questions? Message Mega-Net Software on WhatsApp."],
    ],
    "deactivate": [
        ["Deactivate a staff member in Mega-Net EHR Cloud.", "You need the Org Admin role."],
        ["You will choose the person, choose Deactivate, and confirm."],
        ["Open the menu, and choose Staff Directory."],
        ["If the list is long, type part of the person's name in the filter box."],
        ["Choose the row of the person you want to deactivate.", "Their details load into the form below."],
        ["Choose Deactivate.", "The app asks you to confirm."],
        ["If you choose Cancel, nothing changes.", "Choose OK to go ahead."],
        ["A message confirms it, and the person's status changes to Deactivated."],
        ["Deactivating removes their access to this organization.", "Nothing is deleted.", "The person stays in the list."],
        ["A deactivated person who tries to log in with that role is refused."],
        ["Deactivate works only after you choose a person.", "You cannot deactivate your own record.", "The screen tells you so if you try."],
        ["To recap: choose the person, choose Deactivate, and confirm."],
        ["That is how you deactivate a staff member.", "Questions? Message Mega-Net Software on WhatsApp."],
    ],
}
root = pathlib.Path(__file__).resolve().parent.parent
work = pathlib.Path(sys.argv[1]); work.mkdir(parents=True, exist_ok=True)
_font = ImageFont.truetype(FONT, 48); _d = ImageDraw.Draw(Image.new("RGB", (10, 10)))


def lines_needed(text, maxw=700):
    cur, n = "", 1
    for w in text.split():
        t = (cur + " " + w).strip()
        if _d.textlength(t, font=_font) <= maxw:
            cur = t
        else:
            n += 1; cur = w
    return n


def chunk_sentence(tokens):
    out, cur = [], []
    for i, tok in enumerate(tokens):
        if cur and (lines_needed(" ".join(tokens[j] for j in cur + [i])) > 2 or len(cur) >= 7):
            out.append(cur); cur = []
        cur.append(i)
        if re.search(r"[.,?]$", tok) and len(cur) >= 3:
            out.append(cur); cur = []
    if cur:
        out.append(cur)
    return [(c[0], c[-1]) for c in out]


async def synth(path, text):
    comm = edge_tts.Communicate(text, VOICE, boundary="WordBoundary")
    words, audio = [], bytearray()
    async for ch in comm.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            words.append({"text": ch["text"], "start": ch["offset"] / 1e7, "dur": ch["duration"] / 1e7})
    path.write_bytes(audio)
    return words


def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)]))


async def build(key, scenes):
    segs = []
    for si, sentences in enumerate(scenes):
        for ki, text in enumerate(sentences):
            p = work / f"{key}_s{si}_{ki}.mp3"
            segs.append((si, text, p, await synth(p, text)))
    t = 0.0; inputs, filters, sents = [], [], []
    for n, (si, text, p, words) in enumerate(segs):
        total = dur(p)
        lead = max(words[0]["start"] - 0.03, 0)
        end = min(words[-1]["start"] + words[-1]["dur"] + 0.06, total)
        inputs += ["-i", str(p)]
        filters.append(f"[{n}:a]atrim=start={lead:.4f}:end={end:.4f},asetpts=PTS-STARTPTS,apad=pad_dur={GAP}[a{n}]")
        toks = text.split(" ")
        assert len(toks) == len(words), f"{key}: token/word mismatch in {text!r}"
        sents.append({"text": text, "scene": si, "start": round(t, 4), "end": round(t + (end - lead), 4),
                      "words": [{"text": tk, "tts": w["text"], "start": round(t + w["start"] - lead, 4), "end": round(t + w["start"] + w["dur"] - lead, 4)} for tk, w in zip(toks, words)]})
        t += (end - lead) + GAP
    n = len(segs)
    fc = ";".join(filters) + ";" + "".join(f"[a{i}]" for i in range(n)) + f"concat=n={n}:v=0:a=1[out]"
    out = root / "public" / f"voiceover-tutorial-{key}.mp3"
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", fc, "-map", "[out]", "-ar", "24000", "-b:a", "96k", str(out)])
    # audible start/end of each sentence on the shipped mp3 (silence detection, -45 dB), used to place caption edges
    sd = subprocess.run(["ffmpeg", "-v", "info", "-i", str(out), "-af", "silencedetect=noise=-45dB:d=0.12", "-vn", "-f", "null", "-"], capture_output=True, text=True).stderr
    sil = [(float(a), float(b)) for a, b in zip(re.findall(r"silence_start: ([\d.]+)", sd), re.findall(r"silence_end: ([\d.]+)", sd))]
    total_len, speech, last = dur(out), [], 0.0
    for a, b in sil:
        if a - last > 0.05: speech.append((last, a))
        last = b
    if total_len - last > 0.05: speech.append((last, total_len))
    speech = [sg for sg in speech if sg[1] - sg[0] > 0.08]
    for sn in sents:
        seg = [sg for sg in speech if sg[1] > sn["start"] - 0.15 and sg[0] < sn["end"] + 0.15]
        sn["aon"] = round(min(x[0] for x in seg), 4) if seg else sn["start"]
        sn["aoff"] = round(max(x[1] for x in seg), 4) if seg else sn["end"]
    chunks = []
    for si, s in enumerate(sents):
        for a, b in chunk_sentence([w["text"] for w in s["words"]]):
            chunks.append([si, a, b])
    voice_end = sents[-1]["end"]
    print(key, "voice ends", round(voice_end, 3), "file", round(dur(out), 3), "sentences", len(sents), "words", sum(len(s["words"]) for s in sents), "chunks", len(chunks))
    return {"VOICE_END": voice_end, "SENTENCES": sents, "CHUNKS": chunks}


async def main():
    res = {}
    for key, scenes in TUTORIALS.items():
        res[key] = await build(key, scenes)
    ts = ("// Generated by scripts/tutorial_voice.py - do not edit.\n// Seconds from the start of voiceover-tutorial-<key>.mp3. start/end = TTS word boundaries; aon/aoff = audible start/end measured on the mp3 (silence detection). CHUNKS = [sentence, firstWord, lastWord].\n"
          "export type Word = {text: string; tts: string; start: number; end: number};\n"
          "export type Sentence = {text: string; scene: number; start: number; end: number; aon: number; aoff: number; words: Word[]};\n"
          "export type TutorialTimings = {VOICE_END: number; SENTENCES: Sentence[]; CHUNKS: [number, number, number][]};\n"
          "export const TIMINGS: Record<'invite' | 'change' | 'deactivate', TutorialTimings> = %s;\n" % json.dumps(res, indent=1))
    (root / "src" / "tutorialTimings.ts").write_text(ts)

asyncio.run(main())
