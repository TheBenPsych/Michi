"""Record natural character voice clips with Microsoft neural TTS (pip install edge-tts).
Run from the repo root:  GEN_VOICE=1 npx vitest run tests/voice.test.ts ; python3 scripts/voice.py
Male lines: Keita (slightly slower, a touch brighter). Female lines: Nanami."""
import asyncio, json, os, ssl
import edge_tts, edge_tts.communicate as c

ca = "/root/.ccr/ca-bundle.crt"  # cloud proxy CA; ignored elsewhere
if os.path.exists(ca): c._SSL_CTX = ssl.create_default_context(cafile=ca)
VOICES = {"m": ("ja-JP-KeitaNeural", "-5%", "+4Hz"), "f": ("ja-JP-NanamiNeural", "+0%", "+0Hz")}

async def main():
    lines = json.load(open("voice-lines.json"))
    for l in lines:
        out = f"public/voice/{l['key']}.mp3"
        if os.path.exists(out): continue
        v, rate, pitch = VOICES[l["kind"]]
        await edge_tts.Communicate(l["text"], v, rate=rate, pitch=pitch).save(out)
        print("recorded", out, l["text"])
    keys = sorted(l["key"] for l in lines)
    for f in os.listdir("public/voice"):
        if f[:-4] not in keys: os.remove(f"public/voice/{f}")
    json.dump(keys, open("src/data/voiceClips.json", "w"), indent=1)
    os.remove("voice-lines.json")

asyncio.run(main())
