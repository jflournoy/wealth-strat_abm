// src/model.ts

import { kdTree } from 'kd-tree-javascript'
import { normal, beta, rank, spearmancoeff } from 'jstat';

//for turning financialScore into wealth
const MU_L    = Math.log(1_000);  // sets the median bulk wealth (~$50 k)
const SIGMA_L = .5;               // log-normal spread of the bulk
const KAPPA   = 1;               // Pareto tail exponent (larger ⇒ thinner tail)

/** Simulation parameters and defaults */
export interface Params {
  populationSize: number

  // Education parameters
  /** Weight on genetic contribution versus environment for education */
  geneEnvWeight: number   // [0,1]

  // Environmental inheritance noise
  /** Standard deviation of Normal noise added to child.env */
  envNoiseStd: number

  // Financial parameters
  /** Weight on education versus parental wealth */
  financeWeight: number   // [0,1]
  /** Proportion of pure noise in financial outcome */
  financeNoise: number    // [0,1]

  // Homophily in mate choice
  homophily: {
    /** Strength of choosing similar meanAllele */
    gene: number          // ≥0
    /** Strength of choosing similar environment */
    env: number           // ≥0
  }
  kd?: { kNeighbors?: number}
}

export const defaultParams: Params = {
  populationSize:  6400,
  geneEnvWeight:   0.5,
  envNoiseStd:     0.1,
  financeWeight:   0.7,
  financeNoise:    0.1,
  homophily: {
    gene: 0.0,
    env:  0.0,
  },
}

/** One individual in the simulation */
export interface Agent {
  id: number
  alleles: [number, number]     // two real-valued genes
  meanAllele: number          // mean of alleles (for convenience)
  parentWealth: number
  env: number                   // scalar environment
  rawenv: number // without noise
  educationScore: number
  wealth: number //computed from financialScore
  parents: [Agent, Agent] | null
}

/**
 * Bootstrap the initial population.
 * - alleles ∼ N(0,1)
 * - env ∼ N(0,1)
 * - initial scores computed (parent wealth = 0)
 */
export function initializePopulation(params: Params): Agent[] {
  const pop: Agent[] = []
  
  for (let i = 0; i < params.populationSize; i++) {
    const alleles = [normal.sample(0, 1), normal.sample(0, 1)] as [number, number]
    const env = normal.sample(0, 1) // N(0,1) environment
    const a: Agent = {
      id: i,
      alleles,
      meanAllele: (alleles[0] + alleles[1]) / 2,
      parentWealth: 100_000, // no parents yet
      env: env,
      rawenv: env, // without noise
      educationScore: normal.sample(0, 1),
      parents: null,
      wealth: 0,
    }
    a.wealth = computeWealthFromScore(a, params)
    pop.push(a)
  }

  return pop
}

/** Education score = weighted sum of mean allele and environment */
export function computeEducationScore(a: Agent, params: Params): number {
  return params.geneEnvWeight * a.meanAllele
       + (1 - params.geneEnvWeight) * a.env
}

export function envFromWealth(agents: Agent[], params: Params): void {
  const inc = agents.map(a => a.parentWealth);

  // 1) Compute average ranks (ties are averaged)
  const rawRanks = rank(inc);

  const N     = inc.length;
  const denom = N + 1;
  const minP  = 1 / denom;

  // 2) Normalize and threshold
  agents.forEach((agent, i) => {
    const p = Math.max(rawRanks[i] / denom, minP);
    // 3) Inverse-CDF of standard normal
    agent.rawenv = normal.inv(p, 0, 1);
    agent.env = agent.rawenv + normal.sample(0, params.envNoiseStd); 
  });
}

// --- FUNCTION: map a single financialScore to an wealth ---
export function computeWealthFromScore(a: Agent, params: Params): number {
  function computePotentialWealth(score: number, noise: number): number {
    const noiseTerm = noise === 0 ? 0 : normal.sample(0, noise)
    const L = Math.exp(
      MU_L
      + SIGMA_L * score
      + noiseTerm
    );

    // 2. Pareto boost for the tail
    //    U ∼ Uniform(0, 1) ⇒ P ∼ Pareto(KAPPA)
    const U = normal.cdf(score, 0, 1);
    const tailProb = Math.min(Math.max(1 - U, Number.EPSILON), 1);
    const P = Math.pow(tailProb, -1.0 / KAPPA);

    return L * P;
  }

  const potentialWealth = computePotentialWealth(a.educationScore, params.financeNoise);
  // 4. apply finance weight and small chance of parent wealth catastrophe
  const wealth = params.financeWeight * potentialWealth
    + (1 - params.financeWeight) 
    * (computePotentialWealth(a.rawenv, 0) + a.parentWealth * beta.sample(.01, 1));

  return wealth;
}

/** Helper type for a mating pair */
interface Pair { a: Agent; b: Agent }

/**
 * Select disjoint mating pairs (no agent repeats) with homophily on genes/env.
 * - Shuffle pool
 * - For each agent A in turn, choose B from remaining by weighted similarity
 */
