// helpContent.ts
// Defines structured help sections for the ABM interface, displayed via dropdown

export interface HelpSection {
  id: string;
  title: string;
  content: string;
}

export const helpSections: HelpSection[] = [
  {
    id: 'intro',
    title: 'Overview',
    content: `
    <p>This interactive model shows how traits and resources flow from one generation to the next through four stages:</p>
    <ol>
      <li><strong>Parent Genes → Genes</strong></li>
      <li><strong>Parent Wealth → Environmental Endowment</strong></li>
      <li><strong>Genes + Environment → Education Level</strong></li>
      <li><strong>Education + Parent Wealth → Child Wealth</strong></li>
    </ol>
    <p>Adjust the sliders to explore how inheritance, environment, education, and chance combine to shape inequality over time.</p>
    <p id="intro-text">Each "pixel" below is one agent. Each agent has it's own genetic
    potential, environmental endowment, education success, and level of
    wealth. To produce each new generation, the agents will be sampled and
    mated to other agents (with some degree of assortative mating), and then
    the offspring will inherit a mix of their parents' traits, and their
    environment will be determined by their parents' wealth. There is some
    random noise you can add into this process too. See the parameters to
    the left, and the help text below for more information.
    </p>
    `
  },
  // {
  //   id: 'technical',
  //   title: 'Technical Architecture',
  //   content: `
  //     <h3>Technical Architecture</h3>
  //     <p>The <code>index.html</code> file defines static UI elements (divisions, canvas, controls). When you load the page, the browser parses this HTML, then executes the compiled JavaScript (from <code>main.ts</code>).</p>
  //     <p>TypeScript is a typed superset of JavaScript: you write <code>*.ts</code> files, and the <code>vite</code> tool compiles them to <code>*.js</code> for the browser. This provides strong typing and a modern development experience with zero runtime penalty.</p>
  //     <p><code>main.ts</code> initializes UI controls, injects help sections, and calls functions from <code>model.ts</code> to run the agent-based simulation each generation, including custom mating logic.</p>
  //   `
  // },
  {
    id: 'model',
    title: 'Model Structure',
    content: `
      <ul>
        <li><strong>Initial population</strong>: most parameters are drawn directly from a Gaussian distribution. Agent properties then evolve with each generation from there.</li>
        <li><strong>Genes</strong>: each agent inherits one randomly chosen "education" gene from each parent, with occasional mutation.</li>
        <li><strong>Environment</strong>: determined by the sum of parents' wealth, with optional noise added in to account for chance.</li>
        <li><strong>Education</strong>: is a function of the agent's average gene value (they inherit 2 alleles), and the environment value, weighted by the gene-environment proportion slider.</li>
        <li><strong>Wealth</strong>: is a function of the agent's education success and parental wealth, weighted by the education-parental-wealth proportion slider.</li>
        <li><strong>Mating Logic</strong>: random or assortative by genes/environment controlled by homophily sliders.</li>
        <li><strong>Inter-generational wealth catastrophe</strong>: there is a small chance that some or all wealth will be lost between generations.</li>
      </ul>
    `
  },
  {
    id: 'plots',
    title: 'Plots',
    content: `
      <ul>
      <li><strong>Population Raster (center)</strong>: grid of agents colored by the selected attribute, always ordered by wealth.</li>
      <li><strong>Histogram</strong>: distribution of genes, environment, education, or wealth. Wealth is log transformed. </li>
      <li><strong>Lorenz Curve</strong>: cumulative share of agents vs. cumulative share of wealth. Perfect wealth equality is a diagonal line.</li>
      <li><strong>Gini Coefficient</strong>: summary statistic (0&ndash;1) of wealth inequality.</li>
      <li><strong>Time Series</strong>: tracks Gini across generations.</li>
      </ul>
    `
  },
  {
    id: 'philosophy',
    title: 'Philosophical Presets',
    content: `
      
    <ul>
      <li>
        <strong>Full Meritocracy</strong>
        <ul style="list-style:none; margin:0 0 0 1.5em; padding:0;">
          <li>Env 0% / 100% Gene → Education Success</li>
          <li>Parent wealth 0% / 100% Education → Agent's Wealth</li>
          <li style="font-style: italic;">We remove any influence of the environment, allowing individuals to realize their full potential through education. 
          And then we allow that education to be the full determinant of their ultimate wealth. 
          This is the meritocratic ideal: one rises or falls exactly in proportion to one's talents and abilities (including the ability to put in hard work).</li>
        </ul>
      </li>

      <li>
        <strong>Full Aristocracy</strong>
        <ul style="list-style:none; margin:0 0 0 1.5em; padding:0;">
          <li>Env --% / --% Gene → Education Success</li>
          <li>Parent wealth 100% / 0% Education → Agent's Wealth</li>
          <li style="font-style: italic;">Genetic or environmental contribution to education success is irrelevant. One's wealth and station is determined entirely by one's parents'</li>
        </ul>
      </li>

      <li>
        <strong>Full Equality...or is it?</strong>
        <ul style="list-style:none; margin:0 0 0 1.5em; padding:0;">
          <li>Env 100% / 0% Gene → Education Success</li>
          <li>Parent wealth 0% / 100% Education → Agent's Wealth</li>
          <li style="font-style: italic;">Education is determined entirely by the environment, and wealth is determined entirely by education. 
          Someone's egalitarian ideal: all individuals are given equal opportunity to succeed, regardless of their genetic or parental background. But when we start with unequal environments, can this work...?</li>
        </ul>
      </li>
      <li>
        <strong>Present-day Reality</strong>
        <ul style="list-style:none; margin:0 0 0 1.5em; padding:0;">
          <li>Env 50% / 50% Gene → Education Success</li>
          <li>Parent wealth 70% / 30% Education → Agent's Wealth</li>
          <li style="font-style: italic;">A somewhat realistic setting that reflects the current state of society, where both genetic and environmental factors contribute to education, and parental wealth plays a significant role in determining an agent's wealth.</li>
        </ul>
      </li>
      </ul>
    `
  },
  {
    id: 'extensions',
    title: 'Ideas for Extensions',
    content: `
      <ul>
        <li>Progressive Education Subsidies: reduce the effect of environment for the bottom decile, either for one-generation or permanently.</li>
        <li>Genetic Compensation Policy: technologies such as eye-glasses reduce or remove the effect of some genetic disadvantages&mdash;boost the genetic scores of the bottom decile.</li>
        <li>Redistribution Schemes: apply progressive/regressive taxes to final wealth and observe Gini changes.</li>
        <li>Universal Basic Endowment: give every newborn a fixed "starter wealth" or "starter education credit" before inheritance and education calculations.</li>
        <li>Environmental Shock: introduce a one-time large Gaussian noise spike in Env for a random subset of agents (e.g., disasters, pandemics).</li>
        <li>Negative Homophily: invert assortative mating logic so agents deliberately pair with those farthest from them in gene/env space.</li>
      </ul>

    `
  },
  {
    id: 'thepoint',
    title: 'What is the Point',
    content: `
    <p>
      We often think of improving society through the lens of 
      improving education outcomes, e.g., by reducing the impact of environmental 
      disadvantage, or by reducing the influence of parental wealth on one's chances of success. 
      Many folks in my little corner of developmental child psychology and neuroscience focusing on 
      childhood adversity and adolescent risk-taking often imagine giving at-risk kids a leg up through 
      some intervention (e.g., growth mindset, or some early childhood support). This simulation is a way 
      to help explore those ideas and see if they can lead to a more equal society. This is also inspired 
      by my recent reading of Michael Sandel's 
      <a href="https://us.macmillan.com/books/9780374289980/thetyrannyofmerit/">The Tyranny of Merit</a>, which 
      describes two problems with meritocracy: first, it merely reorders the obviously unjust hierarchy of 
      the aristocracy into a hierarchy based on "merit"; second, it leads individuals to assume that they deserve 
      their place in this hierarchy. This also uses ideas developed by K. Paige Harden in 
      <a href="https://press.princeton.edu/books/hardcover/9780691190808/the-genetic-lottery">The Genetic Lottery</a>
      about why we must take genetic heredity seriously when contemplating justice. I'm not sure if either of 
      these books tackle the more fundamental concept of "free will" directly, but neither leave very much room 
      for it, as is right and proper. The terrible and useful conclusion of these lines of thoughts, which I seek 
      to demonstrate (and test) in this simulation, is that if we care about wealth inequality <em>per se</em> (and we shouyld).
      we probably can't simply use the levers that are so often presented to us. Equality of opportunity won't do it. 
      Removing barriers to educational thriving, like environmental adversity, won't do it. Removing unequal advantages
      won't do it. Is there anything in this simulation that will do it? I don't think so. If you have some ideas, or 
      if you're able to get a significant shift downward in the Gini coefficient, <a href="mailto:jcflournoyphd@pm.me">email me</a>. 
     </p>
    `
  }
];
