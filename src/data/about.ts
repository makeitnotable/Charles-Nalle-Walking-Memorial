/**
 * About-page content, ported from the legacy site’s aboutData.js.
 * Image paths reference the legacy asset library (rewritten by the M1 pipeline).
 */
export interface AboutSection {
  header: string;
  kicker: string;
  paragraphs: string[];
  image?: string;
}

export const about = {
  project: {
    header: "About the Project",
    kicker: "Overview",
    paragraphs: [
      "The Charles Nalle Walking Memorial website and walking tour, kicked off in the fall of 2022, is the result of a collaborative project between Rensselaer Polytechnic Institute’s Design, Innovation, and Society Studio B students, the City of Troy, and the Hart Cluett Museum.",
      "After discovering Charles Nalle’s story and the existing commemorative plaque, the team developed this contemporary memorial to help residents and visitors explore the complete narrative of the events that occurred on April 27, 1860.",
      "This project was made possible through partnerships with: RPI’s Science and Technology Studies department, Troy’s Hart Cluett Museum, the Business Improvement District (BID), Notable Branding & Design, Professors Brian Tolle and Brian Clyne; Samantha Mahoski of the Hart Cluett Museum; students Madeleine McNairn, Fiona Clarke, Susan Nguyen, Sara Bayne, Jame Lang, and Jalen Edmonds; artists Mark and Licia Priest; and researchers Scott Christianson and Tamar Gordon.",
    ],
  } satisfies AboutSection,

  howItWorks: {
    header: "How the Tour Works",
    kicker: "On the sidewalk",
    steps: [
      { title: "Start at the Memorial Plaque" },
      {
        title: "Follow the map to visit five historic locations from 1860:",
        bullets: [
          "Holeur’s Fashionable Bakery",
          "The Mutual Bank Building",
          "Uri Gilbert’s Mansion",
          "Washington St. Ferry Landing",
          "Peter Baltimore’s Barbershop",
        ],
      },
      {
        title: "At each stop, scan the QR code on the plaque to learn:",
        bullets: [
          "The location’s historical significance",
          "Key events that happened there",
          "How it connects to Charles Nalle’s story and the present day",
        ],
      },
      { title: "Use the map to begin the tour." },
    ],
  },

  charles: {
    header: "Charles Nalle",
    kicker: "Freedom Seeker",
    image: "about-page/charles.png",
    paragraphs: [
      "In 1821, Charles Nalle was born into slavery in Stevensburg, Virginia. Charles’s father was Peter Hansbrough, a wealthy plantation owner, and his mother was Lucy, a slave and property to Hansbrough. Charles had a brother, Blucher, son of Peter and Frances (Peter’s wife); they were raised together and resembled each other. In Charles’s early 20’s, he was married to Catherine \"Kitty\" Simms, who lived on the Berry Hill Plantation in Halifax County, Virginia. In time, she bore five children. In 1855, Kitty and her children were freed upon the death of her owner. Virginia, at the time, required freed slaves to leave the state. This led Kitty, her children, and her sister to move to Washington, DC where freed slaves could live.",
      "Charles eventually escaped with a fellow slave, Jim Banks, and made his way to Troy, NY. With a strong background in coachmanship, Charles became the carriage driver for Uri Gilbert, one of Troy’s wealthiest individuals who made his fortune building carriages. In April of 1860, Charles Nalle was arrested under the Fugitive Slave Act before entering George Holeur’s Fashionable Bakery while running an errand for the Gilberts.",
      "On the day of his capture, Charles was taken and held in Troy to be returned to Virginia, and that’s when the community of Troy worked together to raise $1,000 to purchase Charles’s freedom. Charles Nalle, now a free man, returned to Troy on his way to Washington, DC in 1867 to be reunited with his wife and children.",
    ],
  } satisfies AboutSection,

  closingQuote: {
    text: "In Troy, many residents continued to regard his (Charles Nalle) liberation and their participation in it as the greatest thing that had ever happened in that city. Yet freeing Charles had not proved easy or quick; it was not simple for anyone, especially for Nalle himself. Even after such a difficult and protracted ordeal, the struggle for freedom and equality would continue for some time to come.",
    attribution: "Scott Christianson",
    source: "Freeing Charles: The Struggle to Free a Slave on the Eve of the Civil War, p. 151",
  },

  mark: {
    header: "Mark Priest",
    kicker: "Painter & Professor",
    image: "about-page/mark.png",
    paragraphs: [
      "Throughout the site, featured content from fine artist Mark Priest is used to depict various events that led up to Charles’s capture and eventual rescue by the people of Troy. The paintings are a part of a series \"A Fugitive Slave Rescued: Paintings of Charles Nalle\" completed between the years of 2008 and 2015. A selection of the paintings were showcased in Troy during the 150th anniversary of the historic rescue in partnership with Scott Christianson in Troy in 2010. The series was a part of Priest’s larger project depicting the history of the Underground Railroad for which he worked alongside his wife, Licia Priest.",
    ],
  } satisfies AboutSection,

  scott: {
    header: "Scott Christianson",
    kicker: "Author",
    image: "about-page/scott.png",
    paragraphs: [
      "Scott Christianson was an American author who wrote \"Freeing Charles: The Struggle to Free a Slave on the Eve of the Civil War\". Christianson was known for his studies of the history of the Underground Railroad and worked closely with the Troy community and Nalle’s descendants to communicate Charles’s story in the book. Throughout the site you will find snippets from the book that tell the story of Charles’s rescue.",
    ],
  } satisfies AboutSection,
};
