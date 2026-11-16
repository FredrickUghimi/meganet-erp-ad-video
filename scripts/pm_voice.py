"""Project Management ad voiceover: edge-tts, voice en-NG-EzinneNeural, rate -4%, no API key.
Each script line is one clip. Line 1 is synthesised sentence by sentence so scripts/pm_audio.py can tighten the pauses
between its sentences (it is 9.9 s of speech for a 6.7 s window). Pieces are saved untouched; no text is changed.
certifi is pointed at the proxy CA bundle (TLS verification stays ON). No credentials are used or logged.
usage: python3 -I scripts/pm_voice.py <scratch-dir>"""
import asyncio, json, pathlib, sys, certifi
certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
import edge_tts  # noqa: E402

VOICE = "en-NG-EzinneNeural"
RATE = "-4%"
# id, start second (storyboard), latest end second, sentences (joined into one clip)
LINES = [
    ("v1", 0.3, 7.55, ["Managing multiple projects can quickly become complicated.", "Deadlines, people, tasks and budgets.", "Everything needs attention."]),
    ("v2", 7.3, 15.25, ["Introducing Project Management in Mega-Net ERP Cloud. A smarter way to plan, organise and monitor your business projects."]),
    ("v3", 15.3, 25.2, ["Create projects, establish milestones, break work into tasks and assign responsibilities. Everyone knows what needs to be done and when."]),
    ("v4", 25.3, 33.9, ["Plan employee workloads, monitor capacity and identify over-allocation before it becomes a bigger problem."]),
    ("v5", 34.3, 44.9, ["Track working hours, approve timesheets and monitor project costs against budgets using purchases and expenses recorded in your ERP."]),
    ("v6", 45.3, 52.9, ["Monitor project progress, identify delays and give management better visibility into project performance."]),
    ("v7", 53.3, 57.4, ["Take control of your projects with Mega-Net ERP Cloud."]),
    ("v8", 57.5, 61.9, ["Contact Mega-Net Software today to request your personalised demonstration."]),
]
work = pathlib.Path(sys.argv[1]); work.mkdir(parents=True, exist_ok=True)

async def main():
    meta = []
    for i, start, end, sents in LINES:
        files = []
        for k, text in enumerate(sents):
            f = work / f"{i}_{k}.mp3"
            await edge_tts.Communicate(text, VOICE, rate=RATE).save(str(f))
            files.append(f.name)
        meta.append({"id": i, "start": start, "latest_end": end, "text": " ".join(sents), "pieces": files})
        print(i, "ok", len(files), "piece(s)")
    (work / "lines.json").write_text(json.dumps(meta, indent=1))
asyncio.run(main())
