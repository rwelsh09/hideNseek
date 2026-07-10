import React, { useEffect,useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { QUESTION_RULES } from "@/lib/rules";

export function RulesAccordion() {
  const [value, setValue] = useState<string[]>(["game-overview"]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (
        [
          "game-overview",
          "the-hiding-phase",
          "the-seeking-phase",
          "time-penalties",
          "ending-the-round",
          "tips-for-a-better-game",
        ].includes(hash)
      ) {
        setValue((prev) => (prev.includes(hash) ? prev : [...prev, hash]));
      }
    };

    // Initial check on mount
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <Accordion
      type="multiple"
      value={value}
      onValueChange={setValue}
      className="w-full space-y-4"
    >
      <AccordionItem value="game-overview" id="game-overview" className="scroll-mt-8 border-slate-700 bg-slate-800/50 rounded-lg px-4 border-none">
        <AccordionTrigger className="text-2xl font-semibold hover:no-underline hover:text-blue-400">Game Overview</AccordionTrigger>
        <AccordionContent className="text-base text-slate-300 space-y-4 pt-2">
          <p>
            This game of <strong>Hide & Seek</strong> is played across the Calgary transit system. One player (the <strong>Hider</strong>) uses public transit to travel to a secret location and establish a Hiding Zone. The remaining players (the <strong>Seekers</strong>) work cooperatively to track down the Hider by asking strategic questions.
          </p>
          <p>
            The game operates in rounds. Once the Seekers can visually see the Hider, the round ends, and a new player becomes the Hider. The player who remains hidden for the longest total time wins the game.
          </p>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong>The Map:</strong> The game map is strictly defined by the &quot;Calgary Rapid Transit Network&quot; (CTrains and MAX buses). All gameplay and movement must occur within the bounds of this network.
              <small className="block mt-1 text-slate-400">
                Note that non-CTrain &quot;stations&quot; shown on the map are not always single physical stations/bus stops, but rather virtual stations created by merging nearby stops into a single Hiding Zone.
              </small>
            </li>
            <li>
              <strong>The Head Start:</strong> Before the Seekers can begin their pursuit, the Hider is granted a designated head start period (e.g. 45 minutes).
            </li>
            <li>
              <strong>Transit Only:</strong> During the game, all players may only travel using approved public transit and walking. No private vehicles or ride-shares are allowed.
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="the-hiding-phase" id="the-hiding-phase" className="scroll-mt-8 border-slate-700 bg-slate-800/50 rounded-lg px-4 border-none">
        <AccordionTrigger className="text-2xl font-semibold hover:no-underline hover:text-blue-400">The Hiding Phase</AccordionTrigger>
        <AccordionContent className="text-base text-slate-300 space-y-4 pt-2">
          <p>
            Once the head start concludes, the station nearest to the Hider is their Hiding Zone. The Hider must be within a designated Hiding Zone before the timer runs out.
          </p>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong>Zone Radius:</strong> The Hider must remain within a specific radius{" "}
              <small className="text-slate-400">
                (agreed upon by all players before the game starts)
              </small>{" "}
              of their Station for the remainder of the round.
            </li>
            <li>
              <strong>Stationary Rule:</strong> Now that the Hiding Zone is locked in, the Hider cannot leave this area until they are caught. They may move freely within the zone until the <strong>end game</strong> begins.
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="the-seeking-phase" id="the-seeking-phase" className="scroll-mt-8 border-slate-700 bg-slate-800/50 rounded-lg px-4 border-none">
        <AccordionTrigger className="text-2xl font-semibold hover:no-underline hover:text-blue-400">The Seeking Phase</AccordionTrigger>
        <AccordionContent className="text-base text-slate-300 space-y-4 pt-2">
          <p>To locate the Hider, Seekers ask questions and the Hider must answer truthfully.</p>
          <h3 className="text-xl font-medium mb-3 mt-6 text-slate-200">Question Categories</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(QUESTION_RULES).map(([key, rule]) => (
              <div key={key} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <h3 className="text-xl font-bold capitalize text-blue-400 mb-2">
                  {key === "radius" ? "Radar" : key}
                </h3>
                <p className="text-slate-300">{rule}</p>
              </div>
            ))}
          </div>
          <p className="mt-4">
            <strong>No Street View:</strong> Seekers must physically go to places to search for the Hider&apos;s photos.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="time-penalties" id="time-penalties" className="scroll-mt-8 border-slate-700 bg-slate-800/50 rounded-lg px-4 border-none">
        <AccordionTrigger className="text-2xl font-semibold hover:no-underline hover:text-blue-400">Time Penalties</AccordionTrigger>
        <AccordionContent className="text-base text-slate-300 space-y-4 pt-2">
          <p>
            To balance the flow of information, the game utilizes a <strong>Time Penalty</strong> system.
          </p>
          <p>
            Every time the Seekers ask a question to narrow down the Hider&apos;s location, a Time Penalty is incurred. This penalty compensates the Hider for revealing clues about their location.
          </p>
          <p>Each question type carries a specific time cost that is applied to the game clock.</p>
          <p>
            <strong>Strategic Seeking:</strong> Because asking questions carries a time cost, Seekers must work together to ask the most efficient and strategic questions possible.
          </p>
          <p className="italic mt-4 text-sm text-slate-400">
            <small>(Note: The webapp automatically calculates, tracks, and applies all Time Penalties as questions are locked).</small>
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="ending-the-round" id="ending-the-round" className="scroll-mt-8 border-slate-700 bg-slate-800/50 rounded-lg px-4 border-none">
        <AccordionTrigger className="text-2xl font-semibold hover:no-underline hover:text-blue-400">Ending the Round</AccordionTrigger>
        <AccordionContent className="text-base text-slate-300 space-y-4 pt-2">
          <h3 className="text-xl font-medium mt-6 mb-3 text-slate-200">The End Game & Your Hiding Spot</h3>
          <p>
            Once the seekers have entered the Hider&apos;s hiding zone the end game has begun. The Hider must stay put in a single spot until found, this is their final hiding spot. Hiding spots can be anywhere within their hiding zone, but they must be somewhere that is <strong>publicly accessible during all game hours</strong>.
          </p>
          <p>
            You cannot, for example, hide in a bathroom stall or someone&apos;s house. You should also make sure that staying in your spot for an extended period of time will not raise any suspicions or create the potential for you to get kicked out, for this reason avoid stores or other businesses, even if they are open during all game hours.
          </p>
          <p>
            Your hiding spot must also be within 3 meters of a marked path or road on Google Maps. Viable paths and roads should be easy to discern, but if there&apos;s any question as to whether one counts, the test is whether or not Google Maps will use them for walking directions.
          </p>
          <p className="mb-4">
            If you aren&apos;t where you want to be when the seekers enter your hiding zone, too bad! Wherever you&apos;re standing at that moment is your hiding spot. (If, for whatever reason, you aren&apos;t somewhere publicly accessible when the end game starts, you must immediately go to the nearest possible publicly accessible spot and stay there instead.)
          </p>

          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong>The Catch:</strong> Seekers must physically locate the Hider. Once a Seeker spots the Hider, the round immediately ends.
            </li>
            <li>
              <strong>Next Round:</strong> A new Hider is chosen and the next head start begins.
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tips-for-a-better-game" id="tips-for-a-better-game" className="scroll-mt-8 border-slate-700 bg-slate-800/50 rounded-lg px-4 border-none">
        <AccordionTrigger className="text-2xl font-semibold hover:no-underline hover:text-blue-400">Tips for a Better Game</AccordionTrigger>
        <AccordionContent className="text-base text-slate-300 space-y-4 pt-2">
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong>House Rules:</strong> The rules outlined here are simply recommendations to get you started. Every group&apos;s playstyle is different, so I highly encourage players to discuss and agree on their expectations before starting a game. And/or playing a practice round where you choose a Hiding Spot together and discuss the different answers one would give, especially photos.
            </li>
            <li>
            <li>
              <strong>No Street View?!</strong> Satellite View isn&apos;t Street View!
            </li>
            <li>
              <strong>Logging the Time:</strong> Click the clock icon to start/stop the timer. The timer will start at a negative value equal to the Head Start time set in the right sidebar. The time automatically calculates the total time the Hider survived, factoring in Time Penalties from the Seekers&apos; questions.
            </li>
            <li>
              <strong>Too many Hiding Zones?</strong> Before starting the game, in the right sidebar, view Hiding Zones then click the ones in the list that you don&apos;t want to use. Share this new game state with the other players.
              <small className="ml-1 text-slate-400">
                (I recommned doing this from a PC or other large screen device.)
              </small>
            </li>
            <li>
              <strong>Are you the Hider?</strong> Open the Options menu and enable Hider Mode. Place the green Map Marker on your hiding spot (or on your station if you haven&apos;t found your final hiding spot yet) and the webapp will tell you what answer to give the Seekers.
            </li>
            <li>
              <strong>Group Chat & Location Sharing:</strong> All players need to be in a group chat where they can share their live locations (e.g., WhatsApp, iMessage, Google Maps). All players <em>other than the Hider</em> must share their location with the group so the Hider can monitor their progress and know exactly when the Seekers enter their Hiding Zone.
            </li>
            <li>
              <strong>Preparation:</strong> Bring water, snacks, a battery pack for your phone, and wear comfortable walking shoes!
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
