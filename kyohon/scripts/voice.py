"""Record the natural voice clips with Microsoft neural TTS (pip install edge-tts).
Run from the kyohon folder:  python3 scripts/voice.py
Female lines: Nanami. Male lines: Keita (slightly slower, a touch brighter)."""
import asyncio, json, os, ssl
import edge_tts, edge_tts.communicate as c

ca = "/root/.ccr/ca-bundle.crt"  # cloud proxy CA; ignored elsewhere
if os.path.exists(ca): c._SSL_CTX = ssl.create_default_context(cafile=ca)
VOICES = {"m": ("ja-JP-KeitaNeural", "-5%", "+4Hz"), "f": ("ja-JP-NanamiNeural", "+0%", "+0Hz")}

async def main():
    lines = json.load(open("src/data/lines.json", encoding="utf8"))
    keep = set()
    for key, l in lines.items():
        for kind in l["voices"]:
            name = f"{key}-{kind}.mp3"; keep.add(name)
            out = f"public/voice/{name}"
            if os.path.exists(out): continue
            v, rate, pitch = VOICES[kind]
            await edge_tts.Communicate(l["tts"], v, rate=rate, pitch=pitch).save(out)
            print("recorded", out, l["tts"])
    for f in os.listdir("public/voice"):
        if f not in keep: os.remove(f"public/voice/{f}")

asyncio.run(main())