export function selectMatingPool(
  pop: Agent[],
  params: Params
): Pair[] {
  const N = pop.length

  if (pop.length < 2) {
    throw new Error(
      `selectMatingPool: need at least two agents, got ${pop.length}`
    )
  }

  const { homophily, kd } = params
  const K = kd?.kNeighbors ?? 10
  
  const MAX_ALPHA = 125
    // compute stretch factors
  const alphag = homophily.gene === 1
    ? MAX_ALPHA
    : homophily.gene / (1 - homophily.gene);
  const alphae = homophily.env  === 1
    ? MAX_ALPHA
    : homophily.env  / (1 - homophily.env);

  type KDNode = { meanAllele: number, env: number, idx: number }
  const nodes: KDNode[] = pop.map((a, i) => ({
    meanAllele: a.meanAllele,
    env:    a.env,
    idx:    i
  }))

  const dist = (u: KDNode, v: KDNode) =>
    alphag * Math.abs(u.meanAllele - v.meanAllele)
  + alphae * Math.abs(u.env        - v.env)

  const tree = new kdTree(nodes, dist, ['meanAllele','env'])

  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice()    // copy
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const nPairs     = Math.floor(N / 2)
  const initiators = shuffle(nodes).slice(0, nPairs)
  
  const pairs: Pair[] = []
  const avgHomophily = (homophily.gene + homophily.env) / 2
  for (const aNode of initiators){
    // initialize bNodeIdx
    let bNodeIdx = -1
    //compute random number between 0 and 1, if it is greater than avgHomophily, randomly select a bNode
    if (Math.random() > avgHomophily) {
      //randomly select an index for bNode
      bNodeIdx = Math.floor(Math.random() * N)
    } else {
      let neighsWithDist = tree
        .nearest(aNode, K + 1)
        .filter(([n]) => n.idx !== aNode.idx)

      if (neighsWithDist.length === 0) {
        throw new Error(
          `selectMatingPool: no available mates for agent index ${aNode.idx}`
        )
      }
      
      // 1) Pull out the raw distances
      const ds = neighsWithDist.map(([, rawD]) => rawD)

      // 2) Find the smallest one
      const dMin = Math.min(...ds)

      // 3) Compute “shifted” distances so the minimum is 0
      const shifted = ds.map(d => d - dMin)

      // 4) Clamp each shifted distance to a safe max (≈ 700)
      const MAX_EXPONENT = 700
      const clamped = shifted.map(sd => Math.min(sd, MAX_EXPONENT))

      // 5) Now compute weights in [0,1] without underflow
      const weights = clamped.map(sd => Math.exp(-sd))
      
      const totalW = weights.reduce((s,w) => s + w, 0)
      let r = Math.random() * totalW
      let i = 0
      while (r > weights[i]) {
        r -= weights[i++]
      }
      
      const bNode = neighsWithDist[i][0]
      bNodeIdx = bNode.idx
    }
    pairs.push({
      a: pop[aNode.idx],
      b: pop[bNodeIdx]
    })
  }
  return pairs
}

/**
 * Given a mating pair, produce two children:
 * - Each child picks one allele from each parent
 * - env = parentAvgFin + N(0, envNoiseStd)
 * - Scores computed immediately
 */
export function mate(
  pair: Pair,
  params: Params,
  nextIdStart: number
): Agent[] {
  const parentWealth = (pair.a.wealth + pair.b.wealth)
  const kids: Agent[] = []

  for (let k = 0; k < 2; k++) {
    const child: Agent = {
      id: nextIdStart + k,
      //draw new alleles with a small chance of mutation
      alleles: [
        Math.random() < .01 ? 
          normal.sample(0, 1) :
          pair.a.alleles[Math.floor(Math.random() * 2)],
        Math.random() < .01 ? 
          normal.sample(0, 1) :
          pair.b.alleles[Math.floor(Math.random() * 2)],
      ],
      parentWealth: parentWealth,
      educationScore: 0,
      parents: [
        {
          id: pair.a.id,
          alleles: pair.a.alleles,
          meanAllele: pair.a.meanAllele,
          parentWealth: pair.a.parentWealth,
          env: pair.a.env,
          rawenv: pair.a.rawenv,
          educationScore: pair.a.educationScore,
          wealth: pair.a.wealth,
          parents: null
        },
        {
          id: pair.b.id,
          alleles: pair.b.alleles,
          meanAllele: pair.b.meanAllele,
          parentWealth: pair.b.parentWealth,
          env: pair.b.env,
          rawenv: pair.b.rawenv,
          educationScore: pair.b.educationScore,
          wealth: pair.b.wealth,
          parents: null
        }
      ]
    }
    kids.push(child)
  }

  return kids
}

/**
 * Advance one generation:
 * 1. Select monogamous mating pairs
 * 2. Mate each pair to get two children
 * 3. Return new population of size ~N (drops one if N odd)
 */
export function nextGeneration(
  oldPop: Agent[],
  params: Params
): Agent[] {
  const pairs = selectMatingPool(oldPop, params)
  const newPop: Agent[] = []
  let nextId = 0
  pairs.forEach(pair => {
    const kids = mate(pair, params, nextId)
    kids.forEach(k => {
      newPop.push(k)
      nextId++
    })
  })
  envFromWealth(newPop, params);
  newPop.forEach(kid => {
    const [n0, n1] = kid.alleles;
    kid.meanAllele = (n0 + n1) / 2;
  })
  newPop.forEach(kid => {
    kid.educationScore = computeEducationScore(kid, params);
    kid.wealth = computeWealthFromScore(kid, params);
  })

  return newPop
}
