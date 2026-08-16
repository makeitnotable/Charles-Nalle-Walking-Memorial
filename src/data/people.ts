/**
 * The cast of April 27, 1860 — from the project’s character sheet
 * (Context/Website Edits.pdf p.2, with Kathy Sheehan’s corrections applied:
 * "Horatio" F. Averill, "Captain" Hawk) and the site-history research docs.
 */

export interface Person {
  name: string;
  role: string;
  note: string;
  /** Chapter slugs where this person’s part of the story is told */
  chapters: string[];
}

export const rescuers: Person[] = [
  {
    name: "Charles Nalle",
    role: "The man at the center",
    note: "A coachman for the Gilbert family who had escaped slavery in Culpeper County, Virginia. Seized under the Fugitive Slave Act while fetching bread, and freed the same day by the people of Troy.",
    chapters: ["bakery", "commissioners-office", "mansion", "ferry", "barbershop"],
  },
  {
    name: "Harriet Tubman",
    /* Kathy's written confirmation (8/7 annotated copy doc): the citizens led,
       she rallied — "Use your suggestion." */
    role: "The voice in the crowd",
    note: "In Troy visiting her cousin when the church bells rang. From within the crowd she rallied the rescuers: “Drag us out! Drag him to the river! Drown him! But don’t let them have him!”",
    chapters: ["commissioners-office", "ferry"],
  },
  {
    name: "Peter Baltimore",
    role: "Barber · Underground Railroad",
    /* Final review 2026-08-07: "next to the Troy House… They were two separate
       houses" — Kathy. (The shop stood in the Athenaeum building, beside the
       Troy House hotel.) */
    note: "A free man of color whose high-class barbershop next to the Troy House doubled as the hub of Troy’s Underground Railroad. Gave $200 of the $1,000 raised to buy Charles’s freedom.",
    chapters: ["barbershop", "commissioners-office"],
  },
  {
    name: "Martin I. Townsend",
    role: "Chief civil-rights attorney",
    note: "Rushed to the commissioner’s office to fight the paperwork, and led the plan to buy Charles’s freedom: “If we can get him out into the crowd, we can raise the money in five minutes.”",
    chapters: ["commissioners-office"],
  },
  {
    name: "Uri Gilbert",
    role: "Industrialist · Charles’s employer",
    note: "Railcar magnate and later mayor of Troy. Hired Charles as coachman on his skills, not his past. Charles lived above the stables behind the Gilbert mansion on Second Street.",
    chapters: ["mansion"],
  },
  {
    name: "William Henry",
    role: "Grocer · first alarm",
    note: "A Black grocery-store owner who saw the empty carriage outside the bakery, realized Charles was taken, and set the rescue in motion.",
    chapters: ["commissioners-office"],
  },
  {
    name: "Captain Hawk",
    role: "Vigilance Committee",
    note: "Abolitionist who spread word of the capture through the streets until a crowd of a thousand pressed against the Mutual Bank Building.",
    chapters: ["commissioners-office"],
  },
  {
    name: "Billy Loreman",
    role: "The waterman",
    note: "Rowed a still-shackled Charles across the Hudson to West Troy as pursuers threatened to open fire from the bank.",
    chapters: ["ferry"],
  },
  {
    name: "George Holeur",
    role: "The baker",
    note: "The thirty-four-year-old French baker whose shop at 3rd and Division was the site of Charles’s capture, in front of the whole city.",
    chapters: ["bakery"],
  },
];

export const hunters: Person[] = [
  {
    name: "Blucher Hansbrough",
    role: "The claimant",
    note: "Charles’s half-brother, and the man who claimed to own him. Hired slave catchers under the Fugitive Slave Act, then raised his price out of spite as Troy raised the money.",
    chapters: ["bakery", "commissioners-office"],
  },
  {
    name: "Horatio F. Averill",
    role: "The betrayer",
    note: "The lawyer who learned Charles’s secret while helping him write letters to his wife, Kitty, and sold it to Virginia for the reward.",
    chapters: ["commissioners-office"],
  },
  {
    name: "Henry “Jack” Wale",
    role: "Slave hunter",
    note: "A dangerous and infamous slave catcher from Stevensburg, Virginia, hired to drag Charles back south.",
    chapters: ["bakery"],
  },
  {
    name: "Deputy U.S. Marshal Holmes",
    role: "The badge",
    note: "Made the arrest lawful: “Charles Nalle, I hereby arrest you in the name of the United States of America.” The law was on his side. Troy was not.",
    chapters: ["bakery", "ferry"],
  },
  {
    name: "Thomas Parr",
    role: "The accomplice",
    note: "Wale’s slave-hunting partner from Culpeper County, waiting with the paperwork at the commissioner’s office.",
    chapters: ["commissioners-office"],
  },
];
