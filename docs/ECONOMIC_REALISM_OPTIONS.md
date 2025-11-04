# Economic Realism: Decision Point

**Date**: 2025-11-03
**Status**: Decision Pending

## The Question

Is the current ABM economically realistic enough to support the philosophical conclusions about inequality and opportunity?

## Current Model Analysis

### What The Model Does

**Wealth Generation** ([src/model.ts:120-145](../src/model.ts)):
```typescript
potentialWealth = exp(μ_L + σ_L × educationScore + noise) × Pareto(κ)
wealth = financeWeight × potentialWealth + (1-financeWeight) × (envWealth + parentWealth × catastrophe)
```

**Key Properties:**
- Samples wealth from log-normal × Pareto distributions
- Each generation creates NEW wealth (not produced from inputs)
- Total wealth is NOT conserved (fluctuates randomly)
- Parents don't lose wealth when children gain it
- Pure sampling model, not production-based

### What's Realistic

✅ **Pareto tail for wealth** - Empirically correct for top 1%
✅ **Log-normal bulk distribution** - Matches real income distributions
✅ **Education → income correlation** - Well-documented relationship
✅ **Intergenerational persistence** - Captures wealth transmission

### What's Unrealistic

❌ **No production function** - Wealth isn't produced from labor + capital
❌ **No capital returns** - Wealth doesn't grow automatically (no r × wealth term)
❌ **No economic growth** - Static economy, GDP doesn't increase
❌ **No capital accumulation** - Can't model compound wealth growth
❌ **No labor markets** - Wages sampled, not determined by market forces
❌ **No savings/investment** - Wealth is endowment, not accumulated

## Impact on Research Question

**Your Question:** "Can we reduce inequality through education, redistribution, environmental support, etc.?"

### Current Model OVERSTATES:
- How much education matters for reducing inequality
- How effective opportunity-based interventions can be
- The role of individual merit vs. structural factors

### Current Model UNDERSTATES:
- How concentrated wealth becomes (no compound returns)
- How inevitable inequality is (missing r > g mechanism)
- How hard redistribution is (no growth trade-offs)

**Implication:** Your conclusions about "opportunity isn't enough" are actually **TOO WEAK** - the real problem is worse than your model shows.

## Three Options Forward

### Option A: Keep As-Is (Philosophical Tool)

**Description:** Acknowledge model as philosophical argument tool, not econometric model

**Pros:**
- Model stays simpler and more accessible
- Core insight remains valid: opportunity ≠ equality
- Focus on social mechanisms (assortative mating, environment, genes)
- Already demonstrates that "fixing opportunity" doesn't prevent stratification

**Cons:**
- Vulnerable to economist criticism ("unrealistic wealth model")
- Overstates how much education interventions could help
- Misses key Piketty insight (r > g creates inevitable concentration)
- Less publishable in economics journals

**Implementation:**
1. Add "Limitations" section to README
2. Explicitly state: "Omits capital returns and economic growth"
3. Frame as "lower bound" - real inequality is likely worse
4. Emphasize social/philosophical insights over economic predictions

**Effort:** 1 session (documentation only)

---

### Option B: Add Capital Returns (RECOMMENDED)

**Description:** Add compound wealth growth - rich get richer automatically

**The Change:**
```typescript
// In nextGeneration(), after computing new wealth:
const CAPITAL_RETURN_RATE = 0.05 // 5% real annual returns

agent.wealth = agent.previousWealth * (1 + CAPITAL_RETURN_RATE) + laborIncome
```

**Why This Matters:**
- Captures Piketty's r > g insight: capital returns exceed growth
- Rich automatically accumulate wealth through ownership
- Makes inequality HARDER to solve, not easier
- One parameter, easy to explain to users

**Pros:**
- Minimal complexity (one line of code, one parameter)
- Makes your argument STRONGER - interventions become less effective
- Intellectually honest - captures key real-world mechanism
- Still accessible to non-economists
- Shows inequality compounds over generations

**Cons:**
- Slightly more complex model
- Need to tune return rate (~5% typical)
- Must explain compound growth to users

**Implementation:**
1. Add `previousWealth` field to Agent interface
2. Add `capitalReturnRate` to Params (default 0.05)
3. Modify `nextGeneration()` to apply returns before new income
4. Add UI slider for capital return rate
5. Update help text to explain compound wealth growth
6. Rerun tests and observe Gini coefficient increases

