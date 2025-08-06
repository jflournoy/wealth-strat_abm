// helpContent.ts
// Defines structured help sections for the ABM interface, displayed via dropdown

export interface HelpSection {
  id: string;
  title: string;
  content: string;
}

export const helpSections: HelpSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    content: `
      <h2>Agent-Based Inheritance & Socioeconomic Simulator</h2>
      <p>This interactive model shows how traits and resources flow from one generation to the next through four stages:</p>
      <ol>
        <li><strong>Parent Genes → Genes</strong></li>
        <li><strong>Parent Wealth → Environmental Endowment</strong></li>
        <li><strong>Genes + Environment → Education Level</strong></li>
        <li><strong>Education + Parent Wealth → Child Wealth</strong></li>
      </ol>
      <p>Adjust the sliders to explore how inheritance, environment, education, and chance combine to shape inequality over time.</p>
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
      <h3>How the Model Runs</h3>
      <ul>
        <li>Genes: each agent inherits one randomly chosen "education" gene from each parent, with occasional mutation.</li>
        <li>Environment: set by parents' wealth each generation, with optional noise added in to account for chance.</li>
        <li>Education: education success is a function of the average gene value, and the average environment value, weighted by the proportion contribution slider.</li>
        <li>Wealth: weighted mix of education vs. parental wealth (Education → Wealth slider).</li>
        <li>Mating Logic: random or assortative by genes/environment controlled by homophily sliders.</li>
      </ul>
    `
  },
  {
    id: 'plots',
    title: 'Plots',
    content: `
      <h3>Plots</h3>
      <ul>
        <li><strong>Population Raster</strong>: grid of agents colored by the selected attribute.</li>
        <li><strong>Lorenz Curve</strong>: cumulative share of agents vs. cumulative share of wealth.</li>
        <li><strong>Gini Coefficient</strong>: summary statistic (0–1) of wealth inequality.</li>
        <li><strong>Histogram</strong>: distribution of genes, environment, education, or wealth.</li>
        <li><strong>Time Series</strong>: tracks summary stats across generations.</li>
      </ul>
    `
  },
  {
    id: 'controls',
    title: 'Controls',
    content: `
      <h3>Controls</h3>
      <ul>
        <li><strong>Start</strong>: begin continuous simulation.</li>
        <li><strong>Pause</strong>: pause the simulation.</li>
        <li><strong>Reset</strong>: return to Generation 0.</li>
        <li><strong>Step</strong>: advance one generation.</li>
      </ul>
      <dl>
        <dt>Color by</dt>
        <dd>Choose Genes, Environmental Endowment, Education Level, or Wealth.</dd>
        <dt>Env Quality Noise σ</dt>
        <dd>Gaussian noise in environment (e.g., random exposures).</dd>
        <dt>Gene → Education Weight</dt>
        <dd>Mix of innate talent vs. environment in education:</dd>
        <dd>
          <ul>
            <li>1 = pure meritocratic utopia (talent only)</li>
            <li>0 = environmental determinism (parental influence only)</li>
          </ul>
        </dd>
        <dt>Education → Wealth Weight</dt>
        <dd>Mix of education vs. inheritance in wealth:</dd>
        <dd>
          <ul>
            <li>1 = meritocracy (education only)</li>
            <li>0 = aristocracy (inheritance only)</li>
          </ul>
        </dd>
        <dt>Finance Success Noise σ</dt>
        <dd>Random luck/accident in wealth attainment.</dd>
        <dt>Gene Homophily</dt>
        <dd>Assortative mating by genes (0 = random; 1 = nearest neighbors).</dd>
        <dt>Environment Homophily</dt>
        <dd>Assortative mating by environment (0 = random; 1 = nearest neighbors).</dd>
      </dl>
    `
  },
  {
    id: 'context',
    title: 'Political & Philosophical Context',
    content: `
      <h3>Political & Philosophical Context</h3>
      <p><strong>Gene vs. Environment slider extremes:</strong></p>
      <ul>
        <li><em>1 (genes only):</em> Utopian meritocracy where success depends solely on talent.</li>
        <li><em>0 (environment only):</em> Environmental determinism akin to nepotism or inherited privilege.</li>
      </ul>
      <p><strong>Education vs. Wealth slider extremes:</strong></p>
      <ul>
        <li><em>1 (education only):</em> Pure meritocracy (education drives wealth).</li>
        <li><em>0 (inheritance only):</em> Aristocracy (wealth inherited unchanged).</li>
      </ul>
      <p><strong>Combined extremes:</strong></p>
      <ul>
        <li>Full meritocracy: Gene→Education=1 & Education→Wealth=1.</li>
        <li>Full aristocracy: Gene→Education=0 & Education→Wealth=0.</li>
      </ul>
      <p><strong>Homophily sliders:</strong></p>
      <ul>
        <li>0 = random mating (no assortative pairing).</li>
        <li>1 = strict nearest‐neighbor mating (social segregation).</li>
      </ul>
      <p>Use these settings to explore thought experiments on equality of opportunity, inherited privilege, and social stratification.</p>
    `
  },
  {
    id: 'extensions',
    title: 'Extensions & Ideas',
    content: `
      <h3>Extensions & Experimental Interventions</h3>
      <ul>
        <li><strong>Targeted Supports:</strong> e.g. zero out Env Quality Noise for the bottom 20% to model educational aid for disadvantaged groups.</li>
        <li><strong>Genetic Interventions:</strong> e.g. override gene influences for low-scoring agents to simulate special education or medical treatments.</li>
        <li><strong>Redistribution Schemes:</strong> apply progressive/regressive taxes to final wealth and observe Gini changes.</li>
        <li><strong>Limitations:</strong> focuses on wealth, not broader quality of life or equality of condition (Sandel’s critique).</li>
      </ul>
    `
  },
  {
    id: 'extras',
    title: 'Extras & Tooltips',
    content: `
      <h3>Extras & Tooltips</h3>
      <ul>
        <li><strong>Hover</strong> over plots for precise values.</li>
        <li><strong>Legends</strong> map colors to numeric ranges.</li>
        <li><code>i</code> icon opens inheritance & inequality primer.</li>
        <li>Auto-update toggle re-runs the simulation live when sliders move.</li>
      </ul>
    `
  }
];
