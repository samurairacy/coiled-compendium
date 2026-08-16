/* js/data-mplus.js — the Mythic+ module: eight dungeons
   Load order: data-shared → data-mplus → data-raid → render → app.
   All five load with `defer`, which preserves this order. */

const DUNGEONS=[

/* ───────────────────────────── ALTAR OF FANGS ─────────────────────── */
{id:"altar-of-fangs",name:"Altar of Fangs",short:"Altar",banner:"altar-of-fangs",sigil:"i-fang",origin:"Midnight",isNew:true,
 timer:{v:"29 min",s:["bz_game","wh_dg"]},bosses:3,routing:"limited",
 blurb:"The season's only new dungeon, beneath the Vaults of Atal'Utek. Three bosses, venom everywhere, and a final encounter built entirely around a stack counter that kills you if it expires.",
 cov:"Three independent sources plus the Encounter Journal. The 29-minute timer is confirmed twice over — Blizzard's own figure and an independent written overview agree exactly.",cov2:true,
 dispels:{poison:3,magic:2,curse:0,disease:0,enrage:2,bleed:0},
 gates:[{t:"Destroy all six Caustic Mist Totems in the opening area to reach the first boss.",s:["tk_aof"]},
        {t:"Destroy four Infusion Totems and kill the Ascendant Serpent to open the exit from the mixture room.",s:["tk_aof"]}],
 buffs:[{n:"Unfinished Mixture",e:"+3% Versatility for the whole party, for the rest of the dungeon.",w:"Any player with 25 skill in Midnight Cooking or Alchemy",loc:"Back-left corner of the room after the second boss",s:["tk_aof"]}],
 loc:{zone:"The Coiled Isle, inside the Vaults of Atal'Utek",way:"/way #2509 47.2 67.6",tp:"Path of Venomous Evolution",lvl:90,note:"Three entrances into the Vaults on the Coiled Isle; the dungeon sits toward the north."},
 calls:{s:["wh_dg"],i:[["Piercing Hiss", "Primal Serpent", "T1"], ["Toxic Atrophy", "The Writhing Coil", "B2"], ["Mass Envenom", "Ula'tek's Chosen", "T3"]],d:[["Paralyzing Shots", "Twinfang Harrower", "T1"], ["Regurgitate", "Rav'i", "B1"], ["Envenom", "High Evolutionist", "T2"], ["Mass Envenom", "Ula'tek's Chosen", "T3 — only if the kick was missed"]],p:[["Ravenous Claws", "Ravenous Descendant", "T1"]]},
 rewards:[["Pattern: Snakeskin Lining","Tailoring","Zul'jan"]],
 killers:[
  {n:"Piercing Hiss",w:"Primal Serpent, opening area. A massive party-wide haste reduction if it resolves — and there are several of these mobs, so one player cannot cover them all. In practice it is the tank who dies first.",s:["tk_aof","tk_pool"]},
  {n:"Venom Burst",w:"Living Venom, final stretch. These explode on death. Killing them simultaneously will one-shot the group, and it frequently overlaps with the Toxic Surge channel.",s:["tk_aof"]},
  {n:"Ritual Venom expiry",w:"Zul'jan. Eight stacks that kill you outright if they run out. The whole encounter is a stack-management puzzle wearing a boss costume.",s:["tk_aof"]}],
 areas:[
  {n:"The Totem Grounds",mobs:[
   {n:"Twinfang Harrower",k:"lt",a:[
    {n:"Paralyzing Shot",t:["dot","debuff"],c:["magic","freedom"],r:["healer"],sev:2,e:"Magic damage-over-time and a ramping slow on two random players.",h:"A healer dispel covers one; spare magic dispels or a freedom effect cover the other. An immunity also clears it, and any movement-impairment removal works — Blessing of Freedom and Tiger's Lust are both named.",s:["tk_aof","iv_aof"]},
    {n:"Toxic Breath",t:["frontal"],c:["position"],r:["tank"],sev:2,e:"A frontal line towards the tank that then sweeps across.",h:"Face this mob away from the group and the sweep becomes trivial to dodge.",s:["tk_aof"]}]},
   {n:"Ravenous Descendant",k:"trash",a:[
    {n:"Ravenous",t:["enrage","stacking"],c:["soothe","cc","kite"],r:["tank","dps"],sev:2,e:"Auto-attacks stack a short-duration enrage that heavily empowers their melee swings.",h:"Soothe them, or use AoE slows and crowd control to buy a window for the stacks to fall off before re-engaging.",s:["tk_aof"]}]},
   {n:"Primal Serpent",k:"caster",a:[
    {n:"Piercing Hiss",t:["debuff","groupdmg"],c:["interrupt","cc"],r:["dps","healer","tank"],sev:3,e:"Party-wide haste reduction of roughly 30% if the cast completes.",h:"Assign one player per serpent before the pull. There are enough of these that a tank cannot solo-kick them.",s:["tk_aof","tk_pool"]},
    {n:"Venom Spit",t:["dot"],c:["poison","defensive"],r:["healer"],sev:1,e:"Random-target damage when they have nothing better to cast.",s:["tk_aof","iv_aof"]}]},
   {n:"Ritual Chieftain",k:"lt",a:[
    {n:"Unstable Totem",t:["totem","groupdmg"],c:["focus"],r:["dps"],sev:3,e:"Summons a totem that pulses party-wide damage until the Chieftain itself is dead.",h:"This is why the mob is the priority kill in the area, not just a source of one scary cast.",s:["iv_aof"]},
    {n:"Blood Sacrifice",t:["groupdmg","absorb"],c:["topoff"],r:["healer"],sev:3,e:"AoE damage plus a large healing absorb on all five players.",h:"The scariest AoE in the area. Chew through the absorb quickly or the follow-up damage lands on shields that are not there.",s:["tk_aof"]},
    {n:"Dismember",t:["tankbuster"],c:["defensive"],r:["tank"],sev:2,e:"A large hit of physical damage on the tank.",s:["tk_aof"]}]}]},
  {n:"The Evolution Halls",mobs:[
   {n:"High Evolutionist",k:"caster",a:[
    {n:"Envenom",t:["dot"],c:["poison"],r:["healer"],sev:1,e:"A bolt at a random player that also applies a poison damage-over-time.",h:"Safe to let some through if you have a poison dispel.",s:["tk_aof"]},
    {n:"Evolve",t:["channel","heal","shield"],c:["cc","focus"],r:["dps"],sev:3,e:"Heals the caster and transforms it, upgrading Envenom into Mass Envenom.",h:"Crowd control the channel if you can. Otherwise focus the mob and break its shield to stop the evolution.",s:["tk_aof"]}]},
   {n:"Rattling Wraith",k:"lt",a:[
    {n:"Rattle",t:["channel","groupdmg"],c:["unavoidable"],r:["healer"],sev:2,e:"Channelled heavy damage over the full duration. Not interruptible.",h:"Very dangerous stacked with any interrupt you missed elsewhere in the pull.",s:["tk_aof"]},
    {n:"Corrosive Fangs",t:["tankbuster","amp"],c:["defensive"],r:["tank"],sev:2,e:"Tank hit that applies a damage-taken amplifier.",s:["tk_aof"]}]},
   {n:"Bloodletter",k:"trash",a:[
    {n:"Bloodletting",t:["denial"],c:["cc","dodge"],r:["tank"],sev:1,e:"Drops puddles nearby on melee swings.",h:"Crowd control stops it landing a swing at all, which is cleaner than dancing round the puddles.",s:["tk_aof","iv_aof"]}]},
   {n:"Venom Leech",k:"fodder",a:[
    {n:"Septic Spatter",t:["death","denial"],c:["position"],r:["dps","tank"],sev:1,e:"These smaller mobs leave a patch of ground ichor where their corpse falls.",h:"Kill them somewhere you do not need to stand.",s:["iv_aof"]}]},
   {n:"Venomous Hatchling",k:"trash",a:[
    {n:"Fixate",t:["fixate","adds"],c:["cc","focus"],r:["dps"],sev:1,e:"Hatch from eggs in the area or on pulling certain packs, then fixate random players until destroyed.",h:"AoE slows and stuns keep their damage near zero while you cleave them down.",s:["tk_aof"]}]},
   {n:"Ascendant Serpent",k:"mini",a:[
    {n:"Infest",t:["dot","adds","spread"],c:["spread"],r:["dps","healer"],sev:2,e:"Circle and damage-over-time on every player, then spawns hatchlings and fixate mobs.",h:"Loosely spread so the circles do not cleave, then AoE the hatchlings down.",s:["tk_aof"]},
    {n:"Virulent Whirl",t:["denial"],c:["dodge"],r:["dps","healer","tank"],sev:1,e:"Spawns tornadoes that roam the area.",s:["tk_aof"]},
    {n:"Noxious Spray",t:["line","tankbuster","knockback"],c:["position","defensive"],r:["tank"],sev:2,e:"Line attack at the tank with significant pushback.",h:"Point it away from the group and fight the pushback with a defensive up.",s:["tk_aof"]}]}]},
  {n:"The Approach to Zul'jan",mobs:[
   {n:"Blade of the Altar",k:"fodder",a:[
    {n:"Laced Edge",t:["dot"],c:["defensive"],r:["healer"],sev:1,e:"Random-target hit and damage-over-time.",s:["tk_aof"]}]},
   {n:"Ula'tek's Chosen",k:"lt",a:[
    {n:"Mass Envenom",t:["groupdmg"],c:["interrupt"],r:["dps"],sev:3,e:"AoE hit on the party.",h:"Every single cast needs kicking.",s:["tk_aof"]},
    {n:"Toxic Surge",t:["channel","line","groupdmg"],c:["dodge","defensive"],r:["healer"],sev:2,e:"Channel that fires line attacks and pulses heavy damage throughout.",s:["tk_aof"]}]},
   {n:"Living Venom",k:"trash",a:[
    {n:"Venom Burst",t:["death","groupdmg"],c:["stagger","defensive"],r:["dps"],sev:3,e:"Explodes on death.",h:"Stagger the kills. Killing all of them at once will immediately wipe the group, and it is worse still if it overlaps Toxic Surge.",s:["tk_aof"]}]}]}],
 encounters:[
  {n:"Rav'i",o:1,img:"aof-ravi",sub:"Bone piles and a shield you cannot afford",shape:"One phase, cyclical",lv:2,brief:"One phase, but it never stops cycling. She feeds at whichever Carrion Pile is nearest, shielding herself and bleeding the party until that shield breaks — so the tank spends the whole fight steering her away from fresh meat while everyone else burns it off. Between feeds it is spread for Triple Shot and step out of the wave. Nothing escalates; it repeats until she dies.",a:[
   {n:"Ravenous Stomp",t:["groupdmg"],c:["unavoidable"],r:["healer"],sev:1,e:"Heavy Nature damage to all players, and breaks stalactites from the ceiling — each inflicts very heavy damage within 5 yards and STUNS for 2 seconds. Flying Twinfangs skewered by the falling rock are what drop Fresh Meat into the Carrion Piles.",h:"Neither guide mentions the stun or the falling rock. Do not be standing under a stalactite marker when this lands, and note the meat placement is not random — it follows the rocks.",s:["wh_ej","tk_aof"]},
   {n:"Scavenging",t:["shield","dot","soak"],c:["position","preposition"],r:["tank"],sev:3,t:["shield","dot","soak","noarmor"],e:"She feasts at the nearest Carrion Pile behind a shield that absorbs ALL damage, applying stacking Carrion Burst every 3 seconds until the shield breaks. If that pile holds Fresh Meat she enters Feeding Frenzy instead — same thing every 1.5 seconds — and gains Scent of Blood, +30% attack speed on the tank.",h:"Two jobs at once. The tank drags her to a clean pile; everyone else breaks the shield, because breaking it is the only thing that stops the damage.",s:["wh_ej","tk_aof","iv_aof"]},
   {n:"Triple Shot",t:["dot","spread"],c:["spread"],r:["dps","healer"],sev:2,e:"Globs of venom at 3 players: significant damage on impact plus moderate damage to anyone within 5 yards every second for 10 seconds.",h:"Loosely spread. The journal says three enemies, not tank-plus-two — so nobody is exempt.",s:["wh_ej","tk_aof"]},
   {n:"Regurgitate",t:["line","debuff","groupdmg"],c:["dodge","disease"],r:["dps","healer"],sev:2,e:"Three waves of stomach acid in lines toward a player: very heavy Nature damage, and anyone caught is slowed 50% AND has damage done reduced by 50%. The journal tags it Disease.",h:"Both creator guides call this a minor dodge. It is not: a 50% damage cut is a timer problem, and it is confirmed dispellable by the published assignment table — so the season has two dungeons where disease removal does real work, not one.",s:["wh_ej","wh_dg"]},
   {n:"Hydro Strike",t:["tankbuster"],c:["defensive"],r:["tank"],sev:2,e:"Her melee hits notably hard with this up.",s:["tk_aof"]}]},
  {n:"The Writhing Coil",o:2,img:"aof-the-writhing-coil",sub:"Split it apart, and whatever the pieces have left is what comes back",shape:"Boss and split intermission",lv:3,brief:"A two-part loop rather than a health-gated fight. It alternates between the boss and an intermission where it splits into five Uncoiled Writhes, and the health they have left when they reform is the health it comes back with — so the intermission is where the fight is won or lost. Interrupts must cover Toxic Atrophy in both halves, which is what makes it awkward with a thin kick roster.",a:[
   {n:"Synchronized Venom",t:["dot","groupdmg"],c:["unavoidable"],r:["healer"],sev:2,e:"Party debuff early in the boss phase that ticks for most of its duration.",s:["tk_aof"]},
   {n:"Toxic Atrophy",t:["debuff"],c:["interrupt"],r:["dps"],sev:3,e:"Toxic Barrage prepares three castings in succession. Each landing reduces party damage done by 20% and movement speed by 20%, and it stacks.",h:"All three need kicking. Three of the five split adds cast it too — plan interrupt cooldowns across both phases.",s:["tk_aof"]},
   {n:"Vindictive Onslaught",t:["line","frontal"],c:["dodge","position"],r:["dps","healer"],sev:2,e:"Burrowing Charge line attack on a random player, immediately followed by the Venom Jet frontal.",h:"Step out of the line, then point the frontal away if you can.",s:["tk_aof"]},
   {n:"Tail Scythe",t:["tankbuster"],c:["defensive"],r:["tank"],sev:1,e:"Massive Physical damage on the tank. Both guides call this mild; it is the largest single tank hit on the encounter.",s:["wh_ej","tk_aof"]},
   {n:"Death Rattle",t:["channel","groupdmg"],c:["position","mobility"],r:["dps","healer","tank"],sev:3,t:["channel","groupdmg","stacking"],e:"Light Physical damage every second, gaining an extra application every second until pulled apart. Orweyna attaches Vine Grip to all players; every attached player moving 10 yards further out triggers Uncoil, which itself hits for heavy damage.",h:"Save a movement ability for this. Every second someone is slow to pull is damage the healer eats.",s:["tk_aof"]},
   {n:"Uncoil",t:["adds","fixate"],c:["cc","focus"],r:["dps"],sev:2,t:["adds","fixate","myth"],e:"The boss splits into Uncoiled Writhes, each carrying a portion of its health. After 20 seconds they cast Assimilation and it reforms with their COMBINED remaining health — so this is not a damage-transfer phase, it is the boss's health bar. The journal states plainly that they are susceptible to crowd control. Spiteful Hunt, the fixate, is Mythic only.",h:"Group them, lock them down, and pop damage cooldowns — this is the phase your damage counts double.",s:["tk_aof"]},
   {n:"Undermining",t:["line"],c:["position"],r:["dps","healer","tank"],sev:1,e:"Each Uncoil destabilises the earth WHERE IT DIES, knocking back anyone above it.",h:"Both guides describe this as shockwave lines forming from the centre at the end of the phase. The journal says it is per-add, on death, under your feet. Kill them where you can afford a knockback.",s:["wh_ej"]}]},
  {n:"Zul'jan",o:3,img:"aof-zuljan",sub:"A stack counter that kills you if it empties",shape:"One phase, 50-second ritual loop",lv:3,brief:"One arena, one fifty-second loop, and everything orbits a stack counter. The ritual opens the fight and then repeats: intercept a beam, take eight stacks of Ritual Venom, and spend the next fifty seconds keeping them topped up before they expire on you. Boneslicer and the spinning axes are how you clear stacks, and every clear drops a puddle you then have to work around. Hard to learn, extremely rhythmic once you have.",a:[
   {n:"Ritual of the Fang",t:["soak","groupdmg"],c:["preposition","soak"],r:["dps","healer","tank"],sev:3,e:"An 8-second channel. Unintercepted, he gains Fang Empowered — significant damage to all players every second, stacking. Intercepting a beam deals moderate damage per second to the soaker and applies Ritual Venom.",h:"Pre-position on the lines before you engage, and return to the same line every time the ritual repeats. Consistency beats cleverness here.",s:["tk_aof"]},
   {n:"Ritual Venom",t:["stacking","debuff"],c:["unavoidable"],r:["dps","healer","tank"],sev:3,t:["stacking","debuff","myth"],e:"Dormant toxins for 50 seconds. On expiry the venom bursts for very heavy Nature damage. It only stacks on Mythic.",h:"The creator guide says expiry kills you outright. The journal says it bursts for damage — which at high keys amounts to the same thing with eight stacks up, but it means a single stack is survivable.",s:["wh_ej","tk_aof"]},
   {n:"Bloodletting",t:["debuff","denial"],c:["position"],r:["dps","healer","tank"],sev:2,e:"Zul'jan's Physical abilities make you hemorrhage, removing applications of Ritual Venom and leaving blood pools that deal significant Nature damage every second.",h:"The puddles are the real constraint. Clear stacks away from the beam lines or you cannot soak the next ritual.",s:["tk_aof"]},
   {n:"Boneslicer",t:["line","dot"],c:["position"],r:["dps","healer"],sev:2,t:["line","dot","noarmor"],e:"Heavy damage to everyone in the axe's path plus moderate damage every second for 7 seconds, ignoring armour. Each tick removes a stack, so one hit clears all eight.",h:"The intended clear method for most players. Get hit by one of the two and you survive — but do not send everyone at once or the healer drowns in the dot.",s:["tk_aof"]},
   {n:"Chop Down",t:["tankbuster"],c:["defensive","position"],r:["tank"],sev:2,e:"Two strikes of massive Physical damage, which also clear stacks and therefore drop puddles.",h:"Tanks have to think about puddle placement on their own buster. Do not take it standing on a beam line.",s:["tk_aof"]},
   {n:"Axegrinder",t:["denial"],c:["dodge"],r:["dps","healer","tank"],sev:1,t:["denial","noarmor"],c:["dodge","soak"],e:"Spinning axes that ricochet around the arena for up to significant damage x5, ignoring armour, doing less damage as they lose speed.",h:"Settled by the journal: Bloodletting triggers on Zul'jan's Physical abilities and these are Physical, so they DO clear Ritual Venom. That makes them your backup when Boneslicer is aimed at someone else — and a slowed, ricocheting axe is a cheap clear.",s:["wh_ej","iv_aof"]}]}],
loot:{s:["iv_aof"],i:[
  {n:"Hydraspine Twinblade",ic:"inv_glaive_1h_outdooramaniloa_c_01",id:273793,sl:"One-hand",ty:"Warglaive",b:"Rav'i",p:["Agi","Int"],x:[["Mastery",5],["Vers",4]]},
  {n:"Venom-Etched Crescent",ic:"inv_axe_1h_outdooramaniloa_c_01",id:273780,sl:"One-hand",ty:"Axe",b:"Rav'i",p:["Int"],x:[["Crit",5],["Mastery",5]]},
  {n:"Primordial Robe of Rites",ic:"inv_robe_cloth_outdooramaniloa_c_01",id:273785,sl:"Chest",ty:"Cloth",b:"Rav'i",p:["Int"],x:[["Haste",10],["Mastery",9]]},
  {n:"Hydra Scale Wristguards",ic:"inv_bracer_mail_outdooramaniloa_c_01",id:273775,sl:"Wrist",ty:"Mail",b:"Rav'i",p:["Agi","Int"],x:[["Mastery",6],["Vers",5]]},
  {n:"Poison-Proof Stompers",ic:"inv_boot_plate_outdooramaniloa_c_01",id:273777,sl:"Feet",ty:"Plate",b:"Rav'i",p:["Str","Int"],x:[["Haste",8],["Vers",7]]},
  {n:"Coiled Fangstone",ic:"inv_121_trinket_dungeon_ulatek_fangstone",id:273795,sl:"Trinket",ty:"Trinket",b:"Rav'i",p:["Str"],u:"Unleash 3 Envenomed Bites centered on your target, inflicting a total Nature damage split between nearby enemies. Damage increased by 30% per additional enemy, up to 150%. (1 Min Cooldown)",ro:["mdps"]},
  {n:"Vile Vial of Volatile Venom",ic:"inv_121_trinket_dungeon_ulatek_vile",id:273796,sl:"Trinket",ty:"Trinket",b:"Rav'i",p:["Str","Agi","Int"],u:"Take a small sip of venom, gaining a random secondary stat for 15 sec. Afterwards, a random secondary stat is reduced for 15 sec. (2 Min Cooldown)",ro:["tank","healer","rdps","mdps"]},
  {n:"Toxin-Coated Warstaff",ic:"inv_staff_2h_outdooramaniloa_c_01",id:273783,sl:"Two-hand",ty:"Staff",b:"The Writhing Coil",p:["Agi"],x:[["Haste",11],["Mastery",8]]},
  {n:"Vile Writhefang Glaive",ic:"inv_polearm_2h_outdooramaniloa_c_01",id:273782,sl:"Two-hand",ty:"Polearm",b:"The Writhing Coil",p:["Str"],x:[["Crit",11],["Haste",9]]},
  {n:"Nocuous Focal Fang",ic:"inv_offhand_1h_outdooramaniloa_c_01",id:273779,sl:"Off-hand",ty:"Off-hand",b:"The Writhing Coil",p:["Int"],x:[["Crit",5],["Haste",4]]},
  {n:"Strand of Warding Fangs",ic:"inv_121_jewelry_neck03_teal",id:273781,sl:"Neck",ty:"Neck",b:"The Writhing Coil",x:[["Crit",16],["Haste",12]]},
  {n:"Snakeskin Spaulders",ic:"inv_shoulder_leather_outdooramaniloa_c_01",id:273774,sl:"Shoulder",ty:"Leather",b:"The Writhing Coil",p:["Agi","Int"],x:[["Crit",9],["Vers",6]]},
  {n:"Aged Interwoven Scaleplate",ic:"inv_chest_plate_outdooramaniloa_c_01",id:273787,sl:"Chest",ty:"Plate",b:"The Writhing Coil",p:["Str","Int"],x:[["Crit",10],["Vers",9]]},
  {n:"Leggings of Entwined Serpents",ic:"inv_pant_cloth_outdooramaniloa_c_01",id:273786,sl:"Legs",ty:"Cloth",b:"The Writhing Coil",p:["Int"],x:[["Crit",11],["Haste",9]]},
  {n:"Knot of Writhing Serpents",ic:"inv_121_trinket_dungeon_ulatek_writhe",id:273794,sl:"Trinket",ty:"Trinket",b:"The Writhing Coil",p:["Int"],e:"Your harmful spells have a chance to ensorcell a serpent into spewing venom at your target, inflicting Nature damage split between nearby enemies. Damage increased by 30% per additional enemy, up to 150%. The primary target also suffers an additional Nature damage over 15 sec.",ro:["rdps"]},
  {n:"Polished Lightwood Channeler",ic:"inv_knife_1h_zuljin_d_01",id:273778,sl:"One-hand",ty:"Dagger",b:"Zul'jan",p:["Int"],x:[["Haste",5],["Mastery",4]],e:"Your damaging spells have a chance to launch a mote of light towards your target, inflicting Holy damage split among nearby enemies. Damage increased by 30% per additional enemy, up to 150%."},
  {n:"Sharpened Lightwood Slasher",ic:"inv_knife_1h_zuljin_d_01",id:275070,sl:"One-hand",ty:"Dagger",b:"Zul'jan",p:["Agi"],x:[["Crit",31],["Haste",23]],e:"Your damaging attacks and abilities have a chance to sear your target for Holy damage."},
  {n:"Ancestral Amani Recurve",ic:"inv_bow_1h_outdooramaniloa_c_01",id:273784,sl:"Ranged",ty:"Bow",b:"Zul'jan",p:["Agi"],x:[["Haste",11],["Mastery",8]]},
  {n:"Spare Speaker's Hood",ic:"inv_helm_leather_outdooramaniloa_c_01",id:273791,sl:"Head",ty:"Leather",b:"Zul'jan",p:["Agi","Int"],x:[["Haste",11],["Crit",8]]},
  {n:"Chestguard of Corroded Scales",ic:"inv_chest_mail_outdooramaniloa_c_01",id:273789,sl:"Chest",ty:"Mail",b:"Zul'jan",p:["Agi","Int"],x:[["Haste",10],["Crit",9]]},
  {n:"Handwraps of Blasphemous Rites",ic:"inv_glove_cloth_outdooramaniloa_c_01",id:273773,sl:"Hands",ty:"Cloth",b:"Zul'jan",p:["Int"],x:[["Mastery",8],["Crit",7]]},
  {n:"Ancient General's Obsidian Pillars",ic:"inv_pant_plate_outdooramaniloa_c_01",id:273776,sl:"Legs",ty:"Plate",b:"Zul'jan",p:["Str","Int"],x:[["Crit",10],["Haste",9]]},
  {n:"Band of the Amani Warlord",ic:"inv_121_jewelry_ring02_green",id:273792,sl:"Ring",ty:"Ring",b:"Zul'jan",x:[["Haste",17],["Crit",10]]},
  {n:"Tattered Amani War Banner",ic:"inv_121_trinket_dungeon_ulatek_banner",id:273797,sl:"Trinket",ty:"Trinket",b:"Zul'jan",p:["Str","Agi"],u:"Plant the banner for 15 sec! Fighting within 12 yards of it fills you with Battle Fervor, granting your highest secondary stat. Defeating at least 1 enemy while the banner stands will extend Banner's duration by 5 sec. (1 Min, 30 Sec Cooldown)",ro:["mdps"]}]},
 route:[
  {n:1,t:"Opening lust pull",m:"Primal Serpents, Twin Fang Harrowers, Ravenous Descendants",d:2,lust:true,p:"One kick assigned to each Primal Serpent; cover the rest with crowd control. They die fast enough under lust that the haste debuff never lands.",s:["tk_rt"]},
  {n:2,t:"Totem sweep",m:"Ravenous Descendants pulled forward",d:1,p:"Tag the extra Descendants into this pull to raise the count and keep the later pack from stacking six of them at once.",s:["tk_rt"]},
  {n:3,t:"Harrower split",m:"Twinfang Harrower",d:1,p:"Taunt one Harrower from range without proccing any abilities and it pulls apart from its pair. Worked for the whole PTR and makes the pack dramatically easier.",s:["tk_rt"]},
  {n:4,t:"Down to Rav'i",m:"Remaining totem guards",d:2,p:"Finish the six totems, then drop into the arena.",s:["tk_rt"]},
  {n:5,t:"Boss exit pull",m:"Evolution Halls trash",d:2,p:"Tag from across the central altar and drag into the corner for safety.",s:["tk_rt"]},
  {n:6,t:"Run through",m:"Rattling Wraiths and casters",d:2,p:"Run the middle, pull back to the caster, then into the boss room.",s:["tk_rt"]},
  {n:7,t:"Mixture room, first half",m:"Infusion totem guards",d:2,p:"Split into two pulls to keep the kick count manageable. One pull is possible if you have the interrupts.",s:["tk_rt"]},
  {n:8,t:"Ascendant Serpent",m:"Mini-boss",d:2,p:"Grab the Unfinished Mixture buff before you leave the room.",s:["tk_rt"]},
  {n:9,t:"Final approach",m:"Blades of the Altar, Ula'tek's Chosen, Living Venom",d:3,p:"Pull a few Blades into each pack. Be very careful killing the Living Venom while the Chosen are AoEing — stagger them.",s:["tk_rt"]}],
 reads:[{t:"Routing is limited — a lot of required mobs, either to spawn bosses or to open the way. Fine as a dungeon type, but not one where you will see much route variation.",by:"Tactyks",d:"2026-07-25",s:["tk_pool"]},
        {t:"The Piercing Hiss interrupt is the wrong kind of DPS-responsibility mechanic: when it goes off, the tank dies and the DPS who missed it is mildly inconvenienced.",by:"Tactyks",d:"2026-07-25",s:["tk_pool"]}]},

/* ───────────────────────────── MURDER ROW ─────────────────────────── */
{id:"murder-row",name:"Murder Row",short:"Murder Row",banner:"murder-row",sigil:"i-dagger",origin:"Midnight",
 timer:{v:"34 min",s:["wh_dg"]},bosses:4,routing:"limited",
 blurb:"Silvermoon's underbelly, held back from Season 1 and still carrying its divisive tavern event. Starts as blood elves and criminals, ends as a demon problem.",
 cov:"Three independent sources plus the Encounter Journal. Timer confirmed at 34 minutes — the most generous in the pool, which is worth knowing before you panic at the tavern event.",cov2:true,
 dispels:{poison:3,magic:2,curse:2,disease:0,enrage:2,bleed:3},
 gates:[{t:"Interrogate all four snitches, spread across the buildings of the opening area. Their locations are now static rather than random.",s:["tk_mr"]},
        {t:"Complete the tavern event to a five-star rating to progress past the first boss.",s:["tk_mr"]},
        {t:"Speak to Belath Dawnblade first and take the Disguised option, or you are thrown out and cannot climb the stairs.",s:["iv_mr"]},
        {t:"The tavern event assigns four roles at random. Bouncer removes Rowdy Patrons who stomp the ground; Cleaner mops the green ichor; Server delivers cheese, steak or wine to whichever NPC signals for it; Entertainer steps through ground puddles in sequence.",s:["iv_mr"]}],
 buffs:[{n:"Vendor items",e:"One-time purchases activated from the extra action button, with no duration once bought — so they can be held for a dangerous pull. Felwyrm Egg gives 15% haste for 30 seconds and is the strongest of the set; Loaded Pistol (found just right of the boss) adds burst; Heartstop Poison is decent against lieutenants; Felstone gives the party 50% movement speed for 15 seconds and is the weakest.",w:"Bought with Fel Contraband shards, glowing near the snitches",loc:"Vendors spread across the opening area",s:["tk_mr","iv_mr"]},
        {n:"Five-star review",e:"+10% damage and healing to the party for 4 minutes.",w:"Everyone — complete the tavern event",loc:"The bar, after the first boss",s:["tk_mr"]}],
 loc:{zone:"Silvermoon City",way:"/way #2393 56.2 61.1",tp:"Path of the Devious Smuggler",lvl:90,note:"The longest timer in the pool."},
 calls:{s:["wh_dg"],i:[["Fel Missiles", "Felonious Mage", "T1"], ["Seduction", "Seductive Sayaad", "T1"], ["Felstorm", "Kystia Manaheart's mirrors", "B1"], ["Fel Rage", "Wrathguard Flayer", "T3"], ["Health Funnel", "Fel Invoker", "T3"], ["Chaos Bolt", "Lithiel Cinderfury", "B4"]],d:[["Seduction", "Seductive Sayaad", "T1 — only if the kick was missed"], ["Corroding Spittle", "Massive Felwyrm", "T1"], ["Corroding Spittle", "Nibbles", "B1"], ["Heartstop Poison", "Zaen Bladesorrow", "B2"], ["Murder in a Row", "Zaen Bladesorrow", "B2 — the bleed is cleansable"], ["Curse of Doom", "Corrupted Warlock", "T3"]],p:[["Back to Work!", "Keen Taskmaster", "T2"], ["Fel Rage", "Wrathguard Flayer", "T3 — only if the kick was missed"]]},
 rewards:[["Plans: Murder Row Fleet Feet","Blacksmithing","Lithiel Cinderfury"],["Plans: Murder Row Fishhook","Blacksmithing","Lithiel Cinderfury"],["Formula: Smuggler's Enchanted Edge","Enchanting","Lithiel Cinderfury"],["Pattern: Row Walker's Insurance","Leatherworking","Lithiel Cinderfury"]],
 killers:[
  {n:"Legion Strike",w:"Xathuux the Annihilator. A tank frontal that applies an eight-second healing reduction. You need a defensive that covers the whole window, not a big heal at the end of it.",s:["tk_mr"]},
  {n:"Curse of Doom",w:"Corrupted Warlock. If the targeted player dies to the unsoaked hit, a Doomguard spawns with a large health pool and spams bolts. A curse dispel deletes the problem outright.",s:["tk_mr"]},
  {n:"Blade Dance",w:"Felmaster Lucsei. A stacking party damage-over-time that becomes lethal the moment it overlaps anything else you have pulled.",s:["tk_mr"]}],
 areas:[
  {n:"The Row",mobs:[
   {n:"Row Hooligan",k:"fodder",a:[
    {n:"Cut Purse",t:["dot"],c:["bleedcl","defensive"],r:["healer"],sev:1,e:"Bleed on a random player.",s:["tk_mr"]}]},
   {n:"Felonious Mage",k:"caster",a:[
    {n:"Fel Missiles",t:["channel"],c:["interrupt","cc"],r:["dps"],sev:2,e:"Channels into a random player.",h:"Crowd control also works and forces a re-target.",s:["tk_mr"]}]},
   {n:"Bribed Guard",k:"lt",a:[
    {n:"Glaive Toss",t:["dot"],c:["bleedcl"],r:["tank","healer"],sev:2,e:"Starts on the tank, bounces to other players, and leaves a bleed on the tank specifically.",s:["tk_mr"]},
    {n:"Shield Bash",t:["tankbuster","amp","stacking"],c:["defensive","kite"],r:["tank"],sev:3,e:"Physical hit that stacks a damage-taken increase on the tank.",h:"Dangerous in combination with the Glaive Toss bleed. Watch the stack count rather than the health bar.",s:["tk_mr"]}]},
   {n:"Bribed Captain",k:"lt",a:[
    {n:"Deep Corruption",t:["debuff"],c:["focus"],r:["dps"],sev:2,e:"Passive. Your AoE damage is reduced while this mob lives.",h:"Focus it down first or the whole pull takes twice as long.",s:["tk_mr"]}]},
   {n:"Street Sneak",k:"trash",a:[
    {n:"Heartstop Poison",t:["dot","debuff"],c:["poison"],r:["tank","healer"],sev:2,e:"Applies a poison to the tank carrying significant maximum-health reduction.",h:"One of the two dungeons where a poison dispel is doing direct tank-survival work.",s:["tk_mr"]}]},
   {n:"Seductive Sayaad",k:"trash",a:[
    {n:"Seduction",t:["channel"],c:["interrupt","cc"],r:["dps"],sev:1,e:"Channels into a random player.",h:"Interrupt it, or let it start and crowd control to break the channel.",s:["tk_mr"]}]},
   {n:"Massive Felwyrm",k:"mini",a:[
    {n:"Over-infused",t:["groupdmg","death"],c:["unavoidable"],r:["healer"],sev:2,e:"Constantly pulses party damage, and leaves a large AoE on death.",s:["tk_mr"]},
    {n:"Corroding Spittle",t:["dot"],c:["magic"],r:["healer"],sev:1,e:"Magic damage-over-time on a random player.",s:["tk_mr"]}]}]},
  {n:"The Warehouse",mobs:[
   {n:"Warehouse Worker",k:"fodder",a:[
    {n:"Sharp Nails",t:["dot"],c:["bleedcl"],r:["healer"],sev:1,e:"Random-target hit and bleed.",h:"Bleeds are everywhere in this dungeon. A cleanse earns its slot here.",s:["tk_mr"]}]},
   {n:"Keen Taskmaster",k:"trash",a:[
    {n:"Back to Work",t:["enrage"],c:["soothe"],r:["dps","tank"],sev:2,e:"Enrages every nearby Warehouse Worker for additional attack speed.",h:"You will be pulling a lot of workers at once here, so this matters more than it reads.",s:["tk_mr"]}]}]},
  {n:"The Demon Quarter",mobs:[
   {n:"Shivan Punisher",k:"lt",a:[
    {n:"Punishing Might",t:["stacking","amp"],c:["defensive"],r:["tank"],sev:2,e:"Every time they miss, their next hit deals more damage. Several misses in a row is genuinely frightening.",h:"An unusual anti-avoidance mechanic. Worth testing whether an avoidance-heavy tank actually feeds it.",s:["tk_mr"]},
    {n:"Demonic Frenzy",t:["enrage","groupdmg"],c:["focus"],r:["dps"],sev:3,e:"At 50% health they pulse damage until killed, and hit the tank harder.",h:"Everyone swaps the moment it triggers.",s:["tk_mr"]}]},
   {n:"Wrathguard Flayer",k:"trash",a:[
    {n:"Fel Rage",t:["enrage","shield"],c:["interrupt","soothe"],r:["dps"],sev:2,e:"Grants a large damage reduction and crowd-control immunity.",h:"It is an enrage, so a soothe works and frees your interrupt for something else.",s:["tk_mr"]},
    {n:"Flay",t:["dot"],c:["bleedcl"],r:["healer"],sev:1,e:"Bleed on a random player.",s:["tk_mr"]}]},
   {n:"Trained Fel Hunter",k:"fodder",a:[
    {n:"Shadow Bite",t:["tankbuster"],c:["defensive"],r:["tank"],sev:1,e:"Passive. Adds magic damage to their melee swings — dangerous when several are on you at once.",s:["tk_mr"]}]},
   {n:"Unleashed Imp",k:"trash",a:[
    {n:"Felfire Burst",t:["groupdmg"],c:["interrupt"],r:["dps"],sev:2,e:"Cast by the imps that accompany the demon packs.",s:["iv_mr"]}]},
   {n:"Defiled Golem",k:"lt",a:[
    {n:"Defiled Slam",t:["tankbuster"],c:["defensive"],r:["tank"],sev:2,e:"Heavy hit; guards the approach to the final boss.",s:["iv_mr"]},
    {n:"Fel Beam",t:["line"],c:["dodge"],r:["dps","healer"],sev:2,e:"Beam to run away from.",s:["iv_mr"]}]},
   {n:"Fel Invoker",k:"caster",a:[
    {n:"Health Funnel",t:["channel","heal"],c:["interrupt","cc"],r:["dps"],sev:2,e:"Channels healing into another mob.",s:["tk_mr"]}]},
   {n:"Corrupted Warlock",k:"caster",a:[
    {n:"Drain Life",t:["channel"],c:["drop","defensive"],r:["healer"],sev:2,e:"Channels into a random target and cannot be interrupted.",h:"A combat drop cancels it outright. Otherwise it is a defensive.",s:["tk_mr"]},
    {n:"Dark Pact",t:["shield"],c:["focus"],r:["dps"],sev:1,e:"Sacrifices some health for a fairly large shield. Multiple casts keep them alive a long time.",s:["tk_mr"]},
    {n:"Curse of Doom",t:["soak","adds"],c:["curse","soak"],r:["healer","dps"],sev:3,e:"Places a soak on a random player. If the player dies to it, a Doomguard spawns with a large health pool.",h:"Dispelling the curse removes it entirely. Without a curse dispel the whole group soaks.",s:["tk_mr"]}]},
   {n:"Felmaster Lucsei",k:"mini",a:[
    {n:"Blade Dance",t:["dot","stacking","groupdmg"],c:["defensive"],r:["healer"],sev:3,e:"Stacks a damage-over-time on the whole party.",h:"Lethal if it overlaps anything else. Hold a party cooldown for it.",s:["tk_mr"]},
    {n:"Eye Beam",t:["frontal"],c:["position","dodge"],r:["tank"],sev:2,e:"Frontal that shoots towards the tank.",h:"Point him away and then step out of it yourself.",s:["tk_mr"]}]}]}],
 encounters:[
  {n:"Kystia Manaheart",o:1,img:"mr-kystia-manaheart",sub:"Burn Nibbles, not the boss",shape:"Three burn windows",lv:2,brief:"A burn-window fight in disguise. She sits behind an 80% damage reduction and cannot be meaningfully hurt until you drain the fel out of Nibbles, who then turns on her — stunning her for twenty seconds at heavily increased damage taken. That window is the fight, three times over, and her shield cap drops with each one. Everything between windows is survival.",a:[
   {n:"Fel Shield",t:["shield"],c:["focus"],r:["dps"],sev:3,e:"Illicit Infusion keeps Nibbles hostile while she is above 20% health, and Felshield cuts Kystia's damage taken by 80%. Drain the fel from Nibbles and she reverts to her LIGHT form and turns on Kystia: Light Infusion stuns Kystia for 20 seconds, increases all damage she takes by 115%, weakens Felshield, and pulses moderate Chaos damage to the party throughout.",h:"Neither guide explains that Nibbles becomes your ally rather than simply dying. You are not killing a pet, you are freeing one — and the 115% window is where the entire fight happens.",s:["wh_ej","tk_mr","iv_mr"]},
   {n:"Chaos Barrage",t:["groupdmg"],c:["unavoidable"],r:["healer"],sev:2,e:"Spammed at the tank, then jumps to other players for reduced damage. The main source of group damage.",s:["tk_mr"]},
   {n:"Corroding Spittle",t:["dot"],c:["magic"],r:["healer"],sev:1,e:"Magic damage-over-time.",s:["tk_mr"]},
   {n:"Fel Spray",t:["frontal"],c:["position","dodge"],r:["tank"],sev:2,e:"Frontal that starts on the tank and sweeps across the room.",h:"Point Nibbles away from the group and this becomes easy.",s:["tk_mr"]},
   {n:"Fel Nova",t:["denial"],c:["dodge"],r:["dps","healer"],sev:1,t:["denial","knockback"],e:"She teleports to a random player's location and detonates for very heavy Fire damage, knocking players back.",h:"Confirmed by the journal against the creator guide, which placed it on the boss. Run out and watch where the knockback sends you.",s:["wh_ej","iv_mr"]},
   {n:"Mirror Images",t:["adds","groupdmg"],c:["interrupt","cc","spread"],r:["dps"],sev:2,e:"Copies of herself, each channelling Felstorm for light Fire damage to all nearby players every second. The channel is interruptible.",h:"Spread out and cover them fast — every second is party damage.",s:["tk_mr"]}]},
  {n:"Zaen Bladesorrow",o:2,img:"mr-zaen-bladesorrow",sub:"Barrel economy",shape:"One phase, resource management",lv:2,brief:"One phase with an economy problem. He throws barrels, and those barrels are your cover for Murder in a Row, which shoots everyone in his line of sight. Fire Bombs destroy barrels, so the group has to spend them deliberately — take out the fel-infused freight, leave enough ordinary crates standing to hide behind. Burn too many and somebody eats the line in the open.",a:[
   {n:"Same-Day Delivery",t:["groupdmg","denial"],c:["focus"],r:["dps"],sev:2,t:["groupdmg","denial","myth"],e:"Warehouse workers hurl Forbidden Freight for very heavy Fire damage and a knockback. The crates are your cover. On Mythic they are Fel-Infused, ticking moderate damage to the party every 3 seconds while they stand — and on Heroic and above, one struck by Fire Bomb or Murder in a Row explodes 5 seconds later.",s:["tk_mr"]},
   {n:"Fire Bomb",t:["denial"],c:["position"],r:["dps","healer"],sev:2,e:"AoE on two random players that explodes after a short delay, destroying barrels it touches.",h:"One targeted player takes out the fel freight. The other must avoid clipping the normal barrels — you need those.",s:["tk_mr"]},
   {n:"Murder in a Row",t:["line","dot"],c:["los","immune","position"],r:["dps","healer","tank"],sev:3,t:["line","dot","noarmor"],e:"At 100 energy he takes aim and shoots every player IN HIS LINE OF SIGHT for very heavy Physical damage plus massive bleed damage over 15 seconds. Cover breaks the line of sight, and the bleed itself is cleansable if someone has to eat the shot.",h:"Everyone picks a barrel, making sure the second fel freight is one that gets hit. If you have burned too many, the tank or a player with an immunity takes it in the open alone.",s:["tk_mr"]},
   {n:"Killing Spree",t:["channel","groupdmg"],c:["unavoidable"],r:["healer"],sev:2,e:"Moderate Physical damage to all players every half second for 3 seconds, ignoring armour.",s:["wh_ej"]},
   {n:"Envenom",t:["tankbuster","dot","debuff"],c:["poison","defensive"],r:["tank","healer"],sev:2,e:"Very heavy Physical damage plus Heartstop Poison: maximum health reduced by 30% and massive Nature damage over 15 seconds. The same poison the Street Sneaks apply.",h:"A 30% max-health cut on the tank going into any other damage is the death here. This is the poison dispel that matters most in the dungeon.",s:["wh_ej","tk_mr"]}]},
  {n:"Xathuux the Annihilator",o:3,img:"mr-xathuux-the-annihilator",sub:"A small circle that keeps getting smaller",shape:"One phase, escalating denial",lv:2,brief:"One phase in a room that gets physically smaller. Demonic Rage lays puddles under him every second for fifteen seconds and they last two minutes, so by the third cast most of the arena is gone unless the tank has been overlapping them. Legion Strike is the sharp end — an eight-second window at 80% reduced healing, which is a defensive problem rather than a healing one.",a:[
   {n:"Legion Strike",t:["tankbuster","frontal","healred"],c:["defensive","position"],r:["tank"],sev:3,e:"Massive Physical damage and REDUCES HEALING RECEIVED BY 80% FOR 8 SECONDS.",h:"Confirmed by the journal, and worse than either guide implied. Eighty percent for eight seconds is the single most punishing tank window in the pool — a defensive that reduces damage works, a plan that relies on being healed through it does not.",s:["wh_ej","tk_mr"]},
   {n:"Axe Toss",t:["denial","adds"],c:["stack","focus"],r:["dps"],sev:2,e:"Heavy Chaos damage to anyone within 60 yards of the impact, then the axe sits there channelling Fel Lightning at ALL players for light damage every second, stacking, until destroyed.",h:"Run into melee when targeted so everyone can cleave it immediately.",s:["tk_mr"]},
   {n:"Infernal Crash",t:["spread"],c:["spread"],r:["dps","healer"],sev:2,e:"Eight-yard AoE around every player, with heavy impact worth a defensive.",h:"Loosely spread. If the axe is still up during this, use party cooldowns.",s:["tk_mr"]},
   {n:"Demonic Rage",t:["groupdmg","amp","denial"],c:["position"],r:["tank","dps"],sev:3,e:"Large party hit, +75% attack speed, and he takes 30% more damage while dropping puddles under himself every second for 15 seconds. Puddles last two minutes, so the first set expires around the third cast.",h:"Tanks move him slowly and overlap the puddles so less than half the room is gone each time. Everyone else lines up damage cooldowns for the amp.",s:["tk_mr"]}]},
  {n:"Lithiel Cinderfury",o:4,img:"mr-lithiel-cinderfury",sub:"Add control in a room that is on fire",shape:"One phase, constant add control",lv:3,brief:"The messiest encounter in the dungeon and the only genuinely chaotic one. An unkillable infernal fixates the tank from pull to kill while fire pulses passively on everyone, imps spawn from circles under each player, and Malefic Wave sweeps the room after she gateways across it. Nothing is individually hard; the overlap is what kills, and the tank is directing traffic throughout.",a:[
   {n:"Unkillable Infernal",t:["fixate","denial"],c:["kite","position"],r:["tank"],sev:3,e:"Summoned on pull, cannot be killed, fixates the tank and pulses damage to anyone nearby.",h:"The tank spends the whole encounter managing where this thing stands so it is not blocking anyone's path — including the gateway later.",s:["tk_mr"]},
   {n:"Vile Fiend",t:["adds","tankbuster"],c:["defensive"],r:["tank"],sev:1,e:"Adds that deal bonus shadow damage on melee.",s:["tk_mr"]},
   {n:"Fingers of Gul'dan",t:["adds","spread"],c:["stack","cc"],r:["dps"],sev:2,e:"AoE around every player, each spawning a wild imp on impact.",h:"Overlap the circles in melee range so the imps spawn clustered, then AoE stun and cleave.",s:["tk_mr"]},
   {n:"Chaos Bolt",t:["groupdmg"],c:["interrupt"],r:["dps"],sev:2,e:"Cast at random players throughout.",h:"Higher interrupt priority than the imps.",s:["tk_mr"]},
   {n:"Searing Fel Flame",t:["groupdmg"],c:["unavoidable"],r:["healer"],sev:2,e:"Passive fire pulse for the whole encounter, which is what makes the imp casts dangerous.",s:["tk_mr"]},
   {n:"Malefic Wave",t:["line","amp"],c:["dodge","position"],r:["dps","healer","tank"],sev:3,e:"He puts up a demonic gateway, teleports across the room and fires a lethal shockwave that increases fire damage taken for a minute and buffs any living adds it touches.",h:"Kill the adds before it reaches them. Dodge with a personal teleport, or take his own gateway — waiting until the wave has passed the far end.",s:["tk_mr"]}]}],
loot:{s:["iv_mr"],i:[
  {n:"Nibbles' Training Rod",ic:"inv_staff_2h_dungeonharronir_c_02",id:251123,sl:"Two-hand",ty:"Staff",b:"Kystia Manaheart",p:["Int"],x:[["Crit",9],["Haste",6]]},
  {n:"Sinseared Repeater",ic:"inv_firearm_2h_undergroundquest_b_01",id:271680,sl:"Ranged",ty:"Gun",b:"Kystia Manaheart",p:["Agi"],x:[["Crit",30],["Vers",16]]},
  {n:"Greathelm of Temptation",ic:"inv_helm_plate_dungeonharronir_c_01",id:251126,sl:"Head",ty:"Plate",b:"Kystia Manaheart",p:["Str","Int"],x:[["Mastery",9],["Crit",5]]},
  {n:"Nibbling Armbands",ic:"inv_bracer_cloth_dungeonharronir_c_01",id:251127,sl:"Wrist",ty:"Cloth",b:"Kystia Manaheart",p:["Int"],x:[["Haste",5],["Crit",3]]},
  {n:"Gauntlets of Fevered Defense",ic:"inv_glove_leather_dungeonharronir_c_01",id:251124,sl:"Hands",ty:"Leather",b:"Kystia Manaheart",p:["Agi","Int"],x:[["Crit",7],["Haste",4]]},
  {n:"Felsoaked Soles",ic:"inv_boot_mail_dungeonharronir_c_01",id:251125,sl:"Feet",ty:"Mail",b:"Kystia Manaheart",p:["Agi","Int"],x:[["Vers",7],["Crit",4]]},
  {n:"Manaheart's Binding Flame",ic:"inv_ember_fel",id:250243,sl:"Trinket",ty:"Trinket",b:"Kystia Manaheart",p:["Str","Agi"],u:"Form a Fel Shield for 10 sec, absorbing 30% of incoming damage. While the shield holds, a portion of the absorbed damage is stored as volatile Fel energy. When the shield expires or breaks, the energy erupts and inflicts Fire damage to split between nearby enemies. (1 Min, 30 Sec Cooldown)",ro:["tank","mdps"]},
  {n:"Bladesorrow",ic:"inv_knife_1h_dungeonharronir_c_01",id:251128,sl:"One-hand",ty:"Dagger",b:"Zaen Bladesorrow",p:["Agi"],x:[["Crit",4],["Mastery",3]]},
  {n:"Jangling Felpaulets",ic:"inv_shoulder_mail_dungeonharronir_c_01",id:251131,sl:"Shoulder",ty:"Mail",b:"Zaen Bladesorrow",p:["Agi","Int"],x:[["Vers",6],["Crit",4]]},
  {n:"Speakeasy Shroud",ic:"inv_cape_leather_dungeonharronir_c_01",id:251132,sl:"Back",ty:"Cloak",b:"Zaen Bladesorrow",p:["Str","Agi","Int"],x:[["Crit",5],["Mastery",3]]},
  {n:"Overseer's Vambraces",ic:"inv_bracer_plate_dungeonharronir_c_01",id:251133,sl:"Wrist",ty:"Plate",b:"Zaen Bladesorrow",p:["Str","Int"],x:[["Haste",5],["Crit",3]]},
  {n:"Counterfeit Clutches",ic:"inv_glove_cloth_dungeonharronir_c_01",id:251129,sl:"Hands",ty:"Cloth",b:"Zaen Bladesorrow",p:["Int"],x:[["Mastery",7],["Vers",4]]},
  {n:"Breeches of Deft Deals",ic:"inv_pant_leather_dungeonharronir_c_01",id:251130,sl:"Legs",ty:"Leather",b:"Zaen Bladesorrow",p:["Agi","Int"],x:[["Crit",8],["Mastery",6]]},
  {n:"Freightrunner's Flask",ic:"inv_alchemy_90_flask_red",id:250215,sl:"Trinket",ty:"Trinket",b:"Zaen Bladesorrow",p:["Agi","Int"],u:"Take a sip of the drink you swiped from the freight, increasing your Critical Strike for 15 sec. (1 Min, 30 Sec Cooldown)",ro:["healer","rdps","mdps"]},
  {n:"Xathuux's Cleave",ic:"inv_axe_2h_dungeonharronir_c_01",id:251134,sl:"Two-hand",ty:"Axe",b:"Xathuux the Annihilator",p:["Str"],x:[["Crit",8],["Haste",6]]},
  {n:"Fury-fletched Armlets",ic:"inv_bracer_leather_dungeonharronir_c_01",id:251135,sl:"Wrist",ty:"Leather",b:"Xathuux the Annihilator",p:["Agi","Int"],x:[["Haste",5],["Crit",3]]},
  {n:"Tempestuous Sandals",ic:"inv_boot_cloth_dungeonharronir_c_01",id:251137,sl:"Feet",ty:"Cloth",b:"Xathuux the Annihilator",p:["Int"],x:[["Mastery",7],["Haste",4]]},
  {n:"Signet of Snarling Servitude",ic:"inv_12_jewelry_voidelf_ring_teal",id:251136,sl:"Ring",ty:"Ring",b:"Xathuux the Annihilator",x:[["Crit",12],["Mastery",8]]},
  {n:"Resonant Bellowstone",ic:"inv_alchemy_90_stone_green",id:250228,sl:"Trinket",ty:"Trinket",b:"Xathuux the Annihilator",p:["Str","Agi"],e:"Your damaging abilities have a chance to echo with Xathuux's furious roar, increasing your Critical Strike for 30 sec. During this time, each of your attacks increases your Critical Strike by an additional 5, stacking up to a maximum of 5 times. (30s cooldown)",ro:["mdps"]},
  {n:"Vilefiend's Guise",ic:"inv_helm_leather_dungeonharronir_c_01",id:251140,sl:"Head",ty:"Leather",b:"Lithiel Cinderfury",p:["Agi","Int"],x:[["Haste",8],["Mastery",6]]},
  {n:"Pendant of Malefic Fury",ic:"inv_12_jewelry_silvermoonelf_necklace_green",id:251142,sl:"Neck",ty:"Neck",b:"Lithiel Cinderfury",x:[["Mastery",14],["Haste",6]]},
  {n:"Cinderfury Shoulderguards",ic:"inv_shoulder_plate_dungeonharronir_c_01",id:251138,sl:"Shoulder",ty:"Plate",b:"Lithiel Cinderfury",p:["Str","Int"],x:[["Haste",7],["Mastery",4]]},
  {n:"Summoner's Searing Shirt",ic:"inv_chest_cloth_dungeonharronir_c_01",id:251139,sl:"Chest",ty:"Cloth",b:"Lithiel Cinderfury",p:["Int"],x:[["Haste",9],["Crit",5]]},
  {n:"Lithiel's Linked Leggings",ic:"inv_pant_mail_dungeonharronir_c_01",id:251141,sl:"Legs",ty:"Mail",b:"Lithiel Cinderfury",p:["Agi","Int"],x:[["Haste",9],["Vers",6]]},
  {n:"Unstable Felheart Crystal",ic:"tooltip_crystallizedfel",id:250255,sl:"Trinket",ty:"Trinket",b:"Lithiel Cinderfury",p:["Int"],u:"Unleash the fel energy stored within the crystal, sacrificing your health to infuse a target ally for 10 sec, absorbing damage. (2 Min Cooldown)",ro:["healer"]}]},
 route:[
  {n:1,t:"Bottom right start",m:"Opening street packs",d:1,p:"The opening area is static in Mythic+ even though it was not in Mythic 0.",s:["tk_rt"]},
  {n:2,t:"Lust pull, top of the district",m:"Lieutenant plus guard, chained into the next group",d:3,lust:true,p:"Looks bigger than it is — chain up to the mini-boss, then add the rest when you feel safe. They only spawn when you open the door.",s:["tk_rt"]},
  {n:3,t:"Snitches and crystals",m:"Scattered",d:1,p:"Five crystals exist for the vendor buffs. The rally vendor sits in the top-left corner.",s:["tk_rt"]},
  {n:4,t:"Tavern event",m:"—",d:1,p:"Second lust window. Many groups pull the pre-boss pack into the boss: a DPS or healer opens the door while the tank gathers, then take everything in with the event buff up.",s:["tk_rt"]},
  {n:5,t:"Right side to the third boss",m:"Warehouse and demon packs",d:2,p:"The mobs on the elevated platform look close but are not a threat.",s:["tk_rt"]},
  {n:6,t:"Mini-boss pull",m:"Felmaster Lucsei",d:3,p:"Does a lot of damage. Take it clean.",s:["tk_rt"]},
  {n:7,t:"Final approach",m:"Demons and imps",d:2,p:"Take it slow. Imps are awkward to group, but they melt if you pull a pack on top of them.",s:["tk_rt"]}],
 reads:[{t:"The tavern event is a pacing problem in a timed format. Either cut it and adjust the timer, or make the buff last long enough to be worth the interruption — four minutes is not.",by:"Tactyks",d:"2026-07-25",s:["tk_pool"]},
        {t:"Murder Row carries the season's only relevant curse, and even that one is counterable without a curse dispel.",by:"Tactyks",d:"2026-07-25",s:["tk_pool"]}]},

/* ─────────────────────────── DEN OF NALORAKK ──────────────────────── */
{id:"den-of-nalorakk",name:"Den of Nalorakk",short:"Nalorakk",banner:"den-of-nalorakk",sigil:"i-claw",origin:"Midnight",
 timer:{v:"32 min",s:["wh_dg"]},bosses:3,routing:"hybrid",
 blurb:"Amani forest that turns to snowfield halfway through, then to a spirit world and back. Three distinct environments, three very different tanking problems.",
 cov:"Three independent sources plus the Encounter Journal. Timer confirmed at 32 minutes.",cov2:true,
 dispels:{poison:1,magic:2,curse:2,disease:0,enrage:3,bleed:2},
 gates:[{t:"Collect six offerings — berries from bushes, fish from the water, or barrels of apples among the trash — and deliver them to summon the first boss. More than six are available, so you can choose which trash you pull to reach them.",s:["tk_don"]},
        {t:"Kill the Winter Squall to stop the harsh winds in the snowfield.",s:["tk_don"]},
        {t:"Channel into the Pale Eye to summon the second boss; interact with an ethereal pyre afterwards to wake.",s:["tk_don"]}],
 buffs:[{n:"Warding Incense",e:"+1% Versatility to you and your party for 10 minutes. Two altars — one at the entrance, one just before the first boss.",w:"A player with 25 skill in Midnight Alchemy, or a Druid in Bear Form",loc:"Opening area, twice",s:["tk_don"]},
        {n:"Snow-Worn Provisions",e:"Reduces the power of movement forces by 50% for 15 minutes.",w:"Night elves, trolls, or a Druid in Bear Form",loc:"The snowfield",s:["tk_don"]}],
 loc:{zone:"Zul'Aman, to the south-west",way:"/way #2437 31.4 83.9",tp:"Path of the Worthy Aspirant",lvl:90},
 calls:{s:["wh_dg"],i:[["Scavenge", "Keen-Eyed Striker", "T1"], ["Healing Breeze", "Earthwhisper Tender", "T1"], ["Frigid Roar", "Frigid Mauler", "T2"], ["Winter's Shroud", "Fractured Shivercore", "B2"], ["Arc Lightning", "Stormbound Mystic", "T3"]],d:[["Insatiable Hunger", "Spirit of Hunger", "T1 — the max-health curse IS removable"], ["Toxic Spores", "The Hoardmonger", "B1"], ["Cryo Surge", "Glacial Revenant", "T2"], ["Glacial Torment", "Sentinel of Winter", "B2"]],p:[["Healing Breeze", "Earthwhisper Tender", "T1 — only if the kick was missed"], ["Mother's Wrath", "Territorial Matriarch", "T1"], ["Bestial Wrath", "Bonded Beasttamer", "T3"]]},
 rewards:[["Formula: Enchant Chest - Mark of Nalorakk","Enchanting","Nalorakk"]],
 killers:[
  {n:"Insatiable",w:"Starvation Effigy, summoned by the Spirits of Hunger. A curse on the entire party reducing maximum health — and it lands right before the same mob channels Feast of Misery for party damage. The combination is what kills.",s:["tk_don"]},
  {n:"Healing Breeze",w:"Earthwhisper Tender. A magic heal-over-time on every nearby enemy. Miss it and the pull does not die.",s:["tk_don"]},
  {n:"Frozen Tempest",w:"Sentinel of Winter. Constant pushback on an ice floor while the arena ticks for damage. Without a snow pile to stand on it is close to unmanageable.",s:["tk_don"]}],
 areas:[
  {n:"The Forest",mobs:[
   {n:"Keen-Eyed Striker",k:"trash",a:[
    {n:"Scavenge",t:["channel"],c:["interrupt"],r:["dps"],sev:2,e:"Steals berries from a nearby bush. If it completes, that offering is gone.",h:"Only matters near the bushes, but there it matters a lot.",s:["tk_don"]},
    {n:"Razor Dive",t:["dot"],c:["bleedcl","defensive"],r:["healer"],sev:1,e:"Random-target leap that leaves a bleed.",s:["tk_don"]}]},
   {n:"Thornclaw Gatherer",k:"trash",a:[
    {n:"Shredding Claws",t:["stacking","amp"],c:["cc","kite"],r:["tank"],sev:2,e:"Passive that stacks an armour reduction on the tank.",h:"Nasty if you are pulling several. Watch the stacks and kite briefly to drop them.",s:["tk_don","iv_don"]},
    {n:"Rotten Supplies",t:["denial"],c:["position"],r:["dps","healer","tank"],sev:1,e:"Leaves patches of ground ichor around the pack.",s:["iv_don"]}]},
   {n:"Earthwhisper Tender",k:"caster",a:[
    {n:"Healing Breeze",t:["heal"],c:["interrupt","purge"],r:["dps"],sev:3,e:"Magic heal-over-time on all nearby enemies.",h:"Priority interrupt in the area — both sources call it the one cast you must never let through. A mass dispel or purge works in a pinch, and spare kicks go on their Earth Bolt.",s:["tk_don","iv_don"]}]},
   {n:"Territorial Matriarch",k:"trash",a:[
    {n:"Mother's Wrath",t:["enrage","stacking"],c:["soothe"],r:["tank","dps"],sev:2,e:"Harmless alone, but gains stacking rage whenever her cubs die.",h:"Kill order matters. Left up, this gets very ugly for the tank — an enrage dispel is the clean answer if anyone has one.",s:["tk_don","iv_don"]}]},
   {n:"Spirit of Hunger",k:"lt",a:[
    {n:"Starvation Effigy",t:["totem","adds"],c:["focus"],r:["dps"],sev:3,e:"Spawns a totem whose Insatiable Hunger cast puts a curse on the whole party reducing maximum health.",h:"Kill the totem before the cast lands — but the published assignment table lists the curse as dispellable, which neither creator guide mentions. With a curse dispel this pack stops being the wipe it is otherwise.",s:["tk_don","wh_dg"]},
    {n:"Feast of Misery",t:["channel","groupdmg"],c:["unavoidable"],r:["healer"],sev:3,e:"Channels party damage, usually shortly after the effigy spawns.",h:"Maximum-health reduction plus party damage is the wipe combination.",s:["tk_don"]}]}]},
  {n:"The Snowfield",mobs:[
   {n:"Harsh Winds",k:"trash",a:[
    {n:"Harsh Winds",t:["env","knockback"],c:["los","position"],r:["dps","healer","tank"],sev:2,e:"Environmental gusts blow through the area periodically.",h:"Take cover behind terrain — the safe spots are marked by an absence of snow.",s:["tk_don"]}]},
   {n:"Frost Fang",k:"fodder",a:[
    {n:"Frost Bite",t:["tankbuster"],c:["defensive"],r:["tank"],sev:1,e:"Passive that occasionally adds frost damage to their attacks.",s:["tk_don"]}]},
   {n:"Tar Rumbler",k:"trash",a:[
    {n:"Rumbling War Shield",t:["shield","groupdmg"],c:["focus"],r:["dps"],sev:2,e:"Pulses AoE damage for as long as the shield holds.",h:"The faster it breaks, the less the healer eats.",s:["tk_don"]}]},
   {n:"Frigid Mauler",k:"trash",a:[
    {n:"Frigid Roar",t:["debuff"],c:["interrupt"],r:["dps"],sev:2,e:"A significant party haste reduction if it lands.",h:"One kick is all it needs.",s:["tk_don"]}]},
   {n:"Glacial Revenant",k:"trash",a:[
    {n:"Cryosurge",t:["dot","spread"],c:["magic","spread"],r:["healer"],sev:2,e:"Random-target magic damage-over-time that also splashes to nearby players.",h:"Loosely spread on these packs and dispel quickly.",s:["tk_don"]}]},
   {n:"Avatar of Determination",k:"lt",a:[
    {n:"Glacial Tomb",t:["root"],c:["freedom","focus"],r:["dps","healer","tank"],sev:2,e:"Roots every player in ice.",h:"Either a freedom effect, or stack in melee so the ice is cleaved off quickly.",s:["tk_don"]},
    {n:"Pulverize",t:["denial"],c:["dodge"],r:["dps","healer"],sev:1,e:"AoE around the mob itself.",s:["tk_don"]}]},
   {n:"Winter Squall",k:"mini",a:[
    {n:"Master of the Winds",t:["env"],c:["focus"],r:["dps","healer","tank"],sev:2,e:"Controls the harsh winds. Killing it stops them permanently.",h:"You have to be close to it in the storm to have visibility, which means everyone stands in the damage-taken increase to fight it.",s:["tk_don"]}]}]},
  {n:"The Waking Path",mobs:[
   {n:"Stormbound Mystic",k:"caster",a:[
    {n:"Arc Lightning",t:["groupdmg"],c:["interrupt"],r:["dps"],sev:3,e:"Arcs from the target to additional players.",h:"Interrupt every cast. Spare kicks go on their Lightning Bolt.",s:["tk_don"]}]},
   {n:"Ruthless Totemcaller",k:"trash",a:[
    {n:"Magma Totem",t:["totem","groupdmg"],c:["focus"],r:["dps"],sev:2,e:"Spawns totems that pulse AoE while alive.",s:["tk_don"]}]},
   {n:"Grizzled Warbringer",k:"lt",a:[
    {n:"Primal Echo",t:["groupdmg","dot"],c:["unavoidable"],r:["healer"],sev:2,e:"A large hit plus a damage-over-time on the party.",s:["tk_don"]},
    {n:"Poison Spear Volley",t:["denial"],c:["dodge"],r:["dps","healer"],sev:1,e:"Drops circles on the ground.",s:["tk_don"]}]},
   {n:"Bonded Beasttamer",k:"trash",a:[
    {n:"Bestial Wrath",t:["enrage"],c:["soothe"],r:["tank","dps"],sev:2,e:"Their Loyal Saber Fang companion occasionally enrages.",s:["tk_don"]},
    {n:"Shred Armor",t:["stacking","amp"],c:["cc","kite"],r:["tank"],sev:2,e:"The saber fang stacks armour reduction on the tank.",h:"Same problem as the forest gatherers — with several out you need a kite window.",s:["tk_don"]}]},
   {n:"Loa Speaker Nanea",k:"mini",a:[
    {n:"Earthquake",t:["denial","spread"],c:["spread"],r:["dps","healer"],sev:2,e:"Applies to two random players, cleaving nearby and leaving a puddle.",h:"Spread out and give yourself room; the puddles eat the arena otherwise.",s:["tk_don"]},
    {n:"Volatile Totem",t:["totem","groupdmg"],c:["focus"],r:["dps"],sev:2,e:"Three totems pulse AoE damage. Unlike the magma totems these have real health.",h:"Drag the boss over them for cleave if you can.",s:["tk_don"]}]}]}],
 encounters:[
  {n:"The Hoardmonger",o:1,img:"don-the-hoardmonger",sub:"Three piles, three permanent upgrades — you choose the order",shape:"Three empowerments, your order",lv:2,brief:"Three checkpoints, and you choose what happens at each. At 90, 70 and 40 percent he raids the nearest pile and permanently upgrades an ability — meat adds a knockback, bone leaves slowing spikes, mushrooms flood the room with soaks. On Mythic every upgrade sticks, so by the last third he has all three. Meat first and mushrooms last: that one you want live for the shortest time.",a:[
   {n:"Empowerment",t:["debuff"],c:["preposition"],r:["dps","healer","tank"],sev:3,e:"At 90%, 70% and 40% health he gathers from the nearest pile, REPLACING one of his abilities. He can only hold one at a time — but on Mythic every ability he picks up is permanent, so by 40% he has all three.",h:"Meat first, then bone, mushrooms last — the mushroom empowerment translates to the most unavoidable damage, so you want it live for the shortest time.",s:["tk_don"]},
   {n:"Ravenous Bellow",t:["groupdmg","dot","knockback"],c:["unavoidable"],r:["healer"],sev:2,t:["groupdmg","dot","knockback","noarmor"],e:"Heavy Physical damage plus moderate damage every second for 10 seconds, IGNORING ARMOUR. The meat pile replaces it with Hearty Bellow, which adds a knockback.",s:["wh_ej","tk_don"]},
   {n:"Earthshatter Slam",t:["frontal","denial"],c:["position","dodge"],r:["tank"],sev:2,e:"Massive Nature damage in a frontal cone. The bone pile replaces it with Bonespike Slam, which additionally leaves spikes for 45 seconds dealing light damage every half second and slowing 50%.",h:"The area denial matters most because of what the mushrooms do next.",s:["tk_don"]},
   {n:"Spoiled Supplies",t:["soak","dot"],c:["soak","poison"],r:["dps","healer","tank"],sev:3,e:"He tosses rotten food over 7 seconds, hitting targeted players directly for significant damage and littering Rotten Mushrooms. Each grows for 12 seconds then detonates in Putrid Burst, covering everyone in Toxic Spores. Touching one transfers the spores to you instead and destroys it. The mushroom pile grants Overflowing Supplies — many more mushrooms.",h:"The journal is explicit that Toxic Spores is removable by poison cleansing, so a poison dispeller can soak far more than their share.",s:["wh_ej","tk_don","iv_don"]}]},
  {n:"Sentinel of Winter",o:2,img:"don-sentinel-of-winter",sub:"An ice floor, and you slide",shape:"One phase, environmental",lv:3,brief:"The most positioning-heavy encounter in the pool. You fight on ice, so you slide, and Frozen Tempest then shoves everyone constantly while the arena ticks. The adds are the answer — each Shivercore leaves a Snowdrift when it dies, and standing in one makes you immune to forced movement. Kill one early, hold the second, and time its death to the Tempest; the whole fight softens.",a:[
   {n:"Glacial Torment",t:["dot"],c:["magic"],r:["healer"],sev:2,e:"Magic damage-over-time on three players.",h:"Dispel fast, then focus healing into whoever still has it.",s:["tk_don"]},
   {n:"Raging Squall",t:["denial"],c:["stack","position"],r:["dps","healer","tank"],sev:2,e:"Very heavy Frost damage on impact, then the squalls WANDER the arena for a minute and a half, hitting for heavy damage and knocking players back.",h:"Both guides describe a brief rotation you step around. The journal says these persist for 90 seconds and roam — so they accumulate, and late in the fight the arena is genuinely crowded. Stack so they spawn together and the cluster stays walkable.",s:["wh_ej","tk_don"]},
   {n:"Shattering Frostspike",t:["adds"],c:["interrupt","position"],r:["dps","tank"],sev:3,t:["adds","myth"],e:"Two icicles splinter for very heavy damage within 4 yards, revealing Fractured Shivercores that spam Winter's Shroud — significant damage plus 10% increased Frost damage taken for 20 seconds, stacking. On death each bursts a Rimeshatter that lands 6 seconds later within 5 yards; if nobody is standing there, Rime Detonation hits the party for heavy damage and roots for 4 seconds. Each also leaves a Snowdrift: 40% slow, immune to forced movement.",h:"Kill the first Shivercore fast, soak the Rimeshatter, then deliberately hold the second one and time its death to line up with Frozen Tempest — the Snowdrift it leaves makes you immune to forced movement for the channel.",s:["tk_don","iv_don"]},
   {n:"Frozen Tempest",t:["env","knockback","groupdmg"],c:["position"],r:["dps","healer","tank"],sev:3,e:"Moderate Frost damage to everyone every second, pushing them away. Players OUTSIDE the eye of the storm take an additional heavy damage every second on top.",h:"The journal confirms the Snowdrift trick outright: standing in one makes you immune to forced movement. So hold the second Shivercore and time its death to the Tempest — that is the whole encounter solved.",s:["wh_ej","tk_don","iv_don"]}]},
  {n:"Nalorakk",o:3,img:"don-nalorakk",sub:"Echo management, with a second boss interfering",shape:"One phase, energy-driven cycle",lv:3,brief:"An echo-placement puzzle with a second boss interfering. Echoes land under marked players and stay there, and every new set detonates every old one — so sloppy early placement compounds until it is unsurvivable. At full energy he charges them at Zul'jarra and you body-block; she then raises a shield to hide behind, and the instant it drops the tank must be back for Forceful Slam.",a:[
   {n:"Echoing Maul",t:["denial","adds"],c:["position"],r:["dps","healer","tank"],sev:2,e:"Marks players for 4 seconds, then sends an Echo to each marked position — and EVERY echo already on the floor immediately hits for heavy damage within 8 yards.",h:"Overlap your circles without cleaving each other, and drop them near existing echoes so they cluster.",s:["tk_don"]},
   {n:"Spectral Slash",t:["denial"],c:["position"],r:["dps","healer","tank"],sev:2,e:"Knocks the player back and lingers for significant damage every 2 seconds for 12 seconds, stacking.",h:"Because every existing echo pulses each time a new set lands, echo placement compounds — a sloppy first set makes the fourth set unsurvivable.",s:["wh_ej","tk_don"]},
   {n:"Fury of the War God",t:["amp","adds"],c:["position"],r:["dps","healer","tank"],sev:3,e:"He headbutts Zul'jarra into a Concussive Shock, then sends the echoes charging at her. Blocking one costs you significant Nature damage; letting one reach her costs the party heavy damage, ignoring armour, plus a stacking 10% damage-taken increase. Each echo lingers for one further Fury of the War God, then vanishes.",h:"Block their path instead of letting them connect, and drop the echoes into a corner earlier so every charge comes from the same direction.",s:["tk_don","iv_don"]},
   {n:"Overwhelming Onslaught",t:["channel","groupdmg","knockback"],c:["los","position"],r:["healer","tank"],sev:3,t:["channel","groupdmg","knockback","noarmor","myth"],e:"very heavy damage every second for 3 seconds, ignoring armour. Zul'jarra's Defensive Stance reduces it by 80% for anyone standing behind her — not immunity, an 80% cut. The final hit stuns her and knocks everyone back.",h:"Tanks own the shield's placement. Getting knocked into an echo is how this goes wrong.",s:["tk_don"]},
   {n:"Forceful Slam",t:["tankbuster","soak"],c:["defensive","position"],r:["tank"],sev:3,e:"Massive Physical damage to everyone within 6 yards of Zul'jarra. If NOBODY is standing there she takes it in full and screams.",h:"Get back to the boss fast after the knockback. This is the single most punishing tank moment in the dungeon.",s:["tk_don"]}]}],
loot:{s:["iv_don"],i:[
  {n:"Grim Harvest Gloves",ic:"inv_hand_1h_dungeonharronir_c_01",id:251143,sl:"One-hand",ty:"Fist",b:"The Hoardmonger",p:["Agi"],x:[["Haste",4],["Vers",3]]},
  {n:"Scavenger's Spaulders",ic:"inv_shoulder_leather_dungeonharronir_c_01",id:251146,sl:"Shoulder",ty:"Leather",b:"The Hoardmonger",p:["Agi","Int"],x:[["Vers",6],["Crit",4]]},
  {n:"Hoarded Harvest Wrap",ic:"inv_chest_cloth_dungeonharronir_c_01",id:251147,sl:"Chest",ty:"Cloth",b:"The Hoardmonger",p:["Int"],x:[["Mastery",9],["Vers",6]]},
  {n:"Autumn's Boon Belt",ic:"inv_belt_plate_dungeonharronir_c_01",id:251144,sl:"Waist",ty:"Plate",b:"The Hoardmonger",p:["Str","Int"],x:[["Mastery",6],["Vers",4]]},
  {n:"Forgotten Tribe Footguards",ic:"inv_boot_mail_dungeonharronir_c_01",id:251145,sl:"Feet",ty:"Mail",b:"The Hoardmonger",p:["Agi","Int"],x:[["Haste",6],["Vers",4]]},
  {n:"Pilfered Precious Band",ic:"inv_12_jewelry_zulaman_troll_ring_green2",id:251148,sl:"Ring",ty:"Ring",b:"The Hoardmonger",x:[["Vers",12],["Crit",8]]},
  {n:"Mycolic Medicine",ic:"inv_misc_starspecklemushroom",id:250248,sl:"Trinket",ty:"Trinket",b:"The Hoardmonger",p:["Int"],e:"You gain Nalorakk's Favor of Growth. Your healing spells and abilities have a chance to instantly heal your target and spawn a glowing mushroom near them that lasts for 10 sec. If an ally steps on and consumes the mushroom, they are healed again.",ro:["healer"]},
  {n:"Victor's Flashfrozen Blade",ic:"inv_polearm_2h_dungeonharronir_c_01",id:251149,sl:"Two-hand",ty:"Polearm",b:"Sentinel of Winter",p:["Agi"],x:[["Mastery",8],["Haste",6]]},
  {n:"Tempest's Shelter",ic:"inv_shield_1h_dungeonharronir_c_01",id:251150,sl:"Off-hand",ty:"Shield",b:"Sentinel of Winter",p:["Str","Int"],x:[["Haste",4],["Mastery",3]]},
  {n:"Perennial Frostbound Charm",ic:"inv_offhand_1h_dungeonharronir_c_01",id:271681,sl:"Off-hand",ty:"Off-hand",b:"Sentinel of Winter",p:["Int"],x:[["Mastery",14],["Crit",10]]},
  {n:"Sentinel Challenger's Prize",ic:"inv_chest_plate_dungeonharronir_c_01",id:251151,sl:"Chest",ty:"Plate",b:"Sentinel of Winter",p:["Str","Int"],x:[["Crit",9],["Mastery",5]]},
  {n:"Winter's Embrace Bracers",ic:"inv_bracer_cloth_dungeonharronir_c_01",id:251154,sl:"Wrist",ty:"Cloth",b:"Sentinel of Winter",p:["Int"],x:[["Crit",5],["Mastery",3]]},
  {n:"Season's Turn Gauntlets",ic:"inv_glove_mail_dungeonharronir_c_01",id:251152,sl:"Hands",ty:"Mail",b:"Sentinel of Winter",p:["Agi","Int"],x:[["Haste",6],["Vers",4]]},
  {n:"Tribal Defender's Cord",ic:"inv_belt_mail_dungeonharronir_c_01",id:251155,sl:"Waist",ty:"Mail",b:"Sentinel of Winter",p:["Agi","Int"],x:[["Crit",7],["Mastery",4]]},
  {n:"Arctic Explorer's Legwraps",ic:"inv_boot_leather_dungeonharronir_c_01",id:251153,sl:"Feet",ty:"Leather",b:"Sentinel of Winter",p:["Agi","Int"],x:[["Haste",7],["Crit",4]]},
  {n:"Permafrost Essence",ic:"inv12_jewelrytrinkets_dungeon_permafrostreservoir",id:250244,sl:"Trinket",ty:"Trinket",b:"Sentinel of Winter",e:"You gain Nalorakk's Favor of Enduring. Taking damage has a chance to grant a Mark of Frost, increasing your Critical Strike for 15 sec. Stacks up to 10 times. If your health falls below 25%, the reservoir ruptures, consuming all marks to form a Frost Barrier that absorbs damage per mark for 10 sec.",ro:["tank"]},
  {n:"Fallen Speaker's Staff",ic:"inv_staff_2h_amani_c_01",id:251156,sl:"Two-hand",ty:"Staff",b:"Nalorakk",p:["Int"],x:[["Haste",9],["Vers",5]]},
  {n:"Nalorakk's Nightmare",ic:"inv_helm_mail_dungeonharronir_c_01",id:251158,sl:"Head",ty:"Mail",b:"Nalorakk",p:["Agi","Int"],x:[["Vers",8],["Haste",6]]},
  {n:"Yoke of the Charging Bear",ic:"inv_12_jewelry_zulaman_troll_necklace_green1",id:251173,sl:"Neck",ty:"Neck",b:"Nalorakk",x:[["Haste",13],["Crit",7]]},
  {n:"War Trial Vestments",ic:"inv_chest_leather_dungeonharronir_c_01",id:251159,sl:"Chest",ty:"Leather",b:"Nalorakk",p:["Agi","Int"],x:[["Mastery",9],["Haste",5]]},
  {n:"Bonds of the Hash'ura",ic:"inv_glove_plate_dungeonharronir_c_01",id:251214,sl:"Hands",ty:"Plate",b:"Nalorakk",p:["Str","Int"],x:[["Haste",6],["Crit",4]]},
  {n:"Forest Dream Leg-guards",ic:"inv_pant_cloth_dungeonharronir_c_01",id:251160,sl:"Legs",ty:"Cloth",b:"Nalorakk",p:["Int"],x:[["Haste",9],["Crit",5]]},
  {n:"Idol of the War Loa",ic:"inv12_jewelrytrinkets_dungeon_idolofthewargod",id:250229,sl:"Trinket",ty:"Trinket",b:"Nalorakk",x:[["Crit",10]],e:"You have proven your worth to Nalorakk. Your abilities have a chance to echo with the war god's furious roar, granting you Strength for 15 sec. Nearby allies with Nalorakk's favor are rallied, gaining 25% movement speed for 10 sec.",ro:["mdps"]}]},
 route:[
  {n:1,t:"Big opening lust pull",m:"Spirit of Hunger, two casters, assorted forest mobs",d:3,lust:true,p:"The Spirit of Hunger is the scary part. The rest hit the tank or throw random bleeds.",s:["tk_rt"]},
  {n:2,t:"Matriarch drag",m:"Territorial Matriarch",d:2,p:"Drag it down while avoiding the second Spirit of Hunger. Walk the waterfall side.",s:["tk_rt"]},
  {n:3,t:"Blocked offerings",m:"Second Spirit of Hunger",d:3,p:"This one has to die — it is sitting on two offerings. Every other Spirit gets walked past.",s:["tk_rt"]},
  {n:4,t:"Long grouping",m:"Side path packs",d:2,p:"Chainable if the patrol is kind. Assume a bad patrol and take them separately.",s:["tk_rt"]},
  {n:5,t:"Post-boss, veer left",m:"Snowfield entry packs",d:2,p:"Hug the left wall to skip the extra Matriarch. Note there is an extra Tar Rumbler physically present in this pack.",s:["tk_rt"]},
  {n:6,t:"Stair pull",m:"Snowfield casters",d:2,p:"The tank steps down, tags, and runs back up. Everyone else stays up top or the mystic starts casting from the bottom of the stairs.",s:["tk_rt"]},
  {n:7,t:"Dangerous combination",m:"Two packs",d:3,lust:true,p:"Only pull these together with lust. Otherwise take them one at a time.",s:["tk_rt"]},
  {n:8,t:"Winter Squall then boss",m:"Mini-boss",d:2,p:"If you did not lust earlier, save it for the boss.",s:["tk_rt"]}],
 reads:[{t:"A hybrid routing dungeon — the offerings and the large open second area give real choice for the first two-thirds, then it becomes linear to the final boss.",by:"Tactyks",d:"2026-07-25",s:["tk_pool"]}]},

/* ────────────────────────── THE BLINDING VALE ─────────────────────── */
{id:"blinding-vale",name:"The Blinding Vale",short:"Blinding Vale",banner:"the-blinding-vale",sigil:"i-bloom",origin:"Midnight",
 timer:{v:"31 min",s:["wh_dg"]},bosses:4,routing:"flexible",
 blurb:"The most open dungeon in the pool. A left-or-right fork decides which of the first two bosses you meet first, and there is far more trash available than you need for count.",
 cov:"Three independent sources plus the Encounter Journal. Timer confirmed at 31 minutes. The routing source still flags this dungeon's MDT data as likely wrong, and the two guides now disagree on whether Pulverizing Strikes can be dodged.",cov2:true,
 dispels:{poison:2,magic:3,curse:0,disease:0,enrage:0,bleed:3},
 gates:[{t:"Choose left towards the Light Blossom Trinity or right towards Aku'mai the Light Hunter. Both bosses must die before you progress.",s:["tk_bv"]}],
 buffs:[{n:"Light-Starved Blossom",e:"Haste and movement speed for the party, 2 minutes.",w:"Priests, Paladins or Herbalists",loc:"Left path",s:["tk_bv"]},
        {n:"Baby Grove Crawler",e:"A combat companion for 1 minute.",w:"Hunters or Druids",loc:"Right path",s:["tk_bv"]}],
 loc:{zone:"Harandar",way:"/way #2576 27.8 77.9",tp:"Path of the Blooming Verdure",lvl:90,note:"Portal to Harandar from Silvermoon City at /way #2393 36.8 68.4."},
 calls:{s:["wh_dg"],i:[["Light Bolt Volley", "Radiant Spellsower", "T1"], ["Light Bolt", "Kezkitt", "B1"], ["Disorienting Screech", "Lightfeather Petalwing", "T2"], ["Warden's Wrath", "Lightwarden Ruia", "B3"], ["Lightspore Shot", "Lightspawn Lasher", "B4"]],d:[["Bloodthorn Roots", "Ikuzz the Light Hunter", "B2 — freedom effects clear the root"]],p:[]},
 rewards:[["Pattern: Primal Spore Binding","Leatherworking","Ziekket"],["Pattern: World Tender's Trunkplate","Leatherworking","Ziekket"]],
 killers:[
  {n:"Light Fire into Grievous Thrash",w:"Light Warden Ruya. The bear-phase group bleed landing on top of the caster-phase dot is the combination that ends pulls. Hold party cooldowns for it.",s:["tk_bv"]},
  {n:"Spouting Floret",w:"Sporeblight Belcher. Very high pulsing damage over six seconds, and there is an extra one of these on the left path.",s:["tk_bv","tk_rt"]},
  {n:"Awaken the Lightbloom",w:"Xyzzyx. Lashers that do not die when killed — miss the frontal that removes them and they come back with a haste boost.",s:["tk_bv"]}],
 areas:[
  {n:"The Grove",mobs:[
   {n:"Lasher",k:"trash",a:[
    {n:"Four-Spined",t:["dot","stacking"],c:["magic","freedom"],r:["tank","healer"],sev:2,e:"Stacks a magic damage-over-time on the tank through melee swings.",h:"Removable by magic dispel or by a freedom effect, so you have two ways to clear it more often. Note the pool video contests whether freedoms work — see the disputes list.",s:["tk_bv"]}]},
   {n:"Lightgorged Lasher",k:"trash",a:[
    {n:"Lightbloom Pollination",t:["shield","heal"],c:["focus"],r:["dps"],sev:2,e:"Buffs and heals nearby allies while the shield holds.",h:"Focus it the moment it happens — the written guide treats this as an interrupt target, so if you can stop the cast outright, do.",s:["tk_bv","iv_bv"]}]},
   {n:"Radiant Spellsower",k:"caster",a:[
    {n:"Light Bolt Volley",t:["groupdmg"],c:["interrupt"],r:["dps"],sev:3,e:"AoE hit on the party.",h:"Always interrupted. These are the mobs that make the left path interrupt-heavy.",s:["tk_bv"]},
    {n:"Frantic Blooming",t:["adds"],c:["cc","focus"],r:["dps"],sev:2,e:"At low health they automatically walk to the nearest dormant lasher camp and wake it.",h:"Slow it and kill it before it arrives. Both sources call this the most important caster in the dungeon.",s:["tk_bv","iv_bv"]}]},
   {n:"Underbrush Stalker",k:"trash",a:[
    {n:"Thornblade",t:["dot","stacking"],c:["bleedcl","defensive"],r:["healer"],sev:2,e:"Teleports to a random player and applies a bleed, which stacks if several of these are in the pack.",h:"Count how many are in a pull before you take it — the stack count is the danger, not the single application.",s:["tk_bv","iv_bv"]}]},
   {n:"Virid Grovekeeper",k:"lt",a:[
    {n:"Earth Rupture Strike",t:["tankbuster","denial"],c:["defensive","position"],r:["tank"],sev:2,e:"Tank hit that drops a puddle where you are standing.",h:"Do not take it on top of your group.",s:["tk_bv"]},
    {n:"Uproot",t:["knockback"],c:["position"],r:["dps","healer","tank"],sev:2,e:"AoE hit and knockback. Not dangerous alone, but there are edges here.",s:["tk_bv"]}]},
   {n:"Sporeblight Belcher",k:"lt",a:[
    {n:"Spouting Floret",t:["groupdmg","channel"],c:["unavoidable","defensive"],r:["healer"],sev:3,e:"Self-buff that pulses very high damage over six seconds.",h:"The scariest lieutenant in the dungeon and the one place both sources independently say to commit a major defensive. Never take two at once.",s:["tk_bv","iv_bv"]},
    {n:"Belch Spores",t:["denial"],c:["dodge"],r:["dps","healer"],sev:2,e:"Spawns circles under every player over a few seconds.",s:["tk_bv"]}]},
   {n:"Thorny Saptor",k:"trash",a:[
    {n:"Hunting Leap",t:["frontal","channel"],c:["cc","dodge"],r:["dps","healer"],sev:1,e:"Leaps to a random player and channels a frontal through them.",h:"Crowd control cancels the channel outright.",s:["tk_bv"]}]},
   {n:"Lightfeather Petalwing",k:"trash",a:[
    {n:"Disorienting Screech",t:["debuff"],c:["interrupt"],r:["dps"],sev:2,e:"Party disorient if it lands.",h:"Assign one player.",s:["tk_bv"]}]},
   {n:"Overgrown Hydra",k:"lt",a:[
    {n:"Light Mob Beams",t:["channel","spread"],c:["spread","drop","defensive"],r:["dps","healer"],sev:2,e:"Channels circles into three players.",h:"Spread to avoid cleaving; a combat drop stops it entirely.",s:["tk_bv"]},
    {n:"Bullet Seeds",t:["line"],c:["dodge"],r:["dps","healer"],sev:1,e:"Lines at random players.",s:["tk_bv"]}]}]},
  {n:"The Third Platform",mobs:[
   {n:"Light Warden's Blight",k:"trash",a:[
    {n:"Blighted Death",t:["death","denial"],c:["position"],r:["tank"],sev:2,e:"Every mob on this platform explodes on death and leaves a puddle behind.",h:"Matters for positioning, especially if you are not clearing the whole platform.",s:["tk_bv"]}]},
   {n:"Luminous Thornmaw",k:"lt",a:[
    {n:"Grievous Gash",t:["tankbuster","dot"],c:["topoff","defensive"],r:["tank","healer"],sev:3,e:"A tank bleed that is removed by healing the tank to full health.",h:"Save your big self-healing for this, and the healer should push into the tank hard. It clears the moment you top off.",s:["tk_bv"]},
    {n:"Solar Breath",t:["frontal"],c:["dodge"],r:["dps","healer"],sev:1,e:"Random-target frontal.",s:["tk_bv"]}]},
   {n:"Potatoad Matriarch",k:"mini",a:[
    {n:"Tongue Toss",t:["tankbuster","knockback"],c:["defensive","position"],r:["tank"],sev:2,e:"Tank buster that launches the tank up and over the mob itself.",h:"Watch where you land — being thrown into another pack is the failure here.",s:["tk_bv"]},
    {n:"Toxic Spew",t:["dot","groupdmg"],c:["poison"],r:["healer"],sev:2,e:"Poison damage-over-time on the whole party.",s:["tk_bv"]},
    {n:"Toadspawn",t:["adds"],c:["focus"],r:["dps"],sev:2,e:"Summons three eggs that hatch after a short delay into tadpoles which toss players around.",h:"Kill the eggs. Cleaning up hatchlings under the mini-boss is worse.",s:["tk_bv","iv_bv"]}]}]}],
 encounters:[
  {n:"Lightblossom Trinity",o:1,img:"tbv-lightblossom-trinity",sub:"Left path. Meittik, Lekshi and Kezkitt — and they share a health bar",shape:"One phase, shared health bar",lv:2,brief:"Three bosses on a single health bar, which means no target swapping and free cleave. The loop is fixed: Meittik ruptures loam, Lekshi dashes between the patches sowing blossoms, Kezkitt channels a beam into each one — and standing in the beam is what stops it growing. Miss the interceptions and the blossoms return heavily empowered. Simple shape, punishing arithmetic.",a:[
   {n:"Thicket's Trinity",t:["shield"],c:["focus"],r:["dps"],sev:3,e:"Meittik, Lekshi and Kezkitt are bonded and share ALL damage taken.",h:"Neither guide mentions this. It means you never need to target-swap — hit whichever is convenient and cleave freely. It reframes the whole encounter.",s:["wh_ej"]},
   {n:"Light Bolt",t:["groupdmg"],c:["interrupt"],r:["dps"],sev:2,e:"Kezkitt casts significant Holy damage at a player. Interruptible.",h:"Keep an interrupt rotation on it.",s:["wh_ej","tk_bv","iv_bv"]},
   {n:"Bedrock Slam",t:["tankbuster","dot","denial"],c:["defensive"],r:["tank","healer"],sev:2,e:"Meittik strikes for heavy Nature damage and massive Physical damage, rupturing topsoil into patches of Fertile Loam — 50% slow and significant damage per second. On Mythic it also triggers Bedrock Surge, moderate damage to the party every second for 8 seconds.",s:["wh_ej","tk_bv"]},
   {n:"Light Sower's Dash",t:["line"],c:["dodge"],r:["dps","healer","tank"],sev:2,e:"Lekshi dashes between the Fertile Loam patches for heavy Holy damage to anyone in the path, sowing a Lightblossom at each destination.",s:["wh_ej"]},
   {n:"Lightblossom Beam",t:["soak","groupdmg"],c:["preposition","soak"],r:["dps","healer","tank"],sev:3,e:"Kezkitt channels a beam into each seed for 8 seconds. Standing in the beam stifles it and prevents Light-Gorged, which is +50% damage per application. At the end the blossom casts Lightbloom Overgrowth — light Holy damage to everyone every second for 8 seconds — and the loam withers into Light-Scorched Earth at significant damage per second.",h:"Pre-position beside the loam circles before the beam starts and you can prevent every tick. Start near an edge and rotate as the room fills.",s:["tk_bv"]},
   {n:"Thornblade",t:["dot","spread"],c:["spread","bleedcl","dodge"],r:["dps","healer"],sev:2,e:"A large circle on a player, a damage-over-time, then the Fan of Thorns immediately after.",h:"Move the circle away from the group, cleanse or defensive the dot, and step out of the fan.",s:["tk_bv"]}]},
  {n:"Ikuzz the Light Hunter",o:2,img:"tbv-ikuzz",sub:"Right path. Roots, and the space to fight in",shape:"One phase, frenzy at 50%",lv:2,brief:"The simplest of the four, and the only one a single talent choice really changes. Roots fill the arena and hold you until they are destroyed — but his own fixate crushes every root he walks over, so a good kite clears the floor for you. At half health he speeds up and pulses damage until he dies. A freedom effect turns this from awkward into easy.",a:[
   {n:"Bloodthorn Roots",t:["root","denial"],c:["freedom","focus"],r:["dps","healer","tank"],sev:3,e:"Moderate Nature damage and rooted in place until the roots are destroyed.",h:"This is the fight where a freedom effect is worth a talent point — you can simply run over the roots to clear them.",s:["tk_bv"]},
   {n:"Thorncaller Roar",t:["groupdmg","adds"],c:["unavoidable"],r:["healer"],sev:2,e:"Spawns roots into the arena and deals a decent chunk of damage over its duration.",s:["tk_bv"]},
   {n:"Verdant Stomp",t:["knockback","root"],c:["position","freedom"],r:["dps","healer","tank"],sev:3,t:["knockback","root","myth"],e:"heavy damage and a knockback, then Bloodthorn Roots emerge at every player's location 4 seconds later.",h:"Without freedom, loosely spread in melee range so your roots get cleaved off fast — while making sure the initial spawn hit does not cleave allies.",s:["tk_bv"]},
   {n:"Bloodthirsty Gaze",t:["fixate"],c:["kite"],r:["dps","healer"],sev:2,e:"He pursues one player for 10 seconds. His Crushing Footfalls deal moderate damage and crush any Bloodthorn Roots within 7 yards every second. Catching you means Incise — heavy damage bleed per second for 3 seconds — then Crunched, a 5-second stun.",h:"It is the FOOTFALLS that clear roots, not the chase line. Walk him deliberately over root clusters and you clear the arena for free.",s:["wh_ej","tk_bv","iv_bv"]},
   {n:"Light Crazed Frenzy",t:["enrage","groupdmg"],c:["defensive"],r:["healer"],sev:2,e:"He absorbs the Lightbloom fully: +20% movement speed and moderate Holy damage pulsing every 2 seconds.",h:"Harder to kite and Thorncaller Roar gets much worse. Save party cooldowns for after the transition.",s:["tk_bv"]}]},
  {n:"Lightwarden Ruia",o:3,img:"tbv-lightwarden-ruia",sub:"Three phases by health, then all of them at once",shape:"Three phases, 70% and 40%",lv:3,brief:"Genuinely three-phase, and the odyssey of the dungeon. He opens as a caster dropping silencing Lightfire beams, shifts to bear at 70% for a party bleed that only clears by topping everyone to full, then returns at 40% and channels spirits that cycle all four abilities every eight seconds. The last phase is where it kills — Lightfire landing into Grievous Thrash is the overlap to hold cooldowns for.",a:[
   {n:"Warden's Wrath",t:["tankbuster"],c:["interrupt"],r:["dps"],sev:2,e:"Spammed at the tank in the opening Moonkin form.",h:"Keep interrupts on it.",s:["tk_bv"]},
   {n:"Light Fire",t:["dot","spread","silence"],c:["spread","dodge"],r:["dps","healer"],sev:3,e:"Moderate Radiant damage every second for 6 seconds. On expiry, Lightfire BEAMS emerge at the afflicted player's location — moderate damage per second and a 6-second silence to anyone standing in them.",h:"Both guides describe tornadoes; the journal says beams that persist where you were standing. Move before it expires and leave the beams somewhere nobody needs to walk.",s:["wh_ej","tk_bv"]},
   {n:"Lightfall",t:["denial"],c:["dodge"],r:["dps","healer","tank"],sev:1,e:"A set of circles to avoid.",s:["tk_bv"]},
   {n:"Grievous Thrash",t:["groupdmg","dot"],c:["topoff"],r:["healer","dps"],sev:3,e:"Heavy damage plus a bleed of light damage per second lasting FORTY seconds or until the target is fully healed. It stacks.",h:"Healer and debuffed players have to work together to top everyone off — this is not a heal-when-convenient bleed.",s:["tk_bv"]},
   {n:"Pulverizing Strikes",t:["frontal","amp"],c:["spread","dodge"],r:["dps","healer"],sev:2,e:"He marks several targets and fires a cone at each every 2 seconds for 6 seconds. Being struck applies Pulverized: +100% damage from Pulverizing Strikes for 6 seconds.",h:"The amplifier is specifically against this ability, so eating the first cone doubles the next two. Move the instant you are marked.",s:["wh_ej","tk_bv"]},
   {n:"Spirits of the Veil",t:["channel","adds"],c:["defensive"],r:["dps","healer","tank"],sev:3,e:"At 40% he returns to Haranir form and channels until defeated, casting Lightfire, Lightfall, Pulverizing Strikes and Grievous Thrash every 8 seconds.",h:"The Light Fire into Grievous Thrash sequence is where you commit defensives and healing cooldowns.",s:["tk_bv"]}]},
  {n:"Ziekket",o:4,img:"tbv-ziekket",sub:"Lashers that do not stay dead",shape:"One phase, no downtime",lv:3,brief:"One phase with no breathing room: Oozing Xylem pulses on the party from pull to kill. Lashers sprout and refuse to die, going dormant rather than dropping, and only a frontal sweep liquifies them — any you leave reawaken immune to crowd control. Meanwhile orbs drift toward him and each one that lands gives a stacking shield and damage buff. Tank on an edge, cleave, sweep, move, repeat.",a:[
   {n:"Oozing Xylem",t:["groupdmg"],c:["unavoidable"],r:["healer"],sev:2,e:"Moderate Holy damage to all players every 3 seconds for the entire encounter. There is no break.",s:["wh_ej","tk_bv"]},
   {n:"Awaken the Lightbloom",t:["adds"],c:["interrupt","cc","position"],r:["dps","tank"],sev:3,e:"Lightspawn Lashers sprout and bolt at players. At 1% health they go DORMANT — submerged, immune to everything — rather than dying. Concentrated Lightbeam liquifies dormant ones into Lightsap (heavy damage every 2 seconds, 40% slow). Any left dormant reawaken with Vicious Regrowth: +30% haste and damage, AND immune to interrupts and crowd control.",h:"Tank on the edge, cleave the lashers there, then shift towards the centre so the frontal line sweeps all of them. Move to a new edge and repeat.",s:["tk_bv"]},
   {n:"Lightbloom's Essence",t:["soak","dot"],c:["soak"],r:["dps","healer"],sev:3,t:["soak","dot","myth"],e:"Orbs drift towards him; arrival triggers Fluorescent Outburst — significant damage to the party and a Fluorescent Shield absorbing significant amount of with +10% damage done, STACKING. Touching one instead grants Lightbloom's Might: +10% damage and healing while taking light Holy damage per second for 12 seconds, stacking.",h:"Letting orbs through is not just a hit — it gives him a stacking shield and a stacking damage buff. Every orb matters more than either guide implies.",s:["wh_ej","tk_bv","iv_bv"]},
   {n:"Thorn Spike",t:["tankbuster","dot"],c:["defensive","bleedcl"],r:["tank"],sev:2,e:"Heavy Holy damage, a knockback, and a bleed of moderate damage per second for 10 seconds.",h:"The knockback is not in either guide. Do not take it with your back to the lasher pack.",s:["wh_ej","tk_bv"]}]}],
loot:{s:["iv_bv"],i:[
  {n:"Pruning Lance",ic:"inv_polearm_2h_rutaani_b_01",id:251181,sl:"Two-hand",ty:"Polearm",b:"Lightblossom Trinity",p:["Str"],x:[["Haste",8],["Vers",6]]},
  {n:"Thornblade",ic:"inv_knife_1h_rutaani_b_01",id:251180,sl:"One-hand",ty:"Dagger",b:"Lightblossom Trinity",p:["Agi"],x:[["Mastery",4],["Haste",3]]},
  {n:"Ironroot Collar",ic:"inv_shoulder_mail_dungeonharronir_c_01",id:251184,sl:"Shoulder",ty:"Mail",b:"Lightblossom Trinity",p:["Agi","Int"],x:[["Haste",7],["Vers",4]]},
  {n:"Rootwarden Wraps",ic:"inv_bracer_leather_dungeonharronir_c_01",id:251183,sl:"Wrist",ty:"Leather",b:"Lightblossom Trinity",p:["Agi","Int"],x:[["Crit",5],["Mastery",3]]},
  {n:"Lightblossom Cinch",ic:"inv_belt_cloth_dungeonharronir_c_01",id:251185,sl:"Waist",ty:"Cloth",b:"Lightblossom Trinity",p:["Int"],x:[["Mastery",6],["Haste",4]]},
  {n:"Bedrock Breeches",ic:"inv_pant_plate_dungeonharronir_c_01",id:251182,sl:"Legs",ty:"Plate",b:"Lightblossom Trinity",p:["Str","Int"],x:[["Crit",9],["Vers",6]]},
  {n:"Seed of Radiant Hope",ic:"inv12_jewelrytrinkets_dungeon_seedofradianthope",id:250254,sl:"Trinket",ty:"Trinket",b:"Lightblossom Trinity",p:["Int"],u:"Surround your target ally with Lightblossoms, healing them over 12 sec. If their health falls below 50%, the Lightblossoms fully bloom in radiant light, instantly healing them. (1 Min, 30 Sec Cooldown)",ro:["healer"]},
  {n:"Thorntalon Edge",ic:"inv_hand_1h_dungeonharronir_c_01",id:251186,sl:"One-hand",ty:"Fist",b:"Ikuzz the Light Hunter",p:["Agi"],x:[["Mastery",4],["Crit",3]]},
  {n:"Doompetal",ic:"inv_wand_1h_dungeonharronir_c_01",id:251188,sl:"Ranged",ty:"Wand",b:"Ikuzz the Light Hunter",p:["Int"],x:[["Haste",4],["Mastery",3]]},
  {n:"Amirdrassil's Reach",ic:"inv_crossbow_2h_dungeonharronir_c_01",id:251187,sl:"Ranged",ty:"Crossbow",b:"Ikuzz the Light Hunter",p:["Agi"],x:[["Vers",8],["Crit",6]]},
  {n:"Bloodthorn Burnous",ic:"inv_cape_mail_dungeonharronir_c_01",id:251190,sl:"Back",ty:"Cloak",b:"Ikuzz the Light Hunter",p:["Str","Agi","Int"],x:[["Haste",5],["Mastery",3]]},
  {n:"Rootwalker Harness",ic:"inv_belt_leather_dungeonharronir_c_01",id:251189,sl:"Waist",ty:"Leather",b:"Ikuzz the Light Hunter",p:["Agi","Int"],x:[["Vers",7],["Crit",4]]},
  {n:"Seed of the Devouring Wild",ic:"inv12_jewelrytrinkets_dungeon_seedofthedevouringwild",id:250238,sl:"Trinket",ty:"Trinket",b:"Ikuzz the Light Hunter",p:["Str"],x:[["Mastery",29]],u:"Awaken the Bloodthorn Roots, erupting around your target and inflicting Nature damage split among nearby enemies. You absorb their essence, gaining Mastery for 10 sec. (1 Min, 30 Sec Cooldown)",ro:["mdps"]},
  {n:"Branch of Pride",ic:"inv_staff_2h_dungeonharronir_c_01",id:251192,sl:"Two-hand",ty:"Staff",b:"Lightwarden Ruia",p:["Agi"],x:[["Crit",9],["Vers",5]]},
  {n:"Luminescent Sprout",ic:"inv_offhand_1h_dungeonharronir_c_01",id:251191,sl:"Off-hand",ty:"Off-hand",b:"Lightwarden Ruia",p:["Int"],x:[["Mastery",4],["Haste",3]]},
  {n:"Taproot Ribs",ic:"inv_chest_plate_dungeonharronir_c_01",id:251193,sl:"Chest",ty:"Plate",b:"Lightwarden Ruia",p:["Str","Int"],x:[["Haste",9],["Vers",5]]},
  {n:"Pulverizing Pads",ic:"inv_glove_mail_dungeonharronir_c_01",id:251165,sl:"Hands",ty:"Mail",b:"Lightwarden Ruia",p:["Agi","Int"],x:[["Crit",6],["Vers",4]]},
  {n:"Lightwarden's Bind",ic:"inv12_jewelrytrinkets_rutaani_ring_yellow",id:251194,sl:"Ring",ty:"Ring",b:"Lightwarden Ruia",x:[["Mastery",13],["Vers",7]]},
  {n:"Lightspire Core",ic:"inv_enchant_essenceastrallarge",id:250214,sl:"Trinket",ty:"Trinket",b:"Lightwarden Ruia",p:["Agi","Int"],x:[["Mastery",35]],e:"You are embraced by the Light, increasing Mastery. Your damaging spells and abilities can call a beam of radiant light nearby. Standing in the light blesses you with Mastery while you stand in it.",ro:["healer","rdps","mdps"]},
  {n:"Thorned Reply",ic:"inv_sword_1h_dungeonharronir_c_01",id:251195,sl:"One-hand",ty:"Sword",b:"Ziekket",p:["Str"],x:[["Haste",4],["Crit",3]]},
  {n:"Teldrassil's Sacrifice",ic:"inv_shield_1h_rutaani_b_01",id:251196,sl:"Off-hand",ty:"Shield",b:"Ziekket",p:["Str","Int"],x:[["Crit",4],["Vers",3]]},
  {n:"Worldroot Canopy",ic:"inv_helm_cloth_dungeonharronir_c_01",id:251199,sl:"Head",ty:"Cloth",b:"Ziekket",p:["Int"],x:[["Mastery",9],["Crit",5]]},
  {n:"Saptorbane Guards",ic:"inv_bracer_mail_dungeonharronir_c_01",id:251200,sl:"Wrist",ty:"Mail",b:"Ziekket",p:["Agi","Int"],x:[["Haste",5],["Crit",3]]},
  {n:"Thornspike Gauntlets",ic:"inv_glove_plate_dungeonharronir_c_01",id:251197,sl:"Hands",ty:"Plate",b:"Ziekket",p:["Str","Int"],x:[["Mastery",7],["Vers",4]]},
  {n:"Lightspore Leggings",ic:"inv_pant_leather_dungeonharronir_c_01",id:251198,sl:"Legs",ty:"Leather",b:"Ziekket",p:["Agi","Int"],x:[["Vers",9],["Mastery",5]]},
  {n:"Sapling of the Dawnroot",ic:"inv_misc_herb_nightmarevine",id:250259,sl:"Trinket",ty:"Trinket",b:"Ziekket",p:["Str","Agi","Int"],e:"Your spells and abilities have a chance to uproot a Lightspawn Lasher to aid you in combat for 15 sec, dealing Physical damage. The Lightspawn Lasher then withers, bursting into light-infused sap and inflicting Holy damage split among nearby enemies.",ro:["rdps","mdps"]}]},
 route:[
  {n:1,t:"Choose right",m:"Headwing and scepter mobs",d:2,p:"The routing video prefers right: the left path has considerably more interrupts and an extra Belcher. The right side's bolt-casters can largely be ignored once packs are grouped.",s:["tk_rt"]},
  {n:2,t:"Group on the casters",m:"Spam casters, petalwing",d:2,p:"Interrupt to group them, then tag backwards to the petalwing area and fight there.",s:["tk_rt"]},
  {n:3,t:"Hug the left path",m:"Beetles, hydras, one kick each",d:1,p:"Beetles are nothing. The pattern here is one big mob to hit plus a handful of small ones.",s:["tk_rt"]},
  {n:4,t:"Bridge pull",m:"Larger mixed pack",d:2,p:"Separable if you want. Lust will not be up yet.",s:["tk_rt"]},
  {n:5,t:"Boss platform",m:"About a third of the platform stays unpulled",d:2,p:"Pull the boss over to the cleared side. Optionally bring the leafy grove caller in with the previous pull for more room.",s:["tk_rt"]},
  {n:6,t:"Post-boss packs",m:"Petalwings and a belcher",d:3,p:"Always focus the Belcher. There is one under the bridge whose placement looks wrong in MDT.",s:["tk_rt"]},
  {n:7,t:"Final approach",m:"Two casters plus the primal mob",d:2,p:"Preferred over the alternative pull, which has a third caster.",s:["tk_rt"]},
  {n:8,t:"Final boss",m:"—",d:2,p:"Do not fight in the near section of the arena. Play the far side.",s:["tk_rt"]}],
 reads:[{t:"On paper the dungeon with the most routing choice in the pool: two forks, far more trash than you need, and skips that do not require shroud or invisibility potions — which is unusually pug-friendly.",by:"Tactyks",d:"2026-07-25",s:["tk_pool"]},
        {t:"MDT's data for this dungeon looks wrong in places — both positioning and pack composition. Expect an early-season correction.",by:"Tactyks",d:"2026-08-15",s:["tk_rt"]}]},

/* ─────────────────────────── VOIDSCAR ARENA ───────────────────────── */
{id:"voidscar-arena",name:"Voidscar Arena",short:"Voidscar",banner:"voidscar-arena",sigil:"i-rift",origin:"Midnight",
 timer:{v:"30 min",s:["wh_dg"]},bosses:3,routing:"hybrid",
 blurb:"Two path choices, two stat buffs, and a wave-based arena in the middle. Reported to have the most lenient timer in the pool.",
 cov:"Three independent sources plus the Encounter Journal and two Blizzard hotfixes. Timer confirmed at 30 minutes — which sits awkwardly with the community view that this dungeon has the most lenient timer, since only Ruby Life Pools is shorter.",cov2:true,
 dispels:{poison:3,magic:1,curse:0,disease:0,enrage:0,bleed:2},
 gates:[{t:"Choose left or right at the entrance. Each path ends in a different mini-boss and grants a different party stat buff for the rest of the dungeon.",s:["tk_vsa"]},
        {t:"Clear several waves of trash in the arena before the first boss can be engaged.",s:["tk_vsa"]},
        {t:"Defeat all three Devouring Brutalizers before the final boss.",s:["tk_vsa"]}],
 buffs:[{n:"Proof of Endurance",e:"Versatility for the party for the rest of the dungeon. Amount contested — see disputes.",w:"Everyone — kill the left mini-boss, Aegyra the Unyielding",loc:"Left path",s:["tk_vsa","tk_rt"]},
        {n:"Proof of Mastery",e:"Five mastery points per player, so its real value scales with your spec's mastery modifier.",w:"Everyone — kill the right mini-boss, Raj'kess the Spellstorm",loc:"Right path",s:["tk_vsa"]}],
 loc:{zone:"The Voidstorm, in Slayer's Rise to the north",way:"/way #2444 53.6 34.4",tp:"Path of the Brutal Combatant",lvl:90,note:"Portal to the Voidstorm from Silvermoon City at /way #2393 35.3 65.3."},
 calls:{s:["wh_dg"],i:[["Demoralizing Shout", "Dominated Brawler", "T1"], ["Shadowbolt Volley", "Voidtouched Magi", "T1"], ["Violent Sand", "Angry Krolusk", "T1"], ["Mad Shriek", "Killvore Screamer", "T2"], ["Mending Void", "Voidminder", "T3"]],d:[["Melt Armor", "Sycophantic Tarasek", "T1"], ["Corrosive Essence", "Agitated Voidscythe", "T2"], ["Mind-Numbing Poison", "Atroxus", "B2 — only if you stood in a pool"]],p:[["Bolster", "Longtooth Tuskarr", "T1"]]},
 rewards:[["Design: Voidstone Shielding Array","Jewelcrafting","Charonus"]],
 killers:[
  {n:"Sickening Bite",w:"Toxic Creeper on Ataraxis. Stacks on the tank, amplifies all AoE damage on the encounter, and turns Hulking Claw — which is entirely nature damage — into a genuine threat.",s:["tk_vsa"]},
  {n:"Mad Shriek",w:"Kilivore Screamer. Fears the whole party. Assign it before the pull.",s:["tk_vsa"]},
  {n:"Devour",w:"Devouring Brutalizer. If it finishes eating a low-health mob it heals for half its health and gains a large damage increase.",s:["tk_vsa"]}],
 areas:[
  {n:"The Entrance Halls",mobs:[
   {n:"Feral Saberon",k:"trash",a:[
    {n:"Savage Leap",t:["dot"],c:["bleedcl","defensive"],r:["healer"],sev:1,e:"Leaps to a random player and applies a bleed.",h:"Stay topped up — the danger is the leap landing on someone already low.",s:["tk_vsa","iv_vsa"]},
    {n:"Feral Rage",t:["enrage"],c:["soothe"],r:["tank","dps"],sev:2,e:"Self-buff that becomes a real problem in proportion to how many saberon you pulled.",s:["iv_vsa"]}]},
   {n:"Sycophantic Tarasek",k:"trash",a:[
    {n:"Melt Armor",t:["amp","stacking"],c:["magic","defensive"],r:["tank","healer"],sev:2,e:"Armour reduction on the tank — and it can be dispelled.",h:"Absent from the creator guide entirely. If your tank is taking odd physical spikes in this dungeon, look here first.",s:["iv_vsa"]}]},
   {n:"Lost Sethrak",k:"fodder",a:[
    {n:"Venomous Spit",t:["frontal"],c:["dodge"],r:["dps","healer"],sev:1,e:"Sidestep it.",s:["iv_vsa"]}]},
   {n:"Enthralled Shaman",k:"caster",a:[
    {n:"Magma Totem",t:["totem","groupdmg"],c:["focus"],r:["dps"],sev:2,e:"Spawns a totem that pulses AoE damage.",h:"Swap quickly — these are cheap to kill and expensive to ignore.",s:["tk_vsa"]}]},
   {n:"Dominated Brawler",k:"trash",a:[
    {n:"Demoralizing Shout",t:["debuff"],c:["interrupt","cc"],r:["dps"],sev:3,e:"Party-wide damage reduction if it lands.",h:"Higher interrupt priority than the shaman bolts. With three brawlers in one pack, crowd control one of them instead.",s:["tk_vsa","tk_rt"]}]},
   {n:"Brutal Overseer",k:"lt",a:[
    {n:"Brutal Slams",t:["channel","shield","groupdmg"],c:["focus"],r:["dps"],sev:3,e:"Damage continues for as long as the shield on them holds.",h:"Focus the moment the channel starts. Left alone this is very dangerous.",s:["tk_vsa"]},
    {n:"Maelstrom",t:["fixate"],c:["dodge"],r:["dps","healer"],sev:1,e:"Whirlwind attack and a player fixate.",s:["tk_vsa"]}]},
   {n:"Voidtouched Magi",k:"lt",a:[
    {n:"Shadow Bolt Volley",t:["groupdmg"],c:["interrupt"],r:["dps"],sev:2,e:"AoE hit on the party.",s:["tk_vsa"]},
    {n:"Null Eruption",t:["denial"],c:["position"],r:["dps","healer"],sev:2,e:"AoE on a player that leaves a puddle on expiry.",h:"Walk it away from the group before it drops.",s:["tk_vsa"]}]},
   {n:"Aegyra the Unyielding",k:"mini",a:[
    {n:"Ferocious Leap",t:["dot"],c:["bleedcl"],r:["healer"],sev:1,e:"Random-target leap and bleed.",s:["tk_vsa"]},
    {n:"Earth Splitter",t:["denial"],c:["position"],r:["dps","healer","tank"],sev:1,e:"AoE that leaves a large puddle.",h:"If you were the leap target you can bait this towards the outside of the arena.",s:["tk_vsa"]},
    {n:"Champion Spear",t:["spread","adds"],c:["focus","freedom","spread"],r:["dps","healer","tank"],sev:3,e:"Throws a spear that tethers everyone, then places AoE circles around every player. Stacked and unbroken, they explode together.",h:"Focus the spear down. If it will not break in time, use movement speed or freedom to separate before the circles land.",s:["tk_vsa","bz0813"]}]},
   {n:"Raj'kess the Spellstorm",k:"mini",a:[
    {n:"Forked Lightning",t:["groupdmg"],c:["unavoidable"],r:["healer"],sev:2,e:"Spammed at the tank, bouncing to two random players.",s:["tk_vsa"]},
    {n:"Orbs of Disruption",t:["totem","debuff"],c:["focus"],r:["dps"],sev:2,e:"Spawns orbs with a long cast. If it completes you get a haste debuff.",h:"Long cast means there is no excuse.",s:["tk_vsa"]},
    {n:"Thundering Storm",t:["channel","groupdmg"],c:["unavoidable"],r:["healer"],sev:2,e:"Heavy channelled damage.",s:["tk_vsa"]}]}]},
  {n:"The Arena Waves",mobs:[
   {n:"Chitigoth",k:"mini",a:[
    {n:"Insidious Aura",t:["channel","groupdmg"],c:["unavoidable"],r:["healer"],sev:2,e:"Channelled AoE damage.",s:["tk_vsa"]},
    {n:"Ravenous Swarm",t:["denial"],c:["dodge"],r:["dps","healer"],sev:1,e:"Circles that roam the area.",s:["tk_vsa"]}]},
   {n:"Protective Turtle",k:"trash",a:[
    {n:"Shell Guard",t:["shield"],c:["position"],r:["tank","dps"],sev:2,e:"Shields itself and nearby enemies. When it expires the turtle is stunned and takes extra damage.",h:"Keep it away from the pack while the shield is up, then drag everything onto it and cleave.",s:["tk_vsa"]}]},
   {n:"Brutok",k:"mini",a:[
    {n:"Fel Steps",t:["groupdmg"],c:["position"],r:["tank"],sev:3,e:"Passive. Pulses damage with every step it takes.",h:"Move him as little as possible. The whole encounter is about not walking.",s:["tk_vsa"]},
    {n:"Smashing Charge",t:["line"],c:["position","los"],r:["tank"],sev:3,e:"Line attack at the tank across the arena.",h:"Tank him near a wall so the charge has nowhere to go. Blizzard has hotfixed this charging through doors.",s:["tk_vsa","bz0814"]},
    {n:"Head Bash",t:["tankbuster","knockback"],c:["defensive"],r:["tank"],sev:2,e:"Tank buster with a knockback. The written guide instead flags a Concussion window that opens right after Smashing Charge.",h:"If Concussion is a damage-taken window on him, that is your burst cue — worth confirming on the first pull.",s:["tk_vsa","iv_vsa"]}]},
   {n:"Angry Krul",k:"trash",a:[
    {n:"Violent Sands",t:["groupdmg"],c:["interrupt"],r:["dps"],sev:2,e:"AoE cast.",h:"Have an interrupt ready — it is a one-off mob and easy to forget.",s:["tk_vsa"]}]}]},
  {n:"The Converging Paths",mobs:[
   {n:"Watchful Harrower",k:"lt",a:[
    {n:"Sky Strike",t:["soak","knockup"],c:["soak","position"],r:["dps","healer","tank"],sev:2,e:"Random-target soak that splits the damage, followed by a knock-up and an AoE hit.",h:"Everyone gets in for the split, then runs out of the follow-up.",s:["tk_vsa"]},
    {n:"Void Beam",t:["channel"],c:["drop","defensive"],r:["healer"],sev:2,e:"Channels into a random player.",h:"Extra healing, a defensive, or a combat drop to stop it entirely.",s:["tk_vsa"]}]},
   {n:"Agitated Voidscythe",k:"lt",a:[
    {n:"Corrosive Essence",t:["dot"],c:["poison"],r:["healer"],sev:2,e:"Poison damage-over-time on three random players — their main source of damage.",h:"This whole path becomes easy with even one poison dispel in the group.",s:["tk_vsa","tk_rt"]},
    {n:"Rip and Slice",t:["tankbuster","dot"],c:["bleedcl","defensive"],r:["tank"],sev:2,e:"Bleed on the tank.",s:["tk_vsa"]}]},
   {n:"Kilivore Screamer",k:"trash",a:[
    {n:"Mad Shriek",t:["fear"],c:["interrupt"],r:["dps"],sev:3,e:"Fears every player.",h:"The most important interrupt in the area. Assign it by name.",s:["tk_vsa","iv_vsa"]}]},
   {n:"Savage Shredclaw",k:"trash",a:[
    {n:"Shred Defense",t:["amp","stacking"],c:["defensive","kite"],r:["tank"],sev:2,e:"Applies a ten-second damage-taken increase to the tank, and it stacks.",h:"Track the stack count rather than your health bar.",s:["tk_vsa"]}]},
   {n:"Devouring Brutalizer",k:"lt",a:[
    {n:"Devour",t:["heal","amp"],c:["focus"],r:["dps"],sev:3,e:"A fairly long cast on a nearby low-health mob. If it completes, the Brutalizer eats it, heals for 50% of its health and gains a large damage increase.",h:"Swap to whichever mob is being devoured the instant it starts.",s:["tk_vsa"]},
    {n:"Brutalize",t:["channel","tankbuster"],c:["defensive"],r:["tank"],sev:2,e:"Heavy tank damage over the channel.",s:["tk_vsa"]},
    {n:"Concussive Slam",t:["knockback","dot"],c:["position"],r:["dps","healer","tank"],sev:2,e:"An AoE knockback familiar from Season 1's Dread Bellow, plus a damage-over-time.",h:"Do not get knocked into a nearby pack.",s:["tk_vsa"]}]},
   {n:"Void Minder",k:"caster",a:[
    {n:"Mending Void",t:["channel","heal"],c:["interrupt","cc"],r:["dps"],sev:2,e:"Channels healing into a nearby mob.",s:["tk_vsa"]},
    {n:"Dimensional Shred",t:["dot"],c:["defensive"],r:["healer"],sev:1,e:"Damage on random players.",s:["tk_vsa"]}]}]}],
 encounters:[
  {n:"Taz'Rah",o:1,img:"va-tazrah",sub:"Five shades and a shrinking floor",shape:"One phase, shrinking floor",lv:2,brief:"One phase in a room that keeps shrinking. Five shades dash lines through the party and then leave two-minute puddles beneath themselves, so the group stays loosely together, takes the dash as one, and rotates around the arena edge as the floor fills. Dark Bloom later detonates those puddles, which turns a dodge check into a healing check.",a:[
   {n:"Nether Dash",t:["line","dot","spread"],c:["spread"],r:["dps","healer","tank"],sev:2,e:"Each Ethereal Shade dashes through its target for significant damage plus moderate damage every second for a full 15 seconds.",h:"Contested emphasis: the creator guide says loosely spread to avoid cleaving, the written guide says stay closer together so the puddles that follow land in a manageable cluster. Both agree the puddles are the real problem — err towards grouped.",s:["tk_vsa","iv_vsa"]},
   {n:"Umbral Rupture",t:["denial"],c:["position"],r:["dps","healer","tank"],sev:3,t:["denial","myth"],e:"very heavy Shadow damage within 10 yards of impact, leaving Void Fissures that eat away at heavy damage per second.",h:"Always follows Nether Dash, which is why you do not over-spread. Stay grouped along the arena edge and rotate around as puddles form.",s:["tk_vsa"]},
   {n:"Void Blast",t:["tankbuster","knockback"],c:["defensive"],r:["tank"],sev:2,e:"Tank hit and knockback.",s:["tk_vsa"]},
   {n:"Dark Bloom",t:["denial"],c:["dodge"],r:["dps","healer"],sev:2,e:"A wave of void energy for heavy damage to everyone, which also erupts the Void Fissures for a further heavy damage to anyone caught.",h:"Both guides describe orbs shooting from puddles. The journal describes a party-wide hit that detonates the fissures — so it is a healing check plus a dodge, not just a dodge.",s:["wh_ej","tk_vsa"]}]},
  {n:"Atroxus",o:2,img:"va-atroxus",sub:"Area denial, and a creeper that must be kited",shape:"One phase, tank kiting",lv:3,brief:"A kiting fight that the tank decides. Every roar spawns a Toxic Creeper that fixates the tank and drops puddles as it walks, and each melee swing it lands stacks a large nature vulnerability that lasts five minutes and does not fall off inside the encounter. Those stacks then feed Hulking Claw, which is pure nature damage. Kite it cleanly and this is routine; eat the stacks and the buster becomes lethal.",a:[
   {n:"Poison Splash",t:["groupdmg","denial","channel"],c:["unavoidable","dodge"],r:["healer","dps"],sev:3,e:"Ticks heavy party damage and spawns poison puddles that reduce haste on contact.",s:["tk_vsa"]},
   {n:"Noxious Breath",t:["frontal"],c:["dodge","position"],r:["dps","healer"],sev:2,e:"A large random-target frontal.",h:"Ranged should play closer to melee than usual so it is easier to step out of.",s:["tk_vsa"]},
   {n:"Monstrous Roar",t:["adds"],c:["focus"],r:["dps"],sev:2,e:"Significant Physical damage to the party, ignoring armour, and agitates a pool into a Toxic Creeper. On Mythic its Toxic Aura hits everyone within 100 yards for light damage every half second — there is no outranging it.",h:"DPS swap immediately to cut the area denial short.",s:["tk_vsa"]},
   {n:"Sickening Bite",t:["stacking","amp"],c:["kite"],r:["tank"],sev:3,e:"+50% Nature damage taken per stack, lasting FIVE MINUTES. It stacks, and it does not fall off within the encounter.",h:"Kite it and do not let it melee you at all — the written guide is blunt that eating these is simply death. Everything else on this fight is negotiable; this is not.",s:["tk_vsa","iv_vsa"]},
   {n:"Hulking Claw",t:["tankbuster"],c:["defensive"],r:["tank"],sev:3,e:"Heavy Nature damage plus moderate damage per second for 10 seconds — tagged Poison, so the follow-up is dispellable.",h:"Magic mitigation matters here in a way it does not on most busters in the pool, and it scales with your Sickening Bite stacks. The follow-up poison is dispellable — worth telling your healer.",s:["tk_vsa","iv_vsa"]}]},
  {n:"Charonus",o:3,img:"va-charonus",sub:"Three singularities, an orb each, and nowhere safe in the middle",shape:"One phase, positional puzzle",lv:3,brief:"A spatial puzzle where everybody has a job. Three singularities drag players inward and lock anyone who touches them out of the fight for fifteen seconds, and an orb spawns near every player that dies only by being walked into one. So each person claims a singularity, feeds their orb into it, and the group stays loosely spread for Cosmic Crash without drifting toward the middle.",a:[
   {n:"Unstable Singularity",t:["denial","groupdmg","pacify"],c:["position"],r:["dps","healer","tank"],sev:3,e:"Light Shadow damage per second to everyone, slowly dragging players toward the centre. Touching one applies Atomized: unable to attack or use any ability for FIFTEEN seconds.",h:"Fighting the pull is easier the closer to the centre of the formation you stand.",s:["tk_vsa"]},
   {n:"Cosmic Crash",t:["spread","dot"],c:["spread"],r:["dps","healer"],sev:3,e:"Void comets at every player: significant damage within 8 yards, then light damage per second for 20 seconds, plus a knockback.",h:"You cannot stack. Loosely spread shortly after the singularities form — and mind the knockback, because being shoved into a singularity is a 15-second Atomize.",s:["wh_ej","tk_vsa"]},
   {n:"Gravitic Orbs",t:["fixate","dot"],c:["kite","position"],r:["dps"],sev:3,e:"One orb spawns near EVERY player, each stacking light damage per second and a 2% slow. An orb within 6 yards of a singularity is destroyed.",h:"Both guides were wrong here — one said three DPS, the other three random players. The journal says one per player, so everybody has a job. Pre-position beside a singularity before the cast and there is no scramble.",s:["wh_ej","tk_vsa","iv_vsa"]},
   {n:"Dark Waves",t:["frontal","tankbuster"],c:["defensive","position"],r:["tank"],sev:2,e:"Frontal at the tank.",h:"Point it away from anyone kiting an orb.",s:["tk_vsa"]},
   {n:"Void Cascade",t:["line"],c:["kite","position"],r:["dps","healer"],sev:2,t:["line","myth"],e:"Condensed cosmic power projected at nearby players: very heavy Shadow damage and a knockback to anyone it contacts. Dodgeable, and it does not home.",h:"Create distance and outrun them. Everyone else stands behind the boss so they do not intercept.",s:["tk_vsa"]}]}],
loot:{s:["iv_vsa"],i:[
  {n:"Taz'Rah's Cosmic Edge",ic:"inv_sword_1h_domanaar_b_01",id:251218,sl:"One-hand",ty:"Sword",b:"Taz'Rah",p:["Str"],x:[["Haste",4],["Mastery",3]]},
  {n:"Voidscarred Crown",ic:"inv_helm_mail_dungeonharronir_c_01",id:251220,sl:"Head",ty:"Mail",b:"Taz'Rah",p:["Agi","Int"],x:[["Haste",9],["Mastery",5]]},
  {n:"Somber Spaulders",ic:"inv_shoulder_leather_dungeonharronir_c_01",id:251223,sl:"Shoulder",ty:"Leather",b:"Taz'Rah",p:["Agi","Int"],x:[["Crit",7],["Haste",4]]},
  {n:"Despondent's Gauntlets",ic:"inv_glove_plate_dungeonharronir_c_01",id:251221,sl:"Hands",ty:"Plate",b:"Taz'Rah",p:["Str","Int"],x:[["Vers",6],["Mastery",4]]},
  {n:"Ethereal Netherwrap",ic:"inv_belt_cloth_dungeonharronir_c_01",id:251222,sl:"Waist",ty:"Cloth",b:"Taz'Rah",p:["Int"],x:[["Haste",7],["Crit",4]]},
  {n:"Riftworn Stompers",ic:"inv_boot_cloth_dungeonharronir_c_01",id:251219,sl:"Feet",ty:"Cloth",b:"Taz'Rah",p:["Int"],x:[["Haste",6],["Crit",4]]},
  {n:"Void Execution Mandate",ic:"inv_inscription_80_warscroll_intellect",id:250225,sl:"Trinket",ty:"Trinket",b:"Taz'Rah",p:["Agi"],x:[["Crit",4]],u:"Mark your target for execution, increasing your Haste for 20 sec. While the target is marked, each of your attacks against them grants an additional Critical Strike, as the Void urges you to finish the kill, up to a maximum Critical Strike. (2 Min Cooldown)",ro:["mdps"]},
  {n:"Fang of Contagion",ic:"inv_knife_1h_dungeonharronir_c_02",id:251225,sl:"One-hand",ty:"Dagger",b:"Atroxus",p:["Int"],x:[["Mastery",4],["Vers",3]]},
  {n:"Hulking Handaxe",ic:"inv_axe_1h_dungeonharronir_c_01",id:251224,sl:"One-hand",ty:"Axe",b:"Atroxus",p:["Agi"],x:[["Mastery",5],["Haste",2]]},
  {n:"Visor of the Predator",ic:"inv_helm_armor_domanaar_d_01",id:251229,sl:"Head",ty:"Plate",b:"Atroxus",p:["Str","Int"],x:[["Crit",9],["Mastery",5]]},
  {n:"Poisoner's Pauldrons",ic:"inv_shoulder_cloth_dungeonharronir_c_01",id:251227,sl:"Shoulder",ty:"Cloth",b:"Atroxus",p:["Int"],x:[["Vers",6],["Mastery",4]]},
  {n:"Hide of Pestilence",ic:"inv_chest_leather_dungeonharronir_c_01",id:251226,sl:"Chest",ty:"Leather",b:"Atroxus",p:["Agi","Int"],x:[["Crit",8],["Vers",6]]},
  {n:"Behemoth Waistband",ic:"inv_belt_mail_dungeonharronir_c_01",id:251228,sl:"Waist",ty:"Mail",b:"Atroxus",p:["Agi","Int"],x:[["Haste",6],["Mastery",4]]},
  {n:"Sickening Signet of Atroxus",ic:"inv_12_jewelry_devouringhost_ring_bronze2",id:252258,sl:"Ring",ty:"Ring",b:"Atroxus",x:[["Haste",14],["Mastery",6]]},
  {n:"Tumor of the Swarm",ic:"ability_pet_baneling",id:250245,sl:"Trinket",ty:"Trinket",b:"Atroxus",p:["Str","Agi"],e:"Your attacks have a chance to release toxic parasites that burst around you, dealing Nature damage split among nearby enemies and healing you.",ro:["mdps"]},
  {n:"Charonic Crescent",ic:"inv_polearm_2h_domanaar_b_01",id:251230,sl:"Two-hand",ty:"Polearm",b:"Charonus",p:["Str"],x:[["Vers",9],["Mastery",6]]},
  {n:"Singularity Slicer",ic:"inv_glaive_1h_dungeonharronir_c_01",id:251231,sl:"One-hand",ty:"Warglaive",b:"Charonus",p:["Agi","Int"],x:[["Crit",4],["Haste",3]]},
  {n:"Overseer's Diadem",ic:"inv_helm_cloth_dungeonharronir_c_01",id:251232,sl:"Head",ty:"Cloth",b:"Charonus",p:["Int"],x:[["Haste",9],["Mastery",6]]},
  {n:"Graft of the Domanaar",ic:"inv_12_jewelry_devouringhost_necklace_silver2",id:251234,sl:"Neck",ty:"Neck",b:"Charonus",x:[["Crit",13],["Mastery",7]]},
  {n:"Manipulator's Vest",ic:"inv_chest_mail_dungeonharronir_c_01",id:251233,sl:"Chest",ty:"Mail",b:"Charonus",p:["Agi","Int"],x:[["Crit",9],["Haste",5]]},
  {n:"Gravitic Girdle",ic:"inv_belt_leather_dungeonharronir_c_01",id:251235,sl:"Waist",ty:"Leather",b:"Charonus",p:["Agi","Int"],x:[["Vers",7],["Mastery",4]]},
  {n:"Mindpiercer's Sigil",ic:"inv_icon_shadowcouncilorb_purple",id:250224,sl:"Trinket",ty:"Trinket",b:"Charonus",e:"Your damaging spells have a chance to stir the Void near your target, erupting Shadow damage split among nearby enemies. You siphon energy from the Void, gaining Intellect for 10 sec.",ro:["rdps"]}]},
 route:[
  {n:1,t:"Most dangerous first pull in the pool",m:"Three Dominated Brawlers, shaman, Brutal Overseer",d:3,lust:true,p:"Crowd control one brawler, one kick on each of the other two, spare kicks on the shaman to group. Focus the Overseer. Cutting the lieutenant out of this pull feels bad, so control it instead.",s:["tk_rt"]},
  {n:2,t:"Mini-boss",m:"Path mini-boss and buff",d:2,p:"Take the buff, then move into the arena.",s:["tk_rt"]},
  {n:3,t:"Arena waves",m:"Spawned packs",d:2,p:"Packs spawn as you tag. Tag them in to chain, but let the second mini-boss sit until you are ready — he charges quickly, so you can aim him into a pack.",s:["tk_rt"]},
  {n:4,t:"After Taz'grah, go right",m:"Agitated Void Sides, Kil'vore Screamers",d:2,p:"With even one poison dispel in the group this side is far easier. Without any, there is an argument for the other path.",s:["tk_rt"]},
  {n:5,t:"Screamer packs",m:"Screamers and shamans",d:2,p:"One player permanently assigned to Mad Shriek; spares onto the shamans. Focus any Overseer that shields.",s:["tk_rt"]},
  {n:6,t:"Final area, right side",m:"Brutalizers and void minders",d:3,p:"Better pack composition on the right and fewer casters. Two of these packs patrol in a circle — pull them when they reach a good spot.",s:["tk_rt"]}],
 reads:[{t:"The versatility buff is generally the better of the two, and worth the slightly harder mini-boss for most groups — though the routing video later leans on poison dispels as the deciding factor for the second fork.",by:"Tactyks",d:"2026-08-05",s:["tk_vsa"]},
        {t:"Reported to have the most lenient timer of the eight.",by:"Community consensus",d:"2026-08-15",s:["tk_pool"]}]},

/* ───────────────────────────── KING'S REST ────────────────────────── */
{id:"kings-rest",name:"King's Rest",short:"King's Rest",banner:"kings-rest",sigil:"i-tomb",origin:"BfA",
 timer:{v:"33 min",s:["wh_dg"]},bosses:4,routing:"locked",
 blurb:"The Zandalari royal mausoleum, back from Battle for Azeroth with a static third-boss order and a much less dangerous Shadow of Zul. Trash count is the contested question of the season.",
 cov:"Three independent sources plus the Encounter Journal. Timer confirmed at 33 minutes, replacing the unverified figure with the same number from a written guide. The trash requirement remains the compendium's oldest open question.",cov2:true,
 dispels:{poison:2,magic:2,curse:3,disease:2,enrage:2,bleed:3},
 gates:[{t:"Trash requirement contested — pre-launch guides state 100% of trash; two later sources indicate it was relaxed during the PTR. See the disputes list.",s:["bz_game","tk_rt","wh_dt"]},
        {t:"Defeat all four king and queen mini-boss packs, which spawn in a random order, before the second boss room opens.",s:["tk_kr"]}],
 buffs:[],
 loc:{zone:"Western Zuldazar",way:"/way #862 37.6 39.4",tp:"Path of the Slumbering Conqueror",lvl:90,note:"Left-most portal in the Timeways room, Silvermoon City /way #2393 42.4 58.3."},
 calls:{s:["wh_dg"],i:[["Hex Volley", "Risen Hexer", "T1"], ["Bind Soul", "Queen Wasi", "T2"], ["Unholy Mending", "Seneschal M'bara", "T2"], ["Wretched Discharge", "Half-Finished Mummy", "T2"], ["Hex", "Phantom Hex Priest", "T3"], ["Poison Nova", "Zanazal the Wise", "B3"], ["Deathly Roar", "Reban", "B4"]],d:[["Pit of Despair", "Minion of Zul", "T1 — only if it lands"], ["Lingering Fluid", "Embalming Fluid", "T2"], ["Putrid Seekers", "Embalming Fluid", "T2"], ["Hex", "Phantom Hex Priest", "T3 — only if the kick was missed"], ["Savage Maul", "T'zala", "B4 — the tank bleed IS dispellable"]],p:[["Bound by Shadow", "Minion of Zul", "T1 — purging kills it outright"], ["Ancestral Fury", "Shadow-Borne Champion", "T1"], ["Bestial Berserk", "Queen Patlaa", "T2"], ["Captain's Bulwark", "Guard Captain Atu", "T2"], ["Unholy Mending", "Seneschal M'bara", "B3"]]},
 rewards:[["Mummified Raptor Skull (mount)","Drop","King Dazar, Mythic or Mythic+"]],
 killers:[
  {n:"Mortal Bleed",w:"King Akul. A tank bleed that reduces healing taken — explicitly dangerous for certain tank specs. His Blood Drain then damages anyone carrying a bleed and heals him from it.",s:["tk_kr"]},
  {n:"Seismic Upheaval",w:"Ghostly Brute. A knock-up that can kill outright through fall damage alone.",s:["tk_kr"]},
  {n:"Hex Volley",w:"Risen Hexer. AoE hit plus a curse on the whole group. Every cast needs interrupting.",s:["tk_kr"]}],
 areas:[
  {n:"The Entry Hall",mobs:[
   {n:"Minion of Zul",k:"trash",a:[
    {n:"Bound by Shadow",t:["shield"],c:["purge"],r:["dps"],sev:2,e:"A protective shield — but removing it kills the mob outright.",h:"Free value if anyone has a purge. Otherwise stay away from them.",s:["tk_kr"]},
    {n:"Fixate and Fear",t:["fixate","fear"],c:["cc","kite"],r:["dps","healer","tank"],sev:2,e:"They fixate random players and let out an AoE fear if they reach melee range.",h:"AoE slows and stuns, cleave from distance.",s:["tk_kr"]}]},
   {n:"Animated Golem",k:"lt",a:[
    {n:"Heavy Slams",t:["groupdmg"],c:["unavoidable"],r:["healer","tank"],sev:2,e:"Passive. Melee swings deal a small AoE hit. Appears on several mobs throughout the dungeon.",h:"Scales with how many you pull, which is the whole tension of this dungeon's routing.",s:["tk_kr"]},
    {n:"Released Inhibitors",t:["enrage"],c:["defensive"],r:["tank","healer"],sev:2,e:"At 50% health their attack speed increases — which means more Heavy Slams AoE for everyone.",s:["tk_kr"]},
    {n:"Suppression Slam",t:["frontal"],c:["dodge"],r:["dps","healer"],sev:1,e:"Random-target frontal.",s:["tk_kr"]}]},
   {n:"Risen Hexer",k:"caster",a:[
    {n:"Hex Volley",t:["groupdmg","debuff"],c:["interrupt","curse"],r:["dps"],sev:3,e:"AoE hit and a curse on the entire group.",h:"Every single cast. Spare kicks go on their Shadowfrost Bolt.",s:["tk_kr","iv_kr"]}]},
   {n:"Shadow-Borne Champion",k:"lt",a:[
    {n:"Shadow Whirlwind",t:["groupdmg","denial"],c:["dodge"],r:["dps","healer"],sev:2,e:"AoE hit that also leaves circles on the ground.",h:"Much more dangerous if the mob is still enraged — an enrage dispel on Ancestral Fury is the cheapest fix.",s:["tk_kr","iv_kr"]},
    {n:"Vigilant Defense",t:["shield","frontal"],c:["position"],r:["dps"],sev:2,e:"Points a frontal shield towards a random player.",h:"Circle to its back and keep hitting.",s:["tk_kr"]},
    {n:"Ancestral Fury",t:["enrage"],c:["soothe","defensive"],r:["tank","dps"],sev:2,e:"Occasional enrage.",s:["tk_kr"]}]}]},
  {n:"The Embalming Chambers",mobs:[
   {n:"Purification Construct",k:"trash",a:[
    {n:"Purification Strike",t:["groupdmg","frontal","denial"],c:["position"],r:["tank"],sev:2,e:"Large AoE hit that leaves a fire puddle in front of the mob.",h:"Point it away from the group and out of your path.",s:["tk_kr"]}]},
   {n:"Embalming Fluid",k:"trash",a:[
    {n:"Caustic Death",t:["death","denial"],c:["poison","dodge"],r:["dps","healer"],sev:1,e:"Fires circles on death; being caught applies a poison.",s:["tk_kr"]}]},
   {n:"Interment Construct",k:"trash",a:[
    {n:"Entomb",t:["channel","groupdmg"],c:["focus"],r:["dps","healer"],sev:3,e:"Steals a random player into one of two sarcophagi. The trapped player spams their extra action button to shake it so others can identify and free them, while the construct channels Wail of Mourning for party damage.",h:"Speed is everything. Open the wrong sarcophagus and you spawn a Half-Finished Mummy.",s:["tk_kr"]}]},
   {n:"Half-Finished Mummy",k:"trash",a:[
    {n:"Wretched Discharge",t:["groupdmg","dot"],c:["interrupt","disease"],r:["dps"],sev:2,e:"AoE hit and a disease.",h:"Assign one player per mummy. One of the very few places disease matters this season.",s:["tk_kr"]}]}]},
  {n:"The Spirit Halls",mobs:[
   {n:"Phantom Hex Priest",k:"caster",a:[
    {n:"Hex",t:["debuff"],c:["interrupt","curse"],r:["dps"],sev:2,e:"A curse, so it can be dispelled if you have several curse removals available.",h:"Otherwise interrupt every cast; spares onto Spectral Vault.",s:["tk_kr"]}]},
   {n:"Spectral Shaman",k:"caster",a:[
    {n:"Healing Tide Totem",t:["totem","heal"],c:["focus"],r:["dps"],sev:3,e:"Heals mobs for a substantial amount if left alone.",h:"Immediate swap. No exceptions.",s:["tk_kr"]},
    {n:"Frost Shock",t:["debuff"],c:["magic","freedom"],r:["healer"],sev:1,e:"Instant cast, so it cannot be prevented — but the slow can be removed.",s:["tk_kr"]}]},
   {n:"Royal Berserker",k:"trash",a:[
    {n:"Bloodthirsty Axe",t:["dot"],c:["bleedcl","defensive"],r:["healer"],sev:2,e:"Throws a bleed onto two random players.",h:"The most dangerous mob in the area, and the reason bleed cleanses matter here.",s:["tk_kr"]}]},
   {n:"Ghostly Brute",k:"lt",a:[
    {n:"Soul Crush",t:["tankbuster","amp"],c:["defensive"],r:["tank"],sev:2,e:"Tank buster that also applies a damage amplifier.",h:"Dangerous in proportion to how many mobs you are actively tanking.",s:["tk_kr"]},
    {n:"Seismic Upheaval",t:["knockup"],c:["position","dodge"],r:["dps","healer","tank"],sev:3,e:"AoE hit that massively knocks players up — potentially lethal from the fall damage alone.",h:"Run out. There is no defensive answer to hitting the floor.",s:["tk_kr"]}]},
   {n:"Honored Raptor",k:"fodder",a:[
    {n:"Hunting Leap",t:["frontal"],c:["dodge"],r:["dps","healer"],sev:1,e:"Leaps to a random player and fires a frontal through them. Unlike the earlier raptors, this one is not a lieutenant so you cannot stop the frontal with crowd control.",s:["tk_kr"]}]},
   {n:"Kings and Queens",k:"mini",sub:"Four mini-boss packs in a random order",shape:"Four packs, random order",lv:2,brief:"Not one encounter but four, spawning in a random order, each a royal with an escort. Rahu'ai's guard shields the pack, T'Maji's companion binds souls, Phat'ta brings an enraging raptor, and Akul lands a healing-reduction bleed then drains everyone carrying one. In every case the escort is the difficulty, not the royal.",a:[
   {n:"King Rahu'ai",t:["groupdmg","adds"],c:["purge","interrupt","cc"],r:["dps","healer"],sev:2,e:"Spams Fork Lightning at random players and drops an Overload AoE. His escort is the real threat: Guard Captain Atu's Captain's Bulwark puts a magic damage reduction on the other two mobs, and Seneschal Imbara casts Unholy Mending.",h:"Purge the Bulwark if you can, or delay it with crowd control. One player permanently on the Mending interrupt.",s:["tk_kr"]},
   {n:"King T'Maji",t:["spread","denial"],c:["spread","interrupt","kite"],r:["dps","healer"],sev:2,e:"Erupting Slam is a random-target AoE; his blade storm needs kiting. Inwashi casts Soul Bolt and Bind Soul.",h:"Every Bind Soul must be prevented. Spare kicks onto Soul Bolt.",s:["tk_kr"]},
   {n:"Queen Phat'ta",t:["dot","denial","enrage"],c:["poison","soothe","dodge"],r:["healer","dps"],sev:2,e:"Drops circles and leaps at a random player with Serpent Strike, applying a poison. Her raptor is occasionally sent into Bestial Berserk and uses Hunting Leap with a frontal.",h:"A soothe on the raptor and a poison dispel on the leap target cover most of this pack.",s:["tk_kr"]},
   {n:"King Akul",t:["tankbuster","healred","dot"],c:["defensive","bleedcl"],r:["tank","healer"],sev:3,e:"Mortal Bleed is a tank bleed that reduces healing taken. Blood Drain then deals damage to every player carrying a bleed — including the Sudden Rupture bleeds from his Bloodsworn Assassins — and heals him based on that damage.",h:"The healing reduction is called out as very dangerous for certain tank specs. Bleed cleanses cut the Blood Drain hit as well as the tank damage.",s:["tk_kr"]}]},
   {n:"Shadow of Zul",k:"mini",sub:"Mini-boss before the final encounter",shape:"Mini-boss, soak and spread",lv:1,brief:"A short mini-boss built on two soaks and a spread. Both Pools of Darkness need a body or they pulse the party, so the tank takes one and anyone takes the other. Dark Revelation then wants distance and spawns a minion from each hit. The barrage running underneath cannot be interrupted, so it is a defensive rather than a kick.",a:[
   {n:"Shadow Barrage",t:["dot"],c:["defensive"],r:["healer"],sev:2,e:"Random target and not interruptible at all.",h:"If it targets you while you are also handling something else, that is your defensive moment.",s:["tk_kr"]},
   {n:"Pool of Darkness",t:["soak"],c:["soak"],r:["tank","dps"],sev:2,e:"Two soaks that pulse party damage if left empty.",h:"Tank takes one, any other player takes the second.",s:["tk_kr"]},
   {n:"Dark Revelation",t:["spread","adds"],c:["spread","purge"],r:["dps","healer"],sev:2,e:"Large AoE on two players; each hit spawns a Minion of Zul.",h:"Spread, then purge or kill the minions before they reach a target.",s:["tk_kr"]}]}]}],
 encounters:[
  {n:"The Golden Serpent",o:1,img:"kr-the-golden-serpent",sub:"Puddle discipline",shape:"One phase, puddle cycle",lv:2,brief:"The closest thing to a straightforward fight in the dungeon. She marks players, they drop gold puddles, and Lucre's Call then animates every puddle into an add that walks at her — one arriving gives a stacking shield and a large damage increase. Killed adds revert to puddles rather than vanishing, so grouping the drops early is what keeps the whole cycle manageable.",a:[
   {n:"Spit Gold",t:["dot","denial"],c:["position"],r:["dps","healer"],sev:2,e:"Debuffs two players at a time and drops a puddle on expiry.",h:"Drop them together and near existing ones — you will be glad later.",s:["tk_kr"]},
   {n:"Lucre's Call",t:["adds"],c:["focus","cc"],r:["dps"],sev:3,e:"Turns every Molten Gold pool into an Animated Gold that walks at the boss. One reaching him grants Luster: a shield worth 10% of his health AND +25% damage done, stacking. Killed adds revert to pools of Molten Gold rather than disappearing.",h:"The journal detail nobody mentions: killing them does not remove them, it resets them to puddles. So grouping the puddles is not a convenience, it is the only way the phase stays manageable.",s:["wh_ej","tk_kr","iv_kr"]},
   {n:"Serpentine Gust",t:["channel","groupdmg"],c:["unavoidable"],r:["healer"],sev:2,e:"A five-second gust: moderate Nature damage to everyone every second, pushing them back.",s:["wh_ej","tk_kr"]},
   {n:"Tail Thrash",t:["tankbuster"],c:["defensive"],r:["tank"],sev:1,e:"Massive Physical damage. Both guides call this mild — it is not a small number.",s:["wh_ej","tk_kr"]}]},
  {n:"Mchimba the Embalmer",o:2,img:"kr-mchimba-the-embalmer",sub:"Sarcophagi, now four of them",shape:"One phase, rescue race",lv:2,brief:"A rescue race rather than a damage race. He seals a player in a crypt then opens the others one at a time — starting deliberately with the wrong ones, getting faster with each, and releasing a mummy from every coffin he opens. Freeing the trapped player interrupts the entire ritual, so speed beats damage here. Drain Fluids landing on top of it is a combat drop or a hard top-off.",a:[
   {n:"Drain Fluids",t:["channel","debuff"],c:["drop","topoff","defensive"],r:["healer"],sev:3,e:"Significant damage every 2 seconds AND Explosive Acids landing for heavy damage within 4 yards throughout. It ends in Desiccation: 50% less damage done and 50% slower until healed above 90%.",h:"A combat drop cancels the channel. Otherwise get the debuffed player topped fast — any personal self-heal shortens it considerably.",s:["tk_kr","iv_kr"]},
   {n:"Awakening Slam",t:["groupdmg","adds"],c:["focus"],r:["tank","dps"],sev:2,e:"Heavy Shadow damage to the party, opening random crypts to release Half-Finished Mummies.",h:"Tank grabs them and cleaves under the boss. They keep Wretched Discharge — Deadly, interruptible, significant damage every 2 seconds for 12 seconds — so assign kicks.",s:["wh_ej","tk_kr"]},
   {n:"Entomb",t:["channel","adds"],c:["focus"],r:["dps","healer"],sev:3,e:"He seals a player in a crypt and then opens the others ONE AT A TIME, starting with the ones that do not hold the player — each opened coffin releases a Finished Mummy and makes the next open faster. Freeing the entombed player interrupts the whole ritual.",h:"So the search accelerates against you. The trapped player struggles to signal which crypt; getting that one open immediately is worth more than any damage you could be doing.",s:["wh_ej","tk_kr","iv_kr"]},
   {n:"Burning Corruption",t:["denial"],c:["position"],r:["dps","healer","tank"],sev:2,e:"Large flame puddle under a random player on expiry.",h:"Drop these at the front or back of the room so they never block the path to a sarcophagus.",s:["tk_kr"]}]},
  {n:"The Council of Tribes",o:3,img:"kr-the-council-of-tribes",sub:"Sequential, not simultaneous — and the dead keep interrupting",shape:"Sequential council",lv:3,brief:"Sequential rather than simultaneous, and the dead do not stay quiet. It opens with Kula alone; each defeated councillor returns to their urn and the next joins, but the fallen keep rejoining periodically to fire a single ability. Kula's axes respawn from wherever she died, so kill her in the middle of the room. Zanazal's Explosive Totem is the one cast that reliably ends runs.",a:[
   {n:"Whirling Axes",t:["line","knockback","dot"],c:["dodge","position"],r:["dps","healer","tank"],sev:3,e:"The fight BEGINS with Kula alone. A defeated councilor returns to their urn and the next joins — but each dead councilor periodically rejoins to fire a single ability before leaving again. Kula opens with very heavy damage within 10 yards plus a knockback, then two axes doing significant damage every 2 seconds for 6 seconds to anyone they touch.",h:"Kill her in the middle of the room. The written guide calls Severing Axe the one moment on this encounter that genuinely needs a major personal.",s:["tk_kr","iv_kr"]},
   {n:"Barrel Through",t:["soak"],c:["stack","soak"],r:["dps","healer","tank"],sev:2,e:"Massive Physical damage, SPLIT between everyone within 7 yards, ignoring armour. Being alone in it is fatal.",h:"Play close enough as a group that stepping into the soak is automatic.",s:["tk_kr"]},
   {n:"Debilitating Backhand",t:["tankbuster","knockback","amp"],c:["kite","defensive","position"],r:["tank"],sev:3,e:"Massive Physical damage, a knockback, and Shattered Defenses: +200% Physical damage taken.",h:"Either kite for the full duration or commit a strong defensive to survive the empowered melees — and do not get pushed off the platform.",s:["tk_kr"]},
   {n:"Call of the Elements",t:["totem"],c:["focus","interrupt"],r:["dps"],sev:3,e:"Three totems. Explosive detonates for very heavy Fire damage to the whole party. Thundering fires Disruption, interrupting every player for 4 seconds. Torrent spews heavy Frost damage within 3 yards with a knockback.",h:"Explosive first, always — both sources say letting it resolve is a wipe. Kite Xanzal next to each totem so the group cleaves boss and totem together.",s:["tk_kr","iv_kr"]},
   {n:"Poison Nova",t:["groupdmg"],c:["interrupt"],r:["dps"],sev:3,e:"Significant Nature damage every 2 seconds for 12 seconds to the entire party. The journal flags it Deadly.",s:["wh_ej","tk_kr"]}]},
  {n:"King Dazar",o:4,img:"kr-king-dazar",sub:"Two targets on one health bar, under a ceiling that keeps falling",shape:"One phase, mounts at 80%",lv:3,brief:"Two targets sharing one health bar, under a ceiling that keeps falling. Reban joins on pull and should die immediately; T'zala arrives at 80% and Eternal Bond makes cleaving both of them free. Spears rain throughout, and Gilded Destruction adds a flame frontal to his melee swings — so the tank is dodging while keeping him pointed away, which is the hardest positioning in the dungeon.",a:[
   {n:"Impaling Spears",t:["env","dot"],c:["dodge"],r:["dps","healer","tank"],sev:2,e:"Heavy damage within 7 yards of each impact plus a bleed of moderate damage per second for 5 seconds.",s:["wh_ej","tk_kr"]},
   {n:"Deathly Roar",t:["frontal","fear"],c:["interrupt","position","focus"],r:["tank","dps"],sev:2,e:"Hunting Leap does significant damage plus moderate damage per second for 4 seconds, then a series of gutripping cone attacks at heavy damage each. Deathly Roar is significant Shadow damage and a 4-second fear, and it is interruptible.",h:"Tank away from the group for the leap, interrupt the roar, and focus Deathly Roar down on pull — he has little health and is a persistent nuisance.",s:["tk_kr"]},
   {n:"Tazala",t:["amp"],c:["focus"],r:["dps"],sev:2,e:"At 80% he mounts her. Eternal Bond makes them share 100% of all damage taken, so cleaving both is genuinely free.",s:["wh_ej","tk_kr"]},
   {n:"Quaking Leap",t:["spread","groupdmg"],c:["spread","drop"],r:["dps","healer"],sev:3,e:"T'zala leaps at targeted players for heavy damage within 8 yards; Dazar's own version is Aerial Smash, same shape. The journal gives no distance-scaled party hit — that claim appears only in the creator guide and should be treated as unconfirmed.",h:"Move further away to soften it, but stay in healer range. A combat drop while he is midair cancels the remaining jumps entirely.",s:["tk_kr"]},
   {n:"Blade Combo",t:["tankbuster","channel"],c:["defensive","bleedcl","magic"],r:["tank","healer"],sev:3,e:"A series of strikes doing increasing damage. T'zala's Savage Maul precedes it: heavy damage, a bleed of moderate damage per second, and +10% Physical damage taken for 10 seconds — a damage amplifier, not an armour reduction as the creator guide has it. The published assignment table lists Savage Maul as DISPELLABLE, which changes the tank's answer entirely.",h:"Cleanse the bleed if you can, or press your defensive early so it covers both abilities.",s:["tk_kr"]},
   {n:"Gilded Destruction",t:["dot","frontal","env"],c:["position","dodge"],r:["tank","healer"],sev:3,t:["dot","frontal","env","myth"],e:"heavy Fire damage to everyone plus light damage for 15 seconds, and his melee swings gain Searing Gold — a wave of molten gold in front of him for significant damage.",h:"Tanks have to move quickly to dodge spears while keeping the boss pointed away. The hardest positioning moment in the dungeon.",s:["tk_kr"]}]}],
loot:{s:["iv_kr"],i:[
  {n:"Gilded Serpent's Tooth",ic:"inv_knife_1h_battledungeon_c_01",id:159137,sl:"One-hand",ty:"Dagger",b:"The Golden Serpent",p:["Int"],x:[["Haste",3],["Vers",3]]},
  {n:"Gauntlets of the Avian Sentinel",ic:"inv_glove_plate_zandalardungeon_c_01",id:159413,sl:"Hands",ty:"Plate",b:"The Golden Serpent",p:["Str","Int"],x:[["Mastery",6],["Crit",3]]},
  {n:"Belt of the Consecrated Tomb",ic:"inv_belt_mail_zandalardungeon_c_01",id:159369,sl:"Waist",ty:"Mail",b:"The Golden Serpent",p:["Agi","Int"],x:[["Vers",5],["Haste",4]]},
  {n:"Breeches of the Sacred Hall",ic:"inv_pant_leather_zandalardungeon_c_01",id:159313,sl:"Legs",ty:"Leather",b:"The Golden Serpent",p:["Agi","Int"],x:[["Vers",7],["Haste",5]]},
  {n:"Down-Lined Breeches",ic:"inv_pant_cloth_zandalardungeon_c_01",id:159234,sl:"Legs",ty:"Cloth",b:"The Golden Serpent",p:["Int"],x:[["Crit",7],["Mastery",5]]},
  {n:"Auric Puddle Stompers",ic:"inv_boot_plate_zandalardungeon_c_01",id:159412,sl:"Feet",ty:"Plate",b:"The Golden Serpent",p:["Str","Int"],x:[["Vers",5],["Crit",4]]},
  {n:"Goldfeather Boots",ic:"inv_boot_leather_zandalardungeon_c_01",id:159304,sl:"Feet",ty:"Leather",b:"The Golden Serpent",p:["Agi","Int"],x:[["Vers",5],["Mastery",4]]},
  {n:"Lustrous Golden Plumage",ic:"inv_icon_feather06a",id:159617,sl:"Trinket",ty:"Trinket",b:"The Golden Serpent",p:["Agi"],u:"Your movements shimmer with golden plumage, increasing your Versatility for 20 sec. (2 Min Cooldown)",ro:["mdps"]},
  {n:"Royal Purifier's Spade",ic:"inv_polearm_2h_zandalariguard_b_01",id:159642,sl:"Two-hand",ty:"Polearm",b:"Mchimba the Embalmer",p:["Agi"],x:[["Crit",7],["Mastery",5]]},
  {n:"Vessel of Last Rites",ic:"inv_offhand_1h_battledungeon_c_02",id:159667,sl:"Off-hand",ty:"Off-hand",b:"Mchimba the Embalmer",p:["Int"],x:[["Haste",4],["Vers",2]]},
  {n:"Embalmer's Steadying Bracers",ic:"inv_bracer_plate_zandalardungeon_c_01",id:159409,sl:"Wrist",ty:"Plate",b:"Mchimba the Embalmer",p:["Str","Int"],x:[["Crit",4],["Haste",3]]},
  {n:"Desiccator's Blessed Gloves",ic:"inv_glove_leather_zandalardungeon_c_01",id:159312,sl:"Hands",ty:"Leather",b:"Mchimba the Embalmer",p:["Agi","Int"],x:[["Crit",5],["Mastery",3]]},
  {n:"Sepulchral Construct's Gloves",ic:"inv_glove_mail_zandalardungeon_c_01",id:160213,sl:"Hands",ty:"Mail",b:"Mchimba the Embalmer",p:["Agi","Int"],x:[["Mastery",5],["Haste",4]]},
  {n:"Ritual Binder's Ring",ic:"inv_ring_80_03e",id:159459,sl:"Ring",ty:"Ring",b:"Mchimba the Embalmer",x:[["Haste",11],["Vers",6]]},
  {n:"Mchimba's Ritual Bandages",ic:"inv_misc_emberweavebandagelight",id:159618,sl:"Trinket",ty:"Trinket",b:"Mchimba the Embalmer",p:["Str","Agi"],u:"Wrap yourself in ritual bandages, absorbing damage for 6 sec. (1 Min Cooldown)",ro:["tank"]},
  {n:"Crackling Jade Kilij",ic:"inv_sword_1h_battledungeon_c_02",id:160216,sl:"One-hand",ty:"Sword",b:"The Council of Tribes",p:["Int"],x:[["Crit",3],["Mastery",2]]},
  {n:"Jeweled Dagger of Subjugation",ic:"inv_knife_1h_battledungeon_c_01",id:159136,sl:"One-hand",ty:"Dagger",b:"The Council of Tribes",p:["Agi"],x:[["Haste",3],["Mastery",3]]},
  {n:"Crossbow of Forgotten Majesty",ic:"inv_bow_2h_crossbow_pandaraid_d_01",id:159643,sl:"Ranged",ty:"Crossbow",b:"The Council of Tribes",p:["Agi"],x:[["Haste",7],["Mastery",5]]},
  {n:"Cloak of the Restless Tribes",ic:"inv_cape_mail_zandalardungeon_c_01",id:159288,sl:"Back",ty:"Cloak",b:"The Council of Tribes",p:["Str","Agi","Int"],x:[["Vers",4],["Mastery",3]],e:"Standing still for 4 sec increases your Speed. Lasts for 4 sec once you start moving."},
  {n:"Kula's Butchering Wristwraps",ic:"inv_bracer_leather_zandalardungeon_c_01",id:159300,sl:"Wrist",ty:"Leather",b:"The Council of Tribes",p:["Agi","Int"],x:[["Crit",4],["Vers",2]]},
  {n:"Girdle of Pestilent Purification",ic:"inv_belt_plate_zandalardungeon_c_01",id:159418,sl:"Waist",ty:"Plate",b:"The Council of Tribes",p:["Str","Int"],x:[["Haste",5],["Mastery",3]]},
  {n:"Boots of the Headlong Conqueror",ic:"inv_boot_mail_zandalardungeon_c_01",id:159371,sl:"Feet",ty:"Mail",b:"The Council of Tribes",p:["Agi","Int"],x:[["Vers",5],["Mastery",4]]},
  {n:"Sandals of Wise Voodoo",ic:"inv_boot_cloth_zandalardungeon_c_01",id:159243,sl:"Feet",ty:"Cloth",b:"The Council of Tribes",p:["Int"],x:[["Vers",6],["Haste",3]]},
  {n:"Geti'ikku, Cut of Death",ic:"inv_sword_2h_battledungeon_c_01",id:159644,sl:"Two-hand",ty:"Sword",b:"King Dazar",p:["Str"],e:"Your melee attacks have a chance to make the enemy bleed for Physical damage over 12 sec. You are healed when an enemy dies while bleeding from Geti'ikku."},
  {n:"Headcracker of Supplication",ic:"inv_mace_1h_battledungeon_c_01",id:159645,sl:"One-hand",ty:"Mace",b:"King Dazar",p:["Agi"],x:[["Mastery",3],["Crit",2]]},
  {n:"Headdress of the First Empire",ic:"inv_helm_cloth_zandalardungeon_c_01",id:239047,sl:"Head",ty:"Cloth",b:"King Dazar",p:["Int"],x:[["Vers",7],["Crit",5]]},
  {n:"Helm of the Raptor King",ic:"inv_helm_plate_zandalardungeon_c_01",id:239050,sl:"Head",ty:"Plate",b:"King Dazar",p:["Str","Int"],x:[["Vers",7],["Haste",5]]},
  {n:"Mantle of Ceremonial Ascension",ic:"inv_shoulder_cloth_zandalardungeon_c_01",id:239045,sl:"Shoulder",ty:"Cloth",b:"King Dazar",p:["Int"],x:[["Mastery",6],["Haste",3]]},
  {n:"Pauldrons of the Great Unifier",ic:"inv_shoulder_plate_zandalardungeon_c_01",id:239051,sl:"Shoulder",ty:"Plate",b:"King Dazar",p:["Str","Int"],x:[["Vers",5],["Mastery",4]]},
  {n:"Spaulders of Prime Emperor",ic:"inv_shoulder_mail_zandalardungeon_c_01",id:239049,sl:"Shoulder",ty:"Mail",b:"King Dazar",p:["Agi","Int"],x:[["Haste",5],["Crit",4]]},
  {n:"Vest of Reverent Adoration",ic:"inv_chest_leather_zandalardungeon_c_01",id:239048,sl:"Chest",ty:"Leather",b:"King Dazar",p:["Agi","Int"],x:[["Crit",7],["Mastery",5]]},
  {n:"Primal Dinomancer's Belt",ic:"inv_belt_leather_zandalardungeon_c_01",id:159301,sl:"Waist",ty:"Leather",b:"King Dazar",p:["Agi","Int"],x:[["Crit",5],["Haste",4]]},
  {n:"Loa-Blessed Chestguard",ic:"inv_chest_mail_zandalardungeon_c_01",id:239046,sl:"Chest",ty:"Mail",b:"King Dazar",p:["Agi","Int"],x:[["Crit",8],["Vers",4]]},
  {n:"Stormbound Emblem of Dazar",ic:"inv_7_0raid_necklace_14a",id:273649,sl:"Trinket",ty:"Trinket",b:"King Dazar",p:["Int"],u:"Channel for 2 sec as the wind answers Dazar's command, increasing your Haste up to 20 sec. (2 Min Cooldown)",ro:["rdps","healer"]}]},
 route:[
  {n:1,t:"Two guardians left behind",m:"Opening room",d:2,p:"The route deliberately leaves two Animated Guardians unselected and still makes count — which is the routing evidence that the 100% requirement changed.",s:["tk_rt"]},
  {n:2,t:"Gong lust pull",m:"Two Animated Guardians plus the room",d:3,lust:true,p:"Expected to become the meta strategy: drag the guardians in, trigger the gong, and lust the whole room. A pug group should kill them separately first.",s:["tk_rt"]},
  {n:3,t:"Kings and queens",m:"Four packs, random order",d:2,p:"Order is random; take them as they come.",s:["tk_rt"]},
  {n:4,t:"The common wipe",m:"Construct into the next pack",d:3,p:"Pulling this mob into the following pack was a frequent PTR wipe. Work over slowly, slam it into the wall so the fire puddle lands there, and chain forward only once it is nearly dead.",s:["tk_rt"]},
  {n:5,t:"Slimes and constructs",m:"Mixed",d:2,p:"The number of slimes per pull does not matter as long as you only bring one construct at a time.",s:["tk_rt"]},
  {n:6,t:"Upstairs",m:"Spirit hall packs",d:2,p:"Pull mobs that stand together, together. One pack has two interrupts in it; the next has one.",s:["tk_rt"]},
  {n:7,t:"Shadow of Zul",m:"Mini-boss",d:1,p:"Considerably easier than it was. Definitely not a lust target.",s:["tk_rt"]}],
 reads:[{t:"Probably the lower end of the pool. The static third-boss order and the Shadow of Zul adjustments were good changes, but the trash needed more work — there is still a lot of empty space and low-density area, and the king and queen roleplay after the first boss feels very slow.",by:"Tactyks",d:"2026-07-25",s:["tk_pool"]},
        {t:"Would not be surprised if it ends up my least favourite dungeon of the season.",by:"Tactyks",d:"2026-07-25",s:["tk_pool"]}]},

/* ────────────────────────── RUBY LIFE POOLS ───────────────────────── */
{id:"ruby-life-pools",name:"Ruby Life Pools",short:"Ruby",banner:"ruby-life-pools",sigil:"i-egg",origin:"Dragonflight",
 timer:{v:"28 min",s:["wh_dg"]},bosses:3,routing:"limited",
 blurb:"The Dragonflight return, described as meaningfully softened — the patrolling mini-bosses are grounded now, and several encounters gained counterplay they did not have.",
 cov:"Three independent sources plus a Blizzard hotfix. The Kyrakka threshold dispute is settled at 40% by the Encounter Journal. Timer confirmed at 28 minutes — the shortest in the pool.",cov2:true,
 dispels:{poison:0,magic:3,curse:0,disease:0,enrage:0,bleed:0},
 gates:[{t:"Kill the Defier Draghar mini-boss to bring down the flame wall in front of the first boss.",s:["tk_rlp"]},
        {t:"Destroy all four Blaze-Bound Destroyers on the upper platform to unlock the second boss.",s:["tk_rlp"]},
        {t:"Kill High Channeler Ryvati before the final boss can be summoned.",s:["tk_rlp"]}],
 buffs:[],
 loc:{zone:"The Waking Shores, to the south-east",way:"/way #2022 60.0 75.7",tp:"Path of the Clutch Defender",lvl:90,note:"Centre portal in the Timeways room. The shortest timer in the pool."},
 calls:{s:["wh_dg"],i:[["Ice Shield", "Flashfrost Chillweaver", "T1"], ["Frigid Shard", "Melidrussa Chillworn", "B1"], ["Fiery Blast", "Blazebound Destroyer", "T2"], ["Blaze Volley", "Blazebound Firestorm", "B2"]],d:[["Cold Claws", "Infused Whelp", "T1 and B1"], ["Rolling Thunder", "Thunderhead", "T2 — stagger these, never together"], ["Stormslam", "Erkhart Stormvein", "B3"]],p:[["Blaze of Glory", "Ashseer Flamelasher", "T2"], ["Stormcloud Barrier", "Primal Thundercloud", "T3"]]},
 rewards:[["Housing decor","Drop","Kyrakka and Erkhart Stormvein"]],
 killers:[
  {n:"Cold Claws at 20 stacks",w:"Infused Welps. Reaching twenty stacks freezes and stuns the tank. Magic dispels or freedom effects clear them, which makes this a group responsibility rather than a tank one.",s:["tk_rlp"]},
  {n:"Flame Dance",w:"Primalist Flamedancer. A channel into the tank that deals very heavy damage. Crowd control stops it outright — nothing else will.",s:["tk_rlp"]},
  {n:"Rolling Thunder",w:"Thunderhead. Dispelling the magic dot applies a dot to the whole party. Two dispels at once is how healers kill their own group here.",s:["tk_rlp"]}],
 areas:[
  {n:"The Lower Pools",mobs:[
   {n:"Primal Juggernaut",k:"lt",a:[
    {n:"Excavating Blast",t:["groupdmg","denial"],c:["unavoidable","dodge"],r:["healer"],sev:2,e:"Unavoidable party damage plus circles on the ground.",s:["tk_rlp"]},
    {n:"Crushing Smash",t:["tankbuster"],c:["defensive"],r:["tank"],sev:3,e:"A large tank buster.",h:"Extremely dangerous stacked with Tectonic Strike from the Earthshapers, or even just their melee.",s:["tk_rlp"]}]},
   {n:"Deepstone Earthshaper",k:"trash",a:[
    {n:"Tectonic Strike",t:["stacking","amp"],c:["defensive","kite"],r:["tank"],sev:2,e:"Passive that stacks a debuff on the tank.",s:["tk_rlp"]}]},
   {n:"Earthbound Guardian",k:"fodder",a:[
    {n:"Earthbound's Imprint",t:["dot"],c:["defensive"],r:["healer"],sev:1,e:"Damage-over-time on random players.",h:"Focus heal into them if it overlaps the Juggernaut's group damage.",s:["tk_rlp"]}]},
   {n:"Flashfrost Chillweaver",k:"caster",a:[
    {n:"Ice Shield",t:["channel","shield"],c:["interrupt","cc"],r:["dps"],sev:3,e:"Channels a shield into a random mob. The longer the channel runs, the larger the shield.",h:"Stop it early rather than late — the value scales with time channelled, so a late kick still costs you.",s:["tk_rlp","iv_rlp"]},
    {n:"Icebolt",t:["dot"],c:["interrupt"],r:["dps"],sev:1,e:"Single-target cast; the spare-kick target on this mob.",s:["iv_rlp"]}]},
   {n:"Infused Whelp",k:"trash",a:[
    {n:"Cold Claws",t:["stacking","stun"],c:["magic","freedom"],r:["tank","healer"],sev:3,e:"A Magic affliction applied to their current target. At 20 applications it becomes Frozen Solid — a 5-second stun.",h:"Magic dispels or freedom effects clear stacks. Note the trigger: any player OR any enemy walking over a dragon egg spawns them, so watch where you drag a pack.",s:["tk_rlp","iv_rlp"]}]},
   {n:"Defier Draghar",k:"mini",a:[
    {n:"Steel Barrage",t:["channel","tankbuster","groupdmg","denial"],c:["defensive","dodge"],r:["tank","healer","dps"],sev:3,e:"Heavy tank channel that also pulses AoE, dropping a molten steel fragment on the ground with every tick that damages on contact.",h:"Made significantly scarier for Season 2. Tank defensive, healer ready, everyone dodging — all three at once.",s:["tk_rlp","iv_rlp"]},
    {n:"Blazing Rush",t:["line"],c:["dodge","position"],r:["dps","healer"],sev:2,e:"Charge at a random player that deals massive damage and leaves a bleed on contact.",h:"Stack near a wall and bait it — that keeps melee uptime high instead of scattering the group. Aim it away from mobs you have not pulled.",s:["tk_rlp","iv_rlp"]}]}]},
  {n:"The Upper Platform",mobs:[
   {n:"Blazebound Destroyer",k:"lt",a:[
    {n:"Inferno",t:["groupdmg","dot"],c:["unavoidable","defensive"],r:["healer"],sev:2,e:"Hit plus a damage-over-time on every player.",s:["tk_rlp"]},
    {n:"Burnout",t:["death"],c:["position","dodge"],r:["dps","healer","tank"],sev:2,e:"A twenty-yard explosion on death.",h:"Run out before it dies, not after.",s:["tk_rlp"]}]},
   {n:"Primalist Cinder Weaver",k:"caster",a:[
    {n:"Living Bomb",t:["spread"],c:["spread"],r:["dps","healer"],sev:2,e:"Heavy damage that cleaves nearby players.",h:"Move away from allies the moment you are targeted.",s:["tk_rlp"]}]},
   {n:"Primalist Flamedancer",k:"trash",a:[
    {n:"Flame Dance",t:["channel","tankbuster"],c:["cc"],r:["dps","tank"],sev:3,e:"Channels into the tank for very heavy damage.",h:"Both sources agree: interrupts do not work on it. Stuns and other disruption effects do.",s:["tk_rlp","iv_rlp"]},
    {n:"Blaze of Glory",t:["death","denial","shield"],c:["purge","dodge"],r:["dps"],sev:2,e:"On death they do not actually die — they gain a shield and cast this, spawning swirls and an AoE.",h:"Purge to destroy them immediately, or dodge and wait it out.",s:["tk_rlp"]}]},
   {n:"Ruinous Storm Ringer",k:"caster",a:[
    {n:"Lightning Rod",t:["dot"],c:["defensive"],r:["healer"],sev:2,e:"Heavy damage on the debuffed player.",s:["tk_rlp"]},
    {n:"Thunderstorm",t:["groupdmg","knockback"],c:["position"],r:["dps","healer","tank"],sev:2,e:"Party hit and knockback at 100 energy — but only a twenty-yard range.",h:"Ranged players can simply stand outside it. Genuinely useful to know.",s:["tk_rlp"]}]},
   {n:"Flamegullet",k:"mini",a:[
    {n:"Fire Maw",t:["tankbuster"],c:["defensive"],r:["tank"],sev:2,e:"Hits quite hard.",s:["tk_rlp"]},
    {n:"Molten Blood",t:["stacking","groupdmg"],c:["defensive"],r:["healer","dps"],sev:2,e:"From 50% health, stacks on the mob and pulses escalating damage to everyone within 60 yards until it dies. It cannot be dispelled.",h:"Hold damage and healing cooldowns for the back half rather than opening with them — the stacks are a clock, so the burn is the whole fight.",s:["tk_rlp","iv_rlp"]}]},
   {n:"Thunderhead",k:"mini",a:[
    {n:"Thunder Jaw",t:["tankbuster","knockback"],c:["defensive","position"],r:["tank"],sev:2,e:"Tank buster with a large knockback.",h:"Watch what is behind you — the platform edge and other packs both count.",s:["tk_rlp"]},
    {n:"Rolling Thunder",t:["dot","groupdmg"],c:["magic"],r:["healer"],sev:3,e:"Always applies to exactly two random players. On expiry it deals heavy damage to everyone within 100 yards — and dispelling it delivers that same damage immediately rather than preventing it.",h:"So the dispel is a timing tool, not a save. Dispel one, let the second expire naturally, and you have split one lethal hit into two survivable ones. Two dispels together is how healers wipe their own group here.",s:["tk_rlp","iv_rlp"]}]}]},
  {n:"The Final Balcony",mobs:[
   {n:"Primal Thundercloud",k:"trash",a:[
    {n:"Tempest Barrier",t:["shield","groupdmg"],c:["purge"],r:["dps"],sev:2,e:"Shielded for most of their health. Purging the shield makes them charge a random player and immediately explode.",h:"Both sources call the purge the fast way through these.",s:["tk_rlp","iv_rlp"]}]},
   {n:"Storm Warrior",k:"trash",a:[
    {n:"Thunder Stomper",t:["groupdmg","debuff"],c:["position"],r:["healer","mdps"],sev:2,e:"Hits everyone within five yards, reducing haste by 10% and movement speed by 20%.",h:"Short range, so ranged simply stand outside it. Melee will always eat it — plan for that rather than trying to dodge.",s:["tk_rlp","iv_rlp"]}]},
   {n:"Tempest Channeler",k:"caster",a:[
    {n:"Lightning Torrent",t:["channel"],c:["defensive","drop"],r:["healer"],sev:3,e:"Channels a lot of damage into a random player.",s:["tk_rlp"]},
    {n:"Thunder Blast",t:["tankbuster"],c:["interrupt"],r:["dps"],sev:1,e:"Bolt aimed at the tank — a spare-interrupt target.",s:["tk_rlp"]}]},
   {n:"High Channeler Ryvati",k:"mini",a:[
    {n:"Tempest Storm Shield",t:["shield","groupdmg"],c:["focus"],r:["dps"],sev:3,e:"Gains a shield. If it expires before you break it, it bursts for AoE damage scaled to the shield remaining.",h:"Everything on this mob while the shield holds.",s:["tk_rlp"]},
    {n:"Summon Thunderclouds",t:["adds"],c:["focus"],r:["tank","dps"],sev:2,e:"Summons roughly four Primal Thunderclouds at once rather than one.",s:["tk_rlp"]}]}]}],
 encounters:[
  {n:"Melidrussa Chillworn",o:1,img:"rlp-melidrussa",sub:"Stack, rotate, and break the shield",shape:"Two burn checks, 66% and 33%",lv:2,brief:"Two hard checkpoints in an otherwise steady fight. Hailbombs land permanently and Chillstorm pulls then shoves, so the arena slowly fills and the group rotates as one body. At 66% and 33% she wakes ten whelps and shields herself — the whelps stack toward a stun on the tank while the shield pulses escalating damage. Both are burn checks with a dispel requirement bolted on.",a:[
   {n:"Frigid Shard",t:["tankbuster"],c:["interrupt"],r:["dps"],sev:2,e:"Massive Physical damage at the tank, and interruptible.",h:"Confirmed by the journal. At that number a missed kick is most of a tank's health bar, so this is not an optional interrupt.",s:["wh_ej","tk_rlp"]},
   {n:"Hailburst",t:["denial"],c:["stack","position"],r:["dps","healer","tank"],sev:2,e:"Significant Frost damage to everyone, then launches mines at each player. A mine detonates for heavy damage within 4 yards, knocks you UPWARD, and cuts haste by 50% for 20 seconds.",h:"Stay stacked so they all land together, then rotate as a group. Space is a finite resource here — the written guide treats bad bomb placement as the main failure mode.",s:["tk_rlp","iv_rlp"]},
   {n:"Chillstorm",t:["denial","groupdmg"],c:["spread"],r:["dps","healer"],sev:2,e:"A storm at the target's location pulling everyone toward the Storm's Eye, dealing moderate damage every 1.5 seconds. After 7 seconds it explodes for significant damage and pushes players away. Anyone standing in the eye takes 100% increased Frost damage.",h:"Step out of the centre if you are targeted. Everyone should be topped before the explosion, and watch where the pushback sends you — landing in a Hailbomb is the usual death.",s:["tk_rlp","iv_rlp"]},
   {n:"Awaken Welps",t:["adds","stacking"],c:["magic","freedom","focus"],r:["tank","healer"],sev:3,e:"At 66% and 33% health she summons ten Infused Welps, which bring Cold Claws with them.",h:"Tank picks them up fast and the group watches the stack count — twenty means a stunned tank in the middle of the next mechanic.",s:["tk_rlp"]},
   {n:"Frost Overload",t:["shield","groupdmg","myth"],c:["focus"],r:["dps","healer"],sev:3,e:"She encases herself in an Ice Bulwark absorbing 10% of her maximum health; while it holds she deals moderate damage every 1.5 seconds and increases damage taken FROM THIS ABILITY by 5% for 3 seconds, stacking.",h:"Save some combination of damage and healing cooldowns. The shield must break before the healer is overwhelmed.",s:["tk_rlp"]}]},
  {n:"Kokia Blazehoof",o:2,img:"rlp-kokia-blazehoof",sub:"Space management with a baitable boulder",shape:"One phase, space management",lv:2,brief:"Energy-driven, and entirely about floor space. At full energy she binds a Blazebound Firestorm to a player's head and that player chooses where it lands — drop it onto existing fire and the arena stays usable, drop it somewhere fresh and it will not. Molten Boulder is baitable the same way. There are no phases here; there is only how much room you have left.",a:[
   {n:"Ritual of Blazebinding",t:["adds","denial"],c:["position","interrupt"],r:["dps"],sev:3,e:"At 100 energy a Blazebound Firestorm spawns at a player's location, searing everyone within 12 yards for heavy damage. It casts Blaze Volley (significant damage to all, interruptible) and Inferno (significant damage plus moderate damage per second for 8 seconds, stacking). Its Burnout on death does massive damage within 20 yards and leaves Scorched Earth on Mythic.",h:"Drop it near existing puddles to conserve space. Kick Blaze Volley late in the cast to delay the Inferno.",s:["tk_rlp"]},
   {n:"Molten Boulder",t:["line","denial"],c:["position"],r:["dps","healer","tank"],sev:2,e:"Very heavy damage within 6 yards in front of her, then it rolls up to 40 yards and explodes for massive damage within 12 yards, knocking back anyone it touches.",h:"The written guide adds a 3-second stun; the journal does not mention one. Treat the stun as unconfirmed.",h:"Fully baitable. Aim it opposite to where you plan to move, or straight into existing fire.",s:["tk_rlp","iv_rlp"]},
   {n:"Searing Blows",t:["channel","tankbuster","dot"],c:["defensive"],r:["tank"],sev:2,e:"Four strikes over 3 seconds at 150% weapon damage, each applying Searing Wounds — light damage every half second for 8 seconds, stacking.",h:"Active mitigation for the channel, and be aware the bleed outlives it.",s:["tk_rlp","iv_rlp"]}]},
  {n:"Kyrakka and Erkhart Stormvein",o:3,img:"rlp-kyrakka-and-erkhart",sub:"Predictable winds, if you learn the order",shape:"Two phases, joins at 40%",lv:3,brief:"Two phases. Kyrakka circles overhead while Erkhart intercepts on the ground, and when either of them reaches 40% she lands so he can remount. Winds of Change is the mechanic that decides it: the hurricane shoves both players and Kyrakka's fire in one of four directions, and the order is fixed — so puddles can be placed deliberately to be blown away from the group rather than through it.",a:[
   {n:"Two-phase structure",t:["adds"],c:["focus"],r:["dps"],sev:3,e:"Kyrakka starts airborne while Erkhart intercepts on the ground. When EITHER of them reaches 40% health she lands so he can remount, and the second phase begins.",h:"Settled by the journal at 40%, against the written guide's 50% — and note the threshold applies to whichever boss reaches it first, which neither guide mentions. Chunk Kyrakka whenever she is grounded.",s:["wh_ej","tk_rlp"]},
   {n:"Inferno Spit",t:["dot","denial"],c:["position"],r:["dps","healer"],sev:2,e:"Moderate Fire damage per second for 6 seconds. On REMOVAL the flames explode for moderate damage within 8 yards and leave Flaming Embers burning at significant damage per second.",h:"Drop these away from the group.",s:["tk_rlp"]},
   {n:"Winds of Change",t:["knockback","env"],c:["preposition","position"],r:["dps","healer","tank"],sev:3,e:"A localised hurricane doing light Nature damage per second for 8 seconds that pushes players AND Kyrakka's Flaming Embers. The journal confirms the ember-pushing; the fixed north-west, south-west, south-east, north-east order comes only from the creator guide and is not corroborated.",h:"Learn the order and you can deliberately place puddles so they are blown away from the group rather than through it. The single highest-value fact on this encounter.",s:["tk_rlp"]},
   {n:"Roaring Flame Breath",t:["frontal"],c:["dodge"],r:["dps","healer"],sev:1,e:"Kyrakka lands near a random player and channels a frontal through them.",h:"While she is grounded she takes full damage — focus her.",s:["tk_rlp"]},
   {n:"Stormslam",t:["tankbuster","amp"],c:["magic","defensive"],r:["tank","healer"],sev:2,e:"Very heavy Physical damage and heavy Nature damage, applying a stacking, dispellable +100% Nature damage taken for 30 seconds. Mythic adds a further vulnerability.",h:"Dispel after every application. At 100% per stack this is not a nice-to-have — an undispelled tank walking into the next one is the standard death on this boss.",s:["tk_rlp","iv_rlp"]},
   {n:"Interrupting Cloud Burst",t:["silence"],c:["position"],r:["dps","healer"],sev:1,t:["silence","groupdmg","myth"],e:"significant Nature damage to everyone and interrupts casts for 2 seconds.",h:"Stop casting when you see it.",s:["wh_ej","tk_rlp"]}]}],
loot:{s:["iv_rlp"],i:[
  {n:"Chillworn's Infusion Staff",ic:"inv_staff_2h_dragondungeon_c_02",id:193761,sl:"Two-hand",ty:"Staff",b:"Melidrussa Chillworn",p:["Int"],x:[["Crit",13],["Mastery",8]]},
  {n:"Egg Tender's Leggings",ic:"inv_mail_dragondungeon_c_01_pant",id:193759,sl:"Legs",ty:"Mail",b:"Melidrussa Chillworn",p:["Agi","Int"],x:[["Vers",13],["Haste",8]]},
  {n:"Scaleguard's Stalwart Greatboots",ic:"inv_plate_dragondungeon_c_01_boot",id:193728,sl:"Feet",ty:"Plate",b:"Melidrussa Chillworn",p:["Str","Int"],x:[["Vers",10],["Mastery",6]]},
  {n:"Subjugator's Chilling Grips",ic:"inv_leather_dragondungeon_c_01_glove",id:193758,sl:"Hands",ty:"Leather",b:"Melidrussa Chillworn",p:["Agi","Int"],x:[["Crit",9],["Vers",7]]},
  {n:"Ruby Whelp Shell",ic:"inv_item_dragonegg_redbroken01",id:193757,sl:"Trinket",ty:"Trinket",b:"Melidrussa Chillworn",p:["Str","Agi","Int"],u:"Call your Ruby Whelpling to inspect your target's situation, teaching them how to be helpful. (1 Day Cooldown)",e:"Your spells and abilities have a chance to call a Ruby Whelpling, which will try to be helpful and assist you in combat.",ro:["tank","healer","rdps","mdps"]},
  {n:"Havoc Crusher",ic:"inv_mace_1h_dragondungeon_c_02",id:193767,sl:"One-hand",ty:"Mace",b:"Kokia Blazehoof",p:["Agi"],x:[["Crit",7],["Haste",4]]},
  {n:"Blazebound Lieutenant's Helm",ic:"inv_mail_dragondungeon_c_01_helm",id:193765,sl:"Head",ty:"Mail",b:"Kokia Blazehoof",p:["Agi","Int"],x:[["Mastery",14],["Vers",8]]},
  {n:"Fireproof Drape",ic:"inv_mail_dragondungeon_c_01_cape",id:193763,sl:"Back",ty:"Cloak",b:"Kokia Blazehoof",p:["Str","Agi","Int"],x:[["Haste",8],["Crit",4]]},
  {n:"Invader's Firestorm Chestguard",ic:"inv_leather_dragondungeon_c_01_chest",id:193764,sl:"Chest",ty:"Leather",b:"Kokia Blazehoof",p:["Agi","Int"],x:[["Mastery",13],["Vers",8]]},
  {n:"Kokia's Burnout Rod",ic:"inv_offhand_1h_drakonid_c_01",id:193766,sl:"Off-hand",ty:"Off-hand",b:"Kokia Blazehoof",p:["Int"],x:[["Crit",7],["Vers",4]]},
  {n:"Blazebinder's Hoof",ic:"inv_10_dungeonjewelry_primalist_trinket_2_fire",id:193762,sl:"Trinket",ty:"Trinket",b:"Kokia Blazehoof",x:[["Haste",15]],u:"Bind with the blaze for 20 sec, giving your attacks a high chance to increase your Strength, stacking up to 6 times. When your binding is complete, emit a burnout wave, dealing Fire damage split between all nearby enemies, based on the strength of your binding. (500ms cooldown) (2 Min Cooldown)",ro:["mdps"]},
  {n:"Backdraft Cleaver",ic:"inv_axe_2h_drakonoid_c_01",id:193755,sl:"Two-hand",ty:"Axe",b:"Kyrakka and Erkhart Stormvein",p:["Str"],x:[["Haste",14],["Crit",8]]},
  {n:"Skyferno Rondel",ic:"inv_knife_1h_dragondungeon_c_02",id:193756,sl:"One-hand",ty:"Dagger",b:"Kyrakka and Erkhart Stormvein",p:["Agi"],x:[["Vers",7],["Haste",4]]},
  {n:"Drake Rider's Stecktarge",ic:"inv_shield_1h_drakonid_c_01",id:193754,sl:"Off-hand",ty:"Shield",b:"Kyrakka and Erkhart Stormvein",p:["Str","Int"],x:[["Vers",7],["Mastery",4]]},
  {n:"Breastplate of Soaring Terror",ic:"inv_plate_dragondungeon_c_01_chest",id:193753,sl:"Chest",ty:"Plate",b:"Kyrakka and Erkhart Stormvein",p:["Str","Int"],x:[["Mastery",14],["Haste",8]]},
  {n:"Crown of Roaring Storms",ic:"inv_leather_dragondungeon_c_01_helm",id:193751,sl:"Head",ty:"Leather",b:"Kyrakka and Erkhart Stormvein",p:["Agi","Int"],x:[["Vers",14],["Crit",8]]},
  {n:"Galerattle Gauntlets",ic:"inv_mail_dragondungeon_c_01_glove",id:193752,sl:"Hands",ty:"Mail",b:"Kyrakka and Erkhart Stormvein",p:["Agi","Int"],x:[["Mastery",9],["Crit",7]]},
  {n:"Sky Saddle Cord",ic:"inv_belt_dragondungeon_c_01",id:193691,sl:"Waist",ty:"Cloth",b:"Kyrakka and Erkhart Stormvein",p:["Int"],x:[["Haste",10],["Mastery",6]]},
  {n:"Wind Soarer's Breeches",ic:"inv_pant_cloth_dragondungeon_c_01",id:193750,sl:"Legs",ty:"Cloth",b:"Kyrakka and Erkhart Stormvein",p:["Int"],x:[["Mastery",14],["Crit",8]]},
  {n:"Kyrakka's Searing Embers",ic:"inv_10_dungeonjewelry_primalist_trinket_4_fire",id:193748,sl:"Trinket",ty:"Trinket",b:"Kyrakka and Erkhart Stormvein",x:[["Crit",15]],e:"Your helpful spells and abilities have a high chance to create a Burning Ember on an ally. The ember flares up after 1 sec, cauterizing wounds to heal and expelling Fire damage split between nearby enemies. (1s cooldown)",ro:["healer"]}]},
 route:[
  {n:1,t:"Opening lust pull",m:"Juggernaut plus escort",d:2,lust:true,p:"Not too bad. Be careful of the Juggernaut's AoE if you are also carrying an Earthbound Guardian dot.",s:["tk_rt"]},
  {n:2,t:"Second Juggernaut",m:"Three-pack",d:2,p:"Once it dies, move across and take the caster plus the group beyond.",s:["tk_rt"]},
  {n:3,t:"Patrolling Juggernaut",m:"Patrol",d:1,p:"This one patrols rather than standing still, so it is much easier to tag cleanly.",s:["tk_rt"]},
  {n:4,t:"Draghar",m:"Mini-boss",d:2,p:"The boss room does not open until it dies — you can no longer drag it inside and fight there.",s:["tk_rt"]},
  {n:5,t:"Upstairs, go right",m:"Flamegullet route",d:2,lust:true,p:"Slightly the easier of the two mini-bosses, though both were softened. Lust around Flamegullet so you have damage for the sub-50% phase.",s:["tk_rt"]},
  {n:6,t:"Destroyers and patrol",m:"Blaze-Bound Destroyers",d:2,p:"Both mini-bosses are grounded now and patrol their own areas — watch where they are and go around the other way.",s:["tk_rt"]},
  {n:7,t:"Kokia",m:"Boss",d:2,p:"Drop fire towards the mini-boss you did not pull, then move in the opposite direction.",s:["tk_rt"]},
  {n:8,t:"Balcony clear",m:"Casters and storm warriors, then Riveti",d:2,p:"The thunderclouds are not needed for count, but clearing them stops you accidentally pulling one onto the boss.",s:["tk_rt"]}],
 reads:[{t:"A fair bit easier and more forgiving than it used to be.",by:"Tactyks",d:"2026-08-15",s:["tk_rt"]},
        {t:"Limited routing — a lot of required mobs. Also one of the dungeons with enough roleplay and running between packs to make stack-maintenance trinkets unreliable.",by:"Tactyks",d:"2026-07-25",s:["tk_pool","tk_trk"]}]},

/* ─────────────────────── TEMPLE OF SETHRALISS ─────────────────────── */
{id:"temple-of-sethraliss",name:"Temple of Sethraliss",short:"Sethraliss",banner:"temple-of-sethraliss",sigil:"i-serpent",origin:"BfA",
 timer:{v:"33 min",s:["wh_dg"]},bosses:4,routing:"limited",
 blurb:"The other Battle for Azeroth return. Two stun-orb gauntlets, a great deal of lightning, and a final encounter that is a trash fight wearing a boss's name.",
 cov:"Now corroborated. A written encounter guide for this dungeon still does not exist, but a written dungeon overview does — and it supplies the timer, the full interrupt and dispel assignments, and a loot table. Trash detail remains thinner here than elsewhere.",cov2:true,
 dispels:{poison:3,magic:3,curse:2,disease:0,enrage:0,bleed:3},
 gates:[{t:"Charge both Eyes of Sethraliss by having a player click and remain nearby while taking ticking damage, to open the sealed snake mouth to the final boss.",s:["tk_tos"]},
        {t:"The Avatar of Sethraliss encounter ends when the boss is healed to 100% health, not when something dies.",s:["tk_tos"]}],
 buffs:[],
 loc:{zone:"Northern Vol'dun",way:"/way #864 51.9 26.7",tp:"Path of the Sacred Temple",lvl:90,note:"Right-most portal in the Timeways room."},
 calls:{s:["wh_dg"],i:[["Poisoned Cheap Shot", "Shrouded Fang", "T1"], ["Addle Mind", "Faithless Subjugator", "T2"], ["Poison Spit", "Toxic Viper", "B2"], ["Essence Disruption", "Temple Disruptor", "T4"], ["Flame Shock", "Twisted Hexxer", "T4 and B4"]],d:[["Poisoned Cheap Shot", "Shrouded Fang", "T1 — clears the stun after the fact"], ["Cytotoxin", "Poisonous Viper", "T2"], ["Addle Mind", "Faithless Subjugator", "T2 — only if the kick was missed"], ["Poison Spit", "Toxic Viper", "B2 — only if the kick was missed"], ["Imbued Conduction", "Imbued Stormcaller", "T3 — stuns on expiry, so this has a deadline"]],p:[["Accumulate Charge", "Agitated Nimbus", "T3"]]},
 rewards:[["Viable Cobra Egg (pet)","Drop","Merektha, Mythic or Mythic+ — hatches after three days"]],
 killers:[
  {n:"Consumed Charge soak",w:"Galvazt. The beam soaks increase physical damage taken by 200%. If the tank is soaking, that needs pairing with a significant defensive or the boss's melee finishes the job.",s:["tk_tos"]},
  {n:"Corruption",w:"Avatar of Sethraliss. Soaking Corrupted Life Force reduces healing done and increases physical damage taken — which is why it must be two DPS, staggered, and never the tank or healer.",s:["tk_tos"]},
  {n:"Serrated Charge",w:"Barbed Crawlers and Krolusks, everywhere. Bleeds in this dungeon are called out as genuinely dangerous, and there are mobs whose whole job is spawning more crawlers.",s:["tk_tos","tk_pool"]}],
 areas:[
  {n:"The Sands",mobs:[
   {n:"Sand Swept Hunter",k:"trash",a:[
    {n:"Arrow Barrage",t:["channel"],c:["cc"],r:["dps"],sev:2,e:"Long channel of moderate physical damage into random players.",h:"Crowd control it whenever you see it — the channel is long enough that this is always worth a global.",s:["tk_tos"]}]},
   {n:"Barbed Crawler",k:"trash",a:[
    {n:"Serrated Charge",t:["dot"],c:["bleedcl","defensive"],r:["healer"],sev:2,e:"Dashes at random players and applies a bleed.",h:"A dwarf racial or any bleed cleanse pays for itself in this dungeon.",s:["tk_tos"]}]},
   {n:"Sand Fury Stonefist",k:"lt",a:[
    {n:"Ground Pound",t:["groupdmg","knockback"],c:["position"],r:["dps","healer","tank"],sev:2,e:"AoE hit with a knockback attached.",s:["tk_tos"]},
    {n:"Sunder Slam",t:["tankbuster","amp"],c:["defensive"],r:["tank"],sev:2,e:"Physical hit that increases damage taken, so ordinary melee swings become dangerous afterwards.",s:["tk_tos"]}]},
   {n:"Storm Adept",k:"caster",a:[
    {n:"Lightning Bolt",t:["dot"],c:["interrupt"],r:["dps"],sev:1,e:"Just a bolt — but it is the only interrupt target in the area, so all your kicks go here.",s:["tk_tos"]}]},
   {n:"Shrouded Fang",k:"trash",a:[
    {n:"Poisoned Cheap Shot",t:["stun"],c:["interrupt","poison"],r:["dps","healer"],sev:2,e:"Stealthed mobs that open with this if you do not break their stealth first. A five-second poison stun if it lands.",h:"A poison dispel removes it after the fact, which is a rare second chance.",s:["tk_tos"]}]}]},
  {n:"The Serpent Halls",mobs:[
   {n:"Sand Sworn Rider",k:"trash",a:[
    {n:"Swarming Krolusk",t:["adds"],c:["focus"],r:["dps"],sev:2,e:"Spawns two Krolusk adds that bring the Serrated Charge bleed with them.",h:"Cleave them down fast rather than letting the bleeds accumulate.",s:["tk_tos"]},
    {n:"Scouring Sands",t:["frontal"],c:["dodge"],r:["dps","healer"],sev:1,e:"Random-target frontal.",h:"Play close enough to the mob that stepping out is easy.",s:["tk_tos"]}]},
   {n:"Poisonous Viper",k:"trash",a:[
    {n:"Cytotoxin",t:["dot"],c:["poison"],r:["healer"],sev:1,e:"Poison debuff.",s:["tk_tos"]}]},
   {n:"Lightning Serpent",k:"trash",a:[
    {n:"Serpent Storm Called",t:["amp","denial"],c:["defensive"],r:["tank"],sev:2,e:"Buff increasing their damage to the tank, dropping a puddle when it expires.",s:["tk_tos"]}]},
   {n:"Faithless Subjugator",k:"caster",a:[
    {n:"Addle Mind",t:["debuff"],c:["interrupt","curse"],r:["dps","healer"],sev:2,e:"Applies a five-second curse disorient if it succeeds.",h:"With a curse dispel you can afford to let some through — as long as the dispeller is not the target.",s:["tk_tos"]}]}]},
  {n:"The Charged Passage",mobs:[
   {n:"Stun Orbs",k:"trash",a:[
    {n:"Orb Gauntlet",t:["env","stun"],c:["dodge","focus"],r:["dps","healer","tank"],sev:2,e:"Orbs rotate in patterns and stun anyone they contact.",h:"They stop spawning entirely if you kill the nearby Spark Channeler.",s:["tk_tos"]}]},
   {n:"Agitated Nimbus",k:"lt",a:[
    {n:"Accumulate Charge",t:["shield","stacking"],c:["purge"],r:["dps"],sev:3,e:"Gains stacks of a magic buff.",h:"Purge them off. Every stack you leave feeds the next ability.",s:["tk_tos"]},
    {n:"Release Charge",t:["groupdmg"],c:["defensive"],r:["healer"],sev:3,e:"Large AoE hit that consumes all the stacks and is amplified accordingly.",h:"Never take two full-health Nimbuses at once.",s:["tk_tos","tk_rt"]}]},
   {n:"Imbued Stormcaller",k:"caster",a:[
    {n:"Imbued Conduction",t:["dot","stun"],c:["magic"],r:["healer"],sev:2,e:"Magic damage-over-time that stuns the player if it expires.",h:"This is a dispel with a deadline, not a dispel of convenience.",s:["tk_tos"]}]},
   {n:"Static Anomaly",k:"trash",a:[
    {n:"Static Shock",t:["tankbuster"],c:["defensive"],r:["tank"],sev:1,e:"Passive tank damage — noticeable if you pull a lot of them.",s:["tk_tos"]},
    {n:"Spark Step",t:["spread"],c:["spread"],r:["dps","healer"],sev:2,e:"Instant teleport to a player with a small AoE on arrival.",h:"Loosely spread when engaging or this hits far harder than it should.",s:["tk_tos"]}]}]},
  {n:"The Eyes",mobs:[
   {n:"Orb Watcher",k:"lt",a:[
    {n:"Caustic Stomp",t:["groupdmg","dot","denial"],c:["unavoidable"],r:["healer"],sev:2,e:"AoE hit plus a party damage-over-time, and circles on the ground.",s:["tk_tos"]},
    {n:"Venomous Slash",t:["tankbuster"],c:["defensive"],r:["tank"],sev:3,e:"A large tank buster.",h:"Spawns when you interact with an eye, so you know exactly when it is coming.",s:["tk_tos"]}]},
   {n:"Temple Disruptor",k:"trash",a:[
    {n:"Essence Disruption",t:["channel"],c:["interrupt","cc"],r:["dps"],sev:2,e:"Two spawn at 50% eye energy and channel to stop the eye charging.",h:"Hard crowd control one — a trap or a paralysis holds for a full minute so you can ignore it entirely — and keep interrupts on the other.",s:["tk_tos"]}]},
   {n:"Twisted Hexxer",k:"caster",a:[
    {n:"Flame Shock",t:["dot"],c:["interrupt"],r:["dps"],sev:2,e:"Cast at random players.",s:["tk_tos"]},
    {n:"Latent Hex",t:["denial","debuff"],c:["position"],r:["dps","healer"],sev:2,e:"A 4-second debuff at moderate Shadow damage per second. On removal it bursts for significant damage within 10 yards and leaves Hex Muck, which turns players inside into a frog — unable to attack or cast — at significant damage every 2 seconds.",h:"Walk it to the edge before it expires. Being frogged in the middle of the eye room is how runs end.",s:["wh_ej","tk_tos"]}]},
   {n:"Faithless Tormentor",k:"trash",a:[
    {n:"Shadow Lash",t:["fixate","stacking"],c:["cc","kite"],r:["dps","healer"],sev:2,e:"Fixates a random player, favouring healers if they are in range, and stacks a debuff on whoever it reaches.",h:"Lock them down and cleave them under the hexer.",s:["tk_tos"]}]}]}],
 encounters:[
  {n:"Adderis and Aspix",o:1,sub:"Wall positioning beats every mechanic here",shape:"One phase, alternating immunity",lv:2,brief:"Two bosses passing a single immunity back and forth as they take damage, so you swap targets repeatedly rather than once. The sequence to learn is Gale Force into Thunder and Lightning — line up against a wall to catch the knockback, then get back fast, because the first half of what follows is a split soak and being alone in it is fatal.",a:[
   {n:"Storm Blessed",t:["shield"],c:["focus"],r:["dps"],sev:2,e:"Storm Blessed grants full damage immunity, and the pair TRANSFER it between themselves as they get injured — it is not a single handover at 40%. Losing one sends the survivor into Frenzy.",h:"The creator guide describes one swap at 40%. The journal describes repeated transfers, so expect to switch targets several times.",s:["wh_ej","tk_tos"]},
   {n:"Tempest Winds",t:["denial","pacify"],c:["position"],r:["dps","healer"],sev:2,t:["denial","pacify","silence","myth"],e:"Targets multiple players: significant damage within 8 yards, and the winds coalesce into tempest zones lasting TWO MINUTES that silence and pacify anyone touching them for 4 seconds.",h:"Two-minute zones means the arena shrinks permanently. Drop these towards the centre and keep the walls clear.",s:["wh_ej","tk_tos"]},
   {n:"Gale Force",t:["line","knockback"],c:["los","position"],r:["dps","healer","tank"],sev:3,e:"Aspix launches gale-force winds for significant Nature damage and pushes players away.",h:"Line up against a wall to catch yourself. Otherwise you are thrown across the room or into trash.",s:["tk_tos"]},
   {n:"Thunder and Lightning",t:["soak"],c:["soak","position"],r:["dps","healer","tank"],sev:3,e:"Two parts. Adderis dashes forward with an arcing blade for massive Nature damage DIVIDED between everyone within 8 yards, then winds up a peal of thunder for very heavy damage to everyone within 20 yards.",h:"So the first half is a stack-and-split and the second half is a get-out. Being caught alone in the dash is fatal; being caught in the thunder is merely expensive.",s:["wh_ej","tk_tos"]},
   {n:"Overload",t:["tankbuster"],c:["defensive"],r:["tank"],sev:2,e:"Eight seconds of +100% attack speed, with each melee strike adding 25% of its damage again as Nature.",s:["wh_ej","tk_tos"]}]},
  {n:"Merektha",o:2,sub:"Boss phase, add phase, repeat",shape:"Boss and add phase alternation",lv:2,brief:"A clean alternation. She fights, then at full energy burrows through the floor while the chamber shakes and her eggs hatch into vipers and a storm serpent. Clear the adds, she returns, repeat. Knot of Snakes is the coordination point — it locks a player out of the fight entirely until the knot is destroyed or crowd controlled, and an arrow marks who is about to be caught.",a:[
   {n:"Lightning Bite",t:["tankbuster","dot"],c:["defensive"],r:["tank"],sev:3,e:"Massive Physical damage plus moderate Nature damage per second for 7 seconds.",s:["wh_ej","tk_tos"]},
   {n:"Knot of Snakes",t:["stun"],c:["stack"],r:["dps","healer"],sev:2,t:["stun","myth"],e:"Snakes wrap the target, preventing all action and suffocating them for moderate damage each second. DESTROYING OR INCAPACITATING the knot frees them — and the clump then unravels and attacks.",h:"Crowd control frees a trapped ally just as well as damage does, which is faster if your damage is committed elsewhere.",s:["wh_ej","tk_tos"]},
   {n:"Add Phase",t:["adds"],c:["interrupt","poison","focus"],r:["dps"],sev:2,e:"She burrows through the ground for very heavy damage to anyone in her path, knocking them up and stunning for 4 seconds, while Burrowquake shakes the party for light damage each second. Eggs hatch into Toxic Vipers (Poison Spit, interruptible) and a Storm Serpent (Storm Catalyst, leaving Lingering Storm at significant damage per second).",h:"Neither the burrow damage nor the party-wide quake appears in the creator guide. Do not stand in her path.",s:["wh_ej","tk_tos"]}]},
  {n:"Galvazzt",o:3,sub:"Three spires, and a soak that hurts to take",shape:"One phase, energy race",lv:3,brief:"An energy race with a body cost. Spires form and beam power into him, and the only way to stop it is to stand in the beam — which carries a 250% increase to physical damage taken for as long as you hold it. He also bleeds energy passively, so a clean interception phase can stop Consume Charge outright. Rotate who blocks, and never let the tank hold a beam into a melee swing.",a:[
   {n:"Lightning Spires",t:["soak","groupdmg"],c:["soak","position"],r:["dps","healer","tank"],sev:3,e:"Spires form from lightning strikes that deal very heavy damage within 5 yards and knock back. Each then energises him unless a player blocks the connection and becomes Galvanized. He passively loses energy over time, so blocking buys real ground.",h:"Mythic creates multiple spires. The passive energy decay means a clean intercept phase can stop Consume Charge entirely.",s:["wh_ej","tk_tos"]},
   {n:"Consumed Charge",t:["groupdmg","amp","debuff"],c:["soak"],r:["dps","healer","tank"],sev:3,e:"Heavy Nature damage to everyone and a 50% reduction in party damage done for 20 seconds — plus a stack of Capacitance, permanently raising his damage by 25%.",s:["wh_ej","tk_tos"]},
   {n:"Galvanized",t:["amp"],c:["defensive"],r:["tank"],sev:3,e:"Light Nature damage every half second, and the blocker takes 250% increased PHYSICAL damage.",h:"The creator guide says 200%; the journal says 250%. Either way, a tank blocking a beam and then eating a melee is the standard death — rotate blockers rather than letting the tank hold one.",s:["wh_ej","tk_tos"]},
   {n:"Induction",t:["groupdmg","denial"],c:["position"],r:["dps","healer","tank"],sev:1,e:"Heavy Nature damage to everyone, leaving an Induction Field at significant damage per second.",h:"Rotate around the room, but do not agonise over space.",s:["wh_ej","tk_tos"]}]},
  {n:"Avatar of Sethraliss",o:4,sub:"A trash fight that ends when the boss is healed to full",shape:"Two stages, healing objective",lv:3,brief:"Not a damage fight at all — you win by restoring her to full health, and it runs in two stages. First, Essence Defilers block all external healing while Corrupted Guardians drop Life Force orbs that two DPS soak in strict alternation, because the debuff cuts healing done and multiplies physical damage taken. Then the taint lifts, tormentors fixate the healer, and you push each to 25% so she siphons them. Unusual, and it punishes improvisation.",a:[
   {n:"Defiling Taint",t:["channel","adds"],c:["focus"],r:["dps"],sev:3,e:"Essence Defilers channel Defiling Taint into the Avatar, preventing ALL external healing. Killing every Defiler cleanses it and ends Stage One.",h:"Do not waste globals healing her while one lives.",s:["wh_ej","tk_tos"]},
   {n:"Unstable Corruption",t:["adds","dot","death"],c:["defensive","soak"],r:["tank","healer"],sev:2,e:"Tainted Strike hits the tank for massive Physical damage plus moderate Shadow damage per second for 10 seconds, stacking. Vile Charge does significant damage plus moderate damage per second for 8 seconds to a random player. Unstable Corruption erupts for massive damage within 20 yards and forms Corrupted Lifeforce — multiple orbs on Mythic.",s:["wh_ej","tk_tos"]},
   {n:"Corrupted Life Force",t:["soak","debuff"],c:["soak"],r:["dps"],sev:3,e:"Touching one cleanses it so the Avatar can consume it, healing her 2% plus a regeneration. The soaker takes Corruption: moderate damage per second, healing done reduced 33%, and PHYSICAL DAMAGE TAKEN INCREASED BY 300% for 15 seconds, stacking. An uncleansed orb bursts for heavy damage to everyone and raises damage from that burst by 100% for 3 seconds.",h:"+300% physical damage taken is why this can never be the tank, and −33% healing done is why it can never be the healer. Two DPS, strictly alternating, never overlapping — the 3-second burst vulnerability is what kills groups that stagger badly.",s:["wh_ej","tk_tos"]},
   {n:"Siphon the Weak",t:["adds","fixate"],c:["cc","kite"],r:["dps","healer","tank"],sev:3,e:"Faithless Tormentors fixate the closest healer, and each strike reduces that healer's healing done by 5%, stacking. You do not kill them: damage them below 25% and the Avatar SIPHONS them, killing them instantly and healing herself for 0.7% of her maximum health. Agony of Sethraliss also jolts the chamber for heavy damage within 4.5 yards.",h:"The creator guide says each wave killed heals her 3%. The journal says 0.7% per Tormentor siphoned below 25% — so the job is to push several to 25% quickly rather than to finish any of them.",s:["wh_ej","tk_tos"]}]}],
loot:{s:["wh_dg"],i:[
  {n:"Bindings of the Slithering Current",ic:"inv_bracer_cloth_zandalardungeon_c_01",id:159263,sl:"Wrist",ty:"Cloth",b:"Adderis and Aspix",p:["Int"],x:[["Crit",4],["Vers",3]]},
  {n:"Sandswept Sandals",ic:"inv_boot_cloth_zandalardungeon_c_01",id:159259,sl:"Feet",ty:"Cloth",b:"Adderis and Aspix",p:["Int"],x:[["Crit",5],["Haste",3]]},
  {n:"Whirling Dervish Sash",ic:"inv_belt_leather_zandalardungeon_c_01",id:159317,sl:"Waist",ty:"Leather",b:"Adderis and Aspix",p:["Agi","Int"],x:[["Mastery",5],["Haste",3]]},
  {n:"Leggings of the Galeforce Viper",ic:"inv_pant_leather_zandalardungeon_c_01",id:159329,sl:"Legs",ty:"Leather",b:"Adderis and Aspix",p:["Agi","Int"],x:[["Mastery",6],["Vers",5]]},
  {n:"Arc-Glass Bindings",ic:"inv_bracer_mail_zandalardungeon_c_01",id:159380,sl:"Wrist",ty:"Mail",b:"Adderis and Aspix",p:["Agi","Int"],x:[["Crit",4],["Haste",3]]},
  {n:"Sabatons of Coruscating Energy",ic:"inv_boot_mail_zandalardungeon_c_01",id:159388,sl:"Feet",ty:"Mail",b:"Adderis and Aspix",p:["Agi","Int"],x:[["Mastery",5],["Crit",4]]},
  {n:"Shard-Tipped Vambraces",ic:"inv_bracer_plate_zandalardungeon_c_01",id:159425,sl:"Wrist",ty:"Plate",b:"Adderis and Aspix",p:["Str","Int"],x:[["Vers",4],["Haste",3]]},
  {n:"Legplates of Charged Duality",ic:"inv_pant_plate_zandalardungeon_c_01",id:159435,sl:"Legs",ty:"Plate",b:"Adderis and Aspix",p:["Str","Int"],x:[["Vers",7],["Crit",4]]},
  {n:"Staff of the Lightning Serpent",ic:"inv_staff_2h_battledungeon_c_04",id:159636,sl:"Two-hand",ty:"Staff",b:"Adderis and Aspix",p:["Int"],x:[["Haste",7],["Mastery",5]]},
  {n:"Twin-Strike Polearm",ic:"inv_polearm_2h_snakeman_c_01",id:158370,sl:"Two-hand",ty:"Polearm",b:"Adderis and Aspix",p:["Agi"],x:[["Haste",7],["Crit",5]]},
  {n:"Ouroborial Sash",ic:"inv_belt_cloth_zandalardungeon_c_01",id:159255,sl:"Waist",ty:"Cloth",b:"Merektha",p:["Int"],x:[["Mastery",5],["Vers",4]]},
  {n:"Sand-Shined Snakeskin Sandals",ic:"inv_boot_leather_zandalardungeon_c_01",id:159327,sl:"Feet",ty:"Leather",b:"Merektha",p:["Agi","Int"],x:[["Crit",5],["Mastery",4]]},
  {n:"Legguards of the Awakening Brood",ic:"inv_pant_mail_zandalardungeon_c_01",id:159375,sl:"Legs",ty:"Mail",b:"Merektha",p:["Agi","Int"],x:[["Crit",7],["Haste",5]]},
  {n:"Fangproof Gauntlets",ic:"inv_glove_plate_zandalardungeon_c_01",id:159437,sl:"Hands",ty:"Plate",b:"Merektha",p:["Str","Int"],x:[["Haste",5],["Mastery",3]]},
  {n:"Jade Ophidian Band",ic:"inv_ring_80_04c",id:162544,sl:"Ring",ty:"Ring",b:"Merektha",x:[["Mastery",10],["Vers",6]]},
  {n:"Swarm's Edge",ic:"inv_sword_1h_battledungeon_c_02",id:158714,sl:"One-hand",ty:"Sword",b:"Merektha",p:["Agi"],x:[["Vers",3],["Mastery",2]]},
  {n:"Snakebite Recurve",ic:"inv_bow_1h_battledungeon_c_01",id:159637,sl:"Ranged",ty:"Bow",b:"Merektha",p:["Agi"],x:[["Crit",7],["Haste",5]]},
  {n:"Merektha's Fang",ic:"inv_misc_food_87_sporelingsnack",id:158367,sl:"Trinket",ty:"Trinket",b:"Merektha",p:["Str"],u:"Pump the fang's noxious venom gland, spraying poisonous mist forward in a cone. The mist deals Nature damage every 1 sec over 3 sec, stacking up to 3 times. (2 Min Cooldown)",ro:["mdps"]},
  {n:"Handwraps of Oscillating Polarity",ic:"inv_glove_cloth_zandalardungeon_c_01",id:159247,sl:"Hands",ty:"Cloth",b:"Galvazzt",p:["Int"],x:[["Crit",6],["Haste",3]]},
  {n:"Sand-Scoured Greatbelt",ic:"inv_belt_plate_zandalardungeon_c_01",id:159442,sl:"Waist",ty:"Plate",b:"Galvazzt",p:["Str","Int"],x:[["Vers",5],["Mastery",3]]},
  {n:"Charged Sandstone Band",ic:"inv_ring_80_03d",id:158366,sl:"Ring",ty:"Ring",b:"Galvazzt",x:[["Crit",9],["Mastery",7]]},
  {n:"Galvanized Stormcrusher",ic:"inv_mace_1h_pandaraid_d_01",id:158369,sl:"One-hand",ty:"Mace",b:"Galvazzt",p:["Int"],x:[["Haste",3],["Vers",2]]},
  {n:"Bulwark of Brimming Potential",ic:"inv_shield_1h_battledungeon_c_02",id:159664,sl:"Off-hand",ty:"Shield",b:"Galvazzt",p:["Str","Int"],x:[["Crit",3],["Vers",3]]},
  {n:"Tiny Electromental in a Jar",ic:"inv_alchemy_71_potion4",id:158374,sl:"Trinket",ty:"Trinket",b:"Galvazzt",p:["Agi"],e:"Your attacks and abilities have a chance to grant Phenomenal Power. On reaching 12 applications you will Unleash Lightning, inflicting Nature damage. \"Phenomenal lightning power, itty bitty containment space.\"",ro:["mdps"]},
  {n:"Brood Cleanser's Amice",ic:"inv_shoulder_cloth_zandalardungeon_c_01",id:239031,sl:"Shoulder",ty:"Cloth",b:"Avatar of Sethraliss",p:["Int"],x:[["Crit",4],["Haste",4]]},
  {n:"Robes of the Reborn Serpent",ic:"inv_chest_cloth_zandalardungeon_c_01",id:239032,sl:"Chest",ty:"Cloth",b:"Avatar of Sethraliss",p:["Int"],x:[["Mastery",7],["Crit",5]]},
  {n:"Hood of the Slithering Loa",ic:"inv_helm_leather_zandalardungeon_c_01",id:239033,sl:"Head",ty:"Leather",b:"Avatar of Sethraliss",p:["Agi","Int"],x:[["Crit",7],["Haste",5]]},
  {n:"Grips of Electrified Defense",ic:"inv_glove_leather_zandalardungeon_c_01",id:159337,sl:"Hands",ty:"Leather",b:"Avatar of Sethraliss",p:["Agi","Int"],x:[["Mastery",5],["Vers",4]]},
  {n:"Sethraliss' Fanged Helm",ic:"inv_helm_mail_zandalardungeon_c_01",id:239035,sl:"Head",ty:"Mail",b:"Avatar of Sethraliss",p:["Agi","Int"],x:[["Mastery",7],["Crit",5]]},
  {n:"Corrupted Hexxer's Vestments",ic:"inv_chest_mail_zandalardungeon_c_01",id:239034,sl:"Chest",ty:"Mail",b:"Avatar of Sethraliss",p:["Agi","Int"],x:[["Vers",8],["Mastery",4]]},
  {n:"C'thraxxi Binders Pauldrons",ic:"inv_shoulder_plate_zandalardungeon_c_01",id:239037,sl:"Shoulder",ty:"Plate",b:"Avatar of Sethraliss",p:["Str","Int"],x:[["Haste",6],["Crit",3]]},
  {n:"Desert Guardian's Breastplate",ic:"inv_chest_plate_zandalardungeon_c_01",id:159424,sl:"Chest",ty:"Plate",b:"Avatar of Sethraliss",p:["Str","Int"]},
  {n:"Resonating Crystal Scimitar",ic:"inv_sword_1h_battledungeon_c_02",id:158373,sl:"One-hand",ty:"Sword",b:"Avatar of Sethraliss",p:["Str"],x:[["Crit",3],["Haste",3]]},
  {n:"Sethraliss' Defiled Relic",ic:"inv_staff_2h_snakeman_c_01",id:158368,sl:"Trinket",ty:"Trinket",b:"Avatar of Sethraliss",p:["Int"],u:"Curse the target with a Rotten Wound, dealing Nature damage over 15 sec. While the wound persists, your damaging spells have a high chance to deepen the wound, inflicting an additional Nature damage. (2 Min Cooldown)",ro:["rdps"]}]},
 route:[
  {n:1,t:"Go right off the top",m:"Opening packs",d:2,p:"Fewer casters on this side, so it is the easier start.",s:["tk_rt"]},
  {n:2,t:"Conservative stop",m:"Big guy only",d:1,lust:true,p:"Faster groups run all the way to the next pack and lust both together. The pug version stops early and groups at the bottom of the first stairs.",s:["tk_rt"]},
  {n:3,t:"Gauntlet drag",m:"Single mob dragged forward",d:2,p:"Tag the lone mob in the gauntlet and drag it to the first pack. Watch the frontal while you run — at long range it is genuinely scary.",s:["tk_rt"]},
  {n:4,t:"One rider at a time",m:"Sand Sworn Riders",d:2,p:"The goal for four pulls in a row is a single frontal mob each, because they spawn the bleeding crawlers.",s:["tk_rt"]},
  {n:5,t:"Three pulls, not two",m:"Serpent hall room",d:2,p:"Could be two pulls, but three keeps the interrupt load per pull manageable.",s:["tk_rt"]},
  {n:6,t:"Nimbus crossing",m:"Agitated Nimbuses",d:3,p:"Only chain the second Nimbus once the first is low. Two at full health is very dangerous.",s:["tk_rt"]},
  {n:7,t:"The eye room",m:"Everything",d:2,p:"Kill the Spark Channeler first, then clear right, then left. Stack the Temple Disruptors and hard-CC one.",s:["tk_rt"]}],
 reads:[{t:"Bleeds in King's Rest and Temple of Sethraliss are genuinely dangerous this season, which makes the dwarf racial worth more on non-tank specs than it was in Season 1.",by:"Tactyks",d:"2026-07-25",s:["tk_pool"]},
        {t:"Limited routing — you have to pull a large majority of the mobs you encounter to reach count.",by:"Tactyks",d:"2026-08-15",s:["tk_rt"]}]}
];

const D=Object.fromEntries(DUNGEONS.map(d=>[d.id,d]));
const ROUTING={locked:"Locked — almost no routing choice",limited:"Limited — many required mobs",
  hybrid:"Hybrid — real choice in parts",flexible:"Flexible — more trash than you need"};