**Effort:** 2-3 sessions

**Expected Impact:**
- Gini coefficient will be 10-20% higher
- Inequality will increase more rapidly over generations
- Interventions (education, redistribution) will be less effective
- Your philosophical point becomes STRONGER

---

### Option C: Full Economic Model (Solow-Swan Growth)

**Description:** Implement production function, capital accumulation, labor markets

**The Model:**
```typescript
// Aggregate production
GDP = A × K^α × L^(1-α)

// Individual wealth from capital ownership + labor
agent.wealth = agent.capitalShare × GDP + wages(agent.education)

// Capital accumulation
K_t+1 = (1 - δ)K_t + Investment
```

**Pros:**
- Academically rigorous economic model
- Can model economic growth, productivity increases
- Can study growth vs. inequality trade-offs
- Publishable in economics journals
- Can model policy effects on growth

**Cons:**
- Major rewrite (10+ sessions of work)
- Much more complex - harder for non-economists to understand
- Might obscure main philosophical point
- Need to tune many parameters (α, δ, A, etc.)
- More assumptions = more potential criticism

**Implementation:**
1. Add aggregate capital stock and labor supply
2. Implement Cobb-Douglas production function
3. Distribute GDP as wages + capital returns
4. Add investment/depreciation dynamics
5. Rebalance all parameters
6. Extensive testing and validation

**Effort:** 10-15 sessions

**When to Choose This:**
- Planning to publish in economics journals
- Want to study growth/inequality trade-offs
- Need to model policy effects on GDP growth
- Have time for major rewrite

---

## Recommendation: Option B (Capital Returns)

### Why Option B is Best

1. **Strengthens Your Argument**
   - Makes inequality worse, not better
   - Shows opportunity-based fixes are EVEN LESS effective
   - Captures core mechanism (rich get richer automatically)

2. **Minimal Complexity**
   - One parameter to add (return rate r)
   - One line of code change
   - Still accessible to non-economists

3. **Intellectually Honest**
   - Addresses the "no capital returns" criticism
   - Captures Piketty's key insight
   - Makes model more realistic without overwhelming complexity

4. **Quick to Implement**
   - 2-3 sessions max
   - Can proceed with policy interventions after

### The Math

**Without capital returns (current):**
```
wealth_t = sample(education, parentWealth, luck)
```

**With capital returns (proposed):**
```
wealth_t = wealth_t-1 × (1.05) + sample(education, luck)
```

**Effect over 10 generations:**
- Someone with $100k grows to $163k (passive growth)
- Someone with $10k grows to $16k (passive growth)
- Gap widens from $90k to $147k (63% increase)
- Plus they continue to earn different amounts from education

This compounds your inequality problem - exactly what you want to show.

## Next Steps

### If You Choose Option A (Document Limitations):
1. Add "Model Limitations" section to README
2. Update help text with economic caveats
3. Proceed with policy interventions

### If You Choose Option B (Add Capital Returns):
1. Create GitHub issue for capital returns feature
2. Implement in 2-3 sessions using TDD
3. Test impact on Gini coefficient
4. Update help text and README
5. Then proceed with policy interventions

### If You Choose Option C (Full Economic Model):
1. Deep dive into Solow-Swan model literature
2. Create detailed implementation plan
3. Budget 10-15 sessions
4. Delay policy interventions until after rewrite

## Open Questions for You

1. **Publication goals?**
   - If publishing in econ journals → Option C
   - If philosophy/sociology journals → Option A or B
   - If just web demo → Option A

2. **Time available?**
   - Limited time → Option A
   - Few sessions → Option B
   - Extended project → Option C

3. **Main audience?**
   - General public → Option A or B
   - Economists → Option C
   - Philosophers → Option A or B

4. **Core argument?**
   - "Opportunity isn't enough" → All options work, B is strongest
   - "Need radical redistribution" → Option B or C shows this better
   - "Social mechanisms matter" → Option A sufficient

## References

- **Piketty (2014)**: Capital in the Twenty-First Century - r > g mechanism
- **Solow (1956)**: Growth model with capital accumulation
- **Chetty et al. (2014)**: Intergenerational mobility in the US
- **Saez & Zucman (2016)**: Wealth inequality data

---

**Decision needed:** Which option should we pursue?

**Current recommendation:** Option B (capital returns) - strengthens your argument with minimal complexity.
