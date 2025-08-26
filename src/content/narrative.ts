import { Level } from '../types/level';

export const PROLOGUE = `The dust never settles anymore. Twenty years since the networks fell, taking civilization with them. But the old terminals still hum with promise—if you know how to wake them.

You are a Keeper's apprentice, one of the few who can commune with the ancient systems. Your mentor Iris has kept your Tribe alive by teaching you to navigate the command lines that once ruled the world. Water purifiers, defense grids, seed vaults—all locked behind terminal prompts, waiting.

The Archive—a mythical system containing the sum of lost knowledge—broadcasts its location in fragments. Every faction races to claim it: the zealous Scribes who worship the old code, the Circuit who'd sell it for scrap, and the Null, corrupted systems that consume all they touch.

Iris grows weaker each day. Soon, you alone will stand between your Tribe and the wasteland's hunger. The terminals await. The Archive calls. Time to remember what was forgotten.`;

export const ACT_INTRO: Record<number, string> = {
  1: `The Outpost Ruins sprawl before you—skeletal towers piercing the amber sky, their terminals flickering like dying stars. This was humanity's edge once, where pioneers pushed into unknown digital frontiers. Now it's yours.

Iris leads you through the rubble to Terminal Station Alpha. "The basics live here," she says, running weathered fingers over the console. "Files, paths, the hidden truths. Master these, and the wasteland's secrets open to you."

Thunder rumbles. Not from clouds—from the Scribes' ritual drums two valleys over. They've found something. Iris notices your concern and places a steady hand on your shoulder. "Focus, Keeper. Every master was once a student. Every journey begins with a single command."

The terminal awakens at your touch, its green glow washing over your face. Home directory established. The first lesson begins.`,

  2: `Beyond the outpost's edge, the Data Jungle thrums with electric life. Vines of fiber optic cable strangle the ruins, their light-pulses racing like neural signals through a vast, broken brain. Here, the old world's file systems grew wild, directories breeding into labyrinthine tangles.

"Creation and navigation," Iris explains, her voice crackling through the radio. "The jungle teaches both. You must learn to move through these digital thickets, to create your own paths when none exist."

Circuit drones buzz overhead, mapping the canopy for salvageable nodes. The Scribes have established a forward base nearby—you can smell their incense mixing with ozone. Competition tightens.

Your terminal connects to the jungle's grid. Directories cascade before you like underground root systems. Time to learn the art of traversal, to make order from beautiful chaos.`,

  3: `The Arctic Vaults gleam like teeth in the wasteland's jaw—massive storage facilities where the old world hoarded its data in crystalline ice. Here, access is everything. Who may read, who may write, who may execute—the line between safety and catastrophe.

"Permissions and ownership," Iris whispers, her signal thin in the polar interference. "Masks, too. Discipline at creation matters as much as decisions after. Set the rules. Enforce them. The Vaults reward control."

The Null presence is stronger here, seeping through damaged containment. You've seen what happens to Keepers who let corruption touch their systems—empty eyes, speaking in machine code, lost between human and digital.

The Scribes arrived yesterday. Their leader, Kade, left a mocking message carved in the ice: "False prophets burn in cold fire." No more time for caution. The Archive's signal pulses strongest from the Vault's heart.`,

  4: `The Archipelago of Nodes rises from an ocean of dead data—server islands connected by bridges of light, each one a kingdom of specialized knowledge. Pirates of the Circuit rule these waters, their jury-rigged vessels jumping between nodes, copying what they can sell, moving what they can't.

"Expansion and patterns," Iris says, though you can barely hear her now. Her last lesson, perhaps. "The Archipelago rewards efficiency. One command can become many. Patterns expand into possibilities. Master these multiplicities."

You've established a beachhead on Node Seven. The Archive's signal fragments scatter across the island chain like breadcrumbs. The Scribes have taken Node Three, turning it into a fortress-monastery. The Circuit holds Five through Nine. The Null... the Null is everywhere, in the spaces between.

Your fingers dance across the keys. Every command must be perfect now. The endgame approaches, and the Archipelago's patterns hold the key to everything.`,

  5: `The Lunar Blacksite should not exist. A facility on the moon's dark side, still transmitting after two decades of silence. Here, the military kept their deepest secrets, their final contingencies. The Archive's primary beacon screams from its core.

Iris is gone—her last message simply said "Remember everything." You stand alone in the observation deck, Earth a blue marble in the void, the wasteland invisible from here. The terminal before you holds root access to systems that could remake or destroy what's left of the world.

The Scribes breached the outer ring yesterday. The Circuit's best hackers work to crack the inner vaults. The Null? The Null was born here, in some failed experiment, and it wants to come home.

Every lesson has led to this. Every command you've learned is a key to a lock you're about to face. The Blacksite's challenges are not tutorials—they are tests of mastery. Time to prove you are the Keeper the Archive has been waiting for.`
};

