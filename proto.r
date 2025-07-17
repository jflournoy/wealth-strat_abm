library(data.table)
incFromScore <- function(edu, sd = .1){
  MU_L    = log(100e3)
  SIGMA_L = 3.25
  KAPPA   = 2

  L = exp(MU_L + SIGMA_L*edu +rnorm(1, mean = 0, sd = sd))
  U = pnorm(edu)
  tailProb = min(max( 1- U, 1e-6), 1)
  P = tailProb^(-1/KAPPA)
  potentialIncome = L*P
  return(potentialIncome)
}
prop_contrib <- function(a, b, p){
  a*p + b*(1-p)
}

gene_env <- .5
N <- 1e3
population <- data.table(
  gene1 = rnorm(N),
  gene2 = rnorm(N),
  env = rnorm(N)
)
population[, meanGene := rowMeans(.SD), .SDcols = c('gene1', 'gene2')]
population[, edu := scale(prop_contrib(meanGene, env, gene_env))]
population[, income := incFromScore(edu)]

get_pairs <- function(dt){
  dt[, init := sample(c(rep(FALSE, .N/2), rep(TRUE, .N/2)), size = .N, replace = FALSE)]
  inits <- dt[init == TRUE]
  mates <- dt[sample(1:.N, size = .N/2, replace = TRUE)]
  return(list(inits = inits, mates = mates))
}

envFromInc <- function(inc){
  qnorm(pmax(rank(inc) / (length(inc) + 1), 1 / (length(inc)+1)))
}

combine_parents <- function(a, b){
  kid <- data.table(
    gene1 = unlist(sample(a[,c('gene1', 'gene2')], size = 2, replace = TRUE)),
    gene2 = unlist(sample(b[,c('gene1', 'gene2')], size = 2, replace = TRUE)),
    parentIncome = rep(a$income + b$income, 2)
  )
  return(kid)
}

make_kids <- function(pairs){
  rbindlist(
    lapply(1:dim(pairs$inits)[[1]],
           \(i) combine_parents(a = pairs$inits[i], b = pairs$mates[i]))
  )
}

nextGen <- function(p){
  pairs <- get_pairs(p)
  newpop <- make_kids(pairs)
  newpop[, env := envFromInc(parentIncome)]
  newpop[, meanGene := rowMeans(.SD), .SDcols = c('gene1', 'gene2')]
  newpop[, edu := scale(prop_contrib(meanGene, env, gene_env))]
  newpop[, income := incFromScore(edu)]
  return(newpop)
}

for(i in 1:100){
  population <- nextGen(population)
}

a <- .1
b <- 1
f <- \(x) dbeta(x, a, b) * 1e4
pbeta(.9,a,b)
hist(1-rbeta(1e5, a, b))
curve(f, from = 0, to = 1, add = TRUE)

