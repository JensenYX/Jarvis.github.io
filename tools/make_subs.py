#!/usr/bin/env python3
"""English subtitles for the demo videos.

The cues are translated from the ASR transcripts of tools/transcribe.py and
checked against the captions burned into the recordings, which also settle who
is speaking: the CS2 and LoL captions say 玩家 / AI队友, the voxel ones 我 /
伙伴, the daily client 你 / Jarvis. Here the user is always "User" and the
assistant always "Jarvis". Numbers the assistant read off a HUD were checked
against the Jev readout shown in the Omni recordings.

The English session is not listed: it already carries English captions.

    python3 tools/make_subs.py      # writes assets/subs/<slug>.en.vtt
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "subs"

U, J = "User", "Jarvis"

# Videos with Chinese captions burned in along the bottom. When the browser
# draws the cues itself (fullscreen), they go to the top of the frame instead.
TOP_CUES = {"audio-daily-zh", "audio-minecraft-1", "audio-minecraft-2", "omni-cs2", "omni-lol"}

SUBS: dict[str, list[tuple[float, float, str, str]]] = {
    "audio-daily-zh": [
        (0.3, 3.3, U, "Hi Jarvis, can you chat with me for a bit?"),
        (5.1, 6.8, J, "Hi! What would you like to talk about?"),
        (8.5, 11.9, U, "Friends are coming over tonight, and I want a light little game."),
        (11.9, 15.6, U, "Co-op or head-to-head: which breaks the ice better? One sentence."),
        (17.2, 20.2, J, "Co-op party games like Werewolf or Who's the Spy break the ice better,"),
        (20.2, 23.4, J, "because they quickly build trust and get people talking."),
        (24.8, 28.9, U, "Make me a web mini-game where you catch stars."),
        (28.9, 32.6, U, "Single-player for now, 60 seconds a round: catch stars to score, dodge the meteors."),
        (32.6, 36.7, U, "Also check tonight's weather in Shanghai, and find two recent tech news stories."),
        (41.9, 42.8, U, "Wait."),
        (43.5, 46.3, U, "Make the game two-player co-op instead of single-player."),
        (46.3, 48.7, U, "Keep checking the weather and the news."),
        (52.5, 54.6, J, "OK, I'll go with the latest request."),
        (56.7, 62.3, J, "Shanghai is around 25 °C tonight, possibly with light rain, turning cloudy later."),
        (64.7, 67.8, J, "Is the two-player co-op on one screen, or online?"),
        (67.9, 73.7, U, "One phone, no login, no download. Please keep building it."),
        (77.7, 79.9, J, "OK, I'll go with the latest request."),
        (81.8, 85.8, J, "Should both players share one total score, with separate lives each?"),
        (87.8, 92.6, J, "Two tech stories: OpenAI's models accessed government websites, including the U.S. Census and the SEC."),
        (92.6, 96.9, J, "And Danantara and Thales are exploring AI and technology investment in Indonesia."),
        (98.1, 100.7, U, "Sure, go with what you suggested."),
        (101.2, 104.2, U, "Also, make a separate countdown page with big numbers."),
        (109.7, 113.0, U, "Cancel the countdown page. Keep the game going."),
        (116.8, 118.8, J, "That task has been cancelled."),
        (119.8, 121.4, U, "I pasted a few lines of code."),
        (121.6, 125.0, U, "I only changed the second list. Why did the first one change too?"),
        (132.8, 136.4, J, "Because both variables point to the same list object."),
        (140.8, 145.3, U, "What's the simplest way to keep the two lists independent?"),
        (151.0, 153.4, J, "OK, I'll go with the latest request."),
        (154.1, 157.3, U, "Add a mute button to the game. Don't change anything else."),
        (162.1, 164.3, J, "OK, I'll go with the latest request."),
        (167.1, 171.4, J, "The simplest way is to copy the list with a slice."),
        (173.2, 177.8, J, "Two-player Star Catcher is updated as requested. Open it and give it a try."),
        (179.2, 181.8, U, "Open it. Let me try."),
        (194.0, 198.9, U, "Give me a recap: what's left at the end, and what did we cancel?"),
        (203.4, 207.4, J, "Finished: the weather, the tech news, the code answer and the mute button."),
        (207.4, 211.2, J, "The countdown page was cancelled."),
        (215.1, 217.8, U, "Great. Now we've got something to play tonight."),
        (218.2, 220.2, U, "Thank you, Jarvis."),
    ],
    "audio-pvz": [
        (2.2, 5.6, J, "First click the middle of the game screen to open the menu."),
        (7.1, 13.4, J, "Click Adventure to start, or use the Beginner Level button at the top."),
        (21.3, 28.4, J, "We're picking plants now. Click a plant card to add it on the left, then click Start."),
        (29.0, 30.7, U, "Which plants should I pick?"),
        (35.1, 39.8, J, "Take Peashooter, Sunflower and Wall-nut. The Peashooter does the damage."),
        (42.3, 44.2, U, "What else? Can I pick anything else?"),
        (49.3, 54.2, J, "Add Cherry Bomb, Potato Mine and Chomper. The Cherry Bomb clears the lawn in an emergency."),
        (63.0, 64.9, J, "Collect this sun first."),
        (68.1, 69.0, U, "Then what?"),
        (73.2, 76.5, J, "Plant a Sunflower in lane 1, second square."),
        (83.7, 85.5, U, "Play it for me for five minutes."),
        (89.2, 92.1, J, "OK, I'll play for five minutes, then hand it back."),
        (134.6, 135.6, U, "I'll take it from here."),
        (139.1, 140.8, J, "OK, it's yours."),
        (144.2, 147.8, U, "Plant Sunflowers all along the second column for me."),
        (152.2, 157.5, J, "I couldn't take over this time. Wait until the lawn is ready and let go of the mouse, then hand it to me."),
        (158.1, 161.4, U, "Dig up the Sunflower in column 1, row 1."),
        (165.2, 168.3, J, "OK, digging up the first Sunflower in row 1."),
        (172.2, 173.9, U, "Dig up that Wall-nut."),
        (178.5, 181.0, J, "OK, digging up the Wall-nut."),
    ],
    "audio-minecraft-1": [
        (1.6, 4.6, U, "Let's make camp at the stone shelter across the water."),
        (4.6, 8.0, U, "Get some food, tools and a way across first. You plan it."),
        (14.3, 18.6, J, "First, harvest the ripe carrots. They restore hunger, and we keep some to replant."),
        (20.9, 24.1, U, "Can't we just get going? Why look for food first?"),
        (28.3, 32.9, J, "Hunger is at 8. There's food right here, so let's stock up and have some on the way."),
        (35.0, 39.3, U, "Eat one of the carrots you just picked, and keep the rest."),
        (46.2, 49.7, J, "Ate one fresh carrot. Keeping the other one."),
        (51.5, 54.7, U, "I'll walk to the edge of the slope and take a look. You do the rest."),
        (58.0, 61.2, J, "OK, you go. I'm keeping track of the goal and the materials."),
        (69.6, 72.8, U, "The crafting table is right here. A wooden pickaxe for mining stone, or a wooden sword for defense?"),
        (72.8, 76.0, U, "Which do you think is more useful?"),
        (81.2, 86.1, J, "The pickaxe. We can't mine the stone in front of us without a tool, and we need it to get cobblestone."),
        (88.8, 91.5, U, "OK. Make the one you said."),
        (94.9, 96.3, J, "OK, doing that."),
        (97.7, 100.9, J, "The tool is ready. Now let's work out how to cross the water."),
        (105.6, 108.6, U, "Wait, don't pave the path with the planks. I want to keep four to fix the shelter."),
        (108.6, 111.8, U, "And no more chopping trees."),
        (116.0, 120.2, J, "Got it. The materials stay as you asked. Next, let's pick a new route."),
        (129.9, 131.7, U, "The planks are for the shelter."),
        (132.1, 137.7, U, "Should we follow the edge of the slope, or dig more dirt to pave a way across? You choose."),
        (145.9, 149.8, J, "Let's dig some more dirt here and save up enough to pave a path."),
        (151.7, 155.7, U, "Then take the slope path. Clear the stone in the way."),
        (156.1, 158.2, U, "Keep the stone you mine for a weapon."),
        (168.9, 173.8, J, "Mining the stone blocking the way first. The cobblestone it drops is saved for a weapon."),
        (176.7, 179.1, J, "The way is clear. I stopped once there was room to walk."),
        (183.0, 184.6, U, "Then make a stone sword."),
        (192.8, 195.8, J, "Crafting a stone sword from cobblestone and sticks. We have enough."),
        (197.7, 200.6, J, "The tool is ready. Now let's see how to cross the water."),
        (201.0, 204.4, U, "We have food and tools now."),
        (204.4, 207.8, U, "Take the slope path we scouted to the stone shelter with the red eaves across the water."),
        (216.9, 222.2, J, "First I'll follow the scouted path to the rock on the far side, and look for the shelter with the red eaves."),
        (224.1, 225.5, U, "I'll do this short stretch."),
        (228.6, 231.5, J, "OK, you go. I'm keeping track of the goal and the materials."),
        (237.0, 238.5, U, "OK, your turn again."),
        (242.6, 246.1, J, "OK, picking up where I left off. The materials we agreed on are still set aside."),
        (256.5, 259.2, J, "We've made it this far. Let me check the way ahead."),
        (267.6, 271.5, U, "The roof here is missing a few blocks. Are the planks we kept enough?"),
        (275.5, 281.7, J, "There are four gaps in the roof and seven planks in the bag. Enough, and the ones we kept come in handy."),
        (284.5, 288.9, U, "Use the four planks we set aside to fill these four gaps in the roof."),
        (294.5, 300.3, J, "Filling the roof gaps with four oak planks, exactly what we kept for the repair."),
        (305.4, 308.2, J, "Those gaps are filled. The roof is fixed."),
        (311.2, 313.9, U, "What's left in the bag now, and what's it good for?"),
        (317.5, 325.0, J, "Three oak planks for more repairs, one carrot to eat, the wooden pickaxe for mining, and the stone sword for defense."),
        (326.9, 331.2, U, "Great. This is our base. I'll take it from here."),
        (334.3, 337.2, J, "OK, it's yours. Goal and materials all noted."),
    ],
    "audio-minecraft-2": [
        (1.4, 3.6, U, "Let's check out the ruins over there."),
        (3.6, 6.5, U, "Watch for danger, and warn me if anything looks wrong."),
        (9.2, 12.2, J, "I'll keep watch. If there's danger, staying alive comes first."),
        (22.2, 24.4, J, "There's a mob ahead. Don't get too close."),
        (30.5, 32.7, U, "It's just one. Let's try."),
        (33.2, 36.5, U, "You open the gate and fight it. If we can't win, get us out."),
        (41.2, 42.3, J, "On it."),
        (44.1, 46.3, J, "Run! Back inside the gate!"),
        (46.3, 48.0, U, "No good, I'm losing health too fast!"),
        (48.0, 50.5, U, "Get me back to camp. Don't trade hits with it!"),
        (54.0, 55.9, J, "We're back inside the gate. Recover first."),
        (55.9, 60.6, U, "Why didn't we keep fighting? Not enough health, or bad gear?"),
        (64.0, 67.6, J, "We were bare-handed, so our damage was low and we lost health fast. That's why we pulled back."),
        (67.6, 70.3, J, "Health is 14 now. Resupply first, then fight."),
        (72.4, 75.9, U, "Eat some bread to heal first. We'll go back once we've recovered."),
        (79.0, 82.0, J, "Eating first, then healing. No rush to go back."),
        (88.0, 90.5, U, "I'll walk this part. Keep watching for me."),
        (94.0, 97.1, J, "OK, you go. I'm keeping track of the goal and the materials."),
        (106.6, 109.2, U, "We have cobblestone and iron ingots."),
        (109.5, 112.5, U, "Stone sword or iron sword? You choose this time."),
        (119.0, 122.7, J, "The iron sword. It does more damage, but it uses up both iron ingots."),
        (125.0, 128.2, U, "OK. Make the one you said."),
        (131.7, 133.0, J, "OK, doing that."),
        (133.0, 136.9, U, "Do we have enough food? Don't burn our way out just for revenge."),
        (140.9, 144.6, J, "Health 20, hunger 20, and one bread left."),
        (147.1, 149.8, U, "I want to go back for revenge now. Are we ready?"),
        (153.8, 158.1, J, "Health is back and the iron sword is ready. Let's see where it is before we head out."),
        (169.3, 174.6, U, "Ready. Let's find that one. You open the gate and take over the fight."),
        (178.7, 181.1, J, "On it. Watching our health."),
        (181.8, 183.5, U, "Keep fighting. I'll watch the health for you."),
        (186.7, 189.4, J, "Staying on this one, and keeping our way out open."),
        (191.5, 194.2, J, "It's down. The same one as before!"),
        (194.2, 198.0, U, "We couldn't beat it earlier. Why did we win this time?"),
        (201.8, 204.6, J, "This time we'd eaten, our health was full, and we had the iron sword."),
        (204.6, 207.5, J, "It hits much harder than bare hands, so we took it down."),
        (209.7, 213.2, U, "What did it drop? How much health and food do we have left?"),
        (216.8, 220.7, J, "Health 13, hunger 17, and one bread left."),
        (223.0, 225.0, U, "Good, revenge taken."),
        (225.2, 228.1, U, "Next time, let's prepare first. I'll take it from here."),
        (231.6, 234.5, J, "OK, you go. I'm keeping track of the goal and the materials."),
    ],
    "omni-cs2": [
        (8.3, 12.0, J, "Nineteen seconds and still no plant. Don't push forward on your own."),
        (12.0, 16.9, J, "Full armor and an AK: hold the A ramp and wait for your team to rotate back."),
        (18.3, 20.6, U, "I just took one out. Can we hold the site?"),
        (21.9, 27.0, J, "You can hold it. Full armor, AK, on the site, forty seconds to go. Just stay steady."),
        (27.2, 32.7, J, "Nice! Three headshots in fifteen seconds. That was awesome."),
        (37.0, 39.9, U, "It's a pistol round. Which spot should I hold?"),
        (40.9, 46.6, J, "Hold mid doors. Full armor, knife out, you're in a safe spot. Lock down the mid crossing."),
        (53.1, 55.3, U, "Movement at mid doors. Should I fall back?"),
        (56.8, 62.5, J, "Not yet. It's 3 against 4, but with full armor and the USP, peek mid doors, take one, then pull back."),
        (64.0, 69.0, J, "Don't take the duel! Only nine bullets left. Fall back behind the site and wait for a crossfire."),
        (70.8, 75.7, J, "Great headshot! That USP shot was spot on, and it evens up the numbers."),
        (77.8, 80.8, U, "I'm dead. Was I too hasty just now?"),
        (80.9, 85.0, J, "A little. You were down to nineteen health and got finished off."),
        (85.0, 89.0, J, "Next time there's movement at mid doors, fall back behind the site first."),
        (89.2, 94.6, U, "So I'll buy a rifle this round. Do I keep holding A short?"),
        (94.8, 101.4, J, "No problem. Full armor and an M4A1-S: lock down the short stairs and wait for backup."),
        (101.6, 106.0, U, "I'm set up here. Will they come through short?"),
        (106.7, 114.3, J, "They might. You have a smoke grenade, so be ready to throw it."),
        (114.5, 118.4, U, "Both in short are dead. Where's the last one?"),
        (118.6, 126.1, J, "Can't see them. You still have a smoke: throw it, then hold the short stairs."),
        (127.0, 132.0, J, "Run! You're down to nineteen health. Fall back now and switch to your rifle."),
    ],
    "omni-lol": [
        (10.3, 15.3, J, "Clear the mid wave, then group up with your team. We're up 11 to 4: take objectives first, then push towers."),
        (17.3, 20.0, U, "I just solo-killed Qiyana. Can I push the tower now?"),
        (21.3, 26.7, J, "Go ahead. You're at about 1,600 health, healthy. Take the mid tower with this wave, then back off so you don't get chunked."),
        (28.0, 30.2, U, "So what do I buy when I go back?"),
        (31.3, 35.0, J, "Get Mercury's Treads. You're at full health at eleven minutes,"),
        (35.0, 38.7, J, "but champions like Qiyana will chase you down, and Mercs keep you alive."),
        (39.9, 45.7, J, "Start with Berserker's Greaves and a Recurve Bow: Yone's Q scales with attack speed. Don't rush Infinity Edge; finish it when you have the gold."),
        (46.6, 48.6, U, "Should I go mid and force a teamfight now?"),
        (50.2, 57.5, J, "Go for it. It's eleven minutes, we're well ahead on kills, and your health is enough. Start the fight together with your team."),
        (58.7, 60.7, U, "Can we take Baron after this fight?"),
        (62.0, 65.4, J, "Not yet. Baron doesn't spawn until 20 minutes."),
        (65.4, 69.2, J, "We're ahead on gold, so take dragon and the outer towers first, and fight for Baron when it's up."),
        (71.0, 73.0, U, "Can I just take the top tower?"),
        (74.4, 79.8, J, "Not yet, you only have 320 health. Back off behind the tower, recall to resupply, and push with an escort."),
        (86.3, 88.2, U, "I've recalled. Where do I go first?"),
        (89.7, 94.0, J, "Bottom lane first. Help your team control the wave there, then split-push later."),
        (100.4, 103.0, U, "How did Qiyana one-shot me?"),
        (104.4, 109.4, J, "Don't worry. Once you respawn, keep pushing your lane. We're up 14 to 6, a big lead."),
        (110.9, 115.5, J, "Watch how the jungle fight goes. We lead 14 to 6; if we win it, push the tower."),
        (132.9, 135.0, U, "So when I respawn, do I go split-push right away?"),
        (136.7, 139.7, J, "Help control the bottom wave first, then split-push."),
        (147.9, 152.5, J, "Nice! That kill was huge. It really opened up the game."),
        (153.2, 155.5, U, "Can I grab dragon now while we're ahead?"),
        (157.2, 161.7, J, "Yes. Clear the mid wave, then rotate with the team. Don't walk the jungle alone."),
        (169.4, 171.8, U, "Their Orianna is mid. Can I fight her?"),
        (173.2, 178.6, J, "Yes. You're level 11 with your ult up. Go in and poke, but don't get caught by Orianna's ult."),
        (183.0, 188.4, J, "Nice! That assist was key. Keep farming your lane until the team groups up."),
        (189.8, 191.8, U, "I have my ult this time. Can I just engage?"),
        (193.2, 196.0, J, "Hold off. Your health is too low and you'd get one-shot. Wait for the team."),
    ],
}


def stamp(seconds: float) -> str:
    millis = round(seconds * 1000)
    h, rem = divmod(millis, 3_600_000)
    m, rem = divmod(rem, 60_000)
    s, ms = divmod(rem, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    problems = []
    for slug, cues in SUBS.items():
        # A cue box narrower than the frame makes long lines wrap instead of
        # running into the edges. The top line is set as a line number:
        # Chrome does not wrap cues placed with a percentage (line:6%), and
        # clips everything after the first line.
        placement = " line:0" if slug in TOP_CUES else ""
        settings = f"{placement} position:50% size:84% align:center"
        lines = ["WEBVTT", ""]
        for index, (start, end, speaker, text) in enumerate(cues):
            if end <= start:
                problems.append(f"{slug} cue {index + 1}: ends before it starts")
            if index + 1 < len(cues) and cues[index + 1][0] < end:
                problems.append(f"{slug} cue {index + 1}: overlaps the next cue")
            if speaker not in (U, J):
                problems.append(f"{slug} cue {index + 1}: unknown speaker {speaker!r}")
            lines += [str(index + 1), f"{stamp(start)} --> {stamp(end)}{settings}", f"{speaker}: {text}", ""]
        (OUT / f"{slug}.en.vtt").write_text("\n".join(lines), encoding="utf-8")
        print(f"{slug}: {len(cues)} cues")
    if problems:
        sys.exit("\n".join(problems))


if __name__ == "__main__":
    main()