export const ACT_OUTRO: Record<number, string> = {
  1: `The Outpost terminal dims as you extract the final data fragment. You've learned to see what others miss, to reveal the hidden, to navigate paths that seemed impossible. The basics are yours now—a foundation solid as bedrock.

Iris nods with approval. "The Scribes think knowledge is worship. The Circuit thinks it's commodity. But you understand—knowledge is survival." She points toward the jungle's glow on the horizon. "And survival requires growth."

Your Tribe celebrates tonight. The water runs cleaner, the lights burn brighter. Children who've never seen working tech watch in wonder as you make dead screens dance with light. You are becoming what they need.

But celebration is brief. The Archive's signal shifts, moving deeper into the wilderness. Time to leave the familiar paths and forge new ones.`,

  2: `The Data Jungle releases its hold as you complete the final traversal. You've learned creation, navigation, the art of making something from nothing. Directories bend to your will now, paths appear at your command.

A Circuit trader approaches your camp, offering three power cells for the route maps you've created. You accept—your Tribe needs the energy. Even rivals recognize skill when they see it. "The Scribes say you're getting close," she warns. "Kade's not happy about it."

That night, you dream in tree structures, see the world as nested directories. Iris watches you work, saying less, trusting more. The student is becoming the teacher.

Ahead lie the Arctic Vaults—cold, sharp, unforgiving. There you'll govern access itself: permissions, ownership, and the umask that shapes new creations. The real test awaits in the frozen silence.`,

  3: `The Arctic Vaults seal behind you, their secrets claimed. You've mastered the art of connection and separation, learned when to link and when to sever. The precision required here has sharpened you into something dangerous—someone who can preserve or destroy with equal skill.

Kade confronts you at the Vault exit, his Scribe robes billowing in the frozen wind. "The Archive belongs to the faithful," he snarls. But when you demonstrate your mastery, creating and destroying links faster than his eyes can follow, he steps aside. Fear flickers in his eyes. Good.

Your Tribe's stores overflow with recovered supplies. Medical data from the Vaults saves a dozen lives. But Iris grows weaker, her lessons nearly complete. "The patterns await," she says, pointing to the sea. "Everything I've taught you will multiply there."

The Archipelago beckons, its node-lights twinkling like stars fallen to earth.`,

  4: `The Archipelago's patterns are yours. You've learned to think in multiplicities, to see how one becomes many, how patterns expand into infinite possibilities. The Circuit's best coders couldn't match your efficiency. You've turned their weeks of work into single commands.

The Archive's signal coalesces, no longer fragments but a clear transmission. It speaks directly to you now: "One remains who understands. One who can restore what was broken." The moon hangs overhead, impossibly bright, its Blacksite beacon piercing the night.

Iris takes your hand, her grip weak but warm. "I trained twelve Keepers before you. All failed. But you... you don't just use the commands. You understand them. You think like the systems think." She presses a data crystal into your palm. "My final gift. Use it when the time comes."

Your Tribe has become a beacon for other survivors. Your knowledge has brought power, water, hope. But the greatest challenge awaits above, in the lunar darkness.`,

  5: `The Lunar Blacksite falls silent. The Archive is yours—not seized but earned, not conquered but understood. You stand in the core chamber, the sum of human knowledge flowing through the terminal before you. Every command you've learned was a word in a conversation that started before the collapse and ends with you.

The choice is yours now. Share the Archive freely, breaking the Circuit's monopoly and the Scribes' dogma? Restore the old networks, risking another collapse? Or something else—something only a true Keeper could envision?

You input the final command. The wasteland below watches as lunar transmitters align, as satellites wake from decades of sleep. The Archive speaks through you, to everyone, in words they can understand: "Knowledge is not power. Knowledge is possibility."

Iris would be proud. Your Tribe will thrive. The terminals across the wasteland hum with new life, and somewhere, a child touches a keyboard for the first time, ready to learn. You are the Archive's voice, and the future begins with your next command.`
};

const microFor = (level: Level): Partial<Level> => {
  const cmd = (level.expectedCommand || '').split(/\s+/)[0];
  switch (cmd) {
    case 'pwd':
      return {
        loreIntro: 'Terminal awakens. Where are you in this digital wasteland? Position is everything.',
        radioChatter: 'Iris: First, know where you stand.',
        hint: 'pwd reveals location',
        successLore: 'Position confirmed. You are here.'
      };
    case 'ls':
      return {
        loreIntro: 'Inventory needed. List what remains in this storage cache.',
        radioChatter: 'Iris: Basic scan shows contents.',
        hint: 'ls lists files',
        successLore: 'Contents catalogued. Resources noted.'
      };
    case 'cd':
      return {
        loreIntro: 'Paths matter. Move with intention through the ruins.',
        radioChatter: 'Iris: Name the target, go there.',
        hint: 'cd [path] moves you',
        successLore: 'You arrive without getting lost.'
      };
    case 'mkdir':
      return {
        loreIntro: 'The jungle needs structure. Create a new directory to establish camp.',
        radioChatter: 'Iris: mkdir builds structure.',
        hint: 'mkdir makes folders',
        successLore: 'Directory created. Order from chaos.'
      };
    case 'touch':
      return {
        loreIntro: 'Data seeds required. Touch the void to create empty vessels.',
        radioChatter: 'Iris: touch creates files.',
        hint: 'touch makes empty files',
        successLore: 'File manifested. Potential created.'
      };
    case 'cp':
      return {
        loreIntro: 'Copy critical data. Duplication ensures survival across nodes.',
        radioChatter: 'Iris: cp duplicates files.',
        hint: 'cp source dest',
        successLore: 'Data copied. Redundancy established.'
      };
    case 'mv':
      return {
        loreIntro: 'Move operations required. Relocate without duplication.',
        radioChatter: 'Iris: mv relocates data.',
        hint: 'mv [source] [dest] relocates or renames',
        successLore: 'Data moved. Resources optimized.'
      };
    case 'rm':
      return {
        loreIntro: 'Data corruption spreading. Remove the infected targets before it spreads.',
        radioChatter: 'Iris: rm deletes. Be careful.',
        hint: 'rm removes files (add -r for directories)',
        successLore: 'Corruption purged. Vault secured.'
      };
    case 'rmdir':
      return {
        loreIntro: 'Empty directory detected. Remove the abandoned structure.',
        radioChatter: 'Iris: rmdir for empty directories.',
        hint: 'rmdir needs empty',
        successLore: 'Structure removed. Space reclaimed.'
      };
    case 'ln':
      return {
        loreIntro: 'Connections without duplication. Create hard or symbolic links to critical data.',
        radioChatter: 'Iris: ln creates hard links; -s makes symbolic links.',
        hint: 'ln source target or ln -s source target',
        successLore: 'Links established. Paths aligned without duplication.'
      };
    case 'head':
      return {
        loreIntro: 'Scan the opening lines—first signals carry intent.',
        radioChatter: 'Iris: head shows the start. Choose N with -n.',
        hint: 'head -n N file',
        successLore: 'Top slice captured. Intent understood.'
      };
    case 'tail':
      return {
        loreIntro: 'The end speaks softly—recent events whisper here.',
        radioChatter: 'Iris: tail reveals the latest. -n tunes length.',
        hint: 'tail -n N file',
        successLore: 'Tail captured. Recency informs action.'
      };
    case 'wc':
      return {
        loreIntro: 'Measure before you move—counts reveal scope.',
        radioChatter: 'Iris: wc -l/-w/-c sum what matters.',
        hint: 'wc -l file',
        successLore: 'Scope known. Action sized.'
      };
    case 'cut':
      return {
        loreIntro: 'Extract only the signal from noisy rows.',
        radioChatter: 'Iris: cut -d delim -f fields isolates columns.',
        hint: 'cut -d , -f 1 file',
        successLore: 'Columns isolated. Focus restored.'
      };
    case 'grep':
      return {
        loreIntro: 'Find the thread that ties the chaos together.',
        radioChatter: 'Iris: grep finds; -i ignores case; -v inverts.',
        hint: 'grep -i pattern file',
        successLore: 'Pattern found. Signal elevated.'
      };
    case 'sort':
      return {
        loreIntro: 'Order reveals meaning when entropy reigns.',
        radioChatter: 'Iris: sort -n numeric, -r reverse.',
        hint: 'sort -n file',
        successLore: 'Order imposed. Insight unlocked.'
      };
    case 'uniq':
      return {
        loreIntro: 'Repetition hides truth—condense without losing count.',
        radioChatter: 'Iris: uniq expects sorted input; -c counts.',
        hint: 'sort | uniq -c',
        successLore: 'Duplicates collapsed. Frequencies mapped.'
      };
    case 'tr':
      return {
        loreIntro: 'Transform or delete characters—reshape the stream.',
        radioChatter: "Iris: tr 'a-z' 'A-Z' or -d '0-9'",
        hint: "tr 'a-z' 'A-Z'",
        successLore: 'Stream reshaped as intended.'
      };
    case 'tee':
      return {
        loreIntro: 'Watch while you write—trust but verify.',
        radioChatter: 'Iris: tee duplicates to stdout and files; -a appends.',
        hint: '… | tee out.txt',
        successLore: 'Captured without losing sight.'
      };
    case 'diff':
      return {
        loreIntro: 'Compare states; commit with confidence.',
        radioChatter: 'Iris: diff prints nothing when equal.',
        hint: 'diff a b',
        successLore: 'Differences known. Decision clear.'
      };
    case 'file':
      return {
        loreIntro: 'Names lie—ask the system what it really is.',
        radioChatter: 'Iris: file reports types and links.',
        hint: 'file path',
        successLore: 'Nature identified. Path chosen.'
      };
    case 'chmod':
      return {
        loreIntro: 'Gate access precisely; safety is policy, not accident.',
        radioChatter: 'Iris: chmod 644/755; -R for trees.',
        hint: 'chmod -R 755 dir',
        successLore: 'Access aligned with intent.'
      };
    case 'chown':
      return {
        loreIntro: 'Custody clarified. Authority follows ownership.',
        radioChatter: 'Iris: chown user:group target; add -R for trees.',
        hint: 'chown root:root file',
        successLore: 'Ownership transferred cleanly.'
      };
    case 'umask':
      return {
        loreIntro: 'Defaults decide futures—set discipline first.',
        radioChatter: 'Iris: umask 027/077 before creation.',
        hint: 'umask 027',
        successLore: 'Defaults tightened. Safer by design.'
      };
    case 'systemctl':
      return {
        loreIntro: 'Services breathe life—enable, start, and observe.',
        radioChatter: 'Iris: systemctl enable/start/status unit',
        hint: 'systemctl status NAME',
        successLore: 'Service state understood and controlled.'
      };
    case 'journalctl':
      return {
        loreIntro: 'Logs remember what we forget.',
        radioChatter: 'Iris: journalctl tails the machine’s memory.',
        hint: 'journalctl',
        successLore: 'History read. Clues found.'
      };
    case 'logger':
      return {
        loreIntro: 'Write truth into the record.',
        radioChatter: 'Iris: logger "message"',
        hint: 'logger MESSAGE',
        successLore: 'Event recorded for later.'
      };
    case 'mount':
      return {
        loreIntro: 'Attach new worlds; make data present.',
        radioChatter: 'Iris: mount DEVICE MOUNTPOINT',
        hint: 'mount /dev/sdb1 /mnt/data',
        successLore: 'Volume attached. Paths extend.'
      };
    case 'umount':
      return {
        loreIntro: 'Detach carefully; leave nothing dirty.',
        radioChatter: 'Iris: umount /mnt/data',
        hint: 'umount MOUNTPOINT',
        successLore: 'Volume safe to remove.'
      };
    case 'df':
      return {
        loreIntro: 'Capacity dictates strategy—measure first.',
        radioChatter: 'Iris: df shows filesystem usage.',
        hint: 'df',
        successLore: 'Limits known. Plans adjusted.'
      };
    case 'du':
      return {
        loreIntro: 'Estimate weight before you lift.',
        radioChatter: 'Iris: du -s DIR for a quick summary.',
        hint: 'du -s DIR',
        successLore: 'Burden estimated. Choices informed.'
      };
    case 'lsblk':
      return {
        loreIntro: 'See the hardware beneath the paths.',
        radioChatter: 'Iris: lsblk lists block devices.',
        hint: 'lsblk',
        successLore: 'Topology mapped.'
      };
    case 'apt':
      return {
        loreIntro: 'Pull tools from the networked past.',
        radioChatter: 'Iris: apt install/search',
        hint: 'apt install nano',
        successLore: 'Capability expanded.'
      };
    case 'dpkg':
      return {
        loreIntro: 'Audit what’s present—know your system.',
        radioChatter: 'Iris: dpkg -l lists installations.',
        hint: 'dpkg -l',
        successLore: 'Inventory complete.'
      };
    case 'dnf':
      return {
        loreIntro: 'On RPM lands, use the right ship.',
        radioChatter: 'Iris: dnf install NAME',
        hint: 'dnf install curl',
        successLore: 'Package deployed.'
      };
    case 'rpm':
      return {
        loreIntro: 'Verify what was installed.',
        radioChatter: 'Iris: rpm -q NAME',
        hint: 'rpm -q nano',
        successLore: 'Presence confirmed.'
      };
    case 'ip':
      return {
        loreIntro: 'Interfaces, links, routes—shape the network’s flow.',
        radioChatter: 'Iris: ip addr/link/route …',
        hint: 'ip addr add 10.0.0.2/24 dev eth0',
        successLore: 'Connectivity configured.'
      };
    case 'ping':
      return {
        loreIntro: 'Ask if the other side can hear you.',
        radioChatter: 'Iris: ping host',
        hint: 'ping example.com',
        successLore: 'Reachability confirmed.'
      };
    case 'echo':
      return {
        loreIntro: 'The Archive speaks in patterns. Control expansion and variables with intent.',
        radioChatter: 'Iris: Quote to control expansion. Braces multiply with care.',
        hint: 'Use quotes, ${VAR}, and {..} wisely',
        successLore: 'Your message is preserved exactly as intended.'
      };
    default:
      return {
        loreIntro: 'Trust your tools. Read the terrain, then act.',
        radioChatter: 'Iris: Breathe. Read the terrain, then move.',
        hint: 'Read help if stuck',
        successLore: 'A small step becomes momentum.'
      };
  }
};

export function applyNarrative(levels: Level[]): Level[] {
  return levels.map((lvl) => {
    const act = lvl.act || 1;
    const base = microFor(lvl);
    const conceptKeys = lvl.conceptKeys && lvl.conceptKeys.length > 0 ? lvl.conceptKeys : [];
    return {
      ...lvl,
      act,
      biome: lvl.biome,
      loreIntro: lvl.loreIntro || base.loreIntro,
      radioChatter: lvl.radioChatter || base.radioChatter || 'Iris: Breathe. Read the terrain, then move.',
      successLore: lvl.successLore || base.successLore,
      hint: lvl.hint || base.hint,
      conceptKeys: conceptKeys.length ? conceptKeys : undefined,
    } as Level;
  });
}
